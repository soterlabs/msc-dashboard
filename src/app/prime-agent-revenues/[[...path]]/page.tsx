import { notFound } from "next/navigation";

import { DrProvider, SsrProvider } from "@/components/data-context";
import { SupplySideRevenues } from "@/components/ssr/supply-side-revenues";
import { loadDr, loadSsr } from "@/lib/load";
import { orderedPartners, reportsFor } from "@/lib/ssr/domain";
import { isMonthSegment } from "@/lib/routes";
import { scopeDr } from "@/lib/dr/scope";
import { partnerMeta } from "@/lib/ssr/domain";
import type { SsrPartner } from "@/lib/ssr/types";

/**
 * /prime-agent-revenues                   → all primes
 * /prime-agent-revenues/grove             → Grove, its latest settlement
 * /prime-agent-revenues/grove/2026-08     → Grove, August
 *
 * The month is optional so a link to a prime keeps working as months are added,
 * and pinned so a link to a settlement keeps showing that settlement.
 */
export function generateStaticParams() {
  const ssr = loadSsr();
  return [
    { path: undefined },
    ...orderedPartners(ssr).flatMap((partner) => [
      { path: [partner] },
      ...reportsFor(ssr, partner).map((r) => ({ path: [partner, r.month] })),
    ]),
  ];
}

export default async function Page({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const path = (await params).path;
  const ssr = loadSsr();

  if (!path?.length) {
    return (
      <SsrProvider value={ssr}>
        <DrProvider value={loadDr()}>
          <SupplySideRevenues partner={null} month={null} />
        </DrProvider>
      </SsrProvider>
    );
  }

  const [partner, month, ...rest] = path;
  if (rest.length) notFound();
  if (!orderedPartners(ssr).includes(partner as SsrPartner)) notFound();

  // A month that exists but not for this prime is a 404 too — Osero has no
  // January, and a link claiming otherwise should say so rather than quietly
  // showing a different month's figures.
  if (month !== undefined) {
    if (!isMonthSegment(month)) notFound();
    if (!reportsFor(ssr, partner as SsrPartner).some((r) => r.month === month)) notFound();
  }

  const selectedPartner = partner as SsrPartner;
  const selectedMonth = month ?? reportsFor(ssr, selectedPartner).at(-1)!.month;
  const dr = scopeDr(loadDr(), partnerMeta(selectedPartner).label, selectedMonth);

  return (
    <SsrProvider value={ssr}>
      <DrProvider value={dr}>
        <SupplySideRevenues partner={selectedPartner} month={selectedMonth} />
      </DrProvider>
    </SsrProvider>
  );
}
