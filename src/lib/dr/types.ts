/**
 * Domain types for the Sky Distribution Rewards (DR) console.
 *
 * The data mirrors `dr_comparison_hypersync.xlsx` — the Soter methodology
 * output that attributes monthly DR (USD) across referral codes. That workbook
 * is flat: the code → partner grouping is applied during the refresh from
 * settlement-cycle's `config/dr_ref_codes.yaml`, the same file the settlement
 * reads.
 */

/** A `YYYY-MM` month in the reporting window (driven by REPORT_MONTHS in data.ts). */
export type ReportMonth = string;

/** Map of `YYYY-MM` → DR in USD. `null` = no data reported for that month. */
export type MonthlyMap = Record<string, number | null>;

/** A single referral code inside a partner group (Summary tab). */
export interface RefCodeEntry {
  refCode: string;
  monthly: MonthlyMap;
  total: number | null;
  notes: string;
}

/** A partner group (Skybase, Spark, Grove, …) with its child ref codes. */
export interface SummaryGroup {
  group: string;
  monthly: MonthlyMap;
  total: number | null;
  refCodes: RefCodeEntry[];
}

/** Flat per-ref-code row (Soter by Ref Code tab). */
export interface RefCodeRow {
  refCode: string;
  /** Partner group this ref code rolls up to. */
  group: string;
  monthly: MonthlyMap;
  total: number | null;
  /** Tokens that contributed DR under this ref code. */
  tokens: string[];
  notes: string;
}

/**
 * One window of the DR reward schedule, from settle-dr-dune's rates.py.
 *
 * A rate family changes by dated step, not continuously: XR ran at 0.5% until
 * 2026-07-08 and at 0.2% from 2026-07-09 (the Boosted-DR termination). Windows
 * are inclusive at both ends and never overlap within a family.
 */
export interface RateWindow {
  /** XR, XR*, XR-stUSDS. */
  rateType: string;
  description: string;
  /** Annualised reward rate, e.g. 0.005 = 0.50% APY. */
  apy: number;
  /** Annualized daily rate derived from the APY. */
  rewardPer: number;
  /** Inclusive `YYYY-MM-DD` bounds. */
  start: string;
  end: string;
}

/** Reward-rate row per token, at `DrDataset.ratesAsOf`. */
export interface TokenRate {
  token: string;
  /** XR, XR*, XR-stUSDS — the rate family applied to the token. */
  rateType: string;
  /** Annualised reward rate, e.g. 0.005 = 0.50% APY. */
  apy: number | null;
  /** Per-period reward multiplier actually applied. */
  rewardPer: number | null;
  notes: string;
}

/** Long history per ref code × token (Soter by Ref Code Token tab). */
export interface RefCodeTokenSeries {
  refCode: string;
  token: string;
  monthly: MonthlyMap;
  total: number | null;
}

/** Smart-contract addresses folded into synthetic L2 sUSDS ref codes. */
export interface L2Address {
  chain: string;
  label: string;
  address: string;
  refCode: string;
}

/**
 * Everything the DR views read, as stored in data/generated/dr.json.
 *
 * Loaded on the server (src/lib/load.ts) and handed to the client components
 * as props, so the dataset never becomes part of the browser bundle.
 */
export interface DrDataset {
  /** Months surfaced in the KPI + summary views. */
  reportMonths: ReportMonth[];
  /** Full history window available for per-token drill-downs. */
  historyMonths: ReportMonth[];
  /** Short labels for the report months, e.g. "Jan". */
  monthLabels: Record<string, string>;
  summaryGroups: SummaryGroup[];
  refCodeRows: RefCodeRow[];
  /**
   * `YYYY-MM-DD` the rates below are quoted at — the last day of the reporting
   * window, not the day of the refresh, so a rebuild of the same sources
   * reproduces exactly and the rate matches the months on screen.
   */
  ratesAsOf: string;
  /** Every reward window, including the ones already closed. */
  rateSchedule: RateWindow[];
  /** Per token, the rate in force on `ratesAsOf`. */
  tokenRates: TokenRate[];
  refCodeTokenSeries: RefCodeTokenSeries[];
  l2Addresses: L2Address[];
}
