import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { prisma } from "@buzzystores/database";
import { CampaignStatus, NotificationChannel, UserRole, type VendorHealthStatus } from "@buzzystores/types";
import { AiService } from "../ai/ai.service";
import { CampaignsService } from "../campaigns/campaigns.service";
import type { CreateCampaignDto } from "../campaigns/dto/create-campaign.dto";
import type { GenerateCampaignDto } from "../campaigns/dto/generate-campaign.dto";
import { EventPublisherService } from "../events/event-publisher.service";
import { OrdersService } from "../orders/orders.service";

@Injectable()
export class VendorPortalService {
  constructor(
    private readonly aiService: AiService,
    private readonly campaignsService: CampaignsService,
    private readonly eventPublisher: EventPublisherService,
    private readonly ordersService: OrdersService,
  ) {}

  async listMyAiOutputs(actor: { id: string; role: UserRole }) {
    const vendor = await this.findVendorForActor(actor);

    return this.aiService.listOutputs({ vendorId: vendor.id });
  }

  async approveAiOutput(id: string, actor: { id: string; role: UserRole }) {
    await this.assertCanReviewOutput(id, actor);
    return this.aiService.approveOutput(id, actor, "vendor");
  }

  async requestChanges(id: string, actor: { id: string; role: UserRole }, reason?: string) {
    await this.assertCanReviewOutput(id, actor);
    return this.aiService.rejectOutput(id, actor, "vendor", reason);
  }

  async listOrders(actor: { id: string; role: UserRole }) {
    const vendor = await this.findVendorForActor(actor);
    return this.ordersService.listOrdersForVendor(vendor.id);
  }

  async acceptOrder(orderId: string, actor: { id: string; role: UserRole }) {
    const vendor = await this.findVendorForActor(actor);
    return this.ordersService.acceptOrder(orderId, vendor.id, actor);
  }

  async rejectOrder(orderId: string, actor: { id: string; role: UserRole }, reason?: string) {
    const vendor = await this.findVendorForActor(actor);
    return this.ordersService.rejectOrder(orderId, vendor.id, actor, reason);
  }

  async markReady(orderId: string, actor: { id: string; role: UserRole }) {
    const vendor = await this.findVendorForActor(actor);
    return this.ordersService.markReadyForPickup(orderId, vendor.id, actor);
  }

  async completeOrder(orderId: string, actor: { id: string; role: UserRole }) {
    const vendor = await this.findVendorForActor(actor);
    return this.ordersService.completeOrder(orderId, vendor.id, actor);
  }

  async listCampaigns(actor: { id: string; role: UserRole }) {
    const vendor = await this.findVendorForActor(actor);
    return this.campaignsService.listVendorCampaigns(vendor.id);
  }

  async createCampaign(dto: CreateCampaignDto, actor: { id: string; role: UserRole }) {
    const vendor = await this.findVendorForActor(actor);
    return this.campaignsService.createCampaign({ ...dto, vendorId: vendor.id }, actor);
  }

  async generateCampaign(dto: GenerateCampaignDto, actor: { id: string; role: UserRole }) {
    const vendor = await this.findVendorForActor(actor);
    return this.campaignsService.generateCampaignDraft(vendor.id, actor, dto);
  }

  async getCampaign(id: string, actor: { id: string; role: UserRole }) {
    const vendor = await this.findVendorForActor(actor);
    return this.campaignsService.getVendorCampaign(id, vendor.id);
  }

  async approveCampaign(id: string, actor: { id: string; role: UserRole }) {
    const vendor = await this.findVendorForActor(actor);
    return this.campaignsService.approveVendorCampaign(id, vendor.id, actor);
  }

  async pauseCampaign(id: string, actor: { id: string; role: UserRole }) {
    const vendor = await this.findVendorForActor(actor);
    return this.campaignsService.pauseVendorCampaign(id, vendor.id, actor);
  }

  async endCampaign(id: string, actor: { id: string; role: UserRole }) {
    const vendor = await this.findVendorForActor(actor);
    return this.campaignsService.endVendorCampaign(id, vendor.id, actor);
  }

  async listCustomers(actor: { id: string; role: UserRole }) {
    const vendor = await this.findVendorForActor(actor);
    return prisma.vendorCustomerProfile.findMany({
      where: { vendorId: vendor.id },
      orderBy: [{ lastOrderDate: "desc" }, { updatedAt: "desc" }]
    });
  }

