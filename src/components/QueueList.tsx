import Link from "next/link";
import type { Appointment } from "@/lib/types";
import { formatSlot } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import {
  confirmMessage,
  remindMessage,
  rebookMessage,
} from "@/lib/phone";
import styles from "./QueueList.module.css";

const QUEUE_LABELS = {
  confirm: "Appointments to confirm today",
  remind: "Appointments to remind",
  no_show: "No-show follow-up appointments",
} as const;

export function QueueList({
  appointments,
  mode,
}: {
  appointments: Appointment[];
  mode: "confirm" | "remind" | "no_show";
}) {
  return (
    <ul className={styles.list} aria-label={QUEUE_LABELS[mode]}>
      {appointments.map((a) => {
        const slotLabel = formatSlot(a.slot_start);
        const text =
          mode === "confirm"
            ? confirmMessage(a.patient_name, slotLabel)
            : mode === "remind"
              ? remindMessage(a.patient_name, slotLabel)
              : rebookMessage(a.patient_name, slotLabel);
        const label =
          mode === "no_show" ? "WA Rebook" : "Open WhatsApp";
        return (
          <li
            key={a.id}
            className={`${styles.card} ${styles[mode]}`}
          >
            <div className={styles.details}>
              <Link
                href={`/appointments/${a.id}`}
                className={styles.patientLink}
              >
                {a.patient_name}
              </Link>
              <div className={styles.meta}>
                <StatusBadge status={a.status} />
                <span className={styles.slotLabel}>{slotLabel}</span>
                {a.doctor_name && (
                  <span className={styles.detail}>{a.doctor_name}</span>
                )}
                {a.reason && (
                  <span className={styles.reason}>{a.reason}</span>
                )}
              </div>
            </div>
            <div className={styles.action}>
              <WhatsAppButton phone={a.phone} text={text} label={label} />
            </div>
          </li>
        );
      })}
      {appointments.length === 0 && (
        <li className={styles.empty}>
          <span className={styles.emptyMark} aria-hidden="true">✓</span>
          <span>Queue empty — nice work.</span>
        </li>
      )}
    </ul>
  );
}
