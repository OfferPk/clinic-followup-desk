import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const tmpDb = path.join(process.cwd(), "data", "test-appointments-filters.db");

function cleanupDbFiles() {
  for (const s of ["", "-wal", "-shm"]) {
    const p = tmpDb + s;
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
}

describe("listAppointments q + doctor + status filters", () => {
  let listAppointments: typeof import("@/lib/appointments").listAppointments;
  let listDistinctDoctors: typeof import("@/lib/appointments").listDistinctDoctors;
  let closeDb: typeof import("@/lib/db").closeDb;
  let ownerId: string;
  let idOmar: string;
  let idSana: string;
  let idHassan: string;

  beforeAll(async () => {
    cleanupDbFiles();
    fs.mkdirSync(path.dirname(tmpDb), { recursive: true });
    process.env.DATABASE_PATH = tmpDb;

    const dbMod = await import("@/lib/db");
    closeDb = dbMod.closeDb;
    closeDb();
    const db = dbMod.getDb();
    const now = new Date().toISOString();
    ownerId = crypto.randomUUID();
    idOmar = crypto.randomUUID();
    idSana = crypto.randomUUID();
    idHassan = crypto.randomUUID();

    db.prepare(
      `INSERT INTO users (id, email, password_hash, name, role, created_at) VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      ownerId,
      "owner@filt.local",
      bcrypt.hashSync("password12", 10),
      "Owner",
      "owner",
      now
    );

    const insert = db.prepare(
      `INSERT INTO appointments
        (id, patient_name, phone, reason, doctor_name, slot_start, duration_minutes, status, owner_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 30, ?, ?, ?, ?)`
    );
    insert.run(
      idOmar,
      "Omar Siddiqui",
      "923001112233",
      "Dental",
      "Dr. Ayesha Khan",
      "2026-09-28T10:00:00.000Z",
      "requested",
      ownerId,
      now,
      now
    );
    insert.run(
      idSana,
      "Sana Malik",
      "923334445566",
      "Physio",
      "Dr. Bilal Ahmed",
      "2026-09-28T11:00:00.000Z",
      "confirmed",
      ownerId,
      now,
      now
    );
    insert.run(
      idHassan,
      "Hassan Ali",
      "923007778899",
      "Blood test",
      "Dr. Ayesha Khan",
      "2026-09-28T12:00:00.000Z",
      "confirmed",
      ownerId,
      now,
      now
    );

    const apptMod = await import("@/lib/appointments");
    listAppointments = apptMod.listAppointments;
    listDistinctDoctors = apptMod.listDistinctDoctors;
  });

  afterAll(() => {
    closeDb();
    cleanupDbFiles();
  });

  it("filters by q on patient_name", () => {
    const rows = listAppointments({ q: "omar" });
    expect(rows.map((r) => r.id)).toEqual([idOmar]);
  });

  it("filters by q on phone substring", () => {
    const rows = listAppointments({ q: "333444" });
    expect(rows.map((r) => r.id)).toEqual([idSana]);
  });

  it("filters by doctor case-insensitively", () => {
    const rows = listAppointments({ doctor: "dr. ayesha khan" });
    expect(rows.map((r) => r.id).sort()).toEqual([idHassan, idOmar].sort());
  });

  it("combines q + doctor + status", () => {
    const rows = listAppointments({
      q: "hassan",
      doctor: "Dr. Ayesha Khan",
      status: "confirmed",
    });
    expect(rows.map((r) => r.id)).toEqual([idHassan]);
  });

  it("lists distinct doctors", () => {
    const docs = listDistinctDoctors();
    expect(docs).toEqual(["Dr. Ayesha Khan", "Dr. Bilal Ahmed"]);
  });

  it("returns empty for unmatched doctor", () => {
    expect(listAppointments({ doctor: "Nobody" })).toHaveLength(0);
  });
});
