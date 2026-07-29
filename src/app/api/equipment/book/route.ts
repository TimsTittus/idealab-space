import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { equipment_id, start_time, end_time } = body;

  if (!equipment_id || !start_time || !end_time) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("equipment_reservations")
    .insert({
      equipment_id,
      user_id: user.id,
      start_time,
      end_time,
      status: "confirmed",
    })
    .select()
    .single();

  if (error) {
    // EXCLUDE constraint violation — double booking attempt
    if (error.code === "23P01") {
      return NextResponse.json(
        {
          error:
            "This time slot has already been booked. Please choose a different time.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}