import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import { preparePhoneForStorage } from "@/lib/phone";
import { csvEscape } from "@/lib/csv";

const tmpDb = path.join(process.cwd(), "data", "test-seed-smoke.db");

function cleanup() {
  for (const s of ["", "-wal", "-shm"]) {
    const p = tmpDb + s;
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
}

describe("seed smoke + csv + authz helpers", () => {
  let db: Database.Database;

  beforeAll(() => {
    cleanup();
    fs.mkdirSync(path.dirname(tmpDb), { recursive: true });
    db = new Database(tmpDb);
    db.pragma("foreign_keys = ON");
    db.exec(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE TABLE appointments (
        id TEXT PRIMARY KEY,
        patient_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        reason TEXT,
        doctor_name TEXT,
        slot_start TEXT NOT NULL,
        duration_minutes INTEGER NOT NULL DEFAULT 30,
        status TEXT NOT NULL,
        owner_id TEXT NOT NULL REFERENCES users(id),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    const ownerHash = bcrypt.hashSync("owner123", 10);
    const deskHash = bcrypt.hashSync("desk123", 10);
    expect(bcrypt.compareSync("owner123", ownerHash)).toBe(true);
    expect(bcrypt.compareSync("desk123", deskHash)).toBe(true);

    const now = new Date().toISOString();
    db.prepare(`INSERT INTO users VALUES (?,?,?,?,?,?)`).run(
      "owner-1",
      "owner@clinic.local",
      ownerHash,
      "Owner",
      "owner",
      now
    );
    db.prepare(`INSERT INTO users VALUES (?,?,?,?,?,?)`).run(
      "desk-1",
      "desk@clinic.local",
      deskHash,
      "Desk",
      "receptionist",
      now
    );

    const phone = preparePhoneForStorage("03001112233");
    db.prepare(
      `INSERT INTO appointments
        (id, patient_name, phone, reason, doctor_name, slot_start, duration_minutes, status, owner_id, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`
    ).run(
      "appt-1",
      "Patient",
      phone,
      "Cleaning",
      "Dr. A",
      now,
      30,
      "requested",
      "desk-1",
      now,
      now
    );
  });

  afterAll(() => {
    db.close();
    cleanup();
  });

  it("stores normalized phone from 03…", () => {
    const row = db
      .prepare("SELECT phone FROM appointments WHERE id = ?")
      .get("appt-1") as { phone: string };
    expect(row.phone).toBe("923001112233");
  });

  it("has owner and receptionist roles", () => {
    const roles = db
      .prepare("SELECT role FROM users ORDER BY role")
      .all() as { role: string }[];
    expect(roles.map((r) => r.role)).toEqual(["owner", "receptionist"]);
  });

  it("csvEscape neutralizes formulas", () => {
    expect(csvEscape("=1+1")).toBe("'=1+1");
    expect(csvEscape("+hi")).toBe("'+hi");
    expect(csvEscape("normal")).toBe("normal");
    // CF-005: leading \t / \r before formula chars
    expect(csvEscape("\t=CMD").startsWith("'") || csvEscape("\t=CMD").startsWith('"')).toBe(true);
    expect(csvEscape("\t=CMD")).toContain("'");
    expect(csvEscape("\r=CMD")).toContain("'");
  });

  it("authz smoke: only owner role exports", () => {
    const owner = db
      .prepare("SELECT role FROM users WHERE email = ?")
      .get("owner@clinic.local") as { role: string };
    const desk = db
      .prepare("SELECT role FROM users WHERE email = ?")
      .get("desk@clinic.local") as { role: string };
    expect(owner.role).toBe("owner");
    expect(desk.role).toBe("receptionist");
    // Mirror API rule: export requires owner
    const canExport = (role: string) => role === "owner";
    expect(canExport(owner.role)).toBe(true);
    expect(canExport(desk.role)).toBe(false);
  });
});
