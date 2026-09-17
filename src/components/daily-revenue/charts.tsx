"use client";

import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";
import { Panel } from "@/components/kit";
import { ChartContainer } from "@/components/ui/chart";
import { comparisonGroups, componentRows, trendRows } from "@/lib/daily-revenue/charts";
import { distributionNote } from "@/lib/daily-revenue/domain";
import { usd } from "@/lib/daily-revenue/decimal";
import type { Estimate, History } from "@/lib/daily-revenue/types";

const config = {
  prime: { label: "Prime total", color: "var(--chart-1)" },
  sky: { label: "Sky revenue", color: "var(--chart-2)" },
  amount: { label: "MTD revenue", color: "var(--chart-1)" },
};
const axisUSD = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(value);

function RevenueTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: readonly { dataKey?: string | number; name?: string | number; payload?: { exact?: string | { prime: string; sky: string } } }[];
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  return <div className="rounded-lg border bg-background p-3 text-xs shadow-md">
    <p className="mb-2 font-medium">{label}</p>
    {payload.map((entry) => {
      const exact = entry.payload?.exact;
      const value = typeof exact === "string" ? exact : entry.dataKey === "prime" ? exact?.prime : exact?.sky;
      return <p key={entry.dataKey} className="tabular-nums">{entry.name}: {usd(value ?? null)}</p>;
    })}
  </div>;
}

export function RevenueTrend({ history }: { history: History }) {
  const rows = trendRows(history);
  const count = rows.filter((r) => r.exact).length;
  return <Panel title="Month-to-date revenue trend" description={`${count} published ${count === 1 ? "observation" : "observations"} · ${history.start} to ${history.end} (UTC)`}>
    {count ? <ChartContainer config={config} className="h-72 w-full aspect-auto" aria-label="Month-to-date prime total and Sky revenue by UTC cutoff">
      <LineChart data={rows} margin={{ top: 12, right: 16, left: 8, bottom: 4 }} accessibilityLayer>
        <CartesianGrid vertical={false} /><XAxis dataKey="cutoff" tickFormatter={(v: string) => v.slice(8)} minTickGap={20} /><YAxis tickFormatter={axisUSD} width={76} />
        <ReferenceLine y={0} /><Tooltip content={<RevenueTooltip />} /><Legend />
        <Line type="linear" dataKey="prime" name="Prime total" stroke="var(--color-prime)" strokeWidth={2} dot={{ r: 4 }} connectNulls={false} isAnimationActive={false} />
        <Line type="linear" dataKey="sky" name="Sky revenue" stroke="var(--color-sky)" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 4 }} connectNulls={false} isAnimationActive={false} />
      </LineChart>
    </ChartContainer> : <p className="text-sm text-muted-foreground">No published observations in this period.</p>}
    <p className="mt-3 text-xs text-muted-foreground">{count === 1 ? "One observation is shown as a point. " : ""}Missing dates remain gaps. These are cumulative estimates, not daily earnings; changes may include revisions. Exact values are available in the observations table below.</p>
  </Panel>;
}

export function RevenueComponents({ estimate }: { estimate: Estimate }) {
  const rows = componentRows(estimate);
  return <Panel title="What makes up prime revenue?" description={`MTD through ${estimate.cutoff} · ${distributionNote(estimate)}`}>
    <ChartContainer config={config} className="h-72 w-full aspect-auto" aria-label="Components of the provisional prime total in USD">
      <BarChart data={rows} layout="vertical" margin={{ right: 16, left: 0 }} accessibilityLayer>
        <CartesianGrid horizontal={false} /><XAxis type="number" tickFormatter={axisUSD} /><YAxis type="category" dataKey="name" width={132} tickLine={false} axisLine={false} />
        <ReferenceLine x={0} /><Tooltip content={<RevenueTooltip />} /><Bar dataKey="amount" name="MTD revenue" fill="var(--color-amount)" radius={3} isAnimationActive={false} />
      </BarChart>
    </ChartContainer>
    <p className="mt-3 text-xs text-muted-foreground">These five components sum to the prime total. External venue rewards are already included in supply-side revenue. Sky revenue is shown separately in the trend.</p>
    <details className="mt-3 text-xs"><summary className="cursor-pointer font-medium">View component values</summary><dl className="mt-3 space-y-2">{rows.map((r) => <div key={r.name} className="flex justify-between gap-4"><dt>{r.name}</dt><dd className="tabular-nums">{usd(r.exact)}</dd></div>)}</dl></details>
  </Panel>;
}

export function PrimeComparison({ estimates }: { estimates: Estimate[] }) {
  const groups = comparisonGroups(estimates);
  if (!groups.length) return null;
  return <Panel title="Revenue by prime" description="Provisional MTD estimates · primes are grouped by the same UTC cutoff for comparison.">
    <div className="space-y-6">{groups.map(({ cutoff, rows }) => <div key={cutoff}>
      <p className="mb-3 text-sm font-medium">Through {cutoff} (UTC) · {rows.length} of 6 primes</p>
      <ChartContainer config={config} className="h-72 w-full aspect-auto" aria-label={`Prime total and Sky revenue through ${cutoff}`}>
        <BarChart data={rows} margin={{ top: 8, right: 12, left: 8 }} accessibilityLayer>
          <CartesianGrid vertical={false} /><XAxis dataKey="name" /><YAxis tickFormatter={axisUSD} width={76} /><ReferenceLine y={0} />
          <Tooltip content={<RevenueTooltip />} /><Legend />
          <Bar dataKey="prime" name="Prime total" fill="var(--color-prime)" radius={3} isAnimationActive={false} />
          <Bar dataKey="sky" name="Sky revenue" fill="var(--color-sky)" radius={3} isAnimationActive={false} />
        </BarChart>
      </ChartContainer>
    </div>)}</div>
    <p className="mt-3 text-xs text-muted-foreground">Unavailable primes are omitted, not counted as zero. See the prime cards below for exact values, freshness and included rewards.</p>
  </Panel>;
}
