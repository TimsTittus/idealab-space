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

// POST: Add new equipment
export async function POST(request: Request) {
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, category, description, image_url, is_available } = body;

    const trimmedName = name?.trim();
    const trimmedCategory = category?.trim();

    if (!trimmedName || !trimmedCategory) {
      return NextResponse.json(
        { error: "Equipment Name and Category are required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("equipment")
      .insert({
        name: trimmedName,
        category: trimmedCategory || "General",
        description: description?.trim() || "",
        image_url: image_url?.trim() || "/equipments/3d_printer.png",
        is_available: is_available ?? true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, equipment: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server Error" },
      { status: 500 }
    );
  }
}

// PUT: Edit existing equipment
export async function PUT(request: Request) {
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, name, category, description, image_url, is_available } = body;

    if (!id) {
      return NextResponse.json({ error: "Equipment ID is required." }, { status: 400 });
    }

    const trimmedName = name?.trim();
    const trimmedCategory = category?.trim();

    if (!trimmedName || !trimmedCategory) {
      return NextResponse.json(
        { error: "Equipment Name and Category are required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("equipment")
      .update({
        name: trimmedName,
        category: trimmedCategory,
        description: description?.trim() || "",
        image_url: image_url?.trim() || "/equipments/3d_printer.png",
        is_available: is_available ?? true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, equipment: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server Error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete equipment permanently from DB
export async function DELETE(request: Request) {
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Equipment ID is required." }, { status: 400 });
    }

    const { error } = await supabase.from("equipment").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Equipment deleted successfully from database." });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server Error" },
      { status: 500 }
    );
  }
}