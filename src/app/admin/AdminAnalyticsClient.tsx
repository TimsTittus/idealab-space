"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Users,
  Activity,
  CalendarCheck,
  Wrench,
  TrendingUp,
  Clock,
  CheckCircle2,
  X,
  Search,
  ChevronRight,
  ShieldCheck,
  Building2,
  GraduationCap,
  Sparkles,
  MapPin,
  ExternalLink,
  Code2,
  Calendar,
  Layers,
  Cpu,
} from "lucide-react";
import { format } from "date-fns";
import { parsePostgresIntervalMs, isCheckinActive } from "@/lib/parseInterval";

export interface UserProfileData {
  id: string;
  user_id: string;
  email?: string;
  full_name: string;
  department?: string;
  year_of_study?: string;
  bio?: string;
  skill_tags?: string[];
  languages?: Array<{ name: string; level: string }>;
  github_url?: string;
  avatar_url?: string;
  role: string;
  created_at?: string;
}

export interface ActiveCheckinData {
  id: string;
  user_id: string;
  purpose_of_visit: string;
  estimated_duration: string;
  checkin_timestamp: string;
  is_active: boolean;
  profile?: UserProfileData;
}

export interface ReservationData {
  id: string;
  equipment_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  status: string;
  created_at: string;
  equipment?: {
    id: string;
    name: string;
    category: string;
    image_url?: string;
  };
  profile?: UserProfileData;
}

export interface EquipmentItemData {
  id: string;
  name: string;
  category: string;
  description?: string;
  image_url?: string;
  is_available: boolean;
}

interface AdminAnalyticsClientProps {
  activeCheckins: ActiveCheckinData[];
  allCheckins?: ActiveCheckinData[];
  userProfiles: UserProfileData[];
  reservations: ReservationData[];
  equipmentList: EquipmentItemData[];
}

