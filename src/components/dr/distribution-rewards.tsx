"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import {
  Tabs,
  TabsIndicator,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  visibleRefCodeRows,
  visibleSummaryGroups,
} from "@/lib/dr/domain";
import { dayLong, monthRangeLabel } from "@/lib/format";
import { paths, type DrTab } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { useDr } from "../data-context";
import { PageHeader, type Meta } from "../kit";
import { RatesView } from "./rates-view";
import { RefCodesView } from "./ref-codes-view";
import { SummaryView } from "./summary-view";

interface TabDef {
  key: DrTab;
  label: string;
  title: string;
  accent: string;
  /**
   * The run's working context — counts and the period. Never a figure a card or
   * a table below already carries.
   */
  meta?: Meta[];
}

/**
 * `tab` and `openRefCode` come from the URL, not from state: they are what the
 * address bar says, so a shared link opens where the sender was. The group
 * filter below stays in state — it is how the ledger is being read rather than
 * which page this is, and it survives a tab change because navigating between
 * these tabs re-renders this same component with new props.
 */
export function DistributionRewards({
  tab,
  openRefCode,
}: {
  tab: DrTab;
  openRefCode: string | null;
}) {
  const dr = useDr();
  const router = useRouter();
  /** Every group present in the ledger (used for select-all / all-selected). */
  const allGroups = React.useMemo(
    () => Array.from(new Set(visibleRefCodeRows(dr).map((r) => r.group))),
    [dr]
  );
  // Selected groups drive ledger visibility; start with all selected.
  const [selectedGroups, setSelectedGroups] = React.useState<Set<string>>(
    () => new Set(allGroups)
  );
  // The dataset is fixed at build today, so this never fires — but the
  // initialiser above only runs once, and the selection would silently keep
  // referring to the old groups if the data ever became dynamic (an API read).
  // Resetting during render is React's supported way to derive state from props.
  //
  // Keyed on `dr` rather than on `allGroups`: useMemo is a performance hint, not
  // a semantic guarantee, so a discarded cache would hand back a fresh array and
  // wipe the user's filter. `dr` comes from the provider and is genuinely stable.
  const [dataset, setDataset] = React.useState(dr);
  if (dataset !== dr) {
    setDataset(dr);
    setSelectedGroups(new Set(allGroups));
  }

  const tabs: TabDef[] = [
    {
      key: "summary",
      label: "Summary",
      title: "Distribution rewards",
      accent: "Summary by group",
      // the shape of the run rather than its headline figures: how many moving
      // parts and over what period. The totals are the cards' job.
      meta: [
        { label: "groups", value: visibleSummaryGroups(dr).length },
        { label: "ref codes", value: visibleRefCodeRows(dr).length },
        { label: "window", value: monthRangeLabel(dr.reportMonths) },
      ],
    },
    {
      key: "refcodes",
      label: "By ref code",
      title: "DR ledger",
      accent: "Every ref code",
      // No meta row: the ledger panel's own header already counts the codes on
      // screen and totals them, the token filter lists the tokens, and the
      // notes filter counts the annotated rows.
    },
    {
      key: "rates",
      label: "Sky rates",
      title: "Rate card",
      accent: "The methodology",
      // the families are the three cards below, and the token count was a
      // number nothing on this tab is broken down by
      meta: [{ label: "as of", value: dayLong(dr.ratesAsOf) }],
    },
  ];

  const current = tabs.find((t) => t.key === tab)!;

  const viewGroupInLedger = (group: string) => {
    setSelectedGroups(new Set([group]));
    router.push(paths.dr("refcodes"));
  };

  const setGroups = (groups: string[]) => setSelectedGroups(new Set(groups));

  const selectAllGroups = () => setSelectedGroups(new Set(allGroups));
  const clearGroups = () => setSelectedGroups(new Set());

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={current.title}
        description={current.accent}
        meta={current.meta}
      />

      {/* The panels below are rendered outside TabsContent because each view
          owns its own data reads and layout; the bar is here for the switch. */}
      <Tabs value={tab} onValueChange={(v) => router.push(paths.dr(v as DrTab))}>
        {/* The vocabulary the rest of the console's controls use: a pill on a
            tint of --input, solid --primary when it is the one that is on.

            The track is --input, not the --muted shadcn reaches for: --muted is
            lighter than --card in this preset, so a full-strength track sat
            above the cards it belongs to.

            The fill is the Base UI indicator so it travels between the chips
            rather than blinking. That is also why the triggers stay transparent
            in every state, idle included — a trigger is a later positioned
            sibling, so its own fill would cover the indicator rather than layer
            under it. */}
        <TabsList className="relative gap-1 bg-input/50 p-1">
          <TabsIndicator className="bg-primary shadow-sm" />
          {tabs.map((t) => (
            <TabsTrigger
              key={t.key}
              value={t.key}
              className={cn(
                "px-4 text-muted-foreground transition-colors duration-150",
                "hover:bg-input/50 hover:text-foreground",
                "data-active:bg-transparent data-active:text-primary-foreground",
                "data-active:hover:bg-transparent data-active:hover:text-primary-foreground",
                "dark:data-active:bg-transparent dark:data-active:text-primary-foreground",
                "dark:data-active:hover:bg-transparent dark:data-active:hover:text-primary-foreground",
              )}
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {tab === "summary" && <SummaryView onViewGroup={viewGroupInLedger} />}
      {tab === "refcodes" && (
        <RefCodesView
          openRefCode={openRefCode}
          selectedGroups={selectedGroups}
          onSetGroups={setGroups}
          onSelectAll={selectAllGroups}
          onClearGroups={clearGroups}
        />
      )}
      {tab === "rates" && <RatesView />}
    </div>
  );
}
