"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Star,
  ArrowUpRight,
  Wrench,
} from "lucide-react";

export interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  description: string;
  is_available: boolean;
  rating?: number;
  rate_text?: string;
  image_url?: string;
}

const DEFAULT_EQUIPMENT: EquipmentItem[] = [
  {
    id: "3d-printer-1",
    name: "3D Printer",
    category: "3D Printing",
    description: "High-precision FDM 3D Printer for PLA & PETG prototypes.",
    is_available: true,
    rating: 4.9,
    rate_text: "Free / Lab Pass",
    image_url: "/equipments/3d_printer.png",
  },
  {
    id: "laser-cutter-1",
    name: "CO2 Laser Cutter",
    category: "Laser Cutting",
    description: "80W CO2 Laser Engraving and Cutting Machine for acrylic and wood.",
    is_available: true,
    rating: 4.9,
    rate_text: "Free / Lab Pass",
    image_url: "/equipments/laser_cutter.png",
  },
  {
    id: "cnc-router-1",
    name: "CNC Router",
    category: "CNC Routing",
    description: "Precision 3-axis CNC Router for aluminum and hardwoods.",
    is_available: true,
    rating: 4.8,
    rate_text: "Free / Lab Pass",
    image_url: "/equipments/cnc_router.png",
  },
  {
    id: "oscilloscope-1",
    name: "Digital Oscilloscope",
    category: "Electronics",
    description: "100MHz 4-Channel Digital Storage Oscilloscope with FFT.",
    is_available: true,
    rating: 4.9,
    rate_text: "Free / Lab Pass",
    image_url: "/equipments/oscilloscope.png",
  },
  {
    id: "soldering-station-1",
    name: "Soldering Station",
    category: "Electronics",
    description: "ESD-safe Digital Soldering Station with heat gun attachment.",
    is_available: true,
    rating: 4.9,
    rate_text: "Free / Lab Pass",
    image_url: "/equipments/soldering_station.png",
  },
  {
    id: "pcb-printer-1",
    name: "PCB Prototyping System",
    category: "Embedded Systems",
    description: "Desktop PCB milling machine for rapid double-sided circuit fabrication.",
    is_available: true,
    rating: 4.9,
    rate_text: "Free / Lab Pass",
    image_url: "/equipments/pcb_printer.png",
  },
];

const getEquipmentImage = (name?: string, category?: string, imageUrl?: string) => {
  if (imageUrl) return imageUrl;
  const n = (name || "").toLowerCase();
  const c = (category || "").toLowerCase();
  if (n.includes("laser") || c.includes("laser")) return "/equipments/laser_cutter.png";
  if (n.includes("cnc") || c.includes("cnc")) return "/equipments/cnc_router.png";
  if (n.includes("soldering") || n.includes("hakko") || n.includes("station")) return "/equipments/soldering_station.png";
  if (n.includes("oscilloscope") || n.includes("rigol") || n.includes("signal")) return "/equipments/oscilloscope.png";
  if (n.includes("pcb") || n.includes("circuit") || c.includes("embedded") || n.includes("arduino")) return "/equipments/pcb_printer.png";
  if (c.includes("electronics")) return "/equipments/oscilloscope.png";
  return "/equipments/3d_printer.png";
};

interface EquipmentClientProps {
  initialItems: EquipmentItem[];
}

export default function EquipmentClient({ initialItems }: EquipmentClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const itemsToDisplay = useMemo(() => {
    const list = initialItems && initialItems.length > 0 ? initialItems : DEFAULT_EQUIPMENT;
    return list.map((item) => ({
      ...item,
      rating: item.rating || 4.9,
      rate_text: item.rate_text || "Free / Lab Pass",
      image_url: getEquipmentImage(item.name, item.category, item.image_url),
    }));
  }, [initialItems]);

  const categories = useMemo(() => {
    const set = new Set<string>(["All"]);
    itemsToDisplay.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [itemsToDisplay]);

  const filteredItems = useMemo(() => {
    return itemsToDisplay.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [itemsToDisplay, searchQuery, selectedCategory]);

  return (
    <div className="min-h-dvh bg-[#FCFBF4] text-slate-900 animate-fade-in pb-24">
      <div className="sticky top-0 z-20 px-5 pt-6 pb-4 bg-[#FCFBF4]/90 backdrop-blur-md border-b border-stone-200/50">
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">
          Lab Equipment
        </h1>
        <p className="text-xs font-bold text-stone-500 mt-0.5">
          Reserve 3D printers, CNC routers, & electronic workstations
        </p>
      </div>

      <div className="px-5 mt-4 flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2.5 rounded-full bg-white px-4 py-3 shadow-xs border border-stone-200 transition-all focus-within:ring-2 focus-within:ring-amber-500/20">
          <Search className="h-5 w-5 text-stone-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search machinery or specs..."
            className="w-full bg-transparent text-xs font-bold text-slate-900 placeholder-stone-400 outline-none"
          />
        </div>

        <button
          onClick={() => setSelectedCategory("All")}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-400 hover:bg-amber-300 transition-all active:scale-95 shadow-xs border border-amber-500/30 text-slate-950 font-black"
          title="Reset Filters"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 px-5">
        <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-2 text-xs font-black whitespace-nowrap transition-all active:scale-95 ${selectedCategory === cat
                ? "bg-slate-950 text-amber-400 shadow-md"
                : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 px-5 flex items-center justify-between">
        <h2 className="text-lg font-black text-slate-950 tracking-tight">
          Available Machinery
        </h2>
        <button
          onClick={() => setSelectedCategory("All")}
          className="text-xs font-bold text-amber-700 hover:text-slate-950 transition-colors"
        >
          Show All
        </button>
      </div>

      <div className="mt-4 px-5 grid grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <Link
            key={item.id}
            href={`/equipment/${item.id}`}
            className="relative flex flex-col justify-between rounded-[28px] bg-white p-4 shadow-sm border border-stone-200 transition-all hover:shadow-md hover:border-amber-400 active:scale-[0.98]"
          >
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-slate-950 px-2.5 py-1 text-[10px] font-black text-amber-400 shadow-sm">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span>{item.rating}</span>
            </div>

            <div className="my-2 flex h-36 w-full items-center justify-center p-2 bg-stone-50 rounded-2xl border border-stone-100">
              <img
                src={item.image_url}
                alt={item.name}
                className="h-full w-full object-contain drop-shadow-sm transition-transform duration-300 hover:scale-105"
              />
            </div>

            <div className="mt-2 flex items-end justify-between gap-1">
              <div className="min-w-0 flex-1 pr-1">
                <h3 className="text-sm font-black text-slate-950 truncate tracking-tight">
                  {item.name}
                </h3>
                <p className="mt-0.5 text-[11px] font-bold text-amber-700 truncate">
                  {item.rate_text}
                </p>
              </div>

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-amber-400 shadow-md transition-transform hover:scale-105 active:scale-95">
                <ArrowUpRight className="h-4.5 w-4.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="mt-16 text-center px-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 border border-amber-300">
            <Wrench className="h-8 w-8 text-amber-800" />
          </div>
          <p className="mt-4 text-base font-black text-slate-900">
            No equipment found
          </p>
          <p className="mt-1 text-xs font-semibold text-stone-500">
            Try searching for something else or reset your filter.
          </p>
        </div>
      )}
    </div>
  );
}