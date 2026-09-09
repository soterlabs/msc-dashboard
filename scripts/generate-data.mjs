/**
 * Regenerates data/generated/{dr,ssr,sky-total,tmf,prime}.json from the sources of truth:
 *
 *   - github.com/soterlabs/settle-dr-dune      → hypersync-results/dr_comparison_hypersync.xlsx
 *                                              + py/drhs/revenue/rates.py                → dr.json
 *   - github.com/soterlabs/settlement-cycle    → config/dr_ref_codes.yaml (attribution)  → dr.json
 *   - data/dr/l2-addresses.csv (local, see its README)                                   → dr.json
 *   - github.com/soterlabs/settlement-reports  → reports/<partner>/<month>/              → ssr.json
 *   - github.com/soterlabs/settlement-reports  → reports/sky_total/<month>/summary.md    → sky-total.json
 *   - github.com/soterlabs/settlement-reports  → reports/tmf/data/sbe_history.json       → tmf.json
 *   - data/prime/payments.csv (local, see its README)                                    → prime.json
 *
 * settlement-reports is settlement-cycle's publish target — reports/<partner>/
 * <month>/ there is byte-identical to settlements/<partner>/<month>/ in the
 * cycle repo, and it carries only the reports. The DR ref-code attribution has
 * no published copy, so that one file is read from settlement-cycle itself.
 *
 * The app reads those files on the server (src/lib/load.ts); nothing here
 * writes TypeScript.
 *
 * This is the REFRESH step, not part of the build. It reaches the network, so
 * it runs when someone chooses to (`pnpm refresh`), and its output is committed
 * — which makes a data change a reviewable diff instead of something that
 * happens silently at deploy time. `pnpm build` only reads the committed files.
 *
 * Sources are freshly shallow-cloned into .data-sources/ on every run (any
 * previous checkout is deleted first), or point SETTLE_DR_DUNE_DIR /
 * SETTLEMENT_CYCLE_DIR / SETTLEMENT_REPORTS_DIR at existing checkouts (a
 * settlement-cycle checkout needs no submodule). The script FAILS (nonzero exit)
 * if a source repo can't be cloned or if the source format changed in a way the
 * parsers don't recognize — writing stale or silently-wrong revenue numbers is
 * worse than a loud failure.
 *
 * Usage:
 *   pnpm refresh                    all datasets (needs network + repo access)
 *   pnpm refresh -- --only=dr,ssr   just those, cloning only the repos they need
 *   pnpm refresh:sky-total          sky-total.json only, from settlement-reports
 *   pnpm refresh:tmf                tmf.json only, from settlement-reports
 *   pnpm refresh:prime              prime.json only, from the local CSVs (offline)
 */
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import * as XLSX from "xlsx";
import * as YAML from "yaml";

import { fromCsv } from "./lib/csv.mjs";
import { readPrimePayments } from "./lib/prime-payments.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = path.join(ROOT, ".data-sources");

/** Partners intentionally excluded from the SSR section. */
const SSR_EXCLUDED_PARTNERS = new Set(["skybase"]);
/**
 * Directories under reports/ that are not partner reports at all: protocol-wide
 * aggregates, published alongside the per-partner ones. They carry no .xlsx and
 * their summary.md has its own layout (income/expense sections rather than the
 * headline + venue tables parsed here), so they are skipped before the
 * known-partner check rather than excluded as partners.
 */
const SSR_NON_PARTNER_DIRS = new Set([
  "non_msc", // Sky protocol P&L outside the prime-agent (MSC) perimeter
  "sky_total", // consolidated Sky net revenue: the primes plus non-MSC
]);
/** Known partners — a new one needs SSR_PARTNER_META (label/color) added by hand. */
const SSR_KNOWN_PARTNERS = new Set(["grove", "keel", "obex", "osero", "spark"]);

// ---------------------------------------------------------------- sources

const remoteUrl = (name) =>
  // CI/Railway builds have no SSH key — clone over HTTPS with GITHUB_TOKEN.
  process.env.GITHUB_TOKEN
    ? `https://x-access-token:${process.env.GITHUB_TOKEN}@github.com/soterlabs/${name}.git`
    : `git@github.com:soterlabs/${name}.git`;

/**
 * A source checkout, at `commit` if given and at the default branch otherwise.
 *
 * `<NAME>_DIR` points at an existing checkout and skips cloning — the caller's
 * responsibility to have it at the right revision, which is what the refresh
 * reports at the end.
 */
