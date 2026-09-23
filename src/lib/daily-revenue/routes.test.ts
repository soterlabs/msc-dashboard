import assert from "node:assert/strict";
import test from "node:test";
import { paths } from "../routes.ts";
import { parseDailyRoute } from "./routes.ts";

test("canonical daily revenue paths carry month, prime and venue ID", () => {
  assert.equal(paths.dailyRevenue(), "/daily-revenue/2026-09");
  assert.equal(paths.dailyRevenue("2026-09", "spark"), "/daily-revenue/2026-09/spark");
  assert.equal(paths.dailyRevenue("2026-09", "spark", "S1/a"), "/daily-revenue/2026-09/spark/S1%2Fa");
  assert.deepEqual(parseDailyRoute(["2026-09"]), { month: "2026-09", prime: undefined, allocation: undefined });
  assert.deepEqual(parseDailyRoute(["2026-09", "spark", "S1"]), { month: "2026-09", prime: "spark", allocation: "S1" });
});

test("legacy paths redirect and unsupported or malformed paths fail", () => {
  assert.deepEqual(parseDailyRoute([]), { redirectTo: "/daily-revenue/2026-09" });
  assert.deepEqual(parseDailyRoute(["spark"], "2026-09"), { redirectTo: "/daily-revenue/2026-09/spark" });
  assert.deepEqual(parseDailyRoute(["spark", "2026-09"]), { redirectTo: "/daily-revenue/2026-09/spark" });
  for (const path of [["2026-08"], ["2026-09", "unknown"], ["2026-09", "spark", "S1", "extra"]]) assert.equal(parseDailyRoute(path), null);
  assert.equal(parseDailyRoute(["spark"], "2026-08"), null);
  assert.equal(parseDailyRoute([], ["2026-09"]), null);
});
