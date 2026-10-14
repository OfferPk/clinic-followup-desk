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

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] ?? "").join("").toUpperCase() || "C";
}

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
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="site-header">
        <div className="site-header-inner">
          <Link href="/dashboard" className="brand-lockup" aria-label="ClinicDesk dashboard">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4v16M4 12h16" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            </span>
            <span className="brand-copy">
              <span className="brand-name">ClinicDesk</span>
              <span className="brand-caption">APPOINTMENT FOLLOW-UP</span>
            </span>
          </Link>

          <nav className="primary-nav" aria-label="Primary navigation">
            {links.map((link) => {
              if ((link.href === "/team" || link.href === "/export") && user.role !== "owner") return null;
              const active = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`nav-link${active ? " is-active" : ""}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="user-actions">
            <div className="user-profile" title={`${user.name} · ${user.role}`}>
              <span className="user-avatar" aria-hidden="true">{initials(user.name)}</span>
              <span className="user-meta">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.role}</span>
              </span>
            </div>
            <button type="button" onClick={logout} className="logout-button" aria-label="Log out">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10 17l5-5-5-5M15 12H3" />
                <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
              </svg>
              <span>Log out</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
