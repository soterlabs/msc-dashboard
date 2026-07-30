/**
 * Sky total net revenue — the consolidated monthly figure from
 * settlement-reports/reports/sky_total/<month>/summary.md.
 *
 * The report is "buffer basis" (methodology handoff 2026-07-16 §3): three
 * sections that build the headline as a waterfall.
 *
 *   MSC net = debt minted to buffer (per prime) − sent to prime subproxies
 *             − sent to Demand-side Buffer − Core-Council genesis repayment
 *             − Grove TGE penalty
 *   Sky Net Revenue = MSC net + non-MSC net
 *
 * The per-prime "of which" annotations in the report (Step 1 Capital add-back,
 * one-off capital seeding) are carve-outs that never enter a subtotal; the
 * Core-Council ones are kept because the genesis-repayment line drives the
 * waterfall, the others are stored for context.
 */

/** A `YYYY-MM` month with a sky_total report (driven by `months` in the dataset). */
export type SkyTotalMonth = string;

/** One per-prime line within an MSC-leg section. */
export interface SkyTotalPrimeLine {
  /** Lowercase prime id as written in the report, e.g. "spark". */
  key: string;
  /** Display label, e.g. "Spark". */
  label: string;
  value: number | null;
}

/** One month's report, mirroring the summary.md's three sections. */
export interface SkyTotalReport {
  month: SkyTotalMonth;
  /** MSC settlement block the figures were extracted from, from the prose. */
  block: number | null;

  /* --- MSC leg (buffer basis) --- */

  /** Debt minted to buffer, per prime (inflow, positive). */
  debtMinted: SkyTotalPrimeLine[];
  /** Reported subtotal of debtMinted. */
  debtMintedSubtotal: number | null;
  /** Sent to each prime's subproxy (outflow, reported negative). */
  subproxy: SkyTotalPrimeLine[];
  /** Reported raw subtotal of subproxy (before any carve-out). */
  subproxySubtotalRaw: number | null;
  /** Sent to the Demand-side Buffer (outflow, reported negative). */
  demandSideBuffer: number | null;
  /** Core Council on-chain mint (GROSS, reported negative). */
  coreCouncilGross: number | null;
  /** Of the gross: the 20% Step 1 Capital add-back (positive carve-out). */
  coreCouncilStep1Capital: number | null;
  /**
   * Core-Council net cost the waterfall uses: coreCouncilGross +
   * coreCouncilStep1Capital. Derived rather than read from the report's printed
   * "genesis repayment" line, whose sign is unreliable in months where the
   * add-back exceeds the gross (the report flags those in `notes`).
   */
  coreCouncilGenesisRepayment: number | null;
  /** Grove TGE penalty, excluded from Sky revenue (reported negative or zero). */
  groveTgePenalty: number | null;
  /** Headline of the MSC leg. */
  mscNet: number | null;

  /* --- Non-MSC leg --- */

  nonMscIncome: number | null;
  nonMscExpense: number | null;
  nonMscNet: number | null;

  /* --- Headline --- */

  /** Consolidated Sky Net Revenue for the month (MSC net + non-MSC net). */
  skyNetRevenue: number | null;

  /** Footnotes carried from the report (config warnings, data caveats). */
  notes: string[];
}

/**
 * Everything the Sky Total Net Revenue view reads, as stored in
 * data/generated/sky-total.json. Loaded on the server (src/lib/load.ts) and
 * passed down as props.
 */
export interface SkyTotalDataset {
  months: SkyTotalMonth[];
  monthLabels: Record<string, string>;
  reports: SkyTotalReport[];
}
