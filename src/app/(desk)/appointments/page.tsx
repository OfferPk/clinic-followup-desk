import Link from "next/link";
import { listAppointments } from "@/lib/appointments";
import { formatSlot } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const dynamic = "force-dynamic";

export default function AppointmentsPage() {
  const appointments = listAppointments();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold">Appointments</h1>
        <Link href="/appointments/new" className="btn-primary">
          + New appointment
        </Link>
      </div>
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
          <p className="text-sm text-slate-500">No appointments yet.</p>
        )}
      </div>
    </div>
  );
}
