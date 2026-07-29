/**
 * Sky total net revenue — the consolidated monthly figure from
 * settlement-reports/reports/sky_total/<month>/summary.md.
 *
 * The report reconciles the whole protocol's net revenue: supply-side sky
 * revenue from each prime agent (the MSC perimeter), less the demand-side
 * payments made back to primes, plus the non-MSC protocol P&L.
 */

/** A `YYYY-MM` month with a sky_total report (driven by `months` in the dataset). */
export type SkyTotalMonth = string;

/** One "sky revenue — <prime>" row: the prime's supply-side sky revenue. */
export interface SkyTotalPrimeRevenue {
  /** Lowercase prime id as written in the report, e.g. "spark". */
  key: string;
  /** Display label, e.g. "SPARK". */
  label: string;
  value: number | null;
}

/** One month's reconciliation, mirroring the report's Component/USDS table. */
export interface SkyTotalReport {
  month: SkyTotalMonth;
  /** Per-prime supply-side sky revenue (the MSC perimeter). */
  primeRevenue: SkyTotalPrimeRevenue[];
  /** Σ of primeRevenue — total prime supply-side sky revenue. */
  sumPrimeSkyRevenue: number | null;
  /** less: prime demand-side payments (agent rate + DR); reported negative. */
  demandSidePayments: number | null;
  /** Protocol P&L outside the prime-agent (MSC) perimeter. */
  nonMscNetRevenue: number | null;
  /** Headline: consolidated Sky total net revenue for the month. */
  skyTotalNetRevenue: number | null;
  /** Footnotes carried from the report (reference figure, data warnings). */
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
