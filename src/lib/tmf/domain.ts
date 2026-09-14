/**
 * Derived series for the Buybacks & Burn tab.
 *
 * Two jobs, both pure, both here rather than in the view so they can be tested
 * without rendering: turning per-kick rows into daily aggregates, and putting
 * back the periods the published document leaves out.
 */
import type { TmfGranularity, TmfKick, TmfPeriod } from "./types";

/**
 * The month the Smart Burn Engine's own burns begin, `YYYY-MM`.
 *
 * Everything before it is a different kind of event. The 2025-06-30 executive
 * burned 426,292,860.23 SKY to correct supply created in the MKR→SKY
 * conversion: at 1 MKR : 24,000 SKY a full 1M MKR implies 24B SKY, but MKR had
 * been burned before the conversion, so that much SKY existed that should not
 * have. Exactly 17,762.2 MKR-equivalent, which is what a correction looks like
 * and what a buyback burn does not.
 *
 * Charted beside engine burns it says the engine did it, and at 426M against
 * the first real burn's 2.86M it would be the only thing on the axis.
 *
 * The first engine burn — 10/55 of the SKY bought under the 55% regime — cast
 * on 2026-09-13. Nothing in the data separates the two: both are `protocol`
 * burns from the Pause Proxy to the zero address, so the split is a judgement,
 * and it lives here only until the API carries it. When a burn row gains a kind
 * (or the document a "burns from" date), this constant and the helpers below
 * should read that instead.
 */
export const TMF_BURNS_FROM = "2026-09";

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

/* ------------------------------------------------------------------ burns */

/** The last calendar month a period covers, `YYYY-MM`. */
function periodEndsIn(period: string): string {
  if (/^\d{4}$/.test(period)) return `${period}-12`;
  const quarter = period.match(/^(\d{4})-Q([1-4])$/);
  if (quarter) return `${quarter[1]}-${String(Number(quarter[2]) * 3).padStart(2, "0")}`;
  // Monthly already, or daily — a day ends in its own month.
  return period.slice(0, 7);
}

/**
 * Whether a period can hold an engine burn.
 *
 * Keyed on where the period ENDS, so a quarter or a year containing the cutoff
 * is kept rather than dropped for having started before it.
 */
export function holdsTmfBurns(period: string): boolean {
  return periodEndsIn(period) >= TMF_BURNS_FROM;
}

/**
 * The same rows with pre-engine burns zeroed out.
 *
 * Zeroed, not filtered: these rows carry the buyback and dividend figures too,
 * and June 2025 was a real month of buying. Only the burn columns are affected.
 */
export function withoutPreTmfBurns(rows: TmfPeriod[]): TmfPeriod[] {
  return rows.map((r) =>
    holdsTmfBurns(r.period)
      ? r
      : { ...r, sky_burn_protocol: 0, sky_burn_other: 0, burn_events: 0 },
  );
}

/** Engine burns only. Summed from the rows rather than read off the document's
 * own total, which counts every burn ever recorded. */
export function tmfBurnTotal(rows: TmfPeriod[]): number {
  return rows
    .filter((r) => holdsTmfBurns(r.period))
    .reduce((total, r) => total + r.sky_burn_protocol, 0);
}

/** What the cutoff excludes — the figure the footnote has to name. */
export function preTmfBurnTotal(rows: TmfPeriod[]): number {
  return rows
    .filter((r) => !holdsTmfBurns(r.period))
    .reduce((total, r) => total + r.sky_burn_protocol, 0);
}

/* ------------------------------------------------------------------- gaps */

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

  // Step 1, always: `toIndex` already counts in the granularity's own unit, so
  // consecutive quarters differ by 1 there, not by 3 months.
  const out: TmfPeriod[] = [];
  const byIndex = new Map(ordered.map((r) => [toIndex(r.period, granularity), r]));
  const first = toIndex(ordered[0].period, granularity);
  const final = toIndex(ordered[ordered.length - 1].period, granularity);
  for (let i = first; i <= final; i += 1) {
    out.push(byIndex.get(i) ?? zeroPeriod(fromIndex(i, granularity)));
  }
  return out;
}
