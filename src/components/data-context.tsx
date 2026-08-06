"use client";

/**
 * Carries the datasets from the server page down to the interactive views.
 *
 * src/app/page.tsx reads data/generated/*.json on the server and renders this
 * provider; the views pull what they need with useDr / useSsr / usePrime
 * instead of importing a data module. That keeps every dataset out of the
 * browser's JS bundle and gives one place to swap in an API read later.
 *
 * A dataset behind a hidden feature flag arrives as `null` — the page does not
 * read it at all, so its numbers stay out of the payload too (src/lib/flags.ts).
 */
import * as React from "react";

import type { PrimeDataset } from "@/lib/prime/types";
import type { SkyTotalDataset } from "@/lib/sky-total/types";
import type { SsrDataset } from "@/lib/ssr/types";
import type { DrDataset } from "@/lib/dr/types";

export interface Datasets {
  dr: DrDataset;
  ssr: SsrDataset;
  /** null when NEXT_PUBLIC_SHOW_SKY_TOTAL_NET_REVENUE is off. */
  skyTotal: SkyTotalDataset | null;
  /** null when NEXT_PUBLIC_SHOW_PRIME_PAYMENTS is off. */
  prime: PrimeDataset | null;
}

const DataContext = React.createContext<Datasets | null>(null);

export function DataProvider({
  value,
  children,
}: {
  value: Datasets;
  children: React.ReactNode;
}) {
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

function useDatasets(): Datasets {
  const value = React.useContext(DataContext);
  if (!value) {
    throw new Error("useDatasets must be used inside <DataProvider> (see src/app/page.tsx)");
  }
  return value;
}

/**
 * Unwraps a flagged dataset. Reaching this error means a view rendered while
 * its tab was flagged off — the tab and the dataset are driven by the same
 * flag, so they cannot disagree unless one of them stopped consulting it.
 */
function flagged<T>(value: T | null, envVar: string): T {
  if (value === null) {
    throw new Error(
      `dataset not loaded — this view is hidden by a feature flag; set ${envVar}=true and rebuild.`,
    );
  }
  return value;
}

export const useDr = (): DrDataset => useDatasets().dr;
export const useSsr = (): SsrDataset => useDatasets().ssr;
export const useSkyTotal = (): SkyTotalDataset =>
  flagged(useDatasets().skyTotal, "NEXT_PUBLIC_SHOW_SKY_TOTAL_NET_REVENUE");
export const usePrime = (): PrimeDataset =>
  flagged(useDatasets().prime, "NEXT_PUBLIC_SHOW_PRIME_PAYMENTS");
