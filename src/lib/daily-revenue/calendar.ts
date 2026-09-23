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
/** An API instant as "2026-09-15 20:22:05 UTC". Never the reader's local zone:
 * these are pipeline times, read against a cutoff that is itself UTC. */
export const utcStamp = (value: string) => `${new Date(value).toISOString().slice(0, 19).replace("T", " ")} UTC`;
