import type { Role } from "@/lib/types";

/**
 * Owner-created staff accounts must be receptionists only.
 * Crafted `role: "owner"` is rejected (no privilege expansion).
 */
export function normalizeCreateUserRole(
  raw: unknown
): { ok: true; role: Role } | { ok: false; error: string } {
  if (raw === undefined || raw === null || raw === "" || raw === "receptionist") {
    return { ok: true, role: "receptionist" };
  }
  if (raw === "owner") {
    return {
      ok: false,
      error: "Cannot create owner accounts via team API — receptionists only",
    };
  }
  return { ok: false, error: "Invalid role — receptionists only" };
}

/** GET /api/users is owner-only (receptionist → 403). */
export function usersListAllowed(role: Role): boolean {
  return role === "owner";
}