  async getCustomer(id: string, actor: { id: string; role: UserRole }) {
    const vendor = await this.findVendorForActor(actor);
    const profile = await prisma.vendorCustomerProfile.findUniqueOrThrow({
      where: { id }
    });

    if (profile.vendorId !== vendor.id) {
      throw new ForbiddenException("Vendors can only access their own customers.");
    }

    const orders = await prisma.order.findMany({
      where: {
        vendorId: vendor.id,
        customer: {
          phone: profile.phone
        }
      },
      include: { items: true, review: true },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    return {
      ...profile,
      orders
    };
  }

  async updateCustomerTags(id: string, tags: string[], actor: { id: string; role: UserRole }) {
    const vendor = await this.findVendorForActor(actor);
    await this.assertCustomerBelongsToVendor(id, vendor.id);

    return prisma.vendorCustomerProfile.update({
      where: { id },
      data: {
        tags: [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))]
      }
    });
  }

  async updateCustomerNotes(id: string, notes: string, actor: { id: string; role: UserRole }) {
    const vendor = await this.findVendorForActor(actor);
    await this.assertCustomerBelongsToVendor(id, vendor.id);

    return prisma.vendorCustomerProfile.update({
      where: { id },
      data: { notes }
    });
  }

  async getRetentionSuggestions(actor: { id: string; role: UserRole }) {
    const vendor = await this.findVendorForActor(actor);
    const profiles = await prisma.vendorCustomerProfile.findMany({
      where: { vendorId: vendor.id },
      orderBy: { updatedAt: "desc" }
    });
    const now = Date.now();
    const inactiveCutoffMs = 30 * 24 * 60 * 60 * 1000;
    const repeat = profiles.filter((profile) => profile.orderCount >= 2);
    const inactive = profiles.filter(
      (profile) => profile.lastOrderDate && now - profile.lastOrderDate.getTime() > inactiveCutoffMs,
    );
    const highValue = profiles.filter((profile) => Number(profile.totalSpend) >= 500);
    const firstTime = profiles.filter((profile) => profile.orderCount <= 1);
    const suggestions = [
      buildRetentionSuggestion("repeat", repeat, "Invite repeat customers to a weekly QR pickup offer."),
      buildRetentionSuggestion("inactive", inactive, "Send a reactivation coupon to customers inactive for 30+ days."),
      buildRetentionSuggestion("highValue", highValue, "Offer high-value customers a family bundle or early access deal."),
      buildRetentionSuggestion("firstTime", firstTime, "Ask first-time customers for a review and second-order nudge.")
    ];

    await prisma.notification.create({
      data: {
        recipientId: actor.id,
        vendorId: vendor.id,
        channel: NotificationChannel.IN_APP,
        templateKey: "retention.suggestion_generated",
        subject: "Retention suggestions updated",
        body: "Customer retention groups are ready for campaign planning.",
        metadata: {
          repeat: repeat.length,
          inactive: inactive.length,
          highValue: highValue.length,
          firstTime: firstTime.length
        }
      }
    });

    await this.eventPublisher.publish({
      type: "RetentionSuggestionGenerated",
      vendorId: vendor.id,
      entityType: "Vendor",
      entityId: vendor.id,
      payload: {
        repeat: repeat.length,
        inactive: inactive.length,
        highValue: highValue.length,
        firstTime: firstTime.length
      }
    });

    return {
      vendorId: vendor.id,
      groups: {
        repeat,
        inactive,
        highValue,
        firstTime
      },
      suggestedActions: suggestions
    };
  }