function syncRepo(name, sparsePaths, commit) {
  const envVar = name.toUpperCase().replaceAll("-", "_") + "_DIR";
  const envDir = process.env[envVar];
  if (envDir) {
    if (!fs.existsSync(envDir)) throw new Error(`${envVar} points to a missing directory: ${envDir}`);
    return envDir;
  }
  // Always start from a fresh clone: no stale pulls and no half-cloned cache to
  // wedge on. Any git failure throws and fails the refresh.
  const dir = path.join(CACHE, name);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(CACHE, { recursive: true });
  const git = (...args) => execFileSync("git", args, { stdio: "pipe" });

  if (commit) {
    // A specific commit cannot be `clone --depth 1`d: fetch just that one.
    git("init", "-q", dir);
    git("-C", dir, "remote", "add", "origin", remoteUrl(name));
    const fetchArgs = ["-C", dir, "fetch", "-q", "--depth", "1"];
    if (sparsePaths) {
      git("-C", dir, "sparse-checkout", "set", ...sparsePaths);
      git("-C", dir, "config", "core.sparseCheckout", "true");
      // Same deal as the --filter=blob:none clone below: fetch the tree, then
      // let the checkout pull only the blobs the sparse paths actually need.
      // Without it this drags down every blob at the commit — 11 MB of
      // settle-dr-dune for the two files that are read.
      git("-C", dir, "config", "remote.origin.promisor", "true");
      git("-C", dir, "config", "remote.origin.partialclonefilter", "blob:none");
      fetchArgs.push("--filter=blob:none");
    }
    git(...fetchArgs, "origin", commit);
    git("-C", dir, "checkout", "-q", "FETCH_HEAD");
    return dir;
  }

  const args = ["clone", "--depth", "1", "-q"];
  if (sparsePaths) args.push("--filter=blob:none", "--no-checkout");
  args.push(remoteUrl(name), dir);
  execFileSync("git", args, { stdio: "pipe" });
  if (sparsePaths) {
    git("-C", dir, "sparse-checkout", "set", ...sparsePaths);
    git("-C", dir, "checkout", "-q");
  }
  return dir;
}

/**
 * The settle-dr-dune commit a settlement-cycle checkout pins, read straight
 * from the tree — the submodule itself is never initialised.
 *
 * DR is read at that commit rather than at settle-dr-dune's own HEAD, so the
 * DR tab shows what the settlement was actually computed from. The pipeline
 * repo moves between settlements: on 2026-09-07 its HEAD carried a ref code
 * (3006) that no settlement had attributed yet, which the attribution guard
 * correctly refuses — following the pin is what makes DR and SSR agree by
 * construction instead of by luck of timing.
 */
