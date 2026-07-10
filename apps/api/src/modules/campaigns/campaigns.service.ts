import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { prisma } from "@buzzystores/database";
import {
  ApprovalStatus,
  CampaignStatus,
  CampaignType,
  DiscountType,
  LifecycleTrigger,
  NotificationChannel,
  UserRole,
  VendorLifecycleStage
} from "@buzzystores/types";
import { deterministicShortCode, slugify } from "@buzzystores/utils";
import { AiService } from "../ai/ai.service";
import { EventPublisherService } from "../events/event-publisher.service";
import { VendorLifecycleService } from "../vendor-lifecycle/vendor-lifecycle.service";
import type { CreateCampaignDto } from "./dto/create-campaign.dto";
import type { GenerateCampaignDto } from "./dto/generate-campaign.dto";

@Injectable()
export class CampaignsService {
  constructor(
    private readonly aiService: AiService,
    private readonly eventPublisher: EventPublisherService,
    private readonly lifecycleService: VendorLifecycleService,
  ) {}

  listVendorCampaigns(vendorId: string) {
    return prisma.campaign.findMany({
      where: { vendorId },
      include: {
        vendor: { select: { id: true, name: true, slug: true } },
        coupons: true,
        aiOutput: true
      },
      orderBy: { updatedAt: "desc" }
    });
  }

