/**
 * Regenerates src/lib/data.ts and src/lib/ssr-data.ts from the source-of-truth
 * repos:
 *
 *   - github.com/soterlabs/settle-dr-dune      → dune-results/dr_comparison_latest.xlsx → data.ts
 *   - github.com/soterlabs/settlement-reports  → reports/<partner>/<month>/             → ssr-data.ts
 *
 * Sources are freshly shallow-cloned into .data-sources/ on every run (any
 * previous checkout is deleted first), or point SETTLE_DR_DUNE_DIR /
 * SETTLEMENT_REPORTS_DIR at existing checkouts. The script FAILS (nonzero
 * exit, so `pnpm build` fails) if a source repo can't be cloned or if the
 * source format changed in a way the parsers don't recognize — serving stale
 * or silently-wrong revenue numbers is worse than a loud build failure.
 *
 * Usage: node scripts/generate-data.mjs
 */
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import * as XLSX from "xlsx";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = path.join(ROOT, ".data-sources");

/** Partners intentionally excluded from the SSR section. */
const SSR_EXCLUDED_PARTNERS = new Set(["skybase"]);
/** Known partners — a new one needs SSR_PARTNER_META (label/color) added by hand. */
const SSR_KNOWN_PARTNERS = new Set(["grove", "keel", "obex", "spark"]);

// ---------------------------------------------------------------- sources

function syncRepo(name, sparsePaths) {
  const envVar = name.toUpperCase().replaceAll("-", "_") + "_DIR";
  const envDir = process.env[envVar];
  if (envDir) {
    if (!fs.existsSync(envDir)) throw new Error(`${envVar} points to a missing directory: ${envDir}`);
    return envDir;
  }
  // Always start from a fresh shallow clone: no stale pulls and no half-cloned
  // cache to wedge on. Any git failure throws and fails the build.
  const dir = path.join(CACHE, name);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(CACHE, { recursive: true });
  const args = ["clone", "--depth", "1", "-q"];
  if (sparsePaths) args.push("--filter=blob:none", "--no-checkout");
  // CI/Railway builds have no SSH key — clone over HTTPS with GITHUB_TOKEN.
  const remote = process.env.GITHUB_TOKEN
    ? `https://x-access-token:${process.env.GITHUB_TOKEN}@github.com/soterlabs/${name}.git`
    : `git@github.com:soterlabs/${name}.git`;
  args.push(remote, dir);
  execFileSync("git", args, { stdio: "pipe" });
  if (sparsePaths) {
    execFileSync("git", ["-C", dir, "sparse-checkout", "set", ...sparsePaths], { stdio: "pipe" });
    execFileSync("git", ["-C", dir, "checkout", "-q"], { stdio: "pipe" });
  }
  return dir;
}

// ---------------------------------------------------------------- helpers

const round = (v, dp) => Math.round(v * 10 ** dp) / 10 ** dp;

/** Sheet cell → number|null. Sheets store both numbers and numeric strings. */
function num(v, dp = 2) {
  if (v === null || v === undefined || String(v).trim() === "") return null;
  const n = Number(v);
  if (Number.isNaN(n)) return null;
  return dp === null ? n : round(n, dp);
}

function rows(ws) {
  return XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null });
}

const str = (v) => (v === null || v === undefined ? "" : String(v).trim());

/** Cell that may hold a date (string or Date or Excel serial) → "YYYY-MM-DD". */
function dateStr(v) {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "number") {
    const d = XLSX.SSF.parse_date_code(v);
    if (d) return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
  }
  return str(v);
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthLabel = (m) => MONTH_NAMES[Number(m.slice(5)) - 1];

/** "$-46,415.64" / "**-46,415.64**" / "TBD" → number|null (2dp). */
function money(s) {
  const t = str(s).replaceAll("**", "").replaceAll("$", "").replaceAll(",", "").trim();
  if (t === "" || t === "TBD" || t === "—") return null;
  const n = Number(t);
  return Number.isNaN(n) ? null : round(n, 2);
}

