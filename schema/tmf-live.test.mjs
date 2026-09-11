/**
 * Tests for the live tier — the Buybacks & Burn tab reading settle-api.
 *
 * Run with `pnpm test`. No framework, no network: the API document is a
 * fixture captured from the live service, and the failure paths stub `fetch`.
 *
 * What is worth asserting here is the seam between the two tiers, because that
 * is where this differs from every other dataset in the repo:
 *
 *   - the API's document satisfies the same validator the committed file does,
 *     which is the assumption the whole design rests on;
 *   - a failing fetch yields null rather than throwing, so a build with no
 *     network still renders;
 *   - the fallback says it fell back — a snapshot that renders like live data
 *     without saying so is the actual hazard, not the outage.
 */
import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import test from "node:test";

import { validateTmf } from "../src/lib/dataset-schema.ts";
import { resolveTmf } from "../src/lib/load.ts";
import { fetchTmf } from "../src/lib/tmf/api.ts";

const fixture = () =>
  JSON.parse(
    fs.readFileSync(
      path.join(import.meta.dirname, "fixtures", "tmf-history-api.json"),
      "utf8",
    ),
  );

/* ------------------------------------------------------- the API document */

test("tmf api: the live document passes the same validator as the committed file", () => {
  const doc = validateTmf(fixture());
  assert.equal(doc.schema_version, "1.1.0");
  assert.ok(doc.periods.monthly.length > 0);
  assert.ok(doc.totals.usds_total > 0);
});

test("tmf api: the document carries the producing run", () => {
  // The snapshot has no run — it is written from settlement-reports — so the
  // view keys "live vs snapshot" off the tier, not off this field. It is still
  // what the provenance line shows when present.
  const doc = fixture();
  assert.equal(typeof doc.run.run_id, "number");
  assert.equal(typeof doc.run.finished_at, "string");
  assert.equal(doc.generated_at, doc.run.finished_at, "generated_at is the run's time, not request time");
});

test("tmf api: the extra `run` key does not disturb validation", () => {
  const withRun = fixture();
  const withoutRun = fixture();
  delete withoutRun.run;
  assert.ok(validateTmf(withRun));
  assert.ok(validateTmf(withoutRun));
});

/* ------------------------------------------------------------- the fetch */

/** Swaps global fetch for the duration of one call. */
async function withFetch(impl, fn) {
  const original = globalThis.fetch;
  globalThis.fetch = impl;
  try {
    return await fn();
  } finally {
    globalThis.fetch = original;
  }
}

test("tmf api: a thrown fetch returns null rather than propagating", async () => {
  const result = await withFetch(
    () => {
      throw new Error("getaddrinfo ENOTFOUND");
    },
    fetchTmf,
  );
  assert.equal(result, null);
});

test("tmf api: a non-200 returns null", async () => {
  const result = await withFetch(
    async () => new Response("upstream is down", { status: 503, statusText: "Service Unavailable" }),
    fetchTmf,
  );
  assert.equal(result, null);
});

test("tmf api: a 200 carrying the wrong shape returns null", async () => {
  // The failure a live source adds over a committed one: nobody reviewed this
  // payload in a pull request, so a renamed field arrives as a healthy 200.
  const broken = fixture();
  broken.periods.monthly[0].usds_buyback = "367500";
  const result = await withFetch(
    async () => new Response(JSON.stringify(broken), { status: 200 }),
    fetchTmf,
  );
  assert.equal(result, null);
});

test("tmf api: a good response comes back validated", async () => {
  const result = await withFetch(
    async () => new Response(JSON.stringify(fixture()), { status: 200 }),
    fetchTmf,
  );
  assert.ok(result);
  assert.equal(result.schema_version, "1.1.0");
});

/* ---------------------------------------------------------- the two tiers */

test("tmf tiers: a live document is served as the api tier", () => {
  const { data, source, fetchedAt } = resolveTmf(fixture());
  assert.equal(source, "api");
  assert.equal(data.run.run_id, fixture().run.run_id);
  assert.ok(Date.parse(fetchedAt) > 0);
});

test("tmf tiers: a document with no periods does not displace the snapshot", () => {
  // Type-valid and substantively empty — a run that finished with an empty
  // backfill. validateTmf passes it, so the tier check is what has to refuse.
  const empty = fixture();
  empty.periods = { monthly: [], quarterly: [], annual: [] };
  assert.ok(validateTmf(empty), "still type-valid, which is the point");
  assert.equal(resolveTmf(empty).source, "snapshot");
});

test("tmf tiers: a document behind the snapshot does not displace it", () => {
  // The API is meant to run ahead of a file refreshed monthly, so a lower
  // block height is an upstream regression, not fresher data.
  const behind = fixture();
  behind.source.to_block = 1;
  assert.equal(resolveTmf(behind).source, "snapshot");
});

test("tmf: a malformed run is rejected rather than rendered as undefined", () => {
  const renamed = fixture();
  delete renamed.run.run_id;
  renamed.run.id = 3;
  assert.throws(() => validateTmf(renamed), /run\.run_id/);

  const notAnObject = fixture();
  notAnObject.run = "3";
  assert.throws(() => validateTmf(notAnObject), /run should be an object/);
});

test("tmf: a bad API payload blames the API, not the committed file", () => {
  const broken = fixture();
  broken.totals.usds_total = "164857000";
  assert.throws(
    () => validateTmf(broken, { label: "the settle-api response", remedy: "check the API" }),
    (e) => {
      assert.match(e.message, /the settle-api response/);
      assert.doesNotMatch(e.message, /data\/generated\/tmf\.json/);
      assert.doesNotMatch(e.message, /pnpm refresh/);
      return true;
    },
  );
});

test("tmf tiers: null falls back to the committed snapshot and says so", () => {
  const { data, source } = resolveTmf(null);
  assert.equal(source, "snapshot");
  // The real committed file, validated on the way out like any other dataset.
  const committed = JSON.parse(
    fs.readFileSync(
      path.join(import.meta.dirname, "..", "data", "generated", "tmf.json"),
      "utf8",
    ),
  );
  assert.equal(data.source.to_block, committed.source.to_block);
  assert.equal(data.run, undefined, "the snapshot carries no run");
});
