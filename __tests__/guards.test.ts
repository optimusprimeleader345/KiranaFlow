import { describe, it, expect } from "vitest";
import { AuthError, checkRole } from "@/lib/auth/roles";

describe("AuthError", () => {
  it("carries statusCode and message", () => {
    const err = new AuthError(403, "Forbidden");
    expect(err.statusCode).toBe(403);
    expect(err.message).toBe("Forbidden");
    expect(err.name).toBe("AuthError");
  });

  it("is instanceof Error", () => {
    expect(new AuthError(401, "Unauth")).toBeInstanceOf(Error);
  });
});

describe("Role guard logic", () => {
  it("throws AuthError 401 when role is missing/empty", () => {
    expect(() => checkRole(undefined, "ADMIN")).toThrow(AuthError);
    try {
      checkRole(undefined, "ADMIN");
    } catch (e: any) {
      expect(e.statusCode).toBe(401);
    }
  });

  it("throws AuthError 403 when role is wrong", () => {
    expect(() => checkRole("RETAILER", "ADMIN")).toThrow(AuthError);
    try {
      checkRole("RETAILER", "ADMIN");
    } catch (e: any) {
      expect(e.statusCode).toBe(403);
      expect(e.message).toContain("ADMIN");
    }
  });

  it("succeeds when role matches", () => {
    expect(() => checkRole("ADMIN", "ADMIN")).not.toThrow();
    expect(() => checkRole("RETAILER", "RETAILER")).not.toThrow();
  });
});
