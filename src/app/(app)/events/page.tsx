"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Calendar, MapPin } from "lucide-react";
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
    <div className="animate-fade-in px-5 pt-8">
      <h1 className="text-2xl font-extrabold text-text-primary">Events</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Workshops, bootcamps, and activities at IDEA Lab
      </p>

      {/* Tabs */}
      <div className="mt-6 flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all active:scale-95 ${activeTab === tab.key
              ? "border-text-primary bg-text-primary text-white"
              : "border-border text-text-secondary"
              }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`flex h-5 min-w-[20px] items-center justify-center rounded-full text-xs ${activeTab === tab.key
                  ? "bg-white/20 text-white"
                  : "bg-surface-tertiary text-text-tertiary"
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
        <div className="mt-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      ) : activeEvents.length > 0 ? (
        <div className="mt-6 space-y-4 stagger-children pb-4">
          {activeEvents.map((event) => (
            <div
              key={event.id}
              className="rounded-2xl border border-border bg-surface p-5 transition-all hover:shadow-sm"
            >
              <h3 className="text-lg font-bold text-text-primary">
                {event.title}
              </h3>

              {event.description && (
                <p className="mt-1.5 text-sm text-text-secondary line-clamp-2">
                  {event.description}
                </p>
              )}

              <div className="mt-3 flex items-center gap-2 text-sm text-text-secondary">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>
                  {format(new Date(event.start_time), "d MMM · hh:mm a")} -{" "}
                  {format(new Date(event.end_time), "hh:mm a")}
                </span>
              </div>

              {event.location && (
                <div className="mt-1.5 flex items-center gap-2 text-sm text-text-secondary">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{event.location}</span>
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {event.event_type && (
                  <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                    {event.event_type}
                  </span>
                )}
                {activeTab === "ongoing" && (
                  <span className="rounded-full bg-accent-green/10 px-3 py-1 text-xs font-semibold text-accent-green">
                    🟢 Happening Now
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-12 text-center">
          <Calendar className="mx-auto h-10 w-10 text-text-tertiary" />
          <p className="mt-3 text-sm text-text-secondary">
            No {activeTab} events
          </p>
        </div>
      )}
    </div>
  );
}