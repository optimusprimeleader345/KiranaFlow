import { auth } from "@/lib/auth/config";
import { NextResponse } from "next/server";
import { AuthError, checkRole, type UserRole } from "./roles";

export { AuthError, type UserRole };

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new AuthError(401, "Unauthorized");
  return session;
}

export async function requireRole(role: UserRole) {
  const session = await requireAuth();
  checkRole(session.user.role, role);
  return session;
}

type RouteHandler<T> = (req: Request, ctx: T) => Promise<NextResponse>;

export function withAuth<T>(handler: RouteHandler<T>): RouteHandler<T> {
  return async (req: Request, ctx: T): Promise<NextResponse> => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.statusCode });
      }
      console.error("Route error:", err);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  };
}
