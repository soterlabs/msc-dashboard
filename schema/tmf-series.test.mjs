/**
 * Tests for the derived series behind the Buybacks & Burn chart.
 *
 * Both are pure and both fix a specific misreading:
 *
 *   fillGaps      — upstream publishes a period only when something happened
 *                   in it, so the raw series jumps from 2024-11 to 2025-02 and
 *                   a bar chart drew those side by side, as if consecutive.
 *   dailyPeriods  — the document has no sub-monthly rows at all; daily is
 *                   aggregated here from the per-kick endpoint.
 */
import assert from "node:assert/strict";
import test from "node:test";

import { aggregateKicks, dailyPeriods, fillGaps } from "../src/lib/tmf/domain.ts";

const period = (p, over = {}) => ({
  period: p,
  kicks: 1,
  usds_buyback: 0,
  usds_to_stakers: 0,
  usds_total: 0,
  sky_bought: 0,
  sky_avg_price: null,
  sky_burn_protocol: 0,
  sky_burn_other: 0,
  burn_events: 0,
  first_ts: null,
  last_ts: null,
  ...over,
});

/* --------------------------------------------------------------- fillGaps */

test("fillGaps: the real Nov 2024 → Feb 2025 jump is filled", () => {
  const filled = fillGaps([period("2024-11"), period("2025-02")], "monthly");
  assert.deepEqual(
    filled.map((r) => r.period),
    ["2024-11", "2024-12", "2025-01", "2025-02"],
  );
  // The inserted months are empty, not absent: a bar of zero says the engine
  // was idle, where a missing bar says nothing at all.
  assert.equal(filled[1].kicks, 0);
  assert.equal(filled[1].usds_total, 0);
  assert.equal(filled[1].sky_avg_price, null, "no trade to price");
});

test("fillGaps: crosses a year boundary", () => {
  const filled = fillGaps([period("2024-11"), period("2025-01")], "monthly");
  assert.deepEqual(filled.map((r) => r.period), ["2024-11", "2024-12", "2025-01"]);
});

test("fillGaps: quarters and years use their own step", () => {
  assert.deepEqual(
    fillGaps([period("2024-Q4"), period("2025-Q3")], "quarterly").map((r) => r.period),
    ["2024-Q4", "2025-Q1", "2025-Q2", "2025-Q3"],
  );
  assert.deepEqual(
    fillGaps([period("2024"), period("2026")], "annual").map((r) => r.period),
    ["2024", "2025", "2026"],
  );
});

test("fillGaps: daily fills by calendar date, month ends included", () => {
  const filled = fillGaps([period("2026-01-30"), period("2026-02-02")], "daily");
  assert.deepEqual(
    filled.map((r) => r.period),
    ["2026-01-30", "2026-01-31", "2026-02-01", "2026-02-02"],
  );
});

test("fillGaps: leaves an already-dense series alone, and is a no-op below two rows", () => {
  const dense = [period("2026-01"), period("2026-02")];
  assert.equal(fillGaps(dense, "monthly").length, 2);
  assert.equal(fillGaps([period("2026-01")], "monthly").length, 1);
  assert.equal(fillGaps([], "monthly").length, 0);
});

test("fillGaps: does not disturb the rows it keeps", () => {
  const real = period("2025-02", { usds_total: 4280000, kicks: 428 });
  const filled = fillGaps([period("2024-11"), real], "monthly");
  assert.equal(filled.at(-1).usds_total, 4280000);
  assert.equal(filled.at(-1).kicks, 428);
});

/* ----------------------------------------------------------- daily series */

const kick = (ts, over = {}) => ({
  ts,
  usds_total: 6000,
  usds_buyback: 3300,
  usds_to_stakers: 2700,
  sky_bought: 50000,
  ...over,
});

test("dailyPeriods: buckets by UTC day, oldest first", () => {
  const rows = dailyPeriods([
    kick("2026-09-10T23:59:00Z"),
    kick("2026-09-11T00:01:00Z"),
    kick("2026-09-09T12:00:00Z"),
  ]);
  assert.deepEqual(rows.map((r) => r.period), ["2026-09-09", "2026-09-10", "2026-09-11"]);
});

test("dailyPeriods: sums the legs and keeps the total consistent", () => {
  const [row] = dailyPeriods([kick("2026-09-11T01:00:00Z"), kick("2026-09-11T05:00:00Z")]);
  assert.equal(row.kicks, 2);
  assert.equal(row.usds_buyback, 6600);
  assert.equal(row.usds_to_stakers, 5400);
  assert.equal(row.usds_total, 12000);
  assert.equal(row.usds_buyback + row.usds_to_stakers, row.usds_total);
});

test("aggregateKicks: the price is volume-weighted, not a mean of prices", () => {
  // A $600 kick and a $600,000 kick must not weigh the same. Averaging the two
  // per-kick prices would give 0.075; the weighted figure is what the document
  // publishes and what this has to match.
  const row = aggregateKicks(
    [
      kick("2026-09-11T01:00:00Z", { usds_buyback: 600, sky_bought: 6000 }), // 0.10
      kick("2026-09-11T02:00:00Z", { usds_buyback: 600000, sky_bought: 12000000 }), // 0.05
    ],
    "2026-09-11",
  );
  assert.equal(row.sky_avg_price, Math.round((600600 / 12006000) * 1e6) / 1e6);
  assert.ok(row.sky_avg_price < 0.0501, "weighted toward the larger kick");
});

test("aggregateKicks: no kicks means no price and no timestamps", () => {
  const row = aggregateKicks([], "2026-09-11");
  assert.equal(row.kicks, 0);
  assert.equal(row.sky_avg_price, null);
  assert.equal(row.first_ts, null);
  assert.equal(row.last_ts, null);
});

test("aggregateKicks: bounds the window by first and last kick", () => {
  const row = aggregateKicks(
    [kick("2026-09-11T05:00:00Z"), kick("2026-09-11T01:00:00Z")],
    "2026-09-11",
  );
  assert.equal(row.first_ts, "2026-09-11T01:00:00Z");
  assert.equal(row.last_ts, "2026-09-11T05:00:00Z");
});
