/** A `YYYY-MM` month with settlement reports (driven by SSR_MONTHS in ssr-data.ts). */
export type SsrMonth = string;

export type SsrPartner = "grove" | "keel" | "obex" | "spark";

/** Mirrors the summary.md headline: prime side (demand + supply) and sky side. */
export interface SsrHeadline {
  agentRate: number | null;
  distributionRewards: number | null;
  /** Prime demand-side revenue (= agent rate + distribution rewards). */
  demandSideRevenue: number | null;
  /** Prime supply-side revenue. */
  primeSupplySideRevenue: number | null;
  /** Derived: demand-side + supply-side revenue (total prime-side result). */
  primeAgentProfit: number | null;
  primeCostOfFunds: number | null;
  skyDirectExposure: number | null;
  /** Sky supply-side revenue (Sky's total take for the month). */
  skyRevenue: number | null;
}

export interface SsrVenue {
  id: string;
  label: string;
  valueSom: number;
  valueEom: number;
  periodInflow: number;
  actualRev: number;
  revenue: number;
  sdRevenue: number;
  sdShare: number;
  spreadReimb: number;
}

export interface SsrRefCode {
  refCode: string;
  dr: number | null;
  notes: string;
}

export interface SsrRateBuild {
  timeWeightedUtilized: number | null;
  baseRate: number | null;
  referenceRate: number | null;
  referenceRateKind: string | null;
  subsidisedRate: number | null;
  effectiveRate: number | null;
  diffVsBaseBps: number | null;
  subsidyBenefit: number | null;
  cofAtFullBase: number | null;
  cofOnUtilized: number | null;
  skyDirectComponent: number | null;
  skyRevenueMax: number | null;
  subsidyEnabled: boolean | null;
  capUsd: number | null;
}

export interface SsrSkyDirectExposure {
  id: string;
  kind: string;
  cap: number | null;
  start: string;
  end: string;
  active: boolean;
  source: string;
  label: string;
  actualRevenue: number;
  sdRevenue: number;
}

export interface SsrDebtDay {
  date: string;
  cumDebt: number;
  utilized: number;
  dailySkyCharge: number;
}

export interface SsrExcludedVenue {
  id: string;
  label: string;
  valueSom: number;
  valueEom: number;
}

export interface SsrReport {
  partner: SsrPartner;
  month: SsrMonth;
  periodDays: number;
  headline: SsrHeadline;
  venues: SsrVenue[];
  refCodes: SsrRefCode[];
  rateBuild: SsrRateBuild | null;
  skyDirect: SsrSkyDirectExposure[];
  debtDaily: SsrDebtDay[];
  excludedVenues: SsrExcludedVenue[];
}
