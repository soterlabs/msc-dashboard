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
import type { SkyTotalBasis, SkyTotalReport } from "@/lib/sky-total/types";
import { formatCompactTokens, formatTokens, monthShort } from "@/lib/format";
import { cn } from "@/lib/utils";

import { useSkyTotal } from "../data-context";
import {
  DataTable,
  Dash,
  MonthPicker,
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

/**
 * What each basis counts. Kept next to the view rather than in the dataset:
 * the reports state it in prose, and it is a reader-facing explanation, not a
 * figure anything is computed from.
 */
const BASIS_META: Record<SkyTotalBasis, { label: string; blurb: string }> = {
  buffer: {
    label: "buffer",
    blurb: "The settlement that executed in this month — the previous cycle's revenue",
  },
  accrual: {
    label: "accrual",
    blurb: "Revenue earned in this month, paid at the settlement that follows it",
  },
};

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
  const latest = ordered[ordered.length - 1];

  // Where the definition changed, read off the data rather than written down:
  // the note below has to keep telling the truth after the next refresh.
  const lastBuffer = [...ordered].reverse().find((r) => r.basis === "buffer");
  const firstAccrual = ordered.find((r) => r.basis === "accrual");

  /* The cards headline the latest month rather than a running total, because
     the series changed definition partway through and a sum across the break
     would not mean anything: a buffer month carries the settlement that
     EXECUTED in it (so, the previous cycle's revenue), an accrual month the
     revenue EARNED in it. Adding the two either counts a cycle twice or skips
     one, depending where the boundary falls. The table below keeps every month
     side by side, which is the honest way to see the whole series. */
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Sky total net revenue"
        description="Consolidated protocol net revenue"
        meta={[
          { label: "latest", value: monthLabels[latest.month] ?? latest.month },
          { label: "basis", value: BASIS_META[latest.basis].label },
          { label: "months", value: months.length },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 @3xl/main:grid-cols-3">
        <StatCard
          label={`Sky Net Revenue · ${monthLabels[latest.month] ?? latest.month}`}
          value={formatCompactTokens(latest.skyNetRevenue)}
          unit="USDS"
          note={BASIS_META[latest.basis].blurb}
        />
        <StatCard
          label="MSC net"
          value={formatCompactTokens(latest.mscNet)}
          unit="USDS"
          note="Prime-agent perimeter — minted to the buffer, less what went out to primes"
        />
        <StatCard
          label="Non-MSC net"
          value={formatCompactTokens(latest.nonMscNet)}
          unit="USDS"
          note="Protocol P&L outside the MSC perimeter"
        />
      </div>

      <Waterfall reports={ordered} />

      <ReconciliationTable reports={ordered} monthLabels={monthLabels} />

      <p className="text-xs text-muted-foreground">
        Source: soter · settlement-reports · sky_total · {months.length} monthly
        reports · USDS
        {lastBuffer && firstAccrual
          ? ` · buffer basis through ${monthLabels[lastBuffer.month] ?? lastBuffer.month}, accrual from ${monthLabels[firstAccrual.month] ?? firstAccrual.month} (operator definition 2026-08-07)`
          : ` · ${BASIS_META[latest.basis].label} basis`}
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

/**
 * The waterfall is the same on both bases — minted, less what went out, gives
 * MSC net; plus the non-MSC leg gives Sky Net Revenue. Only the wording of the
 * first two changes, because on the accrual basis they preview a settlement
 * that has not run yet.
 *
 * The Core Council transfer and the Grove TGE penalty used to appear here. They
 * are not deductions from net revenue and the reports now print them below the
 * line (or, on the accrual basis, not at all until the settlement executes), so
 * they belong in the statement table rather than in this chain.
 */
function stepsFor(r: SkyTotalReport): Step[] {
  const accrual = r.basis === "accrual";
  return [
    {
      key: "minted",
      label: accrual ? "MSC debt (mint)" : "Debt minted",
      kind: "flow",
      value: r.mintedTotal,
    },
    {
      key: "sent",
      label: accrual ? "Send to primes" : "Sent to primes",
      kind: "flow",
      value: r.sentTotal,
    },
    { key: "msc", label: "MSC net", kind: "total", value: r.mscNet },
    {
      key: "nonmsc",
      label: "Non-MSC net",
      kind: "flow",
      value: r.nonMscNet,
    },
    {
      key: "sky",
      label: "Sky Net Revenue",
      kind: "total",
      value: r.skyNetRevenue,
    },
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

function WrappedTick({
  x,
  y,
  payload,
}: {
  x?: number;
  y?: number;
  payload?: { value?: string | number };
}) {
  const words = String(payload?.value ?? "").split(" ");
  const mid = Math.ceil(words.length / 2);
  const lines =
    words.length > 1
      ? [words.slice(0, mid).join(" "), words.slice(mid).join(" ")]
      : words;
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      className="fill-muted-foreground"
      fontSize={12}
    >
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 12 : 14}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

function Waterfall({ reports }: { reports: SkyTotalReport[] }) {
  const [month, setMonth] = React.useState(reports[reports.length - 1].month);
  const report =
    reports.find((r) => r.month === month) ?? reports[reports.length - 1];
  const bars = layoutBars(stepsFor(report));

  return (
    <Panel
      title="How the month reconciles"
      hint="Debt minted, less what goes back out to the primes, gives MSC net; adding the non-MSC leg gives Sky Net Revenue. The Core Council transfer and the capital seedings sit below that line — see the statement below."
      description={`Every figure in USDS · ${BASIS_META[report.basis].label} basis — ${BASIS_META[report.basis].blurb.toLowerCase()}`}
      action={
        <MonthPicker
          value={month}
          onChange={setMonth}
          months={reports.map((r) => r.month)}
          render={monthShort}
          label="Month"
          aria-label="Settlement month"
        />
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

        <div className="scroll-thin -mx-1 overflow-x-auto px-1">
          <ChartContainer
            config={waterfallConfig}
            className="aspect-auto h-80 w-full min-w-[40rem] @3xl/main:h-96"
          >
            <BarChart data={bars} margin={{ top: 24, left: 4, right: 4 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                interval={0}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                height={52}
                tick={<WrappedTick />}
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
                          {(item as { payload?: Step })?.payload?.kind ===
                          "total"
                            ? "Subtotal"
                            : ((item as { payload?: Step })?.payload?.value ??
                                  0) < 0
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
              <RBar
                dataKey="base"
                stackId="w"
                fill="transparent"
                maxBarSize={72}
                tooltipType="none"
              />
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
      </div>
    </Panel>
  );
}

/* ---------------------------------------------------------- statement table */

type Row =
  | { kind: "group"; label: string }
  | { kind: "basis"; label: string }
  | {
      kind: "prime" | "subtotal" | "less" | "detail" | "headline";
      label: string;
      value: (r: SkyTotalReport) => number | null;
    };

/** First-seen union of the prime keys across all reports, in report order. */
function unionPrimes(reports: SkyTotalReport[]) {
  const seen = new Map<string, string>();
  for (const r of reports)
    for (const line of r.primes) if (!seen.has(line.key)) seen.set(line.key, line.label);
  return [...seen].map(([key, label]) => ({ key, label }));
}

function ReconciliationTable({
  reports,
  monthLabels,
}: {
  reports: SkyTotalReport[];
  monthLabels: Record<string, string>;
}) {
  const primes = unionPrimes(reports);
  const primeVal =
    (key: string, field: "minted" | "sent") => (r: SkyTotalReport) =>
      r.primes.find((p) => p.key === key)?.[field] ?? null;

  // Only worth a section if some month actually reports it: the accrual months
  // cannot, and a block of dashes says nothing.
  const anyBelow = reports.some((r) => r.belowTheLine);
  const below =
    (field: keyof NonNullable<SkyTotalReport["belowTheLine"]>) =>
    (r: SkyTotalReport) =>
      r.belowTheLine?.[field] ?? null;

  const rows: Row[] = [
    // Which reading each column is on. Without it the table silently splices
    // two definitions of a month together, which is the one thing a reader has
    // to know before comparing columns.
    { kind: "basis", label: "Basis" },
    { kind: "group", label: "MSC leg" },
    ...primes.map((p): Row => ({
      kind: "prime",
      label: `Debt minted — ${p.label}`,
      value: primeVal(p.key, "minted"),
    })),
    {
      kind: "subtotal",
      label: "Debt minted — total",
      value: (r) => r.mintedTotal,
    },
    ...primes.map((p): Row => ({
      kind: "prime",
      label: `Sent to prime — ${p.label}`,
      value: primeVal(p.key, "sent"),
    })),
    {
      kind: "subtotal",
      label: "Sent to primes — total",
      value: (r) => r.sentTotal,
    },
    { kind: "subtotal", label: "MSC net", value: (r) => r.mscNet },
    { kind: "group", label: "Non-MSC leg" },
    { kind: "detail", label: "non-MSC income", value: (r) => r.nonMscIncome },
    { kind: "detail", label: "non-MSC expense", value: (r) => r.nonMscExpense },
    {
      kind: "detail",
      label: "Demand-side Buffer transfer",
      value: (r) => r.demandSideBuffer,
    },
    { kind: "subtotal", label: "non-MSC net", value: (r) => r.nonMscNet },
    {
      kind: "headline",
      label: "Sky Net Revenue",
      value: (r) => r.skyNetRevenue,
    },
    ...(anyBelow
      ? ([
          { kind: "group", label: "Below the line (not deducted above)" },
          {
            kind: "less",
            label: "Core Council Buffer transfer",
            value: below("coreCouncil"),
          },
          {
            kind: "detail",
            label: "of which: Step 1 Capital distribution",
            value: below("step1Capital"),
          },
          {
            kind: "detail",
            label: "of which: genesis / expense repayments",
            value: below("genesisRepayments"),
          },
          { kind: "less", label: "Capital seedings", value: below("capitalSeedings") },
          {
            kind: "subtotal",
            label: "Remitted to Sky reserves (known items only)",
            value: below("remitted"),
          },
        ] as Row[])
      : []),
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
              <TableRow
                key={row.label}
                className="bg-muted/40 hover:bg-muted/40"
              >
                <Td colSpan={cols} className="font-medium">
                  {row.label}
                </Td>
              </TableRow>
            ) : row.kind === "basis" ? (
              <TableRow key={row.label}>
                <Td className="text-muted-foreground">{row.label}</Td>
                {reports.map((r) => (
                  <Td key={r.month} numeric className="text-muted-foreground">
                    {BASIS_META[r.basis].label}
                  </Td>
                ))}
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
