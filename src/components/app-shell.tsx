"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { DistributionRewards } from "./dr/distribution-rewards";
import { SupplySideRevenues } from "./ssr/supply-side-revenues";

type Section = "dr" | "ssr";

const NAV: {
  key: Section;
  label: string;
  source: string;
}[] = [
  {
    key: "dr",
    label: "Distribution Rewards",
    source: "dr_comparison_latest.xlsx",
  },
  {
    key: "ssr",
    label: "Supply Side Revenues",
    source: "soter · settlement-reports",
  },
];

export function AppShell() {
  const [section, setSection] = React.useState<Section>("dr");
  const active = NAV.find((n) => n.key === section)!;

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-4 gap-y-3 px-5 py-4 sm:px-8">
          <div className="flex items-baseline gap-2.5">
            <span className="font-serif text-lg font-semibold text-ink">Sky</span>
            <span className="font-mono text-[9.5px] font-medium tracking-[0.2em] text-gold uppercase">
              Soter console
            </span>
          </div>

          <nav className="flex items-center rounded-[7px] border border-line-strong bg-card p-0.5">
            {NAV.map((n) => {
              const isActive = section === n.key;
              return (
                <button
                  key={n.key}
                  type="button"
                  onClick={() => setSection(n.key)}
                  aria-pressed={isActive}
                  className={cn(
                    "rounded-[5px] px-3 py-1.5 font-mono text-[11px] font-medium tracking-wide whitespace-nowrap transition-colors",
                    isActive
                      ? "bg-ink-deep text-ondark"
                      : "text-muted hover:text-ink"
                  )}
                >
                  {n.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main>
        <div className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 sm:py-12">
          {section === "dr" ? <DistributionRewards /> : <SupplySideRevenues />}

          <footer className="mt-16 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-5 font-mono text-[11px] text-muted">
            <span>Sky · {active.label} — Soter methodology</span>
            <span className="text-faint">source · {active.source}</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
