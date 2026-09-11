import { notFound } from "next/navigation";

import { TmfProvider } from "@/components/data-context";
import { Buybacks } from "@/components/tmf/buybacks";
import { FLAGS } from "@/lib/flags";
import { loadTmf } from "@/lib/load";
import { TMF_GRANULARITIES, type TmfGranularity } from "@/lib/tmf/types";

/**
 * /buybacks             → monthly
 * /buybacks/quarterly   → quarterly
 * /buybacks/annual      → annual
 *
 * Monthly stays bare so the tab has one address rather than two that render
 * the same thing. Flagged off, this 404s and `loadTmf()` is never called.
 */
export function generateStaticParams() {
  if (!FLAGS.buybacks) return [];
  return [
    { path: undefined },
    ...TMF_GRANULARITIES.map((granularity) => ({ path: [granularity] })),
  ];
}

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
      <Buybacks granularity={granularity} source={tmf.source} />
    </TmfProvider>
  );
}