function pinnedDrCommit(cycleDir) {
  const line = execFileSync("git", ["-C", cycleDir, "ls-tree", "HEAD", "settle-dr-dune"], {
    stdio: "pipe",
    encoding: "utf8",
  }).trim();
  const sha = line.match(/^160000 commit ([0-9a-f]{40})\t/)?.[1];
  if (!sha) {
    throw new Error(
      `settlement-cycle does not pin settle-dr-dune as a submodule (git ls-tree gave "${line}")`,
    );
  }
  return sha;
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

/** "2026-07" → "2026-07-31". */
function monthEnd(m) {
  const [y, mm] = m.split("-").map(Number);
  return `${m}-${String(new Date(Date.UTC(y, mm, 0)).getUTCDate()).padStart(2, "0")}`;
}

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

// ---------------------------------------------------------------- DR (dr.json)
//
// The DR pipeline was rebuilt on HyperSync in July 2026. Three consequences
// shape everything below, because the new workbook carries strictly less than
// the retired Dune one (dune-results/dr_comparison_latest.xlsx):
//
//   - it has no Summary tab and no `group` column, so ref-code → prime
//     attribution now comes from settlement-cycle's config/dr_ref_codes.yaml
//     (the same file the settlement itself reads — one source, no second copy);
//   - it has no Soter Rates tab: the reward schedule lives as constants in
//     settle-dr-dune's py/drhs/revenue/rates.py, parsed here;
//   - it has no L2 address sheet at all — those rows are now a hand-maintained
//     input, data/dr/l2-addresses.csv (see its README).

const DR_WORKBOOK = ["hypersync-results", "dr_comparison_hypersync.xlsx"];
const DR_RATES_PY = ["py", "drhs", "revenue", "rates.py"];
const DR_REF_CODES_YAML = ["config", "dr_ref_codes.yaml"];

/** "spark" → "Spark". Group keys must match GROUP_META in src/lib/dr/domain.ts. */
const groupLabel = (key) => key.charAt(0).toUpperCase() + key.slice(1);

/**
 * ref code → group, from settlement-cycle's config/dr_ref_codes.yaml.
 *
 * `primes:` maps a code to the prime it is settled to; `unattributed:` buckets
 * codes deliberately paid to nobody (the legacy Summary's "Other"). A code may
 * appear once across the whole file — the settlement loader enforces that
 * because a duplicate would double-pay, and this reads the same file, so it
 * enforces it too rather than quietly taking the last one.
 */
function drRefCodeGroups(cycleDir) {
  const rel = path.join(...DR_REF_CODES_YAML);
  const cfg = YAML.parse(fs.readFileSync(path.join(cycleDir, rel), "utf8")) ?? {};
  const group = new Map();
  const seenAt = new Map();

  for (const [section, key] of [["primes", "primes"], ["unattributed", "unattributed"]]) {
    for (const [name, codes] of Object.entries(cfg[key] ?? {})) {
      for (const code of codes ?? []) {
        const c = String(code).trim();
        const where = `${section}.${name}`;
        if (seenAt.has(c)) {
          throw new Error(
            `${rel}: ref code "${c}" listed twice (${seenAt.get(c)} and ${where}) — ` +
              `a duplicate would attribute the same DR to two groups`,
          );
        }
        seenAt.set(c, where);
        group.set(c, groupLabel(name));
      }
    }
  }
  if (!group.size) throw new Error(`${rel}: no ref codes under primes:/unattributed:`);
  return group;
}

/**
 * The reward schedule, parsed out of settle-dr-dune's rates.py.
 *
 * Reading Python source is not lovely, but the alternative is a second copy of
 * the rates in this repo, and a rate that drifts from the pipeline is exactly
 * the failure this dashboard exists to avoid — the XR family was cut 0.5% →
 * 0.2% on 2026-07-09 and a hand-kept copy would still be showing 0.5%. Both
 * shapes are literal tables, and a format change fails the refresh loudly.
 */
function drRates(drDir, asOf) {
  const rel = path.join(...DR_RATES_PY);
  const src = fs.readFileSync(path.join(drDir, rel), "utf8");

  const block = (name) => {
    const m = src.match(new RegExp(`^${name}\\s*=\\s*[[{]([\\s\\S]*?)^[\\]}]`, "m"));
    if (!m) throw new Error(`${rel}: ${name} table not found — the rates format changed`);
    return m[1];
  };

  const schedule = [];
  const entry = /\(\s*"([^"]+)"\s*,\s*"([^"]*)"\s*,\s*([\d.]+)\s*,\s*date\((\d+),\s*(\d+),\s*(\d+)\)\s*,\s*date\((\d+),\s*(\d+),\s*(\d+)\)\s*\)/g;
  const iso = (y, m, d) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  for (const m of block("REWARD_SCHEDULE").matchAll(entry)) {
    const apy = Number(m[3]);
    schedule.push({
      rateType: m[1],
      description: m[2],
      apy,
      // Spark's apyToAnnualizedDailyRate, as in rates.py's apy_to_daily().
      rewardPer: round(365 * (Math.exp(Math.log(1 + apy) / 365) - 1), 6),
      start: iso(m[4], m[5], m[6]),
      end: iso(m[7], m[8], m[9]),
    });
  }
  if (!schedule.length) throw new Error(`${rel}: REWARD_SCHEDULE parsed to no rows`);

  const tokenRates = [];
  for (const m of block("TOKEN_REWARD_CODE").matchAll(/"([^"]+)"\s*:\s*"([^"]+)"/g)) {
    const [token, rateType] = [m[1], m[2]];
    // The rate in force on `asOf` — the end of the reporting window, not the
    // day of the refresh, so a rebuild of the same sources reproduces byte for
    // byte and the figure matches the months on screen.
    const active = schedule.find((r) => r.rateType === rateType && r.start <= asOf && asOf <= r.end);
    if (!active) {
      throw new Error(`${rel}: no ${rateType} rate window covers ${asOf} (token ${token})`);
    }
    tokenRates.push({
      token,
      rateType,
      apy: active.apy,
      rewardPer: active.rewardPer,
      notes: "",
    });
  }
  if (!tokenRates.length) throw new Error(`${rel}: TOKEN_REWARD_CODE parsed to no rows`);

  tokenRates.sort((a, b) => a.token.localeCompare(b.token));
  return { rateSchedule: schedule, tokenRates };
}

/** data/dr/l2-addresses.csv — hand-maintained since the sheet was retired. */
function drL2Addresses() {
  const file = path.join(ROOT, "data", "dr", "l2-addresses.csv");
  const rel = path.relative(ROOT, file);
  const { header, rows: csvRows } = fromCsv(fs.readFileSync(file, "utf8"), { file: rel });
  const expected = ["chain", "label", "address", "ref_code"];
  if (header.join("|") !== expected.join("|")) {
    throw new Error(`${rel} header must be ${expected.join(",")} — got ${header.join(",")}`);
  }
  return csvRows.map((r) => ({
    chain: r.chain,
    label: r.label,
    address: r.address,
    refCode: r.ref_code,
  }));
}

function generateDr(drDir, cycleDir) {
  const wbRel = path.join(...DR_WORKBOOK);
  const wb = XLSX.read(fs.readFileSync(path.join(drDir, wbRel)));

  const sheet = (name) => {
    if (!wb.Sheets[name]) {
      throw new Error(`${wbRel} has no "${name}" sheet — tabs: ${wb.SheetNames.join(", ")}`);
    }
    return rows(wb.Sheets[name]);
  };
  const monthlyOf = (row, from, months) =>
    Object.fromEntries(months.map((m, i) => [m, num(row[from + i])]));

  // Soter by Ref Code: ref_code | month… | total | tokens | notes.
  const byRef = sheet("Soter by Ref Code");
  const header = byRef[0].map(str);
  const totalIdx = header.indexOf("total");
  const reportMonths = header.slice(1, totalIdx);
  if (totalIdx === -1 || !reportMonths.length || !reportMonths.every((m) => /^\d{4}-\d{2}$/.test(m))) {
    throw new Error(`${wbRel} "Soter by Ref Code" format changed — header: ${header.join(", ")}`);
  }

  const groupOf = drRefCodeGroups(cycleDir);
  const refCodeRows = byRef
    .slice(1)
    .filter((r) => str(r[0]) && str(r[0]) !== "Total")
    .map((r) => ({
      refCode: str(r[0]),
      group: groupOf.get(str(r[0])) ?? null,
      monthly: monthlyOf(r, 1, reportMonths),
      total: num(r[totalIdx]),
      tokens: str(r[totalIdx + 1]) ? str(r[totalIdx + 1]).split(", ") : [],
      notes: str(r[totalIdx + 2]),
    }));

  // A code the config does not know is a settlement question, not a display
  // one: it would either land in the wrong prime's revenue or vanish from the
  // dashboard while still being paid. Report every one of them, with amounts.
  const unknown = refCodeRows.filter((r) => r.group === null);
  if (unknown.length) {
    throw new Error(
      `${wbRel} carries ref code${unknown.length > 1 ? "s" : ""} missing from ` +
        `settlement-cycle's ${path.join(...DR_REF_CODES_YAML)}:\n` +
        unknown
          .map((r) => `  ${r.refCode} — $${(r.total ?? 0).toLocaleString("en-US")} total`)
          .join("\n") +
        `\n  Attribute each under primes:, or list it under unattributed:.`,
    );
  }

  // Group rollups, in config order: the retired Summary tab's per-group Total
  // rows, re-derived. Summing the codes is what settlement-cycle's own DR
  // loader does (src/settle/load/dr_rewards.py), so the two agree by
  // construction rather than by a reconciliation nobody runs.
  const byGroup = new Map();
  for (const r of refCodeRows) {
    if (!byGroup.has(r.group)) byGroup.set(r.group, []);
    byGroup.get(r.group).push(r);
  }
  const summaryGroups = [...byGroup].map(([group, codes]) => ({
    group,
    monthly: Object.fromEntries(
      reportMonths.map((m) => [m, round(codes.reduce((a, c) => a + (c.monthly[m] ?? 0), 0), 2)]),
    ),
    total: round(codes.reduce((a, c) => a + (c.total ?? 0), 0), 2),
    refCodes: codes.map((c) => ({
      refCode: c.refCode,
      monthly: c.monthly,
      total: c.total,
      notes: c.notes,
    })),
  }));

  // Soter by Ref Code Token: full history per ref code × token.
  const byTok = sheet("Soter by Ref Code Token");
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

  // Rates as they stood at the end of the reporting window.
  const lastMonth = reportMonths[reportMonths.length - 1];
  const ratesAsOf = monthEnd(lastMonth);
  const { rateSchedule, tokenRates } = drRates(drDir, ratesAsOf);

  const monthLabels = Object.fromEntries(reportMonths.map((m) => [m, monthLabel(m)]));

  // Shape mirrors DrDataset in src/lib/dr/types.ts.
  return {
    reportMonths,
    historyMonths,
    monthLabels,
    summaryGroups,
    refCodeRows,
    ratesAsOf,
    rateSchedule,
    tokenRates,
    refCodeTokenSeries,
    l2Addresses: drL2Addresses(),
  };
}

// ---------------------------------------------------------------- SSR (ssr.json)

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
    .filter(
      (p) =>
        fs.statSync(path.join(base, p)).isDirectory() &&
        !SSR_NON_PARTNER_DIRS.has(p) &&
        !SSR_EXCLUDED_PARTNERS.has(p),
    )
    .sort();
  // Report every unknown directory, not just the first: they tend to arrive in
  // batches, and a build that fails once per new directory wastes a round trip
  // each time.
  const unknown = partners.filter((p) => !SSR_KNOWN_PARTNERS.has(p));
  if (unknown.length) {
    throw new Error(
      `New partner director${unknown.length > 1 ? "ies" : "y"} in settlement-reports: ${unknown.map((p) => `"${p}"`).join(", ")}.\n` +
        `  If a prime partner: add to SSR_KNOWN_PARTNERS in this script and SSR_PARTNER_META in src/lib/ssr/domain.ts.\n` +
        `  If a protocol-wide aggregate (no .xlsx, different summary.md layout): add to SSR_NON_PARTNER_DIRS in this script.`,
    );
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

  // Shape mirrors SsrDataset in src/lib/ssr/types.ts.
  return { months, monthLabels, reports };
}

// ------------------------------------------------- Sky total net revenue (sky-total.json)
//
// The report changed methodology mid-series and the parser has to read both,
// because the closed months are not restated (see src/lib/sky-total/types.ts):
//
//   buffer basis   `## MSC leg (buffer basis)` — three columns, one row per
//                  prime per section ("Debt minted to buffer" / "Sent to prime
//                  subproxy"), each section closed by its own subtotal row.
//   accrual basis  `## MSC leg (accrual — next settlement preview)` — one row
//                  per prime with mint and send side by side, closed by a
//                  single `total` row.
//
// Both reduce to the same thing: per prime, what was minted and what went out.
// Everything below normalises to that, then reconciles the two totals and the
// headline against the figures the report prints for itself, failing the
// refresh if either drifts by more than a cent. Re-summing rather than reading
// the printed rows would quietly paper over exactly the disagreement worth
// knowing about.

/** Title-case a lowercase prime id: "spark" → "Spark", "skybase" → "Skybase". */
const primeLabel = (key) => key.charAt(0).toUpperCase() + key.slice(1);

/** Strip markdown bold, non-breaking spaces and trim: "**subtotal**" → "subtotal". */
const plain = (s) => str(s).replaceAll("**", "").replaceAll("&nbsp;", " ").trim();

/**
 * Rows of each `## <heading>` section's table, keyed by heading. Each row is an
 * array of trimmed cells; the header row (Section/Line/USDS …) is kept as row 0.
 */
function skyTotalSections(md) {
  const sections = {};
  let rows = null;
  for (const line of md.split("\n")) {
    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) {
      rows = [];
      sections[h2[1].trim()] = rows;
      continue;
    }
    const t = line.trim();
    if (rows && t.startsWith("|")) {
      const cells = t.slice(1, -1).split("|").map((c) => c.trim());
      if (!cells.every((c) => /^:?-+:?$/.test(c))) rows.push(cells);
    }
  }
  return sections;
}

