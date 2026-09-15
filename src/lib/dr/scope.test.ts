import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { scopeDr } from "./scope.ts";
import { validateDr } from "../dataset-schema.ts";

const source = validateDr(JSON.parse(readFileSync("data/generated/dr.json", "utf8")));

test("every prime/month slice keeps ledger, token details and totals within its boundary", () => {
  const before = JSON.stringify(source);
  for (const group of ["Spark", "Grove", "Keel", "Osero", "Obex"]) {
    for (const month of source.reportMonths) {
      const scoped = scopeDr(source, group, month);
      validateDr(scoped);
      assert.deepEqual(scoped.reportMonths, [month]);
      assert.deepEqual(scoped.historyMonths, [month]);
      const expected = source.refCodeRows.filter((r) => r.group === group && r.monthly[month] != null);
      assert.deepEqual(scoped.refCodeRows.map((r) => r.refCode), expected.map((r) => r.refCode));
      for (const row of scoped.refCodeRows) {
        const original = expected.find((r) => r.refCode === row.refCode)!;
        assert.equal(row.total, original.monthly[month]);
        assert.deepEqual(Object.keys(row.monthly), [month]);
        const tokens = scoped.refCodeTokenSeries.filter((s) => s.refCode === row.refCode);
        assert.deepEqual(row.tokens, tokens.filter((s) => s.total !== 0).map((s) => s.token));
      }
      for (const series of scoped.refCodeTokenSeries) {
        assert.ok(expected.some((r) => r.refCode === series.refCode));
        assert.deepEqual(Object.keys(series.monthly), [month]);
        assert.equal(series.total, series.monthly[month]);
      }
    }
  }
  assert.equal(JSON.stringify(source), before);
});

test("a month without DR stays empty instead of showing another month's rewards", () => {
  const scoped = scopeDr(source, "Spark", "2099-01");
  assert.deepEqual(scoped.refCodeRows, []);
  assert.deepEqual(scoped.refCodeTokenSeries, []);
  assert.deepEqual(scoped.historyMonths, ["2099-01"]);
});

test("reported zero survives while missing monthly values are excluded", () => {
  const fixture = structuredClone(source);
  const row = fixture.refCodeRows.find((r) => r.group === "Spark")!;
  const month = source.reportMonths[0];
  row.monthly[month] = 0;
  assert.equal(scopeDr(fixture, "Spark", month).refCodeRows.find((r) => r.refCode === row.refCode)?.total, 0);
  row.monthly[month] = null;
  assert.ok(!scopeDr(fixture, "Spark", month).refCodeRows.some((r) => r.refCode === row.refCode));
});
