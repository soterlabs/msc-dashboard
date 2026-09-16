export const DAILY_PRIMES = ["spark", "grove", "obex", "keel", "skybase", "osero"] as const;
export type DailyPrime = (typeof DAILY_PRIMES)[number];
export const primeName = (prime: DailyPrime) => prime[0].toUpperCase() + prime.slice(1);
export const isDailyPrime = (value: string): value is DailyPrime => (DAILY_PRIMES as readonly string[]).includes(value);
export const MONEY_FIELDS = ["sky_revenue", "agent_rate", "prime_agent_revenue", "monthly_pnl", "distribution_rewards", "chronicle_points", "gar"] as const;
export type RevenueResult = Record<(typeof MONEY_FIELDS)[number], string>;
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
export interface Latest {
  data: Estimate;
  freshness: Freshness;
  latest_attempt: Attempt | null;
}
export interface History { results: Estimate[]; start: string; end: string }
export type DailyStatus = Partial<Record<DailyPrime, Freshness & { latest_attempt: Attempt | null }>>;
export interface ReadResult<T> {
  data: T | null;
  source: "api" | "cache" | "missing" | "unavailable";
  verifiedAt: string | null;
  error: string | null;
}
