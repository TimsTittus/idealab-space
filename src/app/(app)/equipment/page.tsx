import { createClient } from "@/lib/supabase/server";
import EquipmentClient, { EquipmentItem } from "./EquipmentClient";

export default async function EquipmentPage() {
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("equipment")
    .select("*")
    .order("category", { ascending: true });

  const initialItems: EquipmentItem[] =
    items && items.length > 0
      ? items.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category || "General",
        description: item.description || "",
        is_available: item.is_available ?? true,
      }))
      : [];

  return <EquipmentClient initialItems={initialItems} />;
}