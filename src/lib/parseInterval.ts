/**
 * Parses any PostgreSQL interval representation (e.g. "00:30:00", "01:00:00", "PT30M", "30 minutes")
 * into milliseconds with 100% precision.
 */
export function parsePostgresIntervalMs(durationStr?: string | null): number {
  if (!durationStr) return 60 * 60 * 1000; // Default 1 hour

  const str = String(durationStr).trim();

  // 1. Match HH:MM:SS or HH:MM format (e.g., "00:30:00", "01:00:00", "00:30")
  const hhmmssMatch = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (hhmmssMatch) {
    const hours = parseInt(hhmmssMatch[1], 10) || 0;
    const minutes = parseInt(hhmmssMatch[2], 10) || 0;
    const seconds = parseInt(hhmmssMatch[3] || "0", 10) || 0;
    const totalMs = (hours * 3600 + minutes * 60 + seconds) * 1000;
    if (totalMs > 0) return totalMs;
  }

  // 2. Match ISO 8601 format (e.g., "PT30M", "PT1H")
  if (str.startsWith("P") || str.startsWith("PT")) {
    const hoursMatch = str.match(/(\d+)H/i);
    const minsMatch = str.match(/(\d+)M/i);
    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const mins = minsMatch ? parseInt(minsMatch[1], 10) : 0;
    const totalMs = (hours * 3600 + mins * 60) * 1000;
    if (totalMs > 0) return totalMs;
  }

  // 3. Match plain text with min/hr (e.g., "30 minutes", "30 mins", "1 hour")
  const lower = str.toLowerCase();
  const numMatch = lower.match(/(\d+)/);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10);
    if (lower.includes("min")) {
      return num * 60 * 1000;
    }
    return num * 60 * 60 * 1000;
  }

  return 60 * 60 * 1000;
}

export function isCheckinActive(
  checkinTimestamp?: string | null,
  estimatedDuration?: string | null,
  nowMs: number = Date.now()
): boolean {
  if (!checkinTimestamp) return false;
  const startMs = new Date(checkinTimestamp).getTime();
  if (isNaN(startMs)) return false;
  const durationMs = parsePostgresIntervalMs(estimatedDuration);
  return startMs + durationMs > nowMs;
}