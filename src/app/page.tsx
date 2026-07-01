import { DistributionRewards } from "@/components/dr/distribution-rewards";

/**
 * Standalone demo shell for the Distribution Rewards tab.
 *
 * In the host app this lives inside the existing layout (sidebar etc.);
 * here we just frame <DistributionRewards /> on the paper background so it
 * can be reviewed on its own. The component itself sets no page background,
 * so it inherits whatever surface the host provides.
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-paper">
      <main className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 sm:py-12">
        <DistributionRewards />

        <footer className="mt-16 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-5 font-mono text-[11px] text-muted">
          <span>Sky · Distribution Rewards — Soter methodology</span>
          <span className="text-faint">source · dr_comparison_latest.xlsx</span>
        </footer>
      </main>
    </div>
  );
}
