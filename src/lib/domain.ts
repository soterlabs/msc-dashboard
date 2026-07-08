/**
 * Domain metadata + derived selectors for the Sky DR console.
 * Pure helpers over the mock dataset in `./data`.
 */
import {
  REPORT_MONTHS,
  refCodeRows,
  refCodeTokenSeries,
  summaryGroups,
  tokenRates,
} from "./data";
import type { RefCodeTokenSeries, SummaryGroup } from "./types";

/**
 * Groups excluded from the dashboard. They stay in the raw dataset but never
 * surface in the KPIs, cards, tables or aggregates.
 */
export const HIDDEN_GROUPS = new Set<string>(["Other"]);

export const visibleSummaryGroups = summaryGroups.filter(
  (g) => !HIDDEN_GROUPS.has(g.group)
);
export const visibleRefCodeRows = refCodeRows.filter(
  (r) => !HIDDEN_GROUPS.has(r.group)
);

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
export function orderedGroups(): SummaryGroup[] {
  return [...visibleSummaryGroups].sort(
    (a, b) =>
      GROUP_ORDER.indexOf(a.group as (typeof GROUP_ORDER)[number]) -
      GROUP_ORDER.indexOf(b.group as (typeof GROUP_ORDER)[number])
  );
}

/* ------------------------------------------------------------- aggregates */

const sum = (xs: (number | null | undefined)[]) =>
  xs.reduce<number>((acc, x) => acc + (x ?? 0), 0);

/** Grand total DR over the report window across visible groups. */
export function grandTotal(): number {
  return sum(visibleSummaryGroups.map((g) => g.total));
}

/** Per-month DR summed across visible groups. */
export function monthTotals(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const m of REPORT_MONTHS) {
    out[m] = sum(visibleSummaryGroups.map((g) => g.monthly[m]));
  }
  return out;
}

/** Stacked-bar rows: one per month, with a numeric field per group. */
export function groupBarData() {
  return REPORT_MONTHS.map((m) => {
    const row: Record<string, string | number> = { month: m };
    for (const g of visibleSummaryGroups) row[g.group] = g.monthly[m] ?? 0;
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

export function summaryKpis(): SummaryKpis {
  const totals = monthTotals();
  const latestMonth = REPORT_MONTHS[REPORT_MONTHS.length - 1];
  const prevMonth = REPORT_MONTHS[REPORT_MONTHS.length - 2];
  const refCodeCount = visibleSummaryGroups.reduce(
    (acc, g) => acc + g.refCodes.length,
    0
  );
  return {
    grandTotal: grandTotal(),
    latestMonth,
    latestTotal: totals[latestMonth],
    prevTotal: totals[prevMonth],
    groupCount: visibleSummaryGroups.length,
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

export function refCodeKpis(): RefCodeKpis {
  const active = visibleRefCodeRows.filter((r) => (r.total ?? 0) > 0);
  const withNotes = visibleRefCodeRows.filter((r) => r.notes.trim() !== "");
  const top = [...visibleRefCodeRows].sort(
    (a, b) => (b.total ?? 0) - (a.total ?? 0)
  )[0];
  return {
    total: sum(refCodeRows.map((r) => r.total)),
    activeCount: active.length,
    withNotesCount: withNotes.length,
    topRefCode: top?.refCode ?? "—",
    topTotal: top?.total ?? 0,
  };
}

/** Distinct tokens that appear anywhere in the visible ref-code table. */
export function allTokens(): string[] {
  const set = new Set<string>();
  for (const r of visibleRefCodeRows) for (const t of r.tokens) set.add(t);
  return [...set].sort();
}

/** Per-token history rows for a single ref code, biggest first. */
export function seriesForRefCode(refCode: string): RefCodeTokenSeries[] {
  return refCodeTokenSeries
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

const TOKEN_RATE_TYPE: Record<string, string> = Object.fromEntries(
  tokenRates.map((r) => [r.token, r.rateType])
);

/** Rate family a token belongs to (XR / XR* / XR-stUSDS). */
export function tokenRateType(token: string): string | undefined {
  return TOKEN_RATE_TYPE[token];
}

/** `var(--rate-…)` colour for a token, keyed by its rate family. */
export function tokenColor(token: string): string {
  const rt = TOKEN_RATE_TYPE[token];
  const fam = RATE_FAMILIES.find((f) => f.key === rt);
  return fam ? `var(${fam.colorVar})` : "var(--faint)";
}

