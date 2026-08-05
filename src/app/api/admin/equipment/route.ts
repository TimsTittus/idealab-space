import { createClient } from "@/lib/supabase/server";
import { isUserAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { equipment } from "@/lib/db/schema";
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

// POST: Add new equipment
export async function POST(request: Request) {
  const { authorized } = await verifyAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, category, description, image_url, price, is_available } = body;

    const trimmedName = name?.trim();
    const trimmedCategory = category?.trim();

    if (!trimmedName || !trimmedCategory) {
      return NextResponse.json(
        { error: "Equipment Name and Category are required." },
        { status: 400 }
      );
    }

    const [newEq] = await db
      .insert(equipment)
      .values({
        name: trimmedName,
        category: trimmedCategory || "General",
        description: description?.trim() || "",
        imageUrl: image_url?.trim() || "/equipments/3d_printer.png",
        price: price !== undefined && price !== null && price !== "" ? String(price) : "0",
        isAvailable: is_available ?? true,
      })
      .returning();

    return NextResponse.json({
      success: true,
      equipment: {
        id: newEq.id,
        name: newEq.name,
        category: newEq.category,
        description: newEq.description || "",
        image_url: newEq.imageUrl || "",
        price: newEq.price || "0",
        is_available: newEq.isAvailable,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server Error" },
      { status: 500 }
    );
  }
}

// PUT: Edit existing equipment
export async function PUT(request: Request) {
  const { authorized } = await verifyAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, name, category, description, image_url, price, is_available } = body;

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

    const [updatedEq] = await db
      .update(equipment)
      .set({
        name: trimmedName,
        category: trimmedCategory,
        description: description?.trim() || "",
        imageUrl: image_url?.trim() || "/equipments/3d_printer.png",
        price: price !== undefined && price !== null && price !== "" ? String(price) : "0",
        isAvailable: is_available ?? true,
        updatedAt: new Date(),
      })
      .where(eq(equipment.id, id))
      .returning();

    if (!updatedEq) {
      return NextResponse.json({ error: "Equipment not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      equipment: {
        id: updatedEq.id,
        name: updatedEq.name,
        category: updatedEq.category,
        description: updatedEq.description || "",
        image_url: updatedEq.imageUrl || "",
        price: updatedEq.price || "0",
        is_available: updatedEq.isAvailable,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server Error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete equipment permanently from DB
export async function DELETE(request: Request) {
  const { authorized } = await verifyAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Equipment ID is required." }, { status: 400 });
    }

    const deletedRows = await db
      .delete(equipment)
      .where(eq(equipment.id, id))
      .returning();

    if (deletedRows.length === 0) {
      return NextResponse.json(
        { error: "Equipment not found or already deleted." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Equipment deleted successfully from database.",
      id: deletedRows[0].id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server Error" },
      { status: 500 }
    );
  }
}