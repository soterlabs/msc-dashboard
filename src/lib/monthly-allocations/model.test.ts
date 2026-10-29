import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateMonthly, parseMonthlyRoute, percent, costReason, monthlyUsd, overviewYields } from "./model.ts";
import { createRevenueClient } from "../daily-revenue/api.ts";
const fixture = (name = "spark-S18") => JSON.parse(readFileSync(`schema/fixtures/monthly-allocations/${name}.json`, "utf8"));

test("live API fixtures preserve monthly costs, APYs and unresolved Savings", () => {
  const known = validateMonthly(fixture(), "spark", "2026-08").allocations[0];
  assert.equal(known.borrowing_cost_usd, "62109.95550631129475086343449");
  assert.equal(percent(known.gross_apy), "6.16%");
  assert.equal(percent(known.net_apy), "2.40%");
  assert.notEqual(known.gross_monthly_return, known.gross_apy);
  const unresolved = validateMonthly(fixture("spark-S1"), "spark", "2026-08").allocations[0];
  assert.equal(unresolved.borrowing_cost_usd, null);
  assert.equal(percent(unresolved.net_apy), "—");
  assert.match(costReason(unresolved), /unresolved/);
  const idle = validateMonthly(fixture("grove-E15"), "grove", "2026-08").allocations[0];
  assert.equal(percent(idle.net_apy), "-0.0042%");
});

test("unknowns, actual zero and tiny negative returns stay distinct", () => {
  assert.equal(percent(null), "—"); assert.equal(percent("0"), "0.00%");
  assert.equal(percent("-0.0000001"), "−<0.0001%");
});

test("schema rejects wrong month, prime, duplicates, nonfinite amounts and fabricated net yield", () => {
  assert.throws(() => validateMonthly(fixture(), "grove", "2026-08"));
  assert.throws(() => validateMonthly(fixture(), "spark", "2026-09"));
  const duplicate = fixture(); duplicate.allocations.push(duplicate.allocations[0]); duplicate.count++;
  assert.throws(() => validateMonthly(duplicate, "spark", "2026-08"), /Duplicate/);
  const invalid = fixture(); invalid.allocations[0].borrowing_cost_usd = "NaN";
  assert.throws(() => validateMonthly(invalid, "spark", "2026-08"));
  const unknown = fixture("spark-S1"); unknown.allocations[0].net_apy = "0";
  assert.throws(() => validateMonthly(unknown, "spark", "2026-08"), /Unknown costs/);
});

test("shareable routes reject incomplete or invalid months and malformed venues", () => {
  const now = new Date("2026-10-29T12:00:00Z");
  assert.deepEqual(parseMonthlyRoute(["2026-08", "spark", "S18"], now), { month: "2026-08", prime: "spark", venue: "S18" });
  for (const path of [["2026-13"], ["2026-10"], ["2026-08", "bad"], ["2026-08", "spark", "a/b"], ["2026-08", "spark", "S1", "more"]]) assert.equal(parseMonthlyRoute(path, now), null);
});

test("monthly client uses correct endpoint, revalidates revisions and distinguishes 404 from outage", async () => {
  let now = 0, calls = 0;
  const client = createRevenueClient(async (url, options) => {
    calls++; assert.equal(url, "https://example.test/v1/revenue/spark/monthly/2026-08/allocations");
    if (calls === 2) {
      assert.equal((options?.headers as Record<string, string>)["if-none-match"], "v1");
      return new Response(null, { status: 304 });
    }
    return new Response(JSON.stringify(fixture()), { headers: { etag: "v1", "cache-control": "public, max-age=300" } });
  }, () => now, "https://example.test", () => {});
  assert.equal((await client.monthly("spark", "2026-08")).source, "api");
  assert.equal((await client.monthly("spark", "2026-08")).source, "cache");
  now = 301000;
  assert.equal((await client.monthly("spark", "2026-08")).data?.allocations[0].net_apy, fixture().allocations[0].net_apy);
  assert.equal(calls, 2);
  for (const [status, source] of [[404, "missing"], [503, "unavailable"]] as const) {
    const bad = createRevenueClient(async () => new Response(null, { status }), () => now, "https://example.test", () => {});
    const read = await bad.monthly("grove", "2026-09"); assert.equal(read.source, source); assert.equal(read.data, null);
  }
});


