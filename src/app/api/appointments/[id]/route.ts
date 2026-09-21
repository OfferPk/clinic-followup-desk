import { NextRequest, NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth";
import {
  deleteAppointment,
  getAppointment,
  updateAppointment,
} from "@/lib/appointments";
import { parseDurationMinutes } from "@/lib/duration";
import { preparePhoneForStorage, PHONE_REQUIRED_HINT } from "@/lib/phone";
import { STATUSES, type AppointmentStatus } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    await requireUser();
    const { id } = await ctx.params;
    const appointment = getAppointment(id);
    if (!appointment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ appointment });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    await requireUser();
    const { id } = await ctx.params;
    const body = await req.json();
    const patch: Record<string, unknown> = {};

    if (body.patient_name != null) patch.patient_name = String(body.patient_name).trim();
    if (body.phone != null) {
      const phone = preparePhoneForStorage(String(body.phone));
      if (!phone) {
        return NextResponse.json({ error: PHONE_REQUIRED_HINT }, { status: 400 });
      }
      patch.phone = phone;
    }
    if (body.reason !== undefined) {
      patch.reason = body.reason == null ? null : String(body.reason).trim();
    }
    if (body.doctor_name !== undefined) {
      patch.doctor_name =
        body.doctor_name == null ? null : String(body.doctor_name).trim();
    }
    if (body.slot_start != null) {
      const d = new Date(String(body.slot_start));
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: "Invalid slot_start" }, { status: 400 });
      }
      patch.slot_start = d.toISOString();
    }
    if (body.duration_minutes != null) {
      const durationResult = parseDurationMinutes(body.duration_minutes);
      if (!durationResult.ok) {
        return NextResponse.json({ error: durationResult.error }, { status: 400 });
      }
      patch.duration_minutes = durationResult.value;
    }
    if (body.status != null) {
      const status = body.status as AppointmentStatus;
      if (!STATUSES.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      patch.status = status;
    }
    if (body.owner_id != null) patch.owner_id = String(body.owner_id);

    try {
      const appointment = updateAppointment(id, patch as never);
      if (!appointment) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ appointment });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Update failed" },
        { status: 400 }
      );
    }
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    await requireUser();
    const { id } = await ctx.params;
    const ok = deleteAppointment(id);
    if (!ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
