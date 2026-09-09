import { notFound } from "next/navigation";

import { SsrProvider } from "@/components/data-context";
import { SupplySideRevenues } from "@/components/ssr/supply-side-revenues";
import { loadSsr } from "@/lib/load";
import { orderedPartners, reportsFor } from "@/lib/ssr/domain";
import { isMonthSegment } from "@/lib/routes";
import type { SsrPartner } from "@/lib/ssr/types";

/**
 * /supply-side-revenues                   → all primes
 * /supply-side-revenues/grove             → Grove, its latest settlement
 * /supply-side-revenues/grove/2026-08     → Grove, August
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
        <SupplySideRevenues partner={null} month={null} />
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

  return (
    <SsrProvider value={ssr}>
      <SupplySideRevenues partner={partner as SsrPartner} month={month ?? null} />
    </SsrProvider>
  );
}
