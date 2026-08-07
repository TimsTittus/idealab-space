import { createClient } from "@/lib/supabase/server";
import EquipmentClient, { EquipmentItem } from "./EquipmentClient";

export default async function EquipmentPage() {
  const supabase = await createClient();

  const [{ data: items }, { data: ratings }] = await Promise.all([
    supabase
      .from("equipment")
      .select("*")
      .order("category", { ascending: true }),
    supabase.from("equipment_ratings").select("equipment_id, rating"),
  ]);

  const ratingsMap = new Map<string, { sum: number; count: number }>();
  if (ratings && ratings.length > 0) {
    ratings.forEach((r) => {
      const existing = ratingsMap.get(r.equipment_id) || { sum: 0, count: 0 };
      ratingsMap.set(r.equipment_id, {
        sum: existing.sum + Number(r.rating || 0),
        count: existing.count + 1,
      });
    });
  }

  const initialItems: EquipmentItem[] =
    items && items.length > 0
      ? items.map((item) => {
        const rInfo = ratingsMap.get(item.id);
        const count = rInfo ? rInfo.count : (item.rating && Number(item.rating) > 0 ? 1 : 0);
        const avg = rInfo && rInfo.count > 0
          ? Number((rInfo.sum / rInfo.count).toFixed(1))
          : (item.rating ? Number(item.rating) : 0);

        return {
          id: item.id,
          name: item.name,
          category: item.category || "General",
          description: item.description || "",
          image_url: item.image_url || "",
          is_available: item.is_available ?? true,
          price: item.price,
          rating: avg,
          rating_count: count,
        };
      })
      : [];

  return <EquipmentClient initialItems={initialItems} />;
}