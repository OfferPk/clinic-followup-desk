import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getDashboardStats } from "@/lib/appointments";
import { STATUS_LABELS, STATUSES, type AppointmentStatus } from "@/lib/types";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";

export const dynamic = "force-dynamic";

type StatTone = "amber" | "sky" | "rose" | "slate";

export default async function DashboardPage() {
  const user = (await getSessionUser())!;
  const stats = getDashboardStats();
  const showChecklist = stats.total === 0;

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">CLINIC OVERVIEW</p>
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">
            Keep today&apos;s confirmations, reminders, and appointments moving from one calm workspace.
          </p>
        </div>
        <Link href="/appointments/new" className="btn-primary dashboard-create">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New appointment
        </Link>
      </header>

      <OnboardingChecklist
        show={showChecklist}
        userId={user.id}
        isOwner={user.role === "owner"}
      />

      <section className="dashboard-stat-grid" aria-label="Appointment overview">
        <StatCard
          label="Confirm today"
          value={stats.confirm_today}
          href="/queues/confirm"
          tone="amber"
          symbol="✓"
          detail="Appointments waiting for confirmation"
        />
        <StatCard
          label="Remind in 24h"
          value={stats.remind_24h}
          href="/queues/remind"
          tone="sky"
          symbol="↻"
          detail="Confirmed visits coming up"
        />
        <StatCard
          label="No-show follow-up"
          value={stats.no_show_open}
          href="/queues/no-show"
          tone="rose"
          symbol="!"
          detail="Visits that need another touch"
        />
        <StatCard
          label="Total appointments"
          value={stats.total}
          href="/appointments"
          tone="slate"
          symbol="↗"
          detail="Appointments in this desk"
        />
      </section>

      <section className="dashboard-panel" aria-labelledby="pipeline-title">
        <div className="panel-heading">
          <div>
            <p className="panel-kicker">WORKFLOW</p>
            <h2 id="pipeline-title">Appointment pipeline</h2>
          </div>
          <Link href="/board" className="text-link">
            Open status board <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="pipeline-grid">
          {STATUSES.map((status: AppointmentStatus) => (
            <Link
              key={status}
              href={`/board?status=${status}`}
              className={`pipeline-item pipeline-${status}`}
              aria-label={`${STATUS_LABELS[status]}: ${stats.counts[status]} appointments`}
            >
              <span className="pipeline-status">{STATUS_LABELS[status]}</span>
              <span className="pipeline-count">{stats.counts[status]}</span>
              <span className="pipeline-cta">View appointments <span aria-hidden="true">→</span></span>
            </Link>
          ))}
        </div>
      </section>

      <aside className="dashboard-note" role="note">
        <span className="note-icon" aria-hidden="true">i</span>
        <div>
          <strong>Appointment follow-up, with privacy in mind</strong>
          <p>
            ClinicDesk is not an EMR. It stores no medical charts or prescriptions; keep appointment reasons brief and appropriate for a follow-up desk.
          </p>
        </div>
      </aside>
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: number;
  href: string;
  tone: StatTone;
  symbol: string;
  detail: string;
};

function StatCard({ label, value, href, tone, symbol, detail }: StatCardProps) {
  return (
    <Link href={href} className={`stat-card stat-card-${tone}`}>
      <span className="stat-card-top">
        {label}
        <span className="stat-symbol" aria-hidden="true">{symbol}</span>
      </span>
      <span className="stat-value">{value.toLocaleString()}</span>
      <span className="stat-detail">{detail}</span>
    </Link>
  );
}
