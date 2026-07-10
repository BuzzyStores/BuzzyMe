import { Injectable } from "@nestjs/common";
import type { CreateAuditLogDto } from "./dto/create-audit-log.dto";

@Injectable()
export class AuditService {
  listAuditLogs() {
    return [
      {
        id: "sample-audit-log",
        action: "vendor.seeded",
        entityType: "Vendor",
        entityId: "sample-vendor",
        createdAt: "2026-07-01T12:00:00.000Z"
      }
    ];
  }

  createAuditLog(dto: CreateAuditLogDto) {
    return {
      id: "pending-db-write",
      createdAt: new Date().toISOString(),
      ...dto
    };
  }
}
