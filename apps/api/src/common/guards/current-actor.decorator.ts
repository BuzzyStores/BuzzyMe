import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import { UserRole } from "@buzzystores/types";

export type CurrentActor = {
  id: string;
  role: UserRole;
};

type RequestWithUser = {
  headers?: Record<string, string | string[] | undefined>;
  user?: CurrentActor;
};

export const CurrentActor = createParamDecorator((_data: unknown, context: ExecutionContext): CurrentActor => {
  const request = context.switchToHttp().getRequest<RequestWithUser>();

  if (request.user) {
    return request.user;
  }

  const role = getHeader(request, "x-user-role");
  const id = getHeader(request, "x-user-id");

  return {
    id: id ?? "mock-user",
    role: isUserRole(role) ? role : UserRole.CONSUMER
  };
});

function getHeader(request: RequestWithUser, key: string): string | undefined {
  const value = request.headers?.[key];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function isUserRole(value: string | undefined): value is UserRole {
  return Boolean(value && Object.values(UserRole).includes(value as UserRole));
}
