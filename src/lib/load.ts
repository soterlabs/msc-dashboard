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

import type { PrimeDataset } from "./prime-types";
import type { SsrDataset } from "./ssr-types";
import type { DrDataset } from "./types";

const DIR = path.join(process.cwd(), "data", "generated");

function readGenerated<T>(name: string): T {
  const file = path.join(DIR, `${name}.json`);
  let raw: string;
  try {
    raw = fs.readFileSync(file, "utf8");
  } catch {
    throw new Error(
      `data/generated/${name}.json is missing — run \`pnpm generate-data\` to rebuild the datasets.`,
    );
  }
  try {
    return JSON.parse(raw) as T;
  } catch (e) {
    throw new Error(
      `data/generated/${name}.json is not valid JSON (${(e as Error).message}) — rerun \`pnpm generate-data\`.`,
    );
  }
}

export const loadDr = cache((): DrDataset => readGenerated<DrDataset>("dr"));
export const loadSsr = cache((): SsrDataset => readGenerated<SsrDataset>("ssr"));
export const loadPrime = cache((): PrimeDataset => readGenerated<PrimeDataset>("prime"));
