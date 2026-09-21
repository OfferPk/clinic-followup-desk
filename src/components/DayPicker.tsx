"use client";

import { useRouter } from "next/navigation";

export function DayPicker({ date }: { date: string }) {
  const router = useRouter();
  return (
    <input
      type="date"
      className="input !w-auto"
      value={date}
      onChange={(e) => router.push(`/day?date=${e.target.value}`)}
    />
  );
}
