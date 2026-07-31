"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Loader2, Zap } from "lucide-react";
import Link from "next/link";
import { formatAuthError } from "@/lib/formatError";

const PURPOSES = [
  "Working on a project",
  "Self Learning",
  "Visiting",
  "Attending an event",
];

const DURATIONS = [
  { label: "30 mins", value: "30 minutes" },
  { label: "1 hr", value: "1 hour" },
  { label: "2 hr", value: "2 hours" },
  { label: "3 hr", value: "3 hours" },
  { label: "4 hr", value: "4 hours" },
];

export default function CheckinPage() {
  const [selectedPurpose, setSelectedPurpose] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const handleCheckin = async () => {
    if (!selectedPurpose || !selectedDuration) {
      setError("Please select both purpose and duration.");
      return;
    }

    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to check in.");
      setLoading(false);
      return;
    }

    // Deactivate previous active check-ins for clean state
    await supabase
      .from("space_checkins")
      .update({ is_active: false })
      .eq("user_id", user.id)
      .eq("is_active", true);

    const { error: insertError } = await supabase
      .from("space_checkins")
      .insert({
        user_id: user.id,
        purpose_of_visit: selectedPurpose,
        estimated_duration: selectedDuration,
        is_active: true,
      });

    if (insertError) {
      setError(formatAuthError(insertError));
      setLoading(false);
      return;
    }

    router.push("/space");
    router.refresh();
  };

  return (
    <div className="flex min-h-dvh flex-col animate-fade-in bg-[#FCFBF4]">
      <div className="px-5 pt-6 flex items-center justify-between">
        <Link
          href="/space"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white shadow-xs text-slate-900 transition-all active:scale-95 hover:bg-stone-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
          ⚡ Space Check-in
        </span>
      </div>

      <div className="flex-1 px-5 pt-5 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">
            What brings you to IDEA Lab today?
          </h1>
          <p className="text-xs font-bold text-stone-500 mt-1">Select your primary activity purpose</p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {PURPOSES.map((purpose) => (
              <button
                key={purpose}
                onClick={() => setSelectedPurpose(purpose)}
                className={`rounded-full border-2 px-5 py-3 text-xs font-black transition-all active:scale-95 ${selectedPurpose === purpose
                  ? "border-slate-950 bg-slate-950 text-amber-400 shadow-md scale-[1.02]"
                  : "border-stone-200 bg-white text-slate-800 hover:border-amber-400"
                  }`}
              >
                {purpose}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-950 tracking-tight">
            Estimated duration of your visit
          </h2>
          <p className="text-xs font-bold text-stone-500 mt-1">How long will you be using the space?</p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {DURATIONS.map((d) => (
              <button
                key={d.value}
                onClick={() => setSelectedDuration(d.value)}
                className={`rounded-full border-2 px-5 py-3 text-xs font-black transition-all active:scale-95 ${selectedDuration === d.value
                  ? "border-slate-950 bg-slate-950 text-amber-400 shadow-md scale-[1.02]"
                  : "border-stone-200 bg-white text-slate-800 hover:border-amber-400"
                  }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs font-bold text-rose-700">
            {error}
          </div>
        )}

        <div className="pt-2 pb-10">
          <button
            onClick={handleCheckin}
            disabled={loading || !selectedPurpose || !selectedDuration}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 hover:bg-slate-900 py-4 text-sm font-black text-amber-400 shadow-xl transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
            ) : (
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                Complete Space Check-in
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}