  async getVendorCampaign(id: string, vendorId: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        vendor: true,
        coupons: true,
        aiOutput: true
      }
    });

    if (!campaign) {
      throw new NotFoundException("Campaign not found.");
    }

    if (campaign.vendorId !== vendorId) {
      throw new ForbiddenException("Vendors can only access their own campaigns.");
    }

    return campaign;
  }

  async createCampaign(dto: CreateCampaignDto, actor?: { id: string; role: UserRole }) {
    const vendorId = dto.vendorId;
    if (!vendorId) {
      throw new BadRequestException("vendorId is required when creating a campaign directly.");
    }

    await this.assertSelectedListingsBelongToVendor(vendorId, dto.selectedListingIds ?? []);
    const campaignType = dto.campaignType ?? dto.type ?? CampaignType.WEEKEND_OFFER;
    const title = dto.title ?? dto.name ?? titleForCampaignType(campaignType);
    const slug = await this.uniqueCampaignSlug(vendorId, title);
    const qrShortCode = deterministicShortCode(`${vendorId}:${slug}:${Date.now()}`, "camp");

    const campaign = await prisma.campaign.create({
      data: {
        vendorId,
        name: title,
        title,
        slug,
        type: campaignType,
        status: CampaignStatus.DRAFT,
        targetAudience: dto.targetAudience,
        description: dto.description,
        offerText: dto.offerText,
        listingIds: dto.selectedListingIds ?? [],
        selectedListingIds: dto.selectedListingIds ?? [],
        couponCode: normalizeCouponCode(dto.couponCode),
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        minimumOrderAmount: dto.minimumOrderAmount ?? 0,
        usageLimit: dto.usageLimit,
        startsAt: toDate(dto.startDate),
        endsAt: toDate(dto.endDate),
        startDate: toDate(dto.startDate),
        endDate: toDate(dto.endDate),
        qrShortCode,
        campaignUrl: `/campaigns/${qrShortCode}`
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId: actor?.id,
        actorRole: actor?.role,
        vendorId,
        action: "campaign.vendor_created",
        entityType: "Campaign",
        entityId: campaign.id,
        after: {
          status: CampaignStatus.DRAFT,
          title
        }
      }
    });

    return campaign;
  }

  async generateCampaignDraft(vendorId: string, actor: { id: string; role: UserRole }, dto: GenerateCampaignDto) {
    const vendor = await prisma.vendor.findUniqueOrThrow({
      where: { id: vendorId },
      include: {
        listings: {
          where: {
            approvalStatus: { in: [ApprovalStatus.ADMIN_APPROVED, ApprovalStatus.PUBLISHED] }
          },
          orderBy: { updatedAt: "desc" },
          take: 10
        },
        orders: {
          where: {
            status: { in: ["COMPLETED", "READY_FOR_PICKUP", "SENT_TO_VENDOR"] }
          },
          orderBy: { createdAt: "desc" },
          take: 10
        }
      }
    });

    const draft = await this.aiService.runDraftJob({
      vendorId,
      requestedById: actor.id,
      agentType: "campaign",
      outputType: "CAMPAIGN_COPY",
      sourceInput: {
        vendor: {
          id: vendor.id,
          name: vendor.name,
          categoryLabel: vendor.categoryLabel,
          city: vendor.city,
          country: vendor.country,
          lifecycleStage: vendor.lifecycleStage
        },
        approvedListings: vendor.listings.map((listing) => ({
          id: listing.id,
          title: listing.title,
          price: Number(listing.price),
          currency: listing.currency
        })),
        previousOrders: vendor.orders.map((order) => ({
          id: order.id,
          status: order.status,
          total: Number(order.total)
        })),
        campaignType: dto.campaignType,
        targetLanguage: dto.language ?? vendor.preferredLanguage ?? "en",
        instruction: dto.instruction ?? null
      },
      promptVersion: "campaign-draft.v1",
      approvalStatus: ApprovalStatus.AI_GENERATED
    });

    const output = draft.output.output;
    const selectedListingIds = extractStringArray(output, "suggestedListings").filter((id) =>
      vendor.listings.some((listing) => listing.id === id),
    );
    const title = stringField(output, "title") ?? titleForCampaignType(dto.campaignType);
    const slug = await this.uniqueCampaignSlug(vendorId, title);
    const qrShortCode = deterministicShortCode(`${vendorId}:${slug}:${draft.job.id}`, "camp");
    const suggestedDiscount = isRecord(output.suggestedDiscount) ? output.suggestedDiscount : {};

    const campaign = await prisma.campaign.create({
      data: {
        vendorId,
        aiOutputId: draft.output.id,
        name: title,
        title,
        slug,
        type: dto.campaignType,
        status: CampaignStatus.AI_GENERATED,
        description: stringField(output, "description"),
        offerText: stringField(output, "offerText"),
        listingIds: selectedListingIds,
        selectedListingIds,
        couponCode: normalizeCouponCode(`${slug.slice(0, 8)}15`),
        discountType: isDiscountType(suggestedDiscount.type) ? suggestedDiscount.type : DiscountType.PERCENTAGE,
        discountValue: numberField(suggestedDiscount, "value") ?? 15,
        startsAt: toDate(stringField(output, "recommendedStartDate")),
        endsAt: toDate(stringField(output, "recommendedEndDate")),
        startDate: toDate(stringField(output, "recommendedStartDate")),
        endDate: toDate(stringField(output, "recommendedEndDate")),
        qrShortCode,
        campaignUrl: `/campaigns/${qrShortCode}`,
        whatsappCopy: stringField(output, "whatsappCopy"),
        instagramCaption: stringField(output, "instagramCaption"),
        socialCaption: stringField(output, "instagramCaption"),
        smsCopy: stringField(output, "smsCopy"),
        qrPosterHeadline: stringField(output, "qrPosterHeadline"),
        qrPosterSubtext: stringField(output, "qrPosterSubtext"),
        performance: {
          impressions: 0,
          visits: 0,
          orderCount: 0,
          revenue: 0
        }
      }
    });

    await prisma.notification.create({
      data: {
        recipientId: actor.id,
        vendorId,
        channel: NotificationChannel.IN_APP,
        templateKey: "campaign.draft_generated",
        subject: "AI campaign draft ready",
        body: `${title} is ready for vendor review.`,
        metadata: { campaignId: campaign.id, aiOutputId: draft.output.id }
      }
    });

    await this.eventPublisher.publish({
      type: "CampaignDraftGenerated",
      vendorId,
      entityType: "Campaign",
      entityId: campaign.id,
      payload: {
        aiJobId: draft.job.id,
        aiOutputId: draft.output.id,
        status: CampaignStatus.AI_GENERATED
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        actorRole: actor.role,
        vendorId,
        action: "campaign.ai_draft_generated",
        entityType: "Campaign",
        entityId: campaign.id,
        after: {
          status: CampaignStatus.AI_GENERATED,
          aiOutputId: draft.output.id
        }
      }
    });

    return {
      campaign,
      aiJob: draft.job,
      aiOutput: draft.output
    };
  }

  async approveVendorCampaign(id: string, vendorId: string, actor: { id: string; role: UserRole }) {
    const campaign = await this.getVendorCampaign(id, vendorId);

    if (![CampaignStatus.AI_GENERATED, CampaignStatus.DRAFT].includes(campaign.status)) {
      throw new BadRequestException("Only draft or AI-generated campaigns can be vendor-approved.");
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: { status: CampaignStatus.VENDOR_APPROVED }
    });

    await this.writeCampaignAudit(actor, vendorId, "campaign.vendor_approved", id, campaign.status, updated.status);
    await this.notifyCampaign(vendorId, actor.id, "campaign.vendor_approved", "Campaign approved by vendor", updated);
    await this.eventPublisher.publish({
      type: "CampaignVendorApproved",
      vendorId,
      entityType: "Campaign",
      entityId: id,
      payload: { status: CampaignStatus.VENDOR_APPROVED }
    });

    return updated;
  }

  async pauseVendorCampaign(id: string, vendorId: string, actor: { id: string; role: UserRole }) {
    const campaign = await this.getVendorCampaign(id, vendorId);

    if (![CampaignStatus.ACTIVE, CampaignStatus.SCHEDULED].includes(campaign.status)) {
      throw new BadRequestException("Only active or scheduled campaigns can be paused.");
    }

    return this.updateCampaignStatus(campaign, CampaignStatus.PAUSED, actor, "campaign.vendor_paused", "CampaignPaused");
  }

  async endVendorCampaign(id: string, vendorId: string, actor: { id: string; role: UserRole }) {
    const campaign = await this.getVendorCampaign(id, vendorId);

    if (![CampaignStatus.ACTIVE, CampaignStatus.PAUSED, CampaignStatus.SCHEDULED].includes(campaign.status)) {
      throw new BadRequestException("Only active, paused, or scheduled campaigns can be ended.");
    }

    return this.updateCampaignStatus(campaign, CampaignStatus.ENDED, actor, "campaign.vendor_ended", "CampaignEnded");
  }

  listAdminCampaigns(status?: string) {
    return prisma.campaign.findMany({
      where: status ? { status: status as CampaignStatus } : {},
      include: {
        vendor: { select: { id: true, name: true, slug: true, lifecycleStage: true, approvalStatus: true } },
        coupons: true,
        aiOutput: true
      },
      orderBy: { updatedAt: "desc" }
    });
  }

  getAdminCampaign(id: string) {
    return prisma.campaign.findUniqueOrThrow({
      where: { id },
      include: {
        vendor: {
          include: {
            storefront: true,
            listings: true
          }
        },
        coupons: true,
        aiOutput: true
      }
    });
  }

  async approveAdminCampaign(id: string, actor: { id: string; role: UserRole }) {
    assertAdmin(actor);
    const campaign = await this.getAdminCampaign(id);
    const updated = await prisma.campaign.update({
      where: { id },
      data: { status: CampaignStatus.ADMIN_APPROVED }
    });

    await this.writeCampaignAudit(actor, campaign.vendorId, "campaign.admin_approved", id, campaign.status, updated.status);
    await this.notifyCampaign(campaign.vendorId, campaign.vendor.ownerId ?? null, "campaign.admin_approved", "Campaign approved by admin", updated);
    await this.eventPublisher.publish({
      type: "CampaignAdminApproved",
      vendorId: campaign.vendorId,
      entityType: "Campaign",
      entityId: id,
      payload: { status: CampaignStatus.ADMIN_APPROVED }
    });

    return updated;
  }

  async rejectAdminCampaign(id: string, actor: { id: string; role: UserRole }, reason?: string) {
    assertAdmin(actor);
    const campaign = await this.getAdminCampaign(id);
    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        status: CampaignStatus.REJECTED,
        rejectionReason: reason ?? null
      }
    });

    await this.writeCampaignAudit(actor, campaign.vendorId, "campaign.admin_rejected", id, campaign.status, updated.status, {
      reason: reason ?? null
    });
    await this.notifyCampaign(campaign.vendorId, campaign.vendor.ownerId ?? null, "campaign.admin_rejected", "Campaign rejected by admin", updated);

    return updated;
  }

  async activateCampaign(id: string, actor: { id: string; role: UserRole }) {
    assertAdmin(actor);
    const campaign = await this.getAdminCampaign(id);

    if (campaign.status !== CampaignStatus.ADMIN_APPROVED && campaign.status !== CampaignStatus.SCHEDULED) {
      throw new BadRequestException("Campaign must be admin-approved before activation.");
    }

    if (campaign.vendor.lifecycleStage !== VendorLifecycleStage.PUBLISHED || !campaign.vendor.storefront?.publishedAt) {
      throw new BadRequestException("Active campaigns require a published vendor storefront.");
    }

    await this.assertCampaignListingsArePublic(campaign.vendorId, campaign.selectedListingIds.length > 0 ? campaign.selectedListingIds : campaign.listingIds);

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        status: CampaignStatus.ACTIVE,
        startDate: campaign.startDate ?? campaign.startsAt ?? new Date(),
        startsAt: campaign.startsAt ?? campaign.startDate ?? new Date(),
        campaignUrl: campaign.campaignUrl ?? `/campaigns/${campaign.qrShortCode ?? campaign.id}`
      }
    });

    if (campaign.couponCode && campaign.discountType && campaign.discountValue) {
      await prisma.coupon.upsert({
        where: { code: campaign.couponCode },
        update: {
          vendorId: campaign.vendorId,
          campaignId: campaign.id,
          discountType: campaign.discountType,
          discountValue: campaign.discountValue,
          minimumOrderAmount: campaign.minimumOrderAmount,
          usageLimit: campaign.usageLimit,
          active: true,
          startsAt: campaign.startDate ?? campaign.startsAt,
          endsAt: campaign.endDate ?? campaign.endsAt
        },
        create: {
          vendorId: campaign.vendorId,
          campaignId: campaign.id,
          code: campaign.couponCode,
          discountType: campaign.discountType,
          discountValue: campaign.discountValue,
          minimumOrderAmount: campaign.minimumOrderAmount,
          usageLimit: campaign.usageLimit,
          active: true,
          startsAt: campaign.startDate ?? campaign.startsAt,
          endsAt: campaign.endDate ?? campaign.endsAt
        }
      });
    }

    await this.writeCampaignAudit(actor, campaign.vendorId, "campaign.activated", id, campaign.status, updated.status);
    await this.notifyCampaign(campaign.vendorId, campaign.vendor.ownerId ?? null, "campaign.activated", "Campaign activated", updated);
    await this.eventPublisher.publish({
      type: "CampaignActivated",
      vendorId: campaign.vendorId,
      entityType: "Campaign",
      entityId: id,
      payload: {
        status: CampaignStatus.ACTIVE,
        campaignUrl: updated.campaignUrl,
        couponCode: updated.couponCode
      }
    });

    if (campaign.vendor.lifecycleStage === VendorLifecycleStage.PUBLISHED) {
      await this.lifecycleService.transitionVendorStage(campaign.vendorId, VendorLifecycleStage.FIRST_CAMPAIGN_LAUNCHED, {
        actorId: actor.id,
        actorRole: actor.role,
        trigger: LifecycleTrigger.ADMIN,
        reason: "First approved campaign activated.",
        nextAction: "Watch QR scans, coupon usage, and first campaign orders.",
        metadata: { campaignId: campaign.id }
      });
    }

    return updated;
  }

  async pauseAdminCampaign(id: string, actor: { id: string; role: UserRole }) {
    assertAdmin(actor);
    const campaign = await this.getAdminCampaign(id);

    if (campaign.status !== CampaignStatus.ACTIVE) {
      throw new BadRequestException("Only active campaigns can be paused by admin.");
    }

    return this.updateCampaignStatus(campaign, CampaignStatus.PAUSED, actor, "campaign.admin_paused", "CampaignPaused");
  }

  async getPublicCampaign(idOrShortCode: string) {
    const campaign = await prisma.campaign.findFirst({
      where: {
        OR: [{ id: idOrShortCode }, { qrShortCode: idOrShortCode }, { slug: idOrShortCode }],
        status: CampaignStatus.ACTIVE
      },
      include: {
        vendor: {
          include: {
            storefront: true
          }
        },
        coupons: {
          where: { active: true }
        }
      }
    });

    if (!campaign) {
      return null;
    }

    const listingIds = campaign.selectedListingIds.length > 0 ? campaign.selectedListingIds : campaign.listingIds;
    const listings = listingIds.length
      ? await prisma.listing.findMany({
          where: {
            id: { in: listingIds },
            vendorId: campaign.vendorId,
            approvalStatus: { in: [ApprovalStatus.ADMIN_APPROVED, ApprovalStatus.PUBLISHED] },
            publishedAt: { not: null }
          },
          orderBy: { title: "asc" }
        })
      : [];

    if (campaign.vendor.lifecycleStage !== VendorLifecycleStage.PUBLISHED || !campaign.vendor.storefront?.publishedAt) {
      return null;
    }

    return {
      id: campaign.id,
      shortCode: campaign.qrShortCode,
      title: campaign.title ?? campaign.name,
      vendorName: campaign.vendor.name,
      vendorSlug: campaign.vendor.slug,
      offerText: campaign.offerText,
      description: campaign.description,
      status: campaign.status,
      startDate: campaign.startDate?.toISOString() ?? campaign.startsAt?.toISOString() ?? null,
      endDate: campaign.endDate?.toISOString() ?? campaign.endsAt?.toISOString() ?? null,
      couponCode: campaign.couponCode,
      campaignUrl: campaign.campaignUrl,
      storefrontUrl: `/vendor/${campaign.vendor.slug}`,
      listings: listings.map((listing) => ({
        id: listing.id,
        title: listing.title,
        price: Number(listing.price),
        currency: listing.currency,
        shortDescription: listing.shortDescription
      }))
    };
  }

  private async updateCampaignStatus(
    campaign: { id: string; vendorId: string; status: CampaignStatus; title?: string | null; name: string },
    nextStatus: CampaignStatus,
    actor: { id: string; role: UserRole },
    auditAction: string,
    eventType: "CampaignPaused" | "CampaignEnded",
  ) {
    const updated = await prisma.campaign.update({
      where: { id: campaign.id },
      data: { status: nextStatus }
    });

    await this.writeCampaignAudit(actor, campaign.vendorId, auditAction, campaign.id, campaign.status, nextStatus);
    await this.eventPublisher.publish({
      type: eventType,
      vendorId: campaign.vendorId,
      entityType: "Campaign",
      entityId: campaign.id,
      payload: { status: nextStatus }
    });

    return updated;
  }

  private async assertSelectedListingsBelongToVendor(vendorId: string, listingIds: string[]) {
    if (listingIds.length === 0) {
      return;
    }

    const listings = await prisma.listing.findMany({
      where: { id: { in: listingIds } },
      select: { id: true, vendorId: true }
    });

    if (listings.length !== new Set(listingIds).size || listings.some((listing) => listing.vendorId !== vendorId)) {
      throw new ForbiddenException("Campaign listings must belong to the vendor.");
    }
  }

  private async assertCampaignListingsArePublic(vendorId: string, listingIds: string[]) {
    if (listingIds.length === 0) {
      return;
    }

    const listings = await prisma.listing.findMany({
      where: {
        id: { in: listingIds },
        vendorId,
        approvalStatus: { in: [ApprovalStatus.ADMIN_APPROVED, ApprovalStatus.PUBLISHED] },
        publishedAt: { not: null }
      }
    });

    if (listings.length !== new Set(listingIds).size) {
      throw new BadRequestException("Active campaigns can only feature approved and published listings.");
    }
  }

  private async uniqueCampaignSlug(vendorId: string, title: string) {
    const baseSlug = slugify(title) || "campaign";
    const existing = await prisma.campaign.findUnique({
      where: {
        vendorId_slug: {
          vendorId,
          slug: baseSlug
        }
      }
    });

    if (!existing) {
      return baseSlug;
    }

    return `${baseSlug}-${deterministicShortCode(`${vendorId}:${title}`, "c").replace("c-", "")}`;
  }

  private async writeCampaignAudit(
    actor: { id: string; role: UserRole },
    vendorId: string,
    action: string,
    campaignId: string,
    beforeStatus: string,
    afterStatus: string,
    metadata: Record<string, unknown> = {},
  ) {
    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        actorRole: actor.role,
        vendorId,
        action,
        entityType: "Campaign",
        entityId: campaignId,
        before: { status: beforeStatus },
        after: { status: afterStatus },
        metadata
      }
    });
  }

  private async notifyCampaign(
    vendorId: string,
    recipientId: string | null | undefined,
    templateKey: string,
    subject: string,
    campaign: { id: string; title?: string | null; name: string; status: string },
  ) {
    await prisma.notification.create({
      data: {
        vendorId,
        ...(recipientId ? { recipientId } : {}),
        channel: NotificationChannel.IN_APP,
        templateKey,
        subject,
        body: `${campaign.title ?? campaign.name} is now ${campaign.status}.`,
        metadata: {
          campaignId: campaign.id,
          status: campaign.status
        }
      }
    });
  }
}

function assertAdmin(actor: { role: UserRole }) {
  if (actor.role !== UserRole.ADMIN && actor.role !== UserRole.SUPER_ADMIN) {
    throw new ForbiddenException("Campaign approval requires ADMIN or SUPER_ADMIN role.");
  }
}

function normalizeCouponCode(value?: string | null) {
  return value?.trim().toUpperCase() || undefined;
}

function toDate(value?: string | Date | null) {
  if (!value) {
    return undefined;
  }

  return value instanceof Date ? value : new Date(value);
}

function titleForCampaignType(type: CampaignType) {
  return type
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function stringField(value: unknown, key: string) {
  if (!isRecord(value) || typeof value[key] !== "string") {
    return undefined;
  }

  return String(value[key]);
}

function numberField(value: unknown, key: string) {
  if (!isRecord(value) || typeof value[key] !== "number") {
    return undefined;
  }

  return Number(value[key]);
}

function extractStringArray(value: unknown, key: string) {
  if (!isRecord(value) || !Array.isArray(value[key])) {
    return [];
  }

  return value[key].map(String);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isDiscountType(value: unknown): value is DiscountType {
  return typeof value === "string" && Object.values(DiscountType).includes(value as DiscountType);
}
