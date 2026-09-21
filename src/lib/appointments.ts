import { getDb } from "./db";
import type { Appointment, AppointmentStatus, Note } from "./types";
import { canTransition } from "./types";
import { karachiDateString } from "./format";

const SELECT_APPT = `
  SELECT a.*, u.name as owner_name
  FROM appointments a
  JOIN users u ON u.id = a.owner_id
`;

export function listAppointments(opts?: {
  status?: AppointmentStatus;
  date?: string; // YYYY-MM-DD in Karachi
}): Appointment[] {
  const db = getDb();
  const clauses: string[] = [];
  const params: string[] = [];

  if (opts?.status) {
    clauses.push("a.status = ?");
    params.push(opts.status);
  }
  if (opts?.date) {
    // Compare Karachi calendar date via substring of stored ISO — prefer filtering in JS if TZ tricky.
    // Stored as ISO UTC; filter by date prefix after converting is hard in SQLite.
    // We filter roughly by ISO date OR use JS post-filter. For list-by-day we post-filter.
    clauses.push("1=1");
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  let rows = db
    .prepare(`${SELECT_APPT} ${where} ORDER BY a.slot_start ASC`)
    .all(...params) as Appointment[];

  if (opts?.date) {
    rows = rows.filter((r) => karachiDateString(new Date(r.slot_start)) === opts.date);
  }
  return rows;
}

export function getAppointment(id: string): Appointment | null {
  const db = getDb();
  const row = db
    .prepare(`${SELECT_APPT} WHERE a.id = ?`)
    .get(id) as Appointment | undefined;
  return row || null;
}

export function createAppointment(input: {
  patient_name: string;
  phone: string;
  reason?: string | null;
  doctor_name?: string | null;
  slot_start: string;
  duration_minutes?: number;
  status?: AppointmentStatus;
  owner_id: string;
}): Appointment {
  const db = getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const duration = input.duration_minutes ?? 30;
  const status = input.status ?? "requested";
  db.prepare(
    `INSERT INTO appointments
      (id, patient_name, phone, reason, doctor_name, slot_start, duration_minutes, status, owner_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    input.patient_name,
    input.phone,
    input.reason || null,
    input.doctor_name || null,
    input.slot_start,
    duration,
    status,
    input.owner_id,
    now,
    now
  );
  return getAppointment(id)!;
}

export function updateAppointment(
  id: string,
  patch: Partial<{
    patient_name: string;
    phone: string;
    reason: string | null;
    doctor_name: string | null;
    slot_start: string;
    duration_minutes: number;
    status: AppointmentStatus;
    owner_id: string;
  }>
): Appointment | null {
  const existing = getAppointment(id);
  if (!existing) return null;

  if (patch.status && !canTransition(existing.status, patch.status)) {
    throw new Error(
      `Invalid status transition: ${existing.status} → ${patch.status}`
    );
  }

  const next = {
    patient_name: patch.patient_name ?? existing.patient_name,
    phone: patch.phone ?? existing.phone,
    reason: patch.reason !== undefined ? patch.reason : existing.reason,
    doctor_name:
      patch.doctor_name !== undefined ? patch.doctor_name : existing.doctor_name,
    slot_start: patch.slot_start ?? existing.slot_start,
    duration_minutes: patch.duration_minutes ?? existing.duration_minutes,
    status: patch.status ?? existing.status,
    owner_id: patch.owner_id ?? existing.owner_id,
  };
  const now = new Date().toISOString();
  const db = getDb();
  db.prepare(
    `UPDATE appointments SET
      patient_name = ?, phone = ?, reason = ?, doctor_name = ?,
      slot_start = ?, duration_minutes = ?, status = ?, owner_id = ?, updated_at = ?
     WHERE id = ?`
  ).run(
    next.patient_name,
    next.phone,
    next.reason,
    next.doctor_name,
    next.slot_start,
    next.duration_minutes,
    next.status,
    next.owner_id,
    now,
    id
  );
  return getAppointment(id);
}

export function deleteAppointment(id: string): boolean {
  const db = getDb();
  const r = db.prepare("DELETE FROM appointments WHERE id = ?").run(id);
  return r.changes > 0;
}

export function listNotes(appointmentId: string): Note[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT n.*, u.name as user_name
       FROM notes n JOIN users u ON u.id = n.user_id
       WHERE n.appointment_id = ?
       ORDER BY n.created_at ASC`
    )
    .all(appointmentId) as Note[];
}

export function addNote(
  appointmentId: string,
  userId: string,
  body: string
): Note {
  const db = getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO notes (id, appointment_id, user_id, body, created_at) VALUES (?, ?, ?, ?, ?)`
  ).run(id, appointmentId, userId, body, now);
  return db
    .prepare(
      `SELECT n.*, u.name as user_name FROM notes n JOIN users u ON u.id = n.user_id WHERE n.id = ?`
    )
    .get(id) as Note;
}

/** Queue helpers — pure filters over appointment list (testable). */
export function filterConfirmToday(
  appts: Appointment[],
  now: Date = new Date()
): Appointment[] {
  const today = karachiDateString(now);
  return appts.filter(
    (a) =>
      a.status === "requested" &&
      karachiDateString(new Date(a.slot_start)) === today
  );
}

export function filterRemind24h(
  appts: Appointment[],
  now: Date = new Date()
): Appointment[] {
  const end = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return appts.filter((a) => {
    if (a.status !== "confirmed") return false;
    const slot = new Date(a.slot_start);
    return slot >= now && slot <= end;
  });
}

export function filterNoShow(appts: Appointment[]): Appointment[] {
  return appts.filter((a) => a.status === "no_show");
}

export function getDashboardStats(now: Date = new Date()) {
  const all = listAppointments();
  const counts = {
    requested: 0,
    confirmed: 0,
    completed: 0,
    no_show: 0,
    cancelled: 0,
  } as Record<AppointmentStatus, number>;
  for (const a of all) {
    counts[a.status] = (counts[a.status] || 0) + 1;
  }
  return {
    counts,
    confirm_today: filterConfirmToday(all, now).length,
    remind_24h: filterRemind24h(all, now).length,
    no_show_open: filterNoShow(all).length,
    total: all.length,
  };
}
