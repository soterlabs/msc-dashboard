import type { DrDataset } from "./types";

/** Only target a month in which the scoped ledger will contain this row.
 * Reported zero is a valid destination; missing data is not. */
export function latestRefCodeMonth(dr: DrDataset, refCode: string): string | undefined {
  const row = dr.refCodeRows.find((r) => r.refCode === refCode);
  return dr.reportMonths.filter((month) => row?.monthly[month] != null).sort().at(-1);
}

export const refCodeFragment = (refCode: string) => `#ref-code-${encodeURIComponent(refCode)}`;

export function refCodeFromFragment(hash: string): string | null {
  if (!hash.startsWith("#ref-code-")) return null;
  try {
    return decodeURIComponent(hash.slice("#ref-code-".length)) || null;
  } catch {
    return null;
  }
}
