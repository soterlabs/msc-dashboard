import { addMoney } from "./decimal.ts";
import type { Estimate, History } from "./types";
export const yesterday = (now: Date) => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - 86400000).toISOString().slice(0, 10);
export function validMonth(value: string): boolean { return /^\d{4}-(0[1-9]|1[0-2])$/.test(value) && Number(value.slice(0, 4)) >= 2000; }
export function monthWindow(month: string, now: Date): { start: string; end: string } | null {
  if (!validMonth(month)) return null;
  const start = `${month}-01`;
  const endOfMonth = new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0)).toISOString().slice(0, 10);
  const end = endOfMonth < yesterday(now) ? endOfMonth : yesterday(now);
  return start > end ? null : { start, end };
}
export function metrics(estimate: Estimate) {
  const r = estimate.result;
  const demand = addMoney([r.agent_rate, r.distribution_rewards, r.chronicle_points, r.gar]);
  return { supply: r.prime_agent_revenue, demand, prime: addMoney([r.prime_agent_revenue, demand]), sky: r.sky_revenue };
}
/** Never sum MTD observations. Fill the calendar with null gaps, not zeroes. */
export function historyDays(history: History): { cutoff: string; estimate: Estimate | null }[] {
  const records = new Map(history.results.map((r) => [r.cutoff, r]));
  const days = [];
  for (let ms = Date.parse(history.start); ms <= Date.parse(history.end); ms += 86400000) {
    const cutoff = new Date(ms).toISOString().slice(0, 10);
    days.push({ cutoff, estimate: records.get(cutoff) ?? null });
  }
  return days.reverse();
}
/** Only a returned cutoff in the selected month may populate its headline. */
export function selectedEstimate(month: string, history: History | null, latest: Estimate | null): Estimate | null {
  const candidates = history?.results.filter((r) => r.cutoff.startsWith(`${month}-`)) ?? [];
  if (latest?.cutoff.startsWith(`${month}-`)) candidates.push(latest);
  return candidates.sort((a, b) => b.cutoff.localeCompare(a.cutoff) || (b.publication_order !== undefined && a.publication_order !== undefined ? b.publication_order - a.publication_order : Date.parse(b.computed_at) - Date.parse(a.computed_at)))[0] ?? null;
}
