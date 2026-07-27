/**
 * Tests for the Prime Payments selectors.
 *
 * These exist because this logic decides which payments a reader sees and in
 * what order, and it had no coverage at all while it lived inside
 * prime-payments.tsx — the prerendered-HTML checks used during the refactor only
 * ever rendered the default (DR) section, so the Prime view's filtering, sorting
 * and search were never exercised by anything.
 *
 * Synthetic rows pin the edge cases; data/generated/prime.json is used for the
 * invariants that should hold over the real dataset.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import assert from "node:assert/strict";
import test from "node:test";

import {
  WALLET_OPTIONS,
  accrualLabel,
  accrualMonthOptions,
  accrualMonths,
  compareBy,
  defaultSortDir,
  filterPayments,
  isNumericKey,
  isWalletFilter,
  matches,
  primeKpis,
  primeOptions,
  sumUsds,
  type PaymentFilters,
} from "./domain.ts";
import type { PrimePayment } from "./types.ts";

const REAL: PrimePayment[] = JSON.parse(
  fs.readFileSync(
    path.join(import.meta.dirname, "..", "..", "..", "data", "generated", "prime.json"),
    "utf8",
  ),
).payments;

/** A payment with everything blank, so each test states only what it needs. */
function payment(over: Partial<PrimePayment> = {}): PrimePayment {
  return {
    castDate: "2026-01-01",
    prime: "SPARK",
    usds: 1,
    kind: "settlement cycle",
    settlesAccrual: "",
    receivingWallet: "",
    txHash: "",
    logIndex: 0,
    spell: "",
    spellAddress: "",
    subproxyConstant: "",
    label: "MSC",
    reference: "",
    source: "spell",
    fromAddress: "",
    fromLabel: "",
    toLabel: "",
    lineItem: "",
    walletType: "subproxy",
    ...over,
  };
}

const NO_FILTER: PaymentFilters = {
  kind: "all",
  prime: "all",
  wallet: "all",
  month: "all",
  query: "",
};

/* ------------------------------------------------------------ accruals */

test("accrualMonths splits, trims and drops blanks", () => {
  assert.deepEqual(accrualMonths("2026-05"), ["2026-05"]);
  assert.deepEqual(accrualMonths("2025-11 + 2025-12"), ["2025-11", "2025-12"]);
  assert.deepEqual(accrualMonths("2025-11+2025-12"), ["2025-11", "2025-12"]);
  assert.deepEqual(accrualMonths(""), []);
  assert.deepEqual(accrualMonths("2026-05 + "), ["2026-05"]);
});

test("accrualLabel renders months long, and blank as an em dash", () => {
  assert.equal(accrualLabel(""), "—");
  assert.equal(accrualLabel("2026-05"), "May 2026");
  assert.equal(accrualLabel("2025-11 + 2025-12"), "Nov 2025 + Dec 2025");
});

/* ------------------------------------------------------- filter options */

test("primeOptions is 'all' first, then distinct primes sorted", () => {
  const rows = [payment({ prime: "OBEX" }), payment({ prime: "SPARK" }), payment({ prime: "OBEX" })];
  assert.deepEqual(primeOptions(rows), ["all", "OBEX", "SPARK"]);
});

test("accrualMonthOptions is 'all' first, then distinct months newest first", () => {
  const rows = [
    payment({ settlesAccrual: "2026-01" }),
    payment({ settlesAccrual: "2025-11 + 2025-12" }),
    payment({ settlesAccrual: "" }),
    payment({ settlesAccrual: "2026-01" }),
  ];
  assert.deepEqual(accrualMonthOptions(rows), ["all", "2026-01", "2025-12", "2025-11"]);
});

test("filter options over the real dataset are non-empty and deduped", () => {
  const primes = primeOptions(REAL);
  const months = accrualMonthOptions(REAL);
  assert.ok(primes.length > 1);
  assert.equal(primes[0], "all");
  assert.equal(new Set(primes).size, primes.length);
  assert.equal(months[0], "all");
  assert.equal(new Set(months).size, months.length);
  // newest first
  const withoutAll = months.slice(1);
  assert.deepEqual(withoutAll, [...withoutAll].sort().reverse());
});

test("every WALLET_OPTIONS member is recognised, and nothing else is", () => {
  for (const w of WALLET_OPTIONS) assert.ok(isWalletFilter(w));
  assert.equal(isWalletFilter("safe"), false);
  assert.equal(isWalletFilter(""), false);
  // every walletType present in the real data is offerable in the filter
  for (const w of new Set(REAL.map((r) => r.walletType))) {
    assert.ok(WALLET_OPTIONS.includes(w), `${w} is missing from WALLET_OPTIONS`);
  }
});

/* -------------------------------------------------------------- search */

test("an empty query matches everything", () => {
  assert.ok(matches(payment(), ""));
});

test("search is case-insensitive and covers the identifying fields", () => {
  const row = payment({
    prime: "GROVE",
    label: "Reimbursement",
    subproxyConstant: "GROVE_SUBPROXY",
    settlesAccrual: "2026-03",
    receivingWallet: "0xAbC",
    txHash: "0xDeF",
    spellAddress: "0x123",
    walletType: "msig",
    fromAddress: "0x456",
    fromLabel: "Core Council Buffer",
    toLabel: "Grove Reimbursements",
    lineItem: "March 2026 Expenses",
  });
  for (const q of [
    "grove",
    "GROVE",
    "reimburse",
    "grove_subproxy",
    "2026-03",
    "0xabc",
    "0xdef",
    "0x123",
    "msig",
    "0x456",
    "core council",
    "march 2026",
  ]) {
    assert.ok(matches(row, q), `expected "${q}" to match`);
  }
});

