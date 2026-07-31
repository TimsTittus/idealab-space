import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    return { authorized: false, supabase, user: null };
  }
  return { authorized: true, supabase, user };
}

// POST: Add new event
export async function POST(request: Request) {
  const { authorized, supabase } = await verifyAdmin();
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

    const { data, error } = await supabase
      .from("events")
      .insert({
        title: trimmedTitle,
        description: description?.trim() || "",
        event_type: event_type?.trim() || "Workshop",
        location: location?.trim() || "IDEA Lab, SJCET",
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        image_url: image_url?.trim() || "",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, event: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server Error" },
      { status: 500 }
    );
  }
}

// PUT: Update event
export async function PUT(request: Request) {
  const { authorized, supabase } = await verifyAdmin();
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

    const { data, error } = await supabase
      .from("events")
      .update({
        title: trimmedTitle,
        description: description?.trim() || "",
        event_type: event_type?.trim() || "Workshop",
        location: location?.trim() || "IDEA Lab, SJCET",
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        image_url: image_url?.trim() || "",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, event: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server Error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete event
export async function DELETE(request: Request) {
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Event ID is required." }, { status: 400 });
    }

    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Event deleted successfully." });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server Error" },
      { status: 500 }
    );
  }
}