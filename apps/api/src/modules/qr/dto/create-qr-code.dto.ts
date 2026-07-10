import { IsOptional, IsString, IsUrl } from "class-validator";

export class CreateQrCodeDto {
  @IsString()
  vendorId!: string;

  @IsUrl()
  targetUrl!: string;

  @IsOptional()
  @IsString()
  campaignId?: string;
}
