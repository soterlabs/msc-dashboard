/**
 * Runtime shape checks for the files in data/generated/.
 *
 * When the datasets were generated .ts modules, tsc checked every literal
 * against its interface on each build. Reading JSON gives that up: a cast is
 * only a promise. These functions put the guarantee back, and deliberately
 * cover the cases a crash would NOT catch — a field whose type drifts but
 * whose shape still renders. A stringified number is the dangerous one,
 * because `sum()` in domain.ts concatenates instead of adding, quietly turning
 * a headline total into nonsense.
 *
 * Each validator returns the narrowed dataset, so the cast lives here — in the
 * one place that has just checked it — rather than at the call site.
 *
 * Runs once at build time (see load.ts), so thoroughness costs nothing. Every
 * problem is reported at once, matching schema/prime-payments.mjs.
 *
 * Covered by dataset-schema.test.ts — `pnpm test`.
 */
import type { PrimeDataset, PrimeKind, PrimeSource, PrimeWallet } from "./prime/types";
import type { SkyTotalBasis, SkyTotalDataset } from "./sky-total/types";
import type { SsrDataset, SsrPartner } from "./ssr/types";
import type { TmfDataset, TmfGranularity } from "./tmf/types";
import type { DrDataset } from "./dr/types";

type Problems = string[];

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const show = (v: unknown) => (v === undefined ? "undefined" : JSON.stringify(v)?.slice(0, 60));

function num(problems: Problems, at: string, v: unknown, nullable = false) {
  if (nullable && v === null) return;
  if (typeof v !== "number" || !Number.isFinite(v)) {
    problems.push(`${at} should be a ${nullable ? "number or null" : "number"}, got ${show(v)}`);
  }
}

function str(problems: Problems, at: string, v: unknown, nullable = false) {
  if (nullable && v === null) return;
  if (typeof v !== "string") problems.push(`${at} should be a string, got ${show(v)}`);
}

function bool(problems: Problems, at: string, v: unknown, nullable = false) {
  if (nullable && v === null) return;
  if (typeof v !== "boolean") problems.push(`${at} should be a boolean, got ${show(v)}`);
}

/** A string constrained to a union in the TypeScript type. */
function oneOf(problems: Problems, at: string, v: unknown, allowed: readonly string[]) {
  if (typeof v !== "string" || !allowed.includes(v)) {
    problems.push(`${at} should be one of ${allowed.map((a) => `"${a}"`).join(" / ")}, got ${show(v)}`);
  }
}

/**
 * The array at `parent[key]`, or a recorded problem and an empty list.
 *
 * Every array — nested ones included — has to come through here. Substituting
 * `[]` for a missing field without recording it is how a hole opens up: the
 * checks below then iterate nothing, report success, and the failure resurfaces
 * later as an anonymous TypeError at render, or not at all.
 */
function list(problems: Problems, parent: Record<string, unknown>, key: string, at = ""): unknown[] {
  const path = at ? `${at}.${key}` : key;
  const v = parent[key];
  if (!Array.isArray(v)) {
    problems.push(`${path} should be an array, got ${show(v)}`);
    return [];
  }
  return v;
}

/** Elements of `values` that are objects; non-objects are recorded. */
function objects(problems: Problems, values: unknown[], at: string): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  values.forEach((row, i) => {
    if (!isObj(row)) problems.push(`${at}[${i}] should be an object, got ${show(row)}`);
    else out.push(row);
  });
  return out;
}

/** Object rows of a (possibly nested) array field, with all checks applied. */
function rowsOf(
  problems: Problems,
  parent: Record<string, unknown>,
  key: string,
  at = "",
): Record<string, unknown>[] {
  const path = at ? `${at}.${key}` : key;
  return objects(problems, list(problems, parent, key, at), path);
}

/** Every value of a `YYYY-MM` → number|null map. */
function monthly(problems: Problems, at: string, v: unknown) {
  if (!isObj(v)) {
    problems.push(`${at} should be an object of month → number, got ${show(v)}`);
    return;
  }
  for (const [m, value] of Object.entries(v)) num(problems, `${at}.${m}`, value, true);
}

function stringList(problems: Problems, parent: Record<string, unknown>, key: string, at = "") {
  const path = at ? `${at}.${key}` : key;
  list(problems, parent, key, at).forEach((s, i) => str(problems, `${path}[${i}]`, s));
}

function numberList(problems: Problems, parent: Record<string, unknown>, key: string, at = "") {
  const path = at ? `${at}.${key}` : key;
  list(problems, parent, key, at).forEach((n, i) => num(problems, `${path}[${i}]`, n));
}

