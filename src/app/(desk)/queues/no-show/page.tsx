import { filterNoShow, listAppointments } from "@/lib/appointments";
import { QueueList } from "@/components/QueueList";

export const dynamic = "force-dynamic";

export default function NoShowQueuePage() {
  const appointments = filterNoShow(listAppointments());
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">No-show follow-up</h1>
      <p className="text-sm text-slate-500">
        Patients marked no-show — reach out to reschedule.
      </p>
      <QueueList appointments={appointments} mode="no_show" />
    </div>
  );
}
