import { Injectable } from "@nestjs/common";
import { prisma } from "@buzzystores/database";
import { shortCode } from "@buzzystores/utils";
import { EventPublisherService } from "../events/event-publisher.service";
import type { CreateQrCodeDto } from "./dto/create-qr-code.dto";

@Injectable()
export class QrService {
  constructor(private readonly eventPublisher: EventPublisherService) {}

  async resolveShortCode(shortCodeValue: string) {
    const qrCode = await prisma.qRCode.findFirst({
      where: {
        OR: [{ shortCode: shortCodeValue }, { storefront: { shortCode: shortCodeValue } }]
      },
      include: {
        storefront: true,
        vendor: true
      }
    });

    return {
      shortCode: shortCodeValue,
      targetUrl: qrCode?.targetUrl ?? (qrCode?.storefront ? `/vendor/${qrCode.vendor.slug}` : "/")
    };
  }

  createQrCode(dto: CreateQrCodeDto) {
    const code = shortCode("qr");

    return {
      id: "pending-db-write",
      shortCode: code,
      imageUrl: `/qr/${code}.svg`,
      posterUrl: `/posters/${code}.pdf`,
      ...dto
    };
  }

  async recordScan(shortCodeValue: string, input: { userAgent?: string; referrer?: string }) {
    const qrCode = await prisma.qRCode.findFirst({
      where: {
        OR: [{ shortCode: shortCodeValue }, { storefront: { shortCode: shortCodeValue } }]
      },
      include: {
        storefront: true
      }
    });

    if (!qrCode) {
      return {
        shortCode: shortCodeValue,
        recorded: false
      };
    }

    const scan = await prisma.$transaction(async (tx) => {
      await tx.qRCode.update({
        where: { id: qrCode.id },
        data: {
          scanCount: {
            increment: 1
          }
        }
      });

      return tx.qRCodeScan.create({
        data: {
          qrCodeId: qrCode.id,
          shortCode: shortCodeValue,
          ...(input.userAgent ? { userAgent: input.userAgent.slice(0, 256) } : {}),
          ...(input.referrer ? { referrer: input.referrer.slice(0, 512) } : {})
        }
      });
    });

    await this.eventPublisher.publish({
      type: "QRCodeScanned",
      vendorId: qrCode.vendorId,
      entityType: "QRCode",
      entityId: qrCode.id,
      payload: {
        shortCode: shortCodeValue,
        storefrontId: qrCode.storefrontId,
        scanId: scan.id
      }
    });

    return {
      shortCode: shortCodeValue,
      recorded: true,
      scanId: scan.id
    };
  }
}
