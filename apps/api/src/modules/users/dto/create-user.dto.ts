import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { UserRole } from "@buzzystores/types";

export class CreateUserDto {
  @IsString()
  fullName!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(UserRole)
  role!: UserRole;
}
