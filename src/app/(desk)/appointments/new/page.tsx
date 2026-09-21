"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewAppointmentPage() {
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
      slot_start: slotLocal ? new Date(slotLocal).toISOString() : "",
      duration_minutes: Number(fd.get("duration_minutes") || 30),
      status: String(fd.get("status") || "requested"),
    };
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    router.push(`/appointments/${data.appointment.id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-xl font-bold">New appointment</h1>
      <form onSubmit={onSubmit} className="card space-y-3">
        <div>
          <label className="label">Patient name</label>
          <input name="patient_name" className="input" required />
        </div>
        <div>
          <label className="label">Phone (03… or 92…)</label>
          <input name="phone" className="input" placeholder="03001234567" required />
        </div>
        <div>
          <label className="label">Reason / procedure (optional)</label>
          <input name="reason" className="input" />
        </div>
        <div>
          <label className="label">Doctor / clinician (optional)</label>
          <input name="doctor_name" className="input" placeholder="Dr. …" />
        </div>
        <div>
          <label className="label">Slot start</label>
          <input name="slot_start" type="datetime-local" className="input" required />
        </div>
        <div>
          <label className="label">Duration (minutes)</label>
          <input name="duration_minutes" type="number" className="input" defaultValue={30} min={5} />
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" className="input" defaultValue="requested">
            <option value="requested">Requested</option>
            <option value="confirmed">Confirmed</option>
          </select>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Saving…" : "Save appointment"}
        </button>
      </form>
    </div>
  );
}
