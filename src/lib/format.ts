/** Format ISO slot for display (Asia/Karachi-friendly local string). */
export function formatSlot(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-PK", {
      timeZone: "Asia/Karachi",
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function formatDateOnly(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-CA", { timeZone: "Asia/Karachi" });
  } catch {
    return iso.slice(0, 10);
  }
}

/** YYYY-MM-DD for a Date in Asia/Karachi */
export function karachiDateString(d: Date = new Date()): string {
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Karachi" });
}