/**
 * The `## MSC leg (…)` heading and its rows, whichever basis the month uses.
 *
 * The two labels are matched exactly rather than defaulting the unknown case to
 * one of them: `basis` is reader-facing — it captions the cards, the waterfall
 * and a row of the statement table — so a third methodology arriving under a
 * heading nobody has read yet must stop the refresh, not ship mislabelled.
 */
const MSC_LEG_BASES = [
  ["buffer basis", "buffer"],
  ["accrual — next settlement preview", "accrual"],
];

function mscLeg(sections) {
  for (const [heading, rows] of Object.entries(sections)) {
    const label = heading.match(/^MSC leg \((.+)\)$/)?.[1];
    if (!label) continue;
    const known = MSC_LEG_BASES.find(([text]) => text === label);
    if (!known) {
      throw new Error(
        `unrecognised MSC leg basis "${label}" — known: ` +
          `${MSC_LEG_BASES.map(([t]) => `"${t}"`).join(", ")}. ` +
          `A new methodology needs SkyTotalBasis and the view's BASIS_META extending.`,
      );
    }
    return { label, basis: known[1], rows };
  }
  throw new Error("no `## MSC leg (…)` section");
}

/**
 * Rows under a per-prime section are prime ids. Anything else there is an
 * annotation the report added ("— of which: …"), and letting one through would
 * put a bogus prime in the statement table carrying a silent 0 that reconciles
 * against nothing — so an unrecognised label stops the refresh instead.
 */
