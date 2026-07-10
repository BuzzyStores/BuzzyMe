import { IsObject, IsOptional, IsString } from "class-validator";

export class CreateAuditLogDto {
  @IsString()
  action!: string;

  @IsString()
  entityType!: string;

  @IsString()
  entityId!: string;

  @IsOptional()
  @IsString()
  actorId?: string;

  @IsOptional()
  @IsObject()
  before?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  after?: Record<string, unknown>;
}
