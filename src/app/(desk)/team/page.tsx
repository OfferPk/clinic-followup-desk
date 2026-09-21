import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { TeamForm } from "@/components/TeamForm";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "owner") redirect("/dashboard");

  const users = getDb()
    .prepare(
      `SELECT id, email, name, role, created_at FROM users ORDER BY created_at ASC`
    )
    .all() as {
    id: string;
    email: string;
    name: string;
    role: string;
    created_at: string;
  }[];

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-xl font-bold">Team</h1>
      <p className="text-sm text-slate-500">
        Owner can create receptionist accounts. Shared desk — all staff see all appointments.
      </p>
      <div className="card space-y-2">
        {users.map((u) => (
          <div
            key={u.id}
            className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0"
          >
            <div>
              <div className="font-medium">{u.name}</div>
              <div className="text-xs text-slate-500">{u.email}</div>
            </div>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{u.role}</span>
          </div>
        ))}
      </div>
      <TeamForm />
    </div>
  );
}
