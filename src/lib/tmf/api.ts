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

export async function fetchTmf(): Promise<TmfDataset | null> {
  const url = `${SETTLE_API_URL}/v1/tmf/history`;
  try {
    const response = await fetch(url, {
      // Next's own cache, not a module-level variable: revalidation then
      // belongs to the deployment rather than to however long this process
      // happens to live, and a build that prerenders many pages fetches once.
      next: { revalidate: 3600 },
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
  const url = `${SETTLE_API_URL}/v1/tmf/kicks?from=${since.toISOString()}&limit=5000`;
  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 },
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
        ts: String(k?.ts ?? ""),
        usds_total: Number(k?.usds_total),
        usds_buyback: Number(k?.usds_buyback),
        usds_to_stakers: Number(k?.usds_to_stakers),
        sky_bought: Number(k?.sky_bought),
      };
      const finite =
        Number.isFinite(row.usds_total) &&
        Number.isFinite(row.usds_buyback) &&
        Number.isFinite(row.usds_to_stakers) &&
        Number.isFinite(row.sky_bought);
      if (row.ts && finite) kicks.push(row);
    }
    if (kicks.length !== body.kicks.length) {
      console.warn(
        `[tmf] ${body.kicks.length - kicks.length} kick row(s) did not parse and were dropped`,
      );
    }
    return kicks;
  } catch (e) {
    return warn(`${url} — ${(e as Error).message}`, KICKS_FALLBACK);
  }
}

/** The start of the daily window, as of `now`. */
export function dailyWindowStart(now: Date): Date {
  return new Date(now.getTime() - TMF_DAILY_WINDOW_DAYS * 86_400_000);
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
