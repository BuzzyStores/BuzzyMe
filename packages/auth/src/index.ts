import { UserRole } from "@buzzystores/types";

export const roleHierarchy: Record<UserRole, number> = {
  [UserRole.CONSUMER]: 10,
  [UserRole.VENDOR_STAFF]: 20,
  [UserRole.DRIVER]: 20,
  [UserRole.AMBASSADOR]: 25,
  [UserRole.VENDOR_OWNER]: 30,
  [UserRole.PARTNER_VIEWER]: 35,
  [UserRole.ADMIN]: 70,
  [UserRole.SUPER_ADMIN]: 100,
  [UserRole.AI_AGENT]: 5
};

export const highRiskRoles = new Set<UserRole>([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

export function canAccess(required: UserRole[], actual?: UserRole | null): boolean {
  if (!actual) {
    return false;
  }

  return required.includes(actual);
}

export function canApproveSensitiveAction(actual?: UserRole | null): boolean {
  return actual === UserRole.ADMIN || actual === UserRole.SUPER_ADMIN;
}

export function assertHumanApprovalRole(actual?: UserRole | null): void {
  if (!canApproveSensitiveAction(actual)) {
    throw new Error("Sensitive actions require an admin or super admin approval role.");
  }
}