/** "60.51%" → 0.6051 */
function pct(s) {
  const n = money(str(s).replace("%", ""));
  return n === null ? 0 : round(n / 100, 6);
}

function json(v) {
  return JSON.stringify(v, null, 2);
}

// ---------------------------------------------------------------- DR (data.ts)

function generateDr(drDir) {
  const wb = XLSX.read(fs.readFileSync(path.join(drDir, "dune-results", "dr_comparison_latest.xlsx")));

  // Summary: group blocks of ref-code rows, each closed by a "Total" row.
  const sum = rows(wb.Sheets["Summary"]);
  const header = sum[0].map(str);
  const totalIdx = header.indexOf("total");
  const reportMonths = header.slice(2, totalIdx);
  if (totalIdx === -1 || !reportMonths.length || !reportMonths.every((m) => /^\d{4}-\d{2}$/.test(m))) {
    throw new Error(`dr_comparison Summary sheet format changed — header: ${header.join(", ")}`);
  }
  const monthlyOf = (row, from, months) =>
    Object.fromEntries(months.map((m, i) => [m, num(row[from + i])]));

  const summaryGroups = [];
  const groupByRefCode = new Map();
  let group = null;
  let bucket = [];
  for (const row of sum.slice(1)) {
    const ref = str(row[1]);
    if (!ref) continue;
    if (str(row[0])) group = str(row[0]);
    if (ref === "Total") {
      summaryGroups.push({
        group,
        monthly: monthlyOf(row, 2, reportMonths),
        total: num(row[totalIdx]),
        refCodes: bucket,
      });
      bucket = [];
      continue;
    }
    groupByRefCode.set(ref, group);
    bucket.push({
      refCode: ref,
      monthly: monthlyOf(row, 2, reportMonths),
      total: num(row[totalIdx]),
      notes: str(row[totalIdx + 1]),
    });
  }

  // Soter by Ref Code: flat rows + tokens; group looked up from Summary.
  const byRef = rows(wb.Sheets["Soter by Ref Code"]);
  const brTotalIdx = byRef[0].map(str).indexOf("total");
  if (brTotalIdx === -1) {
    throw new Error(`dr_comparison "Soter by Ref Code" sheet format changed — header: ${byRef[0].map(str).join(", ")}`);
  }
  const refCodeRows = byRef
    .slice(1)
    .filter((r) => str(r[0]) && str(r[0]) !== "Total")
    .map((r) => ({
      refCode: str(r[0]),
      group: groupByRefCode.get(str(r[0])) ?? "Unassigned",
      monthly: monthlyOf(r, 1, reportMonths),
      total: num(r[brTotalIdx]),
      tokens: str(r[brTotalIdx + 1]) ? str(r[brTotalIdx + 1]).split(", ") : [],
      notes: str(r[brTotalIdx + 2]),
    }));

  const tokenRates = rows(wb.Sheets["Soter Rates"])
    .slice(1)
    .filter((r) => str(r[0]))
    .map((r) => ({
      token: str(r[0]),
      rateType: str(r[1]),
      apy: num(r[2], null),
      rewardPer: num(r[3], 6),
      notes: str(r.at(-1)),
    }));

  // Soter by Ref Code Token: full history per ref code × token.
  const byTok = rows(wb.Sheets["Soter by Ref Code Token"]);
  const tokHeader = byTok[0].map(str);
  const tokTotalIdx = tokHeader.findIndex((h) => h.startsWith("total"));
  const historyMonths = tokHeader.filter((h) => /^\d{4}-\d{2}$/.test(h));
  const refCodeTokenSeries = byTok
    .slice(1)
    .filter((r) => str(r[0]))
    .map((r) => {
      const monthly = monthlyOf(r, 2, historyMonths);
      const total =
        tokTotalIdx !== -1
          ? num(r[tokTotalIdx])
          : round(Object.values(monthly).reduce((a, v) => a + (v ?? 0), 0), 2);
      return { refCode: str(r[0]), token: str(r[1]), monthly, total };
    });

  const l2Addresses = rows(wb.Sheets["L2 sUSDS Filtered Addresses"])
    .slice(1)
    .filter((r) => str(r[0]))
    .map((r) => ({ chain: str(r[0]), label: str(r[1]), address: str(r[2]), refCode: str(r[3]) }));

  const monthLabels = Object.fromEntries(reportMonths.map((m) => [m, monthLabel(m)]));

  return `/**
 * Sky Distribution Rewards — dataset.
 *
 * GENERATED by scripts/generate-data.mjs from
 * soterlabs/settle-dr-dune → dune-results/dr_comparison_latest.xlsx.
 * Do not edit by hand — run \`pnpm generate-data\` instead.
 *
 * Values are DR in USD unless noted; null means no data for that month.
 */
import type {
  L2Address,
  RefCodeRow,
  RefCodeTokenSeries,
  SummaryGroup,
  TokenRate,
} from "./types";

/** Months surfaced in the KPI + summary views. */
export const REPORT_MONTHS = ${JSON.stringify(reportMonths)} as const;

/** Full history window available for per-token drill-downs. */
export const HISTORY_MONTHS = ${JSON.stringify(historyMonths)} as const;

/** Short labels for the report months, e.g. "Jan". */
export const MONTH_LABELS: Record<string, string> = ${json(monthLabels)};

export const summaryGroups: SummaryGroup[] = ${json(summaryGroups)};

export const refCodeRows: RefCodeRow[] = ${json(refCodeRows)};

export const tokenRates: TokenRate[] = ${json(tokenRates)};

export const refCodeTokenSeries: RefCodeTokenSeries[] = ${json(refCodeTokenSeries)};

export const l2Addresses: L2Address[] = ${json(l2Addresses)};
`;
}

