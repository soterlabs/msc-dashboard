"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { DistributionRewards } from "./dr/distribution-rewards";
import { SpellPayments } from "./spell/spell-payments";
import { SupplySideRevenues } from "./ssr/supply-side-revenues";

type Section = "dr" | "ssr" | "spell";

const SHOW_SPELL_PAYMENTS =
  process.env.NEXT_PUBLIC_SHOW_SPELL_PAYMENTS === "true";

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
  ...(SHOW_SPELL_PAYMENTS
    ? [
        {
          key: "spell" as const,
          label: "Spell Payments",
          source: "spell-payments-to-prime-subproxies.md",
        },
      ]
    : []),
];

const SECTION_ORDER: Section[] = NAV.map((n) => n.key);

export function AppShell() {
  const [section, setSection] = React.useState<Section>("dr");
  const active = NAV.find((n) => n.key === section)!;
  const activeIndex = SECTION_ORDER.indexOf(section);

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-20 border-b border-line bg-card">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-4 gap-y-3 px-5 py-3.5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="font-serif text-xl leading-none font-semibold text-ink">
              Sky
            </span>
            <span className="h-4 w-px bg-line-strong" />
            <span className="font-mono text-[10px] font-medium tracking-[0.22em] text-gold uppercase">
              Soter console
            </span>
          </div>

          <div className="flex items-center gap-2">
            <nav className="relative flex items-center rounded-[7px] border border-line-strong bg-paper p-0.5">
            <span
              aria-hidden
              className="absolute top-0.5 bottom-0.5 left-0.5 rounded-[5px] bg-ink-deep transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
              style={{
                width: `calc((100% - 0.25rem) / ${NAV.length})`,
                transform: `translateX(${activeIndex * 100}%)`,
              }}
            />
            {NAV.map((n) => {
              const isActive = section === n.key;
              return (
                <button
                  key={n.key}
                  type="button"
                  onClick={() => setSection(n.key)}
                  aria-pressed={isActive}
                  className={cn(
                    "relative z-10 flex-1 rounded-[5px] px-3.5 py-1.5 text-center font-mono text-[11px] font-medium tracking-wide whitespace-nowrap transition-colors",
                    isActive ? "text-ondark" : "text-muted hover:text-ink"
                  )}
                >
                  {n.label}
                </button>
              );
            })}
            </nav>
          </div>
        </div>
      </header>

      <main>
        <div className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 sm:py-12">
          {section === "dr" && <DistributionRewards />}
          {section === "ssr" && <SupplySideRevenues />}
          {section === "spell" && SHOW_SPELL_PAYMENTS && <SpellPayments />}

          <footer className="mt-16 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-5 font-mono text-[11px] text-muted">
            <span>Sky · {active.label} — Soter methodology</span>
            <span className="text-faint">source · {active.source}</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
