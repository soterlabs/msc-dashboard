export const DAILY_PRIMES = ["spark", "grove", "obex", "keel", "skybase", "osero"] as const;
export type DailyPrime = (typeof DAILY_PRIMES)[number];
export const primeName = (prime: DailyPrime) => prime[0].toUpperCase() + prime.slice(1);
export const isDailyPrime = (value: string): value is DailyPrime => (DAILY_PRIMES as readonly string[]).includes(value);

export const DAILY_MONTHS = ["2026-09", "2026-10"] as const;
export type DailyMonth = (typeof DAILY_MONTHS)[number];
export const isDailyMonth = (value: unknown): value is DailyMonth => typeof value === "string" && (DAILY_MONTHS as readonly string[]).includes(value);

export interface Allocation {
  venue_id: string;
  label: string;
  revenue: string;
  actual_revenue: string;
  external_revenue: string;
  sd_revenue: string;
  hide_per_venue_pnl: boolean;
  pricing_category: string | null;
}
export interface RevenueResult {
  venue_breakdown: Allocation[] | null;
  /** Retained for provenance/regression checks; never used as displayed revenue. */
  prime_agent_revenue: string;
}
export interface Estimate {
  prime: DailyPrime;
  revision_id: string;
  publication_order?: number;
  cutoff: string;
  computed_at: string;
  code_version: string;
  configuration_version: string;
  input_revision: string;
  opening_pins: Record<string, number>;
  closing_pins: Record<string, number>;
  provisional: true;
  excluded_inputs: string[];
  input_provenance: Record<string, unknown>;
  result: RevenueResult;
}
export interface Attempt {
  attempt_id: string;
  cutoff: string;
  status: "running" | "succeeded" | "failed" | "abandoned";
  started_at: string;
  finished_at: string | null;
  error_type: string | null;
  revision_id: string | null;
}
export interface Freshness { expected_cutoff: string; actual_cutoff: string | null; stale: boolean }
export interface Latest { data: Estimate; freshness: Freshness; latest_attempt: Attempt | null }
export interface History { results: Estimate[]; start: string; end: string }
export type DailyStatus = Partial<Record<DailyPrime, Freshness & { latest_attempt: Attempt | null }>>;
export interface ReadResult<T> {
  data: T | null;
  source: "api" | "cache" | "missing" | "unavailable";
  verifiedAt: string | null;
  error: string | null;
}
export interface RevenuePoint { date: string; mtd: string | null; daily: string | null }
export interface AllocationSeries {
  prime: DailyPrime;
  venueId: string;
  label: string;
  hidden: boolean;
  points: RevenuePoint[];
  observed: number;
}
export interface PrimeSeries {
  prime: DailyPrime;
  allocations: AllocationSeries[];
  hidden: AllocationSeries[];
  points: RevenuePoint[];
  breakdownAvailable: boolean;
}
