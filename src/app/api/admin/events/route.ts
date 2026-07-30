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

    if (!title || !start_time || !end_time) {
      return NextResponse.json(
        { error: "Title, Start Time, and End Time are required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("events")
      .insert({
        title,
        description: description || "",
        event_type: event_type || "Workshop",
        location: location || "IDEA Lab, SJCET",
        start_time: new Date(start_time).toISOString(), // timestamptz ISO format
        end_time: new Date(end_time).toISOString(),     // timestamptz ISO format
        image_url: image_url || "",
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

    const { data, error } = await supabase
      .from("events")
      .update({
        title,
        description,
        event_type,
        location,
        start_time: new Date(start_time).toISOString(),
        end_time: new Date(end_time).toISOString(),
        image_url,
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