test("search does not reach fields it never covered", () => {
  // kind, castDate, spell, reference and usds are deliberately not searchable
  const row = payment({ castDate: "2026-07-04", kind: "other", reference: "https://forum" });
  assert.equal(matches(row, "2026-07-04"), false);
  assert.equal(matches(row, "other"), false);
  assert.equal(matches(row, "forum"), false);
});

/* ---------------------------------------------------------------- sort */

test("usds sorts numerically, not as text", () => {
  const rows = [payment({ usds: 9 }), payment({ usds: 100 }), payment({ usds: 80 })];
  assert.deepEqual([...rows].sort(compareBy("usds", "asc")).map((r) => r.usds), [9, 80, 100]);
  assert.deepEqual([...rows].sort(compareBy("usds", "desc")).map((r) => r.usds), [100, 80, 9]);
});

test("string columns sort by locale in both directions", () => {
  const rows = [payment({ prime: "SPARK" }), payment({ prime: "GROVE" }), payment({ prime: "OBEX" })];
  assert.deepEqual([...rows].sort(compareBy("prime", "asc")).map((r) => r.prime), [
    "GROVE",
    "OBEX",
    "SPARK",
  ]);
  assert.deepEqual([...rows].sort(compareBy("prime", "desc")).map((r) => r.prime), [
    "SPARK",
    "OBEX",
    "GROVE",
  ]);
});

test("only usds is numeric, and defaults read newest/largest first", () => {
  assert.ok(isNumericKey("usds"));
  for (const k of ["castDate", "prime", "settlesAccrual", "label", "walletType"] as const) {
    assert.equal(isNumericKey(k), false);
  }
  assert.equal(defaultSortDir("usds"), "desc");
  assert.equal(defaultSortDir("castDate"), "desc");
  for (const k of ["prime", "settlesAccrual", "label", "walletType"] as const) {
    assert.equal(defaultSortDir(k), "asc");
  }
});

/* -------------------------------------------------------------- filter */

test("no filters returns every row", () => {
  assert.equal(filterPayments(REAL, NO_FILTER, "castDate", "desc").length, REAL.length);
});

test("filterPayments does not mutate or reorder its input", () => {
  const before = REAL.map((r) => r.txHash + r.logIndex);
  filterPayments(REAL, NO_FILTER, "usds", "asc");
  assert.deepEqual(
    REAL.map((r) => r.txHash + r.logIndex),
    before,
    "the caller's array must be left alone",
  );
});

test("each filter narrows on its own field", () => {
  const rows = [
    payment({ prime: "SPARK", kind: "settlement cycle", walletType: "subproxy", usds: 10 }),
    payment({ prime: "GROVE", kind: "other", walletType: "msig", usds: 20 }),
  ];
  const only = (f: Partial<PaymentFilters>) =>
    filterPayments(rows, { ...NO_FILTER, ...f }, "usds", "asc").map((r) => r.prime);

  assert.deepEqual(only({ kind: "other" }), ["GROVE"]);
  assert.deepEqual(only({ kind: "settlement cycle" }), ["SPARK"]);
  assert.deepEqual(only({ prime: "SPARK" }), ["SPARK"]);
  assert.deepEqual(only({ wallet: "msig" }), ["GROVE"]);
  assert.deepEqual(only({ query: "grove" }), ["GROVE"]);
});

test("the month filter matches inside a multi-month accrual", () => {
  const rows = [
    payment({ prime: "A", settlesAccrual: "2025-11 + 2025-12" }),
    payment({ prime: "B", settlesAccrual: "2026-01" }),
    payment({ prime: "C", settlesAccrual: "" }),
  ];
  const only = (month: string) =>
    filterPayments(rows, { ...NO_FILTER, month }, "prime", "asc").map((r) => r.prime);

  assert.deepEqual(only("2025-11"), ["A"]);
  assert.deepEqual(only("2025-12"), ["A"]);
  assert.deepEqual(only("2026-01"), ["B"]);
  assert.deepEqual(only("2026-99"), []);
  assert.deepEqual(only("all"), ["A", "B", "C"]);
});

test("filters combine as AND, and a query is trimmed", () => {
  const rows = [
    payment({ prime: "SPARK", kind: "settlement cycle", label: "MSC" }),
    payment({ prime: "SPARK", kind: "other", label: "Genesis Transfer" }),
    payment({ prime: "GROVE", kind: "other", label: "Genesis Transfer" }),
  ];
  assert.equal(
    filterPayments(rows, { ...NO_FILTER, prime: "SPARK", kind: "other" }, "prime", "asc").length,
    1,
  );
  assert.equal(
    filterPayments(rows, { ...NO_FILTER, query: "  genesis  " }, "prime", "asc").length,
    2,
  );
  assert.equal(
    filterPayments(rows, { ...NO_FILTER, prime: "SPARK", query: "genesis" }, "prime", "asc").length,
    1,
  );
});

/* ----------------------------------------------------------------- kpis */

test("sumUsds adds, and does not concatenate", () => {
  assert.equal(sumUsds([payment({ usds: 1.5 }), payment({ usds: 2.25 })]), 3.75);
  assert.equal(sumUsds([]), 0);
});

test("primeKpis partitions the real dataset exhaustively", () => {
  const kpis = primeKpis(REAL);
  assert.equal(kpis.paymentCount, REAL.length);
  // kind has exactly two values, so the two totals must account for everything
  assert.ok(Math.abs(kpis.cycleTotal + kpis.otherTotal - sumUsds(REAL)) < 1e-6);
  assert.ok(kpis.cycleTotal > 0);
  assert.ok(kpis.otherTotal > 0);
});

test("primeKpis of an empty list is all zeroes", () => {
  assert.deepEqual(primeKpis([]), { cycleTotal: 0, otherTotal: 0, paymentCount: 0 });
});