function monthLabels(problems: Problems, v: unknown) {
  if (!isObj(v)) {
    problems.push(`monthLabels should be an object, got ${show(v)}`);
    return;
  }
  for (const [m, label] of Object.entries(v)) str(problems, `monthLabels.${m}`, label);
}

function finish(file: string, typesFile: string, problems: Problems) {
  if (!problems.length) return;
  const shown = problems.slice(0, 20);
  const more = problems.length - shown.length;
  throw new Error(
    `data/generated/${file}.json does not match its TypeScript type ` +
      `(${problems.length} problem${problems.length > 1 ? "s" : ""}):\n` +
      `  - ${shown.join("\n  - ")}` +
      (more > 0 ? `\n  …and ${more} more` : "") +
      `\n\nThe generator and src/lib/${typesFile}.ts have drifted — rerun \`pnpm refresh\`.`,
  );
}

/* ------------------------------------------------------------------- DR */

export function validateDr(data: unknown): DrDataset {
  if (!isObj(data)) throw new Error("data/generated/dr.json should be an object");
  const p: Problems = [];

  stringList(p, data, "reportMonths");
  stringList(p, data, "historyMonths");
  monthLabels(p, data.monthLabels);

  rowsOf(p, data, "summaryGroups").forEach((g, i) => {
    const at = `summaryGroups[${i}]`;
    str(p, `${at}.group`, g.group);
    num(p, `${at}.total`, g.total, true);
    monthly(p, `${at}.monthly`, g.monthly);
    rowsOf(p, g, "refCodes", at).forEach((rc, j) => {
      const rat = `${at}.refCodes[${j}]`;
      str(p, `${rat}.refCode`, rc.refCode);
      num(p, `${rat}.total`, rc.total, true);
      monthly(p, `${rat}.monthly`, rc.monthly);
      str(p, `${rat}.notes`, rc.notes);
    });
  });

  rowsOf(p, data, "refCodeRows").forEach((r, i) => {
    const at = `refCodeRows[${i}]`;
    str(p, `${at}.refCode`, r.refCode);
    str(p, `${at}.group`, r.group);
    num(p, `${at}.total`, r.total, true);
    monthly(p, `${at}.monthly`, r.monthly);
    stringList(p, r, "tokens", at);
    str(p, `${at}.notes`, r.notes);
  });

  str(p, "ratesAsOf", data.ratesAsOf);

  rowsOf(p, data, "rateSchedule").forEach((w, i) => {
    const at = `rateSchedule[${i}]`;
    str(p, `${at}.rateType`, w.rateType);
    str(p, `${at}.description`, w.description);
    num(p, `${at}.apy`, w.apy);
    num(p, `${at}.rewardPer`, w.rewardPer);
    str(p, `${at}.start`, w.start);
    str(p, `${at}.end`, w.end);
  });

  rowsOf(p, data, "tokenRates").forEach((t, i) => {
    const at = `tokenRates[${i}]`;
    str(p, `${at}.token`, t.token);
    str(p, `${at}.rateType`, t.rateType);
    num(p, `${at}.apy`, t.apy, true);
    num(p, `${at}.rewardPer`, t.rewardPer, true);
    str(p, `${at}.notes`, t.notes);
  });

  rowsOf(p, data, "refCodeTokenSeries").forEach((s, i) => {
    const at = `refCodeTokenSeries[${i}]`;
    str(p, `${at}.refCode`, s.refCode);
    str(p, `${at}.token`, s.token);
    num(p, `${at}.total`, s.total, true);
    monthly(p, `${at}.monthly`, s.monthly);
  });

  rowsOf(p, data, "l2Addresses").forEach((a, i) => {
    for (const k of ["chain", "label", "address", "refCode"]) {
      str(p, `l2Addresses[${i}].${k}`, a[k]);
    }
  });

  finish("dr", "dr/types", p);
  // Double cast: the isObj guard narrowed `data` to Record<string, unknown>,
  // which TypeScript will not widen directly to DrDataset.
  return data as unknown as DrDataset;
}

/* ------------------------------------------------------------------ SSR */

/** Mirrors SsrPartner. Kept in step with SSR_KNOWN_PARTNERS in generate-data.mjs. */
const SSR_PARTNERS: readonly SsrPartner[] = ["grove", "keel", "obex", "osero", "spark"];

