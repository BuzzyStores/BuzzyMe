import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { ApprovalStatus as PrismaApprovalStatus } from "@prisma/client";
import { prisma } from "@buzzystores/database";
import { ApprovalStatus, LifecycleTrigger, UserRole, VendorLifecycleStage } from "@buzzystores/types";
import { deterministicShortCode } from "@buzzystores/utils";
import { AiService } from "../ai/ai.service";
import { CampaignsService } from "../campaigns/campaigns.service";
import { EventPublisherService } from "../events/event-publisher.service";
import { VendorLifecycleService } from "../vendor-lifecycle/vendor-lifecycle.service";

@Injectable()
export class AdminService {
  constructor(
    private readonly aiService: AiService,
    private readonly campaignsService: CampaignsService,
    private readonly eventPublisher: EventPublisherService,
    private readonly lifecycleService: VendorLifecycleService,
  ) {}

  listAiOutputs() {
    return this.aiService.listOutputs();
  }

  getAiOutput(id: string) {
    return this.aiService.getOutput(id);
  }

  approveAiOutput(id: string, actor: { id: string; role: UserRole }) {
    this.assertAdmin(actor);
    return this.aiService.approveOutput(id, actor, "admin");
  }

  rejectAiOutput(id: string, actor: { id: string; role: UserRole }, reason?: string) {
    this.assertAdmin(actor);
    return this.aiService.rejectOutput(id, actor, "admin", reason);
  }

