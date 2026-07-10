import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { StorefrontsService } from "./storefronts.service";

@ApiTags("storefronts")
@Controller("storefronts")
export class StorefrontsController {
  constructor(private readonly storefrontsService: StorefrontsService) {}

  @Get("vendor/:vendorSlug")
  getByVendorSlug(@Param("vendorSlug") vendorSlug: string) {
    return this.storefrontsService.getPublicStorefrontByVendorSlug(vendorSlug);
  }

  @Get("short/:shortCode")
  getByShortCode(@Param("shortCode") shortCode: string) {
    return this.storefrontsService.getPublicStorefrontByShortCode(shortCode);
  }
}