test("sub-cent borrowing costs and losses never look like exact zero", () => {
  assert.equal(monthlyUsd(null), "—");
  assert.equal(monthlyUsd("0"), "$0.00");
  assert.equal(monthlyUsd("0.0000001"), "<$0.01");
  assert.equal(monthlyUsd("-0.009"), "−<$0.01");
  assert.equal(monthlyUsd("62109.95550631129475086343449"), "$62 109.96");
});


test("contradictory exemption and net amounts are rejected rather than displayed", () => {
  const exempt = fixture(); exempt.allocations[0].borrowing_cost_status = "excluded_from_cost";
  assert.throws(() => validateMonthly(exempt, "spark", "2026-08"), /Exempt allocation/);
  const net = fixture(); net.allocations[0].net_pnl_usd = "123";
  assert.throws(() => validateMonthly(net, "spark", "2026-08"), /Net PnL contradicts/);
});

test("a failed monthly refresh retains only the same verified selection and labels it stale", async () => {
  let now = 0, fail = false;
  const client = createRevenueClient(async () => fail ? new Response(null, { status: 503 }) : new Response(JSON.stringify(fixture()), { headers: { "cache-control": "max-age=1" } }), () => now, "https://example.test", () => {});
  const first = await client.monthly("spark", "2026-08");
  now = 2000; fail = true;
  const stale = await client.monthly("spark", "2026-08");
  assert.equal(stale.source, "cache"); assert.equal(stale.verifiedAt, first.verifiedAt);
  assert.match(stale.error!, /last successfully verified/);
  assert.equal(stale.data?.revision_id, first.data?.revision_id);
  assert.equal((await client.monthly("spark", "2026-09")).data, null);
});

test("venue yields live under Prime Agent Revenues with a September default", async () => {
  const { paths, sectionFromPath } = await import("../routes.ts");
  assert.equal(paths.monthlyAllocations(), "/prime-agent-revenues/yields/2026-09");
  const path = paths.monthlyAllocations("2026-09", "grove", "E10");
  assert.equal(path, "/prime-agent-revenues/yields/2026-09/grove/E10");
  assert.equal(sectionFromPath(path)?.key, "ssr");
  assert.equal(parseMonthlyRoute([], new Date("2026-10-29T00:00:00Z"))?.month, "2026-09");
});

test("Osero and Obex September API yields retain costs, negative returns and idle exemptions", async () => {
  for (const [prime, gross, net] of [["osero", "2.40%", "-0.13%"], ["obex", "5.06%", "1.35%"]] as const) {
    const payload = fixture(`${prime}-september`);
    const client = createRevenueClient(async (url) => {
      assert.equal(url, `https://example.test/v1/revenue/${prime}/monthly/2026-09/allocations`);
      return new Response(JSON.stringify(payload));
    }, () => 0, "https://example.test");
    const read = await client.monthly(prime, "2026-09");
    assert.equal(read.source, "api");
    const row = read.data!.allocations[0];
    assert.equal(percent(row.gross_apy), gross);
    assert.equal(percent(row.net_apy), net);
    assert.equal(row.borrowing_cost_usd, payload.allocations[0].borrowing_cost_usd);
    assert.deepEqual(parseMonthlyRoute(["2026-09", prime, row.venue_id], new Date("2026-10-29T00:00:00Z")), { month: "2026-09", prime, venue: row.venue_id });
  }
  const idle = validateMonthly(fixture("osero-september"), "osero", "2026-09").allocations.find(r => r.venue_id === "O2")!;
  assert.equal(monthlyUsd(idle.borrowing_cost_usd), "$0.00");
  assert.equal(percent(idle.gross_apy), "—");
  assert.equal(percent(idle.net_apy), "—");
});

test("overview shows the top three measured yields without mutating or hiding zero in favor of missing", () => {
  const row = validateMonthly(fixture(), "spark", "2026-08").allocations[0];
  const rows = [null, "-0.01", "0", "0.05", "0.02"].map((gross_apy, i) => ({ ...row, venue_id: `V${i}`, gross_apy }));
  assert.deepEqual(overviewYields(rows).map(r => r.venue_id), ["V3", "V4", "V2"]);
  assert.equal(rows[0].gross_apy, null);
});
