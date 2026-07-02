export type SsrMonth = "2026-01" | "2026-02" | "2026-03" | "2026-04" | "2026-05";

export type SsrPartner = "grove" | "keel" | "obex" | "spark";

export interface SsrHeadline {
  agentRate: number | null;
  distributionRewards: number | null;
  primeAgentNetRevenue: number | null;
  primeSideSkyDirectExposure: number | null;
  primeAgentProfit: number | null;
  primeCostOfFunds: number | null;
  skySideSkyDirectExposure: number | null;
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
