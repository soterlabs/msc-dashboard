import assert from "node:assert/strict";
import test from "node:test";
import { monthWindow, monthLabel } from "./calendar.ts";

test("monthly requests stop at the last completed UTC day and respect month boundaries", () => {
  assert.deepEqual(monthWindow("2026-10", new Date("2026-10-29T00:01:00Z")), { start: "2026-10-01", end: "2026-10-28" });
  assert.deepEqual(monthWindow("2026-09", new Date("2026-10-29T00:01:00Z")), { start: "2026-09-01", end: "2026-09-30" });
  assert.equal(monthWindow("2026-10", new Date("2026-10-01T23:59:59Z")), null);
  assert.deepEqual(monthWindow("2026-10", new Date("2026-11-01T00:00:00Z")), { start: "2026-10-01", end: "2026-10-31" });
  assert.equal(monthLabel("2026-10"), "October 2026");
});
