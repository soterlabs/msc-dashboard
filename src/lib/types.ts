/**
 * Domain types for the Sky Distribution Rewards (DR) console.
 *
 * The data mirrors `dr_comparison_latest.xlsx` — the Soter methodology output
 * that attributes monthly DR (USD) across referral codes, grouped by partner.
 */

/** Reporting window currently surfaced across the KPI/summary views. */
export type ReportMonth =
  | "2026-01"
  | "2026-02"
  | "2026-03"
  | "2026-04"
  | "2026-05";

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

/** Reward-rate methodology row (Soter Rates tab). */
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
