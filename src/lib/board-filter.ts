import { STATUSES, type AppointmentStatus } from "./types";

/** Statuses shown on the board when closed columns are hidden (default). */
export const ACTIVE_BOARD_STATUSES: AppointmentStatus[] = [
  "requested",
  "confirmed",
  "no_show",
];

/** Parse ?closed=1 or ?show=all → reveal completed + cancelled columns. */
export function parseBoardShowClosed(sp: {
  closed?: string;
  show?: string;
}): boolean {
  return sp.closed === "1" || sp.show === "all";
}

/** Visible board columns given the closed toggle. */
export function boardVisibleStatuses(
  showClosed: boolean
): AppointmentStatus[] {
  return showClosed ? [...STATUSES] : [...ACTIVE_BOARD_STATUSES];
}
