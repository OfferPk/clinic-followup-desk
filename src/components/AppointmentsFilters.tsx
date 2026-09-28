"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";

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
      {doctors.length > 0 && (
        <div>
          <div className="mb-1.5 text-xs font-medium text-slate-600">
            Doctor
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => push({ doctor: "" })}
              className={`rounded-full px-2.5 py-1 text-xs font-medium border ${
                !doctor
                  ? "border-teal-600 bg-teal-50 text-teal-800"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              All
            </button>
            {doctors.map((d) => {
              const active = doctor.toLowerCase() === d.toLowerCase();
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => push({ doctor: active ? "" : d })}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium border ${
                    active
                      ? "border-teal-600 bg-teal-50 text-teal-800"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <p className="text-[11px] text-slate-400">
        Naam ya phone se dhoondo · doctor chip se filter
      </p>
    </div>
  );
}
