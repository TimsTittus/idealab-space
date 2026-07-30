"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ChevronLeft,
  Heart,
  Star,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { format, addHours, addDays, startOfDay } from "date-fns";

interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  description: string;
  image_url?: string;
  rating?: number;
  rate_text?: string;
  hourly_rate?: number;
}

interface Reservation {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  user_id: string;
}

const DEFAULT_EQUIPMENT: EquipmentItem[] = [
  {
    id: "3d-printer-1",
    name: "3D Printer",
    category: "3D Printing",
    description:
      "High-precision FDM 3D Printer for PLA & PETG prototypes. Suitable for rapid prototyping and detailed model fabrication.",
    rating: 4.9,
    rate_text: "Free / Lab Pass",
    hourly_rate: 0,
    image_url: "/equipments/3d_printer.png",
  },
  {
    id: "laser-cutter-1",
    name: "CO2 Laser Cutter",
    category: "Laser Cutting",
    description:
      "80W CO2 Laser Engraving and Cutting Machine for acrylic, wood, and leather materials.",
    rating: 4.9,
    rate_text: "₹100 / hour",
    hourly_rate: 100,
    image_url: "/equipments/laser_cutter.png",
  },
  {
    id: "cnc-router-1",
    name: "CNC Router",
    category: "CNC Routing",
    description:
      "Precision 3-axis CNC Router for aluminum, hardwoods, and complex 3D surface carvings.",
    rating: 4.8,
    rate_text: "₹150 / hour",
    hourly_rate: 150,
    image_url: "/equipments/cnc_router.png",
  },
  {
    id: "oscilloscope-1",
    name: "Digital Oscilloscope",
    category: "Electronics",
    description:
      "100MHz 4-Channel Digital Storage Oscilloscope with FFT analysis, mathematical functions, and USB connectivity.",
    rating: 4.9,
    rate_text: "Free / Lab Pass",
    hourly_rate: 0,
    image_url: "/equipments/oscilloscope.png",
  },
  {
    id: "soldering-station-1",
    name: "Soldering Station",
    category: "Electronics",
    description:
      "ESD-safe Digital Soldering Station with variable thermal control and hot-air gun attachment.",
    rating: 4.9,
    rate_text: "Free / Lab Pass",
    hourly_rate: 0,
    image_url: "/equipments/soldering_station.png",
  },
  {
    id: "pcb-printer-1",
    name: "PCB Prototyping System",
    category: "Embedded Systems",
    description:
      "Desktop PCB milling machine for rapid double-sided circuit fabrication and surface-mount device prototyping.",
    rating: 4.9,
    rate_text: "₹80 / hour",
    hourly_rate: 80,
    image_url: "/equipments/pcb_printer.png",
  },
];

const getEquipmentImage = (
  name?: string,
  category?: string,
  imageUrl?: string
) => {
  if (imageUrl) return imageUrl;
  const n = (name || "").toLowerCase();
  const c = (category || "").toLowerCase();
  if (n.includes("laser") || c.includes("laser"))
    return "/equipments/laser_cutter.png";
  if (n.includes("cnc") || c.includes("cnc")) return "/equipments/cnc_router.png";
  if (
    n.includes("oscilloscope") ||
    n.includes("signal") ||
    c.includes("electronics") ||
    n.includes("rigol")
  )
    return "/equipments/oscilloscope.png";
  if (n.includes("soldering") || n.includes("station"))
    return "/equipments/soldering_station.png";
  if (
    n.includes("pcb") ||
    n.includes("circuit") ||
    c.includes("embedded") ||
    n.includes("arduino")
  )
    return "/equipments/pcb_printer.png";
  return "/equipments/3d_printer.png";
};

const formatHourlyCost = (item: EquipmentItem | null) => {
  if (!item) return { costStr: "Free", unitStr: "/ hour" };

  if (typeof item.hourly_rate === "number") {
    if (item.hourly_rate === 0) return { costStr: "Free", unitStr: "/ hour" };
    return { costStr: `₹${item.hourly_rate}`, unitStr: "/ hour" };
  }

  if (item.rate_text) {
    if (item.rate_text.toLowerCase().includes("free")) {
      return { costStr: "Free", unitStr: "/ hour" };
    }
    const match = item.rate_text.match(/[\d.]+/);
    if (match) {
      return { costStr: `₹${match[0]}`, unitStr: "/ hour" };
    }
    return { costStr: item.rate_text, unitStr: "/ hour" };
  }

  return { costStr: "Free", unitStr: "/ hour" };
};

const DAYS_TO_SHOW = [0, 1, 2, 3, 4, 5];

