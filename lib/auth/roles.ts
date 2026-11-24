export type UserRole = "RETAILER" | "ADMIN";

export class AuthError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export function checkRole(role: string | undefined | null, requiredRole: UserRole): void {
  if (!role) {
    throw new AuthError(401, "Unauthorized");
  }
  if (role !== requiredRole) {
    throw new AuthError(403, `Forbidden: requires ${requiredRole} role`);
  }
}
