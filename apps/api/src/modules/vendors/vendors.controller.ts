import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserRole } from "@buzzystores/types";
import { Roles } from "../../common/guards/roles.decorator";
import { CreateVendorDto } from "./dto/create-vendor.dto";
import { RegisterVendorDto } from "./dto/register-vendor.dto";
import { VendorsService } from "./vendors.service";

@ApiTags("vendors")
@Controller("vendors")
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Get()
  listVendors() {
    return this.vendorsService.listPublicVendors();
  }

  @Get(":id/lifecycle")
  getVendorLifecycle(@Param("id") id: string) {
    return this.vendorsService.getVendorLifecycle(id);
  }

  @Get(":slug")
  getVendor(@Param("slug") slug: string) {
    return this.vendorsService.getVendorBySlug(slug);
  }

  @Post("register")
  registerVendor(@Body() dto: RegisterVendorDto) {
    return this.vendorsService.registerVendor(dto);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.AMBASSADOR)
  createVendorLead(@Body() dto: CreateVendorDto) {
    return this.vendorsService.createVendorLead(dto);
  }
}
