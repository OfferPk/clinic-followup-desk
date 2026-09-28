"use client";

import { useRouter } from "next/navigation";

export function DayPicker({
  date,
  doctor = "",
}: {
  date: string;
  doctor?: string;
}) {
  const router = useRouter();
  return (
    <input
      type="date"
      className="input !w-auto"
      value={date}
      onChange={(e) => {
        const params = new URLSearchParams();
        params.set("date", e.target.value);
        if (doctor.trim()) params.set("doctor", doctor.trim());
        router.push(`/day?${params.toString()}`);
      }}
    />
  );
}