function primeKey(raw, section) {
  const key = plain(raw);
  if (/of which/i.test(key) || key.startsWith("—")) return null;
  if (!/^[a-z][a-z0-9_]*$/.test(key)) {
    throw new Error(`${section}: "${key}" is not a prime id`);
  }
  return key;
}

/**
 * Buffer basis: `| Section | Line | USDS |`, one prime per row per section.
 * Returns the per-prime lines plus the subtotals the report prints.
 */
function parseBufferMscLeg(rows) {
  const minted = new Map();
  const sent = new Map();
  let mintedTotal = null;
  let sentTotal = null;
  let mscNet = null;

  for (const [rawSection, rawLine, rawValue] of rows.slice(1)) {
    const section = plain(rawSection);
    const line = plain(rawLine);
    const value = money(rawValue);
    if (section === "Debt minted to buffer") {
      if (line.startsWith("subtotal")) mintedTotal = value;
      else {
        const key = primeKey(line, section);
        if (key) minted.set(key, value ?? 0);
      }
    } else if (section === "Sent to prime subproxy") {
      // "subtotal (raw)" before 2026-08, "subtotal (net of seedings)" after.
      if (line.startsWith("subtotal")) sentTotal = value;
      else {
        const key = primeKey(line, section);
        if (key) sent.set(key, value ?? 0);
      }
    } else if (section.startsWith("MSC net")) {
      mscNet = value;
    }
  }
  return { primes: mergePrimes(minted, sent), mintedTotal, sentTotal, mscNet };
}

