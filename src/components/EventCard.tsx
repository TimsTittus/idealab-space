"use client";

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
  const now = new Date();

  const isOngoing = now >= start && now <= end;
  const isPast = now > end;

  return (
    <div
      className={`min-w-[280px] max-w-[320px] snap-start rounded-3xl border p-5 shadow-sm transition-all hover:shadow-md hover:border-amber-400 active:scale-[0.98] ${isOngoing
        ? "bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20"
        : "bg-white border-stone-200"
        }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-black text-slate-950 tracking-tight leading-snug">
          {title}
        </h3>
        {isOngoing && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-200/60 border border-amber-300 px-2.5 py-0.5 text-[10px] font-black text-amber-900 uppercase tracking-wider shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
            Live
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-700">
        <div className="flex h-7 w-7 items-center justify-center rounded-xl shrink-0 bg-amber-100/80 text-slate-950">
          <Calendar className="h-3.5 w-3.5 text-amber-700" />
        </div>
        <span>
          {format(start, "d MMM")} · {format(start, "h:mm a")} -{" "}
          {format(end, "h:mm a")}
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
          {isOngoing ? (
            <span className="rounded-full bg-amber-200/60 border border-amber-300 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-900">
              Happening Now
            </span>
          ) : isPast ? (
            <span className="rounded-full bg-stone-100 border border-stone-200 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Ended
            </span>
          ) : (
            <span className="rounded-full bg-stone-100 border border-stone-200 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-700">
              In-Person
            </span>
          )}
        </div>
      )}
    </div>
  );
}