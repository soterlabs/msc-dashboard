/**
 * The Smart Burn Engine history, read live from settle-api.
 *
 * SERVER ONLY. This is the repo's one live dataset: everything settled — dr,
 * ssr, sky-total, prime — still comes from committed JSON that a build reads
 * offline, and nothing here changes that. The buyback series moves daily and
 * has no monthly settlement to hang a refresh off, which is the whole reason
 * it gets a second tier.
 *
 * The response is the same schema-1.1.0 document the refresh writes, plus a
 * `run` key, so it goes through `validateTmf` exactly as the file does. A live
 * source is a better reason to validate, not a worse one: nobody reviews this
 * payload in a pull request first.
 *
 * Every failure returns null rather than throwing. The caller falls back to
 * the committed snapshot, which is what keeps an offline build — and an API
 * outage — from taking the page down.
 */
import { validateTmf } from "../dataset-schema.ts";
import { TMF_DAILY_WINDOW_DAYS, type TmfDataset, type TmfKick } from "./types.ts";

const DEFAULT_API_URL = "https://settle-api-production.up.railway.app";

/**
 * Defaulted so a checkout runs with no env at all. `SETTLE_API_URL` wins when
 * set, for pointing a build at another instance.
 *
 * Empty strings are ignored, not accepted: an unset variable materialises as
 * "" often enough (Railway, CI) and `??` would take it, leaving a relative
 * `/v1/tmf/history` that fetch rejects — the live tier would be permanently
 * off behind a generic warning.
 */
const configured = [process.env.SETTLE_API_URL, process.env.NEXT_PUBLIC_SETTLE_API_URL]
  .map((v) => v?.trim())
  .find((v) => v);

export const SETTLE_API_URL = configured ?? DEFAULT_API_URL;

/** Long enough for a cold Railway container, short enough not to stall a build. */
const TIMEOUT_MS = 5_000;

/**
 * Seconds the fetch cache holds a response.
 *
 * The upstream cron ticks hourly and the API serves its documents with
 * `Cache-Control: public, max-age=300`, so five minutes bounds the page at
 * that far behind the store while keeping upstream calls to at most one per
 * five minutes per instance, whatever the traffic. Since the page renders per
 * request, this is the knob that sets the call rate — not the page.
 */
const REVALIDATE_SECONDS = 300;

export async function fetchTmf(): Promise<TmfDataset | null> {
  const url = `${SETTLE_API_URL}/v1/tmf/history`;
  try {
    const response = await fetch(url, {
      // Next's own cache, not a module-level variable: revalidation then
      // belongs to the deployment rather than to however long this process
      // happens to live, and a build that prerenders many pages fetches once.
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { accept: "application/json" },
    });
    if (!response.ok) {
      return warn(
        `${url} responded ${response.status} ${response.statusText}`,
        HISTORY_FALLBACK,
      );
    }
    // Validated before it is trusted — a 200 carrying a renamed field is the
    // failure this guards, and it looks identical to success until rendered.
    // Named as the API so a schema complaint does not send whoever is on call
    // to fix a committed file that is fine.
    return validateTmf(await response.json(), {
      label: `the settle-api response from ${url}`,
      remedy: "check the API's schema_version against src/lib/tmf/types.ts",
    });
  } catch (e) {
    return warn(`${url} — ${(e as Error).message}`, HISTORY_FALLBACK);
  }
}

/** Rows per request. The 90-day window is ~1k today; this is headroom, not a cap. */
const KICK_LIMIT = 5000;

/**
 * A decimal amount, or null when it is not one.
 *
 * `Number()` is not enough on its own: it maps null and "" to 0, both of which
 * pass `Number.isFinite`, so a row with a null leg would be summed as zero and
 * quietly understate the series — the exact corruption the check exists to
 * stop.
 */
