import { IsOptional, IsString } from "class-validator";

export class RejectCampaignDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
