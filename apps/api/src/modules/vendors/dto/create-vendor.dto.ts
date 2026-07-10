import { IsEmail, IsOptional, IsString, IsUrl } from "class-validator";

export class CreateVendorDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  categoryLabel?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsUrl()
  socialUrl?: string;
}
