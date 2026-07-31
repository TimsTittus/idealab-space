import { createClient } from "@/lib/supabase/server";
import { isUserAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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

// POST: Add new event
export async function POST(request: Request) {
  const { authorized } = await verifyAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, description, event_type, location, start_time, end_time, image_url } = body;

    const trimmedTitle = title?.trim();
    if (!trimmedTitle || !start_time || !end_time) {
      return NextResponse.json(
        { error: "Event Title, Start Time, and End Time are required." },
        { status: 400 }
      );
    }

    const startDate = new Date(start_time);
    const endDate = new Date(end_time);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid Start Time or End Time date format." },
        { status: 400 }
      );
    }

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: "End Time must be after Start Time." },
        { status: 400 }
      );
    }

    const [newEvent] = await db
      .insert(events)
      .values({
        title: trimmedTitle,
        description: description?.trim() || "",
        eventType: event_type?.trim() || "Workshop",
        location: location?.trim() || "IDEA Lab, SJCET",
        startTime: startDate,
        endTime: endDate,
        imageUrl: image_url?.trim() || "",
      })
      .returning();

    return NextResponse.json({
      success: true,
      event: {
        id: newEvent.id,
        title: newEvent.title,
        description: newEvent.description || "",
        event_type: newEvent.eventType || "Workshop",
        location: newEvent.location || "IDEA Lab, SJCET",
        start_time: newEvent.startTime.toISOString(),
        end_time: newEvent.endTime.toISOString(),
        image_url: newEvent.imageUrl || "",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server Error" },
      { status: 500 }
    );
  }
}

// PUT: Update event
export async function PUT(request: Request) {
  const { authorized } = await verifyAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, title, description, event_type, location, start_time, end_time, image_url } = body;

    if (!id) {
      return NextResponse.json({ error: "Event ID is required." }, { status: 400 });
    }

    const trimmedTitle = title?.trim();
    if (!trimmedTitle || !start_time || !end_time) {
      return NextResponse.json(
        { error: "Event Title, Start Time, and End Time are required." },
        { status: 400 }
      );
    }

    const startDate = new Date(start_time);
    const endDate = new Date(end_time);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid Start Time or End Time date format." },
        { status: 400 }
      );
    }

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: "End Time must be after Start Time." },
        { status: 400 }
      );
    }

    const [updatedEvent] = await db
      .update(events)
      .set({
        title: trimmedTitle,
        description: description?.trim() || "",
        eventType: event_type?.trim() || "Workshop",
        location: location?.trim() || "IDEA Lab, SJCET",
        startTime: startDate,
        endTime: endDate,
        imageUrl: image_url?.trim() || "",
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))
      .returning();

    if (!updatedEvent) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      event: {
        id: updatedEvent.id,
        title: updatedEvent.title,
        description: updatedEvent.description || "",
        event_type: updatedEvent.eventType || "Workshop",
        location: updatedEvent.location || "IDEA Lab, SJCET",
        start_time: updatedEvent.startTime.toISOString(),
        end_time: updatedEvent.endTime.toISOString(),
        image_url: updatedEvent.imageUrl || "",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server Error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete event permanently from DB
export async function DELETE(request: Request) {
  const { authorized } = await verifyAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Event ID is required." }, { status: 400 });
    }

    const deletedRows = await db
      .delete(events)
      .where(eq(events.id, id))
      .returning();

    if (deletedRows.length === 0) {
      return NextResponse.json(
        { error: "Event not found or already deleted." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully.",
      id: deletedRows[0].id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server Error" },
      { status: 500 }
    );
  }
}