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

    if (!name || !category) {
      return NextResponse.json(
        { error: "Name and Category are required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("equipment")
      .insert({
        name,
        category: category || "General",
        description: description || "",
        image_url: image_url || "/equipments/3d_printer.png",
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

    const { data, error } = await supabase
      .from("equipment")
      .update({
        name,
        category,
        description,
        image_url,
        is_available,
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

// DELETE: Soft delete equipment by setting is_available = false to preserve reservations FK
export async function DELETE(request: Request) {
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const hard = searchParams.get("hard") === "true";

    if (!id) {
      return NextResponse.json({ error: "Equipment ID is required." }, { status: 400 });
    }

    if (hard) {
      const { error } = await supabase.from("equipment").delete().eq("id", id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: "Hard deleted" });
    }

    // Soft delete: toggle is_available = false to preserve foreign key constraints
    const { data, error } = await supabase
      .from("equipment")
      .update({ is_available: false, updated_at: new Date().toISOString() })
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