import { createClient } from "@/lib/supabase/server";
import { cleanupAndExpireActivity } from "@/lib/checkinCleanup";
import AdminAnalyticsClient from "./AdminAnalyticsClient";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  await cleanupAndExpireActivity();
  const supabase = await createClient();

  const [
    { data: allCheckinsData },
    { data: userProfilesData },
    { data: reservationsData },
    { data: equipmentData },
  ] = await Promise.all([
    supabase
      .from("space_checkins")
      .select("*")
      .order("checkin_timestamp", { ascending: false }),

    supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false }),

    supabase
      .from("equipment_reservations")
      .select("*, equipment(id, name, category, image_url)")
      .order("start_time", { ascending: false }),

    supabase
      .from("equipment")
      .select("*")
      .order("name", { ascending: true }),
  ]);

  const profilesMap = new Map(
    (userProfilesData || []).map((p) => [p.user_id, p])
  );

  const enrichedAllCheckins = (allCheckinsData || []).map((c) => ({
    ...c,
    profile: profilesMap.get(c.user_id),
  }));

  const enrichedActiveCheckins = enrichedAllCheckins.filter((c) => c.is_active);

  const enrichedReservations = (reservationsData || []).map((r) => ({
    ...r,
    profile: profilesMap.get(r.user_id),
  }));

  return (
    <AdminAnalyticsClient
      activeCheckins={enrichedActiveCheckins}
      allCheckins={enrichedAllCheckins}
      userProfiles={userProfilesData || []}
      reservations={enrichedReservations}
      equipmentList={equipmentData || []}
    />
  );
}