export default function EquipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const equipmentId = params.id as string;

  const [equipmentItem, setEquipmentItem] = useState<EquipmentItem | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedDate, setSelectedDate] = useState(0); // days from today
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isReadMore, setIsReadMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const loadData = useCallback(async () => {
    const dayStart = startOfDay(addDays(new Date(), selectedDate));
    const dayEnd = addDays(dayStart, 1);

    const [eqRes, resRes] = await Promise.all([
      supabase.from("equipment").select("*").eq("id", equipmentId).single(),
      supabase
        .from("equipment_reservations")
        .select("*")
        .eq("equipment_id", equipmentId)
        .eq("status", "confirmed")
        .gte("start_time", dayStart.toISOString())
        .lt("start_time", dayEnd.toISOString()),
    ]);

    if (eqRes.data) {
      setEquipmentItem(eqRes.data);
    } else {
      const fallback = DEFAULT_EQUIPMENT.find((item) => item.id === equipmentId);
      if (fallback) {
        setEquipmentItem(fallback);
      } else if (DEFAULT_EQUIPMENT.length > 0) {
        setEquipmentItem(DEFAULT_EQUIPMENT[0]);
      }
    }

    setReservations(resRes.data || []);
    setLoadingData(false);
  }, [supabase, equipmentId, selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Pre-calculate target dates for selector
  const availableDates = useMemo(() => {
    const now = new Date();
    return DAYS_TO_SHOW.map((d) => ({
      offset: d,
      date: addDays(now, d),
    }));
  }, []);

  // Calculate 1-hour time slots (8 AM to 8 PM)
  const slots = useMemo(() => {
    const baseDate = startOfDay(addDays(new Date(), selectedDate));
    const now = new Date();
    const result = [];

    for (let hour = 8; hour < 20; hour++) {
      const start = new Date(baseDate);
      start.setHours(hour, 0, 0, 0);
      const end = addHours(start, 1);

      const isBooked = reservations.some((r) => {
        const rStart = new Date(r.start_time);
        const rEnd = new Date(r.end_time);
        return start < rEnd && end > rStart;
      });

      const isPast = start < now;
      result.push({ hour, start, end, isBooked, isPast });
    }
    return result;
  }, [selectedDate, reservations]);

  const handleBook = async () => {
    if (selectedSlot === null) return;
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Please sign in to book equipment.");
      setLoading(false);
      return;
    }

    const baseDate = startOfDay(addDays(new Date(), selectedDate));
    const startTime = new Date(baseDate);
    startTime.setHours(selectedSlot, 0, 0, 0);
    const endTime = addHours(startTime, 1);

    const { error: bookError } = await supabase
      .from("equipment_reservations")
      .insert({
        equipment_id: equipmentId,
        user_id: user.id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: "confirmed",
      });

    if (bookError) {
      if (bookError.code === "23P01") {
        setError("This time slot was just booked by someone else. Please choose another.");
      } else {
        setError(bookError.message);
      }
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => {
      router.push("/equipment");
      router.refresh();
    }, 1500);
  };

  const selectedSlotText = useMemo(() => {
    if (selectedSlot === null) return "";
    const baseDate = startOfDay(addDays(new Date(), selectedDate));
    const start = new Date(baseDate);
    start.setHours(selectedSlot, 0, 0, 0);
    const end = addHours(start, 1);
    return `Book ${format(start, "h:mm a")} - ${format(end, "h:mm a")}`;
  }, [selectedSlot, selectedDate]);

  const equipmentImage = useMemo(() => {
    return getEquipmentImage(
      equipmentItem?.name,
      equipmentItem?.category,
      equipmentItem?.image_url
    );
  }, [equipmentItem]);

  const costInfo = useMemo(() => {
    return formatHourlyCost(equipmentItem);
  }, [equipmentItem]);

  if (loadingData) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#FFFDF5]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const shortDescription =
    equipmentItem?.description && equipmentItem.description.length > 90
      ? equipmentItem.description.slice(0, 90) + "..."
      : equipmentItem?.description || "";

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#FFFDF5] via-[#FCFAEE] to-[#F8F5E9] text-gray-900 animate-fade-in relative pb-40">
      {/* Top Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-4 bg-[#FFFDF5]/90 backdrop-blur-md">
        <Link
          href="/equipment"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm border border-black/5 text-gray-800 transition-all active:scale-95 hover:bg-gray-50"
        >
          <ChevronLeft className="h-5 w-5 text-gray-800" />
        </Link>
        <h1 className="text-base font-bold text-gray-900 tracking-tight">
          Tools Detail
        </h1>
        <button
          type="button"
          onClick={() => setIsFavorite(!isFavorite)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm border border-black/5 text-gray-800 transition-all active:scale-95 hover:bg-gray-50"
        >
          <Heart
            className={`h-5 w-5 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-700"
              }`}
          />
        </button>
      </div>

      <div className="relative flex flex-col items-center justify-center px-5 pt-2 pb-6">
        <div className="absolute top-4 inset-x-12 h-44 bg-amber-200/30 rounded-full blur-3xl -z-10" />
        <div className="my-2 flex h-56 sm:h-64 w-full items-center justify-center">
          <img
            src={equipmentImage}
            alt={equipmentItem?.name || "Equipment photo"}
            className="h-full max-h-56 sm:max-h-64 object-contain drop-shadow-xl transition-transform duration-300 hover:scale-105"
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="px-6 space-y-6">
        <div>
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              {equipmentItem?.name}
            </h2>
            <div className="text-right shrink-0">
              <span className="text-xl font-extrabold text-gray-900">
                {costInfo.costStr}
              </span>
              <span className="text-xs font-medium text-gray-400 block -mt-0.5">
                {costInfo.unitStr}
              </span>
            </div>
          </div>

          <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span>{equipmentItem?.rating || 4.9}</span>
            <span className="text-xs text-gray-400 font-normal">(9k)</span>
          </div>
        </div>

        {/* Date Selector */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3 tracking-tight">
            Select Date
          </h3>
          <div className="hide-scrollbar flex gap-3 overflow-x-auto py-1">
            {availableDates.map(({ offset, date }) => {
              const isSelected = selectedDate === offset;
              return (
                <button
                  key={offset}
                  type="button"
                  onClick={() => {
                    setSelectedDate(offset);
                    setSelectedSlot(null);
                    setLoadingData(true);
                  }}
                  className={`flex flex-col items-center justify-center min-w-[62px] px-3.5 py-2.5 rounded-2xl transition-all active:scale-95 shrink-0 ${isSelected
                    ? "bg-white border-2 border-[#FACC15] text-[#B45309] font-bold shadow-md scale-105"
                    : "bg-[#F4F3EE] border border-transparent text-gray-600 font-semibold hover:bg-gray-200"
                    }`}
                >
                  <span className="text-[11px] font-semibold opacity-80 leading-none">
                    {offset === 0 ? "Today" : format(date, "EEE")}
                  </span>
                  <span className="text-xs font-bold leading-tight mt-1">
                    {format(date, "d MMM")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Equipment Details Description */}
        <div className="text-sm text-gray-600 leading-relaxed">
          <span>
            {isReadMore ? equipmentItem?.description : shortDescription}
          </span>
          {equipmentItem?.description &&
            equipmentItem.description.length > 90 && (
              <button
                type="button"
                onClick={() => setIsReadMore(!isReadMore)}
                className="font-bold text-gray-900 hover:underline ml-1"
              >
                {isReadMore ? "Show less" : "...Read more"}
              </button>
            )}
        </div>

        {/* Available Slots */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3 tracking-tight">
            Available Slots
          </h3>
          <div className="grid grid-cols-3 gap-2.5">
            {slots.map((slot) => {
              const isSelected = selectedSlot === slot.hour;
              return (
                <button
                  key={slot.hour}
                  type="button"
                  disabled={slot.isBooked || slot.isPast}
                  onClick={() => setSelectedSlot(slot.hour)}
                  className={`flex items-center justify-center gap-1.5 rounded-full border px-3 py-2.5 text-xs font-semibold transition-all active:scale-95 ${slot.isBooked
                    ? "border-red-200 bg-red-50/60 text-red-300 line-through cursor-not-allowed"
                    : slot.isPast
                      ? "border-gray-200 bg-gray-100/70 text-gray-400 cursor-not-allowed"
                      : isSelected
                        ? "border-2 border-[#FACC15] bg-[#FFFBEA] text-[#B45309] font-bold shadow-sm"
                        : "border-gray-200 bg-white text-gray-700 hover:border-amber-300"
                    }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  {format(slot.start, "h a")}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-semibold text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-semibold text-emerald-700">
            ✅ Booking confirmed! Redirecting to equipment list...
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-black/5 px-6 py-4 flex items-center justify-between gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-baseline gap-1 shrink-0">
          <span className="text-xl font-extrabold text-[#B45309]">
            {costInfo.costStr}
          </span>
          <span className="text-xs font-medium text-gray-400">
            {costInfo.unitStr}
          </span>
        </div>

        <button
          type="button"
          onClick={handleBook}
          disabled={loading || selectedSlot === null || success}
          className="flex-1 rounded-full bg-[#FACC15] hover:bg-[#EAB308] text-gray-900 font-bold py-4 text-base shadow-md transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 max-w-xs"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-gray-900" />
          ) : selectedSlot !== null ? (
            selectedSlotText
          ) : (
            "Book now"
          )}
        </button>
      </div>
    </div>
  );
}