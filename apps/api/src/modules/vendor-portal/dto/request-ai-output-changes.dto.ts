import { IsOptional, IsString } from "class-validator";

export class RequestAiOutputChangesDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