  async approveVendor(id: string, actor: { id: string; role: UserRole }) {
    this.assertAdmin(actor);

    const vendor = await prisma.vendor.findUniqueOrThrow({
      where: { id },
      include: {
        storefront: true,
        aiOutputs: {
          where: {
            type: "VENDOR_PROFILE",
            approvalStatus: {
              in: [
                PrismaApprovalStatus.ADMIN_APPROVED,
                PrismaApprovalStatus.VENDOR_APPROVED,
                PrismaApprovalStatus.DRAFT
              ]
            }
          },
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    const storefront = vendor.storefront ?? (await this.createStorefrontDraft(vendor.id, vendor.slug, vendor.name));
    const profileDraft = vendor.aiOutputs[0]?.output;
    const storefrontPatch = createStorefrontPatch(profileDraft);
    const updatedStorefront = await prisma.storefront.update({
      where: { id: storefront.id },
      data: {
        ...storefrontPatch,
        pickupText: storefront.pickupText ?? "Pickup options are being prepared.",
        deliveryText: storefront.deliveryText ?? "Delivery options are being reviewed."
      }
    });

    const qrShortCode = deterministicShortCode(`${vendor.id}:${updatedStorefront.shortCode}`, "qr");
    const qrCode = await prisma.qRCode.upsert({
      where: { shortCode: qrShortCode },
      update: {
        vendorId: vendor.id,
        storefrontId: updatedStorefront.id,
        targetUrl: `/v/${updatedStorefront.shortCode}`
      },
      create: {
        vendorId: vendor.id,
        storefrontId: updatedStorefront.id,
        shortCode: qrShortCode,
        targetUrl: `/v/${updatedStorefront.shortCode}`,
        imageUrl: `/qr/${qrShortCode}.svg`,
        posterUrl: `/posters/${qrShortCode}.pdf`
      }
    });

    await prisma.vendor.update({
      where: { id },
      data: {
        approvalStatus: PrismaApprovalStatus.ADMIN_APPROVED,
        nextAction: "Publish QR storefront and prepare launch campaign.",
        activationScore: Math.max(vendor.activationScore, 55)
      }
    });

    const transition = await this.lifecycleService.transitionVendorStage(id, VendorLifecycleStage.PENDING_APPROVAL, {
      actorId: actor.id,
      actorRole: actor.role,
      trigger: LifecycleTrigger.ADMIN,
      reason: "Admin approved vendor activation draft.",
      nextAction: "Publish QR storefront and prepare launch campaign.",
      metadata: {
        qrCodeId: qrCode.id,
        storefrontId: updatedStorefront.id
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        actorRole: actor.role,
        vendorId: vendor.id,
        action: "vendor.admin_approved",
        entityType: "Vendor",
        entityId: vendor.id,
        before: {
          approvalStatus: vendor.approvalStatus,
          lifecycleStage: vendor.lifecycleStage
        },
        after: {
          approvalStatus: ApprovalStatus.ADMIN_APPROVED,
          lifecycleStage: VendorLifecycleStage.PENDING_APPROVAL
        },
        metadata: {
          storefrontId: updatedStorefront.id,
          qrCodeId: qrCode.id
        }
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        actorRole: actor.role,
        vendorId: vendor.id,
        action: "storefront.ready_for_publishing",
        entityType: "Storefront",
        entityId: updatedStorefront.id,
        after: {
          shortCode: updatedStorefront.shortCode,
          qrShortCode
        },
        metadata: {
          vendorId: vendor.id
        }
      }
    });

    return {
      vendor: transition.vendor,
      storefront: updatedStorefront,
      qrCode
    };
  }

  async publishVendor(id: string, actor: { id: string; role: UserRole }) {
    this.assertAdmin(actor);

    const vendor = await prisma.vendor.findUniqueOrThrow({
      where: { id },
      include: {
        storefront: true,
        listings: true
      }
    });

    if (
      vendor.approvalStatus !== PrismaApprovalStatus.ADMIN_APPROVED &&
      vendor.approvalStatus !== PrismaApprovalStatus.PUBLISHED &&
      vendor.lifecycleStage !== VendorLifecycleStage.PENDING_APPROVAL &&
      vendor.lifecycleStage !== VendorLifecycleStage.PUBLISHED
    ) {
      throw new BadRequestException("Vendor must be admin-approved or pending approval before publishing.");
    }

    if (!vendor.storefront) {
      throw new BadRequestException("Vendor cannot be published without a storefront.");
    }

    if (!vendor.storefront.headline || (!vendor.storefront.shortDescription && !vendor.storefront.longDescription)) {
      throw new BadRequestException("Vendor storefront needs a headline and description before publishing.");
    }

    const approvedListings = vendor.listings.filter((listing) =>
      [PrismaApprovalStatus.ADMIN_APPROVED, PrismaApprovalStatus.PUBLISHED].includes(listing.approvalStatus),
    );

    if (approvedListings.length === 0) {
      throw new BadRequestException("Vendor cannot be published without at least one approved listing.");
    }

    const publishedAt = new Date();
    const updatedStorefront = await prisma.storefront.update({
      where: { id: vendor.storefront.id },
      data: { publishedAt }
    });

    await prisma.listing.updateMany({
      where: {
        vendorId: vendor.id,
        approvalStatus: {
          in: [PrismaApprovalStatus.ADMIN_APPROVED, PrismaApprovalStatus.PUBLISHED]
        }
      },
      data: {
        publishedAt
      }
    });

    const qrCode = await prisma.qRCode.upsert({
      where: { shortCode: `qr-${updatedStorefront.shortCode}` },
      update: {
        vendorId: vendor.id,
        storefrontId: updatedStorefront.id,
        targetUrl: `/v/${updatedStorefront.shortCode}`
      },
      create: {
        vendorId: vendor.id,
        storefrontId: updatedStorefront.id,
        shortCode: `qr-${updatedStorefront.shortCode}`,
        targetUrl: `/v/${updatedStorefront.shortCode}`,
        imageUrl: `/qr/${updatedStorefront.shortCode}.svg`,
        posterUrl: `/posters/${updatedStorefront.shortCode}.pdf`
      }
    });

    await prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        approvalStatus: PrismaApprovalStatus.PUBLISHED,
        activationScore: Math.max(vendor.activationScore, 72),
        nextAction: "Share QR storefront and prepare for first order."
      }
    });

    const transition = await this.lifecycleService.transitionVendorStage(id, VendorLifecycleStage.PUBLISHED, {
      actorId: actor.id,
      actorRole: actor.role,
      trigger: LifecycleTrigger.ADMIN,
      reason: "Admin published QR storefront.",
      nextAction: "Share QR storefront and prepare for first order.",
      metadata: {
        storefrontId: updatedStorefront.id,
        qrCodeId: qrCode.id,
        publicUrl: `/vendor/${vendor.slug}`,
        qrUrl: `/v/${updatedStorefront.shortCode}`
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        actorRole: actor.role,
        vendorId: vendor.id,
        action: "vendor.storefront_published",
        entityType: "Vendor",
        entityId: vendor.id,
        before: {
          lifecycleStage: vendor.lifecycleStage,
          approvalStatus: vendor.approvalStatus
        },
        after: {
          lifecycleStage: VendorLifecycleStage.PUBLISHED,
          approvalStatus: ApprovalStatus.PUBLISHED,
          storefrontPublishedAt: publishedAt
        },
        metadata: {
          storefrontId: updatedStorefront.id,
          qrCodeId: qrCode.id
        }
      }
    });

    await this.eventPublisher.publish({
      type: "VendorPublished",
      vendorId: vendor.id,
      entityType: "Vendor",
      entityId: vendor.id,
      payload: {
        storefrontId: updatedStorefront.id,
        qrCodeId: qrCode.id,
        publicUrl: `/vendor/${vendor.slug}`,
        qrUrl: `/v/${updatedStorefront.shortCode}`
      }
    });

    return {
      vendorId: transition.vendor.id,
      storefrontId: updatedStorefront.id,
      lifecycleStage: VendorLifecycleStage.PUBLISHED,
      publicUrl: `/vendor/${vendor.slug}`,
      qrUrl: `/v/${updatedStorefront.shortCode}`,
      shortCode: updatedStorefront.shortCode
    };
  }

  listListings(status?: string) {
    return prisma.listing.findMany({
      where: status ? { approvalStatus: status as PrismaApprovalStatus } : {},
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    });
  }

  async approveListing(id: string, actor: { id: string; role: UserRole }) {
    this.assertAdmin(actor);
    const listing = await prisma.listing.findUniqueOrThrow({ where: { id } });
    const updated = await prisma.listing.update({
      where: { id },
      data: {
        approvalStatus: PrismaApprovalStatus.ADMIN_APPROVED,
        publishedAt: listing.publishedAt ?? new Date()
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        actorRole: actor.role,
        vendorId: listing.vendorId,
        action: "listing.admin_approved",
        entityType: "Listing",
        entityId: id,
        before: { approvalStatus: listing.approvalStatus },
        after: { approvalStatus: ApprovalStatus.ADMIN_APPROVED },
        metadata: { phase: "phase-3" }
      }
    });

    await this.eventPublisher.publish({
      type: "ListingApproved",
      vendorId: listing.vendorId,
      entityType: "Listing",
      entityId: id,
      payload: {
        title: listing.title
      }
    });

    return updated;
  }

  async rejectListing(id: string, actor: { id: string; role: UserRole }, reason?: string) {
    this.assertAdmin(actor);
    const listing = await prisma.listing.findUniqueOrThrow({ where: { id } });
    const updated = await prisma.listing.update({
      where: { id },
      data: {
        approvalStatus: PrismaApprovalStatus.REJECTED,
        aiMetadata: {
          ...(isRecord(listing.aiMetadata) ? listing.aiMetadata : {}),
          rejectionReason: reason ?? null
        }
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        actorRole: actor.role,
        vendorId: listing.vendorId,
        action: "listing.admin_rejected",
        entityType: "Listing",
        entityId: id,
        before: { approvalStatus: listing.approvalStatus },
        after: { approvalStatus: ApprovalStatus.REJECTED },
        metadata: {
          reason: reason ?? null
        }
      }
    });

    await this.eventPublisher.publish({
      type: "ListingRejected",
      vendorId: listing.vendorId,
      entityType: "Listing",
      entityId: id,
      payload: {
        reason: reason ?? null
      }
    });

    return updated;
  }

  listCampaigns(status?: string) {
    return this.campaignsService.listAdminCampaigns(status);
  }

  getCampaign(id: string) {
    return this.campaignsService.getAdminCampaign(id);
  }

  approveCampaign(id: string, actor: { id: string; role: UserRole }) {
    this.assertAdmin(actor);
    return this.campaignsService.approveAdminCampaign(id, actor);
  }

  rejectCampaign(id: string, actor: { id: string; role: UserRole }, reason?: string) {
    this.assertAdmin(actor);
    return this.campaignsService.rejectAdminCampaign(id, actor, reason);
  }

  activateCampaign(id: string, actor: { id: string; role: UserRole }) {
    this.assertAdmin(actor);
    return this.campaignsService.activateCampaign(id, actor);
  }

  pauseCampaign(id: string, actor: { id: string; role: UserRole }) {
    this.assertAdmin(actor);
    return this.campaignsService.pauseAdminCampaign(id, actor);
  }

  listOrders() {
    return prisma.order.findMany({
      include: {
        vendor: {
          select: {
            name: true,
            slug: true
          }
        },
        customer: {
          select: {
            fullName: true,
            phone: true,
            email: true
          }
        },
        items: true
      },
      orderBy: { createdAt: "desc" },
      take: 50
    });
  }

  private assertAdmin(actor: { role: UserRole }) {
    if (actor.role !== UserRole.ADMIN && actor.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException("Admin approval requires ADMIN or SUPER_ADMIN role.");
    }
  }

  private createStorefrontDraft(vendorId: string, slug: string, vendorName: string) {
    return prisma.storefront.create({
      data: {
        vendorId,
        slug,
        shortCode: deterministicShortCode(vendorId, "v"),
        headline: `Draft storefront for ${vendorName}`,
        shortDescription: `${vendorName} is preparing a BuzzyStores storefront.`
      }
    });
  }
}

function createStorefrontPatch(output: unknown) {
  if (!isRecord(output)) {
    return {};
  }

  return {
    ...(typeof output.suggestedStorefrontHeadline === "string"
      ? { headline: output.suggestedStorefrontHeadline }
      : {}),
    ...(typeof output.suggestedShortDescription === "string"
      ? { shortDescription: output.suggestedShortDescription }
      : {}),
    ...(typeof output.suggestedLongDescription === "string"
      ? { longDescription: output.suggestedLongDescription }
      : {})
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
