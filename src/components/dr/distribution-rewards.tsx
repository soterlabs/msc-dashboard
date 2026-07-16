"use client";

import * as React from "react";

import { tokenRates } from "@/lib/data";
import {
  RATE_FAMILIES,
  allTokens,
  grandTotal,
  refCodeKpis,
  visibleRefCodeRows,
  visibleSummaryGroups,
} from "@/lib/domain";
import { formatCompactUSD } from "@/lib/format";

import { DisplayTitle, FilterButton, MetaItem } from "./primitives";
import { RatesView } from "./rates-view";
import { RefCodesView } from "./ref-codes-view";
import { SummaryView } from "./summary-view";

type Tab = "summary" | "refcodes" | "rates";

/** Every group present in the ledger (used for select-all / all-selected). */
const ALL_GROUPS = Array.from(
  new Set(visibleRefCodeRows.map((r) => r.group))
);

interface TabDef {
  key: Tab;
  label: string;
  title: string;
  accent: string;
  meta: { label: string; value: React.ReactNode }[];
}

export function DistributionRewards() {
  const [tab, setTab] = React.useState<Tab>("summary");
  // Selected groups drive ledger visibility; start with all selected.
  const [selectedGroups, setSelectedGroups] = React.useState<Set<string>>(
    () => new Set(ALL_GROUPS)
  );

  const refKpis = refCodeKpis();
  const grand = grandTotal();

  const tabs: TabDef[] = [
    {
      key: "summary",
      label: "Summary",
      title: "Distribution rewards",
      accent: "summary by group",
      meta: [
        { label: "groups", value: visibleSummaryGroups.length },
        { label: "ref codes", value: visibleRefCodeRows.length },
        { label: "window", value: "Jan–May 2026" },
        { label: "total DR", value: formatCompactUSD(grand) },
      ],
    },
    {
      key: "refcodes",
      label: "By ref code",
      title: "DR ledger",
      accent: "every ref code",
      meta: [
        { label: "codes", value: visibleRefCodeRows.length },
        { label: "with notes", value: refKpis.withNotesCount },
        { label: "tokens", value: allTokens().length },
        { label: "total DR", value: formatCompactUSD(refKpis.total) },
      ],
    },
    {
      key: "rates",
      label: "Sky rates",
      title: "Rate card",
      accent: "the methodology",
      meta: [
        { label: "tokens", value: tokenRates.length },
        { label: "families", value: RATE_FAMILIES.length },
        { label: "window", value: "Jan–May 2026" },
      ],
    },
  ];

  const current = tabs.find((t) => t.key === tab)!;

  const viewGroupInLedger = (group: string) => {
    setSelectedGroups(new Set([group]));
    setTab("refcodes");
  };

  const toggleGroup = (group: string) =>
    setSelectedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });

  const selectAllGroups = () => setSelectedGroups(new Set(ALL_GROUPS));
  const clearGroups = () => setSelectedGroups(new Set());

  return (
    <div className="space-y-7">
      {/* page header */}
      <header>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <DisplayTitle accent={current.accent}>{current.title}</DisplayTitle>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 lg:justify-end">
            {current.meta.map((m) => (
              <MetaItem key={m.label} label={m.label} value={m.value} />
            ))}
          </div>
        </div>
      </header>

      {/* section tabs */}
      <nav className="flex flex-wrap gap-2 border-b border-line pb-4">
        {tabs.map((t) => (
          <FilterButton
            key={t.key}
            active={tab === t.key}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </FilterButton>
        ))}
      </nav>

      {/* active view */}
      <div>
        {tab === "summary" && <SummaryView onViewGroup={viewGroupInLedger} />}
        {tab === "refcodes" && (
          <RefCodesView
            selectedGroups={selectedGroups}
            onToggleGroup={toggleGroup}
            onSelectAll={selectAllGroups}
            onClearGroups={clearGroups}
          />
        )}
        {tab === "rates" && <RatesView />}
      </div>
    </div>
  );
}
