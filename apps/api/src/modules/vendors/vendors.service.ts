import { Injectable } from "@nestjs/common";
import { prisma } from "@buzzystores/database";
import { ApprovalStatus, LifecycleTrigger, ListingType, UserRole, VendorLifecycleStage } from "@buzzystores/types";
import { deterministicShortCode, slugify } from "@buzzystores/utils";
import { AiService } from "../ai/ai.service";
import { VendorLifecycleService } from "../vendor-lifecycle/vendor-lifecycle.service";
import type { CreateVendorDto } from "./dto/create-vendor.dto";
import type { RegisterVendorDto } from "./dto/register-vendor.dto";

@Injectable()
export class VendorsService {
  constructor(
    private readonly aiService: AiService,
    private readonly lifecycleService: VendorLifecycleService,
  ) {}

  async listPublicVendors() {
    return prisma.vendor.findMany({
      where: {
        lifecycleStage: VendorLifecycleStage.PUBLISHED,
        storefront: {
          publishedAt: {
            not: null
          }
        }
      },
      include: { storefront: true },
      orderBy: { updatedAt: "desc" },
      take: 20
    });
  }

  async getVendorBySlug(slug: string) {
    const vendor = await prisma.vendor.findUnique({
      where: { slug },
      include: {
        storefront: true,
        listings: {
          where: {
            approvalStatus: ApprovalStatus.PUBLISHED,
            publishedAt: {
              not: null
            }
          }
        },
        qrCodes: true
      }
    });

    if (!vendor) {
      return null;
    }

    if (vendor.lifecycleStage !== VendorLifecycleStage.PUBLISHED || !vendor.storefront?.publishedAt) {
      return {
        id: vendor.id,
        slug: vendor.slug,
        name: vendor.name,
        lifecycleStage: vendor.lifecycleStage,
        published: false,
        message: "This storefront is not yet published."
      };
    }

    return {
      ...vendor,
      published: true
    };
  }

  async createVendorLead(dto: CreateVendorDto) {
    return {
      id: "pending-db-write",
      slug: slugify(dto.name),
      lifecycleStage: VendorLifecycleStage.LEAD_IDENTIFIED,
      nextAction: "Collect missing vendor information and run vendor intake agent.",
      ...dto
    };
  }

  async getVendorLifecycle(id: string) {
    return this.lifecycleService.getVendorLifecycleTimeline(id);
  }

  async registerVendor(dto: RegisterVendorDto) {
    const lifecycleStage = hasEnoughRegistrationInfo(dto)
      ? VendorLifecycleStage.INFO_COLLECTED
      : VendorLifecycleStage.INTERESTED;
    const owner = await prisma.user.upsert({
      where: { phone: dto.phone },
      update: {
        fullName: dto.ownerName,
        ...(dto.email ? { email: dto.email } : {})
      },
      create: {
        fullName: dto.ownerName,
        phone: dto.phone,
        role: UserRole.VENDOR_OWNER,
        marketingOptIn: false,
        ...(dto.email ? { email: dto.email } : {})
      }
    });
    const slug = await this.createUniqueVendorSlug(dto.businessName, dto.phone);
    const socialUrl = dto.instagramUrl ?? dto.facebookUrl ?? dto.websiteUrl;

    const vendor = await prisma.vendor.create({
      data: {
        name: dto.businessName,
        slug,
        phone: dto.phone,
        preferredLanguage: dto.preferredLanguage ?? "en",
        source: "self_registration",
        lifecycleStage,
        nextAction:
          lifecycleStage === VendorLifecycleStage.INFO_COLLECTED
            ? "Review AI vendor and catalogue drafts."
            : "Collect missing vendor information before review.",
        activationScore: lifecycleStage === VendorLifecycleStage.INFO_COLLECTED ? 35 : 15,
        ownerId: owner.id,
        approvalStatus: ApprovalStatus.DRAFT,
        lastContactAt: new Date(),
        ...(dto.description ? { description: dto.description } : {}),
        ...(dto.categoryHint ? { categoryLabel: dto.categoryHint } : {}),
        ...(dto.email ? { email: dto.email } : {}),
        ...(dto.address ? { address: dto.address } : {}),
        ...(dto.city ? { city: dto.city } : {}),
        ...(dto.country ? { country: dto.country } : {}),
        ...(dto.websiteUrl ? { websiteUrl: dto.websiteUrl } : {}),
        ...(dto.instagramUrl ? { instagramUrl: dto.instagramUrl } : {}),
        ...(dto.facebookUrl ? { facebookUrl: dto.facebookUrl } : {}),
        ...(socialUrl ? { socialUrl } : {})
      }
    });

    const storefront = await prisma.storefront.create({
      data: {
        vendorId: vendor.id,
        slug,
        shortCode: deterministicShortCode(vendor.id, "v"),
        headline: `Draft storefront for ${dto.businessName}`,
        shortDescription: dto.description ?? `${dto.businessName} is preparing a BuzzyStores storefront.`,
        ...(dto.description ? { longDescription: dto.description } : {}),
        ...(dto.openingHoursText ? { openingHours: { raw: dto.openingHoursText } } : {})
      }
    });

    await this.lifecycleService.createLifecycleEvent(
      vendor.id,
      null,
      lifecycleStage,
      "Vendor registration submitted.",
      {
        actorId: owner.id,
        trigger: LifecycleTrigger.USER,
        metadata: {
          source: "vendor_registration",
          hasProductText: Boolean(dto.productText),
          completeness: lifecycleStage
        },
        ...(vendor.nextAction ? { nextAction: vendor.nextAction } : {})
      },
    );

    const intakeDraft = await this.aiService.runDraftJob({
      vendorId: vendor.id,
      requestedById: owner.id,
      agentType: "vendor-intake",
      outputType: "VENDOR_PROFILE",
      sourceInput: { ...dto },
      promptVersion: "vendor-intake.v1",
      approvalStatus: ApprovalStatus.DRAFT
    });

    const aiJobs = [
      {
        id: intakeDraft.job.id,
        type: intakeDraft.job.agentType,
        status: intakeDraft.job.status
      }
    ];

    if (dto.productText) {
      const catalogueDraft = await this.aiService.runDraftJob({
        vendorId: vendor.id,
        requestedById: owner.id,
        agentType: "catalogue-builder",
        outputType: "LISTING_DRAFT",
        sourceInput: {
          productText: dto.productText,
          categoryHint: dto.categoryHint,
          preferredLanguage: dto.preferredLanguage ?? "en"
        },
        promptVersion: "catalogue-builder.v1",
        approvalStatus: ApprovalStatus.AI_GENERATED
      });

      await this.createDraftListingsFromCatalogue(vendor.id, catalogueDraft.output.output);

      aiJobs.push({
        id: catalogueDraft.job.id,
        type: catalogueDraft.job.agentType,
        status: catalogueDraft.job.status
      });
    }

    return {
      vendorId: vendor.id,
      storefrontId: storefront.id,
      lifecycleStage,
      aiJobs
    };
  }

