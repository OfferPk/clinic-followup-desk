import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import {
  listAppointments,
  listDistinctDoctors,
} from "@/lib/appointments";
import { formatSlot } from "@/lib/format";
import { STATUSES, type AppointmentStatus } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { AppointmentsFilters } from "@/components/AppointmentsFilters";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    q?: string;
    doctor?: string;
    status?: string;
  }>;
};

export default async function AppointmentsPage({ searchParams }: Props) {
  const user = (await getSessionUser())!;
  const sp = await searchParams;
  const q = sp.q || "";
  const doctor = sp.doctor || "";
  const statusRaw = sp.status || "";
  const status =
    statusRaw && (STATUSES as readonly string[]).includes(statusRaw)
      ? (statusRaw as AppointmentStatus)
      : undefined;

  const appointments = listAppointments({
    q: q || undefined,
    doctor: doctor || undefined,
    status,
  });
  const doctors = listDistinctDoctors();
  const showChecklist = appointments.length === 0 && !q && !doctor && !status;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold">Appointments</h1>
        <Link href="/appointments/new" className="btn-primary">
          + New appointment
        </Link>
      </div>

      <OnboardingChecklist
        show={showChecklist}
        userId={user.id}
        isOwner={user.role === "owner"}
      />

      <AppointmentsFilters
        q={q}
        doctor={doctor}
        status={status || ""}
        doctors={doctors}
      />

      <div className="space-y-2">
        {appointments.map((a) => (
          <div key={a.id} className="card flex flex-wrap items-center justify-between gap-2 !py-3">
            <div>
              <Link href={`/appointments/${a.id}`} className="font-semibold hover:text-teal-700">
                {a.patient_name}
              </Link>
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <StatusBadge status={a.status} />
                <span>{formatSlot(a.slot_start)}</span>
                {a.doctor_name && <span>· {a.doctor_name}</span>}
                {a.reason && <span>· {a.reason}</span>}
              </div>
            </div>
            <WhatsAppButton phone={a.phone} />
          </div>
        ))}
        {appointments.length === 0 && (
          <p className="text-sm text-slate-500">
            {q || doctor || status
              ? "No appointments match these filters."
              : "No appointments yet."}
          </p>
        )}
      </div>
    </div>
  );
}
