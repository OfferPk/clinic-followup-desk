export type Role = "owner" | "receptionist";

export type AppointmentStatus =
  | "requested"
  | "confirmed"
  | "completed"
  | "no_show"
  | "cancelled";

export const STATUSES: AppointmentStatus[] = [
  "requested",
  "confirmed",
  "completed",
  "no_show",
  "cancelled",
];

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  requested: "Requested",
  confirmed: "Confirmed",
  completed: "Completed",
  no_show: "No-show",
  cancelled: "Cancelled",
};

/** Allowed status transitions (from → tos). Same status always allowed (no-op). */
export const STATUS_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  requested: ["requested", "confirmed", "cancelled", "no_show"],
  confirmed: ["confirmed", "completed", "no_show", "cancelled", "requested"],
  completed: ["completed", "no_show"],
  no_show: ["no_show", "confirmed", "cancelled", "requested"],
  cancelled: ["cancelled", "requested", "confirmed"],
};

export function canTransition(
  from: AppointmentStatus,
  to: AppointmentStatus
): boolean {
  return STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_name: string;
  phone: string;
  reason: string | null;
  doctor_name: string | null;
  slot_start: string;
  duration_minutes: number;
  status: AppointmentStatus;
  owner_id: string;
  created_at: string;
  updated_at: string;
  owner_name?: string;
}

export interface Note {
  id: string;
  appointment_id: string;
  user_id: string;
  body: string;
  created_at: string;
  user_name?: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface DashboardStats {
  counts: Record<AppointmentStatus, number>;
  confirm_today: number;
  remind_24h: number;
  no_show_open: number;
  total: number;
}
