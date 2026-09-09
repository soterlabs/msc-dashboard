import { notFound } from "next/navigation";

import { DrProvider } from "@/components/data-context";
import { DistributionRewards } from "@/components/dr/distribution-rewards";
import { visibleRefCodeRows } from "@/lib/dr/domain";
import { loadDr } from "@/lib/load";
import { DR_TABS, isDrTab, type DrTab } from "@/lib/routes";

/**
 * /distribution-rewards            → summary
 * /distribution-rewards/refcodes   → the ledger
 * /distribution-rewards/refcodes/128 → that code's token history, open
 * /distribution-rewards/rates      → the rate card
 *
 * A catch-all rather than nested [tab] segments: only `refcodes` takes a child,
 * so a segment per level would need a route that exists for one tab and 404s
 * for the other two. Validating here keeps the whole shape in one place.
 */
export function generateStaticParams() {
  const dr = loadDr();
  return [
    { path: undefined },
    ...DR_TABS.map((tab) => ({ path: [tab] })),
    ...visibleRefCodeRows(dr).map((r) => ({ path: ["refcodes", r.refCode] })),
  ];
}

function parse(path: string[] | undefined): { tab: DrTab; refCode: string | null } {
  if (!path?.length) return { tab: "summary", refCode: null };
  const [first, second, ...rest] = path;
  if (rest.length || !isDrTab(first)) notFound();
  if (second !== undefined && first !== "refcodes") notFound();
  return { tab: first, refCode: second ?? null };
}

export default async function Page({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const { tab, refCode } = parse((await params).path);
  const dr = loadDr();

  // A ref code nobody can see is a 404, not an empty drill-down: the hidden
  // groups are hidden everywhere else too.
  if (refCode && !visibleRefCodeRows(dr).some((r) => r.refCode === refCode)) {
    notFound();
  }

  return (
    <DrProvider value={dr}>
      <DistributionRewards tab={tab} openRefCode={refCode} />
    </DrProvider>
  );
}
