import { Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";

interface EventCardProps {
  title: string;
  description?: string;
  eventType?: string;
  location?: string;
  startTime: string;
  endTime: string;
  imageUrl?: string;
}

export default function EventCard({
  title,
  eventType,
  location,
  startTime,
  endTime,
}: EventCardProps) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  return (
    <div className="min-w-[280px] snap-start rounded-2xl border border-border bg-surface p-5 transition-all hover:shadow-md active:scale-[0.98]">
      <h3 className="text-lg font-bold text-text-primary">{title}</h3>

      <div className="mt-3 flex items-center gap-2 text-sm text-text-secondary">
        <Calendar className="h-4 w-4 shrink-0" />
        <span>
          {format(start, "d MMM")} · {format(start, "hh:mm a")} -{" "}
          {format(end, "hh:mm a")}
        </span>
      </div>

      {location && (
        <div className="mt-1.5 flex items-center gap-2 text-sm text-text-secondary">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">{location}</span>
        </div>
      )}

      {eventType && (
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-wide text-text-primary">
            {eventType}
          </span>
          <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Offline
          </span>
        </div>
      )}
    </div>
  );
}