const HEADLINE_FIELDS = [
  "agentRate",
  "distributionRewards",
  "demandSideRevenue",
  "primeSupplySideRevenue",
  "primeAgentProfit",
  "primeCostOfFunds",
  "skyDirectExposure",
  "skyRevenue",
];

const VENUE_NUMBERS = [
  "valueSom",
  "valueEom",
  "periodInflow",
  "actualRev",
  "revenue",
  "sdRevenue",
  "sdShare",
  "spreadReimb",
];

const RATE_BUILD_NUMBERS = [
  "timeWeightedUtilized",
  "baseRate",
  "referenceRate",
  "subsidisedRate",
  "effectiveRate",
  "diffVsBaseBps",
  "subsidyBenefit",
  "cofAtFullBase",
  "cofOnUtilized",
  "skyDirectComponent",
  "skyRevenueMax",
  "capUsd",
];

export function validateSsr(data: unknown): SsrDataset {
  if (!isObj(data)) throw new Error("data/generated/ssr.json should be an object");
  const p: Problems = [];

  stringList(p, data, "months");
  monthLabels(p, data.monthLabels);

  rowsOf(p, data, "reports").forEach((r, i) => {
    const at = `reports[${i}]`;
    oneOf(p, `${at}.partner`, r.partner, SSR_PARTNERS);
    str(p, `${at}.month`, r.month);
    num(p, `${at}.periodDays`, r.periodDays);

    if (!isObj(r.headline)) p.push(`${at}.headline should be an object, got ${show(r.headline)}`);
    else for (const f of HEADLINE_FIELDS) num(p, `${at}.headline.${f}`, r.headline[f], true);

    rowsOf(p, r, "venues", at).forEach((v, j) => {
      const vat = `${at}.venues[${j}]`;
      str(p, `${vat}.id`, v.id);
      str(p, `${vat}.label`, v.label);
      for (const f of VENUE_NUMBERS) num(p, `${vat}.${f}`, v[f]);
    });

    rowsOf(p, r, "refCodes", at).forEach((c, j) => {
      const cat = `${at}.refCodes[${j}]`;
      str(p, `${cat}.refCode`, c.refCode);
      num(p, `${cat}.dr`, c.dr, true);
      str(p, `${cat}.notes`, c.notes);
    });

    // rateBuild is nullable on the type; the generator always emits an object.
    if (r.rateBuild !== null) {
      if (!isObj(r.rateBuild)) {
        p.push(`${at}.rateBuild should be an object or null, got ${show(r.rateBuild)}`);
      } else {
        for (const f of RATE_BUILD_NUMBERS) num(p, `${at}.rateBuild.${f}`, r.rateBuild[f], true);
        str(p, `${at}.rateBuild.referenceRateKind`, r.rateBuild.referenceRateKind, true);
        bool(p, `${at}.rateBuild.subsidyEnabled`, r.rateBuild.subsidyEnabled, true);
      }
    }

    rowsOf(p, r, "skyDirect", at).forEach((s, j) => {
      const sat = `${at}.skyDirect[${j}]`;
      for (const f of ["id", "kind", "start", "end", "source", "label"]) str(p, `${sat}.${f}`, s[f]);
      num(p, `${sat}.cap`, s.cap, true);
      bool(p, `${sat}.active`, s.active);
      num(p, `${sat}.actualRevenue`, s.actualRevenue);
      num(p, `${sat}.sdRevenue`, s.sdRevenue);
    });

    rowsOf(p, r, "debtDaily", at).forEach((d, j) => {
      const dat = `${at}.debtDaily[${j}]`;
      str(p, `${dat}.date`, d.date);
      num(p, `${dat}.cumDebt`, d.cumDebt);
      num(p, `${dat}.utilized`, d.utilized);
      num(p, `${dat}.dailySkyCharge`, d.dailySkyCharge);
    });

    rowsOf(p, r, "excludedVenues", at).forEach((v, j) => {
      const vat = `${at}.excludedVenues[${j}]`;
      str(p, `${vat}.id`, v.id);
      str(p, `${vat}.label`, v.label);
      num(p, `${vat}.valueSom`, v.valueSom);
      num(p, `${vat}.valueEom`, v.valueEom);
    });
  });

  finish("ssr", "ssr/types", p);
  // Double cast: the isObj guard narrowed `data` to Record<string, unknown>,
  // which TypeScript will not widen directly to SsrDataset.
  return data as unknown as SsrDataset;
}

/* ------------------------------------------------------------ Sky total */

