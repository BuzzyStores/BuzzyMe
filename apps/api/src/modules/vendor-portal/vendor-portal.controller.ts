import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserRole } from "@buzzystores/types";
import { CurrentActor, type CurrentActor as CurrentActorValue } from "../../common/guards/current-actor.decorator";
import { Roles } from "../../common/guards/roles.decorator";
import { RejectOrderDto } from "../orders/dto/reject-order.dto";
import { RequestAiOutputChangesDto } from "./dto/request-ai-output-changes.dto";
import { VendorPortalService } from "./vendor-portal.service";

@ApiTags("vendor")
@Controller("vendor")
@Roles(UserRole.VENDOR_OWNER, UserRole.VENDOR_STAFF)
export class VendorPortalController {
  constructor(private readonly vendorPortalService: VendorPortalService) {}

  @Get("me/ai-outputs")
  listMyAiOutputs(@CurrentActor() actor: CurrentActorValue) {
    return this.vendorPortalService.listMyAiOutputs(actor);
  }

  @Post("ai-outputs/:id/approve")
  approveAiOutput(@Param("id") id: string, @CurrentActor() actor: CurrentActorValue) {
    return this.vendorPortalService.approveAiOutput(id, actor);
  }

  @Post("ai-outputs/:id/request-changes")
  requestChanges(
    @Param("id") id: string,
    @Body() dto: RequestAiOutputChangesDto,
    @CurrentActor() actor: CurrentActorValue,
  ) {
    return this.vendorPortalService.requestChanges(id, actor, dto.reason);
  }

  @Get("orders")
  listOrders(@CurrentActor() actor: CurrentActorValue) {
    return this.vendorPortalService.listOrders(actor);
  }

  @Post("orders/:id/accept")
  acceptOrder(@Param("id") id: string, @CurrentActor() actor: CurrentActorValue) {
    return this.vendorPortalService.acceptOrder(id, actor);
  }

  @Post("orders/:id/reject")
  rejectOrder(
    @Param("id") id: string,
    @Body() dto: RejectOrderDto,
    @CurrentActor() actor: CurrentActorValue,
  ) {
    return this.vendorPortalService.rejectOrder(id, actor, dto.reason);
  }

  @Post("orders/:id/ready")
  markReady(@Param("id") id: string, @CurrentActor() actor: CurrentActorValue) {
    return this.vendorPortalService.markReady(id, actor);
  }

  @Post("orders/:id/complete")
  completeOrder(@Param("id") id: string, @CurrentActor() actor: CurrentActorValue) {
    return this.vendorPortalService.completeOrder(id, actor);
  }
}
