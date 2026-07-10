import { Injectable } from "@nestjs/common";
import { ApprovalStatus, ListingType } from "@buzzystores/types";
import { slugify } from "@buzzystores/utils";
import type { CreateListingDto } from "./dto/create-listing.dto";

@Injectable()
export class CatalogService {
  listVendorListings(vendorId: string) {
    return [
      {
        id: "sample-listing",
        vendorId,
        title: "Jollof Rice Lunch Bowl",
        slug: "jollof-rice-lunch-bowl",
        listingType: ListingType.FOOD_MENU_ITEM,
        approvalStatus: ApprovalStatus.PUBLISHED,
        price: 129,
        currency: "SEK"
      }
    ];
  }

  createListing(dto: CreateListingDto) {
    return {
      id: "pending-db-write",
      slug: slugify(dto.title),
      approvalStatus: ApprovalStatus.DRAFT,
      ...dto
    };
  }
}
