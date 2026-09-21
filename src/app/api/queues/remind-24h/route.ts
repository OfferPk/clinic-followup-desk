import { NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth";
import { filterRemind24h, listAppointments } from "@/lib/appointments";

export async function GET() {
  try {
    await requireUser();
    const appointments = filterRemind24h(listAppointments());
    return NextResponse.json({ appointments, count: appointments.length });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
