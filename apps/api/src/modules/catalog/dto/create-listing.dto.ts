import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { ListingType } from "@buzzystores/types";

export class CreateListingDto {
  @IsString()
  vendorId!: string;

  @IsString()
  title!: string;

  @IsEnum(ListingType)
  listingType!: ListingType;

  @IsNumber()
  price!: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsBoolean()
  pickupEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  deliveryEnabled?: boolean;
}
