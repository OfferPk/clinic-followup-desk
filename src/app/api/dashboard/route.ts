import { NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth";
import { getDashboardStats } from "@/lib/appointments";

export async function GET() {
  try {
    await requireUser();
    const stats = getDashboardStats();
    return NextResponse.json({ stats });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
