/**
 * Domain metadata + derived selectors for the Prime Payments view.
 *
 * Matches the shape of dr/domain.ts and ssr/domain.ts: pure functions taking
 * the dataset (or a row) as their first argument, holding no module state, so
 * they are safe to call from client components. Everything here used to live
 * inside prime-payments.tsx, which left that component doing filtering,
 * sorting, search and option-building alongside its markup.
 */
// Extension is explicit so `node --test` can resolve this at runtime: type-only
// imports are erased, but a value import needs the real filename. tsconfig sets
// allowImportingTsExtensions for exactly this.
import { monthLong } from "../format.ts";
import type { PrimeKind, PrimePayment, PrimeWallet } from "./types";

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

/** A wallet-category filter: a PrimeWallet, or "all" for no filtering. */
export type WalletFilter = "all" | PrimeWallet;

/** Wallet categories offered by the filter, "all" first. */
export const WALLET_OPTIONS: WalletFilter[] = [
  "all",
  "subproxy",
  "foundation",
  "msig",
  "other",
];

/**
 * Narrows a dropdown's string back to WalletFilter. The dropdown only ever
 * yields a member of WALLET_OPTIONS, so this is a check rather than a cast —
 * which keeps the closed set closed all the way to the filter.
 */
export const isWalletFilter = (value: string): value is WalletFilter =>
  (WALLET_OPTIONS as string[]).includes(value);

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
  /**
   * `kind` and `wallet` are closed sets, so they stay closed here — a typo like
   * "settlment cycle" should not compile into a filter that silently matches
   * nothing. `prime` and `month` are open: they come from the data.
   */
  kind: "all" | PrimeKind;
  wallet: WalletFilter;
  prime: string;
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

/**
 * The download's columns, header and value together.
 *
 * One list rather than two parallel ones: a header array beside a value array is
 * coupled by nothing but discipline, and an insert into one and not the other
 * silently mislabels every column after it — in a file whose whole purpose is
 * for a reviewer to trust the numbers.
 */
const CSV_FIELDS: { header: string; value: (p: PrimePayment) => string | number }[] = [
  { header: "Cast date", value: (p) => p.castDate },
  { header: "Prime", value: (p) => p.prime },
  { header: "USDS", value: (p) => p.usds },
  { header: "Kind", value: (p) => p.kind },
  { header: "Settles accrual", value: (p) => p.settlesAccrual },
  { header: "Label", value: (p) => p.label },
  { header: "Wallet", value: (p) => p.walletType },
  { header: "Receiving wallet", value: (p) => p.receivingWallet },
  { header: "To label", value: (p) => p.toLabel },
  { header: "From address", value: (p) => p.fromAddress },
  { header: "From label", value: (p) => p.fromLabel },
  { header: "Tx hash", value: (p) => p.txHash },
  { header: "Log index", value: (p) => p.logIndex },
  { header: "Spell", value: (p) => p.spell },
  { header: "Spell address", value: (p) => p.spellAddress },
  { header: "Subproxy constant", value: (p) => p.subproxyConstant },
  { header: "Line item", value: (p) => p.lineItem },
  { header: "Reference", value: (p) => p.reference },
  { header: "Source", value: (p) => p.source },
];

export const CSV_COLUMNS: string[] = CSV_FIELDS.map((f) => f.header);

/** One payment as a CSV row, in CSV_COLUMNS order — by construction. */
export const toCsvRow = (p: PrimePayment): (string | number)[] =>
  CSV_FIELDS.map((f) => f.value(p));

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
