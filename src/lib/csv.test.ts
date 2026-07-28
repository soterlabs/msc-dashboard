/**
 * Tests for the browser-side CSV builder.
 *
 * The download exists so a reviewer can check the numbers in a spreadsheet, so
 * quoting is the whole job: the version this replaced quoted only the notes
 * column, and a comma anywhere else shifted every column after it.
 */
import assert from "node:assert/strict";
import test from "node:test";

import { filteredFilename, toCsv } from "./csv.ts";

test("plain values are written unquoted", () => {
  assert.equal(toCsv(["a", "b"], [["1", "2"]]), "a,b\n1,2\n");
});

test("commas, quotes and newlines are quoted and escaped", () => {
  const csv = toCsv(["note"], [["has, comma"], ['say "hi"'], ["two\nlines"]]);
  assert.equal(csv, 'note\n"has, comma"\n"say ""hi"""\n"two\nlines"\n');
});

test("a comma in any column keeps the columns aligned", () => {
  // The specific regression: previously only the last column was quoted.
  const csv = toCsv(["a", "b", "c"], [["x, y", "2", "3"]]);
  assert.equal(csv.trim().split("\n")[1], '"x, y",2,3');
});

test("numbers and blanks round-trip as text", () => {
  assert.equal(toCsv(["n", "z"], [[4204857, null], [0, undefined]]), "n,z\n4204857,\n0,\n");
});

test("a header with a comma is quoted too", () => {
  assert.equal(toCsv(["a,b"], [["1"]]), '"a,b"\n1\n');
});

test("no rows still yields a header", () => {
  assert.equal(toCsv(["a", "b"], []), "a,b\n");
});

/* ------------------------------------------------------------ filename */

test("the filename records only the active filters", () => {
  assert.equal(
    filteredFilename("prime_payments", { kind: "all", prime: "SPARK", month: "2026-05" }),
    "prime_payments_SPARK_2026-05.csv",
  );
  assert.equal(
    filteredFilename("prime_payments", { kind: "all", prime: "all", month: "all" }),
    "prime_payments.csv",
  );
});

test("filter values unsafe in a filename are made safe", () => {
  assert.equal(
    filteredFilename("prime_payments", { kind: "settlement cycle" }),
    "prime_payments_settlement-cycle.csv",
  );
  assert.equal(filteredFilename("x", { a: "a/b:c" }), "x_a-b-c.csv");
});

test("empty filter values are ignored", () => {
  assert.equal(filteredFilename("x", { a: "", b: "keep" }), "x_keep.csv");
});
