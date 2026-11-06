import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const date_start = searchParams.get("date_start");
  const date_end = searchParams.get("date_end");

  if (!id) {
    return NextResponse.json({ error: "Equipment ID is required" }, { status: 400 });
  }

  const supabase = await createClient();

  const [eqRes, resRes, ratingRes, userRes] = await Promise.all([
    supabase.from("equipment").select("*").eq("id", id).single(),
    date_start && date_end
      ? supabase
          .from("equipment_reservations")
          .select("*")
          .eq("equipment_id", id)
          .eq("status", "confirmed")
          .gte("start_time", date_start)
          .lt("start_time", date_end)
      : Promise.resolve({ data: [] }),
    supabase.from("equipment_ratings").select("rating, user_id").eq("equipment_id", id),
    supabase.auth.getUser(),
  ]);

  if (!eqRes.data) {
    return NextResponse.json({ error: "Equipment not found" }, { status: 404 });
  }

  const ratings = ratingRes.data || [];
  const total = ratings.length;
  const sum = ratings.reduce((acc, r) => acc + Number(r.rating || 0), 0);
  const avg = total > 0 ? Number((sum / total).toFixed(1)) : 0;

  const currentUser = userRes.data?.user;
  const userRating = currentUser
    ? ratings.find((r) => r.user_id === currentUser.id)?.rating ?? null
    : null;

  return NextResponse.json({
    equipment: eqRes.data,
    reservations: resRes.data || [],
    avg_rating: avg,
    total_ratings: total,
    user_rating: userRating ? Number(userRating) : null,
  });
}
