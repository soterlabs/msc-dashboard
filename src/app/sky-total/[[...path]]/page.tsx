import { notFound } from "next/navigation";

import { SkyTotalProvider } from "@/components/data-context";
import { SkyTotalNetRevenue } from "@/components/sky-total/sky-total-net-revenue";
import { FLAGS } from "@/lib/flags";
import { loadSkyTotal } from "@/lib/load";
import { isMonthSegment } from "@/lib/routes";

/**
 * /sky-total            → the latest month
 * /sky-total/2026-08    → that month
 *
 * Flagged off, the route 404s and `loadSkyTotal()` is never called — the same
 * promise the hidden tab makes, now that the tab has an address someone could
 * type. `generateStaticParams` returns nothing in that build, so no page for it
 * is prerendered either.
 */
export function generateStaticParams() {
  if (!FLAGS.skyTotalNetRevenue) return [];
  return [
    { path: undefined },
    ...loadSkyTotal().months.map((month) => ({ path: [month] })),
  ];
}

export default async function Page({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  if (!FLAGS.skyTotalNetRevenue) notFound();

  const path = (await params).path;
  const skyTotal = loadSkyTotal();

  let month: string | null = null;
  if (path?.length) {
    const [first, ...rest] = path;
    if (rest.length || !isMonthSegment(first)) notFound();
    if (!skyTotal.months.includes(first)) notFound();
    month = first;
  }

  return (
    <SkyTotalProvider value={skyTotal}>
      <SkyTotalNetRevenue month={month} />
    </SkyTotalProvider>
  );
}
