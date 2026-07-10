import { IsEmail, IsEnum, IsObject, IsOptional, IsString } from "class-validator";
import { NotificationChannel } from "@buzzystores/types";

export class SendNotificationDto {
  @IsEnum(NotificationChannel)
  channel!: NotificationChannel;

  @IsEmail()
  recipient!: string;

  @IsString()
  templateKey!: string;

  @IsString()
  body!: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
