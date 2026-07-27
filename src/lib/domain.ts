/**
 * Domain metadata + derived selectors for the Sky DR console.
 *
 * Every selector takes the dataset as its first argument rather than importing
 * it: the data is loaded on the server (src/lib/load.ts) and passed in, so this
 * module stays usable from client components without pulling the dataset into
 * the browser bundle.
 */
import type {
  DrDataset,
  RefCodeRow,
  RefCodeTokenSeries,
  SummaryGroup,
} from "./types";

/**
 * Groups excluded from the dashboard. They stay in the raw dataset but never
 * surface in the KPIs, cards, tables or aggregates.
 */
export const HIDDEN_GROUPS = new Set<string>(["Other"]);

export function visibleSummaryGroups(dr: DrDataset): SummaryGroup[] {
  return dr.summaryGroups.filter((g) => !HIDDEN_GROUPS.has(g.group));
}

export function visibleRefCodeRows(dr: DrDataset): RefCodeRow[] {
  return dr.refCodeRows.filter((r) => !HIDDEN_GROUPS.has(r.group));
}

/* ------------------------------------------------------------------ groups */

export interface GroupMeta {
  label: string;
  /** CSS custom property holding the group colour. */
  colorVar: string;
  /** One-line description of what the group represents. */
  blurb: string;
}

export const GROUP_ORDER = [
  "Skybase",
  "Spark",
  "Grove",
  "Keel",
  "Osero",
  "Other",
  "Unassigned",
] as const;

export const GROUP_META: Record<string, GroupMeta> = {
  Skybase: {
    label: "Skybase",
    colorVar: "--group-skybase",
    blurb: "Sky's own referral codes (0/1) and core frontends",
  },
  Spark: {
    label: "Spark",
    colorVar: "--group-spark",
    blurb: "Spark — Sky Star (Agent) · sUSDC, spUSDC/T, sUSDS",
  },
  Grove: {
    label: "Grove",
    colorVar: "--group-grove",
    blurb: "Grove — Sky Star (Agent) · allocator codes (2000s)",
  },
  Keel: {
    label: "Keel",
    colorVar: "--group-keel",
    blurb: "Keel — Sky Star (Agent) · incl. Solana OFT bridge",
  },
  Osero: {
    label: "Osero",
    colorVar: "--group-osero",
    blurb: "Osero — integrator app codes (3000s)",
  },
  Other: {
    label: "Other",
    colorVar: "--group-other",
    blurb: "Untagged & synthetic buckets (99, 10000/10001, …)",
  },
  Unassigned: {
    label: "Unassigned",
    colorVar: "--group-unassigned",
    blurb: "Codes not mapped to a partner group",
  },
};

export function groupMeta(group: string): GroupMeta {
  return GROUP_META[group] ?? GROUP_META.Unassigned;
}

/** `var(--group-…)` colour string for a group. */
export function groupColor(group: string): string {
  return `var(${groupMeta(group).colorVar})`;
}

/** Summary groups in canonical display order (excludes hidden groups). */
export function orderedGroups(dr: DrDataset): SummaryGroup[] {
  return [...visibleSummaryGroups(dr)].sort(
    (a, b) =>
      GROUP_ORDER.indexOf(a.group as (typeof GROUP_ORDER)[number]) -
      GROUP_ORDER.indexOf(b.group as (typeof GROUP_ORDER)[number])
  );
}

/* ------------------------------------------------------------- aggregates */

const sum = (xs: (number | null | undefined)[]) =>
  xs.reduce<number>((acc, x) => acc + (x ?? 0), 0);

/** Grand total DR over the report window across visible groups. */
export function grandTotal(dr: DrDataset): number {
  return sum(visibleSummaryGroups(dr).map((g) => g.total));
}

/** Per-month DR summed across visible groups. */
export function monthTotals(dr: DrDataset): Record<string, number> {
  const groups = visibleSummaryGroups(dr);
  const out: Record<string, number> = {};
  for (const m of dr.reportMonths) {
    out[m] = sum(groups.map((g) => g.monthly[m]));
  }
  return out;
}

/** Stacked-bar rows: one per month, with a numeric field per group. */
export function groupBarData(dr: DrDataset) {
  const groups = visibleSummaryGroups(dr);
  return dr.reportMonths.map((m) => {
    const row: Record<string, string | number> = { month: m };
    for (const g of groups) row[g.group] = g.monthly[m] ?? 0;
    return row;
  });
}