/** Every month has these, on either basis, and each one feeds a total. */
const SKY_TOTAL_NUMBERS = [
  "mintedTotal",
  "sentTotal",
  "mscNet",
  "nonMscIncome",
  "nonMscExpense",
  "nonMscNet",
  "skyNetRevenue",
];

const SKY_TOTAL_BASES: readonly SkyTotalBasis[] = ["buffer", "accrual"];

/** Buffer months only, and each line may legitimately be absent. */
const BELOW_THE_LINE_NUMBERS = [
  "coreCouncil",
  "step1Capital",
  "genesisRepayments",
  "capitalSeedings",
  "remitted",
];

export function validateSkyTotal(data: unknown): SkyTotalDataset {
  if (!isObj(data)) throw new Error("data/generated/sky-total.json should be an object");
  const p: Problems = [];

  stringList(p, data, "months");
  monthLabels(p, data.monthLabels);

  rowsOf(p, data, "reports").forEach((r, i) => {
    const at = `reports[${i}]`;
    str(p, `${at}.month`, r.month);
    oneOf(p, `${at}.basis`, r.basis, SKY_TOTAL_BASES);

    rowsOf(p, r, "primes", at).forEach((line, j) => {
      const lat = `${at}.primes[${j}]`;
      str(p, `${lat}.key`, line.key);
      str(p, `${lat}.label`, line.label);
      // Not nullable: a prime with no activity carries a real 0, so a null here
      // means a cell went unparsed rather than a prime having sat out.
      num(p, `${lat}.minted`, line.minted);
      num(p, `${lat}.sent`, line.sent);
    });

    // The report reconciles against these, so the refresh cannot emit a null.
    for (const f of SKY_TOTAL_NUMBERS) num(p, `${at}.${f}`, r[f]);
    num(p, `${at}.demandSideBuffer`, r.demandSideBuffer, true);
    numberList(p, r, "blocks", at);

    // Absent on the accrual basis, where the figures are not knowable yet.
    if (r.belowTheLine !== null) {
      if (!isObj(r.belowTheLine)) {
        p.push(`${at}.belowTheLine should be an object or null, got ${show(r.belowTheLine)}`);
      } else {
        for (const f of BELOW_THE_LINE_NUMBERS) {
          num(p, `${at}.belowTheLine.${f}`, r.belowTheLine[f], true);
        }
      }
    }

    stringList(p, r, "notes", at);
  });

  finish("sky-total", "sky-total/types", p);
  return data as unknown as SkyTotalDataset;
}

/* ------------------------------------------------------------------ TMF */

/**
 * The major version this build's types and views were written against.
 *
 * The refresh checks this too, and on purpose: that one stops a bad document
 * being committed, this one stops a committed document being served if the
 * check ever gets bypassed — `pnpm refresh` writing the file and `pnpm build`
 * reading it are separate acts, hours or days apart.
 */
const TMF_SCHEMA_MAJOR = 1;

/**
 * Mirrors TMF_GRANULARITIES in tmf/types.ts. Duplicated rather than imported
 * for the same reason PRIME_KINDS below is: this module is loaded by the test
 * runner's type-stripping, which resolves type-only imports away but cannot
 * follow a runtime one to an extensionless .ts path.
 */
const TMF_GRANULARITIES: readonly TmfGranularity[] = ["monthly", "quarterly", "annual"];

/** Numbers every period row carries, whatever the granularity. */
const TMF_PERIOD_NUMBERS = [
  "kicks",
  "usds_buyback",
  "usds_to_stakers",
  "usds_total",
  "sky_bought",
  "sky_burn_protocol",
  "sky_burn_other",
  "burn_events",
];

function tmfPeriod(p: Problems, at: string, v: unknown) {
  if (!isObj(v)) {
    p.push(`${at} should be an object, got ${show(v)}`);
    return;
  }
  str(p, `${at}.period`, v.period);
  for (const f of TMF_PERIOD_NUMBERS) num(p, `${at}.${f}`, v[f]);
  // Null where there was nothing to price or to timestamp — a period can hold
  // burns and no kicks. Zero would be a figure; these are the absence of one.
  num(p, `${at}.sky_avg_price`, v.sky_avg_price, true);
  str(p, `${at}.first_ts`, v.first_ts, true);
  str(p, `${at}.last_ts`, v.last_ts, true);
}

function stringMap(p: Problems, at: string, v: unknown) {
  if (!isObj(v)) {
    p.push(`${at} should be an object of string → string, got ${show(v)}`);
    return;
  }
  for (const [k, value] of Object.entries(v)) str(p, `${at}.${k}`, value);
}

