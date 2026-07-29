import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Wrench, ChevronRight } from "lucide-react";

const categoryColors: Record<string, string> = {
  "3D Printing": "bg-primary/10 text-primary",
  "Laser Cutting": "bg-danger/10 text-danger",
  "CNC Routing": "bg-accent-amber/10 text-accent-amber",
  Electronics: "bg-accent-blue/10 text-accent-blue",
  "Embedded Systems": "bg-accent-green/10 text-accent-green",
  General: "bg-surface-tertiary text-text-secondary",
};

export default async function EquipmentPage() {
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("equipment")
    .select("*")
    .order("category", { ascending: true });

  // Group by category
  const grouped: Record<string, typeof items> = {};
  items?.forEach((item) => {
    const cat = item.category || "General";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat]!.push(item);
  });

  return (
    <div className="animate-fade-in px-5 pt-8">
      <h1 className="text-2xl font-extrabold text-text-primary">Equipment</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Book lab equipment for your projects
      </p>

      {Object.entries(grouped).map(([category, categoryItems]) => (
        <div key={category} className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-tertiary">
            {category}
          </h2>
          <div className="mt-3 space-y-3 stagger-children">
            {categoryItems?.map((item) => (
              <Link
                key={item.id}
                href={`/equipment/${item.id}`}
                className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition-all hover:shadow-sm active:scale-[0.98]"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${categoryColors[category] || categoryColors.General
                    }`}
                >
                  <Wrench className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary">{item.name}</p>
                  <p className="mt-0.5 truncate text-xs text-text-secondary">
                    {item.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {item.is_available ? (
                    <span className="flex h-2.5 w-2.5 rounded-full bg-accent-green" />
                  ) : (
                    <span className="flex h-2.5 w-2.5 rounded-full bg-danger" />
                  )}
                  <ChevronRight className="h-4 w-4 text-text-tertiary" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {(!items || items.length === 0) && (
        <div className="mt-12 text-center">
          <Wrench className="mx-auto h-10 w-10 text-text-tertiary" />
          <p className="mt-3 text-sm text-text-secondary">
            No equipment listed yet
          </p>
        </div>
      )}
    </div>
  );
}