// ---------------------------------------------------------------- SSR (ssr-data.ts)

/** Markdown tables with the `### `-level section each one sits under. */
function mdTables(md) {
  const tables = [];
  let current = null;
  let section = "";
  for (const line of md.split("\n")) {
    if (line.startsWith("### ") ) section = line.slice(4).trim();
    if (line.trim().startsWith("|")) {
      const cells = line.trim().slice(1, -1).split("|").map((c) => c.trim());
      if (cells.every((c) => /^:?-+:?$/.test(c))) continue; // separator row
      if (!current) {
        current = { section, header: cells, rows: [] };
        tables.push(current);
      } else {
        current.rows.push(cells);
      }
    } else {
      current = null;
    }
  }
  return tables;
}

// summary.md headline labels → SsrHeadline fields. "supply-side revenue"
// appears on both sides, so the enclosing "### Prime side"/"### Sky side"
// section disambiguates.
const PRIME_KEYS = {
  "agent rate": "agentRate",
  "distribution rewards": "distributionRewards",
  "demand-side revenue": "demandSideRevenue",
  "supply-side revenue": "primeSupplySideRevenue",
};
const SKY_KEYS = {
  "prime cost of funds": "primeCostOfFunds",
  "sky direct exposure": "skyDirectExposure",
  "supply-side revenue": "skyRevenue",
};
const HEADLINE_FIELDS = [...new Set([...Object.values(PRIME_KEYS), ...Object.values(SKY_KEYS)])];