  private async createUniqueVendorSlug(businessName: string, phone: string) {
    const baseSlug = slugify(businessName) || "vendor";
    const existing = await prisma.vendor.findUnique({ where: { slug: baseSlug } });

    if (!existing) {
      return baseSlug;
    }

    return `${baseSlug}-${deterministicShortCode(phone, "v").replace("v-", "")}`;
  }

  private async createDraftListingsFromCatalogue(vendorId: string, output: unknown) {
    const listings = extractCatalogueListings(output);

    if (listings.length === 0) {
      return [];
    }

    const category = await prisma.category.upsert({
      where: { slug: "food-and-restaurants" },
      update: {},
      create: {
        name: "Food & Restaurants",
        slug: "food-and-restaurants",
        description: "Ready-to-order meals, takeaway, and local food vendors."
      }
    });

    return Promise.all(
      listings.map((listing, index) =>
        prisma.listing.create({
          data: {
            vendorId,
            categoryId: category.id,
            title: listing.title,
            slug: `${slugify(listing.title) || "listing"}-${index + 1}`,
            listingType: listing.listingType,
            shortDescription: listing.shortDescription,
            tags: listing.tags,
            price: listing.price,
            currency: listing.currency,
            pickupEnabled: true,
            deliveryEnabled: false,
            approvalStatus: ApprovalStatus.AI_GENERATED,
            aiMetadata: {
              source: "catalogue-builder",
              approvalStatus: ApprovalStatus.AI_GENERATED
            }
          }
        }),
      ),
    );
  }
}

function hasEnoughRegistrationInfo(dto: RegisterVendorDto): boolean {
  return Boolean(
    dto.businessName &&
      dto.ownerName &&
      dto.phone &&
      (dto.categoryHint || dto.description) &&
      (dto.address || dto.city || dto.country),
  );
}

function extractCatalogueListings(output: unknown) {
  if (!isRecord(output) || !Array.isArray(output.listings)) {
    return [];
  }

  return output.listings
    .filter(isRecord)
    .map((listing) => ({
      title: String(listing.title ?? "Untitled listing"),
      listingType: isListingType(listing.listingType) ? listing.listingType : ListingType.FOOD_MENU_ITEM,
      price: Number(listing.price ?? 0),
      currency: String(listing.currency ?? "SEK"),
      shortDescription: String(
        listing.shortDescription ?? "A ready-to-order item from the vendor.",
      ),
      tags: Array.isArray(listing.tags) ? listing.tags.map(String) : ["local"]
    }));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isListingType(value: unknown): value is ListingType {
  return typeof value === "string" && Object.values(ListingType).includes(value as ListingType);
}
