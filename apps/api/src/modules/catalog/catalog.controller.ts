import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserRole } from "@buzzystores/types";
import { Roles } from "../../common/guards/roles.decorator";
import { CatalogService } from "./catalog.service";
import { CreateListingDto } from "./dto/create-listing.dto";

@ApiTags("catalog")
@Controller("catalog")
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get("vendors/:vendorId/listings")
  listVendorListings(@Param("vendorId") vendorId: string) {
    return this.catalogService.listVendorListings(vendorId);
  }

  @Post("listings")
  @Roles(UserRole.VENDOR_OWNER, UserRole.VENDOR_STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  createListing(@Body() dto: CreateListingDto) {
    return this.catalogService.createListing(dto);
  }
}
