/**
 * Reads the datasets written by scripts/generate-data.mjs (`pnpm refresh`).
 *
 * SERVER ONLY. These functions use node:fs, so importing them from a client
 * component fails the build — which is the point: the datasets are handed to
 * the views as props from src/app/page.tsx and never become part of the
 * browser bundle.
 *
 * Reads happen at build time (the page is statically prerendered), so the
 * numbers are fixed at deploy, exactly as they were when the data lived in
 * generated .ts modules. `cache` keeps a single read per render pass.
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
 * path has to be handled explicitly — the read happens at build time today, so
 * that would surface as a build failure rather than a runtime one.
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
 * wants a request context, and the branch worth asserting — null in, snapshot
 * out, labelled as such — has nothing to do with React.
 */
export function resolveTmf(live: TmfDataset | null): TmfLoad {
  return {
    data: live ?? readGenerated("tmf", validateTmf),
    source: live ? "api" : "snapshot",
    fetchedAt: new Date().toISOString(),
  };
}
export const loadPrime = cache((): PrimeDataset => readGenerated("prime", validatePrime));
