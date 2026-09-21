import Link from "next/link";
import { listAppointments } from "@/lib/appointments";
import { formatSlot } from "@/lib/format";
import { STATUS_LABELS, STATUSES, type AppointmentStatus } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { BoardActions } from "@/components/BoardActions";

export const dynamic = "force-dynamic";

export default function BoardPage() {
  const all = listAppointments();
  const byStatus = Object.fromEntries(
    STATUSES.map((s) => [s, all.filter((a) => a.status === s)])
  ) as Record<AppointmentStatus, typeof all>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold">Status board</h1>
        <Link href="/appointments/new" className="btn-primary">
          + New
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {STATUSES.map((status) => (
          <div
            key={status}
            className="min-w-[220px] max-w-[260px] flex-1 rounded-xl border border-slate-200 bg-slate-50/80 p-2"
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                {STATUS_LABELS[status]}
              </span>
              <span className="rounded-full bg-white px-2 text-xs text-slate-500">
                {byStatus[status].length}
              </span>
            </div>
            <div className="space-y-2">
              {byStatus[status].map((a) => (
                <div key={a.id} className="card !p-3 space-y-1.5">
                  <Link
                    href={`/appointments/${a.id}`}
                    className="block text-sm font-semibold text-slate-900 hover:text-teal-700"
                  >
                    {a.patient_name}
                  </Link>
                  <StatusBadge status={a.status} />
                  <div className="text-xs text-slate-500">{formatSlot(a.slot_start)}</div>
                  {a.doctor_name && (
                    <div className="text-xs text-slate-400">{a.doctor_name}</div>
                  )}
                  {a.reason && (
                    <div className="truncate text-xs text-slate-500">{a.reason}</div>
                  )}
                  <BoardActions id={a.id} status={a.status} />
                </div>
              ))}
              {byStatus[status].length === 0 && (
                <p className="px-1 py-4 text-center text-xs text-slate-400">Empty</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
