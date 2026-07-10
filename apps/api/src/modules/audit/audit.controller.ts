import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserRole } from "@buzzystores/types";
import { Roles } from "../../common/guards/roles.decorator";
import { AuditService } from "./audit.service";
import { CreateAuditLogDto } from "./dto/create-audit-log.dto";

@ApiTags("audit")
@Controller("audit-logs")
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  listAuditLogs() {
    return this.auditService.listAuditLogs();
  }

  @Post()
  createAuditLog(@Body() dto: CreateAuditLogDto) {
    return this.auditService.createAuditLog(dto);
  }
}
