import { db } from "@/lib/db";
import { spaceCheckins, equipmentReservations } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function cleanupAndExpireActivity() {
  try {
    const now = new Date();
    const nowIso = now.toISOString();
    const oneWeekAgoIso = new Date(
      now.getTime() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    await db
      .update(spaceCheckins)
      .set({ isActive: false, updatedAt: now })
      .where(
        sql`${spaceCheckins.isActive} = true AND (${spaceCheckins.checkinTimestamp} + ${spaceCheckins.estimatedDuration}) < ${nowIso}::timestamptz`
      );

    await db
      .delete(spaceCheckins)
      .where(sql`${spaceCheckins.createdAt} < ${oneWeekAgoIso}::timestamptz`);

    await db
      .delete(equipmentReservations)
      .where(
        sql`${equipmentReservations.createdAt} < ${oneWeekAgoIso}::timestamptz`
      );
  } catch (error) {
    console.error("Error executing activity cleanup and expiration:", error);
  }
}