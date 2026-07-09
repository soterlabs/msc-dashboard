"use client";

import * as React from "react";
import { ChevronRight, ArrowRight } from "lucide-react";

import { MONTH_LABELS, REPORT_MONTHS } from "@/lib/data";
import {
  grandTotal,
  groupColor,
  monthTotals,
  orderedGroups,
  refCodeKpis,
  summaryKpis,
} from "@/lib/domain";
import {
  formatCompactUSD,
  formatPercent,
  formatUSD,
  monthLong,
} from "@/lib/format";
import { cn } from "@/lib/utils";

import {
  Card,
  DarkBar,
  KpiCard,
  NoteTag,
  SectionTitle,
  StatRow,
  Swatch,
} from "./primitives";

export function SummaryView({
  onViewGroup,
}: {
  onViewGroup: (group: string) => void;
}) {
  const groups = orderedGroups();
  const totals = monthTotals();
  const grand = grandTotal();
  const kpis = summaryKpis();
  const refKpis = refCodeKpis();

  const mom =
    kpis.prevTotal > 0
      ? ((kpis.latestTotal - kpis.prevTotal) / kpis.prevTotal) * 100
      : 0;

  return (
    <div className="space-y-10">
      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Total DR" value={formatCompactUSD(grand)} />
        <KpiCard
          label={`Latest · ${monthLong(kpis.latestMonth)}`}
          value={formatCompactUSD(kpis.latestTotal)}
          accent
          note={`${mom >= 0 ? "+" : ""}${mom.toFixed(1)}% vs prior month`}
        />
        <KpiCard label="Ref codes" value={refKpis.activeCount} unit="active" />
        <KpiCard label="Partner groups" value={kpis.groupCount} />
      </div>

      {/* Allocation cards */}
      <section>
        <SectionTitle title="Allocation by group" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => {
            const share = grand > 0 ? ((g.total ?? 0) / grand) * 100 : 0;
            const latest = g.monthly[kpis.latestMonth] ?? 0;
            return (
              <Card
                key={g.group}
                className="neu-raised-interactive group relative flex flex-col p-6"
              >
                <div className="flex items-center gap-2">
                  <Swatch color={groupColor(g.group)} />
                  <span className="font-sans text-[10.5px] font-medium tracking-[0.14em] text-muted uppercase">
                    {g.group}
                  </span>
                </div>

                <p className="mt-5 font-mono text-[1.75rem] leading-none font-semibold text-ink tabular-nums">
                  {formatUSD(g.total)}
                </p>

                <div className="mt-6 space-y-2.5">
                  <StatRow
                    label={`latest · ${MONTH_LABELS[kpis.latestMonth]}`}
                    value={formatCompactUSD(latest)}
                  />
                  <StatRow label="share of total" value={formatPercent(share)} />
                  <StatRow label="ref codes" value={g.refCodes.length} />
                </div>

                {/* mt-auto pins the CTA to the card floor so it lines up across
                    the row. ::after stretches the hit area over the whole card,
                    while the button stays the accessible, focusable target. */}
                <button
                  type="button"
                  onClick={() => onViewGroup(g.group)}
                  className="neu-focus mt-auto inline-flex items-center gap-1.5 self-start rounded-full pt-6 font-sans text-[10.5px] font-semibold tracking-widest text-gold uppercase after:absolute after:inset-0 after:rounded-2xl after:content-['']"
                >
                  View codes
                  <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Monthly distribution table */}
      <section>
        <SectionTitle
          title="Monthly breakdown"
        />
        <Card className="overflow-hidden">
          <div className="dr-scroll overflow-x-auto">
            <DistributionTable groups={groups} grand={grand} />
          </div>
        </Card>
        <div className="mt-3">
          <DarkBar
            left="Aggregate · all groups"
            right={`${formatUSD(grand)} total DR`}
          />
        </div>
      </section>

      {/* monthly trend footnote row */}
      <section>
        <SectionTitle title="Monthly totals" />
        {/* auto-fit so the row stays full whatever the month count */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
          {REPORT_MONTHS.map((m) => (
            <Card key={m} className="px-4 py-3">
              <p className="font-sans text-[10.5px] tracking-[0.12em] text-muted uppercase">
                {monthLong(m)}
              </p>
              <p className="mt-1.5 font-mono text-base font-semibold text-ink tabular-nums">
                {formatCompactUSD(totals[m])}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ---------------------------------------------------------------- table */

function DistributionTable({
  groups,
  grand,
}: {
  groups: ReturnType<typeof orderedGroups>;
  grand: number;
}) {
  const [open, setOpen] = React.useState<Record<string, boolean>>({});
  const toggle = (g: string) => setOpen((o) => ({ ...o, [g]: !o[g] }));

  return (
    <table className="w-full min-w-[860px] border-collapse text-left">
      <thead>
        <tr className="bg-thead">
          <Th className="w-[230px]">Group</Th>
          {REPORT_MONTHS.map((m) => (
            <Th key={m} className="text-right">
              {MONTH_LABELS[m]}
            </Th>
          ))}
          <Th className="text-right">Total</Th>
          <Th className="text-right">Share</Th>
        </tr>
      </thead>
      <tbody>
        {groups.map((g) => {
          const share = grand > 0 ? ((g.total ?? 0) / grand) * 100 : 0;
          const isOpen = open[g.group];
          return (
            <React.Fragment key={g.group}>
              <tr
                onClick={() => toggle(g.group)}
                className="cursor-pointer border-b border-line transition-colors hover:bg-paper/60"
              >
                <Td>
                  <div className="flex items-center gap-2">
                    <ChevronRight
                      className={cn(
                        "size-3.5 text-muted transition-transform",
                        isOpen && "rotate-90"
                      )}
                    />
                    <Swatch color={groupColor(g.group)} />
                    <span className="font-sans text-[13px] font-semibold text-ink">
                      {g.group}
                    </span>
                  </div>
                </Td>
                {REPORT_MONTHS.map((m) => (
                  <Td key={m} className="text-right text-muted">
                    {fmtCell(g.monthly[m])}
                  </Td>
                ))}
                <Td className="text-right font-semibold text-gold">
                  {formatCompactUSD(g.total)}
                </Td>
                <Td className="text-right text-ink">{formatPercent(share)}</Td>
              </tr>

              {isOpen &&
                g.refCodes.map((rc) => (
                  <tr
                    key={`${g.group}-${rc.refCode}`}
                    className="border-b border-line/60 bg-paper/40"
                  >
                    <Td className="pl-9">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-xs font-medium text-ink">
                          {rc.refCode}
                        </span>
                        {rc.notes ? <NoteTag note={rc.notes} /> : null}
                      </div>
                    </Td>
                    {REPORT_MONTHS.map((m) => (
                      <Td key={m} className="text-right text-muted">
                        {fmtCell(rc.monthly[m])}
                      </Td>
                    ))}
                    <Td className="text-right font-medium text-ink">
                      {formatCompactUSD(rc.total)}
                    </Td>
                    <Td className="text-right text-faint">
                      {grand > 0
                        ? formatPercent(((rc.total ?? 0) / grand) * 100)
                        : "—"}
                    </Td>
                  </tr>
                ))}
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  );
}

function fmtCell(v: number | null | undefined) {
  if (v == null) return <span className="text-faint">—</span>;
  if (v === 0) return <span className="text-faint">0</span>;
  return formatCompactUSD(v);
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "px-3 py-2.5 font-sans text-[10.5px] font-medium tracking-[0.1em] text-muted uppercase",
        className
      )}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={cn(
        "px-3 py-2.5 font-mono text-xs whitespace-nowrap",
        className
      )}
    >
      {children}
    </td>
  );
}
