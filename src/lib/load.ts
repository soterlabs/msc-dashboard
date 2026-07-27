/**
 * Reads the datasets written by scripts/generate-data.mjs.
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

import { assertDr, assertPrime, assertSsr } from "./dataset-schema";
import type { PrimeDataset } from "./prime-types";
import type { SsrDataset } from "./ssr-types";
import type { DrDataset } from "./types";

/**
 * Resolved from the working directory, which is the project root both for
 * `next build` and for `next start`. If this ever moves to
 * `output: "standalone"`, Next will not trace data/ into the output and this
 * path has to be handled explicitly — the read happens at build time today, so
 * that would surface as a build failure rather than a runtime one.
 */
const DIR = path.join(process.cwd(), "data", "generated");

/**
 * Reads and validates one dataset.
 *
 * The cast that JSON.parse forces is only a promise, so `assert` checks the
 * parsed value against the TypeScript type before anyone trusts it. Without
 * that, a field whose type drifts but whose shape survives — a number arriving
 * as a string, say — renders silently wrong instead of failing the build.
 */
function readGenerated<T>(name: string, assert: (value: unknown) => void): T {
  const file = path.join(DIR, `${name}.json`);
  let raw: string;
  try {
    raw = fs.readFileSync(file, "utf8");
  } catch {
    throw new Error(
      `data/generated/${name}.json could not be read — run \`pnpm generate-data\` to rebuild the datasets ` +
        `(looked in ${DIR}).`,
    );
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error(
      `data/generated/${name}.json is not valid JSON (${(e as Error).message}) — rerun \`pnpm generate-data\`.`,
    );
  }
  assert(parsed);
  return parsed as T;
}

export const loadDr = cache((): DrDataset => readGenerated<DrDataset>("dr", assertDr));
export const loadSsr = cache((): SsrDataset => readGenerated<SsrDataset>("ssr", assertSsr));
export const loadPrime = cache(
  (): PrimeDataset => readGenerated<PrimeDataset>("prime", assertPrime),
);
