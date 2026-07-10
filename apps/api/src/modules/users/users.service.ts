import { Injectable } from "@nestjs/common";
import { UserRole } from "@buzzystores/types";
import type { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UsersService {
  getCurrentUser() {
    return {
      id: "dev-user",
      fullName: "Development User",
      role: UserRole.ADMIN
    };
  }

  createUser(dto: CreateUserDto) {
    return {
      id: "pending-db-write",
      ...dto
    };
  }
}
