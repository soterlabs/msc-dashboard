/**
 * Domain metadata + derived selectors for the Prime Payments view.
 *
 * Matches the shape of dr/domain.ts and ssr/domain.ts: pure functions taking
 * the dataset (or a row) as their first argument, holding no module state, so
 * they are safe to call from client components. Everything here used to live
 * inside prime-payments.tsx, which left that component doing filtering,
 * sorting, search and option-building alongside its markup.
 */
import { monthLong } from "../format";
import type { PrimePayment, PrimeWallet } from "./types";

/** Columns the table can be ordered by. */
export type SortKey =
  | "castDate"
  | "prime"
  | "usds"
  | "settlesAccrual"
  | "label"
  | "walletType";

export type SortDir = "asc" | "desc";

/** Sort keys compared as numbers rather than by locale. */
const NUMERIC_KEYS: ReadonlySet<SortKey> = new Set<SortKey>(["usds"]);

export const isNumericKey = (key: SortKey): boolean => NUMERIC_KEYS.has(key);

/**
 * Direction a column should take when first selected: money and dates read
 * most-recent / largest first, names ascending.
 */
export const defaultSortDir = (key: SortKey): SortDir =>
  isNumericKey(key) || key === "castDate" ? "desc" : "asc";

/** Wallet categories offered by the filter, "all" first. */
export const WALLET_OPTIONS: string[] = [
  "all",
  "subproxy",
  "foundation",
  "msig",
  "other",
] satisfies ("all" | PrimeWallet)[];

/** Accrual months a row covers: "2025-11 + 2025-12" → ["2025-11", "2025-12"]. */
export function accrualMonths(accrual: string): string[] {
  return accrual ? accrual.split("+").map((m) => m.trim()).filter(Boolean) : [];
}

/** "2026-05" or "2025-11 + 2025-12" → "May 2026" / "Nov 2025 + Dec 2025". */
export function accrualLabel(accrual: string): string {
  if (!accrual) return "—";
  return accrual
    .split("+")
    .map((m) => monthLong(m.trim()))
    .join(" + ");
}

/** Distinct primes for the filter select, "all" first. */
export function primeOptions(payments: PrimePayment[]): string[] {
  return ["all", ...Array.from(new Set(payments.map((r) => r.prime))).sort()];
}

/** Distinct accrual months for the filter select, newest first, "all" first. */
export function accrualMonthOptions(payments: PrimePayment[]): string[] {
  const months = new Set(payments.flatMap((r) => accrualMonths(r.settlesAccrual)));
  return ["all", ...Array.from(months).sort().reverse()];
}

/** Free-text search across the fields a reader would recognise a payment by. */
export function matches(row: PrimePayment, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return [
    row.prime,
    row.label,
    row.subproxyConstant,
    row.settlesAccrual,
    row.receivingWallet,
    row.txHash,
    row.spellAddress,
    row.walletType,
    row.fromAddress,
    row.fromLabel,
    row.toLabel,
    row.lineItem,
  ].some((f) => f.toLowerCase().includes(q));
}

export function compareBy(key: SortKey, dir: SortDir) {
  const sign = dir === "asc" ? 1 : -1;
  return (a: PrimePayment, b: PrimePayment) => {
    if (isNumericKey(key)) return (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0) * sign;
    return String(a[key]).localeCompare(String(b[key])) * sign;
  };
}

export interface PaymentFilters {
  /** "all", or a PrimeKind. */
  kind: string;
  prime: string;
  wallet: string;
  /** "all", or a single `YYYY-MM` accrual month. */
  month: string;
  query: string;
}

/** Rows passing every active filter, ordered by the requested column. */
export function filterPayments(
  payments: PrimePayment[],
  { kind, prime, wallet, month, query }: PaymentFilters,
  sortKey: SortKey,
  sortDir: SortDir,
): PrimePayment[] {
  return payments
    .filter(
      (r) =>
        (kind === "all" || r.kind === kind) &&
        (prime === "all" || r.prime === prime) &&
        (wallet === "all" || r.walletType === wallet) &&
        (month === "all" || accrualMonths(r.settlesAccrual).includes(month)) &&
        matches(r, query.trim()),
    )
    .sort(compareBy(sortKey, sortDir));
}

export const sumUsds = (payments: PrimePayment[]): number =>
  payments.reduce((sum, r) => sum + r.usds, 0);

export interface PrimeKpis {
  /** Total USDS paid through settlement cycles. */
  cycleTotal: number;
  /** Total USDS paid outside a settlement cycle (genesis, transfers). */
  otherTotal: number;
  paymentCount: number;
}

export function primeKpis(payments: PrimePayment[]): PrimeKpis {
  return {
    cycleTotal: sumUsds(payments.filter((r) => r.kind === "settlement cycle")),
    otherTotal: sumUsds(payments.filter((r) => r.kind === "other")),
    paymentCount: payments.length,
  };
}