function parseSummaryMd(md) {
  const periodDays = Number(md.match(/\((\d+) days\)/)?.[1] ?? 0);

  const headline = Object.fromEntries(HEADLINE_FIELDS.map((k) => [k, null]));
  const seen = new Set();
  const venues = [];
  const refCodes = [];
  const excludedVenues = [];

  for (const t of mdTables(md)) {
    if (t.header[0] === "Field") {
      const keys = t.section === "Sky side" ? SKY_KEYS : PRIME_KEYS;
      for (const [field, value] of t.rows) {
        const key = keys[field.replaceAll("**", "").trim()];
        if (key) {
          headline[key] = money(value);
          seen.add(key);
        }
      }
    } else if (t.header[0] === "ref_code") {
      for (const r of t.rows) {
        const code = r[0].replaceAll("**", "").trim();
        if (code === "Total") continue;
        refCodes.push({ refCode: code, dr: money(r[1]), notes: r[2] ?? "" });
      }
    } else if (t.header[0] === "Venue" && t.header.length === 4) {
      // "Off-protocol holdings" / "Position-only venues" — excluded from revenue.
      for (const r of t.rows) {
        excludedVenues.push({ id: r[0], label: r[1], valueSom: money(r[2]) ?? 0, valueEom: money(r[3]) ?? 0 });
      }
    } else if (t.header[0] === "Venue") {
      for (const r of t.rows) {
        venues.push({
          id: r[0],
          label: r[1],
          valueSom: money(r[2]) ?? 0,
          valueEom: money(r[3]) ?? 0,
          periodInflow: money(r[4]) ?? 0,
          actualRev: money(r[5]) ?? 0,
          revenue: money(r[6]) ?? 0,
          sdRevenue: money(r[7]) ?? 0,
          sdShare: pct(r[8]),
          spreadReimb: money(r[9]) ?? 0,
        });
      }
    }
  }

  // Fail loudly if the headline format changed: a missing LABEL is a format
  // change (a missing VALUE, e.g. "TBD", is data and stays null).
  const missing = HEADLINE_FIELDS.filter((k) => !seen.has(k));
  if (missing.length) {
    throw new Error(`summary.md headline format changed — fields not found: ${missing.join(", ")}`);
  }

  // Derived: total prime-side result, the continuity of the old
  // "prime agent profit" headline (= demand-side + supply-side revenue).
  headline.primeAgentProfit =
    headline.demandSideRevenue !== null && headline.primeSupplySideRevenue !== null
      ? round(headline.demandSideRevenue + headline.primeSupplySideRevenue, 2)
      : null;

  return { periodDays, headline, venues, refCodes, excludedVenues };
}

/** "Sky Revenue" sheet: label→value rows, matched by label prefix. */
function parseRateBuild(ws) {
  const rb = {
    timeWeightedUtilized: null,
    baseRate: null,
    referenceRate: null,
    referenceRateKind: null,
    subsidisedRate: null,
    effectiveRate: null,
    diffVsBaseBps: null,
    subsidyBenefit: null,
    cofAtFullBase: null,
    cofOnUtilized: null,
    skyDirectComponent: null,
    skyRevenueMax: null,
    subsidyEnabled: null,
    capUsd: null,
  };
  if (!ws) return rb;
  const PREFIXES = [
    ["Time-weighted utilized", "timeWeightedUtilized"],
    ["Base rate (BR", "baseRate"],
    ["Reference rate (", "referenceRate"],
    ["Subsidised rate", "subsidisedRate"],
    ["Effective blended rate", "effectiveRate"],
    ["Diff vs base rate (bps)", "diffVsBaseBps"],
    ["Subsidy benefit to prime", "subsidyBenefit"],
    ["CoF at full base rate", "cofAtFullBase"],
    ["CoF on utilized debt", "cofOnUtilized"],
    ["+ Sky-Direct revenue", "skyDirectComponent"],
    ["Sky Revenue (max)", "skyRevenueMax"],
    ["cap_usd", "capUsd"],
  ];
  for (const row of rows(ws)) {
    const label = str(row[0]);
    if (!label) continue;
    if (label.startsWith("Reference rate (")) {
      rb.referenceRateKind = label.match(/Reference rate \(([^)]+)\)/)?.[1] ?? null;
    }
    if (label === "ref_rate_kind") rb.referenceRateKind ??= str(row[1]) || null;
    if (label === "enabled") rb.subsidyEnabled = str(row[1]) === "true";
    for (const [prefix, key] of PREFIXES) {
      if (label.startsWith(prefix) && rb[key] === null) rb[key] = num(row[1], null);
    }
  }
  return rb;
}

