import { createClient } from "@/lib/supabase/server";
import { isUserAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { equipmentReservations, equipment, userProfiles } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const authorized = await isUserAdmin(supabase, user);
  if (!user || !authorized) {
    return { authorized: false, user: null };
  }
  return { authorized: true, user };
}

export async function GET() {
  const { authorized } = await verifyAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const rows = await db
      .select({
        id: equipmentReservations.id,
        equipmentId: equipmentReservations.equipmentId,
        userId: equipmentReservations.userId,
        startTime: equipmentReservations.startTime,
        endTime: equipmentReservations.endTime,
        purpose: equipmentReservations.purpose,
        status: equipmentReservations.status,
        createdAt: equipmentReservations.createdAt,
        equipmentName: equipment.name,
        equipmentCategory: equipment.category,
        equipmentImageUrl: equipment.imageUrl,
        studentName: userProfiles.fullName,
        studentEmail: userProfiles.email,
        studentDepartment: userProfiles.department,
        studentYear: userProfiles.yearOfStudy,
      })
      .from(equipmentReservations)
      .leftJoin(equipment, eq(equipmentReservations.equipmentId, equipment.id))
      .leftJoin(
        userProfiles,
        eq(equipmentReservations.userId, userProfiles.userId)
      )
      .orderBy(desc(equipmentReservations.createdAt));

    const bookings = rows.map((r) => ({
      id: r.id,
      equipment_id: r.equipmentId,
      user_id: r.userId,
      start_time: r.startTime,
      end_time: r.endTime,
      purpose: r.purpose || "",
      status: r.status,
      created_at: r.createdAt,
      equipment_name: r.equipmentName || "Unknown",
      equipment_category: r.equipmentCategory || "",
      equipment_image_url: r.equipmentImageUrl || "",
      student_name: r.studentName || "Unknown",
      student_email: r.studentEmail || "",
      student_department: r.studentDepartment || "",
      student_year: r.studentYear || "",
    }));

    return NextResponse.json({ bookings });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const { authorized } = await verifyAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, start_time, end_time, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Booking ID is required." },
        { status: 400 }
      );
    }

    if (!start_time || !end_time) {
      return NextResponse.json(
        { error: "Start time and end time are required." },
        { status: 400 }
      );
    }

    const start = new Date(start_time);
    const end = new Date(end_time);

    if (end <= start) {
      return NextResponse.json(
        { error: "End time must be after start time." },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(equipmentReservations)
      .set({
        startTime: start,
        endTime: end,
        status: status || "confirmed",
        updatedAt: new Date(),
      })
      .where(eq(equipmentReservations.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, booking: updated });
  } catch (err: any) {
    if (err?.message?.includes("no_double_booking") || err?.code === "23P01") {
      return NextResponse.json(
        {
          error:
            "Time conflict: another confirmed booking overlaps with the new time range.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: err?.message || "Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { authorized } = await verifyAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Booking ID is required." },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(equipmentReservations)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(equipmentReservations.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server Error" },
      { status: 500 }
    );
  }
}
