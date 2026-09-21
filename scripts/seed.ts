/**
 * Seed demo clinic: owner + receptionist + sample appointments/notes.
 * Usage: npm run seed
 */
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";

const dbPath = process.env.DATABASE_PATH
  ? path.isAbsolute(process.env.DATABASE_PATH)
    ? process.env.DATABASE_PATH
    : path.join(process.cwd(), process.env.DATABASE_PATH)
  : path.join(process.cwd(), "data", "clinic.db");

const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

for (const suffix of ["", "-wal", "-shm"]) {
  const p = dbPath + suffix;
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('owner', 'receptionist')),
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    patient_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    reason TEXT,
    doctor_name TEXT,
    slot_start TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    status TEXT NOT NULL CHECK(status IN ('requested', 'confirmed', 'completed', 'no_show', 'cancelled')),
    owner_id TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    appointment_id TEXT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id),
    body TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

const hash = (p: string) => bcrypt.hashSync(p, 10);
const now = new Date();
const iso = (d: Date) => d.toISOString();
const hoursFrom = (h: number) => {
  const d = new Date(now);
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + h);
  return d;
};
const daysAgo = (n: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d;
};

const ownerId = crypto.randomUUID();
const deskId = crypto.randomUUID();

db.prepare(
  `INSERT INTO users (id, email, password_hash, name, role, created_at) VALUES (?, ?, ?, ?, ?, ?)`
).run(ownerId, "owner@clinic.local", hash("owner123"), "Dr. Ayesha Khan", "owner", iso(daysAgo(30)));

db.prepare(
  `INSERT INTO users (id, email, password_hash, name, role, created_at) VALUES (?, ?, ?, ?, ?, ?)`
).run(deskId, "desk@clinic.local", hash("desk123"), "Fatima Reception", "receptionist", iso(daysAgo(20)));

type Seed = {
  patient_name: string;
  phone: string;
  reason?: string;
  doctor_name?: string;
  slot: Date;
  status: string;
  owner_id: string;
  note?: string;
  duration?: number;
};

const seeds: Seed[] = [
  {
    patient_name: "Omar Siddiqui",
    phone: "923001112233",
    reason: "Dental cleaning",
    doctor_name: "Dr. Ayesha Khan",
    slot: hoursFrom(3),
    status: "requested",
    owner_id: deskId,
    note: "Called from WhatsApp — needs confirm today.",
  },
  {
    patient_name: "Sana Malik",
    phone: "923334445566",
    reason: "Physio follow-up",
    doctor_name: "Dr. Bilal Ahmed",
    slot: hoursFrom(5),
    status: "confirmed",
    owner_id: deskId,
    note: "Confirmed yesterday.",
  },
  {
    patient_name: "Hassan Ali",
    phone: "923007778899",
    reason: "Blood test",
    doctor_name: "Lab Desk",
    slot: hoursFrom(12),
    status: "confirmed",
    owner_id: ownerId,
  },
  {
    patient_name: "Noor Fatima",
    phone: "923212223344",
    reason: "Aesthetic consult",
    doctor_name: "Dr. Ayesha Khan",
    slot: hoursFrom(-26),
    status: "no_show",
    owner_id: deskId,
    note: "Missed slot — follow up to reschedule.",
  },
  {
    patient_name: "Zainab Iqbal",
    phone: "923455556667",
    reason: "Check-up",
    slot: hoursFrom(-48),
    status: "completed",
    owner_id: ownerId,
  },
  {
    patient_name: "Ali Raza",
    phone: "923001234567",
    reason: "X-ray",
    doctor_name: "Lab Desk",
    slot: hoursFrom(48),
    status: "cancelled",
    owner_id: deskId,
    note: "Patient cancelled — family travel.",
  },
  {
    patient_name: "Maryam Shah",
    phone: "03009876543",
    reason: "Orthodontic adjust",
    doctor_name: "Dr. Ayesha Khan",
    slot: hoursFrom(2),
    status: "requested",
    owner_id: deskId,
  },
];

const insertAppt = db.prepare(
  `INSERT INTO appointments
    (id, patient_name, phone, reason, doctor_name, slot_start, duration_minutes, status, owner_id, created_at, updated_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
);
const insertNote = db.prepare(
  `INSERT INTO notes (id, appointment_id, user_id, body, created_at) VALUES (?, ?, ?, ?, ?)`
);

function rewritePk(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("03") && digits.length === 11) return "92" + digits.slice(1);
  return digits;
}

for (const s of seeds) {
  const id = crypto.randomUUID();
  const created = iso(daysAgo(1));
  insertAppt.run(
    id,
    s.patient_name,
    rewritePk(s.phone),
    s.reason || null,
    s.doctor_name || null,
    iso(s.slot),
    s.duration ?? 30,
    s.status,
    s.owner_id,
    created,
    created
  );
  if (s.note) {
    insertNote.run(crypto.randomUUID(), id, s.owner_id, s.note, created);
  }
}

db.close();

console.log("Seeded ClinicDesk demo data at", dbPath);
console.log("");
console.log("Demo logins:");
console.log("  Owner:        owner@clinic.local / owner123");
console.log("  Receptionist: desk@clinic.local / desk123");
console.log("");
console.log("Run: npm run dev");
