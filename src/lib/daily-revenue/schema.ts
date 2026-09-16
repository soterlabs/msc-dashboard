import { decimal } from "./decimal.ts";
import { DAILY_PRIMES, MONEY_FIELDS, type Attempt, type DailyPrime, type DailyStatus, type Estimate, type Freshness, type History, type Latest } from "./types.ts";
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected an object");
  return value as Record<string, unknown>;
}
function str(value: unknown): string {
  if (typeof value !== "string" || !value.length) throw new Error("Expected a nonempty string");
  return value;
}
export function date(value: unknown): string {
  const s = str(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || !Number.isFinite(Date.parse(s)) || new Date(s).toISOString().slice(0, 10) !== s) throw new Error("Invalid UTC date");
  return s;
}
function timestamp(value: unknown): string {
  const s = str(value);
  if (!/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(s) || !Number.isFinite(Date.parse(s))) throw new Error("Invalid timestamp");
  return s;
}
function revision(value: unknown): string {
  const s = str(value);
  if (!/^[0-9a-f]{64}$/.test(s)) throw new Error("Invalid revision");
  return s;
}
function pins(value: unknown): Record<string, number> {
  const p = object(value);
  if (Object.values(p).some((v) => typeof v !== "number" || !Number.isSafeInteger(v) || v < 0)) throw new Error("Invalid block pins");
  return p as Record<string, number>;
}
function strings(value: unknown): string[] {
  if (!Array.isArray(value)) throw new Error("Expected strings");
  return value.map(str);
}
function envelope(value: unknown, prime: DailyPrime) {
  const v = object(value);
  if (v.schema_version !== "1.0" || v.prime !== prime || v.cadence !== "daily" || v.estimate_basis !== "month_to_date") throw new Error("Unsupported daily revenue document");
  return v;
}
export function validateEstimate(value: unknown, prime: DailyPrime): Estimate {
  const v = object(value), r = object(v.result), period = object(r.period), month = object(r.month);
  const cutoff = date(v.cutoff);
  if (v.prime !== prime || r.prime_id !== prime || v.provisional !== true || period.end !== cutoff ||
      period.start !== `${cutoff.slice(0, 7)}-01` || month.year !== Number(cutoff.slice(0, 4)) || month.month !== Number(cutoff.slice(5, 7))) throw new Error("Estimate prime/month/cutoff mismatch");
  if (v.publication_order !== undefined && (typeof v.publication_order !== "number" || !Number.isSafeInteger(v.publication_order) || v.publication_order < 0)) throw new Error("Invalid publication order");
  return {
    publication_order: v.publication_order as number | undefined,
    prime, revision_id: revision(v.revision_id), cutoff, computed_at: timestamp(v.computed_at),
    code_version: str(v.code_version), configuration_version: str(v.configuration_version), input_revision: str(v.input_revision),
    opening_pins: pins(v.opening_pins), closing_pins: pins(v.closing_pins), provisional: true,
    excluded_inputs: strings(v.excluded_inputs), input_provenance: object(v.input_provenance),
    result: Object.fromEntries(MONEY_FIELDS.map((key) => [key, decimal(r[key])])) as Estimate["result"],
  };
}
function attempt(value: unknown): Attempt | null {
  if (value === null) return null;
  const v = object(value);
  if (!["running", "succeeded", "failed", "abandoned"].includes(String(v.status))) throw new Error("Invalid attempt status");
  return { attempt_id: str(v.attempt_id), cutoff: date(v.cutoff), status: v.status as Attempt["status"], started_at: timestamp(v.started_at),
    finished_at: v.finished_at === null ? null : timestamp(v.finished_at), error_type: v.error_type === null ? null : str(v.error_type),
    revision_id: v.revision_id === null ? null : revision(v.revision_id) };
}
function freshness(value: unknown): Freshness {
  const v = object(value);
  if (typeof v.stale !== "boolean") throw new Error("Invalid freshness");
  return { expected_cutoff: date(v.expected_cutoff), actual_cutoff: v.actual_cutoff === null ? null : date(v.actual_cutoff), stale: v.stale };
}
/** The estimate and its freshness block can be assembled either side of a
 * revision publish. A disagreement between them is a freshness inconsistency,
 * not a reason to discard an estimate that is itself valid: report the cutoff
 * actually rendered, and hold it stale until it reaches the expected one. */
export function validateLatest(value: unknown, prime: DailyPrime): Latest {
  const v = envelope(value, prime), data = validateEstimate(v.data, prime), f = freshness(v.freshness);
  const reconciled = f.actual_cutoff === data.cutoff ? f
    : { expected_cutoff: f.expected_cutoff, actual_cutoff: data.cutoff, stale: f.stale || data.cutoff < f.expected_cutoff };
  return { data, freshness: reconciled, latest_attempt: attempt(v.latest_attempt) };
}
export function validateHistory(value: unknown, prime: DailyPrime, start: string, end: string): History {
  const v = envelope(value, prime);
  if (v.start !== start || v.end !== end || !Array.isArray(v.results) || v.results.length > 90) throw new Error("Invalid history window");
  const results = v.results.map((r) => validateEstimate(r, prime));
  if (results.some((r) => r.cutoff < start || r.cutoff > end) || new Set(results.map((r) => r.cutoff)).size !== results.length) throw new Error("Invalid history cutoffs");
  return { results: results.sort((a, b) => b.cutoff.localeCompare(a.cutoff)), start, end };
}
export function validateStatus(value: unknown): DailyStatus {
  const v = object(value), primes = object(v.primes);
  if (v.cadence !== "daily" || typeof v.ready !== "boolean") throw new Error("Invalid revenue status");
  // A malformed entry drops that prime alone. Six primes share this document
  // and one bad state block is no reason to blank the other five.
  return Object.fromEntries(DAILY_PRIMES.flatMap((p) => {
    try {
      const state = object(primes[p]);
      return [[p, { ...freshness(state), latest_attempt: attempt(state.latest_attempt) }]];
    } catch { return []; }
  }));
}
