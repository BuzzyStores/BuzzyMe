import { IsEnum, IsIn, IsOptional, IsString } from "class-validator";
import { CampaignType } from "@buzzystores/types";

export class GenerateCampaignDto {
  @IsEnum(CampaignType)
  campaignType!: CampaignType;

  @IsOptional()
  @IsString()
  instruction?: string;

  @IsOptional()
  @IsIn(["en", "sv"])
  language?: "en" | "sv";
}
