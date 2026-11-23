import assert from "node:assert/strict";
import test from "node:test";
import { paths } from "../routes.ts";
import { parseDailyRoute } from "./routes.ts";
import { dailyMonths, latestDailyMonth } from "./calendar.ts";

// Fixed clock: October 29 UTC, when the latest completed day is October 28.
const OCT = new Date("2026-10-29T12:00:00Z");

test("canonical daily revenue paths carry month, prime and venue ID", () => {
  assert.equal(paths.dailyRevenue(), `/daily-revenue/${latestDailyMonth()}`);
  assert.equal(paths.dailyRevenue("2026-09", "spark"), "/daily-revenue/2026-09/spark");
  assert.equal(paths.dailyRevenue("2026-09", "spark", "S1/a"), "/daily-revenue/2026-09/spark/S1%2Fa");
  assert.deepEqual(parseDailyRoute(["2026-09"], undefined, OCT), { month: "2026-09", prime: undefined, allocation: undefined });
  assert.deepEqual(parseDailyRoute(["2026-09", "spark", "S1"], undefined, OCT), { month: "2026-09", prime: "spark", allocation: "S1" });
});

test("legacy paths redirect and unsupported or malformed paths fail", () => {
  assert.deepEqual(parseDailyRoute([], undefined, OCT), { redirectTo: "/daily-revenue/2026-10" });
  assert.deepEqual(parseDailyRoute(["spark"], "2026-09", OCT), { redirectTo: "/daily-revenue/2026-09/spark" });
  assert.deepEqual(parseDailyRoute(["spark", "2026-09"], undefined, OCT), { redirectTo: "/daily-revenue/2026-09/spark" });
  for (const path of [["2026-08"], ["2026-09", "unknown"], ["2026-09", "spark", "S1", "extra"]]) assert.equal(parseDailyRoute(path, undefined, OCT), null);
  assert.equal(parseDailyRoute(["spark"], "2026-08", OCT), null);
  assert.equal(parseDailyRoute([], ["2026-09"], OCT), null);
});

test("October routes preserve month and reject conflicting legacy queries", () => {
  assert.deepEqual(parseDailyRoute(["2026-10", "grove", "E42"], undefined, OCT), { month: "2026-10", prime: "grove", allocation: "E42" });
  assert.deepEqual(parseDailyRoute(["spark"], "2026-10", OCT), { redirectTo: "/daily-revenue/2026-10/spark" });
  assert.deepEqual(parseDailyRoute([], "2026-09", OCT), { redirectTo: "/daily-revenue/2026-09" });
  assert.deepEqual(parseDailyRoute(["grove", "2026-10"], undefined, OCT), { redirectTo: "/daily-revenue/2026-10/grove" });
  assert.equal(parseDailyRoute(["2026-10"], "2026-09", OCT), null);
  assert.equal(parseDailyRoute(["2026-11"], undefined, OCT), null);
});

test("months advance with completed UTC days, never ahead of them", () => {
  // November appears once November 1 has closed, not while it is still open.
  assert.deepEqual(dailyMonths(new Date("2026-11-01T23:59:59Z")), ["2026-09", "2026-10"]);
  assert.deepEqual(dailyMonths(new Date("2026-11-02T00:00:00Z")), ["2026-09", "2026-10", "2026-11"]);
  assert.equal(latestDailyMonth(new Date("2026-11-23T12:00:00Z")), "2026-11");
  // Year boundary: December then January, from the calendar rule alone.
  assert.deepEqual(dailyMonths(new Date("2027-01-05T00:00:00Z")).slice(-2), ["2026-12", "2027-01"]);
  assert.deepEqual(dailyMonths(new Date("2026-09-01T12:00:00Z")), []);
  assert.equal(latestDailyMonth(new Date("2026-09-01T12:00:00Z")), "2026-09");
});

test("November routes resolve, reset to November and reject future months", () => {
  const NOV = new Date("2026-11-23T12:00:00Z");
  assert.deepEqual(parseDailyRoute([], undefined, NOV), { redirectTo: "/daily-revenue/2026-11" });
  assert.deepEqual(parseDailyRoute(["spark"], undefined, NOV), { redirectTo: "/daily-revenue/2026-11/spark" });
  assert.deepEqual(parseDailyRoute(["2026-11", "grove", "E42"], undefined, NOV), { month: "2026-11", prime: "grove", allocation: "E42" });
  // September and October links keep working once November exists.
  assert.deepEqual(parseDailyRoute(["2026-09", "spark"], undefined, NOV), { month: "2026-09", prime: "spark", allocation: undefined });
  assert.deepEqual(parseDailyRoute(["2026-10"], undefined, NOV), { month: "2026-10", prime: undefined, allocation: undefined });
  for (const month of ["2026-12", "2026-08", "2026-1", "2026-13", "abcd-ef"]) assert.equal(parseDailyRoute([month], undefined, NOV), null);
  assert.equal(parseDailyRoute([], "2026-12", NOV), null);
});
