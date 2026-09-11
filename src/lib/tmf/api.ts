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
import type { TmfDataset } from "./types";

/**
 * Defaulted so a checkout runs with no env at all. `SETTLE_API_URL` wins when
 * set, for pointing a local build at a different instance.
 */
export const SETTLE_API_URL =
  process.env.SETTLE_API_URL ??
  process.env.NEXT_PUBLIC_SETTLE_API_URL ??
  "https://settle-api-production.up.railway.app";

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
      return warn(`${url} responded ${response.status} ${response.statusText}`);
    }
    // Validated before it is trusted — a 200 carrying a renamed field is the
    // failure this guards, and it looks identical to success until rendered.
    return validateTmf(await response.json());
  } catch (e) {
    return warn(`${url} — ${(e as Error).message}`);
  }
}

/**
 * A warning, not a throw: the caller has a snapshot to fall back to, and the
 * build has to survive having no network at all.
 */
function warn(reason: string): null {
  console.warn(`[tmf] live fetch failed, falling back to the snapshot: ${reason}`);
  return null;
}
