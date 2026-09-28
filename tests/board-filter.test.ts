import { describe, it, expect } from "vitest";
import {
  ACTIVE_BOARD_STATUSES,
  boardVisibleStatuses,
  parseBoardShowClosed,
} from "@/lib/board-filter";
import { STATUSES } from "@/lib/types";

describe("board filter contract", () => {
  it("defaults to active statuses only (no completed/cancelled)", () => {
    expect(ACTIVE_BOARD_STATUSES).toEqual([
      "requested",
      "confirmed",
      "no_show",
    ]);
    expect(boardVisibleStatuses(false)).toEqual(ACTIVE_BOARD_STATUSES);
    expect(boardVisibleStatuses(false)).not.toContain("completed");
    expect(boardVisibleStatuses(false)).not.toContain("cancelled");
  });

  it("showClosed reveals all STATUSES including completed + cancelled", () => {
    expect(boardVisibleStatuses(true)).toEqual([...STATUSES]);
    expect(boardVisibleStatuses(true)).toContain("completed");
    expect(boardVisibleStatuses(true)).toContain("cancelled");
  });

  it("parseBoardShowClosed accepts closed=1 or show=all", () => {
    expect(parseBoardShowClosed({})).toBe(false);
    expect(parseBoardShowClosed({ closed: "0" })).toBe(false);
    expect(parseBoardShowClosed({ closed: "1" })).toBe(true);
    expect(parseBoardShowClosed({ show: "all" })).toBe(true);
    expect(parseBoardShowClosed({ show: "active" })).toBe(false);
  });
});
