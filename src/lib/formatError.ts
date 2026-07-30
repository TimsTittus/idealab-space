/**
 * Helper to safely extract a human-readable error string.
 * Handles cases where JS Error instances or Supabase error objects are passed.
 */
export function formatAuthError(error: unknown): string {
  if (!error) return "An unexpected error occurred.";

  let rawMessage = "";

  if (typeof error === "string") {
    rawMessage = error;
  } else if (error instanceof Error) {
    rawMessage = error.message;
  } else if (typeof error === "object" && error !== null) {
    const errObj = error as Record<string, any>;
    rawMessage =
      errObj.message ||
      errObj.msg ||
      errObj.error_description ||
      errObj.details ||
      (typeof errObj.error === "string" ? errObj.error : "") ||
      "";
  }

  if (!rawMessage || rawMessage === "{}" || rawMessage.trim() === "") {
    return "Authentication failed. Please ensure your email ends with sjcetpalai.ac.in and that the admin user exists in your Supabase project.";
  }

  if (rawMessage.toLowerCase().includes("rate limit")) {
    return "Email rate limit exceeded by Supabase mailer. Go to Supabase Dashboard -> Authentication -> Providers -> Email and disable 'Confirm email', or wait a few minutes before trying again.";
  }

  return rawMessage;
}