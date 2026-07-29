"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Lightbulb, Wifi, WifiOff } from "lucide-react";

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

  // Live Clock
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

  // Realtime subscription
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
          reconnectAttempt.current = 0;
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          setConnected(false);
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempt.current),
            30000
          );
          reconnectAttempt.current += 1;
          setTimeout(() => {
            channel.subscribe();
          }, delay);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchCheckins]);

  const getTimeRemaining = useCallback(
    (checkin: ActiveCheckin) => {
      const start = new Date(checkin.checkin_timestamp);
      const durationMatch = checkin.estimated_duration.match(/(\d+)/);
      const hours = durationMatch ? parseInt(durationMatch[1], 10) : 1;
      const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
      const remaining = end.getTime() - currentTime.getTime();

      if (remaining <= 0) return "Expired";

      const mins = Math.floor(remaining / 60000);
      const hrs = Math.floor(mins / 60);
      const m = mins % 60;

      return hrs > 0 ? `${hrs}h ${m}m remaining` : `${m}m remaining`;
    },
    [currentTime]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-8 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <Lightbulb className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              IDEA Lab
            </h1>
            <p className="text-sm text-gray-400">
              SJCET AICTE Innovation Hub — Live Dashboard
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            {connected ? (
              <>
                <Wifi className="h-5 w-5 text-accent-green" />
                <span className="text-sm text-accent-green">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5 text-danger" />
                <span className="text-sm text-danger">Reconnecting...</span>
              </>
            )}
          </div>

          <div className="text-right">
            <p className="text-4xl font-bold tabular-nums tracking-tight">
              {currentTime.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="text-sm text-gray-400">
              {currentTime.toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Active Count */}
      <div className="mt-8 flex items-center gap-3">
        <span className="flex h-3 w-3 rounded-full bg-accent-green animate-pulse-dot" />
        <span className="text-lg font-semibold text-gray-300">
          {checkins.length} Maker{checkins.length !== 1 ? "s" : ""} in Lab
        </span>
      </div>

      {/* Grid of active users */}
      {checkins.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {checkins.map((checkin) => (
            <div
              key={checkin.id}
              className="animate-scale-in rounded-2xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-sm"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent-pink text-xl font-bold">
                {(checkin.profile?.full_name || "U")[0].toUpperCase()}
              </div>

              <h3 className="mt-3 truncate text-base font-bold">
                {checkin.profile?.full_name || "Unknown Maker"}
              </h3>
              {checkin.profile?.department && (
                <p className="mt-0.5 text-xs text-gray-400">
                  {checkin.profile.department}
                </p>
              )}

              <div className="mt-3 rounded-lg bg-gray-800/50 px-3 py-2">
                <p className="text-xs text-gray-400">
                  {checkin.purpose_of_visit}
                </p>
                <p className="mt-1 text-xs font-semibold text-accent-green">
                  {getTimeRemaining(checkin)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-24 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-800/50">
            <Lightbulb className="h-12 w-12 text-gray-600" />
          </div>
          <p className="mt-6 text-xl text-gray-500">
            No one in the lab right now
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Check-ins will appear here in real-time
          </p>
        </div>
      )}
    </div>
  );
}