import Link from "next/link";
import { notFound } from "next/navigation";
import { getAppointment, listNotes } from "@/lib/appointments";
import { formatSlot } from "@/lib/format";
import { confirmMessage, remindMessage } from "@/lib/phone";
import { StatusBadge } from "@/components/StatusBadge";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { AppointmentEditor } from "@/components/AppointmentEditor";
import { NotesPanel } from "@/components/NotesPanel";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AppointmentDetailPage({ params }: Props) {
  const { id } = await params;
  const appointment = getAppointment(id);
  if (!appointment) notFound();
  const notes = listNotes(id);
  const slotLabel = formatSlot(appointment.slot_start);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Link href="/appointments" className="text-xs text-teal-700">
            ← Appointments
          </Link>
          <h1 className="text-xl font-bold">{appointment.patient_name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <StatusBadge status={appointment.status} />
            <span className="text-sm text-slate-500">{slotLabel}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <WhatsAppButton
            phone={appointment.phone}
            text={confirmMessage(appointment.patient_name, slotLabel)}
            label="WA Confirm"
          />
          <WhatsAppButton
            phone={appointment.phone}
            text={remindMessage(appointment.patient_name, slotLabel)}
            label="WA Remind"
          />
          <WhatsAppButton phone={appointment.phone} label="WhatsApp" />
        </div>
      </div>

      <div className="card text-sm text-slate-600 space-y-1">
        <div>
          <span className="font-medium text-slate-800">Phone:</span> {appointment.phone}
        </div>
        {appointment.doctor_name && (
          <div>
            <span className="font-medium text-slate-800">Doctor:</span>{" "}
            {appointment.doctor_name}
          </div>
        )}
        {appointment.reason && (
          <div>
            <span className="font-medium text-slate-800">Reason:</span> {appointment.reason}
          </div>
        )}
        <div>
          <span className="font-medium text-slate-800">Duration:</span>{" "}
          {appointment.duration_minutes} min · Owner: {appointment.owner_name}
        </div>
      </div>

      <AppointmentEditor appointment={appointment} />
      <NotesPanel appointmentId={id} initialNotes={notes} />
    </div>
  );
}
