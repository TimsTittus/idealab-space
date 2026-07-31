import { SupabaseClient, User } from "@supabase/supabase-js";

/**
 * Returns the role of a user ('admin' or 'user').
 * Checks database `user_profiles` table column `role` first, with fallback to `user.app_metadata.role`.
 */
export async function getUserRole(
  supabase: SupabaseClient,
  user: User | null
): Promise<string> {
  if (!user) return "user";

  // Check user_profiles table first
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profile?.role) {
    return profile.role;
  }

  // Fallback to app_metadata if present
  if (user.app_metadata?.role) {
    return user.app_metadata.role;
  }

  return "user";
}

/**
 * Checks if a given user has admin privileges.
 */
export async function isUserAdmin(
  supabase: SupabaseClient,
  user: User | null
): Promise<boolean> {
  const role = await getUserRole(supabase, user);
  return role === "admin";
}
