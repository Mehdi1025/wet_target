/** Billable day = 8 hours of tracked work. */
export const WORK_DAY_SECONDS = 8 * 60 * 60;

export function formatElapsed(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export function secondsToSpentDays(totalSeconds: number): number {
  if (totalSeconds <= 0) return 0;
  return Math.ceil(totalSeconds / WORK_DAY_SECONDS);
}

export function formatTrackedSummary(totalSeconds: number): string {
  const days = Math.floor(totalSeconds / WORK_DAY_SECONDS);
  const remainder = totalSeconds % WORK_DAY_SECONDS;
  const hours = Math.floor(remainder / 3600);
  const minutes = Math.floor((remainder % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} j`);
  if (hours > 0) parts.push(`${hours} h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes} min`);

  return parts.join(" ");
}
