import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import {
  ApprovalStatus,
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
        total: subtotal,
        ...(dto.customerNote ? { customerNotes: dto.customerNote } : {}),
        ...(dto.requestedPickupTime ? { pickupAt: new Date(dto.requestedPickupTime) } : {}),
        metadata: {
          fulfilmentMethod: "PICKUP",
          paymentStatus: "PAYMENT_NOT_REQUIRED_FOR_PHASE_3",
          customer: dto.customer,
          requestedPickupTime: dto.requestedPickupTime ?? null
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
          total: subtotal
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
        total: subtotal,
        currency
      }
    });

    await this.notifyVendorOrderPlaced(vendor, order);

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
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
        items: true
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
      totalAmount: Number(order.total),
      currency: order.currency,
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
