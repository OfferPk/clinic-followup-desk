"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STEPS_BASE = [
  {
    n: 1,
    en: "Book your first appointment",
    ur: "Pehla appointment book karo",
    href: "/appointments/new",
    cta: "New appointment",
    ownerOnly: false,
  },
  {
    n: 2,
    en: "Open Confirm today queue",
    ur: "Aaj ki Confirm queue kholo",
    href: "/queues/confirm",
    cta: "Confirm today",
    ownerOnly: false,
  },
  {
    n: 3,
    en: "Invite a receptionist",
    ur: "Receptionist invite karo",
    href: "/team",
    cta: "Open Team",
    ownerOnly: true,
  },
] as const;

function storageKey(userId: string) {
  return `clinicdesk_onboarding_dismissed_${userId}`;
}

export function OnboardingChecklist({
  show,
  userId,
  isOwner,
}: {
  show: boolean;
  userId: string;
  isOwner: boolean;
}) {
  const [dismissed, setDismissed] = useState(true); // hide until hydrated
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(storageKey(userId));
      setDismissed(v === "1");
    } catch {
      setDismissed(false);
    }
    setReady(true);
  }, [userId]);

  if (!show || !ready || dismissed) return null;

  const steps = STEPS_BASE.filter((s) => !s.ownerOnly || isOwner).map(
    (s, i) => ({ ...s, n: i + 1 })
  );

  function dismiss() {
    try {
      localStorage.setItem(storageKey(userId), "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  }

  return (
    <div className="card border-teal-200 bg-gradient-to-br from-teal-50/80 to-white space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-teal-900">
            Get started in 3 steps
          </h2>
          <p className="text-xs text-teal-800/80">
            3 steps mein shuru — book, confirm, invite desk
          </p>
        </div>
        <button
          type="button"
          className="text-xs text-slate-500 hover:text-slate-700"
          onClick={dismiss}
        >
          Dismiss / Chhupa do
        </button>
      </div>
      <ol className="space-y-2">
        {steps.map((s) => (
          <li
            key={s.href}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/80 px-3 py-2 text-sm"
          >
            <div className="min-w-0">
              <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[11px] font-bold text-white">
                {s.n}
              </span>
              <span className="font-medium text-slate-800">{s.en}</span>
              <div className="ml-7 text-xs text-slate-500">{s.ur}</div>
            </div>
            <Link href={s.href} className="btn-secondary !py-1 !px-2 text-xs">
              {s.cta}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
