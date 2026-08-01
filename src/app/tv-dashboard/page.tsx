"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Lightbulb,
  Wifi,
  WifiOff,
  Clock,
  Users,
  Printer,
  Cpu,
  Zap,
  Activity,
  QrCode,
  Sparkles,
  ShieldCheck,
  Sun,
  Moon,
  Layers,
  Wrench,
} from "lucide-react";
import { parsePostgresIntervalMs, isCheckinActive } from "@/lib/parseInterval";
import { ElectronicBorderAssets } from "./ElectronicBorderAssets";

interface ActiveCheckin {
  id: string;
  user_id: string;
  purpose_of_visit: string;
  estimated_duration: string;
  checkin_timestamp: string;
  is_active: boolean;
  profile?: {
    full_name: string;
    department: string;
    avatar_url: string;
  };
}

export default function TVDashboard() {
  const [checkins, setCheckins] = useState<ActiveCheckin[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [connected, setConnected] = useState(true);
  const [theme, setTheme] = useState<"warm" | "dark">("warm");
  const reconnectAttempt = useRef(0);

  const supabase = useMemo(() => createClient(), []);

  // Screen Wake Lock API
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;

    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLock = await navigator.wakeLock.request("screen");
        }
      } catch {
        // Wake lock is optional
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      wakeLock?.release();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Live Clock with Seconds
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch active check-ins & joined profiles
  const fetchCheckins = useCallback(async () => {
    const { data } = await supabase
      .from("space_checkins")
      .select("*")
      .eq("is_active", true)
      .order("checkin_timestamp", { ascending: false });

    if (data && data.length > 0) {
      const userIds = [...new Set(data.map((c) => c.user_id))];
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("user_id, full_name, department, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(
        profiles?.map((p) => [p.user_id, p]) || []
      );

      const enriched = data.map((c) => ({
        ...c,
        profile: profileMap.get(c.user_id) || undefined,
      }));

      setCheckins(enriched);
    } else {
      setCheckins([]);
    }
  }, [supabase]);

  // Realtime subscription & Fallback polling
  useEffect(() => {
    fetchCheckins();

    const channel = supabase
      .channel("tv-checkins")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "space_checkins",
        },
        () => {
          fetchCheckins();
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setConnected(true);
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setConnected(false);
        }
      });

    const pollInterval = setInterval(() => {
      fetchCheckins();
    }, 30000);

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchCheckins]);

  const liveCheckins = useMemo(() => {
    return checkins.filter((c) =>
      c.is_active !== false && isCheckinActive(c.checkin_timestamp, c.estimated_duration, currentTime.getTime())
    );
  }, [checkins, currentTime]);

  // Capacity calculation (e.g. max capacity 30)
  const LAB_CAPACITY = 30;
  const occupancyPercentage = Math.min(Math.round((liveCheckins.length / LAB_CAPACITY) * 100), 100);

  // Time remaining calculation with hours, minutes, and seconds
  const getDetailedTimeRemaining = useCallback(
    (checkin: ActiveCheckin) => {
      const start = new Date(checkin.checkin_timestamp).getTime();
      const durationMs = parsePostgresIntervalMs(checkin.estimated_duration);
      const end = start + durationMs;
      const remainingMs = end - currentTime.getTime();

      if (remainingMs <= 0) return { label: "Session Ended", pct: 100, isExpired: true };

      const totalSecs = Math.floor(remainingMs / 1000);
      const hrs = Math.floor(totalSecs / 3600);
      const mins = Math.floor((totalSecs % 3600) / 60);
      const secs = totalSecs % 60;

      const elapsedMs = currentTime.getTime() - start;
      const pct = Math.min(Math.max(Math.round((elapsedMs / durationMs) * 100), 0), 100);

      const paddedM = String(mins).padStart(2, "0");
      const paddedS = String(secs).padStart(2, "0");

      const label = hrs > 0 ? `${hrs}h ${paddedM}m ${paddedS}s left` : `${mins}m ${paddedS}s left`;

      return { label, pct, isExpired: false };
    },
    [currentTime]
  );

  // Purpose Icon Helper
  const getPurposeIcon = (purpose: string) => {
    const p = (purpose || "").toLowerCase();
    if (p.includes("print") || p.includes("3d")) return <Printer className="h-4 w-4 text-amber-400" />;
    if (p.includes("circuit") || p.includes("pcb") || p.includes("electron")) return <Cpu className="h-4 w-4 text-blue-400" />;
    if (p.includes("laser") || p.includes("cut")) return <Zap className="h-4 w-4 text-red-400" />;
    if (p.includes("robot") || p.includes("iot") || p.includes("sensor")) return <Wrench className="h-4 w-4 text-emerald-400" />;
    return <Sparkles className="h-4 w-4 text-purple-400" />;
  };

  return (
    <div
      className={`relative min-h-screen w-full transition-colors duration-500 overflow-hidden font-sans select-none text-white ${theme === "warm"
        ? "bg-[#F5CD44]"
        : "bg-slate-950"
        }`}
    >
      {/* ─── Adapted Canvas Texture (Dotted/Ruled Graph Paper Grid from Fundo para Stories) ─── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25 z-0"
        style={{
          backgroundImage:
            theme === "warm"
              ? `linear-gradient(to bottom, rgba(45,37,2,0.12) 1px, transparent 1px), radial-gradient(rgba(45,37,2,0.2) 1px, transparent 1px)`
              : `linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "100% 28px, 28px 28px",
        }}
      />

      {/* ─── Electronic & IdeaLab Context Border Assets ─── */}
      <ElectronicBorderAssets theme={theme} />

      {/* ─── Main Content Container (Framed nicely inside borders) ─── */}
      <div className="relative z-20 flex min-h-screen flex-col justify-between p-6 md:p-10 lg:p-12 text-white">
        {/* ─── Header Bar ─── */}
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/20 bg-slate-900/90 p-5 md:px-8 md:py-5 backdrop-blur-md shadow-2xl text-white">
          {/* Logo & Hub Info */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-md shadow-amber-500/30">
              <Lightbulb className="h-8 w-8 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase text-white">
                  SJCET IDEA LAB
                </h1>
                <span className="rounded-full bg-amber-500/30 px-3 py-0.5 text-xs font-extrabold text-white border border-amber-400/40">
                  AICTE HUB
                </span>
              </div>
              <p className="text-xs md:text-sm font-semibold text-white/90">
                St. Joseph&apos;s College of Engineering and Technology — Live Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Live Sync Indicator */}
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold border border-white/15">
              {connected ? (
                <>
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <Wifi className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400 uppercase tracking-wider font-extrabold">LIVE SYNC</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-400 animate-pulse" />
                  <span className="text-red-400 font-extrabold">RECONNECTING...</span>
                </>
              )}
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end gap-2 text-2xl md:text-4xl font-black tracking-tight tabular-nums text-white">
                <Clock className="h-6 w-6 md:h-8 md:w-8 text-amber-400" />
                <span>
                  {currentTime.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
              <p className="text-xs md:text-sm font-semibold text-white/90">
                {currentTime.toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Theme Toggle Switch */}
            <button
              onClick={() => setTheme((t) => (t === "warm" ? "dark" : "warm"))}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 transition-all cursor-pointer text-white"
              title="Toggle Canvas Theme"
              aria-label="Toggle Canvas Theme"
            >
              {theme === "warm" ? (
                <Moon className="h-5 w-5 text-white" />
              ) : (
                <Sun className="h-5 w-5 text-amber-400" />
              )}
            </button>
          </div>
        </header>

        {/* ─── Quick Metrics Stat Bar ─── */}
        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Active Makers Metric Card */}
          <div className="flex items-center justify-between rounded-2xl border border-white/20 bg-slate-900/90 p-4 md:px-6 backdrop-blur-md shadow-xl text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-white/80 tracking-wider">Active Makers</p>
                <p className="text-2xl font-black text-white">{liveCheckins.length} In Lab</p>
              </div>
            </div>
            <span className="flex h-3.5 w-3.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Occupancy Rate Bar Card */}
          <div className="flex flex-col justify-center rounded-2xl border border-white/20 bg-slate-900/90 p-4 md:px-6 backdrop-blur-md shadow-xl text-white">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
              <span className="text-white/80">Lab Capacity Occupancy</span>
              <span className="text-amber-400 font-extrabold">
                {liveCheckins.length} / {LAB_CAPACITY} SEATS ({occupancyPercentage}%)
              </span>
            </div>
            <div className="mt-2.5 h-3.5 w-full overflow-hidden rounded-full bg-white/10 p-0.5 border border-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-700"
                style={{ width: `${occupancyPercentage}%` }}
              />
            </div>
          </div>

          {/* Hub Status Card */}
          <div className="flex items-center justify-between rounded-2xl border border-white/20 bg-slate-900/90 p-4 md:px-6 backdrop-blur-md shadow-xl text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-white/80 tracking-wider">Hub Status</p>
                <p className="text-xl font-black text-emerald-400">OPEN & OPERATIONAL</p>
              </div>
            </div>
            <ShieldCheck className="h-7 w-7 text-emerald-400" />
          </div>
        </section>

        {/* ─── Active Makers Display Grid ─── */}
        <main className="my-6 flex-1">
          {liveCheckins.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {liveCheckins.map((checkin) => {
                const timer = getDetailedTimeRemaining(checkin);
                return (
                  <div
                    key={checkin.id}
                    className="group relative flex flex-col justify-between rounded-3xl border border-white/20 bg-slate-900/90 p-5 backdrop-blur-md shadow-xl transition-all duration-300 hover:-translate-y-1 text-white"
                  >
                    {/* Top Maker Info Header */}
                    <div>
                      <div className="flex items-center gap-3.5">
                        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-white font-black text-xl shadow-md border-2 border-white/40">
                          {(checkin.profile?.full_name || "M")[0].toUpperCase()}
                          <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-slate-900 bg-emerald-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-base font-extrabold tracking-tight text-white">
                            {checkin.profile?.full_name || "IdeaLab Maker"}
                          </h3>
                          <span className="inline-block mt-0.5 truncate rounded-md bg-white/10 px-2 py-0.5 text-xs font-bold text-white border border-white/10">
                            {checkin.profile?.department || "Innovator"}
                          </span>
                        </div>
                      </div>

                      {/* Purpose Tag */}
                      <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 p-3">
                        {getPurposeIcon(checkin.purpose_of_visit)}
                        <p className="truncate text-xs font-bold text-white">
                          {checkin.purpose_of_visit || "General Innovation Work"}
                        </p>
                      </div>
                    </div>

                    {/* Timer & Session Remaining Progress Bar */}
                    <div className="mt-4 pt-3 border-t border-white/15">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-white/80 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-amber-400" /> Remaining
                        </span>
                        <span className="text-emerald-400 font-extrabold tabular-nums">
                          {timer.label}
                        </span>
                      </div>

                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10 border border-white/10">
                        <div
                          className="h-full rounded-full bg-emerald-400 transition-all duration-1000"
                          style={{ width: `${100 - timer.pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ─── Empty State Radar Scanner ─── */
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-3xl border border-white/20 bg-slate-900/90 p-8 text-center backdrop-blur-md shadow-2xl text-white">
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-amber-500/20 border border-amber-400/40">
                <div className="absolute inset-0 rounded-full border border-amber-400/30 animate-ping opacity-40" />
                <QrCode className="h-12 w-12 text-amber-400" />
              </div>
              <h2 className="mt-6 text-2xl font-black tracking-tight text-white">
                No Makers Checked In Right Now
              </h2>
              <p className="mt-2 max-w-md text-sm font-semibold text-white/90">
                The SJCET IDEA Lab is open for students and faculty. Scan the QR Code at the entrance terminal to check in!
              </p>
              <div className="mt-6 flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/20 px-4 py-1.5 text-xs font-bold text-white">
                <Layers className="h-4 w-4 text-amber-400" /> 3D Printers • Laser Cutters • PCB Station Ready
              </div>
            </div>
          )}
        </main>

        {/* ─── Bottom Announcement Marquee Ticker ─── */}
        <footer className="overflow-hidden rounded-2xl border border-white/20 bg-slate-900/90 p-3 backdrop-blur-md shadow-2xl text-white">
          <div className="flex items-center gap-4">
            <div className="flex shrink-0 items-center gap-1.5 rounded-xl bg-amber-400 px-3 py-1 text-xs font-black text-slate-950 uppercase shadow-md">
              <Sparkles className="h-3.5 w-3.5" /> Lab Ticker
            </div>
            <div className="relative flex-1 overflow-hidden">
              <div className="whitespace-nowrap text-xs font-extrabold tracking-wide animate-marquee inline-block text-white">
                ⚡ WELCOME TO SJCET AICTE IDEA LAB • SAFETY FIRST: ALWAYS WEAR SAFETY GOGGLES AT LASER CUTTER & ROTARY STATIONS • 3D PRINTING FILAMENT SPOTS AVAILABLE • DISPOSE CIRCUIT TRASH SAFELY • SCAN ENTRANCE QR CODE FOR INSTANT CHECK-IN ⚡
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}