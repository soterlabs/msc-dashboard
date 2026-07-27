/**
 * Runtime shape checks for the files in data/generated/.
 *
 * When the datasets were generated .ts modules, tsc checked every literal
 * against its interface on each build. Reading JSON gives that up: a cast is
 * only a promise. These checks put the guarantee back, and deliberately cover
 * the case a crash would NOT catch — a field whose type drifts but whose shape
 * still renders. A stringified number is the dangerous one, because
 * `sum()` in domain.ts concatenates instead of adding, quietly turning a
 * headline total into nonsense.
 *
 * Runs once at build time (see load.ts), so thoroughness costs nothing.
 * Every problem is reported at once, matching schema/prime-payments.mjs.
 */

type Problems = string[];

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function num(problems: Problems, at: string, v: unknown, nullable = false) {
  if (nullable && v === null) return;
  if (typeof v !== "number" || !Number.isFinite(v)) {
    problems.push(`${at} should be a ${nullable ? "number or null" : "number"}, got ${JSON.stringify(v)}`);
  }
}

function str(problems: Problems, at: string, v: unknown, nullable = false) {
  if (nullable && v === null) return;
  if (typeof v !== "string") {
    problems.push(`${at} should be a string, got ${JSON.stringify(v)}`);
  }
}

function bool(problems: Problems, at: string, v: unknown, nullable = false) {
  if (nullable && v === null) return;
  if (typeof v !== "boolean") {
    problems.push(`${at} should be a boolean, got ${JSON.stringify(v)}`);
  }
}

/** Returns the array at `key`, or records a problem and returns []. */
function arr(problems: Problems, root: Record<string, unknown>, key: string): unknown[] {
  const v = root[key];
  if (!Array.isArray(v)) {
    problems.push(`${key} should be an array, got ${JSON.stringify(v)?.slice(0, 40)}`);
    return [];
  }
  return v;
}

function rows(problems: Problems, list: unknown[], key: string): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  list.forEach((row, i) => {
    if (!isObj(row)) problems.push(`${key}[${i}] should be an object`);
    else out.push(row);
  });
  return out;
}

/** Every value of a `YYYY-MM` → number|null map. */
function monthly(problems: Problems, at: string, v: unknown) {
  if (!isObj(v)) {
    problems.push(`${at} should be an object of month → number`);
    return;
  }
  for (const [m, value] of Object.entries(v)) num(problems, `${at}.${m}`, value, true);
}

function stringList(problems: Problems, at: string, v: unknown) {
  if (!Array.isArray(v)) {
    problems.push(`${at} should be an array of strings`);
    return;
  }
  v.forEach((s, i) => str(problems, `${at}[${i}]`, s));
}

function finish(name: string, problems: Problems) {
  if (!problems.length) return;
  const shown = problems.slice(0, 20);
  const more = problems.length - shown.length;
  throw new Error(
    `data/generated/${name}.json does not match its TypeScript type (${problems.length} problem${problems.length > 1 ? "s" : ""}):\n` +
      `  - ${shown.join("\n  - ")}` +
      (more > 0 ? `\n  …and ${more} more` : "") +
      `\n\nThe generator and src/lib/${name === "prime" ? "prime-types" : name === "ssr" ? "ssr-types" : "types"}.ts have drifted — rerun \`pnpm generate-data\`.`,
  );
}

export function assertDr(data: unknown): void {
  const p: Problems = [];
  if (!isObj(data)) throw new Error("data/generated/dr.json should be an object");

  stringList(p, "reportMonths", data.reportMonths);
  stringList(p, "historyMonths", data.historyMonths);
  if (!isObj(data.monthLabels)) p.push("monthLabels should be an object");
  else for (const [m, l] of Object.entries(data.monthLabels)) str(p, `monthLabels.${m}`, l);

  rows(p, arr(p, data, "summaryGroups"), "summaryGroups").forEach((g, i) => {
    const at = `summaryGroups[${i}]`;
    str(p, `${at}.group`, g.group);
    num(p, `${at}.total`, g.total, true);
    monthly(p, `${at}.monthly`, g.monthly);
    rows(p, Array.isArray(g.refCodes) ? g.refCodes : [], `${at}.refCodes`).forEach((rc, j) => {
      str(p, `${at}.refCodes[${j}].refCode`, rc.refCode);
      num(p, `${at}.refCodes[${j}].total`, rc.total, true);
      monthly(p, `${at}.refCodes[${j}].monthly`, rc.monthly);
      str(p, `${at}.refCodes[${j}].notes`, rc.notes);
    });
  });

  rows(p, arr(p, data, "refCodeRows"), "refCodeRows").forEach((r, i) => {
    const at = `refCodeRows[${i}]`;
    str(p, `${at}.refCode`, r.refCode);
    str(p, `${at}.group`, r.group);
    num(p, `${at}.total`, r.total, true);
    monthly(p, `${at}.monthly`, r.monthly);
    stringList(p, `${at}.tokens`, r.tokens);
    str(p, `${at}.notes`, r.notes);
  });

  rows(p, arr(p, data, "tokenRates"), "tokenRates").forEach((t, i) => {
    const at = `tokenRates[${i}]`;
    str(p, `${at}.token`, t.token);
    str(p, `${at}.rateType`, t.rateType);
    num(p, `${at}.apy`, t.apy, true);
    num(p, `${at}.rewardPer`, t.rewardPer, true);
    str(p, `${at}.notes`, t.notes);
  });

  rows(p, arr(p, data, "refCodeTokenSeries"), "refCodeTokenSeries").forEach((s, i) => {
    const at = `refCodeTokenSeries[${i}]`;
    str(p, `${at}.refCode`, s.refCode);
    str(p, `${at}.token`, s.token);
    num(p, `${at}.total`, s.total, true);
    monthly(p, `${at}.monthly`, s.monthly);
  });

  rows(p, arr(p, data, "l2Addresses"), "l2Addresses").forEach((a, i) => {
    const at = `l2Addresses[${i}]`;
    for (const k of ["chain", "label", "address", "refCode"]) str(p, `${at}.${k}`, a[k]);
  });

  finish("dr", p);
}

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

