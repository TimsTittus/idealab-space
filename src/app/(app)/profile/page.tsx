import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Settings, Send, ExternalLink } from "lucide-react";

const proficiencyDots = (level: string) => {
  const levels: Record<string, number> = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
  };
  const n = levels[level?.toLowerCase()] || 1;
  return (
    <div className="flex gap-1">
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={`h-2.5 w-2.5 rounded-full ${i <= n ? "bg-accent-green" : "bg-border"
            }`}
        />
      ))}
    </div>
  );
};

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const languages = (profile?.languages as Array<{ name: string; level: string }>) || [];

  return (
    <div className="animate-fade-in px-5 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="rounded-full border border-border bg-surface-secondary px-4 py-1.5 text-xs font-semibold text-text-primary">
          @{user.email?.split("@")[0]}
        </div>
        <div className="flex gap-2">
          <button className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-secondary">
            <Send className="h-4 w-4" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-secondary">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Avatar */}
      <div className="mt-6">
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-accent-pink flex items-center justify-center text-2xl font-bold text-white">
          {(profile?.full_name || user.email || "U")[0].toUpperCase()}
        </div>
      </div>

      {/* Name & College */}
      <h1 className="mt-4 text-2xl font-extrabold uppercase tracking-tight text-text-primary">
        {profile?.full_name || "Unnamed Maker"}
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        {profile?.department
          ? `${profile.department}${profile.year_of_study ? ` · ${profile.year_of_study}` : ""}`
          : "St. Josephs College of Engineering and Technology, Choondacherry"}
      </p>

      {/* Bio */}
      {profile?.bio && (
        <p className="mt-4 text-sm leading-relaxed text-text-secondary">
          {profile.bio}
        </p>
      )}

      {/* Edit Profile */}
      <Link
        href="/profile/edit"
        className="mt-5 flex w-full items-center justify-center rounded-2xl border-2 border-border py-3.5 text-sm font-bold text-text-primary transition-all active:scale-[0.98]"
      >
        Edit Profile
      </Link>

      {/* Skill Tags */}
      {profile?.skill_tags && profile.skill_tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {profile.skill_tags.map((tag: string) => (
            <span
              key={tag}
              className="rounded-full border border-border bg-surface-secondary px-4 py-2 text-xs font-semibold uppercase tracking-wide text-text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* GitHub */}
      {profile?.github_url && (
        <div className="mt-5 flex gap-2">
          <a
            href={profile.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-text-secondary transition-all hover:text-text-primary"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </div>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-text-primary">
            Familiar languages
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {languages.map((lang, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-tertiary text-sm font-bold text-text-secondary">
                  {lang.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {lang.name}
                  </p>
                  {proficiencyDots(lang.level)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sign Out */}
      <form
        action={async () => {
          "use server";
          const supabase = await createClient();
          await supabase.auth.signOut();
          redirect("/login");
        }}
        className="mt-10 mb-8"
      >
        <button
          type="submit"
          className="w-full rounded-2xl border border-danger/30 py-3 text-sm font-semibold text-danger transition-all active:scale-[0.98] hover:bg-danger/5"
        >
          Sign Out
        </button>
      </form>
    </div>
  );
}