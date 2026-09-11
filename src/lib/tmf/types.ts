/**
 * Smart Burn Engine history, from settlement-reports
 * `reports/tmf/data/sbe_history.json` (field definitions in the README beside
 * it). Buybacks, the dividend leg, and the SKY actually burned.
 *
 * Unlike the other datasets this one arrives already aggregated and already
 * versioned: upstream owns the arithmetic, the refresh copies it through, and
 * `schema_version` is what tells us whether the shape below still holds.
 */

/** Semver. The refresh fails the build when the major is not 1. */
export type TmfSchemaVersion = string;

export interface TmfSource {
  chain: string;
  from_block: number;
  to_block: number;
  /** ISO-8601 UTC — how current the figures are. */
  to_ts: string;
  /** Chainlog role → address. */
  contracts: Record<string, string>;
  /** How each series is derived on chain. */
  events: Record<string, string>;
}

/**
 * One period's aggregates. `period` is "YYYY-MM", "YYYY-Qn", "YYYY", or "all"
 * on the totals row.
 *
 * A period appears only if it holds at least one kick or burn, so a row is
 * never all zeroes. One with burns but no kicks has `kicks: 0` and null price
 * and timestamps — there was no trade to price, which is not the same as a
 * price of zero, and the view renders those as "—".
 */
export interface TmfPeriod {
  period: string;
  kicks: number;
  /** USDS the Splitter sent to the Flapper to buy SKY. */
  usds_buyback: number;
  /** USDS sent to the USDS staker farm — the dividend leg. */
  usds_to_stakers: number;
  /** The two above summed: USDS pulled from the surplus. */
  usds_total: number;
  sky_bought: number;
  /** usds_buyback / sky_bought, volume-weighted. Null with no kicks. */
  sky_avg_price: number | null;
  /** SKY sent to a burn sink by the Pause Proxy — the true burn. */
  sky_burn_protocol: number;
  /** SKY sent to 0x…dEaD by anyone else. A footnote, not a headline. */
  sky_burn_other: number;
  burn_events: number;
  first_ts: string | null;
  last_ts: string | null;
}

/** The most recent Splitter kick, with the levers in force when it ran. */
export interface TmfLatestKick {
  ts: string;
  block: number;
  tx: string;
  usds_buyback: number;
  usds_to_stakers: number;
  usds_total: number;
  sky_bought: number;
  /** Share of the surplus routed to the buyback, 0–1. */
  splitter_burn: number;
  /** Seconds between kicks. */
  splitter_hop: number;
}

/**
 * A `File` event on the Splitter, Kicker or Flapper.
 *
 * `contract` is the chainlog role and `address` the emitting contract — the
 * legacy and live Flapper both answer to MCD_FLAP, so the role alone does not
 * say which one filed the change.
 *
 * `value` is a string: exact decimal digits for a numeric lever, an address
 * for a pointer re-filing (`what` = farm | flapper | pip).
 */
export interface TmfParameterChange {
  ts: string;
  block: number;
  tx: string;
  contract: string;
  address: string;
  what: string;
  value: string;
}

/**
 * The run that produced the document. Present only on the API's response —
 * the committed snapshot is written from settlement-reports, which carries no
 * run of its own — so the view treats it as optional and says "snapshot" when
 * it is absent.
 */
export interface TmfRun {
  run_id: number;
  finished_at: string;
  settle_version: string;
}

/**
 * One Splitter kick, from /v1/tmf/kicks. Amounts arrive as decimal strings —
 * the endpoint keeps full precision where the aggregates are quantized — so
 * they are parsed on the way in.
 */
export interface TmfKick {
  ts: string;
  usds_total: number;
  usds_buyback: number;
  usds_to_stakers: number;
  sky_bought: number;
}

/**
 * Granularities the tab offers. `daily` is not in the published document:
 * it is aggregated from the per-kick endpoint over a recent window, so it
 * covers less history than the others and says so on screen.
 */
export const TMF_GRANULARITIES = ["daily", "monthly", "quarterly", "annual"] as const;
export type TmfGranularity = (typeof TMF_GRANULARITIES)[number];

/** Granularities the history document publishes itself. */
export const TMF_DOCUMENT_GRANULARITIES = ["monthly", "quarterly", "annual"] as const;
export type TmfDocumentGranularity = (typeof TMF_DOCUMENT_GRANULARITIES)[number];

/** How far back the daily series reaches, in days. */
export const TMF_DAILY_WINDOW_DAYS = 90;

export interface TmfDataset {
  schema_version: TmfSchemaVersion;
  generated_at: string;
  source: TmfSource;
  /** One sentence per series, straight from upstream. */
  definitions: Record<string, string>;
  /** Caveats a reader needs; rendered verbatim. */
  notes: string[];
  totals: TmfPeriod;
  latest_kick: TmfLatestKick;
  periods: Record<TmfDocumentGranularity, TmfPeriod[]>;
  parameter_changes: TmfParameterChange[];
  /** Set by the API, absent from the committed snapshot. */
  run?: TmfRun;
}

/** Which tier a dataset came from, and when it was read. */
export interface TmfLoad {
  data: TmfDataset;
  /**
   * "api" — read live from settle-api.
   * "snapshot" — the API could not be reached, so the committed file was used.
   */
  source: "api" | "snapshot";
  /** ISO-8601, when this process read it. */
  fetchedAt: string;
  /**
   * Daily rows aggregated from the per-kick endpoint, newest last. Empty when
   * that call failed — the tab then drops the daily option rather than showing
   * an empty chart.
   */
  daily: TmfPeriod[];
  /** The last 24 hours, or null when the per-kick endpoint was unreachable. */
  last24h: TmfPeriod | null;
}