function amount(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v !== "string" || v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const HISTORY_FALLBACK = "live history unavailable, falling back to the committed snapshot";
const KICKS_FALLBACK = "per-kick data unavailable, the daily series will be omitted";

/**
 * Per-kick rows since `since`, for the daily series the published document does
 * not carry.
 *
 * Separate from the history fetch on purpose: this one is allowed to fail on
 * its own. The tab's figures all come from the document, and losing this costs
 * the daily granularity and the 24-hour card — not the page.
 *
 * Amounts arrive as decimal strings and are parsed here; a row that does not
 * parse to finite numbers is dropped rather than poisoning a sum with NaN.
 */
export async function fetchTmfKicks(since: Date): Promise<TmfKick[] | null> {
  const url = `${SETTLE_API_URL}/v1/tmf/kicks?from=${since.toISOString()}&limit=${KICK_LIMIT}`;
  try {
    const response = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { accept: "application/json" },
    });
    if (!response.ok) {
      return warn(
        `${url} responded ${response.status} ${response.statusText}`,
        KICKS_FALLBACK,
      );
    }
    const body = await response.json();
    if (!Array.isArray(body?.kicks)) {
      return warn(`${url} — no kicks array in the response`, KICKS_FALLBACK);
    }
    const kicks: TmfKick[] = [];
    for (const k of body.kicks) {
      const row = {
        ts: typeof k?.ts === "string" ? k.ts : "",
        usds_total: amount(k?.usds_total),
        usds_buyback: amount(k?.usds_buyback),
        usds_to_stakers: amount(k?.usds_to_stakers),
        sky_bought: amount(k?.sky_bought),
      };
      const parsed =
        // A timestamp this code can actually order and bucket by. Both the
        // 24-hour filter and the day bucketing are string operations, so a
        // change of format upstream would silently regroup rows rather than
        // fail; parsing it here turns that into a dropped row and a warning.
        Number.isFinite(Date.parse(row.ts)) &&
        row.usds_total !== null &&
        row.usds_buyback !== null &&
        row.usds_to_stakers !== null &&
        row.sky_bought !== null;
      if (parsed) {
        kicks.push(row as TmfKick);
      }
    }
    if (kicks.length !== body.kicks.length) {
      console.warn(
        `[tmf] ${body.kicks.length - kicks.length} kick row(s) did not parse and were dropped`,
      );
    }
    // The window is bounded by a row count, so a faster kick cadence — `hop` is
    // a governance parameter this very tab tracks — would quietly shorten it
    // while the chart still captions itself "last 90 days".
    if (body.kicks.length >= KICK_LIMIT) {
      console.warn(
        `[tmf] the per-kick response hit its ${KICK_LIMIT}-row limit, so the daily ` +
          `series may not reach back the full ${TMF_DAILY_WINDOW_DAYS} days`,
      );
    }
    return kicks;
  } catch (e) {
    return warn(`${url} — ${(e as Error).message}`, KICKS_FALLBACK);
  }
}

/**
 * The start of the daily window, floored to the hour.
 *
 * Not `now − 90d` to the millisecond: that value is different on every render,
 * so the URL is different, so the fetch cache key is different and the
 * revalidation could never hit — one prerender of five buyback paths made five
 * upstream calls of up to 5000 rows each, and gave the five pages five
 * slightly different windows.
 *
 * Flooring keeps the key stable across the renders inside an hour. It no
 * longer equals the revalidation period, which is shorter: within one hour
 * that is at most a dozen refreshes of a single key, rather than a new key per
 * render.
 */
export function dailyWindowStart(now: Date): Date {
  const hour = new Date(now);
  hour.setUTCMinutes(0, 0, 0);
  return new Date(hour.getTime() - TMF_DAILY_WINDOW_DAYS * 86_400_000);
}

/**
 * A warning, not a throw: the caller has something to fall back to, and the
 * build has to survive having no network at all.
 *
 * The consequence is spelled out per caller. The history document falls back
 * to a committed snapshot; the kick rows have none — they are the only source
 * of the daily series — so saying "falling back to the snapshot" there would
 * send a reader looking for a file that has nothing to do with it.
 */
function warn(reason: string, consequence: string): null {
  console.warn(`[tmf] ${consequence}: ${reason}`);
  return null;
}
