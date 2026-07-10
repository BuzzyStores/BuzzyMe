import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserRole } from "@buzzystores/types";
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

  @Post()
  @Roles(UserRole.VENDOR_OWNER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  createCampaign(@Body() dto: CreateCampaignDto) {
    return this.campaignsService.createCampaign(dto);
  }
}
