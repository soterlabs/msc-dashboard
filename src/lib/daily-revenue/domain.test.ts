import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { allocationSeries, portfolioPoints, primeSeries } from "./domain.ts";
import { validateLatest } from "./schema.ts";
import type { Allocation, DailyPrime, Estimate, History } from "./types.ts";

const fixture = (name = "grove") => JSON.parse(readFileSync(`schema/fixtures/daily-revenue/${name}.json`, "utf8"));
const base = validateLatest(fixture(), "grove").data;
const venue = (id: string, revenue: string, hidden = false): Allocation => ({ venue_id: id, label: `Allocation ${id}`, revenue,
  actual_revenue: "999", external_revenue: "123", sd_revenue: "10", hide_per_venue_pnl: hidden, pricing_category: "new" });
const estimate = (date: string, rows: Allocation[] | null, prime: DailyPrime = "grove", revision = date.slice(-2).padStart(64, "0")): Estimate => ({
  ...base, prime, cutoff: date, revision_id: revision, result: { venue_breakdown: rows, prime_agent_revenue: "999999" },
});
const history = (rows: Estimate[]): History => ({ results: rows, start: "2026-09-01", end: "2026-09-05" });

test("allocation daily changes use only consecutive MTD observations", () => {
  const h = history([
    estimate("2026-09-05", [venue("A", "175")]),
    estimate("2026-09-04", [venue("A", "180")]),
    estimate("2026-09-02", [venue("A", "130")]),
    estimate("2026-09-01", [venue("A", "100")]),
  ]);
  assert.deepEqual(allocationSeries(h, "grove").eligible[0].points.map((p) => p.daily), ["100", "30", null, null, "-5"]);
});

test("late and closed allocations stay in the union but missing membership is unknown", () => {
  const h = history([
    estimate("2026-09-03", [venue("late", "5")]),
    estimate("2026-09-02", [venue("closed", "12")]),
    estimate("2026-09-01", [venue("closed", "10")]),
  ]);
  const catalog = allocationSeries(h, "grove").eligible;
  assert.deepEqual(catalog.map((a) => a.venueId), ["closed", "late"]);
  assert.equal(catalog[0].points[2].mtd, null);
  assert.equal(catalog[1].points[2].daily, null);
  assert.equal(primeSeries(h, "grove").points.every((p) => p.mtd === null), true);
});

test("hidden allocations and non-allocation prime fields never affect displayed totals", () => {
  const h = history([estimate("2026-09-01", [venue("shown", "100"), venue("hidden", "500", true)])]);
  const p = primeSeries(h, "grove");
  assert.equal(p.allocations.length, 1);
  assert.equal(p.hidden.length, 1);
  assert.equal(p.points[0].mtd, "100");
  assert.notEqual(p.points[0].mtd, h.results[0].result.prime_agent_revenue);
  assert.notEqual(p.points[0].mtd, "223"); // external_revenue was not added again
});

test("portfolio totals require every prime on the same date", () => {
  const complete = (prime: DailyPrime, amount: string) => primeSeries(history([estimate("2026-09-01", [venue("same-id", amount)], prime)]), prime);
  const points = portfolioPoints([complete("grove", "10"), complete("spark", "20")]);
  assert.equal(points[0].mtd, "30");
  assert.equal(points[0].coverage, 2);
  const missing = primeSeries(history([]), "spark");
  assert.equal(portfolioPoints([complete("grove", "10"), missing])[0].mtd, null);
});

test("venue parsing keeps exact decimals and rejects duplicates or malformed money", () => {
  const raw = fixture("grove");
  raw.data.result.venue_breakdown = [venue("A", "1"), venue("B", "2")];
  raw.data.result.venue_breakdown[0].revenue = "0E-19";
  assert.equal(validateLatest(raw, "grove").data.result.venue_breakdown?.[0].revenue, "0E-19");
  const duplicate = fixture("grove");
  duplicate.data.result.venue_breakdown = [venue("A", "1"), venue("B", "2")];
  duplicate.data.result.venue_breakdown[1].venue_id = duplicate.data.result.venue_breakdown[0].venue_id;
  assert.throws(() => validateLatest(duplicate, "grove"), /Duplicate/);
  const malformed = fixture("grove"); malformed.data.result.venue_breakdown = [venue("A", "1")]; malformed.data.result.venue_breakdown[0].external_revenue = null;
  assert.throws(() => validateLatest(malformed, "grove"));
});

test("an absent breakdown is unavailable rather than an empty zero book", () => {
  const raw = fixture("grove"); delete raw.data.result.venue_breakdown;
  const parsed = validateLatest(raw, "grove").data;
  assert.equal(parsed.result.venue_breakdown, null);
  const p = primeSeries(history([parsed]), "grove");
  assert.equal(p.breakdownAvailable, false);
  assert.equal(p.points.every((point) => point.mtd === null), true);
});
