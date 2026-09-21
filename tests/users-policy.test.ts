import { describe, it, expect } from "vitest";
import {
  normalizeCreateUserRole,
  usersListAllowed,
} from "@/lib/users-policy";

describe("P1 users list authz", () => {
  it("owner may list users", () => {
    expect(usersListAllowed("owner")).toBe(true);
  });

  it("receptionist must NOT list users (GET /api/users)", () => {
    expect(usersListAllowed("receptionist")).toBe(false);
  });
});

describe("P1 block owner role escalation on create", () => {
  it("defaults missing role to receptionist", () => {
    expect(normalizeCreateUserRole(undefined)).toEqual({
      ok: true,
      role: "receptionist",
    });
  });

  it("accepts explicit receptionist", () => {
    expect(normalizeCreateUserRole("receptionist")).toEqual({
      ok: true,
      role: "receptionist",
    });
  });

  it("rejects crafted role=owner", () => {
    const r = normalizeCreateUserRole("owner");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/receptionists only/i);
  });

  it("rejects unknown roles", () => {
    const r = normalizeCreateUserRole("admin");
    expect(r.ok).toBe(false);
  });
});
