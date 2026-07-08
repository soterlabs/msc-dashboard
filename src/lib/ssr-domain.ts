import { SSR_MONTHS, ssrReports } from "./ssr-data";
import type { SsrPartner, SsrReport, SsrVenue } from "./ssr-types";

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

export function orderedPartners(): SsrPartner[] {
  return SSR_PARTNER_ORDER.filter((p) => ssrReports.some((r) => r.partner === p));
}

export function reportsFor(p: SsrPartner): SsrReport[] {
  return ssrReports
    .filter((r) => r.partner === p)
    .sort((a, b) => (a.month < b.month ? -1 : 1));
}

export function reportFor(
  p: SsrPartner,
  month: string
): SsrReport | undefined {
  return ssrReports.find((r) => r.partner === p && r.month === month);
}

const sum = (xs: (number | null | undefined)[]) =>
  xs.reduce<number>((acc, x) => acc + (x ?? 0), 0);

export function partnerSkyRevenue(p: SsrPartner): number {
  return sum(reportsFor(p).map((r) => r.headline.skyRevenue));
}

export function partnerPrimeProfit(p: SsrPartner): number {
  return sum(reportsFor(p).map((r) => r.headline.primeAgentProfit));
}

export function grandSkyRevenue(): number {
  return sum(ssrReports.map((r) => r.headline.skyRevenue));
}

export function grandPrimeProfit(): number {
  return sum(ssrReports.map((r) => r.headline.primeAgentProfit));
}

export function monthSkyRevenue(month: string): number {
  return sum(
    ssrReports.filter((r) => r.month === month).map((r) => r.headline.skyRevenue)
  );
}

export function monthSkyRevenues(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const m of SSR_MONTHS) out[m] = monthSkyRevenue(m);
  return out;
}

export function venuesTracked(month: string): number {
  return ssrReports
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

export function ssrKpis(): SsrKpis {
  const latest = SSR_MONTHS[SSR_MONTHS.length - 1];
  const prev = SSR_MONTHS[SSR_MONTHS.length - 2];
  return {
    grandSky: grandSkyRevenue(),
    grandPrimeProfit: grandPrimeProfit(),
    latestMonth: latest,
    latestSky: monthSkyRevenue(latest),
    prevSky: monthSkyRevenue(prev),
    partnerCount: orderedPartners().length,
    venueCount: venuesTracked(latest),
  };
}

export function partnerMonthlyRevenues(
  p: SsrPartner
): { month: string; sky: number; prime: number }[] {
  return SSR_MONTHS.map((m) => {
    const h = reportFor(p, m)?.headline;
    return {
      month: m,
      sky: h?.skyRevenue ?? 0,
      prime: h?.primeAgentProfit ?? 0,
    };
  });
}

export function venuesFor(p: SsrPartner, month: string): SsrVenue[] {
  const r = reportFor(p, month);
  if (!r) return [];
  return [...r.venues].sort((a, b) => b.revenue - a.revenue);
}
