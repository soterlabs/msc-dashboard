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

import { validateDr, validatePrime, validateSkyTotal, validateSsr } from "./dataset-schema.ts";

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
  assert.ok(validatePrime(read("prime")).payments.length > 0);
});

test("sky-total: a stringified number is rejected", () => {
  const st = fixture("sky-total");
  st.reports[0].skyTotalNetRevenue = "2773454.41";
  rejects(validateSkyTotal, st, "reports[0].skyTotalNetRevenue");
});

test("sky-total: a stringified per-prime value is rejected", () => {
  const st = fixture("sky-total");
  st.reports[0].primeRevenue[0].value = "8959429.60";
  rejects(validateSkyTotal, st, "reports[0].primeRevenue[0].value");
});

test("sky-total: a missing nested array is rejected (regression)", () => {
  const st = fixture("sky-total");
  delete st.reports[0].primeRevenue;
  rejects(validateSkyTotal, st, "reports[0].primeRevenue");
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
