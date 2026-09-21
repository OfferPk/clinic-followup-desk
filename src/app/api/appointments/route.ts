import { NextRequest, NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth";
import {
  createAppointment,
  listAppointments,
} from "@/lib/appointments";
import { parseDurationMinutes } from "@/lib/duration";
import { preparePhoneForStorage, PHONE_REQUIRED_HINT } from "@/lib/phone";
import { STATUSES, type AppointmentStatus } from "@/lib/types";
import { logRequest, newRequestId } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const requestId = newRequestId();
  const start = Date.now();
  try {
    await requireUser();
    const status = req.nextUrl.searchParams.get("status") as AppointmentStatus | null;
    const date = req.nextUrl.searchParams.get("date");
    if (status && !STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const appointments = listAppointments({
      status: status || undefined,
      date: date || undefined,
    });
    logRequest({
      requestId,
      route: "GET /api/appointments",
      durationMs: Date.now() - start,
      status: 200,
    });
    return NextResponse.json({ appointments });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const requestId = newRequestId();
  const start = Date.now();
  try {
    const user = await requireUser();
    const body = await req.json();
    const patient_name = String(body.patient_name || "").trim();
    const phoneRaw = String(body.phone || "");
    const phone = preparePhoneForStorage(phoneRaw);
    const slot_start = String(body.slot_start || "").trim();
    const reason = body.reason != null ? String(body.reason).trim() : null;
    const doctor_name =
      body.doctor_name != null ? String(body.doctor_name).trim() : null;
    const durationResult = parseDurationMinutes(body.duration_minutes, {
      defaultWhenMissing: 30,
    });
    if (!durationResult.ok) {
      return NextResponse.json({ error: durationResult.error }, { status: 400 });
    }
    const duration_minutes = durationResult.value;
    const status = (body.status as AppointmentStatus) || "requested";
    const owner_id = body.owner_id ? String(body.owner_id) : user.id;

    if (!patient_name || !slot_start) {
      return NextResponse.json(
        { error: "patient_name and slot_start are required" },
        { status: 400 }
      );
    }
    if (!phone) {
      return NextResponse.json({ error: PHONE_REQUIRED_HINT }, { status: 400 });
    }
    if (!STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    if (Number.isNaN(new Date(slot_start).getTime())) {
      return NextResponse.json({ error: "Invalid slot_start" }, { status: 400 });
    }

    const appointment = createAppointment({
      patient_name,
      phone,
      reason,
      doctor_name,
      slot_start: new Date(slot_start).toISOString(),
      duration_minutes,
      status,
      owner_id,
    });

    logRequest({
      requestId,
      route: "POST /api/appointments",
      userId: user.id,
      durationMs: Date.now() - start,
      status: 200,
    });
    return NextResponse.json({ appointment });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}
