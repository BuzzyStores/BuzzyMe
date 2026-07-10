import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserRole } from "@buzzystores/types";
import { Roles } from "../../common/guards/roles.decorator";
import { AdvanceLifecycleDto } from "./dto/advance-lifecycle.dto";
import { VendorLifecycleService } from "./vendor-lifecycle.service";

@ApiTags("vendor-lifecycle")
@Controller("vendor-lifecycle")
export class VendorLifecycleController {
  constructor(private readonly lifecycleService: VendorLifecycleService) {}

  @Get(":vendorId")
  getLifecycle(@Param("vendorId") vendorId: string) {
    return this.lifecycleService.getLifecycle(vendorId);
  }

  @Post(":vendorId/advance")
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.AMBASSADOR)
  advanceLifecycle(@Param("vendorId") vendorId: string, @Body() dto: AdvanceLifecycleDto) {
    return this.lifecycleService.advanceLifecycle(vendorId, dto);
  }
}
