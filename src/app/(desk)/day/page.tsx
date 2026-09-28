import Link from "next/link";
import {
  listAppointments,
  listDistinctDoctors,
} from "@/lib/appointments";
import { formatSlot, karachiDateString } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { DayPicker } from "@/components/DayPicker";
import { DoctorChips } from "@/components/DoctorChips";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ date?: string; doctor?: string }> };

export default async function DayPage({ searchParams }: Props) {
  const sp = await searchParams;
  const date = sp.date || karachiDateString();
  const doctor = sp.doctor || "";
  const appointments = listAppointments({
    date,
    doctor: doctor || undefined,
  });
  const doctors = listDistinctDoctors();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold">Day list</h1>
        <DayPicker date={date} doctor={doctor} />
      </div>
      <div className="card space-y-3 !py-3">
        <DoctorChips
          doctors={doctors}
          doctor={doctor}
          preserveParams={{ date }}
        />
        {doctor && (
          <p className="text-[11px] text-slate-400">
            Clear doctor (All chip) — date same rehti hai ·{" "}
            <Link
              href={`/day?date=${encodeURIComponent(date)}`}
              className="text-teal-700 underline"
            >
              Clear doctor
            </Link>
          </p>
        )}
      </div>
      <p className="text-sm text-slate-500">
        Showing {appointments.length} appointment(s) for {date}
        {doctor ? ` · ${doctor}` : ""} (Asia/Karachi calendar day).
      </p>
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
              </div>
            </div>
            <WhatsAppButton phone={a.phone} />
          </div>
        ))}
        {appointments.length === 0 && (
          <p className="text-sm text-slate-500">No appointments this day.</p>
        )}
      </div>
    </div>
  );
}
