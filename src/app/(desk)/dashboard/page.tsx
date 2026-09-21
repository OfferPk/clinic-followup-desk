import Link from "next/link";
import { getDashboardStats } from "@/lib/appointments";
import { STATUS_LABELS, STATUSES } from "@/lib/types";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const stats = getDashboardStats();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <Link href="/appointments/new" className="btn-primary">
          + New appointment
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Confirm today" value={stats.confirm_today} href="/queues/confirm" tone="amber" />
        <StatCard label="Remind 24h" value={stats.remind_24h} href="/queues/remind" tone="sky" />
        <StatCard label="No-show open" value={stats.no_show_open} href="/queues/no-show" tone="rose" />
        <StatCard label="Total" value={stats.total} href="/appointments" tone="slate" />
      </div>

      <div className="card">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">By status</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {STATUSES.map((s) => (
            <Link
              key={s}
              href={`/board?status=${s}`}
              className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-center hover:border-teal-200"
            >
              <div className="text-lg font-bold text-slate-900">{stats.counts[s]}</div>
              <div className="text-xs text-slate-500">{STATUS_LABELS[s]}</div>
            </Link>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-400">
        ClinicDesk is a follow-up desk — not an EMR. No medical records beyond the appointment reason string.
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  tone,
}: {
  label: string;
  value: number;
  href: string;
  tone: string;
}) {
  const tones: Record<string, string> = {
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    sky: "border-sky-200 bg-sky-50 text-sky-900",
    rose: "border-rose-200 bg-rose-50 text-rose-900",
    slate: "border-slate-200 bg-white text-slate-900",
  };
  return (
    <Link href={href} className={`rounded-xl border p-3 ${tones[tone]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-medium opacity-80">{label}</div>
    </Link>
  );
}
