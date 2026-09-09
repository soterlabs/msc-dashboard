/**
 * Tests for the dataset validators.
 *
 * Run with `pnpm test`. No test framework — node:test and node:assert only, so
 * there is nothing to install and nothing to keep up to date.
 *
 * The committed datasets are used as the valid fixtures: if the generator and
 * the TypeScript types ever drift, these fail alongside the build.
 *
 * Several cases are regression tests for holes found in review:
 *   - a nested array that is missing or the wrong type used to be silently
 *     replaced with [], so nothing was reported and the failure resurfaced as
 *     an anonymous TypeError at render — or, for `venues`, shipped;
 *   - union-typed fields (kind / source / walletType / partner) were checked
 *     only as strings.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import assert from "node:assert/strict";
import test from "node:test";

import {
  validateDr,
  validatePrime,
  validateSkyTotal,
  validateSsr,
  validateTmf,
} from "./dataset-schema.ts";

const DIR = path.join(import.meta.dirname, "..", "..", "data", "generated");

const read = (name: string) => JSON.parse(fs.readFileSync(path.join(DIR, `${name}.json`), "utf8"));

/** Deep clone so each case starts from pristine committed data. */
const fixture = (name: string) => structuredClone(read(name));

/** Asserts the validator rejects `data` and that the message names `field`. */
function rejects(validate: (v: unknown) => unknown, data: unknown, field: string) {
  assert.throws(
    () => validate(data),
    (e: unknown) => {
      assert.ok(e instanceof Error);
      assert.match(e.message, /does not match its TypeScript type|should be an object/);
      assert.ok(
        e.message.includes(field),
        `expected the message to name "${field}", got:\n${e.message}`,
      );
      return true;
    },
  );
}

/* ------------------------------------------------------- the real datasets */

test("the committed datasets match their types", () => {
  assert.ok(validateDr(read("dr")).summaryGroups.length > 0);
  assert.ok(validateSsr(read("ssr")).reports.length > 0);
  assert.ok(validateSkyTotal(read("sky-total")).reports.length > 0);
  assert.ok(validateTmf(read("tmf")).periods.monthly.length > 0);
  assert.ok(validatePrime(read("prime")).payments.length > 0);
});

/* -------------------------------------------------------------------- TMF */

// This dataset is copied through from upstream rather than computed here, so
// the validator is the only thing standing between a field upstream renamed and
// a view rendering undefined. The version check is the other half of that.

test("tmf: a stringified figure is rejected", () => {
  const tmf = fixture("tmf");
  tmf.periods.monthly[0].usds_buyback = "367500";
  rejects(validateTmf, tmf, "periods.monthly[0].usds_buyback");
});

test("tmf: a burn-only period is accepted with its nulls", () => {
  const tmf = fixture("tmf");
  // No such month exists in the data yet — a burn with no kick that period —
  // but the dataset's README says it can, so the shape has to be allowed:
  // null price and null timestamps, with the burn itself still a number.
  tmf.periods.monthly.push({
    period: "2026-10",
    kicks: 0,
    usds_buyback: 0,
    usds_to_stakers: 0,
    usds_total: 0,
    sky_bought: 0,
    sky_avg_price: null,
    sky_burn_protocol: 1234.5,
    sky_burn_other: 0,
    burn_events: 1,
    first_ts: null,
    last_ts: null,
  });
  const out = validateTmf(tmf);
  const added = out.periods.monthly.at(-1)!;
  assert.equal(added.sky_avg_price, null);
  assert.equal(added.first_ts, null);
  assert.equal(added.sky_burn_protocol, 1234.5);
});

test("tmf: a null where the type is not nullable is rejected", () => {
  for (const field of ["kicks", "usds_total", "sky_burn_protocol"] as const) {
    const tmf = fixture("tmf");
    tmf.periods.monthly[0][field] = null;
    rejects(validateTmf, tmf, `periods.monthly[0].${field}`);
  }
});

test("tmf: a period row that is not an object is rejected", () => {
  const tmf = fixture("tmf");
  tmf.periods.quarterly[0] = "2025-Q1";
  rejects(validateTmf, tmf, "periods.quarterly[0]");
});

test("tmf: a missing granularity is rejected", () => {
  const tmf = fixture("tmf");
  delete tmf.periods.annual;
  rejects(validateTmf, tmf, "periods.annual");
});

test("tmf: the totals row is typed like any other period", () => {
  const tmf = fixture("tmf");
  tmf.totals.sky_bought = "1978233157.44";
  rejects(validateTmf, tmf, "totals.sky_bought");
});

test("tmf: latest_kick and parameter_changes are checked", () => {
  const kick = fixture("tmf");
  kick.latest_kick.splitter_hop = "3748";
  rejects(validateTmf, kick, "latest_kick.splitter_hop");

  const change = fixture("tmf");
  // 1.1.0 added `address` — the legacy and live Flapper share a chainlog role,
  // so losing it would make two contracts indistinguishable on screen.
  delete change.parameter_changes[0].address;
  rejects(validateTmf, change, "parameter_changes[0].address");
});

