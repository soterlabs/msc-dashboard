import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buckets, chargeRows, publicationChanges, trendRows } from "./charts.ts";
import { addMoney, divideMoney, usd, usdWhole } from "./decimal.ts";
import { metrics } from "./domain.ts";
import { validateLatest } from "./schema.ts";
import type { Estimate } from "./types.ts";

const estimate = validateLatest(JSON.parse(readFileSync("schema/fixtures/daily-revenue/grove.json", "utf8")), "grove").data;

test("a single observation remains a point with null gaps in chronological order", () => {
  const rows = trendRows({ start: "2026-09-14", end: "2026-09-16", results: [estimate] });
  assert.deepEqual(rows.map((r) => r.cutoff), ["2026-09-14", "2026-09-15", "2026-09-16"]);
  assert.equal(rows[0].prime, null);
  assert.equal(rows[1].exact, metrics(estimate).prime);
  assert.equal(trendRows({ start: "2026-09-14", end: "2026-09-16", results: [] }).every((r) => r.exact === null), true);
});

test("weeks start on Monday and clipped periods say how many days they hold", () => {
  const weeks = buckets({ from: "2026-09-02", to: "2026-09-15" }, "week");
  assert.deepEqual(weeks.map((w) => [w.start, w.end, w.days, w.full]), [["2026-09-02", "2026-09-06", 5, 7], ["2026-09-07", "2026-09-13", 7, 7], ["2026-09-14", "2026-09-15", 2, 7]]);
  const months = buckets({ from: "2026-01-20", to: "2026-03-02" }, "month");
  assert.deepEqual(months.map((m) => [m.start, m.days, m.full]), [["2026-01-20", 12, 31], ["2026-02-01", 28, 28], ["2026-03-01", 2, 31]]);
  assert.equal(buckets({ from: "2026-09-01", to: "2026-09-15" }, "day").length, 15);
});

test("period sums are exact, reconcile with the daily rows and leave unpublished periods null", () => {
  const range = { from: "2026-08-31", to: "2026-09-15" };
  const rows = chargeRows([{ key: "grove", days: estimate.days }, { key: "obex", days: [] }], range, "week");
  assert.equal(rows[0].exact.grove, estimate.days[0].charge.length ? addMoney(estimate.days.slice(0, 6).map((d) => d.charge)) : null);
  assert.equal(rows[0].published.grove, 6);
  assert.equal(rows[0].exact.obex, null);
  assert.equal(addMoney(rows.map((r) => r.total!)), addMoney(estimate.days.map((d) => d.charge)));
  const empty = chargeRows([{ key: "grove", days: estimate.days }], { from: "2026-08-20", to: "2026-08-25" }, "day");
  assert.equal(empty.every((r) => r.total === null && r.grove === null), true);
});

test("a non-terminating average stays a formattable decimal", () => {
  assert.equal(usd(divideMoney("100", 3)), "$33.33");
  assert.equal(usdWhole("2706781078.5"), "$2 706 781 079");
  assert.equal(usdWhole("-0.4"), "$0");
});

test("publication changes reconcile components and leave gaps and month resets unknown", () => {
  const at = (cutoff: string, supply: string, demand: string): Estimate => ({
    ...estimate, cutoff, result: { ...estimate.result, prime_agent_revenue: supply, agent_rate: demand, distribution_rewards: "0", chronicle_points: "0", gar: "0" },
  });
  const history = { start: "2026-09-01", end: "2026-09-04", results: [at("2026-09-01", "100", "10"), at("2026-09-02", "90", "12"), at("2026-09-04", "200", "15")] };
  const rows = publicationChanges(history);
  assert.deepEqual(rows.map((r) => r.exact?.prime ?? null), [null, "-8", null, null]);
  assert.equal(rows[1].exact!.prime, addMoney([rows[1].exact!.supply, rows[1].exact!.demand]));
  const crossMonth = publicationChanges({ ...history, start: "2026-08-31", end: "2026-09-01", results: [at("2026-08-31", "900", "90"), history.results[0]] });
  assert.equal(crossMonth[1].exact, null);
  assert.equal(publicationChanges({ ...history, start: "2026-09-02", end: "2026-09-02" })[0].exact!.prime, "-8");
});
