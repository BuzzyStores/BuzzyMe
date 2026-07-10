import { IsOptional, IsString } from "class-validator";

export class RejectAiOutputDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
