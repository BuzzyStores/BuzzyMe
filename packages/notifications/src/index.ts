import { NotificationChannel } from "@buzzystores/types";

export type NotificationTemplateKey =
  | "vendor.onboarding"
  | "vendor.missing_information"
  | "vendor.store_drafted"
  | "vendor.store_approved"
  | "qr.generated"
  | "campaign.ready"
  | "order.received"
  | "order.accepted"
  | "order.ready"
  | "delivery.update"
  | "review.request"
  | "vendor.inactivity"
  | "payout.update"
  | "support.ticket_update";

export type NotificationMessage = {
  channel: NotificationChannel;
  recipient: string;
  templateKey: NotificationTemplateKey;
  subject?: string;
  body: string;
  metadata?: Record<string, unknown>;
};

export interface NotificationProvider {
  readonly name: string;
  send(message: NotificationMessage): Promise<{ providerMessageId: string; status: "queued" | "sent" }>;
}

export class MockNotificationProvider implements NotificationProvider {
  readonly name = "mock";

  async send(_message: NotificationMessage): Promise<{ providerMessageId: string; status: "queued" }> {
    return {
      providerMessageId: `mock-${Date.now()}`,
      status: "queued"
    };
  }
}
