import { IsEnum, IsOptional, IsString } from "class-validator";
import { VendorLifecycleStage } from "@buzzystores/types";

export class AdvanceLifecycleDto {
  @IsEnum(VendorLifecycleStage)
  toStage!: VendorLifecycleStage;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  nextAction?: string;
}
