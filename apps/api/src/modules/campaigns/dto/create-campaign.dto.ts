import { IsEnum, IsOptional, IsString } from "class-validator";
import { CampaignType } from "@buzzystores/types";

export class CreateCampaignDto {
  @IsString()
  vendorId!: string;

  @IsString()
  name!: string;

  @IsEnum(CampaignType)
  type!: CampaignType;

  @IsOptional()
  @IsString()
  targetAudience?: string;
}
