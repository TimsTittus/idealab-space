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
      .gte("end_time", new Date().toISOString())
      .order("start_time", { ascending: true })
      .limit(3),
  ]);

  return (
    <div className="animate-fade-in pb-24 bg-[#FCFBF4]">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#FFE033] via-[#FFB703] to-[#FB8500] px-5 pb-10 pt-12 text-slate-950 shadow-lg">
        <div className="absolute -right-10 top-10 h-44 w-44 rounded-full bg-white/25 blur-xl pointer-events-none" />
        <div className="absolute left-10 bottom-0 h-32 w-32 rounded-full bg-orange-600/20 blur-lg pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-slate-950 px-3.5 py-1.5 text-xs font-black text-amber-400 shadow-md">
              <Zap className="h-3.5 w-3.5" />
              Open Lab Space
            </span>
          </div>

          <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            SJCET IDEA Lab
          </h1>
          <p className="mt-1 text-xs font-bold text-slate-950/80">
            Choondacherry · Main Fabrication Facility
          </p>
        </div>
      </div>

      <div className="px-5 -mt-5 relative z-20">
        <div className="rounded-3xl bg-slate-950 p-5 shadow-xl border border-slate-800 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                Space check-in
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse-dot" />
                <span className="text-sm font-black text-white">
                  {activeCheckins || 0} makers in lab right now
                </span>
              </div>
            </div>
            <Link
              href="/space/checkin"
              className="rounded-full bg-amber-400 px-5 py-2.5 text-xs font-black text-slate-950 shadow-md shadow-amber-400/25 hover:bg-amber-300 active:scale-95 transition-all"
            >
              CHECK-IN
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 px-5">
        <Link
          href="/events"
          className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition-all hover:border-amber-400 active:scale-[0.98]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-slate-950 font-black">
            <Users className="h-5 w-5 text-amber-700" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-950">Space Activities</p>
            <p className="text-[10px] font-bold text-stone-500">Collaborative Maker Sessions</p>
          </div>
        </Link>
        <Link
          href="/equipment"
          className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition-all hover:border-amber-400 active:scale-[0.98]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-slate-950 font-black">
            <HelpCircle className="h-5 w-5 text-amber-700" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-950">Equipment Support</p>
            <p className="text-[10px] font-bold text-stone-500">Machine Assistance</p>
          </div>
        </Link>
      </div>

      <div className="mt-5 overflow-hidden bg-slate-950 py-3 shadow-inner">
        <div className="animate-marquee flex whitespace-nowrap">
          <span className="mx-4 text-xs font-black text-amber-400 uppercase tracking-widest">
            Keep Tinkering
          </span>
          <span className="mx-4 text-xs font-black text-white uppercase tracking-widest">
            Build · Learn · Grow
          </span>
          <span className="mx-4 text-xs font-black text-amber-400 uppercase tracking-widest">
            Innovation Starts Here
          </span>
          <span className="mx-4 text-xs font-black text-purple-300 uppercase tracking-widest">
            Hands-on Engineering
          </span>
          <span className="mx-4 text-xs font-black text-amber-400 uppercase tracking-widest">
            Keep Tinkering
          </span>
          <span className="mx-4 text-xs font-black text-white uppercase tracking-widest">
            Build · Learn · Grow
          </span>
          <span className="mx-4 text-xs font-black text-amber-400 uppercase tracking-widest">
            Innovation Starts Here
          </span>
        </div>
      </div>

      <div className="mt-6 px-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-950">Upcoming Events</h2>
          <Link
            href="/events"
            className="flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-slate-950"
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
          <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
            <Calendar className="mx-auto h-8 w-8 text-amber-500" />
            <p className="mt-2 text-xs font-bold text-slate-700">
              No upcoming events scheduled
            </p>
          </div>
        )}
      </div>
    </div>
  );
}