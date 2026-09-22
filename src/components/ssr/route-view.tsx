"use client";

import { useMemo, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DrProvider, SsrProvider } from "@/components/data-context";
import { SupplySideRevenues } from "./supply-side-revenues";
import { orderedPartners, partnerMeta } from "@/lib/ssr/domain";
import { revenueMonths } from "@/lib/ssr/revenue-context";
import { scopeDr } from "@/lib/dr/scope";
import type { SsrDataset, SsrPartner } from "@/lib/ssr/types";
import type { DrDataset } from "@/lib/dr/types";

export function RevenueRouteView({ ssr, dr, children }: { ssr: SsrDataset; dr: DrDataset; children: ReactNode }) {
  const path = usePathname().split("/").filter(Boolean).slice(1);
  const [partner, requestedMonth] = path;
  const validPartner = orderedPartners(ssr).includes(partner as SsrPartner);
  const selectedPartner = validPartner ? partner as SsrPartner : null;
  const months = useMemo(() => selectedPartner ? revenueMonths(ssr, dr, selectedPartner, partnerMeta(selectedPartner).label) : [], [ssr, dr, selectedPartner]);
  const month = selectedPartner ? requestedMonth ?? months.at(-1)! : null;
  const scoped = useMemo(() => selectedPartner && month ? scopeDr(dr, partnerMeta(selectedPartner).label, month) : dr, [dr, selectedPartner, month]);
  if (path.length > 2 || (partner && !validPartner) || (requestedMonth && !months.includes(requestedMonth))) return children;
  return <>
    <SsrProvider value={ssr}><DrProvider value={scoped}>
      <SupplySideRevenues partner={selectedPartner} month={month} availableMonths={months} />
    </DrProvider></SsrProvider>
    {children}
  </>;
}
