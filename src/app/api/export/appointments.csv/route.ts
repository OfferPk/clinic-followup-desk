import { NextResponse } from "next/server";
import { AuthError, requireOwner } from "@/lib/auth";
import { listAppointments } from "@/lib/appointments";
import { csvEscape } from "@/lib/csv";

export async function GET() {
  try {
    await requireOwner();
    const appointments = listAppointments();
    const header = [
      "id",
      "patient_name",
      "phone",
      "reason",
      "doctor_name",
      "slot_start",
      "duration_minutes",
      "status",
      "owner_name",
      "created_at",
      "updated_at",
    ];
    const lines = [header.join(",")];
    for (const a of appointments) {
      lines.push(
        [
          csvEscape(a.id),
          csvEscape(a.patient_name),
          csvEscape(a.phone),
          csvEscape(a.reason),
          csvEscape(a.doctor_name),
          csvEscape(a.slot_start),
          csvEscape(a.duration_minutes),
          csvEscape(a.status),
          csvEscape(a.owner_name),
          csvEscape(a.created_at),
          csvEscape(a.updated_at),
        ].join(",")
      );
    }
    const body = lines.join("\n") + "\n";
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="appointments.csv"',
      },
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
