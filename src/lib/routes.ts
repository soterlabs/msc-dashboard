/**
 * The console's URL map.
 *
 * One module because three places have to agree on it: the route segments under
 * src/app/, the sidebar that links into them, and the views that push a new URL
 * when you drill into something. A slug typed twice is a 404 nobody notices
 * until they share the link.
 *
 * URLs carry NAVIGATION only — which report, which prime, which month, which
 * ref code. Filters, sort and search stay in component state: they are how you
 * are reading a page, not which page it is, and a URL that changes on every
 * keystroke is worse than one that does not.
 */
import { FLAGS, type Flags } from "./flags";

export type Section = "dr" | "ssr" | "sky-total" | "prime";

export interface SectionRoute {
  key: Section;
  /** First path segment. Spelled out — these are meant to be read and shared. */
  slug: string;
  label: string;
  /** What the header credits as the source of the figures. */
  source: string;
  /** Sections without a flag are always reachable; see src/lib/flags.ts. */
  flag?: keyof Flags;
}

export const SECTIONS: SectionRoute[] = [
  {
    key: "dr",
    slug: "distribution-rewards",
    label: "Distribution Rewards",
    // The Dune workbook this used to name was retired in #22.
    source: "dr_comparison_hypersync.xlsx",
  },
  {
    key: "ssr",
    slug: "supply-side-revenues",
    label: "Supply Side Revenues",
    source: "soter · settlement-reports",
  },
  {
    key: "sky-total",
    slug: "sky-total",
    label: "Sky Total Net Revenue",
    source: "soter · settlement-reports · sky_total",
    flag: "skyTotalNetRevenue",
  },
  {
    key: "prime",
    slug: "prime-payments",
    label: "Prime Payments",
    source: "prime/payments.csv",
    flag: "primePayments",
  },
];

/** Reachable in this build. Flags are build-time, so this settles at load. */
export const VISIBLE_SECTIONS = SECTIONS.filter((s) => !s.flag || FLAGS[s.flag]);

export const isVisible = (key: Section) => VISIBLE_SECTIONS.some((s) => s.key === key);

const bySlug = new Map(SECTIONS.map((s) => [s.slug, s]));

/** The section a pathname belongs to, or undefined for an unknown one. */
export function sectionFromPath(pathname: string): SectionRoute | undefined {
  return bySlug.get(pathname.split("/").filter(Boolean)[0] ?? "");
}

const slugOf = (key: Section) => SECTIONS.find((s) => s.key === key)!.slug;

/** The section landing pages, and every drill-down inside them. */
export const paths = {
  home: `/${slugOf("dr")}`,

  dr: (tab?: DrTab) => (tab && tab !== "summary" ? `/${slugOf("dr")}/${tab}` : `/${slugOf("dr")}`),
  /** A single ref code's history, inside the ledger. */
  drRefCode: (refCode: string) => `/${slugOf("dr")}/refcodes/${encodeURIComponent(refCode)}`,

  ssr: () => `/${slugOf("ssr")}`,
  /** A prime's settlement; without a month, its latest. */
  ssrPartner: (partner: string, month?: string) =>
    month ? `/${slugOf("ssr")}/${partner}/${month}` : `/${slugOf("ssr")}/${partner}`,

  skyTotal: (month?: string) =>
    month ? `/${slugOf("sky-total")}/${month}` : `/${slugOf("sky-total")}`,

  prime: () => `/${slugOf("prime")}`,
};

export const DR_TABS = ["summary", "refcodes", "rates"] as const;
export type DrTab = (typeof DR_TABS)[number];

export const isDrTab = (v: string): v is DrTab => (DR_TABS as readonly string[]).includes(v);

/** `YYYY-MM`, the shape every month segment takes. */
export const isMonthSegment = (v: string) => /^\d{4}-\d{2}$/.test(v);
