"use client";

import { useRouter } from "next/navigation";
import { STATUSES, type AppointmentStatus } from "@/lib/types";

export function BoardActions({
  id,
  status,
}: {
  id: string;
  status: AppointmentStatus;
}) {
  const router = useRouter();

  async function setStatus(next: AppointmentStatus) {
    if (next === status) return;
    const res = await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) router.refresh();
    else {
      const data = await res.json();
      alert(data.error || "Failed");
    }
  }

  return (
    <select
      className="input !py-1 !text-xs"
      value={status}
      onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
      aria-label="Change status"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
