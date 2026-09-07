"use client";

import * as React from "react";
import {
  ArrowRightIcon,
  CaretRightIcon,
  TrendDownIcon,
  TrendUpIcon,
} from "@phosphor-icons/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  grandTotal,
  groupColor,
  groupMeta,
  monthTotals,
  orderedGroups,
  refCodeKpis,
  summaryKpis,
  visibleRefCodeRows,
} from "@/lib/dr/domain";
import {
  formatCompactUSD,
  formatPercent,
  formatUSD,
  monthLong,
} from "@/lib/format";
import { cn } from "@/lib/utils";

import { useDr } from "../data-context";
import {
  DataTable,
  Dash,
  NoteBadge,
  Panel,
  StatCard,
  Swatch,
  TableBody,
  TableHeader,
  TableRow,
  Td,
  Th,
  TotalRow,
  moneyTooltip,
} from "../kit";

const chartConfig = {
  total: { label: "Total DR", color: "var(--chart-1)" },
} satisfies ChartConfig;

/* the ranked bar paints itself per group, so the config only names the series */
const allocationConfig = {
  total: { label: "Total DR" },
} satisfies ChartConfig;

export function SummaryView({
  onViewGroup,
}: {
  onViewGroup: (group: string) => void;
}) {
  const dr = useDr();
  const { monthLabels, reportMonths } = dr;
  const groups = orderedGroups(dr);
  const totals = monthTotals(dr);
  const grand = grandTotal(dr);
  const kpis = summaryKpis(dr);
  const refKpis = refCodeKpis(dr);

  const mom =
    kpis.prevTotal > 0
      ? ((kpis.latestTotal - kpis.prevTotal) / kpis.prevTotal) * 100
      : 0;
  const Trend = mom >= 0 ? TrendUpIcon : TrendDownIcon;

  const monthly = reportMonths.map((m) => ({
    month: monthLabels[m],
    total: totals[m] ?? 0,
  }));

  // sorted by size rather than by the canonical group order the table keeps:
  // a ranked bar that is not ranked is just a list with extra ink
  // domain.ts has computed the biggest single ref code all along; nothing had
  // ever shown it.
  const topRow = visibleRefCodeRows(dr).find(
    (r) => r.refCode === refKpis.topRefCode,
  );
  const topShare = grand > 0 ? (refKpis.topTotal / grand) * 100 : 0;
  const perMonth = reportMonths.length > 0 ? grand / reportMonths.length : 0;

  const allocation = groups
    .map((g) => ({
      group: g.group,
      total: g.total ?? 0,
      color: groupColor(g.group),
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="flex flex-col gap-6">
      {/* Three headline figures, none of which the header above repeats: how
          much, which way it is moving, and how concentrated it is. */}
      <div className="grid grid-cols-1 gap-4 @2xl/main:grid-cols-3">
        <StatCard
          label="Total DR"
          value={formatCompactUSD(grand)}
          note={`≈ ${formatCompactUSD(perMonth)} per month`}
        />
        <StatCard
          label={`Latest · ${monthLong(kpis.latestMonth)}`}
          value={formatCompactUSD(kpis.latestTotal)}
          /* Only the fall is coloured, and only the figure: the arrow and the
             sign already say which way the month went, so spending red on the
             one case that wants a second look is what makes it read. The
             headline above stays in the text colour either way. */
          note={
            <span className="flex items-center gap-1.5">
              <Trend
                aria-hidden
                className={cn("size-3.5", mom < 0 && "text-destructive")}
              />
              <span
                className={cn(
                  "font-medium tabular-nums",
                  mom < 0 ? "text-destructive" : "text-foreground",
                )}
              >
                {mom >= 0 ? "+" : ""}
                {mom.toFixed(1)}%
              </span>
              vs prior month
            </span>
          }
        />
        <StatCard
          label="Largest ref code"
          value={formatCompactUSD(refKpis.topTotal)}
          /* The card is headlined by an amount; the code belongs in the line
             that explains whose amount it is. */
          note={
            <span className="flex flex-wrap items-center gap-1.5">
              ref code
              <span className="font-mono font-medium text-foreground">
                {refKpis.topRefCode}
              </span>
              {`· ${topRow?.group ?? "—"} · ${formatPercent(topShare)} of total DR`}
            </span>
          }
        />
      </div>

      {/* A ranked bar rather than a card each: it fills the row at any group
          count, and answers "how lopsided is this?" in one glance. */}
      <Panel
        title="Allocation by group"
        description="Distribution rewards over the whole window, ranked. Every figure is also in the table below."
      >
        <ChartContainer
          config={allocationConfig}
          className="aspect-auto w-full"
          style={{ height: groups.length * 44 + 16 }}
        >
          <BarChart
            data={allocation}
            layout="vertical"
            margin={{ left: 0, right: 72, top: 4, bottom: 4 }}
          >
            <XAxis type="number" dataKey="total" hide />
            <YAxis
              type="category"
              dataKey="group"
              tickLine={false}
              axisLine={false}
              width={92}
              fontSize={12}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideIndicator
                  formatter={moneyTooltip({ total: "Total DR" }, (n) =>
                    formatUSD(n),
                  )}
                />
              }
            />
            {/* minPointSize keeps a sliver for a group whose share rounds to
                nothing, so its row never reads as missing data */}
            <Bar dataKey="total" radius={6} maxBarSize={26} minPointSize={3}>
              {allocation.map((a) => (
                <Cell key={a.group} fill={a.color} />
              ))}
              <LabelList
                dataKey="total"
                position="right"
                offset={10}
                className="fill-foreground"
                fontSize={12}
                formatter={(v: unknown) => formatCompactUSD(Number(v))}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </Panel>

      {/* Monthly distribution table */}
      <Panel
        title="Monthly breakdown"
        description="Distribution rewards per group, month by month. Select a row to break it down by ref code."
        flush
      >
        <DistributionTable
          groups={groups}
          grand={grand}
          onViewGroup={onViewGroup}
        />
        <TotalRow
          className="border-t pt-4"
          label="Aggregate · all groups"
          value={`${formatUSD(grand)} total DR`}
        />
      </Panel>

      {/* Monthly totals */}
      <Panel
        title="Monthly totals"
        description={`Combined distribution rewards across every group, ${monthLabels[reportMonths[0]]} – ${monthLabels[reportMonths[reportMonths.length - 1]]}.`}
      >
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-56 w-full @3xl/main:h-64"
        >
          <BarChart data={monthly} margin={{ top: 28, left: 4, right: 4 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideIndicator
                  formatter={moneyTooltip(
                    { total: "Total DR" },
                    (n) => formatUSD(n),
                  )}
                />
              }
            />
            <Bar dataKey="total" fill="var(--color-total)" radius={8} maxBarSize={72}>
              <LabelList
                position="top"
                offset={10}
                className="fill-foreground"
                fontSize={12}
                formatter={(v: unknown) => formatCompactUSD(Number(v))}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </Panel>
    </div>
  );
}

/* ---------------------------------------------------------------- table */

function DistributionTable({
  groups,
  grand,
  onViewGroup,
}: {
  groups: ReturnType<typeof orderedGroups>;
  grand: number;
  onViewGroup: (group: string) => void;
}) {
  const { monthLabels, reportMonths } = useDr();
  const [open, setOpen] = React.useState<Record<string, boolean>>({});
  const toggle = (g: string) => setOpen((o) => ({ ...o, [g]: !o[g] }));

  return (
    <DataTable>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <Th className="w-[220px]">Group</Th>
          {reportMonths.map((m) => (
            <Th key={m} numeric>
              {monthLabels[m]}
            </Th>
          ))}
          <Th numeric>Total</Th>
          <Th numeric>Share</Th>
          <Th numeric>Codes</Th>
          <Th className="w-0" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {groups.map((g) => {
          const share = grand > 0 ? ((g.total ?? 0) / grand) * 100 : 0;
          const isOpen = open[g.group];
          return (
            <React.Fragment key={g.group}>
              <TableRow
                onClick={() => toggle(g.group)}
                aria-expanded={isOpen}
                className="cursor-pointer"
              >
                <Td className="font-medium">
                  <span className="flex items-center gap-2">
                    <CaretRightIcon
                      aria-hidden
                      className={cn(
                        "size-3.5 text-muted-foreground transition-transform",
                        isOpen && "rotate-90",
                      )}
                    />
                    <Swatch color={groupColor(g.group)} />
                    {/* GROUP_META.blurb, previously unused. A tooltip rather
                        than a second line: this row is the parent of every ref
                        code inside it and has to stay one line tall. */}
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <span className="cursor-help underline decoration-muted-foreground/50 decoration-dotted underline-offset-4" />
                        }
                      >
                        {g.group}
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs text-pretty">
                        {groupMeta(g.group).blurb}
                      </TooltipContent>
                    </Tooltip>
                  </span>
                </Td>
                {reportMonths.map((m) => (
                  <Td key={m} numeric className="text-muted-foreground">
                    {cell(g.monthly[m])}
                  </Td>
                ))}
                <Td numeric className="font-medium">
                  {formatCompactUSD(g.total)}
                </Td>
                <Td numeric className="text-muted-foreground">
                  {formatPercent(share)}
                </Td>
                <Td numeric className="text-muted-foreground">
                  {g.refCodes.length}
                </Td>
                <Td className="py-0">
                  {/* the row itself expands, so the jump to the ledger needs
                      its own target and has to keep the click to itself */}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`View ${g.group} ref codes in the ledger`}
                    title="Open in the ledger"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewGroup(g.group);
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ArrowRightIcon aria-hidden />
                  </Button>
                </Td>
              </TableRow>

              {isOpen &&
                g.refCodes.map((rc) => (
                  <TableRow key={`${g.group}-${rc.refCode}`} className="bg-muted/30">
                    <Td className="pl-6">
                      <span className="flex flex-wrap items-center gap-2 pl-6">
                        <span className="font-mono">{rc.refCode}</span>
                        {rc.notes ? <NoteBadge note={rc.notes} /> : null}
                      </span>
                    </Td>
                    {reportMonths.map((m) => (
                      <Td key={m} numeric className="text-muted-foreground">
                        {cell(rc.monthly[m])}
                      </Td>
                    ))}
                    <Td numeric>{formatCompactUSD(rc.total)}</Td>
                    <Td numeric className="text-muted-foreground">
                      {grand > 0
                        ? formatPercent(((rc.total ?? 0) / grand) * 100)
                        : "—"}
                    </Td>
                    <Td />
                    <Td />
                  </TableRow>
                ))}
            </React.Fragment>
          );
        })}
      </TableBody>
    </DataTable>
  );
}

function cell(v: number | null | undefined) {
  if (v == null) return <Dash />;
  // A real zero is a reported figure, not a gap, so it keeps its digit.
  if (v === 0) return <span className="text-muted-foreground">0</span>;
  return formatCompactUSD(v);
}
