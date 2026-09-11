/**
 * Reads the datasets written by scripts/generate-data.mjs (`pnpm refresh`).
 *
 * SERVER ONLY. These functions use node:fs, so importing them from a client
 * component fails the build — which is the point: the datasets are handed to
 * the views as props from src/app/page.tsx and never become part of the
 * browser bundle.
 *
 * For the settled datasets, reads happen at build time (those pages are
 * statically prerendered), so the numbers are fixed at deploy, exactly as they
 * were when the data lived in generated .ts modules. `cache` keeps a single
 * read per render pass.
 *
 * `loadTmf` is the exception and the only one: it is on the live tier, asking
 * settle-api first and using the committed file as its fallback, so its page
 * revalidates rather than being frozen at deploy. See the two-tier table in the
 * README. Nothing else fetches.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { cache } from "react";

import {
  validateDr,
  validatePrime,
  validateSkyTotal,
  validateSsr,
  validateTmf,
} from "./dataset-schema.ts";
import type { PrimeDataset } from "./prime/types";
import type { SkyTotalDataset } from "./sky-total/types";
import type { SsrDataset } from "./ssr/types";
import { fetchTmf } from "./tmf/api.ts";
import type { TmfDataset, TmfLoad } from "./tmf/types";
import type { DrDataset } from "./dr/types";

/**
 * Resolved from the working directory, which is the project root both for
 * `next build` and for `next start`. If this ever moves to
 * `output: "standalone"`, Next will not trace data/ into the output and this
 * path has to be handled explicitly. For the settled datasets that surfaces as
 * a build failure, since they are read while prerendering; tmf reads its
 * snapshot on every render too, which is what keeps that one a build failure
 * as well rather than a 500 on the first API outage.
 */
const DIR = path.join(process.cwd(), "data", "generated");

/**
 * Reads one dataset and hands the parsed value to its validator.
 *
 * `validate` both checks the value against its TypeScript type and returns it
 * narrowed, so there is no cast here — the only cast lives in dataset-schema.ts,
 * next to the checks that earn it. Without that step a field whose type drifts
 * but whose shape survives — a number arriving as a string, say — would render
 * silently wrong instead of failing the build.
 */
function readGenerated<T>(name: string, validate: (value: unknown) => T): T {
  const file = path.join(DIR, `${name}.json`);
  let raw: string;
  try {
    raw = fs.readFileSync(file, "utf8");
  } catch {
    throw new Error(
      `data/generated/${name}.json could not be read — run \`pnpm refresh\` to rebuild the datasets ` +
        `(looked in ${DIR}).`,
    );
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error(
      `data/generated/${name}.json is not valid JSON (${(e as Error).message}) — rerun \`pnpm refresh\`.`,
    );
  }
  return validate(parsed);
}

export const loadDr = cache((): DrDataset => readGenerated("dr", validateDr));
export const loadSsr = cache((): SsrDataset => readGenerated("ssr", validateSsr));
export const loadSkyTotal = cache((): SkyTotalDataset => readGenerated("sky-total", validateSkyTotal));
/**
 * The one dataset on the live tier.
 *
 * settle-api first, the committed `data/generated/tmf.json` when that fails.
 * The snapshot is still refreshed at each MSC from settlement-reports — it is
 * the fallback now rather than the source, which is what lets an offline build
 * and an API outage both render the tab instead of failing.
 *
 * `source` comes back with the data because the difference is the reader's
 * business: a figure from a run this morning and the same figure from a
 * snapshot committed three weeks ago look identical on screen, and only one of
 * them is current.
 */
export const loadTmf = cache(async (): Promise<TmfLoad> => resolveTmf(await fetchTmf()));

/**
 * Picks the tier, given whatever the live fetch returned.
 *
 * Split out from `loadTmf` so the fallback can be tested directly: `cache()`
 * wants a request context, and the branches worth asserting have nothing to do
 * with React.
 */
export function resolveTmf(live: TmfDataset | null): TmfLoad {
  // Read and validated ALWAYS, even when the live document is good and will be
  // the one rendered. Reading it only in the fallback branch meant a corrupt or
  // missing snapshot built green and passed deploy, then threw the first time
  // the API was down — failing at exactly the moment the fallback exists for.
  // Paying one 25 kB parse per render keeps that failure at build time, where
  // the rest of this file's guarantees already live.
  const snapshot = readGenerated("tmf", validateTmf);

  if (live && usable(live, snapshot)) {
    return { data: live, source: "api", fetchedAt: new Date().toISOString() };
  }
  return { data: snapshot, source: "snapshot", fetchedAt: new Date().toISOString() };
}

/**
 * Whether a live document should displace the snapshot.
 *
 * `validateTmf` checks types, not substance, so a run that finished with an
 * empty backfill returns a document where every field is the right type and
 * every figure is zero — and it would render as "0 USDS", live and labelled
 * current. The block height is the other half: the API is meant to be ahead of
 * a file refreshed monthly, so a live document behind it is a regression
 * upstream, not fresher data.
 */
function usable(live: TmfDataset, snapshot: TmfDataset): boolean {
  if (live.periods.monthly.length === 0) {
    console.warn("[tmf] live document has no monthly periods — keeping the snapshot");
    return false;
  }
  if (live.source.to_block < snapshot.source.to_block) {
    console.warn(
      `[tmf] live document stops at block ${live.source.to_block}, behind the ` +
        `snapshot's ${snapshot.source.to_block} — keeping the snapshot`,
    );
    return false;
  }
  return true;
}
export const loadPrime = cache((): PrimeDataset => readGenerated("prime", validatePrime));
