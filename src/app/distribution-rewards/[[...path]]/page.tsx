import { notFound, permanentRedirect } from "next/navigation";
import { loadDr, loadSsr } from "@/lib/load";
import { visibleRefCodeRows } from "@/lib/dr/domain";
import { orderedPartners, partnerMeta } from "@/lib/ssr/domain";
import { paths } from "@/lib/routes";

/** Keep shared links working after the standalone DR report was folded in. */
export default async function Page({ params }: {
  params: Promise<{ path?: string[] }>;
}) {
  const path = (await params).path ?? [];
  const [tab, code, ...rest] = path;
  if (rest.length || (tab && !["summary", "refcodes", "rates"].includes(tab)) ||
      (code !== undefined && tab !== "refcodes")) notFound();
  if (code) {
    const row = visibleRefCodeRows(loadDr()).find((r) => r.refCode === code);
    if (!row) notFound();
    const partner = orderedPartners(loadSsr()).find((p) => partnerMeta(p).label === row.group);
    if (partner) permanentRedirect(`${paths.ssrPartner(partner)}#distribution-rewards`);
  }
  permanentRedirect(`${paths.ssr()}#${tab === "rates" ? "distribution-rates" : "distribution-rewards"}`);
}
