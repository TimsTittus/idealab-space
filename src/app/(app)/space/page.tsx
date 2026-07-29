import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Zap, Users, HelpCircle, ChevronRight, Calendar } from "lucide-react";
import EventCard from "@/components/EventCard";

export default async function SpacePage() {
  const supabase = await createClient();

  const [{ count: activeCheckins }, { data: upcomingEvents }] = await Promise.all([
    supabase
      .from("space_checkins")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("events")
      .select("*")
      .gte("start_time", new Date().toISOString())
      .order("start_time", { ascending: true })
      .limit(3),
  ]);

  return (
    <div className="animate-fade-in">
      <div className="relative overflow-hidden bg-gradient-to-b from-sky-400 via-sky-300 to-sky-200 px-5 pb-8 pt-14">
        <div className="absolute -right-10 top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute left-10 bottom-0 h-24 w-24 rounded-full bg-white/5" />

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-text-primary shadow-sm">
              <Zap className="h-3.5 w-3.5 text-accent-amber" />
              Available
            </span>
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
            IDEA Lab
          </h1>
          <p className="mt-1 text-sm font-medium text-white/70">
            SJCET Choondacherry
          </p>
        </div>
      </div>

      <div className="px-5 -mt-4">
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-text-primary">Space check-in</p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="flex h-2 w-2 rounded-full bg-accent-green animate-pulse-dot" />
                <span className="text-xs text-text-secondary">
                  {activeCheckins || 0} makers in lab
                </span>
              </div>
            </div>
            <Link
              href="/space/checkin"
              className="rounded-full bg-text-primary px-5 py-2.5 text-sm font-bold text-white transition-all active:scale-95"
            >
              CHECK-IN
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 px-5">
        <Link
          href="/events"
          className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition-all active:scale-[0.98]"
        >
          <Users className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-semibold">Space activities</p>
          </div>
        </Link>
        <Link
          href="/equipment"
          className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition-all active:scale-[0.98]"
        >
          <HelpCircle className="h-5 w-5 text-accent-amber" />
          <div>
            <p className="text-sm font-semibold">Need help?</p>
          </div>
        </Link>
      </div>

      <div className="mt-5 overflow-hidden bg-text-primary py-2.5">
        <div className="animate-marquee flex whitespace-nowrap">
          <span className="mx-4 text-sm font-semibold text-accent-amber">
            Keep Tinkering ✨
          </span>
          <span className="mx-4 text-sm font-semibold text-white">
            Build · Learn · Grow
          </span>
          <span className="mx-4 text-sm font-semibold text-accent-green">
            Innovation starts here 🚀
          </span>
          <span className="mx-4 text-sm font-semibold text-accent-amber">
            Keep Tinkering ✨
          </span>
          <span className="mx-4 text-sm font-semibold text-white">
            Build · Learn · Grow
          </span>
          <span className="mx-4 text-sm font-semibold text-accent-green">
            Innovation starts here 🚀
          </span>
        </div>
      </div>

      <div className="mt-6 px-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Upcoming</h2>
          <Link
            href="/events"
            className="flex items-center gap-1 text-sm text-text-secondary"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {upcomingEvents && upcomingEvents.length > 0 ? (
          <div className="hide-scrollbar mt-4 flex snap-x gap-4 overflow-x-auto pb-2">
            {upcomingEvents.map((event) => (
              <EventCard
                key={event.id}
                title={event.title}
                eventType={event.event_type}
                location={event.location}
                startTime={event.start_time}
                endTime={event.end_time}
              />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-border-light bg-surface-secondary p-8 text-center">
            <Calendar className="mx-auto h-8 w-8 text-text-tertiary" />
            <p className="mt-2 text-sm text-text-secondary">
              No upcoming events
            </p>
          </div>
        )}
      </div>
    </div>
  );
}