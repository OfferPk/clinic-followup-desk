/** Escape CSV cell; neutralize spreadsheet formula injection (= + - @), including leading \t / \r. */
export function csvEscape(v: string | number | null | undefined): string {
  let s = v == null ? "" : String(v);
  // CF-005: also catch tab/CR-prefixed formula vectors (untrimmed match)
  if (/^[\t\r]*[=+\-@]/.test(s)) {
    s = "'" + s;
  }
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
