import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  countUsers,
  createSession,
  hashPassword,
  setSessionCookie,
} from "@/lib/auth";
import { logRequest, newRequestId } from "@/lib/logger";
import type { Role } from "@/lib/types";

export async function POST(req: NextRequest) {
  const requestId = newRequestId();
  const start = Date.now();
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const name = String(body.name || "").trim();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existing = countUsers();
    const role: Role = existing === 0 ? "owner" : "receptionist";
    // Public register only allowed for first user (owner bootstrap).
    // Further receptionists are created by owner via /api/users.
    if (existing > 0) {
      return NextResponse.json(
        { error: "Registration closed — ask owner to create your account" },
        { status: 403 }
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

    const sessionId = createSession(id);
    await setSessionCookie(sessionId, req.headers);

    logRequest({
      requestId,
      route: "POST /api/auth/register",
      userId: id,
      durationMs: Date.now() - start,
      status: 200,
    });

    return NextResponse.json({
      user: { id, email, name, role },
    });
  } catch (e) {
    logRequest({
      requestId,
      route: "POST /api/auth/register",
      durationMs: Date.now() - start,
      status: 500,
      error: String(e),
    });
    return NextResponse.json({ error: "Register failed" }, { status: 500 });
  }
}
