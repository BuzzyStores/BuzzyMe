import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserRole } from "@buzzystores/types";
import { CurrentActor, type CurrentActor as CurrentActorValue } from "../../common/guards/current-actor.decorator";
import { Roles } from "../../common/guards/roles.decorator";
import { CreateCampaignDto } from "../campaigns/dto/create-campaign.dto";
import { GenerateCampaignDto } from "../campaigns/dto/generate-campaign.dto";
import { RejectOrderDto } from "../orders/dto/reject-order.dto";
import { CustomerNotesDto } from "./dto/customer-notes.dto";
import { CustomerTagsDto } from "./dto/customer-tags.dto";
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

  @Get("campaigns")
  listCampaigns(@CurrentActor() actor: CurrentActorValue) {
    return this.vendorPortalService.listCampaigns(actor);
  }

  @Post("campaigns")
  createCampaign(@Body() dto: CreateCampaignDto, @CurrentActor() actor: CurrentActorValue) {
    return this.vendorPortalService.createCampaign(dto, actor);
  }

  @Post("campaigns/generate")
  generateCampaign(@Body() dto: GenerateCampaignDto, @CurrentActor() actor: CurrentActorValue) {
    return this.vendorPortalService.generateCampaign(dto, actor);
  }

  @Get("campaigns/:id")
  getCampaign(@Param("id") id: string, @CurrentActor() actor: CurrentActorValue) {
    return this.vendorPortalService.getCampaign(id, actor);
  }

  @Post("campaigns/:id/approve")
  approveCampaign(@Param("id") id: string, @CurrentActor() actor: CurrentActorValue) {
    return this.vendorPortalService.approveCampaign(id, actor);
  }

  @Post("campaigns/:id/pause")
  pauseCampaign(@Param("id") id: string, @CurrentActor() actor: CurrentActorValue) {
    return this.vendorPortalService.pauseCampaign(id, actor);
  }

  @Post("campaigns/:id/end")
  endCampaign(@Param("id") id: string, @CurrentActor() actor: CurrentActorValue) {
    return this.vendorPortalService.endCampaign(id, actor);
  }

  @Get("customers")
  listCustomers(@CurrentActor() actor: CurrentActorValue) {
    return this.vendorPortalService.listCustomers(actor);
  }

  @Get("customers/retention-suggestions")
  retentionSuggestions(@CurrentActor() actor: CurrentActorValue) {
    return this.vendorPortalService.getRetentionSuggestions(actor);
  }

  @Get("customers/:id")
  getCustomer(@Param("id") id: string, @CurrentActor() actor: CurrentActorValue) {
    return this.vendorPortalService.getCustomer(id, actor);
  }

  @Post("customers/:id/tags")
  updateCustomerTags(
    @Param("id") id: string,
    @Body() dto: CustomerTagsDto,
    @CurrentActor() actor: CurrentActorValue,
  ) {
    return this.vendorPortalService.updateCustomerTags(id, dto.tags, actor);
  }

  @Post("customers/:id/notes")
  updateCustomerNotes(
    @Param("id") id: string,
    @Body() dto: CustomerNotesDto,
    @CurrentActor() actor: CurrentActorValue,
  ) {
    return this.vendorPortalService.updateCustomerNotes(id, dto.notes, actor);
  }

  @Get("health")
  getHealth(@CurrentActor() actor: CurrentActorValue) {
    return this.vendorPortalService.getHealth(actor);
  }
}
