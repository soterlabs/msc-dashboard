/**
 * UTC dates and labels for the daily cadence.
 *
 * Separate from domain.ts because the month picker is a client component: this
 * module deliberately imports nothing, so selecting a month does not ship
 * decimal.js to the browser.
 */
export const yesterday = (now: Date) => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - 86400000).toISOString().slice(0, 10);
export function validMonth(value: string): boolean { return /^\d{4}-(0[1-9]|1[0-2])$/.test(value) && Number(value.slice(0, 4)) >= 2000; }
export function monthWindow(month: string, now: Date): { start: string; end: string } | null {
  if (!validMonth(month)) return null;
  const start = `${month}-01`;
  const endOfMonth = new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0)).toISOString().slice(0, 10);
  const end = endOfMonth < yesterday(now) ? endOfMonth : yesterday(now);
  return start > end ? null : { start, end };
}
const DAY_MS = 86400000;
export interface DayRange { from: string; to: string }
export const MAX_RANGE_DAYS = 90;
export const addDays = (day: string, days: number) => new Date(Date.parse(day) + days * DAY_MS).toISOString().slice(0, 10);
export const rangeLength = ({ from, to }: DayRange) => Math.round((Date.parse(to) - Date.parse(from)) / DAY_MS) + 1;
export const validDay = (value: unknown): value is string =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
export const monthToDate = (last: string): DayRange => ({ from: `${last.slice(0, 8)}01`, to: last });
export const monthEnd = (day: string) => new Date(Date.UTC(Number(day.slice(0, 4)), Number(day.slice(5, 7)), 0)).toISOString().slice(0, 10);

export function resolveRange(from: unknown, to: unknown, max: string, last: string): DayRange {
  if (!validDay(from) || !validDay(to) || from > to || to > max || rangeLength({ from, to }) > MAX_RANGE_DAYS) return monthToDate(last);
  return { from, to };
}
export const rangePresets = (last: string): { label: string; range: DayRange }[] => [
  { label: "Month to date", range: monthToDate(last) },
  { label: "Last 7 days", range: { from: addDays(last, -6), to: last } },
  { label: "Last 30 days", range: { from: addDays(last, -29), to: last } },
  { label: "Last 90 days", range: { from: addDays(last, -(MAX_RANGE_DAYS - 1)), to: last } },
];
const dayMonth = (day: string, year = false) => new Date(`${day}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", ...(year ? { year: "numeric" } : {}), timeZone: "UTC" });
export function rangeLabel({ from, to }: DayRange): string {
  if (from === to) return dayMonth(to, true);
  if (from.slice(0, 7) === to.slice(0, 7)) return `${Number(from.slice(8))}–${dayMonth(to, true)}`;
  return `${dayMonth(from, from.slice(0, 4) !== to.slice(0, 4))} – ${dayMonth(to, true)}`;
}

/** An API instant as "2026-09-15 20:22:05 UTC". Never the reader's local zone:
 * these are pipeline times, read against a cutoff that is itself UTC. */
export const utcStamp = (value: string) => `${new Date(value).toISOString().slice(0, 19).replace("T", " ")} UTC`;
