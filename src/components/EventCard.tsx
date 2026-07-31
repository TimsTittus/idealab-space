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
    <div className="min-w-[280px] max-w-[320px] snap-start rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-amber-400 active:scale-[0.98]">
      <h3 className="text-base font-black text-slate-950 tracking-tight leading-snug">
        {title}
      </h3>

      <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-700">
        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-100 text-slate-950 shrink-0">
          <Calendar className="h-3.5 w-3.5 text-amber-700" />
        </div>
        <span>
          {format(start, "d MMM")} · {format(start, "h:mm a")} - {format(end, "h:mm a")}
        </span>
      </div>

      {location && (
        <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-stone-500">
          <MapPin className="h-3.5 w-3.5 text-stone-400 shrink-0" />
          <span className="truncate">{location}</span>
        </div>
      )}

      {eventType && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-950 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-400">
            {eventType}
          </span>
          <span className="rounded-full bg-stone-100 border border-stone-200 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-700">
            In-Person
          </span>
        </div>
      )}
    </div>
  );
}