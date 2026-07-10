import { Type } from "class-transformer";
import {
  IsArray,
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested
} from "class-validator";

class PickupOrderCustomerDto {
  @IsString()
  name!: string;

  @IsString()
  phone!: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

class PickupOrderItemDto {
  @IsString()
  listingId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsString()
  selectedVariantId?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateOrderDto {
  @IsString()
  vendorId!: string;

  @IsIn(["PICKUP"])
  fulfilmentMethod!: "PICKUP";

  @ValidateNested()
  @Type(() => PickupOrderCustomerDto)
  customer!: PickupOrderCustomerDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PickupOrderItemDto)
  items!: PickupOrderItemDto[];

  @IsOptional()
  @IsString()
  customerNote?: string;

  @IsOptional()
  @IsString()
  requestedPickupTime?: string;
}
