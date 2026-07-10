import { IsEmail, IsIn, IsOptional, IsString, IsUrl, MinLength } from "class-validator";

export class RegisterVendorDto {
  @IsString()
  @MinLength(2)
  businessName!: string;

  @IsString()
  @MinLength(2)
  ownerName!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(5)
  phone!: string;

  @IsOptional()
  @IsString()
  categoryHint?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsUrl()
  instagramUrl?: string;

  @IsOptional()
  @IsUrl()
  facebookUrl?: string;

  @IsOptional()
  @IsUrl()
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  openingHoursText?: string;

  @IsOptional()
  @IsString()
  productText?: string;

  @IsOptional()
  @IsIn(["en", "sv"])
  preferredLanguage?: "en" | "sv";
}
