/**
 * Domain metadata + derived selectors for the Supply Side Revenues view.
 *
 * Every selector takes the dataset as its first argument rather than importing
 * it: the data is loaded on the server (src/lib/load.ts) and passed in, so this
 * module stays usable from client components without pulling the dataset into
 * the browser bundle.
 */
import type { SsrDataset, SsrPartner, SsrReport, SsrVenue } from "./types";

export interface SsrPartnerMeta {
  label: string;
  colorVar: string;
  blurb: string;
}

export const SSR_PARTNER_ORDER: SsrPartner[] = ["spark", "grove", "obex", "keel"];

export const SSR_PARTNER_META: Record<SsrPartner, SsrPartnerMeta> = {
  spark: {
    label: "Spark",
    colorVar: "--group-spark",
    blurb: "SparkLend, Morpho vaults, Maple & cross-chain sUSDS POL",
  },
  grove: {
    label: "Grove",
    colorVar: "--group-grove",
    blurb: "RWA / CLO funds, Aave Horizon, Steakhouse Morpho",
  },
  obex: {
    label: "Obex",
    colorVar: "--group-obex",
    blurb: "Maple syrupUSDC (Category B vault)",
  },
  keel: {
    label: "Keel",
    colorVar: "--group-keel",
    blurb: "Bridge / aggregator — DR attribution only, no venue revenue",
  },
};

export function partnerMeta(p: SsrPartner): SsrPartnerMeta {
  return SSR_PARTNER_META[p];
}

export function partnerColor(p: SsrPartner): string {
  return `var(${SSR_PARTNER_META[p].colorVar})`;
}

export function orderedPartners(ssr: SsrDataset): SsrPartner[] {
  return SSR_PARTNER_ORDER.filter((p) => ssr.reports.some((r) => r.partner === p));
}

export function reportsFor(ssr: SsrDataset, p: SsrPartner): SsrReport[] {
  return ssr.reports
    .filter((r) => r.partner === p)
    .sort((a, b) => (a.month < b.month ? -1 : 1));
}

export function reportFor(
  ssr: SsrDataset,
  p: SsrPartner,
  month: string
): SsrReport | undefined {
  return ssr.reports.find((r) => r.partner === p && r.month === month);
}

const sum = (xs: (number | null | undefined)[]) =>
  xs.reduce<number>((acc, x) => acc + (x ?? 0), 0);

export function partnerSkyRevenue(ssr: SsrDataset, p: SsrPartner): number {
  return sum(reportsFor(ssr, p).map((r) => r.headline.skyRevenue));
}

export function partnerPrimeProfit(ssr: SsrDataset, p: SsrPartner): number {
  return sum(reportsFor(ssr, p).map((r) => r.headline.primeAgentProfit));
}

export function grandSkyRevenue(ssr: SsrDataset): number {
  return sum(ssr.reports.map((r) => r.headline.skyRevenue));
}

export function grandPrimeProfit(ssr: SsrDataset): number {
  return sum(ssr.reports.map((r) => r.headline.primeAgentProfit));
}

export function monthSkyRevenue(ssr: SsrDataset, month: string): number {
  return sum(
    ssr.reports.filter((r) => r.month === month).map((r) => r.headline.skyRevenue)
  );
}

export function monthSkyRevenues(ssr: SsrDataset): Record<string, number> {
  const out: Record<string, number> = {};
  for (const m of ssr.months) out[m] = monthSkyRevenue(ssr, m);
  return out;
}

export function venuesTracked(ssr: SsrDataset, month: string): number {
  return ssr.reports
    .filter((r) => r.month === month)
    .reduce((acc, r) => acc + r.venues.length, 0);
}

export interface SsrKpis {
  grandSky: number;
  grandPrimeProfit: number;
  latestMonth: string;
  latestSky: number;
  prevSky: number;
  partnerCount: number;
  venueCount: number;
}

export function ssrKpis(ssr: SsrDataset): SsrKpis {
  const latest = ssr.months[ssr.months.length - 1];
  const prev = ssr.months[ssr.months.length - 2];
  return {
    grandSky: grandSkyRevenue(ssr),
    grandPrimeProfit: grandPrimeProfit(ssr),
    latestMonth: latest,
    latestSky: monthSkyRevenue(ssr, latest),
    prevSky: monthSkyRevenue(ssr, prev),
    partnerCount: orderedPartners(ssr).length,
    venueCount: venuesTracked(ssr, latest),
  };
}

export function partnerMonthlyRevenues(
  ssr: SsrDataset,
  p: SsrPartner
): { month: string; sky: number; prime: number }[] {
  return ssr.months.map((m) => {
    const h = reportFor(ssr, p, m)?.headline;
    return {
      month: m,
      sky: h?.skyRevenue ?? 0,
      prime: h?.primeAgentProfit ?? 0,
    };
  });
}

export function venuesFor(ssr: SsrDataset, p: SsrPartner, month: string): SsrVenue[] {
  const r = reportFor(ssr, p, month);
  if (!r) return [];
  return [...r.venues].sort((a, b) => b.revenue - a.revenue);
}
