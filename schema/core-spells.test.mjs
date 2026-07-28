/**
 * Tests for the transfer taxonomy.
 *
 * This is the part of the spell fetch that makes a judgement, so it is the part
 * most able to be quietly wrong: a movement filed under the wrong tag reads as
 * covered when it is not. The precedence rules are asserted individually,
 * because they only matter where two of them compete.
 */
import assert from "node:assert/strict";
import test from "node:test";

import { TAGS, ZERO, movement, tagTransfer } from "./core-spells.mjs";

const SPARK_SUB = "0x3300f198988e4c9c63f75df86de36421f06af8c4";
const GROVE_SUB = "0x1369f7b2b38c76b6478c0f0e66d94923421891ba";
const OUTSIDE = "0x92e4629a4510af5819d7d1601464c233599ff5ec";
const KNOWN_CONTRACT = "0xbe8e3e3618f7474f8cb1d074a26affef007e98fb";

/** Defaults describe an ordinary, unremarkable movement; tests override. */
const tag = (over = {}) =>
  tagTransfer({
    transfer: { from: OUTSIDE, to: OUTSIDE, amount: "1000", ...over.transfer },
    fromPrime: "",
    toPrime: "",
    fromNamed: false,
    toNamed: false,
    payment: null,
    ...over,
  });

test("every tag produced is one the taxonomy documents", () => {
  const produced = [
    tag(),
    tag({ toPrime: "SPARK", transfer: { from: ZERO, to: SPARK_SUB, amount: "100" } }),
    tag({ fromPrime: "SPARK", toPrime: "GROVE", transfer: { from: SPARK_SUB, to: GROVE_SUB, amount: "1" } }),
    tag({ payment: { Label: "MSC" } }),
  ].map((r) => r.tag);
  for (const t of produced) assert.ok(t in TAGS, `${t} is missing from TAGS`);
});

/* ------------------------------------------------------- curated wins */

test("a recorded payment takes its tag from payments.csv, not from the shape", () => {
  for (const [label, expected] of [
    ["MSC", "msc-payment"],
    ["Genesis Transfer", "capital-transfer"],
    ["Genesis Capital", "capital-transfer"],
    ["DR True-up", "capital-transfer"],
    ["Test", "prime-test"],
    ["Reimbursement", "prime-inflow"],
  ]) {
    const r = tag({ payment: { Label: label }, toPrime: "SPARK" });
    assert.equal(r.tag, expected, label);
    assert.equal(r.coverage, "payments.csv");
  }
});

test("an unrecognised label still counts as covered", () => {
  // Better to report it as covered with a fallback tag than to claim payments.csv
  // does not have the row when it plainly does.
  const r = tag({ payment: { Label: "Something New" }, toPrime: "SPARK" });
  assert.equal(r.coverage, "payments.csv");
  assert.ok(r.tag in TAGS);
});

test("anything not in payments.csv is marked new", () => {
  assert.equal(tag().coverage, "new");
  assert.equal(tag({ toPrime: "SPARK" }).coverage, "new");
});

/* ----------------------------------------------------------- primes */

test("two different primes is cross-prime — the Spark to Grove case", () => {
  const r = tag({
    fromPrime: "SPARK",
    toPrime: "GROVE",
    fromNamed: true,
    toNamed: true,
    transfer: { from: SPARK_SUB, to: GROVE_SUB, amount: "1031866" },
  });
  assert.equal(r.tag, "cross-prime");
  assert.equal(r.coverage, "new");
});

test("the same prime on both sides is intra-prime", () => {
  assert.equal(tag({ fromPrime: "SPARK", toPrime: "SPARK" }).tag, "intra-prime");
});

test("a mint into a prime is prime-mint, never guessed as msc or capital", () => {
  // Which one it is depends on the accrual it settles, which the transfer does
  // not say — so the tag stops at what is known and flags it for classification.
  const r = tag({ toPrime: "SPARK", transfer: { from: ZERO, to: SPARK_SUB, amount: "9746443" } });
  assert.equal(r.tag, "prime-mint");
  assert.equal(r.coverage, "new");
});

test("a non-mint arrival at a prime is an inflow", () => {
  assert.equal(
    tag({ toPrime: "GROVE", transfer: { from: OUTSIDE, to: GROVE_SUB, amount: "500000" } }).tag,
    "prime-inflow",
  );
});

test("a prime sending out is an outflow", () => {
  assert.equal(
    tag({ fromPrime: "SPARK", transfer: { from: SPARK_SUB, to: OUTSIDE, amount: "1100000" } }).tag,
    "prime-outflow",
  );
});

/* ------------------------------------------------------------- dust */

test("dust to or from a prime is a test, beating inflow and outflow", () => {
  for (const amount of ["1", "0.0001", "0"]) {
    assert.equal(tag({ toPrime: "SPARK", transfer: { amount } }).tag, "prime-test", `to, ${amount}`);
    assert.equal(tag({ fromPrime: "SPARK", transfer: { amount } }).tag, "prime-test", `from, ${amount}`);
  }
});

test("just above dust is a real movement", () => {
  assert.equal(tag({ toPrime: "SPARK", transfer: { amount: "1.000001" } }).tag, "prime-inflow");
});

test("dust does not turn a cross-prime transfer into a test", () => {
  // Two primes is the more specific fact, and a small cross-prime move is still
  // a cross-prime move.
  assert.equal(tag({ fromPrime: "SPARK", toPrime: "GROVE", transfer: { amount: "1" } }).tag, "cross-prime");
});

test("an unparseable amount does not become a test", () => {
  assert.equal(tag({ toPrime: "SPARK", transfer: { amount: "" } }).tag, "prime-inflow");
  assert.equal(tag({ toPrime: "SPARK", transfer: { amount: "n/a" } }).tag, "prime-inflow");
});

/* --------------------------------------------------------- no prime */

test("known on both sides, no prime, is plumbing", () => {
  assert.equal(tag({ fromNamed: true, toNamed: true }).tag, "plumbing");
});

test("a mint or burn counts as a known side", () => {
  // The DAI mint → DAI_USDS → burn path a USDS payment travels through.
  assert.equal(tag({ toNamed: true, transfer: { from: ZERO, to: KNOWN_CONTRACT } }).tag, "plumbing");
  assert.equal(tag({ fromNamed: true, transfer: { from: KNOWN_CONTRACT, to: ZERO } }).tag, "plumbing");
});

test("one known side means value crossed the protocol boundary", () => {
  assert.equal(tag({ fromNamed: true }).tag, "protocol-outflow");
  assert.equal(tag({ toNamed: true }).tag, "protocol-inflow");
});

test("neither side known is unclassified", () => {
  assert.equal(tag().tag, "unclassified");
});

/* -------------------------------------------------------- movement */

test("movement reports the mechanical fact, separate from the tag", () => {
  assert.equal(movement({ from: ZERO, to: SPARK_SUB }), "mint");
  assert.equal(movement({ from: SPARK_SUB, to: ZERO }), "burn");
  assert.equal(movement({ from: SPARK_SUB, to: GROVE_SUB }), "transfer");
});
