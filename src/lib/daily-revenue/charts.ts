import { addDays, type DayRange } from "./calendar.ts";
import { addMoney, subtractMoney } from "./decimal.ts";
import { historyDays } from "./domain.ts";
import { metrics } from "./domain.ts";
import type { DailyRow, History } from "./types";

/** Convert only at the plotting boundary; labels retain the API's decimal precision. */
export function trendRows(history: History) {
  return historyDays(history).reverse().map(({ cutoff, estimate }) => {
    const exact = estimate ? metrics(estimate).prime : null;
    return { cutoff, prime: exact === null ? null : Number(exact), exact };
  });
}

export type Granularity = "day" | "week" | "month";
export interface Bucket { start: string; end: string; days: number; full: number }
const bucketKey = (day: string, granularity: Granularity) =>
  granularity === "day" ? day : granularity === "month" ? `${day.slice(0, 8)}01` : addDays(day, -((new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7));
const fullLength = (key: string, granularity: Granularity) =>
  granularity === "day" ? 1 : granularity === "week" ? 7 : new Date(Date.UTC(Number(key.slice(0, 4)), Number(key.slice(5, 7)), 0)).getUTCDate();

export function buckets(range: DayRange, granularity: Granularity): Bucket[] {
  const out: Bucket[] = [];
  let key = "";
  for (let day = range.from; day <= range.to; day = addDays(day, 1)) {
    const next = bucketKey(day, granularity), last = out.at(-1);
    if (last && next === key) { last.end = day; last.days++; }
    else out.push({ start: day, end: day, days: 1, full: fullLength(next, granularity) });
    key = next;
  }
  return out;
}

export function chargeRows<K extends string>(series: { key: K; days: DailyRow[] }[], range: DayRange, granularity: Granularity) {
  return buckets(range, granularity).map((bucket) => {
    const exact = {} as Record<K, string | null>, published = {} as Record<K, number>, plotted = {} as Record<K, number | null>;
    for (const { key, days } of series) {
      const inside = days.filter((d) => d.date >= bucket.start && d.date <= bucket.end);
      published[key] = inside.length;
      exact[key] = inside.length ? addMoney(inside.map((d) => d.charge)) : null;
      plotted[key] = exact[key] === null ? null : Number(exact[key]);
    }
    const present = Object.values<string | null>(exact).filter((v): v is string => v !== null);
    return { ...bucket, ...plotted, exact, published, total: present.length ? addMoney(present) : null };
  });
}

export function publicationChanges(history: History) {
  const records = new Map(history.results.map((e) => [e.cutoff, e]));
  return historyDays(history).reverse().map(({ cutoff, estimate }) => {
    const previous = records.get(addDays(cutoff, -1));
    const comparable = estimate && previous && previous.cutoff.slice(0, 7) === cutoff.slice(0, 7);
    const current = estimate ? metrics(estimate) : null;
    const before = comparable ? metrics(previous) : null;
    const exact = current && before ? {
      prime: subtractMoney(current.prime, before.prime),
      supply: subtractMoney(current.supply, before.supply),
      demand: subtractMoney(current.demand, before.demand),
      sky: subtractMoney(current.sky, before.sky),
    } : null;
    return { cutoff, prime: exact ? Number(exact.prime) : null, exact };
  });
}
