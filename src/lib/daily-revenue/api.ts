/** Server-side public API reads only. No request starts a backend calculation. */
import { validateHistory, validateLatest, validateStatus } from "./schema.ts";
import type { DailyPrime, ReadResult } from "./types";

export const REVENUE_API_URL = [process.env.SETTLE_API_URL, process.env.NEXT_PUBLIC_SETTLE_API_URL]
  .map((v) => v?.trim()).find(Boolean)?.replace(/\/$/, "") ?? "https://settle-api-production.up.railway.app";
interface Entry { data: unknown; etag: string | null; expires: number; verifiedAt: string }

/** Bounded per-process cache. Expired entries are revalidated before rendering;
 * they are only served stale on an explicit error, with their original as-of.
 * Deploy/restart clears this cache; the canonical monthly files remain usable. */
export function createRevenueClient(fetcher: typeof fetch = fetch, now: () => number = Date.now, base = REVENUE_API_URL) {
  const entries = new Map<string, Entry>();
  const pending = new Map<string, Promise<ReadResult<unknown>>>();
  async function request<T>(path: string, validate: (value: unknown) => T, cache = true, statusEndpoint = false): Promise<ReadResult<T>> {
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
          entries.delete(path);
          return { data: null, source: "missing", verifiedAt: new Date(now()).toISOString(), error: "No published estimate for this selection." };
        }
        const notModified = response.status === 304 && previous;
        if (!notModified && !response.ok && !(statusEndpoint && response.status === 503)) throw new Error(`API returned ${response.status}`);
        const data = notModified ? previous.data as T : validate(await response.json());
        const verifiedAt = new Date(now()).toISOString();
        if (cache) {
          const control = response.headers.get("cache-control") ?? "";
          const maxAge = /(?:^|,)\s*max-age=(\d+)/i.exec(control)?.[1];
          if (!/no-store/i.test(control)) {
            // Respect shorter API lifetimes, and never hide revisions >5 min.
            const seconds = /no-cache/i.test(control) ? 0 : Math.min(Number(maxAge ?? 0), 300);
            entries.delete(path);
            entries.set(path, { data, etag: response.headers.get("etag") ?? (notModified ? previous.etag : null), expires: now() + seconds * 1000, verifiedAt });
            if (entries.size > 96) entries.delete(entries.keys().next().value!);
          } else entries.delete(path);
        }
        return { data, source: "api", verifiedAt, error: null };
      } catch {
        return previous
          ? { data: previous.data as T, source: "cache", verifiedAt: previous.verifiedAt, error: "Live API unavailable; showing the last successfully verified response." }
          : { data: null, source: "unavailable", verifiedAt: null, error: "Daily revenue API unavailable. Settled reports remain available." };
      }
    })();
    pending.set(path, work);
    try { return await work; } finally { pending.delete(path); }
  }
  return {
    latest: (prime: DailyPrime) => request(`/v1/revenue/${prime}/latest`, (v) => validateLatest(v, prime)),
    history: (prime: DailyPrime, start: string, end: string) => request(`/v1/revenue/${prime}/history?start=${start}&end=${end}&limit=90`, (v) => validateHistory(v, prime, start, end)),
    status: () => request("/v1/revenue/status", validateStatus, false, true),
  };
}
export const revenueClient = createRevenueClient();
