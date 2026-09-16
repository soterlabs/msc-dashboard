import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { addMoney, decimal, usd } from "./decimal.ts";
import { monthWindow, yesterday } from "./calendar.ts";
import { distributionNote, mergeHistory, historyDays, metrics, selectedEstimate } from "./domain.ts";
import { validateHistory, validateLatest, validateStatus } from "./schema.ts";
import { DAILY_PRIMES } from "./types.ts";
const fixture = (name: string) => JSON.parse(readFileSync(`schema/fixtures/daily-revenue/${name}.json`, "utf8"));
const grove = validateLatest(fixture("grove"), "grove");

test("all six captured live responses validate and map supply/prime/net P&L distinctly", () => {
  for (const prime of DAILY_PRIMES) {
    const doc = validateLatest(fixture(prime), prime);
    const m = metrics(doc.data);
    assert.equal(doc.data.cutoff, "2026-09-15");
    assert.equal(m.supply, doc.data.result.prime_agent_revenue);
    // Backend P&L is rounded to its Decimal context; reconcile at display precision.
    assert.equal(usd(m.prime), usd(addMoney([doc.data.result.monthly_pnl, doc.data.result.sky_revenue])));
  }
  assert.equal(usd(metrics(grove.data).prime), "$3 837 823.86");
  assert.notEqual(metrics(grove.data).prime, grove.data.result.monthly_pnl);
});

test("decimal sums and rounding remain exact beyond JS safe integers", () => {
  assert.equal(addMoney(["9007199254740993.01", "0.02"]), "9007199254740993.03");
  assert.equal(usd("9007199254740993.015"), "$9 007 199 254 740 993.02");
  assert.equal(usd("-0.005"), "-$0.01");
  assert.equal(usd("-0.0001"), "$0.00");
  assert.equal(usd("0E-18"), "$0.00");
  assert.equal(usd(null), "—");
  for (const bad of [null, "", "NaN", "Infinity", 10, "0x10", "1e10000"]) assert.throws(() => decimal(bad));
});

test("selected-month estimates never borrow another month's earnings at rollover", () => {
  const now = new Date("2026-10-01T00:00:00Z");
  assert.equal(yesterday(now), "2026-09-30");
  assert.equal(monthWindow("2026-10", now), null);
  assert.equal(selectedEstimate("2026-10", null, grove.data), null);
  assert.deepEqual(monthWindow("2026-09", now), { start: "2026-09-01", end: "2026-09-30" });
  assert.deepEqual(monthWindow("2028-02", new Date("2028-03-01Z")), { start: "2028-02-01", end: "2028-02-29" });
  assert.equal(monthWindow("2026-13", now), null);
});

test("history keeps missing dates as null and never sums MTD observations", () => {
  const history = validateHistory(fixture("history"), "grove", "2026-09-01", "2026-09-15");
  const days = historyDays(history);
  assert.equal(days.length, 15);
  assert.equal(days.filter((d) => d.estimate === null).length, 13);
  assert.equal(selectedEstimate("2026-09", history, null)?.revision_id, history.results[0].revision_id);
  assert.equal(days.at(-1)?.estimate, null);
});

test("a later published correction under the same cutoff displaces older revisions", () => {
  const older = structuredClone(grove.data);
  const revised = { ...older, revision_id: "a".repeat(64), publication_order: (older.publication_order ?? 0) + 1, computed_at: "2026-09-15T12:00:00Z" };
  assert.equal(selectedEstimate("2026-09", { results: [revised], start: "2026-09-01", end: "2026-09-15" }, older)?.revision_id, revised.revision_id);
});

test("validators reject wrong prime, wrong month, invalid dates and numeric money", () => {
  assert.throws(() => validateLatest(fixture("grove"), "spark"));
  for (const mutate of [
    (d: ReturnType<typeof fixture>) => { d.data.result.month.month = 8; },
    (d: ReturnType<typeof fixture>) => { d.data.cutoff = "2026-02-30"; },
    (d: ReturnType<typeof fixture>) => { d.data.result.agent_rate = 1; },
    (d: ReturnType<typeof fixture>) => { d.data.provisional = false; },
    (d: ReturnType<typeof fixture>) => { d.schema_version = "2.0"; },
  ]) { const data = fixture("grove"); mutate(data); assert.throws(() => validateLatest(data, "grove")); }
});


