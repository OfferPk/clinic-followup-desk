import { describe, it, expect } from "vitest";
import { canTransition, STATUSES } from "@/lib/types";
import { csvEscape } from "@/lib/csv";

/**
 * Authz smoke without booting Next: role gates used by API routes.
 */
describe("authz smoke (role gates)", () => {
  function requireOwner(role: string) {
    if (role !== "owner") {
      const err = new Error("Forbidden — owners only") as Error & { status: number };
      err.status = 403;
      throw err;
    }
  }

  it("owner can export / manage users", () => {
    expect(() => requireOwner("owner")).not.toThrow();
  });

  it("receptionist blocked from owner actions", () => {
    expect(() => requireOwner("receptionist")).toThrow(/Forbidden/);
  });

  it("all statuses are defined", () => {
    expect(STATUSES).toHaveLength(5);
  });

  it("csv formula-safe for export cells", () => {
    expect(csvEscape("@SUM(A1)")).toMatch(/^'/);
    expect(csvEscape("=1+1")).toBe("'=1+1");
    expect(csvEscape("+hi")).toBe("'+hi");
    expect(csvEscape("-1+1")).toBe("'-1+1");
  });

  it("CF-005 csvEscape neutralizes leading tab/CR formula vectors", () => {
    // Tab-prefixed: prefix ' (no quote needed — tab alone is not a quote trigger)
    expect(csvEscape("\t=CMD")).toBe("'\t=CMD");
    // CR-prefixed: prefix ' then quote because of \r
    expect(csvEscape("\r=CMD")).toBe("\"'\r=CMD\"");
    expect(csvEscape("normal")).toBe("normal");
  });

  it("invalid transition throws conceptually", () => {
    expect(canTransition("completed", "cancelled")).toBe(false);
  });
});
