import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { comparisonGroups, componentRows, trendRows } from "./charts.ts";
import { addMoney } from "./decimal.ts";
import { metrics } from "./domain.ts";
import { validateLatest } from "./schema.ts";

const estimate = validateLatest(JSON.parse(readFileSync("schema/fixtures/daily-revenue/grove.json", "utf8")), "grove").data;

test("a single observation remains a point with null gaps in chronological order", () => {
  const rows = trendRows({ start: "2026-09-14", end: "2026-09-16", results: [estimate] });
  assert.deepEqual(rows.map((r) => r.cutoff), ["2026-09-14", "2026-09-15", "2026-09-16"]);
  assert.equal(rows[0].prime, null);
  assert.equal(rows[2].sky, null);
  assert.equal(rows[1].exact?.prime, metrics(estimate).prime);
  assert.equal(trendRows({ start: "2026-09-14", end: "2026-09-16", results: [] }).every((r) => r.exact === null), true);
});

test("components reconcile exactly, preserving negative values and reported rewards", () => {
  const revised = { ...estimate, result: { ...estimate.result, gar: "-123.45", distribution_rewards: "987.65" } };
  const rows = componentRows(revised);
  assert.equal(addMoney(rows.map((r) => r.exact)), metrics(revised).prime);
  assert.equal(rows.find((r) => r.name === "GAR")?.amount, -123.45);
  assert.equal(rows.find((r) => r.name === "Distribution rewards")?.exact, "987.65");
});

test("comparison separates different cutoffs and months without adding missing primes", () => {
  const groups = comparisonGroups([estimate, { ...estimate, prime: "spark", cutoff: "2026-09-14" }, { ...estimate, prime: "keel", cutoff: "2026-08-31" }]);
  assert.deepEqual(groups.map((g) => g.cutoff), ["2026-09-15", "2026-09-14", "2026-08-31"]);
  assert.equal(groups.every((g) => g.rows.length === 1), true);
  assert.equal(groups[0].rows[0].exact.prime, metrics(estimate).prime);
  assert.deepEqual(comparisonGroups([]), []);
});
