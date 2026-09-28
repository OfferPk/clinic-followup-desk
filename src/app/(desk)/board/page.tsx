import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { listAppointments } from "@/lib/appointments";
import { formatSlot } from "@/lib/format";
import { STATUS_LABELS, type AppointmentStatus } from "@/lib/types";
import {
  boardVisibleStatuses,
  parseBoardShowClosed,
} from "@/lib/board-filter";
import { StatusBadge } from "@/components/StatusBadge";
import { BoardActions } from "@/components/BoardActions";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ closed?: string; show?: string }>;
};

export default async function BoardPage({ searchParams }: Props) {
  const user = (await getSessionUser())!;
  const sp = await searchParams;
  const showClosed = parseBoardShowClosed(sp);
  const visibleStatuses = boardVisibleStatuses(showClosed);
  const all = listAppointments();
  const byStatus = Object.fromEntries(
    visibleStatuses.map((s) => [s, all.filter((a) => a.status === s)])
  ) as Record<AppointmentStatus, typeof all>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold">Status board</h1>
        <div className="flex flex-wrap items-center gap-2">
          {showClosed ? (
            <Link href="/board" className="btn-secondary !text-xs">
              Hide closed
            </Link>
          ) : (
            <Link href="/board?closed=1" className="btn-secondary !text-xs">
              Show closed
            </Link>
          )}
          <Link href="/appointments/new" className="btn-primary">
            + New
          </Link>
        </div>
      </div>
      <p className="text-sm text-slate-500">
        {showClosed
          ? "Showing all columns including completed + cancelled."
          : "Active only (requested · confirmed · no-show). Closed hide hain — Show closed se dekho."}
      </p>
      <OnboardingChecklist
        show={all.length === 0}
        userId={user.id}
        isOwner={user.role === "owner"}
      />
      <div className="flex gap-3 overflow-x-auto pb-2">
        {visibleStatuses.map((status) => (
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
