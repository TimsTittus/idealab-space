"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatAuthError } from "@/lib/formatError";

const PURPOSES = [
  "Working on a project",
  "Self Learning",
  "Visiting",
  "Attending an event",
];

const DURATIONS = [
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
    <div className="flex min-h-dvh flex-col animate-fade-in">
      <div className="px-5 pt-6">
        <Link
          href="/space"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface transition-all active:scale-95"
        >
          <ArrowLeft className="h-5 w-5 text-text-primary" />
        </Link>
      </div>

      <div className="flex-1 px-5 pt-8">
        <h1 className="text-2xl font-bold text-text-primary">
          What brings you to Space today?
        </h1>
        <div className="mt-6 flex flex-wrap gap-3">
          {PURPOSES.map((purpose) => (
            <button
              key={purpose}
              onClick={() => setSelectedPurpose(purpose)}
              className={`rounded-full border-2 px-5 py-3 text-sm font-medium transition-all active:scale-95 ${selectedPurpose === purpose
                ? "border-text-primary bg-text-primary text-white"
                : "border-border bg-surface text-text-primary hover:border-text-tertiary"
                }`}
            >
              {purpose}
            </button>
          ))}
        </div>

        <h2 className="mt-10 text-2xl font-bold text-text-primary">
          Estimated duration of your visit
        </h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {DURATIONS.map((d) => (
            <button
              key={d.value}
              onClick={() => setSelectedDuration(d.value)}
              className={`rounded-full border-2 px-5 py-3 text-sm font-medium transition-all active:scale-95 ${selectedDuration === d.value
                ? "border-text-primary bg-text-primary text-white"
                : "border-border bg-surface text-text-primary hover:border-text-tertiary"
                }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-6 rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}
      </div>

      <div className="px-5 pb-8 pt-4">
        <button
          onClick={handleCheckin}
          disabled={loading || !selectedPurpose || !selectedDuration}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-text-primary py-4 text-base font-bold text-white transition-all active:scale-[0.98] disabled:opacity-40"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Check-in"
          )}
        </button>
      </div>
    </div>
  );
}