export function validateTmf(data: unknown): TmfDataset {
  if (!isObj(data)) throw new Error("data/generated/tmf.json should be an object");
  const p: Problems = [];

  str(p, "schema_version", data.schema_version);
  str(p, "generated_at", data.generated_at);

  if (isObj(data.source)) {
    const source = data.source;
    str(p, "source.chain", source.chain);
    num(p, "source.from_block", source.from_block);
    num(p, "source.to_block", source.to_block);
    str(p, "source.to_ts", source.to_ts);
    stringMap(p, "source.contracts", source.contracts);
    stringMap(p, "source.events", source.events);
  } else {
    p.push(`source should be an object, got ${show(data.source)}`);
  }

  stringMap(p, "definitions", data.definitions);
  stringList(p, data, "notes");

  tmfPeriod(p, "totals", data.totals);

  if (isObj(data.latest_kick)) {
    const k = data.latest_kick;
    str(p, "latest_kick.ts", k.ts);
    str(p, "latest_kick.tx", k.tx);
    for (const f of [
      "block",
      "usds_buyback",
      "usds_to_stakers",
      "usds_total",
      "sky_bought",
      "splitter_burn",
      "splitter_hop",
    ]) {
      num(p, `latest_kick.${f}`, k[f]);
    }
  } else {
    p.push(`latest_kick should be an object, got ${show(data.latest_kick)}`);
  }

  if (isObj(data.periods)) {
    for (const g of TMF_GRANULARITIES) {
      list(p, data.periods, g, "periods").forEach((row, i) =>
        tmfPeriod(p, `periods.${g}[${i}]`, row),
      );
    }
  } else {
    p.push(`periods should be an object, got ${show(data.periods)}`);
  }

  rowsOf(p, data, "parameter_changes").forEach((c, i) => {
    const at = `parameter_changes[${i}]`;
    num(p, `${at}.block`, c.block);
    for (const f of ["ts", "tx", "contract", "address", "what", "value"]) {
      str(p, `${at}.${f}`, c[f]);
    }
  });

  finish("tmf", "tmf/types", p);

  // After the field check, not before: a document whose shape already failed
  // would report the version as its only problem and hide the rest.
  const version = String(data.schema_version ?? "");
  const major = Number(version.split(".")[0]);
  if (major !== TMF_SCHEMA_MAJOR) {
    throw new Error(
      `data/generated/tmf.json has schema_version ${version || "(missing)"}, ` +
        `and this build reads major ${TMF_SCHEMA_MAJOR}. Rerun \`pnpm refresh -- --only=tmf\` ` +
        `and reconcile src/lib/tmf/types.ts with the dataset's README.`,
    );
  }

  return data as unknown as TmfDataset;
}

/* ---------------------------------------------------------------- Prime */

/** Mirror the unions in prime-types.ts; the CSV schema enforces them upstream. */
const PRIME_KINDS: readonly PrimeKind[] = ["settlement cycle", "other"];
const PRIME_SOURCES: readonly PrimeSource[] = ["spell", "transfer"];
const PRIME_WALLETS: readonly PrimeWallet[] = ["subproxy", "foundation", "msig", "other"];

const PAYMENT_STRINGS = [
  "castDate",
  "prime",
  "settlesAccrual",
  "receivingWallet",
  "txHash",
  "spell",
  "spellAddress",
  "subproxyConstant",
  "label",
  "reference",
  "fromAddress",
  "fromLabel",
  "toLabel",
  "lineItem",
];

export function validatePrime(data: unknown): PrimeDataset {
  if (!isObj(data)) throw new Error("data/generated/prime.json should be an object");
  const p: Problems = [];

  rowsOf(p, data, "payments").forEach((row, i) => {
    const at = `payments[${i}]`;
    for (const f of PAYMENT_STRINGS) str(p, `${at}.${f}`, row[f]);
    oneOf(p, `${at}.kind`, row.kind, PRIME_KINDS);
    oneOf(p, `${at}.source`, row.source, PRIME_SOURCES);
    oneOf(p, `${at}.walletType`, row.walletType, PRIME_WALLETS);
    num(p, `${at}.usds`, row.usds);
    num(p, `${at}.logIndex`, row.logIndex);
  });

  finish("prime", "prime/types", p);
  // Double cast: the isObj guard narrowed `data` to Record<string, unknown>,
  // which TypeScript will not widen directly to PrimeDataset.
  return data as unknown as PrimeDataset;
}
