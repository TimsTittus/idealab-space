import { createClient } from "@/lib/supabase/server";
import { parsePostgresIntervalMs } from "@/lib/parseInterval";

export async function cleanupAndExpireActivity() {
  try {
    const supabase = await createClient();
    const now = new Date();
    const nowMs = now.getTime();
    const oneWeekAgoIso = new Date(
      nowMs - 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    // 1. Fetch active check-ins to evaluate expiration
    const { data: activeCheckins } = await supabase
      .from("space_checkins")
      .select("id, checkin_timestamp, estimated_duration")
      .eq("is_active", true);

    if (activeCheckins && activeCheckins.length > 0) {
      const expiredIds: string[] = [];

      for (const checkin of activeCheckins) {
        const startMs = new Date(checkin.checkin_timestamp).getTime();
        const durationMs = parsePostgresIntervalMs(checkin.estimated_duration);

        if (nowMs >= startMs + durationMs) {
          expiredIds.push(checkin.id);
        }
      }

      if (expiredIds.length > 0) {
        await supabase
          .from("space_checkins")
          .update({ is_active: false })
          .in("id", expiredIds);
      }
    }

    // 2. Enforce 1-week retention
    await supabase
      .from("space_checkins")
      .delete()
      .lt("created_at", oneWeekAgoIso);

    await supabase
      .from("equipment_reservations")
      .delete()
      .lt("created_at", oneWeekAgoIso);
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE" || error?.message?.includes("DYNAMIC_SERVER_USAGE")) {
      throw error;
    }
    console.error("Error executing activity cleanup and expiration:", error);
  }
}