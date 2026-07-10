import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { prisma } from "@buzzystores/database";
import { UserRole } from "@buzzystores/types";
import { AiService } from "../ai/ai.service";
import { OrdersService } from "../orders/orders.service";

@Injectable()
export class VendorPortalService {
  constructor(
    private readonly aiService: AiService,
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
