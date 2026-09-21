import { NextRequest, NextResponse } from "next/server";
import { AuthError, hashPassword, requireOwner } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { normalizeCreateUserRole } from "@/lib/users-policy";

export async function GET() {
  try {
    await requireOwner();
    const db = getDb();
    const users = db
      .prepare(
        `SELECT id, email, name, role, created_at FROM users ORDER BY created_at ASC`
      )
      .all();
    return NextResponse.json({ users });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireOwner();
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const name = String(body.name || "").trim();

    const roleResult = normalizeCreateUserRole(body.role);
    if (!roleResult.ok) {
      return NextResponse.json({ error: roleResult.error }, { status: 400 });
    }
    const role = roleResult.role;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "name, email, password required" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const db = getDb();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    try {
      db.prepare(
        `INSERT INTO users (id, email, password_hash, name, role, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(id, email, hashPassword(password), name, role, now);
    } catch {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }
    return NextResponse.json({
      user: { id, email, name, role, created_at: now },
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
