"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";

/**
 * Shared doctor filter chips (appointments list + day list).
 * preserveParams are other query keys kept when doctor changes;
 * clearing doctor removes only the doctor key.
 */
export function DoctorChips({
  doctors,
  doctor,
  preserveParams = {},
}: {
  doctors: string[];
  doctor: string;
  preserveParams?: Record<string, string>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  function pushDoctor(next: string) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(preserveParams)) {
      if (v && v.trim()) params.set(k, v.trim());
    }
    if (next.trim()) params.set("doctor", next.trim());
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  if (doctors.length === 0) return null;

  return (
    <div>
      <div className="mb-1.5 text-xs font-medium text-slate-600">Doctor</div>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          disabled={pending}
          onClick={() => pushDoctor("")}
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
              disabled={pending}
              onClick={() => pushDoctor(active ? "" : d)}
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
  );
}
