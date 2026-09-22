import { notFound } from "next/navigation";

import { loadDr, loadSsr } from "@/lib/load";
import { orderedPartners } from "@/lib/ssr/domain";
import { isMonthSegment } from "@/lib/routes";
import { revenueMonths } from "@/lib/ssr/revenue-context";
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
  const dr = loadDr();
  return [
    { path: undefined },
    ...orderedPartners(ssr).flatMap((partner) => [
      { path: [partner] },
      ...revenueMonths(ssr, dr, partner, partnerMeta(partner).label).map((month) => ({ path: [partner, month] })),
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

  if (!path?.length) return null;

  const [partner, month, ...rest] = path;
  if (rest.length) notFound();
  if (!orderedPartners(ssr).includes(partner as SsrPartner)) notFound();

  const selectedPartner = partner as SsrPartner;
  const sourceDr = loadDr();
  const group = partnerMeta(selectedPartner).label;
  const months = revenueMonths(ssr, sourceDr, selectedPartner, group);
  if (month !== undefined && (!isMonthSegment(month) || !months.includes(month))) notFound();
  return null;
}
