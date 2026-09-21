import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ExportPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "owner") redirect("/dashboard");

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-xl font-bold">Export</h1>
      <p className="text-sm text-slate-500">
        Download all appointments as CSV (formula-safe). Owners only.
      </p>
      <a href="/api/export/appointments.csv" className="btn-primary inline-flex">
        Download appointments.csv
      </a>
    </div>
  );
}
