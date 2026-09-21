import { STATUS_LABELS, type AppointmentStatus } from "@/lib/types";

const COLORS: Record<AppointmentStatus, string> = {
  requested: "bg-amber-100 text-amber-800",
  confirmed: "bg-sky-100 text-sky-800",
  completed: "bg-emerald-100 text-emerald-800",
  no_show: "bg-rose-100 text-rose-800",
  cancelled: "bg-slate-100 text-slate-600",
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${COLORS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