/**
 * Accrual basis: `| Prime | MSC debt (mint) | Send to prime |`, closed by a
 * `total` row and then an `MSC net (accrual)` row that only fills the last cell.
 */
function parseAccrualMscLeg(rows) {
  const minted = new Map();
  const sent = new Map();
  let mintedTotal = null;
  let sentTotal = null;
  let mscNet = null;

  for (const [rawPrime, rawMint, rawSend] of rows.slice(1)) {
    const label = plain(rawPrime);
    if (!label) continue;
    if (label === "total") {
      mintedTotal = money(rawMint);
      sentTotal = money(rawSend);
    } else if (label.startsWith("MSC net")) {
      // The figure sits in the last column, the mint column being blank.
      mscNet = money(rawSend) ?? money(rawMint);
    } else {
      const key = primeKey(label, "MSC leg (accrual)");
      if (!key) continue;
      minted.set(key, money(rawMint) ?? 0);
      sent.set(key, money(rawSend) ?? 0);
    }
  }
  return { primes: mergePrimes(minted, sent), mintedTotal, sentTotal, mscNet };
}

/**
 * One row per prime named by either side. A prime that only ever appears under
 * one of them (keel and skybase draw no debt; grove_pau minted nothing) keeps a
 * real 0 rather than dropping out of the table.
 */
function mergePrimes(minted, sent) {
  const keys = [...new Set([...minted.keys(), ...sent.keys()])];
  return keys.map((key) => ({
    key,
    label: primeLabel(key),
    minted: minted.get(key) ?? 0,
    sent: sent.get(key) ?? 0,
  }));
}

/**
 * `## Below the line (…)`, buffer months only.
 *
 * These rows are matched by label like everything else here, so they get the
 * same treatment: a label that stops matching is a format change and fails the
 * refresh, and the two identities the section states are checked. Without that
 * a reworded row would quietly become a dash while "Remitted to Sky reserves"
 * kept being printed as its subtotal — a column that no longer foots, which is
 * the one failure this file exists to make impossible.
 */
function parseBelowTheLine(rows, skyNetRevenue) {
  if (!rows) return null;
  const out = {
    coreCouncil: null,
    step1Capital: null,
    genesisRepayments: null,
    capitalSeedings: null,
    remitted: null,
  };
  for (const [rawField, rawValue] of rows.slice(1)) {
    const field = plain(rawField);
    const value = money(rawValue);
    if (field.startsWith("− Core Council Buffer transfer")) out.coreCouncil = value;
    else if (/of which: Step 1 Capital/.test(field)) out.step1Capital = value;
    else if (/of which: genesis/.test(field)) out.genesisRepayments = value;
    else if (field.startsWith("− capital seedings")) out.capitalSeedings = value;
    else if (field.startsWith("remitted to Sky reserves")) out.remitted = value;
  }

  const missing = Object.entries(out).filter(([, v]) => v === null).map(([k]) => k);
  if (missing.length) {
    throw new Error(`below-the-line rows not found: ${missing.join(", ")}`);
  }

  reconcile(
    "Core Council transfer",
    round(out.step1Capital + out.genesisRepayments, 2),
    out.coreCouncil,
  );
  reconcile(
    "remitted to Sky reserves",
    round(skyNetRevenue + out.coreCouncil + out.capitalSeedings, 2),
    out.remitted,
  );
  return out;
}

