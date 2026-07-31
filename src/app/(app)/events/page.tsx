"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Calendar, MapPin, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface EventItem {
  id: string;
  title: string;
  description: string;
  event_type: string;
  location: string;
  start_time: string;
  end_time: string;
}

type Tab = "upcoming" | "ongoing" | "past";

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");
  const [rawEvents, setRawEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState<Date>(() => new Date());

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("start_time", { ascending: true });

      if (!error && data) {
        setRawEvents(data);
      }
      setLoading(false);
    };

    fetchEvents();

    const channel = supabase
      .channel("public:events")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        () => {
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const { upcomingEvents, ongoingEvents, pastEvents } = useMemo(() => {
    const nowMs = now.getTime();
    const upcoming: EventItem[] = [];
    const ongoing: EventItem[] = [];
    const past: EventItem[] = [];

    for (const ev of rawEvents) {
      const startMs = new Date(ev.start_time).getTime();
      const endMs = new Date(ev.end_time).getTime();

      if (nowMs < startMs) {
        upcoming.push(ev);
      } else if (nowMs >= startMs && nowMs <= endMs) {
        ongoing.push(ev);
      } else {
        past.push(ev);
      }
    }

    upcoming.sort(
      (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
    ongoing.sort(
      (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
    past.sort(
      (a, b) => new Date(b.end_time).getTime() - new Date(a.end_time).getTime()
    );

    return {
      upcomingEvents: upcoming,
      ongoingEvents: ongoing,
      pastEvents: past,
    };
  }, [rawEvents, now]);

  const eventsMap = useMemo(
    () => ({
      upcoming: upcomingEvents,
      ongoing: ongoingEvents,
      past: pastEvents,
    }),
    [upcomingEvents, ongoingEvents, pastEvents]
  );

  const tabs: { key: Tab; label: string; count: number }[] = useMemo(
    () => [
      { key: "upcoming", label: "Upcoming", count: upcomingEvents.length },
      { key: "ongoing", label: "Ongoing", count: ongoingEvents.length },
      { key: "past", label: "Past", count: pastEvents.length },
    ],
    [upcomingEvents.length, ongoingEvents.length, pastEvents.length]
  );

  const activeEvents = eventsMap[activeTab];

  return (
    <div className="animate-fade-in px-5 pt-8 pb-24 min-h-dvh bg-[#FCFBF4]">
      <h1 className="text-2xl font-black text-slate-950 tracking-tight">
        Lab Events & Bootcamps
      </h1>
      <p className="mt-1 text-xs font-bold text-stone-500">
        Workshops, maker sessions, and tech activities at SJCET IDEA Lab
      </p>

      {/* Tabs */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-black transition-all active:scale-95 whitespace-nowrap ${activeTab === tab.key
              ? "bg-slate-950 text-amber-400 shadow-md"
              : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50"
              }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span
                className={`flex h-5 min-w-[20px] items-center justify-center rounded-full text-[10px] font-extrabold ${activeTab === tab.key
                  ? "bg-amber-400 text-slate-950"
                  : "bg-stone-100 text-stone-600"
                  }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Events List */}
      {loading ? (
        <div className="mt-16 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : activeEvents.length > 0 ? (
        <div className="mt-6 space-y-4 stagger-children">
          {activeEvents.map((event) => {
            const startMs = new Date(event.start_time).getTime();
            const endMs = new Date(event.end_time).getTime();
            const nowMs = now.getTime();
            const isOngoing = nowMs >= startMs && nowMs <= endMs;
            const isPast = nowMs > endMs;

            return (
              <div
                key={event.id}
                className={`rounded-3xl border p-5 shadow-sm transition-all hover:shadow-md hover:border-amber-400 ${isOngoing
                  ? "bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20"
                  : "bg-white border-stone-200"
                  }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-black text-slate-950 tracking-tight">
                    {event.title}
                  </h3>
                  {isOngoing && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-200/60 border border-amber-300 px-3 py-1 text-[10px] font-black text-amber-900 uppercase tracking-wider shrink-0">
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                      Happening Now
                    </span>
                  )}
                  {isPast && (
                    <span className="rounded-full bg-stone-100 border border-stone-200 px-3 py-1 text-[10px] font-bold text-stone-500 uppercase tracking-wider shrink-0">
                      Ended
                    </span>
                  )}
                </div>

                {event.description && (
                  <p className="mt-1.5 text-xs font-semibold text-stone-600 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>
                )}

                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-800">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl shrink-0 bg-amber-100/80 text-slate-950">
                    <Calendar className="h-3.5 w-3.5 text-amber-700" />
                  </div>
                  <span>
                    {format(new Date(event.start_time), "d MMM · h:mm a")} -{" "}
                    {format(new Date(event.end_time), "h:mm a")}
                  </span>
                </div>

                {event.location && (
                  <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-stone-500">
                    <MapPin className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                    <span>{event.location}</span>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {event.event_type && (
                    <span className="rounded-full bg-slate-950 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-400">
                      {event.event_type}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 border border-amber-300">
            <Calendar className="h-7 w-7 text-amber-800" />
          </div>
          <p className="mt-3 text-sm font-black text-slate-900 capitalize">
            No {activeTab} events scheduled
          </p>
          <p className="mt-1 text-xs text-stone-500">Check back soon for upcoming lab sessions.</p>
        </div>
      )}
    </div>
  );
}