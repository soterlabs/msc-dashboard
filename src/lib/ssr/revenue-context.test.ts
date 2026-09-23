import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { validateDr, validateSsr } from "../dataset-schema.ts";
import { scopeDr } from "../dr/scope.ts";
import { compareRewards, revenueMonths } from "./revenue-context.ts";

const dr = validateDr(JSON.parse(readFileSync("data/generated/dr.json", "utf8")));
const ssr = validateSsr(JSON.parse(readFileSync("data/generated/ssr.json", "utf8")));

test("Osero's DR-only months remain reachable before its first settlement", () => {
  const months = revenueMonths(ssr, dr, "osero", "Osero");
  assert.ok(months.includes("2026-01"));
  assert.ok(months.includes("2026-06"));
  assert.ok(!ssr.reports.some((r) => r.partner === "osero" && r.month === "2026-01"));
  const january = scopeDr(dr, "Osero", "2026-01");
  assert.equal(january.refCodeRows.find((r) => r.refCode === "3333")?.total, 0.71);
  assert.ok(january.refCodeTokenSeries.some((r) => r.refCode === "3333"));
  assert.equal(compareRewards(january, undefined).settled, null);
});

test("month options are sorted, unique and specific to the prime's data", () => {
  const months = revenueMonths(ssr, dr, "obex", "Obex");
  assert.deepEqual(months, [...new Set(ssr.reports.filter((r) => r.partner === "obex").map((r) => r.month))].sort());
  assert.ok(!months.includes("2099-01"));
  const fixture = structuredClone(dr);
  fixture.reportMonths.push("2099-01");
  fixture.refCodeRows.find((r) => r.group === "Osero")!.monthly["2099-01"] = 0;
  assert.ok(revenueMonths(ssr, fixture, "osero", "Osero").includes("2099-01"));
  assert.ok(!revenueMonths(ssr, fixture, "spark", "Spark").includes("2099-01"));
});

test("Keel August compares calculated rewards with settled zero without replacing it", () => {
  const report = ssr.reports.find((r) => r.partner === "keel" && r.month === "2026-08")!;
  assert.deepEqual(compareRewards(scopeDr(dr, "Keel", "2026-08"), report.headline.distributionRewards), {
    calculated: 1530.91, settled: 0, difference: 1530.91,
  });
  assert.equal(report.headline.primeAgentProfit, 31775.77);
});

test("missing calculated or settled data cannot become a zero discrepancy", () => {
  assert.deepEqual(compareRewards(scopeDr(dr, "Obex", "2026-08"), 0), {
    calculated: null, settled: 0, difference: null,
  });
  assert.equal(compareRewards(scopeDr(dr, "Keel", "2026-08"), null).difference, null);
  const scoped = scopeDr(dr, "Keel", "2026-08");
  scoped.refCodeRows.forEach((r) => { r.total = 0; });
  assert.deepEqual(compareRewards(scoped, 0), { calculated: 0, settled: 0, difference: 0 });
});
