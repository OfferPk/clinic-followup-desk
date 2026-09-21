import { filterConfirmToday, listAppointments } from "@/lib/appointments";
import { QueueList } from "@/components/QueueList";

export const dynamic = "force-dynamic";

export default function ConfirmQueuePage() {
  const appointments = filterConfirmToday(listAppointments());
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Confirm today</h1>
      <p className="text-sm text-slate-500">
        Requested appointments with a slot today — open WhatsApp with confirm text, then mark confirmed.
      </p>
      <QueueList appointments={appointments} mode="confirm" />
    </div>
  );
}
