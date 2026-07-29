/**
 * Helper to safely extract a human-readable error string.
 * Handles cases where Supabase returns "{}" or rate limit errors.
 */
export function formatAuthError(error: unknown): string {
  if (!error) return "An unexpected error occurred.";

  let rawMessage = "";

  if (typeof error === "string") {
    rawMessage = error;
  } else if (typeof error === "object" && error !== null) {
    const errObj = error as { message?: string; msg?: string; error_description?: string };
    rawMessage = errObj.message || errObj.msg || errObj.error_description || "";
  }

  if (rawMessage === "{}" || rawMessage.trim() === "") {
    return "Registration or login failed. Please ensure your email ends with sjcetpalai.ac.in and that the updated database trigger is applied in Supabase.";
  }

  if (rawMessage.toLowerCase().includes("rate limit")) {
    return "Email rate limit exceeded by Supabase default mailer. To fix this during dev: Go to Supabase Dashboard -> Authentication -> Providers -> Email and disable 'Confirm email', or wait a few minutes before trying again.";
  }

  return rawMessage || "An unexpected error occurred. Please check your credentials and database setup.";
}