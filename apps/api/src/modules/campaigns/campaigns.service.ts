import { Injectable } from "@nestjs/common";
import { ApprovalStatus, CampaignType } from "@buzzystores/types";
import { slugify } from "@buzzystores/utils";
import type { CreateCampaignDto } from "./dto/create-campaign.dto";

@Injectable()
export class CampaignsService {
  listVendorCampaigns(vendorId: string) {
    return [
      {
        id: "sample-campaign",
        vendorId,
        name: "Weekend Family Jollof Bundle",
        type: CampaignType.FAMILY_BUNDLE,
        status: ApprovalStatus.AI_GENERATED
      }
    ];
  }

  createCampaign(dto: CreateCampaignDto) {
    return {
      id: "pending-db-write",
      slug: slugify(dto.name),
      approvalStatus: ApprovalStatus.DRAFT,
      ...dto
    };
  }
}
