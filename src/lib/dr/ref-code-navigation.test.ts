import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { validateDr } from "../dataset-schema.ts";
import { scopeDr } from "./scope.ts";
import { latestRefCodeMonth, refCodeFragment, refCodeFromFragment } from "./ref-code-navigation.ts";

const dr = validateDr(JSON.parse(readFileSync("data/generated/dr.json", "utf8")));

test("legacy Grove 2002 links target April, where the row and token details exist", () => {
  const month = latestRefCodeMonth(dr, "2002");
  assert.equal(month, "2026-04");
  const scoped = scopeDr(dr, "Grove", month!);
  assert.equal(scoped.refCodeRows.find((r) => r.refCode === "2002")?.total, 116737.37);
  assert.ok(scoped.refCodeTokenSeries.some((r) => r.refCode === "2002"));
  assert.equal(refCodeFromFragment(refCodeFragment("2002")), "2002");
});

test("every code destination contains its row, including reported zero", () => {
  for (const row of dr.refCodeRows) {
    const month = latestRefCodeMonth(dr, row.refCode);
    if (month) assert.ok(scopeDr(dr, row.group, month).refCodeRows.some((r) => r.refCode === row.refCode));
  }
  const fixture = structuredClone(dr);
  fixture.refCodeRows.find((r) => r.refCode === "2002")!.monthly["2026-08"] = 0;
  assert.equal(latestRefCodeMonth(fixture, "2002"), "2026-08");
  assert.equal(latestRefCodeMonth(dr, "not-a-code"), undefined);
});

test("fragment parsing tolerates unrelated, empty and malformed fragments", () => {
  assert.equal(refCodeFromFragment("#distribution-rewards"), null);
  assert.equal(refCodeFromFragment("#ref-code-"), null);
  assert.equal(refCodeFromFragment("#ref-code-%ZZ"), null);
  assert.equal(refCodeFromFragment(refCodeFragment("code / 1")), "code / 1");
});
