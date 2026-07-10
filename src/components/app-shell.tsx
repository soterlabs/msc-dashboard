"use client";

import * as React from "react";
import { Coins, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { DistributionRewards } from "./dr/distribution-rewards";
import { SoterLabsMark } from "./soter-labs";
import { SupplySideRevenues } from "./ssr/supply-side-revenues";

type Section = "dr" | "ssr";

const NAV: {
  key: Section;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  source: string;
}[] = [
  {
    key: "dr",
    label: "Distribution Rewards",
    icon: Coins,
    source: "dr_comparison_latest.xlsx",
  },
  {
    key: "ssr",
    label: "Supply Side Revenues",
    icon: TrendingUp,
    source: "soter · settlement-reports",
  },
];

export function AppShell() {
  const [section, setSection] = React.useState<Section>("dr");

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto flex w-full max-w-[1560px]">
        <Sidebar section={section} onSelect={setSection} />

        <div className="min-w-0 flex-1">
          <MobileBar section={section} onSelect={setSection} />

          <main className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            {section === "dr" ? <DistributionRewards /> : <SupplySideRevenues />}
          </main>
          <footer className="px-5 pb-10 sm:px-8 lg:hidden">
            <SourceNote section={section} className="border-t border-line pt-5" />
          </footer>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- sidebar */

function Sidebar({
  section,
  onSelect,
}: {
  section: Section;
  onSelect: (s: Section) => void;
}) {
  return (
    <aside className="sticky top-0 hidden h-screen w-66 shrink-0 flex-col px-5 py-7 lg:flex">
      <Brand />

      <nav className="mt-9 flex flex-col gap-2">
        <p className="mb-1 px-3 font-sans text-[10px] font-medium tracking-[0.18em] text-faint uppercase">
          Reports
        </p>
        {NAV.map((n) => (
          <NavItem
            key={n.key}
            icon={n.icon}
            label={n.label}
            active={section === n.key}
            onClick={() => onSelect(n.key)}
          />
        ))}
      </nav>
      <SourceNote section={section} className="mt-auto px-3 pt-6" />
    </aside>
  );
}

function SourceNote({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="font-sans text-[10px] font-medium tracking-[0.18em] text-faint uppercase">
        Source
      </p>
      <p className="mt-1 font-mono text-[11px] wrap-break-word text-muted">
        {NAV.find((n) => n.key === section)!.source}
      </p>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <SoterLabsMark className="h-7" />
      <span className="font-brand text-[17px] tracking-[0.13em] text-gold uppercase">
        Soter Labs
      </span>
    </div>
  );
}

function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "neu-focus flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-[13px] transition-colors",
        active
          ? "neu-btn-pressed font-semibold text-ink"
          : "neu-btn font-medium text-muted hover:text-ink"
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}

/* ------------------------------------------------- mobile / tablet bar */

function MobileBar({
  section,
  onSelect,
}: {
  section: Section;
  onSelect: (s: Section) => void;
}) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 bg-paper/90 px-5 py-3.5 backdrop-blur sm:px-8 lg:hidden">
      <Brand />

      <div className="flex items-center gap-2">
        {NAV.map((n) => (
          <button
            key={n.key}
            type="button"
            onClick={() => onSelect(n.key)}
            aria-current={section === n.key ? "page" : undefined}
            title={n.label}
            className={cn(
              "neu-focus flex size-10 items-center justify-center rounded-2xl",
              section === n.key
                ? "neu-btn-pressed text-ink"
                : "neu-btn text-muted"
            )}
          >
            <n.icon className="size-4" />
          </button>
        ))}
      </div>
    </header>
  );
}