test("history and headline share the newest revision even when endpoint caches differ", () => {
  const history = validateHistory(fixture("history"), "grove", "2026-09-01", "2026-09-15");
  const correction = { ...history.results[0], revision_id: "c".repeat(64), publication_order: 999 };
  const merged = mergeHistory(history, correction)!;
  assert.equal(merged.results[0].revision_id, correction.revision_id);
  assert.equal(selectedEstimate("2026-09", merged, correction)?.revision_id, merged.results[0].revision_id);
  assert.notEqual(history.results[0].revision_id, correction.revision_id);
  assert.equal(mergeHistory(merged, history.results[0]), merged);
  assert.equal(mergeHistory(null, correction), null);
  assert.equal(mergeHistory({ ...history, results: [] }, correction)?.results[0].revision_id, correction.revision_id);
  assert.equal(mergeHistory({ ...history, start: "2026-08-01", end: "2026-08-31" }, correction)?.results.length, 2);
});

test("revision ranking stays transitive when publication_order is only sometimes reported", () => {
  const base = { ...grove.data, cutoff: "2026-09-15" };
  const ordered = { ...base, revision_id: "a".repeat(64), publication_order: 9, computed_at: "2026-09-15T10:00:00Z" };
  const unordered = { ...base, revision_id: "b".repeat(64), publication_order: undefined, computed_at: "2026-09-15T11:00:00Z" };
  const newest = { ...base, revision_id: "c".repeat(64), publication_order: 12, computed_at: "2026-09-15T12:00:00Z" };
  const window = { start: "2026-09-01", end: "2026-09-15" };
  // Every input order must name the same winner; a comparator that switches
  // keys per pair lets the sort implementation choose instead.
  for (const results of [[ordered, unordered, newest], [newest, ordered, unordered], [unordered, newest, ordered]])
    assert.equal(selectedEstimate("2026-09", { ...window, results }, null)?.revision_id, newest.revision_id);
});

test("a published estimate carries its own freshness, and a mismatched block never voids it", () => {
  const data = fixture("grove");
  data.freshness = { expected_cutoff: "2026-09-15", actual_cutoff: "2026-09-15", stale: false };
  assert.equal(validateLatest(data, "grove").freshness.stale, false);
  // The pipeline publishes at 20:17 UTC: a D-1 cutoff is current, not behind.
  data.freshness = { expected_cutoff: "2026-09-16", actual_cutoff: "2026-09-16", stale: true };
  const reconciled = validateLatest(data, "grove");
  assert.equal(reconciled.data.cutoff, "2026-09-15");
  assert.equal(reconciled.freshness.actual_cutoff, "2026-09-15");
  assert.equal(reconciled.freshness.stale, true);
});

test("one malformed prime in the status document does not blank the other five", () => {
  const data = fixture("grove");
  const good = { ...data.freshness, latest_attempt: data.latest_attempt };
  const status = validateStatus({ cadence: "daily", ready: true, primes: { grove: null, spark: { stale: "no" }, obex: good, keel: good } });
  assert.deepEqual(Object.keys(status).sort(), ["keel", "obex"]);
  assert.equal(status.obex?.expected_cutoff, data.freshness.expected_cutoff);
});

test("the headline caption follows the distribution rewards the response actually reports", () => {
  assert.equal(grove.data.result.distribution_rewards, "0");
  assert.match(distributionNote(grove.data), /excluded/);
  const withRewards = { ...grove.data, result: { ...grove.data.result, distribution_rewards: "1250.00" } };
  assert.doesNotMatch(distributionNote(withRewards), /excluded/);
  assert.equal(metrics(withRewards).prime, addMoney([metrics(grove.data).prime, "1250.00"]));
});
