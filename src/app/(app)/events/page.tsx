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
  const [events, setEvents] = useState<{
    upcoming: EventItem[];
    ongoing: EventItem[];
    past: EventItem[];
  }>({ upcoming: [], ongoing: [], past: [] });
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const fetchEvents = async () => {
      const now = new Date().toISOString();

      const [upcomingRes, ongoingRes, pastRes] = await Promise.all([
        supabase
          .from("events")
          .select("*")
          .gt("start_time", now)
          .order("start_time", { ascending: true }),
        supabase
          .from("events")
          .select("*")
          .lte("start_time", now)
          .gte("end_time", now)
          .order("start_time", { ascending: true }),
        supabase
          .from("events")
          .select("*")
          .lt("end_time", now)
          .order("start_time", { ascending: false })
          .limit(20),
      ]);

      setEvents({
        upcoming: upcomingRes.data || [],
        ongoing: ongoingRes.data || [],
        past: pastRes.data || [],
      });
      setLoading(false);
    };

    fetchEvents();
  }, [supabase]);

  const tabs: { key: Tab; label: string; count: number }[] = useMemo(
    () => [
      { key: "upcoming", label: "Upcoming", count: events.upcoming.length },
      { key: "ongoing", label: "Ongoing", count: events.ongoing.length },
      { key: "past", label: "Past", count: events.past.length },
    ],
    [events]
  );

  const activeEvents = events[activeTab];

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
          {activeEvents.map((event) => (
            <div
              key={event.id}
              className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-amber-400"
            >
              <h3 className="text-base font-black text-slate-950 tracking-tight">
                {event.title}
              </h3>

              {event.description && (
                <p className="mt-1.5 text-xs font-semibold text-stone-600 line-clamp-2 leading-relaxed">
                  {event.description}
                </p>
              )}

              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-800">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-100 text-slate-950 shrink-0">
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
                {activeTab === "ongoing" && (
                  <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-[10px] font-black text-emerald-800 uppercase tracking-wider">
                    🟢 Happening Now
                  </span>
                )}
              </div>
            </div>
          ))}
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