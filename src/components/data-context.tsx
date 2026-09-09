"use client";

/**
 * Carries a dataset from a route's server component down to its interactive
 * view.
 *
 * Each route reads only the file it needs (`src/app/<section>/…/page.tsx`) and
 * wraps its view in the matching provider, so visiting Prime Payments no longer
 * ships the DR, SSR and Sky Total datasets alongside it — before routing there
 * was one page and every payload carried all four.
 *
 * One context per dataset rather than one holding all of them: with routes, "no
 * DR here" is the normal case on three pages out of four, and a shared object
 * with three nulls in it would say nothing about which page forgot to load
 * what.
 */
import * as React from "react";

import type { PrimeDataset } from "@/lib/prime/types";
import type { SkyTotalDataset } from "@/lib/sky-total/types";
import type { SsrDataset } from "@/lib/ssr/types";
import type { DrDataset } from "@/lib/dr/types";

/**
 * Builds a provider and its hook. The hook throws rather than returning null:
 * reaching it means a view rendered outside the route that loads its data, and
 * a named error beats `Cannot read properties of null` three components deep.
 */
function datasetContext<T>(name: string) {
  const Context = React.createContext<T | null>(null);

  function Provider({ value, children }: { value: T; children: React.ReactNode }) {
    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function use(): T {
    const value = React.useContext(Context);
    if (!value) {
      throw new Error(
        `use${name}() outside its provider — the ${name} view must be rendered by a route that loads ${name} data.`,
      );
    }
    return value;
  }

  return [Provider, use] as const;
}

export const [DrProvider, useDr] = datasetContext<DrDataset>("Dr");
export const [SsrProvider, useSsr] = datasetContext<SsrDataset>("Ssr");
export const [SkyTotalProvider, useSkyTotal] = datasetContext<SkyTotalDataset>("SkyTotal");
export const [PrimeProvider, usePrime] = datasetContext<PrimeDataset>("Prime");
