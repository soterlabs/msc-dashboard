"use client";

/**
 * Carries the datasets from the server page down to the interactive views.
 *
 * src/app/page.tsx reads data/generated/*.json on the server and renders this
 * provider; the views pull what they need with useDr / useSsr / usePrime
 * instead of importing a data module. That keeps every dataset out of the
 * browser's JS bundle and gives one place to swap in an API read later.
 */
import * as React from "react";

import type { PrimeDataset } from "@/lib/prime/types";
import type { SkyTotalDataset } from "@/lib/sky-total/types";
import type { SsrDataset } from "@/lib/ssr/types";
import type { DrDataset } from "@/lib/dr/types";

export interface Datasets {
  dr: DrDataset;
  ssr: SsrDataset;
  skyTotal: SkyTotalDataset;
  prime: PrimeDataset;
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

export const useDr = (): DrDataset => useDatasets().dr;
export const useSsr = (): SsrDataset => useDatasets().ssr;
export const useSkyTotal = (): SkyTotalDataset => useDatasets().skyTotal;
export const usePrime = (): PrimeDataset => useDatasets().prime;
