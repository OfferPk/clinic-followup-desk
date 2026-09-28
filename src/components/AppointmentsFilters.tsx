"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { DoctorChips } from "@/components/DoctorChips";

export function AppointmentsFilters({
  q,
  doctor,
  status,
  doctors,
}: {
  q: string;
  doctor: string;
  status: string;
  doctors: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(q);

  function push(next: { q?: string; doctor?: string; status?: string }) {
    const params = new URLSearchParams();
    const nq = next.q !== undefined ? next.q : q;
    const nd = next.doctor !== undefined ? next.doctor : doctor;
    const ns = next.status !== undefined ? next.status : status;
    if (nq.trim()) params.set("q", nq.trim());
    if (nd.trim()) params.set("doctor", nd.trim());
    if (ns.trim()) params.set("status", ns.trim());
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  function clearAll() {
    setQuery("");
    startTransition(() => router.push(pathname));
  }

  const hasFilters = Boolean(q || doctor || status);
  const preserve: Record<string, string> = {};
  if (q) preserve.q = q;
  if (status) preserve.status = status;

  return (
    <div className="card space-y-3 !py-3">
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          push({ q: query });
        }}
      >
        <div className="min-w-[200px] flex-1">
          <label className="label" htmlFor="appt-q">
            Search patient / phone
          </label>
          <input
            id="appt-q"
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name or phone…"
          />
        </div>
        <button type="submit" className="btn-primary" disabled={pending}>
          Search
        </button>
        {hasFilters && (
          <button
            type="button"
            className="btn-secondary"
            disabled={pending}
            onClick={clearAll}
          >
            Clear
          </button>
        )}
      </form>
      <DoctorChips
        doctors={doctors}
        doctor={doctor}
        preserveParams={preserve}
      />
      <p className="text-[11px] text-slate-400">
        Naam ya phone se dhoondo · doctor chip se filter
      </p>
    </div>
  );
}
