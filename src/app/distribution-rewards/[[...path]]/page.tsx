import { notFound, permanentRedirect } from "next/navigation";
import { loadDr, loadSsr } from "@/lib/load";
import { visibleRefCodeRows } from "@/lib/dr/domain";
import { orderedPartners, partnerMeta } from "@/lib/ssr/domain";
import { latestRefCodeMonth, refCodeFragment } from "@/lib/dr/ref-code-navigation";
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
    const dr = loadDr();
    const row = visibleRefCodeRows(dr).find((r) => r.refCode === code);
    if (!row) notFound();
    const partner = orderedPartners(loadSsr()).find((p) => partnerMeta(p).label === row.group);
    const month = latestRefCodeMonth(dr, code);
    if (partner && month) permanentRedirect(`${paths.ssrPartner(partner, month)}${refCodeFragment(code)}`);
  }
  permanentRedirect(`${paths.ssr()}#${tab === "rates" ? "distribution-rates" : "distribution-rewards"}`);
}
