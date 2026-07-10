import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { canAccess } from "@buzzystores/auth";
import { UserRole } from "@buzzystores/types";
import { ROLES_KEY } from "./roles.decorator";

type RequestWithUser = {
  headers?: Record<string, string | string[] | undefined>;
  user?: {
    id: string;
    role?: UserRole;
  };
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const headerRole = getHeader(request, "x-user-role");
    const headerUserId = getHeader(request, "x-user-id");

    if (!request.user && headerRole && isUserRole(headerRole)) {
      request.user = {
        id: headerUserId ?? "mock-user",
        role: headerRole
      };
    }

    return canAccess(requiredRoles, request.user?.role);
  }
}

function getHeader(request: RequestWithUser, key: string): string | undefined {
  const value = request.headers?.[key];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function isUserRole(value: string): value is UserRole {
  return Object.values(UserRole).includes(value as UserRole);
}
