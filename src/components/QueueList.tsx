import Link from "next/link";
import type { Appointment } from "@/lib/types";
import { formatSlot } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { confirmMessage, remindMessage } from "@/lib/phone";

export function QueueList({
  appointments,
  mode,
}: {
  appointments: Appointment[];
  mode: "confirm" | "remind" | "no_show";
}) {
  return (
    <div className="space-y-2">
      {appointments.map((a) => {
        const slotLabel = formatSlot(a.slot_start);
        const text =
          mode === "confirm"
            ? confirmMessage(a.patient_name, slotLabel)
            : mode === "remind"
              ? remindMessage(a.patient_name, slotLabel)
              : `Assalam o Alaikum ${a.patient_name}, aap miss ho gaye thay — naya slot book karna hai? — ClinicDesk`;
        return (
          <div
            key={a.id}
            className="card flex flex-wrap items-center justify-between gap-2 !py-3"
          >
            <div>
              <Link
                href={`/appointments/${a.id}`}
                className="font-semibold hover:text-teal-700"
              >
                {a.patient_name}
              </Link>
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <StatusBadge status={a.status} />
                <span>{slotLabel}</span>
                {a.doctor_name && <span>· {a.doctor_name}</span>}
                {a.reason && <span>· {a.reason}</span>}
              </div>
            </div>
            <WhatsAppButton phone={a.phone} text={text} label="Open WhatsApp" />
          </div>
        );
      })}
      {appointments.length === 0 && (
        <p className="text-sm text-slate-500">Queue empty — nice work.</p>
      )}
    </div>
  );
}
