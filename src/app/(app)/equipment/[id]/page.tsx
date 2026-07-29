"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Loader2, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { format, addHours, addDays, startOfDay } from "date-fns";

interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface Reservation {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  user_id: string;
}

const DAYS_TO_SHOW = [0, 1, 2, 3, 4];

export default function EquipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const equipmentId = params.id as string;

  const [equipmentItem, setEquipmentItem] = useState<EquipmentItem | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedDate, setSelectedDate] = useState(0); // days from today
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
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

    if (eqRes.data) setEquipmentItem(eqRes.data);
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
    if (!user) return;

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

  if (loadingData) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-text-tertiary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center gap-3 bg-surface/80 px-5 py-4 backdrop-blur-xl">
        <Link
          href="/equipment"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border transition-all active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-bold truncate">
          {equipmentItem?.name || "Equipment"}
        </h1>
      </div>

      <div className="px-5 pb-24">
        {/* Equipment info */}
        <div className="rounded-2xl border border-border bg-surface-secondary p-5">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {equipmentItem?.category}
          </span>
          <h2 className="mt-3 text-xl font-bold">{equipmentItem?.name}</h2>
          <p className="mt-2 text-sm text-text-secondary">
            {equipmentItem?.description}
          </p>
        </div>

        {/* Date selector */}
        <div className="mt-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-tertiary">
            Select Date
          </h3>
          <div className="hide-scrollbar mt-3 flex gap-2 overflow-x-auto">
            {availableDates.map(({ offset, date }) => (
              <button
                key={offset}
                onClick={() => {
                  setSelectedDate(offset);
                  setSelectedSlot(null);
                  setLoadingData(true);
                }}
                className={`flex min-w-[72px] flex-col items-center rounded-2xl border-2 px-4 py-3 transition-all active:scale-95 ${selectedDate === offset
                    ? "border-text-primary bg-text-primary text-white"
                    : "border-border text-text-primary"
                  }`}
              >
                <span className="text-xs font-medium opacity-70">
                  {offset === 0 ? "Today" : format(date, "EEE")}
                </span>
                <span className="text-lg font-bold">{format(date, "d")}</span>
                <span className="text-xs opacity-70">
                  {format(date, "MMM")}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        <div className="mt-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-tertiary">
            Available Slots
          </h3>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {slots.map((slot) => (
              <button
                key={slot.hour}
                disabled={slot.isBooked || slot.isPast}
                onClick={() => setSelectedSlot(slot.hour)}
                className={`flex items-center justify-center gap-1.5 rounded-xl border-2 px-3 py-3 text-sm font-medium transition-all active:scale-95 ${slot.isBooked
                    ? "border-danger/20 bg-danger/5 text-danger/50 cursor-not-allowed"
                    : slot.isPast
                      ? "border-border bg-surface-tertiary text-text-tertiary cursor-not-allowed"
                      : selectedSlot === slot.hour
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-text-primary hover:border-primary/50"
                  }`}
              >
                <Clock className="h-3.5 w-3.5" />
                {format(slot.start, "h a")}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-lg bg-accent-green/10 px-4 py-3 text-sm text-accent-green font-medium">
            ✅ Booking confirmed! Redirecting...
          </div>
        )}
      </div>

      {/* Book Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface/80 px-5 pb-8 pt-4 backdrop-blur-xl">
        <button
          onClick={handleBook}
          disabled={loading || selectedSlot === null || success}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-text-primary py-4 text-base font-bold text-white transition-all active:scale-[0.98] disabled:opacity-40"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : selectedSlot !== null ? (
            selectedSlotText
          ) : (
            "Select a time slot"
          )}
        </button>
      </div>
    </div>
  );
}