  async getHealth(actor: { id: string; role: UserRole }) {
    const vendor = await this.findVendorForActor(actor);
    const [
      storefront,
      approvedListings,
      qrAggregate,
      orderCount,
      completedOrders,
      rejectedOrders,
      cancelledOrders,
      activeCampaignCount,
      reviewAggregate,
      repeatCustomerCount,
      lastOrder
    ] = await Promise.all([
      prisma.storefront.findUnique({ where: { vendorId: vendor.id } }),
      prisma.listing.count({
        where: {
          vendorId: vendor.id,
          approvalStatus: { in: ["ADMIN_APPROVED", "PUBLISHED"] },
          publishedAt: { not: null }
        }
      }),
      prisma.qRCode.aggregate({
        where: { vendorId: vendor.id },
        _sum: { scanCount: true }
      }),
      prisma.order.count({ where: { vendorId: vendor.id } }),
      prisma.order.count({ where: { vendorId: vendor.id, status: "COMPLETED" } }),
      prisma.order.count({ where: { vendorId: vendor.id, status: "REJECTED" } }),
      prisma.order.count({ where: { vendorId: vendor.id, status: "CANCELLED" } }),
      prisma.campaign.count({ where: { vendorId: vendor.id, status: CampaignStatus.ACTIVE } }),
      prisma.review.aggregate({
        where: { vendorId: vendor.id, approved: true },
        _avg: { rating: true },
        _count: { rating: true }
      }),
      prisma.vendorCustomerProfile.count({ where: { vendorId: vendor.id, orderCount: { gte: 2 } } }),
      prisma.order.findFirst({
        where: { vendorId: vendor.id },
        orderBy: { createdAt: "desc" }
      })
    ]);

    const qrScans = qrAggregate._sum.scanCount ?? 0;
    const reviewCount = reviewAggregate._count.rating;
    const averageRating = reviewAggregate._avg.rating ?? 0;
    const cancellationRejectionRate = orderCount > 0 ? Math.round(((rejectedOrders + cancelledOrders) / orderCount) * 100) : 0;
    const daysSinceLastOrder = lastOrder
      ? Math.floor((Date.now() - lastOrder.createdAt.getTime()) / (24 * 60 * 60 * 1000))
      : null;
    const reasons: string[] = [];
    const recommendedActions: string[] = [];
    let score = 20;

    if (storefront?.publishedAt) {
      score += 15;
    } else {
      reasons.push("Storefront is not published.");
      recommendedActions.push("Complete admin approval and publish the QR storefront.");
    }

    score += Math.min(15, approvedListings * 3);
    score += Math.min(10, qrScans);
    score += Math.min(20, completedOrders * 4);
    score += Math.min(10, activeCampaignCount * 5);
    score += Math.min(10, reviewCount * 2);
    score -= Math.min(15, cancellationRejectionRate);

    if (activeCampaignCount === 0) {
      reasons.push("No active campaign is running.");
      recommendedActions.push("Generate a campaign for repeat and first-time customers.");
    }

    if (completedOrders > 0 && reviewCount === 0) {
      reasons.push("Completed orders have not produced reviews yet.");
      recommendedActions.push("Ask completed-order customers to submit a short review.");
    }

    if (daysSinceLastOrder !== null && daysSinceLastOrder > 30) {
      reasons.push("Last order is more than 30 days old.");
      recommendedActions.push("Run a reactivation offer for inactive customers.");
    }

    const boundedScore = Math.max(0, Math.min(100, score));
    const status: VendorHealthStatus =
      boundedScore >= 75 ? "GOOD" : boundedScore >= 45 ? "NEEDS_ATTENTION" : "AT_RISK";

    await prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        healthScore: boundedScore,
        averageRating,
        reviewCount,
        repeatCustomerCount
      }
    });

    await this.eventPublisher.publish({
      type: "VendorHealthScoreUpdated",
      vendorId: vendor.id,
      entityType: "Vendor",
      entityId: vendor.id,
      payload: {
        score: boundedScore,
        status,
        activeCampaignCount,
        reviewCount,
        orderCount,
        qrScans
      }
    });

    return {
      score: boundedScore,
      status,
      reasons,
      recommendedActions,
      metrics: {
        publishedStorefront: Boolean(storefront?.publishedAt),
        approvedListings,
        qrScans,
        ordersReceived: orderCount,
        completedOrders,
        cancellationRejectionRate,
        activeCampaignCount,
        reviewCount,
        averageRating,
        repeatCustomers: repeatCustomerCount,
        daysSinceLastOrder
      }
    };
  }

  private async assertCanReviewOutput(outputId: string, actor: { id: string; role: UserRole }) {
    const vendor = await this.findVendorForActor(actor);
    const output = await prisma.aIOutput.findUniqueOrThrow({
      where: { id: outputId },
      select: { vendorId: true }
    });

    if (output.vendorId !== vendor.id) {
      throw new ForbiddenException("Vendor users can only review AI outputs for their vendor.");
    }
  }

  private async assertCustomerBelongsToVendor(customerProfileId: string, vendorId: string) {
    const profile = await prisma.vendorCustomerProfile.findUniqueOrThrow({
      where: { id: customerProfileId },
      select: { vendorId: true }
    });

    if (profile.vendorId !== vendorId) {
      throw new ForbiddenException("Vendors can only manage their own customers.");
    }
  }

  private async findVendorForActor(actor: { id: string; role: UserRole }) {
    if (actor.role !== UserRole.VENDOR_OWNER && actor.role !== UserRole.VENDOR_STAFF) {
      throw new ForbiddenException("Vendor review requires a vendor role.");
    }

    const vendor = await prisma.vendor.findFirst({
      where: {
        ownerId: actor.id
      }
    });

    if (!vendor) {
      throw new NotFoundException("No vendor is associated with the current mock actor.");
    }

    return vendor;
  }
}

function buildRetentionSuggestion(
  segment: "repeat" | "inactive" | "highValue" | "firstTime",
  customers: Array<{ id: string; name: string }>,
  action: string,
) {
  return {
    segment,
    customerIds: customers.map((customer) => customer.id),
    suggestedActions: [action],
    messageDrafts: customers.slice(0, 3).map((customer) => `${customer.name}, we have a fresh QR pickup offer for you.`)
  };
}
