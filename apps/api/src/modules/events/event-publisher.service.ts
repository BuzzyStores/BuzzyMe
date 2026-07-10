import { Injectable } from "@nestjs/common";
import { prisma } from "@buzzystores/database";
import type { PublishEventInput } from "./event.types";

@Injectable()
export class EventPublisherService {
  async publish(input: PublishEventInput) {
    return prisma.platformEvent.create({
      data: {
        type: input.type,
        ...(input.vendorId ? { vendorId: input.vendorId } : {}),
        ...(input.orderId ? { orderId: input.orderId } : {}),
        ...(input.entityType ? { entityType: input.entityType } : {}),
        ...(input.entityId ? { entityId: input.entityId } : {}),
        ...(input.payload ? { payload: input.payload } : {})
      }
    });
  }
}
