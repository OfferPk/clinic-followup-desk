"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/board", label: "Board" },
  { href: "/appointments", label: "Appointments" },
  { href: "/day", label: "Day" },
  { href: "/queues/confirm", label: "Confirm" },
  { href: "/queues/remind", label: "Remind" },
  { href: "/queues/no-show", label: "No-show" },
  { href: "/team", label: "Team" },
  { href: "/export", label: "Export" },
];

export function Nav({
  user,
}: {
  user: { name: string; role: string; email: string };
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-3 py-2">
        <Link href="/dashboard" className="text-base font-bold text-teal-700">
          ClinicDesk
        </Link>
        <nav className="flex flex-wrap gap-1">
          {links.map((l) => {
            if (l.href === "/team" || l.href === "/export") {
              if (user.role !== "owner") return null;
            }
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-md px-2 py-1 text-xs font-medium ${
                  active
                    ? "bg-teal-50 text-teal-800"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>
            {user.name} · {user.role}
          </span>
          <button type="button" onClick={logout} className="btn-secondary !py-1 !text-xs">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