// Upstream bumps the major on any field rename or removal, so this is the one
// signal that the shape changed under us. It must fail the build, not warn.
test("tmf: a major schema version this build does not read is rejected", () => {
  const tmf = fixture("tmf");
  tmf.schema_version = "2.0.0";
  assert.throws(
    () => validateTmf(tmf),
    (e: unknown) => {
      assert.ok(e instanceof Error);
      assert.match(e.message, /schema_version 2\.0\.0/);
      assert.match(e.message, /major 1/);
      return true;
    },
  );
});

test("tmf: a minor schema bump is accepted", () => {
  const tmf = fixture("tmf");
  tmf.schema_version = "1.9.3";
  assert.ok(validateTmf(tmf));
});

test("sky-total: a stringified number is rejected", () => {
  const st = fixture("sky-total");
  st.reports[0].skyNetRevenue = "12809128.18";
  rejects(validateSkyTotal, st, "reports[0].skyNetRevenue");
});

test("sky-total: a stringified per-prime value is rejected", () => {
  const st = fixture("sky-total");
  st.reports[0].primes[0].minted = "16190100.91";
  rejects(validateSkyTotal, st, "reports[0].primes[0].minted");
});

test("sky-total: a missing nested array is rejected (regression)", () => {
  const st = fixture("sky-total");
  delete st.reports[0].primes;
  rejects(validateSkyTotal, st, "reports[0].primes");
});

// The series spans two methodologies and the reader is told which one each
// month is on, so an unrecognised basis has to fail rather than render blank.
test("sky-total: an unknown basis is rejected", () => {
  const st = fixture("sky-total");
  st.reports[0].basis = "cash";
  rejects(validateSkyTotal, st, "reports[0].basis");
});

// belowTheLine is absent on the accrual basis, so null is a real value there —
// but a malformed object must not slip through as if it were.
test("sky-total: belowTheLine accepts null and rejects a non-object", () => {
  // Nulling a month that HAS the section — reports[0] is January, which never
  // had one, so asserting on it would pass without testing anything.
  const ok = fixture("sky-total");
  const i = ok.reports.findIndex((r: { belowTheLine: unknown }) => r.belowTheLine !== null);
  assert.ok(i >= 0, "fixture has no month with a below-the-line section");
  ok.reports[i].belowTheLine = null;
  assert.ok(validateSkyTotal(ok));

  const bad = fixture("sky-total");
  bad.reports[i].belowTheLine = "none";
  rejects(validateSkyTotal, bad, `reports[${i}].belowTheLine`);
});

// Every month reconciles against these, so the refresh can never emit a null.
test("sky-total: a null headline figure is rejected", () => {
  const st = fixture("sky-total");
  st.reports[0].mscNet = null;
  rejects(validateSkyTotal, st, "reports[0].mscNet");
});

test("validators return the same object they were given", () => {
  const dr = read("dr");
  assert.equal(validateDr(dr), dr);
});

/* ------------------------------------------------- scalar type drift (dr) */

test("dr: a stringified number is rejected", () => {
  const dr = fixture("dr");
  dr.summaryGroups[0].total = String(dr.summaryGroups[0].total);
  rejects(validateDr, dr, "summaryGroups[0].total");
});

test("dr: a stringified monthly value is rejected", () => {
  const dr = fixture("dr");
  const month = Object.keys(dr.refCodeRows[0].monthly)[0];
  dr.refCodeRows[0].monthly[month] = "123";
  rejects(validateDr, dr, `refCodeRows[0].monthly.${month}`);
});

test("dr: NaN and Infinity are rejected", () => {
  for (const bad of [NaN, Infinity]) {
    const dr = fixture("dr");
    dr.tokenRates[0].apy = bad;
    rejects(validateDr, dr, "tokenRates[0].apy");
  }
});

test("dr: null is accepted where the type is nullable", () => {
  const dr = fixture("dr");
  dr.summaryGroups[0].total = null;
  dr.tokenRates[0].apy = null;
  assert.ok(validateDr(dr));
});

test("dr: null is rejected where the type is not nullable", () => {
  const dr = fixture("dr");
  dr.refCodeRows[0].refCode = null;
  rejects(validateDr, dr, "refCodeRows[0].refCode");
});

// The reward schedule is parsed out of Python source in settle-dr-dune, so a
// silently-empty regex match is the realistic failure — a window whose apy came
// back as a string, or a missing ratesAsOf, must not reach the rate card.
test("dr: a rate window with a non-numeric apy is rejected", () => {
  const dr = fixture("dr");
  dr.rateSchedule[0].apy = "0.002";
  rejects(validateDr, dr, "rateSchedule[0].apy");
});

