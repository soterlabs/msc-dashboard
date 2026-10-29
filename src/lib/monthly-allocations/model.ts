import { Decimal } from "decimal.js";
import { decimal, usd } from "../daily-revenue/decimal.ts";
import { isDailyPrime, type DailyPrime } from "../daily-revenue/types.ts";

export const INITIAL_MONTH = "2026-08";
export interface MonthlyAllocation {
  venue_id: string; label: string;
  borrowing_cost_usd: string | null; borrowing_cost_status: string;
  gross_revenue_usd: string | null; prime_retained_revenue_usd: string | null;
  net_pnl_usd: string | null;
  gross_monthly_return: string | null; net_monthly_return: string | null;
  gross_apy: string | null; net_apy: string | null;
  average_original_principal_usd: string | null; average_yield_exposure_usd: string | null;
  yield_denominator: string | null; cost_reported_under: string | null;
}
export interface MonthlyDocument {
  prime: DailyPrime; month: string; revision_id: string; published_at: string;
  allocations: MonthlyAllocation[]; provisional: true;
}
const known = new Set(["calculable_under_assumption", "excluded_from_cost", "no_principal_in_period"]);
const obj = (v: unknown): Record<string, unknown> => {
  if (!v || typeof v !== "object" || Array.isArray(v)) throw new Error("Expected object");
  return v as Record<string, unknown>;
};
const text = (v: unknown): string => {
  if (typeof v !== "string" || !v) throw new Error("Expected text");
  return v;
};
const nullable = (v: unknown) => v === null ? null : decimal(v);
export function completedMonth(month: string, now = new Date()): boolean {
  return /^2026-(0[1-9]|1[0-2])$/.test(month) && month < now.toISOString().slice(0, 7);
}
export function parseMonthlyRoute(path: string[], now = new Date()): { month: string; prime?: DailyPrime; venue?: string } | null {
  const [month = INITIAL_MONTH, prime, venue] = path;
  if (path.length > 3 || !completedMonth(month, now) || (prime !== undefined && !isDailyPrime(prime)) ||
      (venue !== undefined && !/^[A-Za-z0-9_-]{1,80}$/.test(venue))) return null;
  return { month, ...(prime ? { prime: prime as DailyPrime } : {}), ...(venue ? { venue } : {}) };
}
export function validateMonthly(value: unknown, prime: DailyPrime, month: string): MonthlyDocument {
  const v = obj(value), period = obj(v.period);
  const end = new Date(`${month}-01T00:00:00Z`);
  end.setUTCMonth(end.getUTCMonth() + 1, 0);
  if (v.schema_version !== "1.0" || v.cadence !== "monthly" || v.provisional !== true || v.prime !== prime || v.month !== month ||
      period.start !== `${month}-01` || period.end !== end.toISOString().slice(0, 10) || period.days !== end.getUTCDate() ||
      !/^[0-9a-f]{64}$/.test(text(v.revision_id)) || !Number.isFinite(Date.parse(text(v.published_at)))) throw new Error("Invalid monthly document");
  if (!Array.isArray(v.allocations) || v.count !== v.allocations.length) throw new Error("Invalid allocations");
  const allocations = v.allocations.map((raw): MonthlyAllocation => {
    const r = obj(raw);
    const row: MonthlyAllocation = {
      venue_id: text(r.venue_id), label: text(r.label), borrowing_cost_status: text(r.borrowing_cost_status),
      borrowing_cost_usd: nullable(r.borrowing_cost_usd), gross_revenue_usd: nullable(r.gross_revenue_usd),
      prime_retained_revenue_usd: nullable(r.prime_retained_revenue_usd), net_pnl_usd: nullable(r.net_pnl_usd),
      gross_monthly_return: nullable(r.gross_monthly_return), net_monthly_return: nullable(r.net_monthly_return),
      gross_apy: nullable(r.gross_apy), net_apy: nullable(r.net_apy),
      average_original_principal_usd: nullable(r.average_original_principal_usd),
      average_yield_exposure_usd: nullable(r.average_yield_exposure_usd),
      yield_denominator: r.yield_denominator === null ? null : text(r.yield_denominator),
      cost_reported_under: r.cost_reported_under === null ? null : text(r.cost_reported_under),
    };
    if (!/^[A-Za-z0-9_-]{1,80}$/.test(row.venue_id) || known.has(row.borrowing_cost_status) !== (row.borrowing_cost_usd !== null)) throw new Error("Inconsistent borrowing cost status");
    if (row.borrowing_cost_usd === null && [row.net_pnl_usd, row.net_apy, row.net_monthly_return].some(x => x !== null)) throw new Error("Unknown costs cannot have net yields");
    for (const amount of [row.borrowing_cost_usd, row.average_original_principal_usd, row.average_yield_exposure_usd]) {
      if (amount !== null && new Decimal(amount).isNegative()) throw new Error("Negative capital or cost");
    }
    return row;
  });
  if (new Set(allocations.map(r => r.venue_id)).size !== allocations.length) throw new Error("Duplicate allocation");
  return { prime, month, revision_id: text(v.revision_id), published_at: text(v.published_at), provisional: true, allocations };
}
export function percent(value: string | null): string {
  if (value === null) return "—";
  const p = new Decimal(decimal(value)).times(100);
  if (!p.isZero() && p.abs().lt("0.0001")) return `${p.isNegative() ? "−" : ""}<0.0001%`;
  return `${p.toFixed(p.abs().lt("0.005") && !p.isZero() ? 4 : 2)}%`;
}
export function costReason(row: MonthlyAllocation): string {
  if (row.cost_reported_under) return `Included under ${row.cost_reported_under}`;
  const reasons: Record<string, string> = {
    calculable_under_assumption: "Sky-funded principal assumed",
    excluded_from_cost: "Exempt from borrowing cost", no_principal_in_period: "No principal this month",
    savings_split_pending: "Sky / Savings funding split unresolved", capital_measurement_gap: "Capital measurement incomplete",
    principal_classification_pending: "Principal classification pending", deduction_or_revenue_metadata_pending: "Deduction details pending",
    missing_capital_history: "Capital history unavailable", savings_liability: "Savings liability, not an allocation", income_only: "Income only",
  };
  return reasons[row.borrowing_cost_status] ?? "Borrowing cost unavailable";
}

/** Do not display a nonzero cost or loss as an exemption/zero. */
export function monthlyUsd(value: string | null): string {
  if (value === null) return "—";
  const amount = new Decimal(decimal(value));
  if (!amount.isZero() && amount.abs().lt("0.01")) return `${amount.isNegative() ? "−" : ""}<$0.01`;
  return usd(value);
}
