import { createClient } from "@/lib/supabase/server";
import { startOfDay, startOfWeek, format } from "date-fns";
import {
  Users,
  Activity,
  CalendarCheck,
  Wrench,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { cleanupAndExpireActivity } from "@/lib/checkinCleanup";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  await cleanupAndExpireActivity();
  const supabase = await createClient();

  const now = new Date();
  const todayStart = startOfDay(now).toISOString();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString();

  const [
    activeCheckinsRes,
    totalUsersRes,
    todayBookingsRes,
    weekBookingsRes,
    equipmentListRes,
    reservationsRes,
    recentCheckinsRes,
  ] = await Promise.all([
    supabase
      .from("space_checkins")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("equipment_reservations")
      .select("*", { count: "exact", head: true })
      .gte("start_time", todayStart),
    supabase
      .from("equipment_reservations")
      .select("*", { count: "exact", head: true })
      .gte("start_time", weekStart),
    supabase.from("equipment").select("id, name, category, image_url"),
    supabase.from("equipment_reservations").select("equipment_id"),
    supabase
      .from("space_checkins")
      .select("id, purpose_of_visit, checkin_timestamp, user_id")
      .eq("is_active", true)
      .order("checkin_timestamp", { ascending: false })
      .limit(5),
  ]);

  const activeCheckins = activeCheckinsRes.count || 0;
  const totalUsers = totalUsersRes.count || 0;
  const todayBookings = todayBookingsRes.count || 0;
  const weekBookings = weekBookingsRes.count || 0;

  // Aggregate utilization count per equipment
  const equipmentMap = new Map<
    string,
    { name: string; category: string; count: number }
  >();

  (equipmentListRes.data || []).forEach((eq) => {
    equipmentMap.set(eq.id, {
      name: eq.name,
      category: eq.category,
      count: 0,
    });
  });

  (reservationsRes.data || []).forEach((res) => {
    const item = equipmentMap.get(res.equipment_id);
    if (item) {
      item.count += 1;
    }
  });

  const sortedEquipment = Array.from(equipmentMap.values()).sort(
    (a, b) => b.count - a.count
  );

  const mostUtilized = sortedEquipment.length > 0 ? sortedEquipment[0] : null;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Analytics & Usage Overview
        </h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Real-time metrics for SJCET AICTE IDEA Lab usage and bookings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Check-ins
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Activity className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {activeCheckins}
            </span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Live in Lab
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Currently checked-in lab visitors
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Registered Users
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <Users className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {totalUsers}
            </span>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              @sjcetpalai.ac.in
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Total active student & staff accounts
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Bookings (Today / Week)
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <CalendarCheck className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {todayBookings}
            </span>
            <span className="text-xs font-medium text-slate-500">
              / {weekBookings} this week
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Confirmed equipment reservations
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Top Machinery
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <Wrench className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xl font-bold text-slate-900 block truncate">
              {mostUtilized ? mostUtilized.name : "N/A"}
            </span>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full inline-block mt-1">
              {mostUtilized ? `${mostUtilized.count} bookings` : "0 bookings"}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 truncate">
            {mostUtilized?.category || "Equipment utilization metric"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Equipment Usage Breakdown
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Total reservation count by machinery type
              </p>
            </div>
            <TrendingUp className="h-5 w-5 text-amber-500" />
          </div>

          <div className="space-y-4">
            {sortedEquipment.map((eq) => {
              const maxCount = sortedEquipment[0]?.count || 1;
              const percentage = Math.round(
                (eq.count / (maxCount || 1)) * 100
              );
              return (
                <div key={eq.name} className="space-y-1.5">
                  <div className="flex justify-between text-sm font-semibold text-slate-800">
                    <span>{eq.name}</span>
                    <span className="text-xs font-bold text-slate-500">
                      {eq.count} bookings
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all duration-500"
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
              <Clock className="h-4 w-4 text-emerald-600" />
            </div>

            {(recentCheckinsRes.data || []).length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {(recentCheckinsRes.data || []).map((c) => (
                  <li key={c.id} className="py-3 flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {c.purpose_of_visit}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {format(new Date(c.checkin_timestamp), "h:mm a, MMM d")}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">
                No active check-ins currently logged.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}