import BottomNav from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/server";

async function syncProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const fullName =
    user.user_metadata?.full_name || user.user_metadata?.name || "";
  const avatarUrl = user.user_metadata?.avatar_url || "";
  const email = user.email || "";

  const { data: existing } = await supabase
    .from("user_profiles")
    .select("id, full_name, avatar_url, email")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) {
    await supabase.from("user_profiles").insert({
      user_id: user.id,
      email,
      full_name: fullName,
      avatar_url: avatarUrl,
    });
  } else if (!existing.full_name && fullName) {
    await supabase
      .from("user_profiles")
      .update({
        full_name: fullName,
        avatar_url: avatarUrl || existing.avatar_url,
        email: email || existing.email,
      })
      .eq("user_id", user.id);
  }
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await syncProfile();

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex-1 pb-28">{children}</main>
      <BottomNav />
    </div>
  );
}
