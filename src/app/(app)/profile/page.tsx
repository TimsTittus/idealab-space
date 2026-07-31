import { createClient } from "@/lib/supabase/server";
import { isUserAdmin } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ShieldCheck,
  ChevronRight,
  GraduationCap,
  Building2,
  Calendar,
  Wrench,
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Code2,
  Award,
  LogOut,
  User,
  MapPin,
  Cpu,
  Layers,
} from "lucide-react";
import ProfileHeaderActions from "./ProfileHeaderActions";

const SKILL_ICONS: Record<string, string> = {
  Robotics: "🤖",
  IoT: "📡",
  "Web Development": "🌐",
  "AI / ML": "🧠",
  "3D Printing": "🖨️",
  Electronics: "⚡",
  "Embedded Systems": "🔌",
  "CNC Routing": "⚙️",
  "Laser Cutting": "✂️",
  "PCB Design": "💾",
  "Mobile Development": "📱",
  "Cloud Computing": "☁️",
  "UI/UX Design": "🎨",
  Cybersecurity: "🛡️",
  "Game Development": "🎮",
  "Data Science": "📊",
  Blockchain: "⛓️",
  "AR/VR": "🥽",
};

const proficiencyConfig = (level: string) => {
  const normalized = level?.toLowerCase() || "beginner";
  switch (normalized) {
    case "advanced":
      return {
        dots: 3,
        percentage: "100%",
        label: "Advanced",
        colorClass: "bg-amber-500",
        textClass: "text-amber-700",
        badgeBg: "bg-amber-100 text-slate-950 border-amber-300",
      };
    case "intermediate":
      return {
        dots: 2,
        percentage: "66%",
        label: "Intermediate",
        colorClass: "bg-amber-400",
        textClass: "text-amber-600",
        badgeBg: "bg-amber-50 text-slate-900 border-amber-200",
      };
    default:
      return {
        dots: 1,
        percentage: "33%",
        label: "Beginner",
        colorClass: "bg-purple-400",
        textClass: "text-purple-600",
        badgeBg: "bg-purple-100 text-purple-900 border-purple-200",
      };
  }
};

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [
    { data: profile },
    { data: activeCheckin },
    { count: totalCheckinsCount },
    { data: reservations },
    isAdmin,
  ] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single(),

    supabase
      .from("space_checkins")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("checkin_timestamp", { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabase
      .from("space_checkins")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),

    supabase
      .from("equipment_reservations")
      .select("*, equipment(name, category, image_url)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(4),

    isUserAdmin(supabase, user),
  ]);

  const languages = (profile?.languages as Array<{ name: string; level: string }>) || [];
  const skillTags = (profile?.skill_tags as string[]) || [];
  const userHandle = user.email?.split("@")[0] || "maker";
  const userInitials = (profile?.full_name || user.email || "U")[0].toUpperCase();

  const checkinCount = totalCheckinsCount || 0;
  let makerTitle = "Novice Maker";
  if (checkinCount >= 20) makerTitle = "Master Innovator";
  else if (checkinCount >= 10) makerTitle = "Senior Builder";
  else if (checkinCount >= 3) makerTitle = "Active Lab Member";

  return (
    <div className="animate-fade-in pb-20">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#FFE033] via-[#FFB703] to-[#FB8500] px-5 pt-8 pb-14 text-slate-950 shadow-lg">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/25 blur-2xl pointer-events-none" />
        <div className="absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-orange-600/20 blur-xl pointer-events-none" />
        <div className="absolute right-10 top-12 h-6 w-6 rounded-full bg-purple-500/80 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-950/10 bg-slate-950/10 px-3.5 py-1.5 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-slate-950" />
              <span className="text-xs font-black tracking-wide uppercase text-slate-950">
                SJCET IDEA LAB MAKER
              </span>
            </div>

            <ProfileHeaderActions userHandle={userHandle} />
          </div>

          <div className="mt-8 flex flex-col items-center sm:flex-row sm:items-end sm:gap-6">
            <div className="relative group">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-950 p-1 shadow-xl transition-transform duration-300 group-hover:scale-105">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[22px] bg-slate-900 font-black text-amber-400 text-3xl shadow-inner border border-slate-800">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || "Profile Avatar"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{userInitials}</span>
                  )}
                </div>
              </div>

              {activeCheckin ? (
                <div
                  title="Currently Checked-in at Space"
                  className="absolute -bottom-1 -right-1 flex items-center gap-1 rounded-full bg-slate-950 border-2 border-amber-400 px-2 py-0.5 text-[10px] font-black text-emerald-400 shadow-md"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>IN LAB</span>
                </div>
              ) : (
                <div
                  title="Verified Maker"
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 border-2 border-yellow-300 text-amber-400 shadow-md"
                >
                  <ShieldCheck className="h-4 w-4" />
                </div>
              )}
            </div>

            <div className="mt-4 text-center sm:mt-0 sm:text-left">
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  {profile?.full_name || "Unnamed Maker"}
                </h1>
              </div>
              <p className="text-xs font-black text-slate-950/80 mt-0.5">
                @{userHandle} · <span className="bg-slate-950 text-amber-400 px-2 py-0.5 rounded-full text-[11px] font-black inline-block mt-0.5">{makerTitle}</span>
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-950 font-bold sm:justify-start">
                {profile?.department && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950/10 px-3 py-1 border border-slate-950/10">
                    <Building2 className="h-3.5 w-3.5 text-slate-950" />
                    {profile.department}
                  </span>
                )}
                {profile?.year_of_study && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950/10 px-3 py-1 border border-slate-950/10">
                    <GraduationCap className="h-3.5 w-3.5 text-slate-950" />
                    {profile.year_of_study}
                  </span>
                )}
                {!profile?.department && !profile?.year_of_study && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950/10 px-3 py-1 border border-slate-950/10">
                    <MapPin className="h-3.5 w-3.5 text-slate-950" />
                    St. Joseph&apos;s College of Engineering and Technology
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-20 space-y-6">
        {profile?.bio ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wider text-stone-500 mb-1">
              About Maker
            </p>
            <p className="text-sm leading-relaxed text-slate-900 font-semibold">
              &ldquo;{profile.bio}&rdquo;
            </p>
          </div>
        ) : null}

        {isAdmin && (
          <Link
            href="/admin"
            className="group flex w-full items-center justify-between rounded-2xl bg-slate-950 p-4.5 text-white shadow-xl border border-slate-800 transition-all hover:bg-slate-900 active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-black shadow-md">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-black leading-snug text-white">Admin Management Portal</p>
                <p className="text-xs font-bold text-slate-400">
                  Manage lab reservations, space activity & machinery
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-amber-400 transition-transform group-hover:translate-x-1" />
          </Link>
        )}

        <div className="flex items-center gap-3">
          <Link
            href="/profile/edit"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-xs font-black text-white shadow-md transition-all hover:bg-slate-900 active:scale-[0.98]"
          >
            <User className="h-4 w-4 text-amber-400" />
            Edit Profile
          </Link>

          {profile?.github_url && (
            <a
              href={profile.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-xs font-bold text-slate-900 shadow-sm transition-all hover:bg-stone-50 active:scale-[0.98]"
            >
              <Code2 className="h-4 w-4 text-amber-600" />
              <span>GitHub</span>
              <ExternalLink className="h-3.5 w-3.5 text-stone-400" />
            </a>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-stone-200 bg-white p-3.5 text-center shadow-sm">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-slate-950 font-black">
              <Zap className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mt-2 text-xl font-black text-slate-900">
              {checkinCount}
            </p>
            <p className="text-[11px] font-bold text-stone-500">
              Space Check-ins
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-3.5 text-center shadow-sm">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-slate-950 font-black">
              <Wrench className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mt-2 text-xl font-black text-slate-900">
              {reservations?.length || 0}
            </p>
            <p className="text-[11px] font-bold text-stone-500">
              Equipment Booked
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-3.5 text-center shadow-sm">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700 font-black">
              <Award className="h-4 w-4" />
            </div>
            <p className="mt-2 text-xl font-black text-slate-900">
              {skillTags.length + languages.length}
            </p>
            <p className="text-[11px] font-bold text-stone-500">
              Skills & Stack
            </p>
          </div>
        </div>

        {skillTags.length > 0 && (
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-amber-600" />
                Skills & Expertise
              </h2>
              <span className="text-xs font-bold text-stone-500">
                {skillTags.length} tags
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {skillTags.map((tag) => {
                const icon = SKILL_ICONS[tag] || "✨";
                return (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-100 px-3.5 py-1.5 text-xs font-black text-slate-950 shadow-xs"
                  >
                    <span>{icon}</span>
                    <span>{tag}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {languages.length > 0 && (
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Layers className="h-4 w-4 text-amber-600" />
                Programming & Tech
              </h2>
              <span className="text-xs font-bold text-stone-500">
                {languages.length} listed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {languages.map((lang, i) => {
                const config = proficiencyConfig(lang.level);
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 font-black text-xs text-amber-400 shadow-inner">
                        {lang.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">
                          {lang.name}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-stone-200">
                            <div
                              className={`h-full ${config.colorClass} transition-all duration-500`}
                              style={{ width: config.percentage }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`rounded-lg border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${config.badgeBg}`}
                    >
                      {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-600" />
              Recent Lab Bookings
            </h2>
            <Link
              href="/equipment"
              className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-0.5"
            >
              Browse Equipment
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {reservations && reservations.length > 0 ? (
            <div className="space-y-3">
              {reservations.map((res) => {
                const eq = res.equipment as { name?: string; category?: string; image_url?: string } | null;
                const isConfirmed = res.status === "confirmed";
                return (
                  <div
                    key={res.id}
                    className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-slate-950 font-bold">
                        <Wrench className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">
                          {eq?.name || "Equipment Reservation"}
                        </p>
                        <p className="text-stone-500 text-[11px] font-medium flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {new Date(res.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black capitalize ${isConfirmed
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-stone-200 text-stone-700"
                        }`}
                    >
                      {isConfirmed && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
                      {res.status}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-stone-200 p-6 text-center">
              <Wrench className="mx-auto h-7 w-7 text-amber-500" />
              <p className="mt-2 text-xs font-bold text-slate-700">
                No equipment reserved yet
              </p>
              <Link
                href="/equipment"
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-4 py-1.5 text-xs font-black text-amber-400 transition-all hover:bg-slate-900"
              >
                Reserve Equipment Now →
              </Link>
            </div>
          )}
        </div>

        <form
          action={async () => {
            "use server";
            const supabase = await createClient();
            await supabase.auth.signOut();
            redirect("/login");
          }}
          className="pt-2"
        >
          <button
            type="submit"
            className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 py-3.5 text-xs font-black text-rose-700 transition-all hover:bg-rose-100 active:scale-[0.98]"
          >
            <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Sign Out from Account
          </button>
        </form>
      </div>
    </div>
  );
}