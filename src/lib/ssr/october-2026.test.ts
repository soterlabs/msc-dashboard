import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { validateDr, validateSkyTotal, validateSsr } from "../dataset-schema.ts";

const load = (name: string) => JSON.parse(readFileSync(`data/generated/${name}.json`, "utf8"));
const ssr = validateSsr(load("ssr"));
const dr = validateDr(load("dr"));
const skyTotal = validateSkyTotal(load("sky-total"));
const PRIMES = ["grove", "keel", "obex", "osero", "skybase", "spark"];

test("October 2026 is published for every prime, Sky total and DR", () => {
  assert.equal(ssr.months.at(-1), "2026-10");
  for (const partner of PRIMES) {
    assert.ok(ssr.reports.some((r) => r.partner === partner && r.month === "2026-10"), partner);
  }
  assert.ok(skyTotal.months.includes("2026-10"));
  assert.equal(dr.reportMonths.at(-1), "2026-10");
  assert.equal(dr.ratesAsOf, "2026-10-31");
});

test("October DR on the DR tab equals the DR each settlement used", () => {
  // Settlement summaries round each prime's full-precision sum once; the DR
  // tab sums cent-rounded ref codes, so the two may differ by a few cents.
  for (const [partner, group] of [["spark", "Spark"], ["grove", "Grove"], ["osero", "Osero"], ["skybase", "Skybase"]]) {
    const settled = ssr.reports.find((r) => r.partner === partner && r.month === "2026-10")!.headline.distributionRewards!;
    const tab = dr.summaryGroups.find((g) => g.group === group)!.monthly["2026-10"]!;
    assert.ok(Math.abs(settled - tab) <= 0.1, `${partner}: settled ${settled} vs tab ${tab}`);
  }
  // The whole month matches the finalized snapshot manifest total ($1,227,426.38).
  const total = dr.refCodeRows.reduce((a, r) => a + (r.monthly["2026-10"] ?? 0), 0);
  assert.ok(Math.abs(total - 1227426.38) < 0.5, String(total));
});

test("reporting-only income is carried beside, never inside, venue revenue", () => {
  const spark = ssr.reports.find((r) => r.partner === "spark" && r.month === "2026-10")!;
  const rlusd = spark.excludedVenues.find((v) => v.id === "S67")!;
  assert.equal(rlusd.reportedRevenue, 1449231.75);
  assert.equal(rlusd.receipts, 1588290);
  assert.ok(!spark.venues.some((v) => v.id === "S67"));
  // Older position-only rows have no income fields at all.
  const sept = ssr.reports.find((r) => r.partner === "spark" && r.month === "2026-09")!;
  assert.ok(sept.excludedVenues.every((v) => v.reportedRevenue === undefined));
});

test("October reconciliations are parsed from their explicit layouts", () => {
  const grove = ssr.reports.find((r) => r.partner === "grove" && r.month === "2026-10")!.reconciliation!;
  assert.equal(grove.items.find((i) => i.label === "Total MSC adjustments · Sky")?.value, 1135869.94);
  assert.equal(grove.items.find((i) => i.label === "Total MSC adjustments · Grove")?.value, 822268.24);
  const osero = ssr.reports.find((r) => r.partner === "osero" && r.month === "2026-10")!.reconciliation!;
  assert.equal(osero.items[0].value, 5514);
});

test("the DR tab keeps agreeing with settled DR in every month, history included", () => {
  // Settled months are frozen at their published DR; the DR pipeline's later
  // in-place restatements are booked by settlements as separate true-ups.
  for (const [partner, group] of [["spark", "Spark"], ["grove", "Grove"], ["osero", "Osero"], ["skybase", "Skybase"]]) {
    for (const month of dr.reportMonths) {
      const settled = ssr.reports.find((r) => r.partner === partner && r.month === month)?.headline.distributionRewards;
      const tab = dr.summaryGroups.find((g) => g.group === group)?.monthly[month];
      if (settled == null || tab == null) continue;
      assert.ok(Math.abs(settled - tab) <= 0.05, `${partner} ${month}: settled ${settled} vs tab ${tab}`);
    }
  }
  assert.equal(dr.historyMonths[0], "2024-09");
});
