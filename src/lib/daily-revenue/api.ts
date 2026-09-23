/** Server-side public API reads only. No request starts a backend calculation. */
import { validateHistory, validateLatest, validateStatus } from "./schema.ts";
import type { DailyPrime, History, ReadResult } from "./types";

const DEFAULT_REVENUE_API_URL = "https://settle-api-production.up.railway.app";
const host = (value: string | undefined) => value?.trim().replace(/\/$/, "") || undefined;

/** Where this process reads. SETTLE_API_URL is server-only and may name a host
 * no browser can resolve, which is the whole reason it is not NEXT_PUBLIC_. */
export const REVENUE_API_URL = host(process.env.SETTLE_API_URL) ?? host(process.env.NEXT_PUBLIC_SETTLE_API_URL) ?? DEFAULT_REVENUE_API_URL;

/** The same API as a reader's browser reaches it, for links they click. The
 * server-only variable is deliberately not consulted: an internal hostname in
 * an href is a dead link in the page and a leaked hostname in its HTML. */
export const REVENUE_PUBLIC_URL = host(process.env.NEXT_PUBLIC_SETTLE_API_URL) ?? DEFAULT_REVENUE_API_URL;

/** The API answered and the validators rejected what it said. Kept apart from a
 * transport failure so a renamed field is not reported to readers as an outage,
 * and so the cause reaches the server log instead of being swallowed. */
class InvalidResponse extends Error {}
interface Entry { data: unknown; etag: string | null; expires: number; verifiedAt: string }
interface RequestOptions<T> {
  cache?: boolean;
  statusEndpoint?: boolean;
  /** A validated compatible response from a narrower/older history window. */
  fallback?: Entry;
  onVerified?: (entry: Entry, data: T) => void;
}

/** Bounded per-process cache. Expired entries are revalidated before rendering;
 * they are only served stale on an explicit error, with their original as-of.
 * Deploy/restart clears this cache; the canonical monthly files remain usable. */
export function createRevenueClient(fetcher: typeof fetch = fetch, now: () => number = Date.now, base = REVENUE_API_URL,
  log: (message: string, cause: unknown) => void = console.error) {
  const entries = new Map<string, Entry>();
  const historyFallbacks = new Map<string, Entry>();
  const pending = new Map<string, Promise<ReadResult<unknown>>>();
  async function request<T>(path: string, validate: (value: unknown) => T, options: RequestOptions<T> = {}): Promise<ReadResult<T>> {
    const { cache = true, statusEndpoint = false, fallback, onVerified } = options;
    const previous = entries.get(path);
    if (previous && previous.expires > now()) return { data: previous.data as T, source: "cache", verifiedAt: previous.verifiedAt, error: null };
    if (pending.has(path)) return pending.get(path)! as Promise<ReadResult<T>>;
    const work = (async (): Promise<ReadResult<T>> => {
      try {
        const response = await fetcher(`${base}${path}`, {
          cache: "no-store", signal: AbortSignal.timeout(5000),
          headers: { accept: "application/json", ...(previous?.etag ? { "if-none-match": previous.etag } : {}) },
        });
        if (response.status === 404) {
          const retained = previous ?? fallback;
          if (retained) return { data: retained.data as T, source: "cache", verifiedAt: retained.verifiedAt,
            error: "Live API returned no publication; showing the last successfully verified response." };
          return { data: null, source: "missing", verifiedAt: new Date(now()).toISOString(), error: "No published estimate for this selection." };
        }
        const notModified = response.status === 304 && previous;
        if (!notModified && !response.ok && !(statusEndpoint && response.status === 503)) throw new Error(`API returned ${response.status}`);
        let data: T;
        if (notModified) data = previous.data as T;
        else {
          try { data = validate(await response.json()); }
          catch (cause) { throw new InvalidResponse(`${path} did not match the expected shape`, { cause }); }
        }
        const verifiedAt = new Date(now()).toISOString();
        const verified = { data, etag: response.headers.get("etag") ?? (notModified ? previous.etag : null), expires: now(), verifiedAt };
        if (cache) {
          const control = response.headers.get("cache-control") ?? "";
          const maxAge = /(?:^|,)\s*max-age=(\d+)/i.exec(control)?.[1];
          if (!/no-store/i.test(control)) {
            // Respect shorter API lifetimes, and never hide revisions >5 min.
            const seconds = /no-cache/i.test(control) ? 0 : Math.min(Number(maxAge ?? 0), 300);
            entries.delete(path);
            verified.expires = now() + seconds * 1000;
            entries.set(path, verified);
            if (entries.size > 96) entries.delete(entries.keys().next().value!);
          } else entries.delete(path);
        }
        onVerified?.(verified, data);
        return { data, source: "api", verifiedAt, error: null };
      } catch (cause) {
        const invalid = cause instanceof InvalidResponse;
        log(`[daily-revenue] ${path}: ${invalid ? "invalid response" : "read failed"}`, cause);
        const retained = previous ?? fallback;
        return retained
          ? { data: retained.data as T, source: "cache", verifiedAt: retained.verifiedAt,
              error: `Live API ${invalid ? "returned an unexpected response" : "unavailable"}; showing the last successfully verified response.` }
          : { data: null, source: "unavailable", verifiedAt: null,
              error: `Daily revenue API ${invalid ? "returned an unexpected response" : "unavailable"}. Settled reports remain available.` };
      }
    })();
    pending.set(path, work);
    try { return await work; } finally { pending.delete(path); }
  }
  return {
    latest: (prime: DailyPrime) => request(`/v1/revenue/${prime}/latest`, (v) => validateLatest(v, prime)),
    history: (prime: DailyPrime, start: string, end: string) => {
      const fallbackKey = `${prime}:${start}`;
      return request(`/v1/revenue/${prime}/history?start=${start}&end=${end}&limit=90`, (v) => validateHistory(v, prime, start, end), {
        fallback: historyFallbacks.get(fallbackKey),
        onVerified: (entry, data: History) => {
          const current = historyFallbacks.get(fallbackKey)?.data as History | undefined;
          if (!current || data.end >= current.end) historyFallbacks.set(fallbackKey, entry);
        },
      });
    },
    status: () => request("/v1/revenue/status", validateStatus, { cache: false, statusEndpoint: true }),
  };
}
export const revenueClient = createRevenueClient();
