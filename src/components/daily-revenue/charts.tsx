"use client";

import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";
import { Panel, LegendItem } from "@/components/kit";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { usd } from "@/lib/daily-revenue/decimal";
import type { RevenuePoint } from "@/lib/daily-revenue/types";
import { formatCompactUSD } from "@/lib/format";

export interface RevenueLine { key: string; label: string; color: string; points: RevenuePoint[] }
const dayLabel = (day: string) => new Date(`${day}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

export function RevenueChart({ lines, mode = "daily" }: { lines: RevenueLine[]; mode?: "daily" | "mtd" }) {
  const dates = lines[0]?.points.map((p) => p.date) ?? [];
  const rows = dates.map((date) => {
    const exact: Record<string, string | null> = {};
    const row: Record<string, string | number | null | Record<string, string | null>> = { date, exact };
    for (const line of lines) {
      const value = line.points.find((p) => p.date === date)?.[mode] ?? null;
      exact[line.key] = value;
      row[line.key] = value === null ? null : Number(value);
    }
    return row;
  });
  const config = Object.fromEntries(lines.map((line) => [line.key, { label: line.label, color: line.color }])) satisfies ChartConfig;
  const hasValues = rows.some((row) => lines.some((line) => row[line.key] !== null));
  return <Panel title={mode === "daily" ? "Daily supply-side revenue" : "Month-to-date supply-side allocation revenue"}
    description={mode === "daily" ? "Change in provisional month-to-date estimate (USD)" : "Provisional month-to-date estimate (USD)"}
    hint={mode === "daily" ? "Changes can include revisions to earlier days and are not guaranteed to be revenue earned solely that day." : undefined}>
    {hasValues ? <>
      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2">{lines.map((line) => <LegendItem key={line.key} color={line.color}>{line.label}</LegendItem>)}</div>
      <ChartContainer config={config} className="aspect-auto h-72 w-full @3xl/main:h-80" aria-label={`${mode === "daily" ? "Daily change in" : "Month-to-date"} supply-side allocation revenue`}>
        <LineChart data={rows} margin={{ top: 8, right: 12, left: 4 }} accessibilityLayer>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} tickFormatter={dayLabel} />
          <YAxis tickLine={false} axisLine={false} width={68} tickFormatter={(v: number) => formatCompactUSD(v)} domain={["auto", "auto"]} />
          <ReferenceLine y={0} stroke="var(--border)" />
          <ChartTooltip content={({ active, payload }) => {
            const row = active ? payload?.[0]?.payload as typeof rows[number] | undefined : undefined;
            if (!row) return null;
            const exact = row.exact as Record<string, string | null>;
            return <div className="min-w-56 rounded-lg border bg-popover p-3 text-xs shadow-lg">
              <p className="mb-2 text-muted-foreground">{dayLabel(String(row.date))} 2026 · UTC</p>
              <dl className="space-y-1.5">{lines.map((line) => <div key={line.key} className="flex justify-between gap-5"><dt>{line.label}</dt><dd className="font-medium tabular-nums" title={exact[line.key] ?? undefined}>{usd(exact[line.key])}</dd></div>)}</dl>
            </div>;
          }} />
          {lines.map((line) => <Line key={line.key} type="linear" dataKey={line.key} stroke={`var(--color-${line.key})`} strokeWidth={2}
            dot={false} activeDot={{ r: 4 }} connectNulls={false} isAnimationActive={false} />)}
        </LineChart>
      </ChartContainer>
    </> : <p className="py-12 text-center text-sm text-muted-foreground">No complete daily allocation observations are available. Gaps are unavailable, not zero.</p>}
  </Panel>;
}
