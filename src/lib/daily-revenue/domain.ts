import { addMoney, subtractMoney } from "./decimal.ts";
import { SEPTEMBER_START, type Allocation, type AllocationSeries, type DailyPrime, type Estimate, type History, type PrimeSeries, type RevenuePoint } from "./types.ts";

const rank = (e: Estimate): [string, number, number] => [e.cutoff, e.publication_order ?? -1, Date.parse(e.computed_at)];
function newestFirst(a: Estimate, b: Estimate): number {
  const [ac, ao, at] = rank(a), [bc, bo, bt] = rank(b);
  return bc.localeCompare(ac) || bo - ao || bt - at;
}
export function mergeHistory(history: History | null, latest: Estimate | null): History | null {
  if (!history || !latest || latest.cutoff < history.start || latest.cutoff > history.end) return history;
  const previous = history.results.find((r) => r.cutoff === latest.cutoff);
  if (previous && newestFirst(previous, latest) <= 0) return history;
  return { ...history, results: [...history.results.filter((r) => r.cutoff !== latest.cutoff), latest].sort(newestFirst) };
}
function dates(start: string, end: string): string[] {
  const out: string[] = [];
  for (let ms = Date.parse(start); ms <= Date.parse(end); ms += 86_400_000) out.push(new Date(ms).toISOString().slice(0, 10));
  return out;
}
const allocationAt = (estimate: Estimate | undefined, venueId: string): Allocation | undefined =>
  estimate?.result.venue_breakdown?.find((v) => v.venue_id === venueId && !v.hide_per_venue_pnl);

/** Catalog every selected September revision so closed allocations survive. */
export function allocationSeries(history: History, prime: DailyPrime): { eligible: AllocationSeries[]; hidden: AllocationSeries[] } {
  const snapshots = new Map(history.results.map((e) => [e.cutoff, e]));
  const catalog = new Map<string, { label: string; seen: number; hidden: boolean }>();
  for (const estimate of [...history.results].sort(newestFirst)) {
    for (const venue of estimate.result.venue_breakdown ?? []) {
      const found = catalog.get(venue.venue_id);
      if (found) found.seen += 1;
      // Iteration is newest-first, so the first occurrence is the allocation's
      // current/closing display contract. Older visible history must not make
      // a currently hidden position clickable again.
      else catalog.set(venue.venue_id, { label: venue.label, seen: 1, hidden: venue.hide_per_venue_pnl });
    }
  }
  const all = [...catalog].map(([venueId, meta]): AllocationSeries => {
    const points = dates(history.start, history.end).map((date): RevenuePoint => {
      const current = allocationAt(snapshots.get(date), venueId);
      if (!current) return { date, mtd: null, daily: null };
      if (date === SEPTEMBER_START) return { date, mtd: current.revenue, daily: current.revenue };
      const priorDate = new Date(Date.parse(date) - 86_400_000).toISOString().slice(0, 10);
      const previous = allocationAt(snapshots.get(priorDate), venueId);
      return { date, mtd: current.revenue, daily: previous ? subtractMoney(current.revenue, previous.revenue) : null };
    });
    return { prime, venueId, label: meta.label, hidden: meta.hidden, points, observed: meta.seen };
  }).sort((a, b) => a.label.localeCompare(b.label) || a.venueId.localeCompare(b.venueId));
  return { eligible: all.filter((a) => !a.hidden), hidden: all.filter((a) => a.hidden) };
}
function sumComplete(values: (string | null)[]): string | null {
  return values.length > 0 && values.every((v): v is string => v !== null) ? addMoney(values) : null;
}
export function primeSeries(history: History, prime: DailyPrime): PrimeSeries {
  const { eligible, hidden } = allocationSeries(history, prime);
  const snapshots = new Map(history.results.map((e) => [e.cutoff, e]));
  const points = dates(history.start, history.end).map((date): RevenuePoint => {
    if (eligible.length === 0) {
      const current = snapshots.get(date)?.result.venue_breakdown;
      if (current === null || current === undefined) return { date, mtd: null, daily: null };
      if (date === SEPTEMBER_START) return { date, mtd: "0", daily: "0" };
      const priorDate = new Date(Date.parse(date) - 86_400_000).toISOString().slice(0, 10);
      const previous = snapshots.get(priorDate)?.result.venue_breakdown;
      return { date, mtd: "0", daily: previous === null || previous === undefined ? null : "0" };
    }
    const components = eligible.map((a) => a.points.find((p) => p.date === date)!);
    return { date, mtd: sumComplete(components.map((p) => p.mtd)), daily: sumComplete(components.map((p) => p.daily)) };
  });
  return { prime, allocations: eligible, hidden, points, breakdownAvailable: history.results.some((e) => e.result.venue_breakdown !== null) };
}
export interface PortfolioPoint extends RevenuePoint { coverage: number }
export function portfolioPoints(primes: PrimeSeries[]): PortfolioPoint[] {
  if (!primes.length) return [];
  return primes[0].points.map((point): PortfolioPoint => {
    const peers = primes.map((p) => p.points.find((v) => v.date === point.date)!);
    const mtd = peers.map((p) => p.mtd), daily = peers.map((p) => p.daily);
    return { date: point.date, mtd: sumComplete(mtd), daily: sumComplete(daily), coverage: daily.filter((v) => v !== null).length };
  });
}
export const latestValue = (points: RevenuePoint[], key: "mtd" | "daily") =>
  [...points].reverse().find((p) => p[key] !== null) ?? null;
