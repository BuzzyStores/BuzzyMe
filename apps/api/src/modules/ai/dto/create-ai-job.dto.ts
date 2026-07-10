import { IsIn, IsObject, IsOptional, IsString } from "class-validator";
import type { AiAgentType } from "@buzzystores/ai";

const agentTypes: AiAgentType[] = [
  "vendor-intake",
  "catalogue-builder",
  "storefront-copy",
  "campaign",
  "translation",
  "support",
  "vendor-health"
];

export class CreateAiJobDto {
  @IsIn(agentTypes)
  agentType!: AiAgentType;

  @IsObject()
  sourceInput!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  vendorId?: string;

  @IsOptional()
  @IsString()
  promptVersion?: string;
}
