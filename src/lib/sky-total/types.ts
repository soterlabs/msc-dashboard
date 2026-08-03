/**
 * Sky total net revenue, from settlement-reports/reports/sky_total/<month>/summary.md
 * ("buffer basis"): an MSC leg, a non-MSC leg, and the Sky Net Revenue headline.
 */

export type SkyTotalMonth = string;

export interface SkyTotalPrimeLine {
  key: string;
  label: string;
  value: number | null;
}

export interface SkyTotalReport {
  month: SkyTotalMonth;
  block: number | null;

  // MSC leg (buffer basis)
  debtMinted: SkyTotalPrimeLine[];
  debtMintedSubtotal: number | null;
  subproxy: SkyTotalPrimeLine[];
  subproxySubtotalRaw: number | null;
  demandSideBuffer: number | null;
  coreCouncilGross: number | null;
  coreCouncilStep1Capital: number | null;
  /** Derived as gross + Step 1 Capital, not the report's printed "genesis repayment" (its sign is unreliable). */
  coreCouncilGenesisRepayment: number | null;
  groveTgePenalty: number | null;
  mscNet: number | null;

  // Non-MSC leg
  nonMscIncome: number | null;
  nonMscExpense: number | null;
  nonMscNet: number | null;

  skyNetRevenue: number | null;
  notes: string[];
}

export interface SkyTotalDataset {
  months: SkyTotalMonth[];
  monthLabels: Record<string, string>;
  reports: SkyTotalReport[];
}
