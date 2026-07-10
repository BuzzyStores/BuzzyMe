import { Injectable } from "@nestjs/common";
import { UserRole } from "@buzzystores/types";

@Injectable()
export class AuthService {
  login(email: string) {
    return {
      accessToken: "dev-only-token",
      user: {
        email,
        role: email.includes("admin") ? UserRole.ADMIN : UserRole.VENDOR_OWNER
      }
    };
  }
}