export default function AdminAnalyticsClient({
  activeCheckins,
  allCheckins = [],
  userProfiles,
  reservations,
  equipmentList,
}: AdminAnalyticsClientProps) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date>(() => new Date());

  const [activeCheckinsModalOpen, setActiveCheckinsModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [usersModalOpen, setUsersModalOpen] = useState(false);
  const [bookingsModalOpen, setBookingsModalOpen] = useState(false);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [inspectingUser, setInspectingUser] = useState<UserProfileData | null>(null);

  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [checkinSearchQuery, setCheckinSearchQuery] = useState("");
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [historyFilterTab, setHistoryFilterTab] = useState<"all" | "completed" | "live">("all");
  const [bookingFilterTab, setBookingFilterTab] = useState<"all" | "today" | "week">("today");

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const todayStartMs = useMemo(() => {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, [now]);

  const weekStartMs = useMemo(() => {
    const d = new Date(now);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, [now]);

  const todayBookingsList = useMemo(() => {
    return reservations.filter(
      (r) => new Date(r.start_time).getTime() >= todayStartMs
    );
  }, [reservations, todayStartMs]);

  const weekBookingsList = useMemo(() => {
    return reservations.filter(
      (r) => new Date(r.start_time).getTime() >= weekStartMs
    );
  }, [reservations, weekStartMs]);

  const equipmentUsageMap = useMemo(() => {
    const map = new Map<
      string,
      {
        equipment: EquipmentItemData;
        count: number;
        reservations: ReservationData[];
      }
    >();

    equipmentList.forEach((eq) => {
      map.set(eq.id, { equipment: eq, count: 0, reservations: [] });
    });

    reservations.forEach((res) => {
      const item = map.get(res.equipment_id);
      if (item) {
        item.count += 1;
        item.reservations.push(res);
      }
    });

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [equipmentList, reservations]);

  const topMachinery = equipmentUsageMap.length > 0 ? equipmentUsageMap[0] : null;

  const activeEquipmentDetail = useMemo(() => {
    if (!selectedEquipmentId) return null;
    return equipmentUsageMap.find((item) => item.equipment.id === selectedEquipmentId) || null;
  }, [equipmentUsageMap, selectedEquipmentId]);

  // Helper for parsing check-in time remaining
  const getTimeRemainingStr = (checkinTimestamp: string, estimatedDuration: string) => {
    const start = new Date(checkinTimestamp).getTime();
    const durationMs = parsePostgresIntervalMs(estimatedDuration);
    const end = start + durationMs;
    const diff = end - now.getTime();
    if (diff <= 0) return "Expired";

    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    return hrs > 0 ? `${hrs}h ${m}m left` : `${m}m left`;
  };

  const openUserDetail = (profile?: UserProfileData | null, userId?: string) => {
    if (profile) {
      setInspectingUser(profile);
      return;
    }
    if (userId) {
      const found = userProfiles.find((p) => p.user_id === userId);
      if (found) {
        setInspectingUser(found);
      } else {
        setInspectingUser({
          id: userId,
          user_id: userId,
          full_name: "Lab Member",
          role: "user",
        });
      }
    }
  };

  const filteredUsers = useMemo(() => {
    if (!userSearchQuery.trim()) return userProfiles;
    const q = userSearchQuery.toLowerCase();
    return userProfiles.filter(
      (u) =>
        u.full_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.department?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q)
    );
  }, [userProfiles, userSearchQuery]);

  const liveActiveCheckins = useMemo(() => {
    return activeCheckins.filter((c) =>
      c.is_active !== false && isCheckinActive(c.checkin_timestamp, c.estimated_duration, now.getTime())
    );
  }, [activeCheckins, now]);

  const filteredCheckins = useMemo(() => {
    if (!checkinSearchQuery.trim()) return liveActiveCheckins;
    const q = checkinSearchQuery.toLowerCase();
    return liveActiveCheckins.filter(
      (c) =>
        c.profile?.full_name?.toLowerCase().includes(q) ||
        c.purpose_of_visit?.toLowerCase().includes(q) ||
        c.profile?.department?.toLowerCase().includes(q)
    );
  }, [liveActiveCheckins, checkinSearchQuery]);

  const modalBookingsList = useMemo(() => {
    if (bookingFilterTab === "today") return todayBookingsList;
    if (bookingFilterTab === "week") return weekBookingsList;
    return reservations;
  }, [bookingFilterTab, todayBookingsList, weekBookingsList, reservations]);

  const checkinHistoryList = useMemo(() => {
    return allCheckins && allCheckins.length > 0 ? allCheckins : activeCheckins;
  }, [allCheckins, activeCheckins]);

  const filteredHistory = useMemo(() => {
    let list = checkinHistoryList;
    if (historyFilterTab === "live") {
      list = list.filter((c) => c.is_active !== false && isCheckinActive(c.checkin_timestamp, c.estimated_duration, now.getTime()));
    } else if (historyFilterTab === "completed") {
      list = list.filter((c) => !c.is_active || !isCheckinActive(c.checkin_timestamp, c.estimated_duration, now.getTime()));
    }

    if (historySearchQuery.trim()) {
      const q = historySearchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.profile?.full_name?.toLowerCase().includes(q) ||
          c.purpose_of_visit?.toLowerCase().includes(q) ||
          c.profile?.department?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [checkinHistoryList, historyFilterTab, historySearchQuery, now]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Analytics & Usage Overview
        </h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Real-time metrics for SJCET AICTE IDEA Lab usage and bookings. Click any card to inspect detailed data.
        </p>
      </div>

      {/* 5 Interactive Metric Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {/* Active Check-ins Card */}
        <div
          onClick={() => setActiveCheckinsModalOpen(true)}
          className="group relative cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg hover:border-emerald-400 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-emerald-700 transition-colors">
              Active Check-ins
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 group-hover:scale-110 transition-transform">
              <Activity className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {liveActiveCheckins.length}
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/80 border border-emerald-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              Live in Lab
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Currently checked-in visitors</span>
            <ChevronRight className="h-4 w-4 text-emerald-600 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Check-in History Card */}
        <div
          onClick={() => setHistoryModalOpen(true)}
          className="group relative cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg hover:border-blue-400 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-blue-700 transition-colors">
              Check-in History
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 group-hover:scale-110 transition-transform">
              <Clock className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {checkinHistoryList.length}
            </span>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
              7-Day History
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Total recorded visits</span>
            <ChevronRight className="h-4 w-4 text-blue-600 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Registered Users Card */}
        <div
          onClick={() => setUsersModalOpen(true)}
          className="group relative cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg hover:border-indigo-400 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-indigo-700 transition-colors">
              Registered Users
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {userProfiles.length}
            </span>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
              @sjcetpalai.ac.in
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Total student & staff accounts</span>
            <ChevronRight className="h-4 w-4 text-indigo-600 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Bookings Card */}
        <div
          onClick={() => {
            setBookingFilterTab("today");
            setBookingsModalOpen(true);
          }}
          className="group relative cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg hover:border-amber-400 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-amber-800 transition-colors">
              Bookings (Today / Week)
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 group-hover:scale-110 transition-transform">
              <CalendarCheck className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {todayBookingsList.length}
            </span>
            <span className="text-xs font-medium text-slate-500">
              / {weekBookingsList.length} this week
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Confirmed equipment reservations</span>
            <ChevronRight className="h-4 w-4 text-amber-600 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Top Machinery Card */}
        <div
          onClick={() => {
            if (topMachinery) setSelectedEquipmentId(topMachinery.equipment.id);
          }}
          className="group relative cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg hover:border-purple-400 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-purple-700 transition-colors">
              Top Machinery
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700 group-hover:scale-110 transition-transform">
              <Wrench className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xl font-bold text-slate-900 block truncate">
              {topMachinery ? topMachinery.equipment.name : "N/A"}
            </span>
            <span className="text-xs font-semibold text-purple-700 bg-purple-100/80 border border-purple-200 px-2 py-0.5 rounded-full inline-block mt-1">
              {topMachinery ? `${topMachinery.count} bookings` : "0 bookings"}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-500">
            <span>{topMachinery?.equipment.category || "Utilization metric"}</span>
            <ChevronRight className="h-4 w-4 text-purple-600 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>

      {/* Equipment Usage Breakdown & Live Check-in list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Equipment Usage Breakdown
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any equipment bar to view user reservation history
              </p>
            </div>
            <TrendingUp className="h-5 w-5 text-amber-500" />
          </div>

          <div className="space-y-4">
            {equipmentUsageMap.map((item) => {
              const maxCount = equipmentUsageMap[0]?.count || 1;
              const percentage = Math.round((item.count / (maxCount || 1)) * 100);
              return (
                <div
                  key={item.equipment.id}
                  onClick={() => setSelectedEquipmentId(item.equipment.id)}
                  className="group cursor-pointer space-y-1.5 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex justify-between text-sm font-semibold text-slate-800">
                    <span className="group-hover:text-amber-700 transition-colors flex items-center gap-2">
                      <span>{item.equipment.name}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {item.equipment.category}
                      </span>
                    </span>
                    <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900">
                      {item.count} bookings →
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-500 group-hover:bg-amber-400 transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 6)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Live Check-ins
              </h2>
              <button
                onClick={() => setActiveCheckinsModalOpen(true)}
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                View All ({liveActiveCheckins.length})
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {liveActiveCheckins.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {liveActiveCheckins.slice(0, 5).map((c) => (
                  <li
                    key={c.id}
                    onClick={() => openUserDetail(c.profile, c.user_id)}
                    className="py-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 px-2 rounded-xl transition-colors"
                  >
                    <div className="relative shrink-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 font-black text-amber-400 text-xs shadow-inner">
                        {(c.profile?.full_name || "M")[0].toUpperCase()}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {c.profile?.full_name || "Checked-in Maker"}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-500 truncate">
                        {c.purpose_of_visit}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[10px] font-black text-amber-900">
                      {getTimeRemainingStr(c.checkin_timestamp, c.estimated_duration)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 py-12 text-center">
                No active check-ins currently logged.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 1. Active Check-ins Modal */}
      {activeCheckinsModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold">
                  <Activity className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    Currently Checked-in Makers ({liveActiveCheckins.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Click on any maker to view their full profile details
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveCheckinsModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-4 flex items-center gap-2.5 rounded-2xl bg-slate-50 px-4 py-2.5 border border-slate-200">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search checked-in makers by name, purpose, or department..."
                value={checkinSearchQuery}
                onChange={(e) => setCheckinSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1">
              {filteredCheckins.length > 0 ? (
                filteredCheckins.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => openUserDetail(c.profile, c.user_id)}
                    className="py-3.5 px-2 flex items-center justify-between gap-3 cursor-pointer hover:bg-amber-50/50 rounded-2xl transition-all"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 font-black text-amber-400 text-sm shadow-md border border-slate-800">
                        {c.profile?.avatar_url ? (
                          <img
                            src={c.profile.avatar_url}
                            alt=""
                            className="h-full w-full rounded-2xl object-cover"
                          />
                        ) : (
                          <span>{(c.profile?.full_name || "M")[0].toUpperCase()}</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900 truncate">
                            {c.profile?.full_name || "Maker"}
                          </h4>
                          {c.profile?.department && (
                            <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                              {c.profile.department}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-amber-800 mt-0.5 truncate">
                          🎯 {c.purpose_of_visit}
                        </p>
                        <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                          Checked-in at {format(new Date(c.checkin_timestamp), "h:mm a")} ({c.estimated_duration})
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-200/70 border border-amber-300 px-3 py-1 text-xs font-black text-amber-900">
                        <Clock className="h-3.5 w-3.5 text-amber-700" />
                        {getTimeRemainingStr(c.checkin_timestamp, c.estimated_duration)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs font-bold text-slate-500">
                  No checked-in makers found.
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 2. Check-in History Modal */}
      {historyModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-800 font-bold">
                  <Clock className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    Check-in History Log ({checkinHistoryList.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    7-day recorded visits. Click any maker to inspect their user details.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search & Tabs */}
            <div className="pt-4 pb-3 space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search history by name, department, or purpose..."
                    value={historySearchQuery}
                    onChange={(e) => setHistorySearchQuery(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold shrink-0">
                  <button
                    onClick={() => setHistoryFilterTab("all")}
                    className={`rounded-lg px-3 py-1.5 transition-all ${historyFilterTab === "all"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                      }`}
                  >
                    All ({checkinHistoryList.length})
                  </button>
                  <button
                    onClick={() => setHistoryFilterTab("completed")}
                    className={`rounded-lg px-3 py-1.5 transition-all ${historyFilterTab === "completed"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                      }`}
                  >
                    Completed
                  </button>
                  <button
                    onClick={() => setHistoryFilterTab("live")}
                    className={`rounded-lg px-3 py-1.5 transition-all ${historyFilterTab === "live"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                      }`}
                  >
                    Live Now ({liveActiveCheckins.length})
                  </button>
                </div>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((c) => {
                  const active = c.is_active !== false && isCheckinActive(c.checkin_timestamp, c.estimated_duration, now.getTime());
                  return (
                    <div
                      key={c.id}
                      onClick={() => openUserDetail(c.profile, c.user_id)}
                      className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-4 hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-sm cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {c.profile?.avatar_url ? (
                          <img
                            src={c.profile.avatar_url}
                            alt={c.profile.full_name || "User"}
                            className="h-10 w-10 shrink-0 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                            {c.profile?.full_name?.charAt(0) || "U"}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-extrabold text-slate-900 truncate hover:text-blue-600 transition-colors">
                              {c.profile?.full_name || "Anonymous Maker"}
                            </p>
                            {c.profile?.department && (
                              <span className="shrink-0 rounded-md bg-slate-200/70 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                                {c.profile.department}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-semibold text-slate-600 truncate mt-0.5">
                            🎯 {c.purpose_of_visit || "General Work"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                          <p className="text-[11px] font-bold text-slate-800">
                            {format(new Date(c.checkin_timestamp), "MMM d, h:mm a")}
                          </p>
                          <p className="text-[10px] font-semibold text-slate-500">
                            {c.estimated_duration || "30 mins"}
                          </p>
                        </div>

                        {active ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-1 text-[10px] font-black text-emerald-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                            Live
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-200/80 border border-slate-300 px-2.5 py-1 text-[10px] font-bold text-slate-700">
                            <CheckCircle2 className="h-3 w-3 text-slate-500" />
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-xs font-bold text-slate-500">
                  No check-in history records found matching criteria.
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 2. Registered Users Modal */}
      {usersModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-800 font-bold">
                  <Users className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    Registered Lab Users ({userProfiles.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    SJCET students & staff accounts. Click any user to inspect profile.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUsersModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-4 flex items-center gap-2.5 rounded-2xl bg-slate-50 px-4 py-2.5 border border-slate-200">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search by name, department, or role..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => openUserDetail(user)}
                  className="py-3.5 px-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-indigo-50/50 rounded-2xl transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 font-black text-amber-400 text-sm shadow-md border border-slate-800">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt=""
                          className="h-full w-full rounded-2xl object-cover"
                        />
                      ) : (
                        <span>{(user.full_name || "U")[0].toUpperCase()}</span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900 truncate">
                          {user.full_name || "Unnamed User"}
                        </h4>
                        {user.role === "admin" && (
                          <span className="rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-black text-amber-900">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5 truncate">
                        {user.email ? `${user.email} · ` : ""}
                        {user.department || "SJCET AICTE IDEA Lab Member"}
                        {user.year_of_study ? ` · ${user.year_of_study}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {user.skill_tags && user.skill_tags.length > 0 && (
                      <span className="hidden sm:inline-block rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 border border-slate-200">
                        {user.skill_tags.length} skills
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-indigo-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 3. Bookings Modal */}
      {bookingsModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-bold">
                  <CalendarCheck className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    Equipment Reservations History
                  </h3>
                  <p className="text-xs text-slate-500">
                    Click on a reservation to inspect user details or machine details
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBookingsModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="my-4 flex items-center gap-2 border-b border-slate-100 pb-2">
              <button
                onClick={() => setBookingFilterTab("today")}
                className={`rounded-full px-4 py-2 text-xs font-black transition-all ${bookingFilterTab === "today"
                  ? "bg-slate-950 text-amber-400 shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
              >
                Today ({todayBookingsList.length})
              </button>
              <button
                onClick={() => setBookingFilterTab("week")}
                className={`rounded-full px-4 py-2 text-xs font-black transition-all ${bookingFilterTab === "week"
                  ? "bg-slate-950 text-amber-400 shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
              >
                This Week ({weekBookingsList.length})
              </button>
              <button
                onClick={() => setBookingFilterTab("all")}
                className={`rounded-full px-4 py-2 text-xs font-black transition-all ${bookingFilterTab === "all"
                  ? "bg-slate-950 text-amber-400 shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
              >
                All History ({reservations.length})
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1">
              {modalBookingsList.length > 0 ? (
                modalBookingsList.map((res) => {
                  const eq = res.equipment;
                  const profile = res.profile;
                  const startDate = new Date(res.start_time);
                  const endDate = new Date(res.end_time);

                  return (
                    <div
                      key={res.id}
                      className="py-3.5 px-3 flex items-center justify-between gap-3 hover:bg-amber-50/40 rounded-2xl transition-all"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          onClick={() => setSelectedEquipmentId(res.equipment_id)}
                          className="h-11 w-11 shrink-0 rounded-2xl bg-stone-100 p-1 border border-stone-200 cursor-pointer hover:scale-105 transition-transform flex items-center justify-center"
                          title="Click to view equipment details"
                        >
                          <img
                            src={eq?.image_url || "/equipments/3d_printer.png"}
                            alt=""
                            className="h-full w-full object-contain"
                          />
                        </div>

                        <div className="min-w-0">
                          <h4
                            onClick={() => setSelectedEquipmentId(res.equipment_id)}
                            className="text-sm font-black text-slate-900 truncate hover:text-amber-700 cursor-pointer"
                          >
                            {eq?.name || "Machinery Booking"}
                          </h4>
                          <p className="text-xs font-semibold text-slate-500 mt-0.5">
                            {format(startDate, "EEE, MMM d · h:mm a")} - {format(endDate, "h:mm a")}
                          </p>
                        </div>
                      </div>

                      <div
                        onClick={() => openUserDetail(profile, res.user_id)}
                        className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded-xl border border-transparent hover:border-slate-200 transition-all shrink-0"
                        title="Click to view user details"
                      >
                        <div className="text-right">
                          <p className="text-xs font-black text-slate-900">
                            {profile?.full_name || "Maker"}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400">
                            {profile?.department || "Lab Member"}
                          </p>
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 font-black text-amber-400 text-xs">
                          {(profile?.full_name || "M")[0].toUpperCase()}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-xs font-bold text-slate-500">
                  No reservations found for this timeframe.
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 4. Equipment Detail Breakdown Modal */}
      {activeEquipmentDetail && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-amber-100 p-1 flex items-center justify-center shrink-0 border border-amber-300">
                  <img
                    src={activeEquipmentDetail.equipment.image_url || "/equipments/3d_printer.png"}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    {activeEquipmentDetail.equipment.name}
                  </h3>
                  <p className="text-xs font-semibold text-purple-700">
                    Category: {activeEquipmentDetail.equipment.category} · {activeEquipmentDetail.count} total bookings
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEquipmentId(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
                Booking Log & Reserved Makers
              </h4>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1">
              {activeEquipmentDetail.reservations.length > 0 ? (
                activeEquipmentDetail.reservations.map((res) => {
                  const startDate = new Date(res.start_time);
                  const endDate = new Date(res.end_time);
                  const profile = res.profile;

                  return (
                    <div
                      key={res.id}
                      onClick={() => openUserDetail(profile, res.user_id)}
                      className="py-3 px-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-purple-50/50 rounded-2xl transition-all"
                    >
                      <div>
                        <p className="text-xs font-black text-slate-900">
                          {format(startDate, "EEE, MMM d, yyyy")}
                        </p>
                        <p className="text-xs font-semibold text-purple-700 mt-0.5">
                          ⏰ {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="text-right">
                          <p className="text-xs font-black text-slate-900">
                            {profile?.full_name || "Maker"}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400">
                            {profile?.department || "Lab Member"}
                          </p>
                        </div>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 font-black text-amber-400 text-xs shadow-sm">
                          {(profile?.full_name || "M")[0].toUpperCase()}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-xs font-bold text-slate-500">
                  No reservation logs recorded for this equipment.
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 5. User Details Modal (Global Inspector for any clicked user) */}
      {inspectingUser && mounted && createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#FCFBF4] p-6 shadow-2xl border border-stone-200 space-y-6">
            {/* Header / Avatar banner */}
            <div className="relative rounded-2xl bg-gradient-to-br from-[#FFE033] via-[#FFB703] to-[#FB8500] p-6 text-slate-950 shadow-md">
              <button
                onClick={() => setInspectingUser(null)}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/20 text-slate-950 hover:bg-slate-950 hover:text-amber-400 transition-all"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-slate-950 p-1 shadow-lg">
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-slate-900 font-black text-amber-400 text-2xl">
                    {inspectingUser.avatar_url ? (
                      <img
                        src={inspectingUser.avatar_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{(inspectingUser.full_name || "U")[0].toUpperCase()}</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-950 tracking-tight">
                      {inspectingUser.full_name}
                    </h3>
                  </div>
                  {inspectingUser.email && (
                    <p className="text-xs font-bold text-slate-900/80">
                      {inspectingUser.email}
                    </p>
                  )}

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-950">
                    {inspectingUser.role === "admin" ? (
                      <span className="rounded-full bg-slate-950 px-2.5 py-0.5 text-[10px] font-black text-amber-400 uppercase">
                        Lab Administrator
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-950/10 px-2.5 py-0.5 text-[10px] font-black uppercase">
                        Lab Maker
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Info */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
                <p className="text-[10px] font-black uppercase tracking-wider text-stone-500 mb-2">
                  Academic Profile
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>{inspectingUser.department || "Engineering Student"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>{inspectingUser.year_of_study || "SJCET Pala"}</span>
                  </div>
                </div>
              </div>

              {inspectingUser.bio && (
                <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
                  <p className="text-[10px] font-black uppercase tracking-wider text-stone-500 mb-1">
                    Bio
                  </p>
                  <p className="text-xs font-semibold leading-relaxed text-slate-800">
                    &ldquo;{inspectingUser.bio}&rdquo;
                  </p>
                </div>
              )}

              {/* Skills Tags */}
              {inspectingUser.skill_tags && inspectingUser.skill_tags.length > 0 && (
                <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
                  <p className="text-[10px] font-black uppercase tracking-wider text-stone-500 mb-2 flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-amber-600" />
                    Skills & Competencies
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {inspectingUser.skill_tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-xl border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-black text-slate-950"
                      >
                        ⚡ {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tech / Languages */}
              {inspectingUser.languages && inspectingUser.languages.length > 0 && (
                <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
                  <p className="text-[10px] font-black uppercase tracking-wider text-stone-500 mb-2 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-amber-600" />
                    Programming Languages
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {inspectingUser.languages.map((lang, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-xl bg-stone-50 p-2 border border-stone-200 text-xs"
                      >
                        <span className="font-bold text-slate-900">{lang.name}</span>
                        <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                          {lang.level}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GitHub link */}
              {inspectingUser.github_url && (
                <a
                  href={inspectingUser.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-2xl bg-slate-950 p-3.5 text-xs font-black text-white hover:bg-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-amber-400" />
                    <span>View GitHub Portfolio</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-amber-400" />
                </a>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}