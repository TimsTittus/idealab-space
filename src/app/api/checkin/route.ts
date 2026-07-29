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
  const { purpose_of_visit, estimated_duration } = body;

  if (!purpose_of_visit || !estimated_duration) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Deactivate any existing active checkins for this user
  await supabase
    .from("space_checkins")
    .update({ is_active: false })
    .eq("user_id", user.id)
    .eq("is_active", true);

  // Insert new checkin
  const { data, error } = await supabase
    .from("space_checkins")
    .insert({
      user_id: user.id,
      purpose_of_visit,
      estimated_duration,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}