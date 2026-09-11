import { notFound } from "next/navigation";

import { TmfProvider } from "@/components/data-context";
import { Buybacks } from "@/components/tmf/buybacks";
import { FLAGS } from "@/lib/flags";
import { loadTmf } from "@/lib/load";
import { TMF_GRANULARITIES, type TmfGranularity } from "@/lib/tmf/types";

/**
 * Rendered per request, unlike every other page here.
 *
 * This is the live tier, and the point of it is that the figures are current.
 * Prerendering gave the opposite: with revalidation coming only from the
 * fetches, the first request after each window served the PREVIOUS render —
 * the API was on run 8 while this page still showed run 3 from five hours
 * earlier. Rendering from a cached fetch is the design; serving last hour's
 * render of it is not.
 *
 * Load is absorbed by the fetch cache in src/lib/tmf/api.ts, which is where the
 * upstream call rate is actually set. The settled tabs are untouched and stay
 * statically prerendered from committed JSON.
 */
export const dynamic = "force-dynamic";

/**
 * /buybacks             → monthly
 * /buybacks/daily       → daily
 * /buybacks/quarterly   → quarterly
 * /buybacks/annual      → annual
 *
 * Monthly stays bare so the tab has one address rather than two that render
 * the same thing. Nothing is prerendered (see `dynamic` above), but the
 * segment is still validated: an unknown granularity 404s rather than
 * rendering an empty chart.
 *
 * Flagged off, this 404s and `loadTmf()` is never called.
 */
export default async function Page({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  if (!FLAGS.buybacks) notFound();

  const path = (await params).path;
  let granularity: TmfGranularity = "monthly";
  if (path?.length) {
    const [first, ...rest] = path;
    if (rest.length) notFound();
    if (!(TMF_GRANULARITIES as readonly string[]).includes(first)) notFound();
    granularity = first as TmfGranularity;
  }

  // Live, so the page revalidates on the fetch's own schedule rather than
  // being frozen at build time like the settled tabs.
  const tmf = await loadTmf();

  return (
    <TmfProvider value={tmf.data}>
      <Buybacks
        granularity={granularity}
        source={tmf.source}
        fetchedAt={tmf.fetchedAt}
        daily={tmf.daily}
        last24h={tmf.last24h}
      />
    </TmfProvider>
  );
}
