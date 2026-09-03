"use client";

import * as React from "react";
import {
  Bar as RBar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { SkyTotalReport } from "@/lib/sky-total/types";
import { formatCompactTokens, formatTokens, monthShort } from "@/lib/format";
import { cn } from "@/lib/utils";

import { useSkyTotal } from "../data-context";
import {
  DataTable,
  Dash,
  FilterGroup,
  FilterItem,
  LegendItem,
  PageHeader,
  Panel,
  StatCard,
  TableBody,
  TableHeader,
  TableRow,
  Td,
  Th,
} from "../kit";

const num = (v: number | null) => v ?? 0;

/** Signed compact figure for a waterfall delta, e.g. "+12.3M" / "−1.4M". */
function signedCompact(v: number) {
  const s = formatCompactTokens(Math.abs(v));
  return v < 0 ? `−${s}` : `+${s}`;
}

export function SkyTotalNetRevenue() {
  const { months, monthLabels, reports } = useSkyTotal();

  const ordered = React.useMemo(
    () => [...reports].sort((a, b) => a.month.localeCompare(b.month)),
    [reports],
  );

  const sum = (pick: (r: SkyTotalReport) => number | null) =>
    ordered.reduce((t, r) => t + num(pick(r)), 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Sky total net revenue"
        description="Consolidated protocol net revenue · buffer basis"
        /* no meta row: the basis is in the line above, the unit is on every
           card, and the settlement count is the first card's own footnote */
      />

      <div className="grid grid-cols-1 gap-4 @3xl/main:grid-cols-3">
        <StatCard
          label="Total Sky Net Revenue"
          value={formatCompactTokens(sum((r) => r.skyNetRevenue))}
          unit="USDS"
          note={`Consolidated, across ${months.length} monthly settlements`}
        />
        <StatCard
          label="Total MSC net"
          value={formatCompactTokens(sum((r) => r.mscNet))}
          unit="USDS"
          note="Prime-agent perimeter, buffer basis"
        />
        <StatCard
          label="Total non-MSC net"
          value={formatCompactTokens(sum((r) => r.nonMscNet))}
          unit="USDS"
          note="Protocol P&L outside the MSC perimeter"
        />
      </div>

      <Waterfall reports={ordered} monthLabels={monthLabels} />

      <ReconciliationTable reports={ordered} monthLabels={monthLabels} />

      <p className="text-xs text-muted-foreground">
        Source: soter · settlement-reports · sky_total · {months.length} monthly
        reports · USDS · methodology handoff 2026-07-16 §3 (buffer basis)
      </p>
    </div>
  );
}

/* --------------------------------------------------------------- waterfall */

type Step = {
  key: string;
  label: string;
  /** "flow" adds to the running total; "total" is a subtotal anchored at 0. */
  kind: "flow" | "total";
  value: number;
};

function stepsFor(r: SkyTotalReport): Step[] {
  return [
    { key: "debt", label: "Debt minted", kind: "flow", value: num(r.debtMintedSubtotal) },
    { key: "subproxy", label: "Prime subproxy", kind: "flow", value: num(r.subproxySubtotalRaw) },
    { key: "demand", label: "Demand-side buffer", kind: "flow", value: num(r.demandSideBuffer) },
    { key: "cc", label: "Core Council", kind: "flow", value: num(r.coreCouncilGenesisRepayment) },
    { key: "tge", label: "Grove TGE penalty", kind: "flow", value: num(r.groveTgePenalty) },
    { key: "msc", label: "MSC net", kind: "total", value: num(r.mscNet) },
    { key: "nonmsc", label: "Non-MSC net", kind: "flow", value: num(r.nonMscNet) },
    { key: "sky", label: "Sky Net Revenue", kind: "total", value: num(r.skyNetRevenue) },
  ];
}

/**
 * Resolve each step to the floating span a waterfall bar occupies: `base` is
 * the invisible pedestal it sits on and `delta` its drawn height, so a stacked
 * bar chart can render the whole thing with no bespoke geometry.
 */
function layoutBars(steps: Step[]) {
  let running = 0;
  return steps.map((s) => {
    if (s.kind === "total") {
      running = s.value;
      return { ...s, base: Math.min(0, s.value), delta: Math.abs(s.value) };
    }
    const start = running;
    const end = running + s.value;
    running = end;
    return { ...s, base: Math.min(start, end), delta: Math.abs(s.value) };
  });
}

/**
 * Direction is data, so these come from the chart ramp rather than from the
 * interface's accent, which is neutral and would collide with the subtotal.
 * Blue in, red out, and a subtotal — neither, and able to land either side of
 * zero — in the text colour. Blue rather than green because red/green is the
 * pair most commonly lost to colour blindness, and it is the one pair a reader
 * has to tell apart to read the chart at all.
 */
const waterfallConfig = {
  delta: { label: "Amount" },
  inflow: { label: "Into the buffer", color: "var(--chart-3)" },
  outflow: { label: "Out of the buffer", color: "var(--destructive)" },
  subtotal: { label: "Subtotal", color: "var(--foreground)" },
} satisfies ChartConfig;

function Waterfall({
  reports,
  monthLabels,
}: {
  reports: SkyTotalReport[];
  monthLabels: Record<string, string>;
}) {
  const [month, setMonth] = React.useState(reports[reports.length - 1].month);
  const report =
    reports.find((r) => r.month === month) ?? reports[reports.length - 1];
  const bars = layoutBars(stepsFor(report));

  return (
    <Panel
      title="How the month reconciles"
      hint="Debt minted to the buffer, less what flows back out to primes, the Demand-side Buffer, the Core Council (genesis portion) and the Grove TGE penalty, gives MSC net; adding non-MSC net gives Sky Net Revenue."
      description={`${monthLabels[report.month] ?? report.month} · every figure in USDS`}
      action={
        <FilterGroup
          value={[month]}
          onValueChange={(v) => v[0] && setMonth(v[0])}
          aria-label="Settlement month"
        >
          {reports.map((r) => (
            <FilterItem key={r.month} value={r.month}>
              {monthShort(r.month)}
            </FilterItem>
          ))}
        </FilterGroup>
      }
      footer={
        report.notes.length > 0 ? (
          <ul className="grid w-full gap-1.5">
            {report.notes.map((note, i) => (
              <li key={i} className="text-xs leading-relaxed">
                {note}
              </li>
            ))}
          </ul>
        ) : null
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4">
          <LegendItem color="var(--chart-3)">Into the buffer</LegendItem>
          <LegendItem color="var(--destructive)">Out of the buffer</LegendItem>
          <LegendItem color="var(--foreground)">Subtotal</LegendItem>
        </div>

        <ChartContainer
          config={waterfallConfig}
          className="aspect-auto h-80 w-full @3xl/main:h-96"
        >
          <BarChart data={bars} margin={{ top: 24, left: 4, right: 4 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              interval={0}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              height={44}
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={52}
              fontSize={12}
              tickFormatter={(v: number) => formatCompactTokens(v)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideIndicator
                  formatter={(_v, _n, item) => (
                    <span className="flex flex-1 items-center justify-between gap-4 leading-none">
                      <span className="text-muted-foreground">
                        {(item as { payload?: Step })?.payload?.kind === "total"
                          ? "Subtotal"
                          : ((item as { payload?: Step })?.payload?.value ?? 0) < 0
                            ? "Out of the buffer"
                            : "Into the buffer"}
                      </span>
                      <span className="font-medium text-foreground tabular-nums">
                        {formatTokens(
                          (item as { payload?: Step })?.payload?.value ?? 0,
                        )}
                      </span>
                    </span>
                  )}
                />
              }
            />
            {/* the invisible pedestal each floating bar sits on */}
            <RBar dataKey="base" stackId="w" fill="transparent" maxBarSize={72} />
            <RBar dataKey="delta" stackId="w" radius={4} maxBarSize={72}>
              {bars.map((b) => (
                <Cell
                  key={b.key}
                  fill={
                    b.kind === "total"
                      ? "var(--color-subtotal)"
                      : b.value < 0
                        ? "var(--color-outflow)"
                        : "var(--color-inflow)"
                  }
                />
              ))}
              <LabelList
                dataKey="value"
                position="top"
                offset={8}
                className="fill-foreground"
                fontSize={12}
                formatter={(v: unknown) => signedCompact(Number(v))}
              />
            </RBar>
          </BarChart>
        </ChartContainer>
      </div>
    </Panel>
  );
}

/* ---------------------------------------------------------- statement table */

type Row =
  | { kind: "group"; label: string }
  | {
      kind: "prime" | "subtotal" | "less" | "detail" | "headline";
      label: string;
      value: (r: SkyTotalReport) => number | null;
    };

/** First-seen union of the keys of a per-prime array across all reports. */
function unionKeys(
  reports: SkyTotalReport[],
  pick: (r: SkyTotalReport) => { key: string; label: string }[],
) {
  const seen = new Map<string, string>();
  for (const r of reports)
    for (const line of pick(r)) if (!seen.has(line.key)) seen.set(line.key, line.label);
  return [...seen].map(([key, label]) => ({ key, label }));
}

function ReconciliationTable({
  reports,
  monthLabels,
}: {
  reports: SkyTotalReport[];
  monthLabels: Record<string, string>;
}) {
  const debtPrimes = unionKeys(reports, (r) => r.debtMinted);
  const subproxyPrimes = unionKeys(reports, (r) => r.subproxy);
  const lineVal =
    (
      list: (r: SkyTotalReport) => { key: string; value: number | null }[],
      key: string,
    ) =>
    (r: SkyTotalReport) =>
      list(r).find((x) => x.key === key)?.value ?? null;

  const rows: Row[] = [
    { kind: "group", label: "MSC leg (buffer basis)" },
    ...debtPrimes.map(
      (p): Row => ({
        kind: "prime",
        label: `Debt minted — ${p.label}`,
        value: lineVal((r) => r.debtMinted, p.key),
      }),
    ),
    { kind: "subtotal", label: "Debt minted — subtotal", value: (r) => r.debtMintedSubtotal },
    ...subproxyPrimes.map(
      (p): Row => ({
        kind: "prime",
        label: `Subproxy — ${p.label}`,
        value: lineVal((r) => r.subproxy, p.key),
      }),
    ),
    { kind: "subtotal", label: "Sent to prime subproxy — subtotal (raw)", value: (r) => r.subproxySubtotalRaw },
    { kind: "less", label: "Sent to Demand-side Buffer", value: (r) => r.demandSideBuffer },
    { kind: "detail", label: "Core Council — on-chain gross", value: (r) => r.coreCouncilGross },
    { kind: "detail", label: "Core Council — Step 1 Capital (add-back)", value: (r) => r.coreCouncilStep1Capital },
    { kind: "less", label: "Core Council — net cost", value: (r) => r.coreCouncilGenesisRepayment },
    { kind: "less", label: "Grove TGE penalty", value: (r) => r.groveTgePenalty },
    { kind: "subtotal", label: "MSC net (buffer basis)", value: (r) => r.mscNet },
    { kind: "group", label: "Non-MSC leg" },
    { kind: "detail", label: "non-MSC income", value: (r) => r.nonMscIncome },
    { kind: "detail", label: "non-MSC expense", value: (r) => r.nonMscExpense },
    { kind: "subtotal", label: "non-MSC net", value: (r) => r.nonMscNet },
    { kind: "headline", label: "Sky Net Revenue", value: (r) => r.skyNetRevenue },
  ];

  const cols = reports.length + 1;

  return (
    <Panel
      title="Monthly reconciliation"
      hint="Every line of the settlement report, components down and months across."
      flush
    >
      <DataTable>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <Th className="min-w-[280px]">Component</Th>
            {reports.map((r) => (
              <Th key={r.month} numeric>
                {monthLabels[r.month] ?? r.month}
              </Th>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) =>
            row.kind === "group" ? (
              <TableRow key={row.label} className="bg-muted/40 hover:bg-muted/40">
                <Td colSpan={cols} className="font-medium">
                  {row.label}
                </Td>
              </TableRow>
            ) : (
              <TableRow
                key={row.label}
                className={cn(
                  row.kind === "headline" && "bg-muted/60 hover:bg-muted/60",
                )}
              >
                <Td
                  className={cn(
                    (row.kind === "prime" || row.kind === "detail") &&
                      "pl-10 text-muted-foreground first:pl-10",
                    (row.kind === "subtotal" || row.kind === "headline") &&
                      "font-medium",
                  )}
                >
                  {row.label}
                </Td>
                {reports.map((r) => {
                  const v = row.value(r);
                  return (
                    <Td
                      key={r.month}
                      numeric
                      className={cn(
                        // the per-prime and add-back lines are the arithmetic;
                        // the subtotals are what the statement is for
                        (row.kind === "prime" || row.kind === "detail") &&
                          "text-muted-foreground",
                        row.kind === "subtotal" && "font-medium",
                        row.kind === "headline" && "font-semibold",
                      )}
                    >
                      {v === null ? <Dash /> : formatTokens(v)}
                    </Td>
                  );
                })}
              </TableRow>
            ),
          )}
        </TableBody>
      </DataTable>
    </Panel>
  );
}
