import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { prisma } from "@buzzystores/database";
import { LifecycleTrigger, UserRole, VendorLifecycleStage } from "@buzzystores/types";
import type { AdvanceLifecycleDto } from "./dto/advance-lifecycle.dto";

@Injectable()
export class VendorLifecycleService {
  async getLifecycle(vendorId: string) {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: {
        id: true,
        lifecycleStage: true,
        activationScore: true,
        healthScore: true,
        nextAction: true
      }
    });

    return {
      vendorId,
      currentStage: vendor?.lifecycleStage ?? VendorLifecycleStage.LEAD_IDENTIFIED,
      activationScore: vendor?.activationScore ?? 0,
      healthScore: vendor?.healthScore ?? 0,
      nextAction: vendor?.nextAction ?? null,
      history: await this.getVendorLifecycleTimeline(vendorId)
    };
  }

  async advanceLifecycle(vendorId: string, dto: AdvanceLifecycleDto) {
    return this.transitionVendorStage(vendorId, dto.toStage, {
      reason: dto.note ?? "Manual lifecycle advance",
      nextAction: dto.nextAction,
      trigger: LifecycleTrigger.ADMIN,
      actorRole: UserRole.ADMIN
    });
  }

  async transitionVendorStage(
    vendorId: string,
    nextStage: VendorLifecycleStage,
    metadata: {
      reason?: string;
      nextAction?: string;
      trigger?: LifecycleTrigger;
      actorId?: string;
      actorRole?: UserRole;
      metadata?: Record<string, unknown>;
    } = {},
  ) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const vendor = await tx.vendor.findUniqueOrThrow({
        where: { id: vendorId },
        select: {
          id: true,
          lifecycleStage: true,
          nextAction: true
        }
      });

      const event = await this.createLifecycleEvent(
        vendorId,
        vendor.lifecycleStage as VendorLifecycleStage,
        nextStage,
        metadata.reason ?? `Lifecycle moved to ${nextStage}.`,
        {
          nextAction: metadata.nextAction,
          trigger: metadata.trigger ?? LifecycleTrigger.SYSTEM,
          actorId: metadata.actorId,
          metadata: metadata.metadata,
          tx
        },
      );

      const updatedVendor = await tx.vendor.update({
        where: { id: vendorId },
        data: {
          lifecycleStage: nextStage,
          lastContactAt: new Date(),
          ...(metadata.nextAction ? { nextAction: metadata.nextAction } : {})
        }
      });

      await tx.auditLog.create({
        data: {
          vendorId,
          action: "vendor.lifecycle_stage_changed",
          entityType: "Vendor",
          entityId: vendorId,
          before: { lifecycleStage: vendor.lifecycleStage },
          after: { lifecycleStage: nextStage },
          metadata: {
            reason: metadata.reason ?? null,
            trigger: metadata.trigger ?? LifecycleTrigger.SYSTEM,
            ...(metadata.metadata ?? {})
          },
          ...(metadata.actorId ? { actorId: metadata.actorId } : {}),
          ...(metadata.actorRole ? { actorRole: metadata.actorRole } : {})
        }
      });

      return {
        vendor: updatedVendor,
        event
      };
    });
  }

  async createLifecycleEvent(
    vendorId: string,
    fromStage: VendorLifecycleStage | null,
    toStage: VendorLifecycleStage,
    reason: string,
    options: {
      nextAction?: string;
      trigger?: LifecycleTrigger;
      actorId?: string;
      metadata?: Record<string, unknown>;
      tx?: Prisma.TransactionClient;
    } = {},
  ) {
    const client = options.tx ?? prisma;

    return client.vendorLifecycleEvent.create({
      data: {
        vendorId,
        fromStage,
        toStage,
        note: reason,
        source: options.trigger ?? LifecycleTrigger.SYSTEM,
        trigger: options.trigger ?? LifecycleTrigger.SYSTEM,
        ...(options.nextAction ? { nextAction: options.nextAction } : {}),
        ...(options.metadata ? { metadata: options.metadata } : {}),
        ...(options.actorId ? { createdById: options.actorId } : {})
      }
    });
  }

  async getVendorLifecycleTimeline(vendorId: string) {
    return prisma.vendorLifecycleEvent.findMany({
      where: { vendorId },
      orderBy: { occurredAt: "asc" }
    });
  }
}
