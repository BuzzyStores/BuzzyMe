import { Body, Controller, Get, Headers, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserRole } from "@buzzystores/types";
import { Roles } from "../../common/guards/roles.decorator";
import { CreateQrCodeDto } from "./dto/create-qr-code.dto";
import { QrService } from "./qr.service";

@ApiTags("qr")
@Controller("qr")
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Get(":shortCode")
  resolveShortCode(@Param("shortCode") shortCode: string) {
    return this.qrService.resolveShortCode(shortCode);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.VENDOR_OWNER)
  createQrCode(@Body() dto: CreateQrCodeDto) {
    return this.qrService.createQrCode(dto);
  }

  @Post(":shortCode/scan")
  recordScan(
    @Param("shortCode") shortCode: string,
    @Headers("user-agent") userAgent?: string,
    @Headers("referer") referrer?: string,
  ) {
    return this.qrService.recordScan(shortCode, { userAgent, referrer });
  }
}