export function assertSsr(data: unknown): void {
  const p: Problems = [];
  if (!isObj(data)) throw new Error("data/generated/ssr.json should be an object");

  stringList(p, "months", data.months);
  if (!isObj(data.monthLabels)) p.push("monthLabels should be an object");
  else for (const [m, l] of Object.entries(data.monthLabels)) str(p, `monthLabels.${m}`, l);

  rows(p, arr(p, data, "reports"), "reports").forEach((r, i) => {
    const at = `reports[${i}]`;
    str(p, `${at}.partner`, r.partner);
    str(p, `${at}.month`, r.month);
    num(p, `${at}.periodDays`, r.periodDays);

    if (!isObj(r.headline)) p.push(`${at}.headline should be an object`);
    else for (const f of HEADLINE_FIELDS) num(p, `${at}.headline.${f}`, r.headline[f], true);

    rows(p, Array.isArray(r.venues) ? r.venues : [], `${at}.venues`).forEach((v, j) => {
      str(p, `${at}.venues[${j}].id`, v.id);
      str(p, `${at}.venues[${j}].label`, v.label);
      for (const f of VENUE_NUMBERS) num(p, `${at}.venues[${j}].${f}`, v[f]);
    });

    rows(p, Array.isArray(r.refCodes) ? r.refCodes : [], `${at}.refCodes`).forEach((c, j) => {
      str(p, `${at}.refCodes[${j}].refCode`, c.refCode);
      num(p, `${at}.refCodes[${j}].dr`, c.dr, true);
      str(p, `${at}.refCodes[${j}].notes`, c.notes);
    });

    // rateBuild is nullable on the type, but the generator always emits an object.
    if (r.rateBuild !== null) {
      if (!isObj(r.rateBuild)) p.push(`${at}.rateBuild should be an object or null`);
      else {
        for (const f of RATE_BUILD_NUMBERS) num(p, `${at}.rateBuild.${f}`, r.rateBuild[f], true);
        str(p, `${at}.rateBuild.referenceRateKind`, r.rateBuild.referenceRateKind, true);
        bool(p, `${at}.rateBuild.subsidyEnabled`, r.rateBuild.subsidyEnabled, true);
      }
    }

    rows(p, Array.isArray(r.skyDirect) ? r.skyDirect : [], `${at}.skyDirect`).forEach((s, j) => {
      const sat = `${at}.skyDirect[${j}]`;
      for (const f of ["id", "kind", "start", "end", "source", "label"]) str(p, `${sat}.${f}`, s[f]);
      num(p, `${sat}.cap`, s.cap, true);
      bool(p, `${sat}.active`, s.active);
      num(p, `${sat}.actualRevenue`, s.actualRevenue);
      num(p, `${sat}.sdRevenue`, s.sdRevenue);
    });

    rows(p, Array.isArray(r.debtDaily) ? r.debtDaily : [], `${at}.debtDaily`).forEach((d, j) => {
      const dat = `${at}.debtDaily[${j}]`;
      str(p, `${dat}.date`, d.date);
      num(p, `${dat}.cumDebt`, d.cumDebt);
      num(p, `${dat}.utilized`, d.utilized);
      num(p, `${dat}.dailySkyCharge`, d.dailySkyCharge);
    });

    rows(p, Array.isArray(r.excludedVenues) ? r.excludedVenues : [], `${at}.excludedVenues`).forEach(
      (v, j) => {
        const vat = `${at}.excludedVenues[${j}]`;
        str(p, `${vat}.id`, v.id);
        str(p, `${vat}.label`, v.label);
        num(p, `${vat}.valueSom`, v.valueSom);
        num(p, `${vat}.valueEom`, v.valueEom);
      },
    );
  });

  finish("ssr", p);
}

const PAYMENT_STRINGS = [
  "castDate",
  "prime",
  "kind",
  "settlesAccrual",
  "receivingWallet",
  "txHash",
  "spell",
  "spellAddress",
  "subproxyConstant",
  "label",
  "reference",
  "source",
  "fromAddress",
  "fromLabel",
  "toLabel",
  "lineItem",
  "walletType",
];

export function assertPrime(data: unknown): void {
  const p: Problems = [];
  if (!isObj(data)) throw new Error("data/generated/prime.json should be an object");

  rows(p, arr(p, data, "payments"), "payments").forEach((row, i) => {
    const at = `payments[${i}]`;
    for (const f of PAYMENT_STRINGS) str(p, `${at}.${f}`, row[f]);
    num(p, `${at}.usds`, row.usds);
    num(p, `${at}.logIndex`, row.logIndex);
  });

  finish("prime", p);
}
