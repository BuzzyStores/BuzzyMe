import { Injectable } from "@nestjs/common";
import { MockNotificationProvider } from "@buzzystores/notifications";
import type { SendNotificationDto } from "./dto/send-notification.dto";

@Injectable()
export class NotificationsService {
  private readonly provider = new MockNotificationProvider();

  async send(dto: SendNotificationDto) {
    return this.provider.send({
      channel: dto.channel,
      recipient: dto.recipient,
      templateKey: dto.templateKey as never,
      body: dto.body,
      ...(dto.subject ? { subject: dto.subject } : {}),
      ...(dto.metadata ? { metadata: dto.metadata } : {})
    });
  }
}
