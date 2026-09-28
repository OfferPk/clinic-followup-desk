import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  countUsers,
  createSession,
  hashPassword,
  setSessionCookie,
} from "@/lib/auth";
import { logRequest, newRequestId } from "@/lib/logger";
import {
  checkRateLimit,
  recordRateLimitFailure,
} from "@/lib/rate-limit";
import type { Role } from "@/lib/types";

const MIN_PASSWORD = 10;

function clientIp(req: NextRequest): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim() || "unknown";
  return req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: NextRequest) {
  const requestId = newRequestId();
  const start = Date.now();
  try {
    const body = await req.json();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");
    const name = String(body.name || "").trim();

    const ip = clientIp(req);
    const ipKey = `register:ip:${ip}`;
    const lim = checkRateLimit(ipKey);
    if (!lim.ok) {
      return NextResponse.json(
        {
          error: `Too many registration attempts. Try again in ${lim.retryAfterSec}s.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(lim.retryAfterSec) },
        }
      );
    }

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }
    if (password.length < MIN_PASSWORD) {
      return NextResponse.json(
        { error: `Password must be at least ${MIN_PASSWORD} characters` },
        { status: 400 }
      );
    }

    const existing = countUsers();
    const role: Role = existing === 0 ? "owner" : "receptionist";
    // Public register only allowed for first user (owner bootstrap).
    // Further receptionists are created by owner via /api/users.
    if (existing > 0) {
      recordRateLimitFailure(ipKey);
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
      recordRateLimitFailure(ipKey);
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
