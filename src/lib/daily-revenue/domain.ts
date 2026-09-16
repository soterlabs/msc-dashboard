import { addMoney, isZeroMoney } from "./decimal.ts";
import type { Estimate, History } from "./types";
export function metrics(estimate: Estimate) {
  const r = estimate.result;
  const demand = addMoney([r.agent_rate, r.distribution_rewards, r.chronicle_points, r.gar]);
  return { supply: r.prime_agent_revenue, demand, prime: addMoney([r.prime_agent_revenue, demand]), sky: r.sky_revenue };
}
/** The prime total sums whatever the response carries, distribution rewards
 * included. The daily cadence reports them as zero, but a caption that asserts
 * the exclusion unconditionally would be a lie the first time it does not. */
export const distributionExcluded = (estimate: Estimate) => isZeroMoney(estimate.result.distribution_rewards);
export const distributionNote = (estimate: Estimate) =>
  distributionExcluded(estimate) ? "monthly distribution rewards excluded" : "includes the distribution rewards this response reports";
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
/** One key per revision — cutoff, then publication order, then computation
 * time — rather than a key chosen from the pair. Comparing on publication_order
 * only when both operands carry it is not transitive, so with the field present
 * on some revisions of a cutoff and absent on others the winner would fall out
 * of the sort implementation instead of out of the data. A revision without an
 * order ranks below every ordered one at its cutoff. */
const rank = (e: Estimate): [string, number, number] => [e.cutoff, e.publication_order ?? -1, Date.parse(e.computed_at)];
function newestFirst(a: Estimate, b: Estimate): number {
  const [ac, ao, at] = rank(a), [bc, bo, bt] = rank(b);
  return bc.localeCompare(ac) || bo - ao || bt - at;
}
/** Independently cached endpoints may observe a correction at different times.
 * Use the newest known publication consistently in both headline and table. */
export function mergeHistory(history: History | null, latest: Estimate | null): History | null {
  if (!history || !latest || latest.cutoff < history.start || latest.cutoff > history.end) return history;
  const previous = history.results.find((r) => r.cutoff === latest.cutoff);
  if (previous && newestFirst(previous, latest) <= 0) return history;
  return { ...history, results: [...history.results.filter((r) => r.cutoff !== latest.cutoff), latest].sort(newestFirst) };
}
/** Only a returned cutoff in the selected month may populate its headline. */
export function selectedEstimate(month: string, history: History | null, latest: Estimate | null): Estimate | null {
  const candidates = history?.results.filter((r) => r.cutoff.startsWith(`${month}-`)) ?? [];
  if (latest?.cutoff.startsWith(`${month}-`)) candidates.push(latest);
  return candidates.sort(newestFirst)[0] ?? null;
}
