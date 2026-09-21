import { describe, it, expect } from "vitest";
import {
  filterConfirmToday,
  filterRemind24h,
  filterNoShow,
} from "@/lib/appointments";
import { canTransition, type Appointment } from "@/lib/types";

function appt(
  partial: Partial<Appointment> & Pick<Appointment, "id" | "status" | "slot_start">
): Appointment {
  return {
    patient_name: "Test",
    phone: "923001112233",
    reason: null,
    doctor_name: null,
    duration_minutes: 30,
    owner_id: "u1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...partial,
  };
}

describe("status transitions", () => {
  it("allows requested → confirmed", () => {
    expect(canTransition("requested", "confirmed")).toBe(true);
  });
  it("blocks completed → requested", () => {
    expect(canTransition("completed", "requested")).toBe(false);
  });
  it("allows no_show → confirmed (reschedule)", () => {
    expect(canTransition("no_show", "confirmed")).toBe(true);
  });
});

describe("queue filters", () => {
  const now = new Date("2026-09-21T10:00:00+05:00");

  it("confirm today = requested with slot today (Karachi)", () => {
    const list = [
      appt({
        id: "1",
        status: "requested",
        slot_start: "2026-09-21T12:00:00+05:00",
      }),
      appt({
        id: "2",
        status: "confirmed",
        slot_start: "2026-09-21T12:00:00+05:00",
      }),
      appt({
        id: "3",
        status: "requested",
        slot_start: "2026-09-22T12:00:00+05:00",
      }),
    ];
    const q = filterConfirmToday(list, now);
    expect(q.map((a) => a.id)).toEqual(["1"]);
  });

  it("remind 24h = confirmed within next 24h", () => {
    const list = [
      appt({
        id: "a",
        status: "confirmed",
        slot_start: "2026-09-21T20:00:00+05:00",
      }),
      appt({
        id: "b",
        status: "confirmed",
        slot_start: "2026-09-23T10:00:00+05:00",
      }),
      appt({
        id: "c",
        status: "requested",
        slot_start: "2026-09-21T20:00:00+05:00",
      }),
      appt({
        id: "d",
        status: "confirmed",
        slot_start: "2026-09-21T08:00:00+05:00", // past
      }),
    ];
    const q = filterRemind24h(list, now);
    expect(q.map((a) => a.id)).toEqual(["a"]);
  });

  it("no_show filter", () => {
    const list = [
      appt({ id: "n1", status: "no_show", slot_start: "2026-09-20T10:00:00+05:00" }),
      appt({ id: "n2", status: "completed", slot_start: "2026-09-20T10:00:00+05:00" }),
    ];
    expect(filterNoShow(list).map((a) => a.id)).toEqual(["n1"]);
  });
});
