"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Loader2, X, Plus } from "lucide-react";
import Link from "next/link";
import { formatAuthError } from "@/lib/formatError";

const AVAILABLE_SKILLS = [
  "Robotics",
  "IoT",
  "Web Development",
  "AI / ML",
  "3D Printing",
  "Electronics",
  "Embedded Systems",
  "CNC Routing",
  "Laser Cutting",
  "PCB Design",
  "Mobile Development",
  "Cloud Computing",
  "UI/UX Design",
  "Cybersecurity",
  "Game Development",
  "Data Science",
  "Blockchain",
  "AR/VR",
];

const PROFICIENCY_LEVELS = ["Beginner", "Intermediate", "Advanced"];

export default function EditProfilePage() {
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [bio, setBio] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [skillTags, setSkillTags] = useState<string[]>([]);
  const [languages, setLanguages] = useState<
    Array<{ name: string; level: string }>
  >([]);
  const [newLangName, setNewLangName] = useState("");
  const [newLangLevel, setNewLangLevel] = useState("Intermediate");
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState("");

  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoadingProfile(false);
        return;
      }

      const { data } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setFullName(data.full_name || "");
        setDepartment(data.department || "");
        setYearOfStudy(data.year_of_study || "");
        setBio(data.bio || "");
        setGithubUrl(data.github_url || "");
        setSkillTags(data.skill_tags || []);
        setLanguages(
          (data.languages as Array<{ name: string; level: string }>) || []
        );
      }
      setLoadingProfile(false);
    };
    loadProfile();
  }, [supabase]);

  const toggleSkill = (skill: string) => {
    setSkillTags((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addLanguage = () => {
    if (!newLangName.trim()) return;
    if (languages.some((l) => l.name.toLowerCase() === newLangName.trim().toLowerCase()))
      return;
    setLanguages([...languages, { name: newLangName.trim(), level: newLangLevel }]);
    setNewLangName("");
  };

  const removeLanguage = (name: string) => {
    setLanguages((prev) => prev.filter((l) => l.name !== name));
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in to edit your profile.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({
        full_name: fullName,
        department,
        year_of_study: yearOfStudy,
        bio,
        github_url: githubUrl,
        skill_tags: skillTags,
        languages,
      })
      .eq("user_id", user.id);

    if (updateError) {
      setError(formatAuthError(updateError));
      setLoading(false);
      return;
    }

    router.push("/profile");
    router.refresh();
  };

  if (loadingProfile) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-text-tertiary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between bg-surface/80 px-5 py-4 backdrop-blur-xl">
        <Link
          href="/profile"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border transition-all active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-bold">Edit Profile</h1>
        <button
          onClick={handleSave}
          disabled={loading}
          className="rounded-full bg-text-primary px-5 py-2 text-sm font-semibold text-white transition-all active:scale-95 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
        </button>
      </div>

      <div className="space-y-6 px-5 pb-24 pt-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Full Name
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Department
            </label>
            <input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. CSE"
              className="w-full rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Year
            </label>
            <input
              value={yearOfStudy}
              onChange={(e) => setYearOfStudy(e.target.value)}
              placeholder="e.g. 3rd Year"
              className="w-full rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Tell us about yourself..."
            className="w-full rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm outline-none resize-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            GitHub URL
          </label>
          <input
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/username"
            className="w-full rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Skill Tags */}
        <div>
          <label className="mb-3 block text-sm font-medium text-text-secondary">
            Skills & Interests
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_SKILLS.map((skill) => (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`rounded-full border-2 px-4 py-2 text-xs font-semibold transition-all active:scale-95 ${skillTags.includes(skill)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-text-secondary hover:border-text-tertiary"
                  }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div>
          <label className="mb-3 block text-sm font-medium text-text-secondary">
            Programming Languages
          </label>

          <div className="space-y-2">
            {languages.map((lang) => (
              <div
                key={lang.name}
                className="flex items-center justify-between rounded-xl border border-border bg-surface-secondary px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-tertiary text-xs font-bold">
                    {lang.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{lang.name}</span>
                  <span className="rounded-full bg-surface-tertiary px-2 py-0.5 text-xs text-text-secondary">
                    {lang.level}
                  </span>
                </div>
                <button
                  onClick={() => removeLanguage(lang.name)}
                  className="text-text-tertiary hover:text-danger"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={newLangName}
              onChange={(e) => setNewLangName(e.target.value)}
              placeholder="e.g. Python"
              className="flex-1 rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm outline-none focus:border-primary"
              onKeyDown={(e) => e.key === "Enter" && addLanguage()}
            />
            <select
              value={newLangLevel}
              onChange={(e) => setNewLangLevel(e.target.value)}
              className="rounded-xl border border-border bg-surface-secondary px-3 py-3 text-sm outline-none"
            >
              {PROFICIENCY_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <button
              onClick={addLanguage}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white transition-all active:scale-95"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}