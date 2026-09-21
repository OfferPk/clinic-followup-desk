"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Note } from "@/lib/types";

export function NotesPanel({
  appointmentId,
  initialNotes,
}: {
  appointmentId: string;
  initialNotes: Note[];
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch(`/api/appointments/${appointmentId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    setBody("");
    router.refresh();
  }

  return (
    <div className="card space-y-3">
      <h2 className="text-sm font-semibold text-slate-700">Activity notes</h2>
      <ul className="space-y-2">
        {initialNotes.map((n) => (
          <li key={n.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
            <div className="text-xs text-slate-400">
              {n.user_name} · {new Date(n.created_at).toLocaleString()}
            </div>
            <div className="text-slate-800">{n.body}</div>
          </li>
        ))}
        {initialNotes.length === 0 && (
          <li className="text-xs text-slate-400">No notes yet.</li>
        )}
      </ul>
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          className="input"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a note…"
          required
        />
        <button type="submit" className="btn-primary shrink-0">
          Add
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
