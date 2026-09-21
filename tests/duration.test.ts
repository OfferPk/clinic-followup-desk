import { describe, it, expect } from "vitest";
import {
  MAX_DURATION_MINUTES,
  parseDurationMinutes,
} from "@/lib/duration";

describe("CF-003/004 duration_minutes validation", () => {
  it("defaults missing to 30 on create", () => {
    expect(parseDurationMinutes(undefined, { defaultWhenMissing: 30 })).toEqual({
      ok: true,
      value: 30,
    });
    expect(parseDurationMinutes(null, { defaultWhenMissing: 30 })).toEqual({
      ok: true,
      value: 30,
    });
    expect(parseDurationMinutes("", { defaultWhenMissing: 30 })).toEqual({
      ok: true,
      value: 30,
    });
  });

  it("accepts positive finite durations", () => {
    expect(parseDurationMinutes(30)).toEqual({ ok: true, value: 30 });
    expect(parseDurationMinutes("45")).toEqual({ ok: true, value: 45 });
    expect(parseDurationMinutes(MAX_DURATION_MINUTES)).toEqual({
      ok: true,
      value: MAX_DURATION_MINUTES,
    });
  });

  it("rejects negative duration (CF-003)", () => {
    const r = parseDurationMinutes(-5);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/positive/i);
  });

  it("rejects zero", () => {
    expect(parseDurationMinutes(0).ok).toBe(false);
  });

  it("rejects non-numeric / NaN with ok:false for 400 (CF-004)", () => {
    const r = parseDurationMinutes("abc");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/positive/i);
    expect(parseDurationMinutes(Number.NaN).ok).toBe(false);
    expect(parseDurationMinutes(Infinity).ok).toBe(false);
  });

  it("rejects above cap", () => {
    expect(parseDurationMinutes(MAX_DURATION_MINUTES + 1).ok).toBe(false);
  });
});
