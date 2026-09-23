import type { DrDataset } from "../dr/types";
import type { SsrDataset, SsrPartner } from "./types";

/** A prime can earn rewards before its first published settlement. */
export function revenueMonths(ssr: SsrDataset, dr: DrDataset, partner: SsrPartner, group: string): string[] {
  const months = new Set(ssr.reports.filter((r) => r.partner === partner).map((r) => r.month));
  for (const row of dr.refCodeRows.filter((r) => r.group === group)) {
    for (const month of dr.reportMonths) {
      if (row.monthly[month] != null) months.add(month);
    }
  }
  return [...months].sort();
}

/** Compare the full month's calculated ledger with the published settlement,
 * before applying any interactive filters. Absence is not a reported zero. */
export function compareRewards(dr: DrDataset, settled: number | null | undefined) {
  const values = dr.refCodeRows.map((r) => r.total).filter((v): v is number => v != null);
  const calculated = values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) * 100) / 100 : null;
  return {
    calculated,
    settled: settled ?? null,
    difference: calculated !== null && settled != null
      ? Math.round((calculated - settled) * 100) / 100
      : null,
  };
}
