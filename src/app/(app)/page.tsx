import { createClient } from "@/lib/supabase/server";
import { isUserAdmin } from "@/lib/auth";
import Link from "next/link";
import {
  Calendar,
  Wrench,
  Zap,
  User,
  ChevronRight,
  Lightbulb,
  LogIn,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import EventCard from "@/components/EventCard";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: upcomingEvents }, { count: activeCheckins }, { data: { user } }] =
    await Promise.all([
      supabase
        .from("events")
        .select("*")
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true })
        .limit(5),
      supabase
        .from("space_checkins")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true),
      supabase.auth.getUser(),
    ]);

  const isAdmin = await isUserAdmin(supabase, user);

  return (
    <div className="animate-fade-in pb-20">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#FFE033] via-[#FFB703] to-[#FB8500] px-5 pb-10 pt-10 text-slate-950 shadow-lg">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/25 blur-xl pointer-events-none" />
        <div className="absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-orange-600/20 blur-lg pointer-events-none" />
        <div className="absolute right-8 top-16 h-8 w-8 rounded-full bg-purple-500/80 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-amber-400 shadow-md">
                <Lightbulb className="h-5 w-5" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-950/80">
                SJCET AICTE
              </span>
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 rounded-full bg-slate-950 px-3.5 py-1.5 text-xs font-black text-amber-400 shadow-md transition-all hover:bg-slate-900 active:scale-95"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Admin Portal</span>
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-full bg-slate-950/10 px-3.5 py-1.5 text-xs font-extrabold text-slate-950 backdrop-blur-md transition-all hover:bg-slate-950/20 active:scale-95 border border-slate-950/10"
                >
                  <User className="h-3.5 w-3.5" />
                  <span className="max-w-[110px] truncate">
                    @{user.email?.split("@")[0]}
                  </span>
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white shadow-md transition-all hover:bg-slate-900 active:scale-95"
              >
                <LogIn className="h-4 w-4 text-amber-400" />
                <span>Login</span>
              </Link>
            )}
          </div>

          <div className="mt-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-slate-950 border border-slate-950/10">
              <Sparkles className="h-3 w-3 text-slate-950" />
              <span>INNOVATE & CREATE</span>
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              IDEA Lab Space
            </h1>
            <p className="mt-1 text-xs sm:text-sm font-bold text-slate-950/80">
              Innovate · Design · Engineer · Achieve
            </p>
          </div>

          <div className="mt-6 rounded-3xl bg-slate-950 p-5 text-white shadow-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Live Space Status
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse-dot" />
                  <span className="text-sm font-black text-white">
                    {activeCheckins || 0} makers checked-in
                  </span>
                </div>
              </div>
              <Link
                href="/space/checkin"
                className="rounded-full bg-amber-400 px-5 py-2.5 text-xs font-black text-slate-950 shadow-md shadow-amber-400/20 transition-all hover:bg-amber-300 active:scale-95"
              >
                CHECK-IN
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-4 relative z-20">
        <div className="grid grid-cols-2 gap-3 stagger-children">
          <Link
            href="/events"
            className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-amber-400 active:scale-[0.98]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-slate-950 font-black">
              <Calendar className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <span className="text-sm font-black text-slate-900 block">Events</span>
              <span className="text-[11px] font-bold text-stone-500">Bootcamps & Workshops</span>
            </div>
          </Link>

          <Link
            href="/equipment"
            className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-amber-400 active:scale-[0.98]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-slate-950 font-black">
              <Wrench className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <span className="text-sm font-black text-slate-900 block">Equipment</span>
              <span className="text-[11px] font-bold text-stone-500">3D Printers & CNC</span>
            </div>
          </Link>

          <Link
            href="/space"
            className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-amber-400 active:scale-[0.98]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-slate-950 font-black">
              <Zap className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <span className="text-sm font-black text-slate-900 block">Space</span>
              <span className="text-[11px] font-bold text-stone-500">Active Visitors</span>
            </div>
          </Link>

          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-amber-400 active:scale-[0.98]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700 font-black">
              <User className="h-5 w-5" />
            </div>
            <div>
              <span className="text-sm font-black text-slate-900 block">Profile</span>
              <span className="text-[11px] font-bold text-stone-500">Maker Credentials</span>
            </div>
          </Link>
        </div>
      </div>

      <div className="mt-6 overflow-hidden bg-slate-950 py-3 shadow-inner">
        <div className="animate-marquee flex whitespace-nowrap">
          <span className="mx-4 text-xs font-black text-amber-400 uppercase tracking-widest">
            Keep Building
          </span>
          <span className="mx-4 text-xs font-black text-white uppercase tracking-widest">
            Never Stop Learning
          </span>
          <span className="mx-4 text-xs font-black text-amber-400 uppercase tracking-widest">
            Innovate Together
          </span>
          <span className="mx-4 text-xs font-black text-purple-300 uppercase tracking-widest">
            Hands-on Engineering
          </span>
          <span className="mx-4 text-xs font-black text-amber-400 uppercase tracking-widest">
            Keep Building
          </span>
          <span className="mx-4 text-xs font-black text-white uppercase tracking-widest">
            Never Stop Learning
          </span>
          <span className="mx-4 text-xs font-black text-amber-400 uppercase tracking-widest">
            Innovate Together
          </span>
          <span className="mx-4 text-xs font-black text-purple-300 uppercase tracking-widest">
            Hands-on Engineering
          </span>
        </div>
      </div>

      <div className="mt-7 px-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            Upcoming Events{" "}
            {upcomingEvents && upcomingEvents.length > 0 && (
              <span className="ml-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs font-black text-slate-950">
                {upcomingEvents.length}
              </span>
            )}
          </h2>
          <Link
            href="/events"
            className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {upcomingEvents && upcomingEvents.length > 0 ? (
          <div className="hide-scrollbar mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
            {upcomingEvents.map((event) => (
              <EventCard
                key={event.id}
                title={event.title}
                description={event.description}
                eventType={event.event_type}
                location={event.location}
                startTime={event.start_time}
                endTime={event.end_time}
                imageUrl={event.image_url}
              />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
            <Calendar className="mx-auto h-8 w-8 text-amber-500" />
            <p className="mt-2 text-xs font-bold text-slate-700">
              No upcoming events scheduled yet
            </p>
          </div>
        )}
      </div>

      <div className="mx-5 mt-7 rounded-3xl bg-gradient-to-r from-[#FFE033] via-[#FFB703] to-[#FB8500] p-6 text-slate-950 shadow-md">
        <h3 className="text-xl font-black tracking-tight text-slate-950">
          Welcome to SJCET IDEA Lab 🔬
        </h3>
        <p className="mt-1 text-xs font-bold text-slate-950/80">
          Book state-of-the-art machinery, check in to the lab space, and join maker workshops.
        </p>
        <Link
          href="/space/checkin"
          className="mt-4 inline-block rounded-full bg-slate-950 px-6 py-2.5 text-xs font-black text-amber-400 shadow-md hover:bg-slate-900 active:scale-95 transition-all"
        >
          Get Started Now →
        </Link>
      </div>
    </div>
  );
}