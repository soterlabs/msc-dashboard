/**
 * Sky total net revenue, from settlement-reports/reports/sky_total/<month>/summary.md.
 *
 * The series spans two methodologies and will keep doing so — restating the
 * closed months would misrepresent what was settled at the time:
 *
 *   buffer   (Jan–Jun 2026, operator decision 2026-08-06) — the month carries
 *            the settlement that EXECUTED in it, read off the settlement block.
 *   accrual  (Jul 2026 onward, operator definition 2026-08-07) — the month
 *            carries the revenue EARNED in it, paid at the next settlement, so
 *            the MSC leg is a preview of a settlement that has not run yet.
 *
 * Both legs answer the same two questions per prime — how much debt was minted,
 * how much went out to the prime — so one shape carries both and `basis` says
 * which reading applies. What differs is only what the report can print
 * alongside: a buffer month knows its below-the-line deductions, an accrual
 * month cannot until the settlement executes.
 */

export type SkyTotalMonth = string;

export type SkyTotalBasis = "buffer" | "accrual";

/** One prime's two MSC-leg figures. `sent` is negative — it leaves the buffer. */
export interface SkyTotalPrimeLine {
  key: string;
  label: string;
  minted: number;
  sent: number;
}

/**
 * Deductions the report prints below Sky Net Revenue rather than inside it.
 * Buffer months only: on the accrual basis these are unknown until the
 * settlement executes, and the report says so in prose instead.
 */
export interface SkyTotalBelowTheLine {
  /** Core Council Buffer transfer — BA's "Security and Maintenance". */
  coreCouncil: number | null;
  /** Of which: Step 1 Capital distribution, 20% of the cycle month's net. */
  step1Capital: number | null;
  /** Of which: genesis / expense repayments. */
  genesisRepayments: number | null;
  /** One-off subproxy endowments. */
  capitalSeedings: number | null;
  /** Remitted to Sky reserves, known items only. */
  remitted: number | null;
}

export interface SkyTotalReport {
  month: SkyTotalMonth;
  basis: SkyTotalBasis;
  /** Settlement block(s) the month was read from; empty on the accrual basis. */
  blocks: number[];

  // MSC leg
  primes: SkyTotalPrimeLine[];
  mintedTotal: number;
  sentTotal: number;
  mscNet: number;

  // Non-MSC leg
  nonMscIncome: number;
  nonMscExpense: number;
  nonMscNet: number;
  /**
   * Demand-side Buffer transfer: paid inside the settlement tx, classified as a
   * non-MSC operating expense. Printed as its own line on the buffer basis and
   * zero in every month so far, so it is carried for fidelity and never summed
   * — the refresh reconciles `nonMscNet` against income + expense alone, which
   * is what would fail loudly if it ever started carrying weight.
   */
  demandSideBuffer: number | null;

  skyNetRevenue: number;
  belowTheLine: SkyTotalBelowTheLine | null;
  /** Blockquote notes, including the report's own ⚠ reconciliation warnings. */
  notes: string[];
}

export interface SkyTotalDataset {
  months: SkyTotalMonth[];
  monthLabels: Record<string, string>;
  reports: SkyTotalReport[];
}