function parseSkyDirect(ws) {
  if (!ws) return [];
  const all = rows(ws);
  const h = all.findIndex((r) => str(r[0]) === "Venue");
  if (h === -1) return [];
  const out = [];
  for (const r of all.slice(h + 1)) {
    if (!str(r[0])) break;
    out.push({
      id: str(r[0]),
      kind: str(r[1]),
      cap: num(r[2], null),
      start: dateStr(r[3]),
      end: dateStr(r[4]),
      active: str(r[5]).toUpperCase() === "YES",
      source: str(r[6]),
      label: str(r[7]),
      actualRevenue: num(r[8], null) ?? 0,
      sdRevenue: num(r[9], null) ?? 0,
    });
  }
  return out;
}

function parseDebtDaily(ws) {
  if (!ws) return [];
  const all = rows(ws);
  const h = all.findIndex((r) => str(r[0]) === "Date");
  if (h === -1) return [];
  const header = all[h].map(str);
  // The utilized column is the unnamed one right before "SSR APY".
  const anchorIdx = header.indexOf("SSR APY");
  const chargeIdx = header.indexOf("daily Sky charge");
  if (anchorIdx === -1 || chargeIdx === -1) {
    throw new Error(`Debt sheet format changed — expected "SSR APY" and "daily Sky charge" columns, got: ${header.filter(Boolean).join(", ")}`);
  }
  const utilizedIdx = anchorIdx - 1;
  const out = [];
  for (const r of all.slice(h + 1)) {
    const date = dateStr(r[0]);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) break;
    out.push({
      date,
      cumDebt: Math.round(num(r[1], null) ?? 0),
      utilized: Math.round(num(r[utilizedIdx], null) ?? 0),
      dailySkyCharge: num(r[chargeIdx]) ?? 0,
    });
  }
  // All-zero series (partner has no ilk debt) → omit entirely.
  return out.some((d) => d.cumDebt || d.utilized || d.dailySkyCharge) ? out : [];
}

function generateSsr(reportsDir) {
  const base = path.join(reportsDir, "reports");
  const partners = fs
    .readdirSync(base)
    .filter((p) => fs.statSync(path.join(base, p)).isDirectory() && !SSR_EXCLUDED_PARTNERS.has(p))
    .sort();
  for (const p of partners) {
    if (!SSR_KNOWN_PARTNERS.has(p)) {
      throw new Error(`New partner "${p}" in settlement-reports — add it to SSR_PARTNER_META in src/lib/ssr-domain.ts and SSR_KNOWN_PARTNERS in this script.`);
    }
  }

  const reports = [];
  const monthSet = new Set();
  for (const partner of partners) {
    const months = fs.readdirSync(path.join(base, partner)).filter((m) => /^\d{4}-\d{2}$/.test(m)).sort();
    for (const month of months) {
      try {
        const dir = path.join(base, partner, month);
        const md = fs.readFileSync(path.join(dir, "summary.md"), "utf8");
        const xlsxFile = fs.readdirSync(dir).find((f) => f.endsWith(".xlsx"));
        if (!xlsxFile) throw new Error("no .xlsx settlement workbook in the report directory");
        const wb = XLSX.read(fs.readFileSync(path.join(dir, xlsxFile)), { cellDates: false });
        const { periodDays, headline, venues, refCodes, excludedVenues } = parseSummaryMd(md);
        monthSet.add(month);
        reports.push({
          partner,
          month,
          periodDays,
          headline,
          venues,
          refCodes,
          rateBuild: parseRateBuild(wb.Sheets["Sky Revenue"]),
          skyDirect: parseSkyDirect(wb.Sheets["Sky Direct"]),
          debtDaily: parseDebtDaily(wb.Sheets["Debt"]),
          excludedVenues,
        });
      } catch (e) {
        throw new Error(`settlement-reports ${partner}/${month}: ${e.message}`, { cause: e });
      }
    }
  }

  const months = [...monthSet].sort();
  const monthLabels = Object.fromEntries(months.map((m) => [m, monthLabel(m)]));

  return `/**
 * Sky Supply Side Revenues — dataset.
 *
 * GENERATED by scripts/generate-data.mjs from
 * soterlabs/settlement-reports (reports/<partner>/<month>/).
 * Do not edit by hand — run \`pnpm generate-data\` instead.
 *
 * Headline/venue/refcode/excluded rows come from summary.md; rateBuild,
 * skyDirect and debtDaily come from the .xlsx sheets (Sky Revenue / Sky
 * Direct / Debt). Values are USD unless noted; rate fields are annual
 * fractions. Skybase is intentionally excluded.
 */
import type { SsrReport } from "./ssr-types";

export const SSR_MONTHS = ${JSON.stringify(months)} as const;

export const SSR_MONTH_LABELS: Record<string, string> = ${json(monthLabels)};

export const ssrReports: SsrReport[] = ${json(reports)};
`;
}

