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
    <div className="animate-fade-in">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-primary px-5 pb-8 pt-12">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -left-4 bottom-4 h-20 w-20 rounded-full bg-white/5" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-white/80">SJCET AICTE</span>
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1.5 text-xs font-extrabold text-slate-950 shadow-sm transition-all hover:bg-amber-300 active:scale-95"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Admin Portal</span>
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/30 active:scale-95"
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
                className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-text-primary shadow-sm transition-all hover:bg-white/90 active:scale-95"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Login</span>
              </Link>
            )}
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white">
            IDEA Lab
          </h1>
          <p className="mt-1 text-sm text-white/70">
            Innovate · Design · Engineer · Achieve
          </p>

          <div className="mt-6 rounded-2xl bg-white/15 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Space check-in</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="flex h-2 w-2 rounded-full bg-accent-green animate-pulse-dot" />
                  <span className="text-xs text-white/70">
                    {activeCheckins || 0} active now
                  </span>
                </div>
              </div>
              <Link
                href="/space/checkin"
                className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-text-primary transition-all active:scale-95"
              >
                CHECK-IN
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-1">
        <div className="grid grid-cols-2 gap-3 stagger-children">
          <Link
            href="/events"
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition-all hover:shadow-sm active:scale-[0.98]"
          >
            <Calendar className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold">Events</span>
          </Link>
          <Link
            href="/equipment"
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition-all hover:shadow-sm active:scale-[0.98]"
          >
            <Wrench className="h-5 w-5 text-accent-amber" />
            <span className="text-sm font-semibold">Equipment</span>
          </Link>
          <Link
            href="/space"
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition-all hover:shadow-sm active:scale-[0.98]"
          >
            <Zap className="h-5 w-5 text-accent-green" />
            <span className="text-sm font-semibold">Space</span>
          </Link>
          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition-all hover:shadow-sm active:scale-[0.98]"
          >
            <User className="h-5 w-5 text-accent-pink" />
            <span className="text-sm font-semibold">Profile</span>
          </Link>
        </div>
      </div>

      <div className="mt-6 overflow-hidden bg-text-primary py-2.5">
        <div className="animate-marquee flex whitespace-nowrap">
          <span className="mx-4 text-sm font-semibold text-white">
            Keep Building ✨
          </span>
          <span className="mx-4 text-sm font-semibold text-accent-amber">
            Never Stop Learning 🚀
          </span>
          <span className="mx-4 text-sm font-semibold text-white">
            Innovate Together 💡
          </span>
          <span className="mx-4 text-sm font-semibold text-accent-green">
            Get Your Hands Dirty 🔧
          </span>
          <span className="mx-4 text-sm font-semibold text-white">
            Keep Building ✨
          </span>
          <span className="mx-4 text-sm font-semibold text-accent-amber">
            Never Stop Learning 🚀
          </span>
          <span className="mx-4 text-sm font-semibold text-white">
            Innovate Together 💡
          </span>
          <span className="mx-4 text-sm font-semibold text-accent-green">
            Get Your Hands Dirty 🔧
          </span>
        </div>
      </div>

      <div className="mt-6 px-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">
            Upcoming{" "}
            {upcomingEvents && upcomingEvents.length > 0 && (
              <span className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-surface-tertiary text-xs font-semibold text-text-secondary">
                {upcomingEvents.length}
              </span>
            )}
          </h2>
          <Link
            href="/events"
            className="flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-text-primary"
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
          <div className="mt-4 rounded-2xl border border-border-light bg-surface-secondary p-8 text-center">
            <Calendar className="mx-auto h-8 w-8 text-text-tertiary" />
            <p className="mt-2 text-sm text-text-secondary">
              No upcoming events yet
            </p>
          </div>
        )}
      </div>

      <div className="my-6 flex items-center justify-center">
        <svg width="40" height="12" viewBox="0 0 40 12" fill="none">
          <path
            d="M2 6C2 6 8 2 14 6C20 10 26 2 32 6C38 10 38 6 38 6"
            stroke="#D1D5DB"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="mx-5 mb-6 rounded-2xl bg-gradient-to-r from-accent-green to-accent-green/80 p-5">
        <h3 className="text-lg font-bold text-white">
          Welcome to the Lab 🔬
        </h3>
        <p className="mt-1 text-sm text-white/80">
          Book equipment, check in to the space, and discover events.
        </p>
        <Link
          href="/space/checkin"
          className="mt-4 inline-block rounded-full bg-white px-5 py-2.5 text-sm font-bold text-text-primary transition-all active:scale-95"
        >
          Get Started →
        </Link>
      </div>
    </div>
  );
}