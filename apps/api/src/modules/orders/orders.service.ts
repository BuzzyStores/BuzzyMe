import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import {
  ApprovalStatus,
  DiscountType,
  OrderStatus,
  type Order,
  type Vendor
} from "@prisma/client";
import { prisma } from "@buzzystores/database";
import {
  LifecycleTrigger,
  NotificationChannel,
  UserRole,
  VendorLifecycleStage
} from "@buzzystores/types";
import { EventPublisherService } from "../events/event-publisher.service";
import { VendorLifecycleService } from "../vendor-lifecycle/vendor-lifecycle.service";
import type { CreateOrderDto } from "./dto/create-order.dto";
import type { SubmitReviewDto } from "./dto/submit-review.dto";

@Injectable()
export class OrdersService {
  constructor(
    private readonly eventPublisher: EventPublisherService,
    private readonly lifecycleService: VendorLifecycleService,
  ) {}

  async createOrder(dto: CreateOrderDto) {
    if (dto.fulfilmentMethod !== "PICKUP") {
      throw new BadRequestException("Only pickup orders are supported in Phase 3.");
    }

    if (dto.items.length === 0) {
      throw new BadRequestException("At least one item is required.");
    }

    const vendor = await prisma.vendor.findUniqueOrThrow({
      where: { id: dto.vendorId },
      include: {
        storefront: true,
        owner: true
      }
    });

    if (vendor.lifecycleStage !== VendorLifecycleStage.PUBLISHED || !vendor.storefront?.publishedAt) {
      throw new BadRequestException("Orders can only be placed for published vendors.");
    }

    const listingIds = dto.items.map((item) => item.listingId);
    const listings = await prisma.listing.findMany({
      where: {
        id: { in: listingIds }
      }
    });

    if (listings.length !== new Set(listingIds).size) {
      throw new BadRequestException("One or more listings were not found.");
    }

    const invalidVendorListing = listings.find((listing) => listing.vendorId !== dto.vendorId);
    if (invalidVendorListing) {
      throw new BadRequestException("All order items must belong to the same vendor.");
    }

    const unavailableListing = listings.find(
      (listing) =>
        ![ApprovalStatus.ADMIN_APPROVED, ApprovalStatus.PUBLISHED].includes(listing.approvalStatus) ||
        !listing.publishedAt ||
        !listing.pickupEnabled,
    );
    if (unavailableListing) {
      throw new BadRequestException("All order items must be approved, published, and pickup-enabled.");
    }

    const subtotal = dto.items.reduce((sum, item) => {
      const listing = listings.find((candidate) => candidate.id === item.listingId);
      return sum + Number(listing?.price ?? 0) * item.quantity;
    }, 0);
    const couponApplication = await this.validateCoupon(dto.vendorId, dto.couponCode, subtotal);
    const discountAmount = couponApplication?.discountAmount ?? 0;
    const total = Math.max(0, subtotal - discountAmount);
    const currency = listings[0]?.currency ?? "SEK";
    const orderNumber = `BZ-${Date.now()}`;

    const customer = await prisma.user.upsert({
      where: { phone: dto.customer.phone },
      update: {
        fullName: dto.customer.name,
        ...(dto.customer.email ? { email: dto.customer.email } : {})
      },
      create: {
        fullName: dto.customer.name,
        phone: dto.customer.phone,
        ...(dto.customer.email ? { email: dto.customer.email } : {})
      }
    });

    const order = await prisma.order.create({
      data: {
        orderNumber,
        vendorId: vendor.id,
        customerId: customer.id,
        type: "PICKUP",
        status: OrderStatus.SENT_TO_VENDOR,
        currency,
        subtotal,
        discountTotal: discountAmount,
        discountAmount,
        total,
        ...(couponApplication ? { couponId: couponApplication.coupon.id } : {}),
        ...(dto.customerNote ? { customerNotes: dto.customerNote } : {}),
        ...(dto.requestedPickupTime ? { pickupAt: new Date(dto.requestedPickupTime) } : {}),
        metadata: {
          fulfilmentMethod: "PICKUP",
          paymentStatus: "PAYMENT_NOT_REQUIRED_FOR_PHASE_3",
          customer: dto.customer,
          requestedPickupTime: dto.requestedPickupTime ?? null,
          couponCode: couponApplication?.coupon.code ?? null,
          discountAmount
        },
        items: {
          create: dto.items.map((item) => {
            const listing = listings.find((candidate) => candidate.id === item.listingId);
            const unitPrice = Number(listing?.price ?? 0);

            return {
              listingId: item.listingId,
              titleSnapshot: listing?.title ?? "Listing",
              quantity: item.quantity,
              unitPrice,
              totalPrice: unitPrice * item.quantity
            };
          })
        }
      },
      include: { items: true }
    });

    await prisma.auditLog.create({
      data: {
        vendorId: vendor.id,
        action: "order.placed",
        entityType: "Order",
        entityId: order.id,
        after: {
          orderNumber,
          status: OrderStatus.SENT_TO_VENDOR,
          subtotal,
          discountAmount,
          total
        },
        metadata: {
          paymentStatus: "PAYMENT_NOT_REQUIRED_FOR_PHASE_3"
        }
      }
    });

    await this.eventPublisher.publish({
      type: "OrderPlaced",
      vendorId: vendor.id,
      orderId: order.id,
      entityType: "Order",
      entityId: order.id,
      payload: {
        orderNumber,
        subtotal,
        discountAmount,
        total,
        currency
      }
    });

    await this.upsertCustomerProfileFromCreatedOrder(vendor.id, customer, dto, order.createdAt);

    if (couponApplication) {
      await prisma.coupon.update({
        where: { id: couponApplication.coupon.id },
        data: { usedCount: { increment: 1 } }
      });

      if (couponApplication.coupon.campaignId) {
        await prisma.campaign.update({
          where: { id: couponApplication.coupon.campaignId },
          data: {
            orderCount: { increment: 1 },
            revenue: { increment: total }
          }
        });
      }

      await prisma.auditLog.create({
        data: {
          vendorId: vendor.id,
          action: "coupon.applied",
          entityType: "Coupon",
          entityId: couponApplication.coupon.id,
          after: {
            code: couponApplication.coupon.code,
            discountAmount,
            orderId: order.id
          }
        }
      });

      await prisma.notification.create({
        data: {
          vendorId: vendor.id,
          channel: NotificationChannel.IN_APP,
          templateKey: "coupon.used",
          subject: "Coupon used",
          body: `${couponApplication.coupon.code} was used on order ${order.orderNumber}.`,
          metadata: {
            couponId: couponApplication.coupon.id,
            campaignId: couponApplication.coupon.campaignId,
            orderId: order.id,
            discountAmount
          },
          ...(vendor.owner?.id ? { recipientId: vendor.owner.id } : {})
        }
      });

      await this.eventPublisher.publish({
        type: "CouponApplied",
        vendorId: vendor.id,
        orderId: order.id,
        entityType: "Coupon",
        entityId: couponApplication.coupon.id,
        payload: {
          code: couponApplication.coupon.code,
          discountAmount,
          orderTotal: total
        }
      });
    }

    await this.notifyVendorOrderPlaced(vendor, order);

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotalAmount: Number(order.subtotal),
      discountAmount: Number(order.discountAmount),
      totalAmount: Number(order.total),
      currency: order.currency,
      trackingUrl: `/orders/${order.id}`
    };
  }

  async trackOrder(id: string) {
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }]
      },
      include: {
        vendor: true,
        items: true,
        coupon: true,
        review: true
      }
    });

    if (!order) {
      throw new NotFoundException("Order not found.");
    }

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      vendorName: order.vendor.name,
      status: order.status,
      fulfilmentMethod: "PICKUP",
      items: order.items.map((item) => ({
        title: item.titleSnapshot,
        quantity: item.quantity,
        lineTotal: Number(item.totalPrice)
      })),
      subtotalAmount: Number(order.subtotal),
      discountAmount: Number(order.discountAmount),
      totalAmount: Number(order.total),
      currency: order.currency,
      couponCode: order.coupon?.code ?? null,
      reviewSubmitted: Boolean(order.review),
      canReview: order.status === OrderStatus.COMPLETED && !order.review,
      ...(order.customerNotes ? { customerNote: order.customerNotes } : {}),
      requestedPickupTime: order.pickupAt?.toISOString(),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
    };
  }

  listOrdersForVendor(vendorId: string) {
    return prisma.order.findMany({
      where: { vendorId },
      include: {
        customer: {
          select: {
            fullName: true,
            phone: true,
            email: true
          }
        },
        items: true
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async acceptOrder(orderId: string, vendorId: string, actor: { id: string; role: UserRole }) {
    return this.transitionVendorOrder(orderId, vendorId, actor, OrderStatus.ACCEPTED, "OrderAccepted", {
      customerTemplateKey: "order.accepted",
      auditAction: "order.accepted"
    });
  }

  async rejectOrder(orderId: string, vendorId: string, actor: { id: string; role: UserRole }, reason?: string) {
    return this.transitionVendorOrder(orderId, vendorId, actor, OrderStatus.REJECTED, "OrderRejected", {
      customerTemplateKey: "order.rejected",
      auditAction: "order.rejected",
      metadata: { reason: reason ?? null }
    });
  }

  async markReadyForPickup(orderId: string, vendorId: string, actor: { id: string; role: UserRole }) {
    return this.transitionVendorOrder(orderId, vendorId, actor, OrderStatus.READY_FOR_PICKUP, "OrderReadyForPickup", {
      customerTemplateKey: "order.ready",
      auditAction: "order.ready_for_pickup"
    });
  }

  async completeOrder(orderId: string, vendorId: string, actor: { id: string; role: UserRole }) {
    const order = await this.transitionVendorOrder(orderId, vendorId, actor, OrderStatus.COMPLETED, "OrderCompleted", {
      customerTemplateKey: "order.completed",
      auditAction: "order.completed"
    });

    await this.updateCustomerProfileFromCompletedOrder(order);

    await this.createCustomerNotification(order, "review.request", "How was your order?", "Tell us how your pickup went.");
    await this.eventPublisher.publish({
      type: "ReviewRequested",
      vendorId,
      orderId: order.id,
      entityType: "Order",
      entityId: order.id,
      payload: {
        orderNumber: order.orderNumber
      }
    });

    const vendor = await prisma.vendor.findUniqueOrThrow({ where: { id: vendorId } });
    if (
      ![
        VendorLifecycleStage.FIRST_ORDER_RECEIVED,
        VendorLifecycleStage.ACTIVE,
        VendorLifecycleStage.AT_RISK,
        VendorLifecycleStage.DORMANT,
        VendorLifecycleStage.CHURNED,
        VendorLifecycleStage.REACTIVATION
      ].includes(vendor.lifecycleStage)
    ) {
      await this.lifecycleService.transitionVendorStage(vendorId, VendorLifecycleStage.FIRST_ORDER_RECEIVED, {
        actorId: actor.id,
        actorRole: actor.role,
        trigger: LifecycleTrigger.SYSTEM,
        reason: "First completed order received.",
        nextAction: "Request review and suggest the next campaign.",
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber
        }
      });
    }

    await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        healthScore: Math.max(vendor.healthScore, 80),
        activationScore: Math.max(vendor.activationScore, 85)
      }
    });

    return order;
  }

  async submitReview(orderId: string, dto: SubmitReviewDto) {
    const order = await prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: {
        customer: true,
        review: true,
        vendor: true
      }
    });

    if (order.status !== OrderStatus.COMPLETED) {
      throw new BadRequestException("Reviews can only be submitted for completed orders.");
    }

    if (order.review) {
      throw new BadRequestException("Only one review can be submitted per order.");
    }

    const review = await prisma.review.create({
      data: {
        orderId: order.id,
        vendorId: order.vendorId,
        customerId: order.customerId,
        rating: dto.rating,
        comment: dto.comment,
        approved: true
      }
    });

    await this.refreshVendorReviewSummary(order.vendorId);

    await prisma.auditLog.create({
      data: {
        vendorId: order.vendorId,
        action: "review.submitted",
        entityType: "Review",
        entityId: review.id,
        after: {
          orderId: order.id,
          rating: dto.rating,
          approved: true
        }
      }
    });

    await prisma.notification.create({
      data: {
        vendorId: order.vendorId,
        channel: NotificationChannel.IN_APP,
        templateKey: "review.submitted",
        subject: "New customer review",
        body: `${order.orderNumber} received a ${dto.rating}-star review.`,
        metadata: {
          orderId: order.id,
          reviewId: review.id,
          rating: dto.rating
        },
        ...(order.vendor.ownerId ? { recipientId: order.vendor.ownerId } : {})
      }
    });

    await this.eventPublisher.publish({
      type: "ReviewSubmitted",
      vendorId: order.vendorId,
      orderId: order.id,
      entityType: "Review",
      entityId: review.id,
      payload: {
        rating: dto.rating,
        approved: true
      }
    });

    return review;
  }

  private async transitionVendorOrder(
    orderId: string,
    vendorId: string,
    actor: { id: string; role: UserRole },
    nextStatus: OrderStatus,
    eventType: "OrderAccepted" | "OrderRejected" | "OrderReadyForPickup" | "OrderCompleted",
    options: {
      customerTemplateKey: string;
      auditAction: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    const order = await prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: {
        customer: true,
        vendor: true,
        items: true
      }
    });

    if (order.vendorId !== vendorId) {
      throw new ForbiddenException("Vendors can only manage their own orders.");
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: nextStatus,
        metadata: {
          ...(isRecord(order.metadata) ? order.metadata : {}),
          lastStatusReason: options.metadata?.reason ?? null,
          lastStatusAt: new Date().toISOString()
        }
      },
      include: {
        customer: true,
        vendor: true,
        items: true
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        actorRole: actor.role,
        vendorId,
        action: options.auditAction,
        entityType: "Order",
        entityId: order.id,
        before: { status: order.status },
        after: { status: nextStatus },
        metadata: options.metadata ?? {}
      }
    });

    await this.eventPublisher.publish({
      type: eventType,
      vendorId,
      orderId: order.id,
      entityType: "Order",
      entityId: order.id,
      payload: {
        orderNumber: order.orderNumber,
        status: nextStatus,
        ...(options.metadata ?? {})
      }
    });

    await this.createCustomerNotification(
      updated,
      options.customerTemplateKey,
      `Order ${updated.orderNumber} update`,
      `Your order is now ${nextStatus}.`,
    );

    return updated;
  }

  private async validateCoupon(vendorId: string, couponCode: string | undefined, subtotal: number) {
    if (!couponCode) {
      return null;
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.trim().toUpperCase() },
      include: { campaign: true }
    });

    if (!coupon || coupon.vendorId !== vendorId) {
      throw new BadRequestException("Invalid coupon for this vendor.");
    }

    const now = new Date();
    if (!coupon.active || (coupon.startsAt && coupon.startsAt > now) || (coupon.endsAt && coupon.endsAt < now)) {
      throw new BadRequestException("Coupon is not active.");
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException("Coupon usage limit reached.");
    }

    if (subtotal < Number(coupon.minimumOrderAmount)) {
      throw new BadRequestException("Order does not meet the coupon minimum order amount.");
    }

    if (coupon.campaign && coupon.campaign.status !== "ACTIVE") {
      throw new BadRequestException("Coupon campaign is not active.");
    }

    const discountAmount =
      coupon.discountType === DiscountType.PERCENTAGE
        ? Math.min(subtotal, Math.round(subtotal * (Number(coupon.discountValue) / 100)))
        : Math.min(subtotal, Number(coupon.discountValue));

    return {
      coupon,
      discountAmount
    };
  }

  private async upsertCustomerProfileFromCreatedOrder(
    vendorId: string,
    customer: { id: string; fullName: string; phone: string | null; email: string | null },
    dto: CreateOrderDto,
    orderDate: Date,
  ) {
    const phone = customer.phone ?? dto.customer.phone;
    const existing = await prisma.vendorCustomerProfile.findUnique({
      where: {
        vendorId_phone: {
          vendorId,
          phone
        }
      }
    });
    const profile = await prisma.vendorCustomerProfile.upsert({
      where: {
        vendorId_phone: {
          vendorId,
          phone
        }
      },
      update: {
        customerId: customer.id,
        name: dto.customer.name,
        email: dto.customer.email ?? customer.email,
        firstOrderDate: existing?.firstOrderDate ?? orderDate,
        preferredFulfilment: dto.fulfilmentMethod
      },
      create: {
        vendorId,
        customerId: customer.id,
        name: dto.customer.name,
        phone,
        email: dto.customer.email ?? customer.email,
        firstOrderDate: orderDate,
        preferredFulfilment: dto.fulfilmentMethod,
        marketingConsent: false
      }
    });

    await this.eventPublisher.publish({
      type: existing ? "CustomerProfileUpdated" : "CustomerProfileCreated",
      vendorId,
      entityType: "VendorCustomerProfile",
      entityId: profile.id,
      payload: {
        phone,
        orderLifecycle: "created"
      }
    });

    return profile;
  }

  private async updateCustomerProfileFromCompletedOrder(
    order: Order & { customer?: { id: string; fullName: string; phone: string | null; email: string | null } | null },
  ) {
    if (!order.customer?.phone) {
      return null;
    }

    const existing = await prisma.vendorCustomerProfile.findUnique({
      where: {
        vendorId_phone: {
          vendorId: order.vendorId,
          phone: order.customer.phone
        }
      }
    });
    const profile = await prisma.vendorCustomerProfile.upsert({
      where: {
        vendorId_phone: {
          vendorId: order.vendorId,
          phone: order.customer.phone
        }
      },
      update: {
        customerId: order.customer.id,
        name: order.customer.fullName,
        email: order.customer.email,
        orderCount: { increment: 1 },
        totalSpend: { increment: Number(order.total) },
        lastOrderDate: new Date(),
        firstOrderDate: existing?.firstOrderDate ?? order.createdAt,
        preferredFulfilment: String(isRecord(order.metadata) ? order.metadata.fulfilmentMethod ?? "PICKUP" : "PICKUP")
      },
      create: {
        vendorId: order.vendorId,
        customerId: order.customer.id,
        name: order.customer.fullName,
        phone: order.customer.phone,
        email: order.customer.email,
        orderCount: 1,
        totalSpend: Number(order.total),
        firstOrderDate: order.createdAt,
        lastOrderDate: new Date(),
        preferredFulfilment: "PICKUP"
      }
    });

    const repeatCustomerCount = await prisma.vendorCustomerProfile.count({
      where: {
        vendorId: order.vendorId,
        orderCount: { gte: 2 }
      }
    });

    await prisma.vendor.update({
      where: { id: order.vendorId },
      data: { repeatCustomerCount }
    });

    await this.eventPublisher.publish({
      type: "CustomerProfileUpdated",
      vendorId: order.vendorId,
      orderId: order.id,
      entityType: "VendorCustomerProfile",
      entityId: profile.id,
      payload: {
        orderLifecycle: "completed",
        totalSpend: Number(profile.totalSpend)
      }
    });

    return profile;
  }

  private async refreshVendorReviewSummary(vendorId: string) {
    const aggregate = await prisma.review.aggregate({
      where: { vendorId, approved: true },
      _avg: { rating: true },
      _count: { rating: true }
    });

    await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        averageRating: aggregate._avg.rating ?? 0,
        reviewCount: aggregate._count.rating
      }
    });
  }

  private async notifyVendorOrderPlaced(vendor: Vendor & { owner?: { id: string } | null }, order: Order) {
    await prisma.notification.create({
      data: {
        vendorId: vendor.id,
        channel: NotificationChannel.IN_APP,
        templateKey: "order.received",
        status: "QUEUED",
        subject: "New pickup order",
        body: `Order ${order.orderNumber} is waiting for vendor review.`,
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber
        },
        ...(vendor.owner?.id ? { recipientId: vendor.owner.id } : {})
      }
    });
  }

  private async createCustomerNotification(
    order: Order & { customer?: { id: string } | null },
    templateKey: string,
    subject: string,
    body: string,
  ) {
    await prisma.notification.create({
      data: {
        vendorId: order.vendorId,
        channel: NotificationChannel.IN_APP,
        templateKey,
        status: "QUEUED",
        subject,
        body,
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber
        },
        ...(order.customer?.id ? { recipientId: order.customer.id } : {})
      }
    });
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