function parseSkyTotalMd(md) {
  const sections = skyTotalSections(md);
  const leg = mscLeg(sections);
  const nonMsc = sections["Non-MSC leg"];
  const headline = sections["Sky Net Revenue"];
  if (!nonMsc || !headline) {
    throw new Error("expected `## Non-MSC leg` and `## Sky Net Revenue` sections");
  }

  const msc =
    leg.basis === "buffer" ? parseBufferMscLeg(leg.rows) : parseAccrualMscLeg(leg.rows);

  // Non-MSC leg: `| Line | USDS |`.
  let nonMscIncome = null;
  let nonMscExpense = null;
  let nonMscNet = null;
  let demandSideBuffer = null;
  for (const [rawLine, rawValue] of nonMsc.slice(1)) {
    const line = plain(rawLine);
    const value = money(rawValue);
    if (line === "non-MSC income") nonMscIncome = value;
    else if (line === "non-MSC expense") nonMscExpense = value;
    else if (line === "non-MSC net") nonMscNet = value;
    else if (line.startsWith("Demand-side Buffer transfer")) demandSideBuffer = value;
  }

  // Sky Net Revenue: `| Field | USDS |`.
  let skyNetRevenue = null;
  for (const [rawField, rawValue] of headline.slice(1)) {
    if (plain(rawField) === "Sky Net Revenue") skyNetRevenue = money(rawValue);
  }

  // A missing ROW is a format change, and every figure below feeds a total, so
  // a null in any of them cannot be reconciled either way.
  const required = {
    mintedTotal: msc.mintedTotal,
    sentTotal: msc.sentTotal,
    mscNet: msc.mscNet,
    nonMscIncome,
    nonMscExpense,
    nonMscNet,
    skyNetRevenue,
  };
  const missing = Object.entries(required)
    .filter(([, v]) => v === null)
    .map(([k]) => k);
  if (!msc.primes.length) missing.push("per-prime rows");
  if (missing.length) {
    throw new Error(`rows not found or empty (${leg.label}): ${missing.join(", ")}`);
  }

  // Reconcile against the report's own printed figures, on both bases.
  reconcile("minted total", sum(msc.primes.map((p) => p.minted)), msc.mintedTotal);
  reconcile("sent total", sum(msc.primes.map((p) => p.sent)), msc.sentTotal);
  reconcile("MSC net", msc.mintedTotal + msc.sentTotal, msc.mscNet);
  reconcile("non-MSC net", nonMscIncome + nonMscExpense, nonMscNet);
  reconcile("Sky Net Revenue", msc.mscNet + nonMscNet, skyNetRevenue);

  const belowKey = Object.keys(sections).find((h) => h.startsWith("Below the line"));
  const notes = md
    .split("\n")
    .filter((l) => l.trim().startsWith(">"))
    .map((l) => l.replace(/^>\s?/, "").trim());

  return {
    basis: leg.basis,
    // Buffer months name the settlement block(s) they were read from; an
    // accrual month previews a settlement that has not executed, so it has none.
    //
    // Two stages on purpose: one regex with a repeated capture group keeps only
    // that group's LAST repetition, so "**a**, **b**, **c**" would silently
    // yield a and c. Today's months list at most two.
    blocks: [...md.matchAll(/settlement blocks?\s+((?:\*\*\d+\*\*(?:,\s*)?)+)/g)]
      .flatMap((m) => [...m[1].matchAll(/\d+/g)].map((d) => Number(d[0]))),
    primes: msc.primes,
    mintedTotal: msc.mintedTotal,
    sentTotal: msc.sentTotal,
    mscNet: msc.mscNet,
    nonMscIncome,
    nonMscExpense,
    nonMscNet,
    demandSideBuffer,
    skyNetRevenue,
    belowTheLine: belowKey ? parseBelowTheLine(sections[belowKey], skyNetRevenue) : null,
    notes,
  };
}

const sum = (xs) => round(xs.reduce((a, x) => a + (x ?? 0), 0), 2);

/** Throws if a derived total drifts from the report's printed figure. */
function reconcile(what, derived, reported) {
  if (Math.abs(derived - reported) > 0.02) {
    throw new Error(
      `${what} does not reconcile: derived ${derived.toFixed(2)} vs reported ${reported.toFixed(2)}`,
    );
  }
}

function generateSkyTotal(reportsDir) {
  const base = path.join(reportsDir, "reports", "sky_total");
  if (!fs.existsSync(base)) throw new Error("settlement-reports has no reports/sky_total directory");
  const months = fs.readdirSync(base).filter((m) => /^\d{4}-\d{2}$/.test(m)).sort();
  const reports = months.map((month) => {
    try {
      const md = fs.readFileSync(path.join(base, month, "summary.md"), "utf8");
      return { month, ...parseSkyTotalMd(md) };
    } catch (e) {
      throw new Error(`settlement-reports sky_total/${month}: ${e.message}`, { cause: e });
    }
  });
  const monthLabels = Object.fromEntries(months.map((m) => [m, monthLabel(m)]));

  return { months, monthLabels, reports };
}

// ------------------------------------------------- Smart Burn Engine (tmf.json)
//
// The one dataset the refresh does not compute: upstream publishes
// reports/tmf/data/sbe_history.json already aggregated, and this copies it
// through. So the check that matters is not arithmetic but shape, and upstream
// hands us the means to make it: `schema_version` is bumped on any field
// rename or removal, so a major bump stops the refresh instead of writing a
// file whose fields the views no longer recognise.

const TMF_JSON = ["reports", "tmf", "data", "sbe_history.json"];

/** The major version of the document this refresh knows how to read. */
const TMF_SCHEMA_MAJOR = 1;

