import type { DrDataset, MonthlyMap } from "./types";

/** Slice before sending the ledger to the browser so totals, exports and token
 * details all share the same prime/month boundary. Null stays missing; zero
 * stays a reported value. Source snapshots are never modified. */
export function scopeDr(dr: DrDataset, group: string, month: string): DrDataset {
  const slice = <T extends { monthly: MonthlyMap; total: number | null }>(row: T): T => ({
    ...row,
    monthly: { [month]: row.monthly[month] ?? null },
    total: row.monthly[month] ?? null,
  });
  const rows = dr.refCodeRows.filter((r) => r.group === group && r.monthly[month] != null);
  const codes = new Set(rows.map((r) => r.refCode));
  const series = dr.refCodeTokenSeries
    .filter((s) => codes.has(s.refCode) && s.monthly[month] != null)
    .map(slice);
  return {
    ...dr,
    reportMonths: [month],
    historyMonths: [month],
    monthLabels: { [month]: dr.monthLabels[month] ?? month },
    refCodeRows: rows.map((r) => ({
      ...slice(r),
      tokens: series.filter((s) => s.refCode === r.refCode && s.total !== 0).map((s) => s.token),
    })),
    summaryGroups: dr.summaryGroups.filter((g) => g.group === group).map((g) => ({
      ...slice(g),
      refCodes: g.refCodes.filter((r) => codes.has(r.refCode)).map(slice),
    })),
    refCodeTokenSeries: series,
    l2Addresses: dr.l2Addresses.filter((a) => codes.has(a.refCode)),
  };
}
