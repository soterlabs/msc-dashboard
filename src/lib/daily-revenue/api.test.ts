import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createRevenueClient } from "./api.ts";
import { DAILY_PRIMES } from "./types.ts";
const fixture = (name = "grove") => JSON.parse(readFileSync(`schema/fixtures/daily-revenue/${name}.json`, "utf8"));
const response = (value: unknown, status = 200, etag = '"one"') => new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json", "cache-control": "public, max-age=300", etag } });

test("ETag caching revalidates after expiry and accepts revised same-cutoff results", async () => {
  let time = 0, calls = 0;
  const revised = fixture(); revised.data.revision_id = "b".repeat(64);
  const client = createRevenueClient(async (_, init) => {
    calls++;
    if (calls > 1) assert.equal(new Headers(init?.headers).get("if-none-match"), '"one"');
    if (calls === 2) return new Response(null, { status: 304, headers: { "cache-control": "public, max-age=300" } });
    return response(calls === 3 ? revised : fixture(), 200, calls === 3 ? '"two"' : '"one"');
  }, () => time);
  const first = await client.latest("grove");
  assert.equal((await client.latest("grove")).source, "cache"); assert.equal(calls, 1);
  time = 301000; assert.equal((await client.latest("grove")).data?.data.revision_id, first.data?.data.revision_id);
  time = 602000; assert.equal((await client.latest("grove")).data?.data.revision_id, "b".repeat(64));
  assert.equal(calls, 3);
});

test("an outage retains validated cached data with its original verification time", async () => {
  let time = 0;
  const client = createRevenueClient(async () => time ? response({}, 503) : response(fixture()), () => time);
  const first = await client.latest("grove"); time = 301000;
  const failed = await client.latest("grove");
  assert.equal(failed.data?.data.revision_id, first.data?.data.revision_id);
  assert.equal(failed.verifiedAt, first.verifiedAt); assert.ok(failed.error); assert.equal(failed.source, "cache");
});

test("cold backend failure and 404 remain missing, not zero; one prime cannot blank others", async () => {
  const client = createRevenueClient(async (url) => {
    const prime = String(url).split("/").at(-2)!;
    return prime === "grove" ? response({}, 503) : prime === "spark" ? response({}, 404) : response(fixture(prime));
  });
  const reads = await Promise.all(DAILY_PRIMES.map((p) => client.latest(p)));
  assert.equal(reads[0].source, "missing"); assert.equal(reads[1].source, "unavailable");
  assert.equal(reads.filter((r) => r.data !== null).length, 4);
});

test("failed latest attempt and stale freshness do not erase successful data", async () => {
  const data = fixture(); data.freshness.stale = true; data.freshness.expected_cutoff = "2026-09-16";
  data.latest_attempt.status = "failed"; data.latest_attempt.error_type = "MissingOfficialRate";
  const client = createRevenueClient(async () => response(data));
  const result = await client.latest("grove");
  assert.equal(result.data?.data.cutoff, "2026-09-15"); assert.equal(result.data?.latest_attempt?.status, "failed");
});

test("503 status documents remain readable and are never cached", async () => {
  let calls = 0;
  const data = fixture();
  const client = createRevenueClient(async () => { calls++; return response({ cadence: "daily", ready: false, primes: { grove: { ...data.freshness, latest_attempt: data.latest_attempt } } }, 503); });
  assert.ok((await client.status()).data?.grove); await client.status(); assert.equal(calls, 2);
});

test("invalid history fails independently while the latest estimate remains usable", async () => {
  const client = createRevenueClient(async (url) => response(String(url).includes("/history") ? {} : fixture()));
  assert.equal((await client.history("grove", "2026-09-01", "2026-09-15")).source, "unavailable");
  assert.ok((await client.latest("grove")).data);
});
