import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { equipment, events, spaceCheckins, userProfiles } from "@/lib/db/schema";
import { eq, sql, gte } from "drizzle-orm";

export const revalidate = 60;

export async function GET() {
  try {
    const [equipmentList, upcomingEvents, allEvents, checkinCount, profilesCount] =
      await Promise.all([
        db
          .select()
          .from(equipment)
          .orderBy(equipment.createdAt),
        db
          .select()
          .from(events)
          .where(gte(events.startTime, new Date()))
          .orderBy(events.startTime),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(events),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(spaceCheckins)
          .where(eq(spaceCheckins.isActive, true)),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(userProfiles),
      ]);

    return NextResponse.json({
      equipment: equipmentList.map((e) => ({
        id: e.id,
        name: e.name,
        category: e.category,
        description: e.description || "",
        image_url: e.imageUrl || "",
        price: e.price || "0",
        is_available: e.isAvailable,
      })),
      upcomingEvents: upcomingEvents.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description || "",
        event_type: e.eventType || "Workshop",
        location: e.location || "Choondacherry Campus",
        start_time: e.startTime.toISOString(),
      })),
      stats: {
        equipmentTotal: equipmentList.length,
        eventsTotal: allEvents[0]?.count ?? 0,
        activeMakers: checkinCount[0]?.count ?? 0,
        profilesTotal: profilesCount[0]?.count ?? 0,
      },
    });
  } catch (err: any) {
    console.error("Landing data fetch error:", err);
    return NextResponse.json(
      { error: err?.message || "Server Error" },
      { status: 500 }
    );
  }
}
