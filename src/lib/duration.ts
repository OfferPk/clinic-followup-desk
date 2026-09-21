/** Max appointment length accepted by API (8 hours). */
export const MAX_DURATION_MINUTES = 480;

/**
 * Parse duration_minutes for create/update.
 * Rejects negatives, zero, NaN/Infinity, and values above cap → caller returns 400.
 */
export function parseDurationMinutes(
  raw: unknown,
  opts?: { defaultWhenMissing?: number }
): { ok: true; value: number } | { ok: false; error: string } {
  if (raw === undefined || raw === null || raw === "") {
    if (opts?.defaultWhenMissing != null) {
      return { ok: true, value: opts.defaultWhenMissing };
    }
    return { ok: false, error: "duration_minutes is required" };
  }
  const d = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(d) || d <= 0) {
    return {
      ok: false,
      error: "duration_minutes must be a positive number",
    };
  }
  if (d > MAX_DURATION_MINUTES) {
    return {
      ok: false,
      error: `duration_minutes must be at most ${MAX_DURATION_MINUTES}`,
    };
  }
  return { ok: true, value: d };
}