function generateTmf(reportsDir) {
  const rel = path.join(...TMF_JSON);
  const file = path.join(reportsDir, rel);
  if (!fs.existsSync(file)) {
    throw new Error(`settlement-reports has no ${rel}`);
  }

  let doc;
  try {
    doc = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    throw new Error(`${rel} is not valid JSON (${e.message})`);
  }

  const version = str(doc.schema_version);
  const major = Number(version.split(".")[0]);
  if (!/^\d+\.\d+\.\d+$/.test(version) || !Number.isInteger(major)) {
    throw new Error(`${rel}: schema_version is not semver — got ${json(doc.schema_version)}`);
  }
  if (major !== TMF_SCHEMA_MAJOR) {
    throw new Error(
      `${rel}: schema_version ${version} — this refresh reads major ${TMF_SCHEMA_MAJOR}. ` +
        `A major bump means a field was renamed or removed: reconcile src/lib/tmf/types.ts ` +
        `and the Buybacks view against the dataset's README before raising TMF_SCHEMA_MAJOR.`,
    );
  }

  // Copied through as published — quantized to cents upstream, and re-rounding
  // here would only invent a second opinion about figures we do not own. The
  // load-time validator is what checks every field arrived typed as expected.
  return doc;
}

// ------------------------------------------------------- Prime payments (prime.json)

function generatePrime() {
  // walletType, toLabel and fromLabel are resolved from data/prime/wallets.csv;
  // an unregistered wallet throws rather than defaulting to a category.
  const { payments, warnings } = readPrimePayments();

  for (const w of warnings) console.warn(`[generate-data] unclassified row — ${w}`);

  // Shape mirrors PrimeDataset in src/lib/prime/types.ts.
  return { payments };
}

// ---------------------------------------------------------------- main

const GENERATED = path.join(ROOT, "data", "generated");

const out = (name) => path.join(GENERATED, `${name}.json`);

/** Pretty-printed with a trailing newline: these files are read in diffs. */
function writeJson(name, value) {
  fs.mkdirSync(GENERATED, { recursive: true });
  fs.writeFileSync(out(name), `${json(value)}\n`);
  console.log(`[generate-data] wrote ${path.relative(ROOT, out(name))}`);
}

const DATASETS = ["dr", "ssr", "sky-total", "tmf", "prime"];

/**
 * `--only=dr,ssr` restricts the run to those datasets; no flag builds all four.
 *
 * Datasets share source repos but not failure modes: an upstream report format
 * change breaks one parser while the others are fine, and without this the
 * whole refresh is stuck behind it (every dataset is built before any is
 * written, so one throw leaves nothing regenerated). Selecting lets the
 * unaffected ones move while the broken parser is fixed — the alternative,
 * skipping the failure, is what silently ships stale numbers.
 */
function selected() {
  const arg = process.argv.find((a) => a.startsWith("--only="));
  if (!arg) return new Set(DATASETS);
  const names = arg.slice("--only=".length).split(",").map((s) => s.trim()).filter(Boolean);
  const unknown = names.filter((n) => !DATASETS.includes(n));
  if (!names.length || unknown.length) {
    throw new Error(
      `--only takes a comma-separated subset of ${DATASETS.join(", ")}` +
        (unknown.length ? ` — not ${unknown.map((n) => `"${n}"`).join(", ")}` : ""),
    );
  }
  return new Set(names);
}

function main() {
  const only = selected();
  const wants = (name) => only.has(name);

  // Sources are cloned only if something selected needs them. Prime payments
  // come from a local CSV, so `--only=prime` needs neither repo (nor SSH).
  //
  // settlement-cycle comes first: it carries the ref-code attribution AND the
  // settle-dr-dune commit the settlement used, so it decides which DR workbook
  // is read. Cloned for two files; the indexer, database and source workbooks
  // it also holds are never fetched.
  const cycleDir = wants("dr") ? syncRepo("settlement-cycle", [DR_REF_CODES_YAML.join("/")]) : null;
  const drCommit = cycleDir && !process.env.SETTLE_DR_DUNE_DIR ? pinnedDrCommit(cycleDir) : null;
  if (drCommit) {
    console.log(`[generate-data] DR at settle-dr-dune ${drCommit.slice(0, 7)} (pinned by settlement-cycle)`);
  }
  const drDir = wants("dr")
    ? syncRepo("settle-dr-dune", [DR_WORKBOOK.join("/"), DR_RATES_PY.join("/")], drCommit)
    : null;
  const reportsDir =
    wants("ssr") || wants("sky-total") || wants("tmf") ? syncRepo("settlement-reports") : null;

  // Build every selected dataset before writing any, so a parse failure never
  // leaves one regenerated file paired with a stale one.
  const built = [];
  if (wants("dr")) built.push(["dr", generateDr(drDir, cycleDir)]);
  if (wants("ssr")) built.push(["ssr", generateSsr(reportsDir)]);
  if (wants("sky-total")) built.push(["sky-total", generateSkyTotal(reportsDir)]);
  if (wants("tmf")) built.push(["tmf", generateTmf(reportsDir)]);
  if (wants("prime")) built.push(["prime", generatePrime()]);
  for (const [name, value] of built) writeJson(name, value);
}

// A validation failure is a data-entry problem, not a crash: print the report
// and exit nonzero (which fails `pnpm build`) without a Node stack trace.
try {
  main();
} catch (e) {
  console.error(`[generate-data] ${e.message}`);
  if (e.cause) console.error(e.cause);
  process.exit(1);
}