// ---------------------------------------------------------------- Spell payments (spell-data.ts)

const SPELL_COLUMNS = [
  ["Cast date", "castDate", str],
  ["Prime", "prime", str],
  ["USDS", "usds", (v) => money(v) ?? 0],
  ["Kind", "kind", str],
  ["Settles accrual", "settlesAccrual", str],
  ["Receiving wallet (subproxy)", "receivingWallet", str],
  ["Tx hash", "txHash", str],
  ["Spell", "spell", str],
  ["Spell address", "spellAddress", str],
  ["Subproxy constant", "subproxyConstant", str],
  ["Section", "section", str],
];

function generateSpell(root) {
  const md = fs.readFileSync(path.join(root, "data", "spell-payments-to-prime-subproxies.md"), "utf8");
  const [table] = mdTables(md);
  if (!table) throw new Error("spell-payments md has no markdown table");
  const header = table.header.map(str);
  const idx = SPELL_COLUMNS.map(([col]) => header.indexOf(col));
  const missing = SPELL_COLUMNS.filter((_, i) => idx[i] === -1).map(([col]) => col);
  if (missing.length) {
    throw new Error(`spell-payments md header changed — columns not found: ${missing.join(", ")}`);
  }
  const payments = table.rows.map((r) =>
    Object.fromEntries(SPELL_COLUMNS.map(([, key, parse], i) => [key, parse(r[idx[i]])])),
  );

  return `/**
 * Sky Spell Payments to prime subproxies — dataset.
 *
 * GENERATED by scripts/generate-data.mjs from
 * data/spell-payments-to-prime-subproxies.md.
 * Do not edit by hand — run \`pnpm generate-data\` instead.
 *
 * One row per on-chain spell payment. USDS is whole USDS (not wei).
 */
import type { SpellPayment } from "./spell-types";

export const spellPayments: SpellPayment[] = ${json(payments)};
`;
}

// ---------------------------------------------------------------- main

const drDir = syncRepo("settle-dr-dune", ["dune-results/dr_comparison_latest.xlsx"]);
const reportsDir = syncRepo("settlement-reports");

const dataOut = path.join(ROOT, "src/lib/data.ts");
const ssrOut = path.join(ROOT, "src/lib/ssr-data.ts");
const spellOut = path.join(ROOT, "src/lib/spell-data.ts");

// Generate all outputs before writing any, so a parse failure never
// leaves one regenerated file paired with a stale one.
const dataTs = generateDr(drDir);
const ssrTs = generateSsr(reportsDir);
const spellTs = generateSpell(ROOT);
fs.writeFileSync(dataOut, dataTs);
console.log(`[generate-data] wrote ${path.relative(ROOT, dataOut)}`);
fs.writeFileSync(ssrOut, ssrTs);
console.log(`[generate-data] wrote ${path.relative(ROOT, ssrOut)}`);
fs.writeFileSync(spellOut, spellTs);
console.log(`[generate-data] wrote ${path.relative(ROOT, spellOut)}`);
