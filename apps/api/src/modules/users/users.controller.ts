import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserRole } from "@buzzystores/types";
import { Roles } from "../../common/guards/roles.decorator";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersService } from "./users.service";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  getCurrentUser() {
    return this.usersService.getCurrentUser();
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  createUser(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }
}
