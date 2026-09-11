/**
 * Derived series for the Buybacks & Burn tab.
 *
 * Two jobs, both pure, both here rather than in the view so they can be tested
 * without rendering: turning per-kick rows into daily aggregates, and putting
 * back the periods the published document leaves out.
 */
import type { TmfGranularity, TmfKick, TmfPeriod } from "./types";

const round2 = (n: number) => Math.round(n * 100) / 100;

/** An empty period — the shape a gap takes. */
function zeroPeriod(period: string): TmfPeriod {
  return {
    period,
    kicks: 0,
    usds_buyback: 0,
    usds_to_stakers: 0,
    usds_total: 0,
    sky_bought: 0,
    // No trade to price and no kick to timestamp. Zero would be a figure.
    sky_avg_price: null,
    sky_burn_protocol: 0,
    sky_burn_other: 0,
    burn_events: 0,
    first_ts: null,
    last_ts: null,
  };
}

/** Sums a set of kicks into one period row, priced the way the document does. */
export function aggregateKicks(kicks: TmfKick[], period: string): TmfPeriod {
  const row = zeroPeriod(period);
  if (!kicks.length) return row;

  const ordered = [...kicks].sort((a, b) => (a.ts < b.ts ? -1 : 1));
  row.kicks = ordered.length;
  for (const k of ordered) {
    row.usds_buyback += k.usds_buyback;
    row.usds_to_stakers += k.usds_to_stakers;
    row.usds_total += k.usds_total;
    row.sky_bought += k.sky_bought;
  }
  row.usds_buyback = round2(row.usds_buyback);
  row.usds_to_stakers = round2(row.usds_to_stakers);
  row.usds_total = round2(row.usds_total);
  row.sky_bought = round2(row.sky_bought);
  // Volume-weighted, as the document computes it: total spent over total bought
  // rather than a mean of per-kick prices, which would weight a $600 kick like
  // a $600,000 one.
  row.sky_avg_price =
    row.sky_bought > 0 ? Math.round((row.usds_buyback / row.sky_bought) * 1e6) / 1e6 : null;
  row.first_ts = ordered[0].ts;
  row.last_ts = ordered[ordered.length - 1].ts;
  return row;
}

/** Kicks → one row per UTC day, oldest first. Days with no kicks are absent. */
export function dailyPeriods(kicks: TmfKick[]): TmfPeriod[] {
  const byDay = new Map<string, TmfKick[]>();
  for (const k of kicks) {
    const day = k.ts.slice(0, 10);
    const bucket = byDay.get(day);
    if (bucket) bucket.push(k);
    else byDay.set(day, [k]);
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([day, rows]) => aggregateKicks(rows, day));
}

/* ------------------------------------------------------------------- gaps */

const MONTHS_PER = { monthly: 1, quarterly: 3, annual: 12 } as const;

/** "2026-03" → 2026*12+2; the inverse of `fromIndex`. */
function toIndex(period: string, granularity: TmfGranularity): number {
  const year = Number(period.slice(0, 4));
  if (granularity === "annual") return year;
  if (granularity === "quarterly") return year * 4 + (Number(period.slice(6)) - 1);
  return year * 12 + (Number(period.slice(5, 7)) - 1);
}

function fromIndex(index: number, granularity: TmfGranularity): string {
  if (granularity === "annual") return String(index);
  if (granularity === "quarterly") {
    return `${Math.floor(index / 4)}-Q${(index % 4) + 1}`;
  }
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`;
}

/**
 * Puts back the periods the document omits.
 *
 * Upstream publishes a period only when it holds a kick or a burn, so the
 * series jumps — from November 2024 straight to February 2025 — and a bar
 * chart drawn from it spaces those two a bar apart, which reads as "these
 * months are adjacent" rather than "nothing happened in between". The gaps are
 * real data: the engine was idle.
 *
 * Daily rows are filled by calendar date; the rest by their own period index.
 */
export function fillGaps(rows: TmfPeriod[], granularity: TmfGranularity): TmfPeriod[] {
  if (rows.length < 2) return rows;
  const ordered = [...rows].sort((a, b) => (a.period < b.period ? -1 : 1));

  if (granularity === "daily") {
    const out: TmfPeriod[] = [];
    const day = (s: string) => Date.parse(`${s}T00:00:00Z`);
    const last = day(ordered[ordered.length - 1].period);
    const byDay = new Map(ordered.map((r) => [r.period, r]));
    for (let t = day(ordered[0].period); t <= last; t += 86_400_000) {
      const key = new Date(t).toISOString().slice(0, 10);
      out.push(byDay.get(key) ?? zeroPeriod(key));
    }
    return out;
  }

  const step = MONTHS_PER[granularity as keyof typeof MONTHS_PER] ? 1 : 1;
  const out: TmfPeriod[] = [];
  const byIndex = new Map(ordered.map((r) => [toIndex(r.period, granularity), r]));
  const first = toIndex(ordered[0].period, granularity);
  const final = toIndex(ordered[ordered.length - 1].period, granularity);
  for (let i = first; i <= final; i += step) {
    out.push(byIndex.get(i) ?? zeroPeriod(fromIndex(i, granularity)));
  }
  return out;
}