test("dr: a missing ratesAsOf is rejected", () => {
  const dr = fixture("dr");
  delete dr.ratesAsOf;
  rejects(validateDr, dr, "ratesAsOf");
});

/* ------------------------------------------------------ missing structure */

test("dr: a missing top-level array is rejected", () => {
  const dr = fixture("dr");
  delete dr.tokenRates;
  rejects(validateDr, dr, "tokenRates");
});

test("dr: a missing NESTED array is rejected (regression)", () => {
  const dr = fixture("dr");
  delete dr.summaryGroups[0].refCodes;
  rejects(validateDr, dr, "summaryGroups[0].refCodes");
});

test("ssr: a nested array replaced by an object is rejected (regression)", () => {
  const ssr = fixture("ssr");
  ssr.reports[0].venues = {};
  rejects(validateSsr, ssr, "reports[0].venues");
});

test("ssr: every nested array field is guarded (regression)", () => {
  for (const field of ["venues", "refCodes", "skyDirect", "debtDaily", "excludedVenues"]) {
    const ssr = fixture("ssr");
    delete ssr.reports[0][field];
    rejects(validateSsr, ssr, `reports[0].${field}`);
  }
});

test("dr: a non-object row inside an array is rejected", () => {
  const dr = fixture("dr");
  dr.refCodeRows[0] = "nope";
  rejects(validateDr, dr, "refCodeRows[0]");
});

test("a non-object dataset is rejected", () => {
  for (const bad of [null, [], "x", 3]) {
    assert.throws(() => validateDr(bad));
    assert.throws(() => validateSsr(bad));
    assert.throws(() => validatePrime(bad));
  }
});

/* ----------------------------------------------------------- union fields */

test("prime: an unknown kind / source / walletType is rejected (regression)", () => {
  for (const [field, bad] of [
    ["kind", "settlment cycle"],
    ["source", "mint"],
    ["walletType", "safe"],
  ] as const) {
    const prime = fixture("prime");
    prime.payments[0][field] = bad;
    rejects(validatePrime, prime, `payments[0].${field}`);
  }
});

test("ssr: an unknown partner is rejected (regression)", () => {
  const ssr = fixture("ssr");
  ssr.reports[0].partner = "amatsu";
  rejects(validateSsr, ssr, "reports[0].partner");
});

/* ------------------------------------------------------------------ ssr/prime */

test("ssr: a stringified headline number is rejected", () => {
  const ssr = fixture("ssr");
  ssr.reports[0].headline.skyRevenue = "123";
  rejects(validateSsr, ssr, "reports[0].headline.skyRevenue");
});

test("ssr: a stringified venue number is rejected", () => {
  const ssr = fixture("ssr");
  const report = ssr.reports.find((r: { venues: unknown[] }) => r.venues.length > 0);
  report.venues[0].revenue = "0";
  rejects(validateSsr, ssr, ".venues[0].revenue");
});

test("ssr: a non-boolean subsidyEnabled is rejected", () => {
  const ssr = fixture("ssr");
  ssr.reports[0].rateBuild.subsidyEnabled = "true";
  rejects(validateSsr, ssr, "reports[0].rateBuild.subsidyEnabled");
});

test("ssr: a null rateBuild is accepted", () => {
  const ssr = fixture("ssr");
  ssr.reports[0].rateBuild = null;
  assert.ok(validateSsr(ssr));
});

test("prime: a stringified usds is rejected", () => {
  const prime = fixture("prime");
  prime.payments[0].usds = String(prime.payments[0].usds);
  rejects(validatePrime, prime, "payments[0].usds");
});

test("prime: a stringified logIndex is rejected", () => {
  const prime = fixture("prime");
  prime.payments[0].logIndex = String(prime.payments[0].logIndex);
  rejects(validatePrime, prime, "payments[0].logIndex");
});

/* -------------------------------------------------------------- reporting */

test("every problem is reported, not just the first", () => {
  const prime = fixture("prime");
  prime.payments[0].usds = "1";
  prime.payments[1].usds = "2";
  prime.payments[2].logIndex = "3";
  assert.throws(
    () => validatePrime(prime),
    (e: unknown) => {
      assert.ok(e instanceof Error);
      assert.match(e.message, /\(3 problems\)/);
      return true;
    },
  );
});

test("the error points at the right types file", () => {
  const cases: [(v: unknown) => unknown, string, string][] = [
    [validateDr, "dr", "src/lib/dr/types.ts"],
    [validateSsr, "ssr", "src/lib/ssr/types.ts"],
    [validatePrime, "prime", "src/lib/prime/types.ts"],
  ];
  for (const [validate, name, typesFile] of cases) {
    const data = fixture(name);
    // break one field common to all three shapes: the first array becomes bad
    const key = name === "dr" ? "summaryGroups" : name === "ssr" ? "reports" : "payments";
    delete data[key];
    assert.throws(() => validate(data), new RegExp(typesFile.replace(/[./]/g, "\\$&")));
  }
});
