import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserRole } from "@buzzystores/types";
import { CurrentActor, type CurrentActor as CurrentActorValue } from "../../common/guards/current-actor.decorator";
import { Roles } from "../../common/guards/roles.decorator";
import { CampaignsService } from "./campaigns.service";
import { CreateCampaignDto } from "./dto/create-campaign.dto";

@ApiTags("campaigns")
@Controller("campaigns")
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get("vendors/:vendorId")
  listVendorCampaigns(@Param("vendorId") vendorId: string) {
    return this.campaignsService.listVendorCampaigns(vendorId);
  }

  @Get(":id/public")
  getPublicCampaign(@Param("id") id: string) {
    return this.campaignsService.getPublicCampaign(id);
  }

  @Post()
  @Roles(UserRole.VENDOR_OWNER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  createCampaign(@Body() dto: CreateCampaignDto, @CurrentActor() actor: CurrentActorValue) {
    return this.campaignsService.createCampaign(dto, actor);
  }
}