export interface SummaryKpis {
  grandTotal: number;
  latestMonth: string;
  latestTotal: number;
  prevTotal: number;
  groupCount: number;
  refCodeCount: number;
}

export function summaryKpis(dr: DrDataset): SummaryKpis {
  const groups = visibleSummaryGroups(dr);
  const totals = monthTotals(dr);
  const latestMonth = dr.reportMonths[dr.reportMonths.length - 1];
  const prevMonth = dr.reportMonths[dr.reportMonths.length - 2];
  const refCodeCount = groups.reduce((acc, g) => acc + g.refCodes.length, 0);
  return {
    grandTotal: grandTotal(dr),
    latestMonth,
    latestTotal: totals[latestMonth],
    prevTotal: totals[prevMonth],
    groupCount: groups.length,
    refCodeCount,
  };
}

/* --------------------------------------------------------- ref-code views */

export interface RefCodeKpis {
  total: number;
  activeCount: number;
  withNotesCount: number;
  topRefCode: string;
  topTotal: number;
}

export function refCodeKpis(dr: DrDataset): RefCodeKpis {
  const rows = visibleRefCodeRows(dr);
  const active = rows.filter((r) => (r.total ?? 0) > 0);
  const withNotes = rows.filter((r) => r.notes.trim() !== "");
  const top = [...rows].sort((a, b) => (b.total ?? 0) - (a.total ?? 0))[0];
  return {
    total: sum(dr.refCodeRows.map((r) => r.total)),
    activeCount: active.length,
    withNotesCount: withNotes.length,
    topRefCode: top?.refCode ?? "—",
    topTotal: top?.total ?? 0,
  };
}

/** Distinct tokens that appear anywhere in the visible ref-code table. */
export function allTokens(dr: DrDataset): string[] {
  const set = new Set<string>();
  for (const r of visibleRefCodeRows(dr)) for (const t of r.tokens) set.add(t);
  return [...set].sort();
}

/** Per-token history rows for a single ref code, biggest first. */
export function seriesForRefCode(dr: DrDataset, refCode: string): RefCodeTokenSeries[] {
  return dr.refCodeTokenSeries
    .filter((s) => s.refCode === refCode)
    .sort((a, b) => (b.total ?? 0) - (a.total ?? 0));
}

/* --------------------------------------------------------------- rates */

export interface RateFamily {
  key: string;
  apy: number;
  title: string;
  blurb: string;
  colorVar: string;
}

export const RATE_FAMILIES: RateFamily[] = [
  {
    key: "XR",
    apy: 0.005,
    title: "DR boosted rate",
    blurb: "Default rate for USDS and sUSDS deposits.",
    colorVar: "--rate-xr",
  },
  {
    key: "XR*",
    apy: 0.002,
    title: "DR basic rate",
    blurb:
      "Rate of tokens held by Prime Agents, like sUSDS held by Spark Liquidity Layer.",
    colorVar: "--rate-xrstar",
  },
  {
    key: "XR-stUSDS",
    apy: 0.001,
    title: "DR rate for stUSDS",
    blurb: "stUSDS earns the lowest exchange-rate tier.",
    colorVar: "--rate-stusds",
  },
];

export function rateFamilyMeta(rateType: string): RateFamily {
  return RATE_FAMILIES.find((f) => f.key === rateType) ?? RATE_FAMILIES[0];
}

/**
 * token → rate family, built once per dataset. These lookups happen per token
 * pill inside render loops, so they stay O(1) rather than scanning tokenRates
 * on every call; the WeakMap keeps the cache tied to the dataset's lifetime.
 */
const rateTypeByToken = new WeakMap<DrDataset, Map<string, string>>();

function tokenRateTypes(dr: DrDataset): Map<string, string> {
  let map = rateTypeByToken.get(dr);
  if (!map) {
    map = new Map(dr.tokenRates.map((r) => [r.token, r.rateType]));
    rateTypeByToken.set(dr, map);
  }
  return map;
}

/** Rate family a token belongs to (XR / XR* / XR-stUSDS). */
export function tokenRateType(dr: DrDataset, token: string): string | undefined {
  return tokenRateTypes(dr).get(token);
}

/** `var(--rate-…)` colour for a token, keyed by its rate family. */
export function tokenColor(dr: DrDataset, token: string): string {
  const rt = tokenRateType(dr, token);
  const fam = RATE_FAMILIES.find((f) => f.key === rt);
  return fam ? `var(${fam.colorVar})` : "var(--faint)";
}

