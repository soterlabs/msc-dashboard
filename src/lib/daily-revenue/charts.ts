import { historyDays, metrics } from "./domain.ts";
import type { Estimate, History } from "./types";

/** Convert only at the plotting boundary; labels retain the API's decimal precision. */
export function trendRows(history: History) {
  return historyDays(history).reverse().map(({ cutoff, estimate }) => {
    const exact = estimate ? metrics(estimate) : null;
    return { cutoff, prime: exact ? Number(exact.prime) : null, sky: exact ? Number(exact.sky) : null, exact };
  });
}

export function componentRows(estimate: Estimate) {
  const r = estimate.result;
  return [
    { name: "Supply-side revenue", exact: r.prime_agent_revenue },
    { name: "Agent rate", exact: r.agent_rate },
    { name: "Distribution rewards", exact: r.distribution_rewards },
    { name: "Chronicle Points", exact: r.chronicle_points },
    { name: "GAR", exact: r.gar },
  ].map((row) => ({ ...row, amount: Number(row.exact) }));
}

/** Compare like-for-like cutoffs rather than silently mixing reporting periods. */
export function comparisonGroups(estimates: Estimate[]) {
  return [...new Set(estimates.map((e) => e.cutoff))].sort().reverse().map((cutoff) => ({
    cutoff,
    rows: estimates.filter((e) => e.cutoff === cutoff).map((e) => {
      const exact = metrics(e);
      return { name: e.prime[0].toUpperCase() + e.prime.slice(1), prime: Number(exact.prime), sky: Number(exact.sky), exact };
    }),
  }));
}
