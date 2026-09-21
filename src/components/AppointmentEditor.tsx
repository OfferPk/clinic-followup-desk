"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { STATUSES, type Appointment } from "@/lib/types";

export function AppointmentEditor({ appointment }: { appointment: Appointment }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const slotLocal = String(fd.get("slot_start") || "");
    const body = {
      patient_name: String(fd.get("patient_name") || ""),
      phone: String(fd.get("phone") || ""),
      reason: String(fd.get("reason") || "") || null,
      doctor_name: String(fd.get("doctor_name") || "") || null,
      slot_start: slotLocal ? new Date(slotLocal).toISOString() : appointment.slot_start,
      duration_minutes: Number(fd.get("duration_minutes") || 30),
      status: String(fd.get("status") || appointment.status),
    };
    const res = await fetch(`/api/appointments/${appointment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    router.refresh();
  }

  async function onDelete() {
    if (!confirm("Delete this appointment?")) return;
    const res = await fetch(`/api/appointments/${appointment.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push("/appointments");
      router.refresh();
    }
  }

  // datetime-local value from ISO
  const localSlot = (() => {
    const d = new Date(appointment.slot_start);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  })();

  return (
    <form onSubmit={onSubmit} className="card space-y-3">
      <h2 className="text-sm font-semibold text-slate-700">Edit</h2>
      <div>
        <label className="label">Patient name</label>
        <input name="patient_name" className="input" defaultValue={appointment.patient_name} required />
      </div>
      <div>
        <label className="label">Phone</label>
        <input name="phone" className="input" defaultValue={appointment.phone} required />
      </div>
      <div>
        <label className="label">Reason</label>
        <input name="reason" className="input" defaultValue={appointment.reason || ""} />
      </div>
      <div>
        <label className="label">Doctor</label>
        <input name="doctor_name" className="input" defaultValue={appointment.doctor_name || ""} />
      </div>
      <div>
        <label className="label">Slot</label>
        <input name="slot_start" type="datetime-local" className="input" defaultValue={localSlot} required />
      </div>
      <div>
        <label className="label">Duration (min)</label>
        <input name="duration_minutes" type="number" className="input" defaultValue={appointment.duration_minutes} />
      </div>
      <div>
        <label className="label">Status</label>
        <select name="status" className="input" defaultValue={appointment.status}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Saving…" : "Save changes"}
        </button>
        <button type="button" className="btn-danger" onClick={onDelete}>
          Delete
        </button>
      </div>
    </form>
  );
}
