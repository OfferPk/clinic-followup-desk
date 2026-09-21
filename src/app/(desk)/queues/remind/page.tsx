import { filterRemind24h, listAppointments } from "@/lib/appointments";
import { QueueList } from "@/components/QueueList";

export const dynamic = "force-dynamic";

export default function RemindQueuePage() {
  const appointments = filterRemind24h(listAppointments());
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Remind next 24h</h1>
      <p className="text-sm text-slate-500">
        Confirmed appointments starting within the next 24 hours.
      </p>
      <QueueList appointments={appointments} mode="remind" />
    </div>
  );
}
