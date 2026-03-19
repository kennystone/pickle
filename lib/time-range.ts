/**
 * Format a time range string like "2:00-4:00pm"
 * Drops am/pm from start time if both times share the same period.
 */
export function formatTimeRange(time: string, durationMinutes: number): string {
  const [hour, minute] = time.split(":").map(Number);
  const startObj = new Date();
  startObj.setHours(hour!, minute!, 0, 0);
  const endObj = new Date(startObj.getTime() + durationMinutes * 60000);

  const fmt = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      .replace(" ", "")
      .toLowerCase();

  const startFmt = fmt(startObj);
  const endFmt = fmt(endObj);
  const samePeriod = startFmt.slice(-2) === endFmt.slice(-2);

  return samePeriod
    ? startFmt.slice(0, -2) + "-" + endFmt
    : startFmt + "-" + endFmt;
}
