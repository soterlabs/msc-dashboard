"use client";

import { useId } from "react";
import { Bar as RBar, BarChart, CartesianGrid, Rectangle, Line, LineChart, ReferenceLine, XAxis, YAxis, type BarShapeProps } from "recharts";
import { LegendItem, Panel, Swatch } from "@/components/kit";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { metrics } from "@/lib/daily-revenue/domain";
import { rangeLength, type DayRange } from "@/lib/daily-revenue/calendar";
import { chargeRows, publicationChanges, trendRows } from "@/lib/daily-revenue/charts";
import { addMoney, usd, usdWhole } from "@/lib/daily-revenue/decimal";
import { primeName, type DailyPrime, type DailyRow, type History } from "@/lib/daily-revenue/types";
import { formatCompactUSD } from "@/lib/format";

const dayLabel = (value: string) => new Date(`${value}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const percent = (digits: number) => (value: number) => `${(value * 100).toFixed(digits)}%`;

const xAxis = { tickLine: false, axisLine: false, tickMargin: 8, fontSize: 12, minTickGap: 24, interval: "preserveStartEnd" } as const;
const yAxis = { tickLine: false, axisLine: false, width: 56, fontSize: 12 } as const;

function HoverCard({ period, headline, caption, rows = [], note }: {
  period: string; headline?: string; caption?: string; note?: string;
  rows?: { key: string; color: string; label: string; value: string }[];
}) {
  return <div className="min-w-[13rem] rounded-lg border bg-popover px-3 py-2 text-xs shadow-lg">
    <p className="text-muted-foreground">{period}</p>
    {headline && <>
      <p className="mt-0.5 text-base font-semibold tabular-nums">{headline}</p>
      {caption && <p className="text-[11px] text-muted-foreground">{caption}</p>}
    </>}
    {rows.length > 0 && <dl className={`grid gap-1 ${headline ? "mt-2 border-t pt-2" : "mt-1.5"}`}>
      {rows.map((row) => <div key={row.key} className="flex items-center justify-between gap-4">
        <dt className="flex items-center gap-1.5 text-muted-foreground"><Swatch color={row.color} />{row.label}</dt>
        <dd className="font-medium tabular-nums text-foreground">{row.value}</dd>
      </div>)}
    </dl>}
    {note && <p className="mt-2 border-t pt-2 text-[11px] text-muted-foreground">{note}</p>}
  </div>;
}

function Legend({ items }: { items: { key: string; color: string; label: string }[] }) {
  return <div className="mb-4 flex flex-wrap gap-4">{items.map((item) => <LegendItem key={item.key} color={item.color}>{item.label}</LegendItem>)}</div>;
}

const BAR_RADIUS = 4;

export function SkyChargeChart({ series, range }: { series: { key: DailyPrime; days: DailyRow[] }[]; range: DayRange }) {
  const clipPrefix = useId().replace(/:/g, "");
  const rows = chargeRows(series, range, "day");
  const stacked = series.length > 1;
  const published = new Set(series.flatMap(({ days }) => days.filter((d) => d.date >= range.from && d.date <= range.to).map((d) => d.date)));
  const complete = series.every(({ days }) => days.length === rangeLength(range));
  const totals = rows.map((r) => r.total).filter((t): t is string => t !== null);
  const total = totals.length ? addMoney(totals) : null;
  const config = Object.fromEntries(series.map(({ key }) => [key, { label: primeName(key), color: stacked ? `var(--group-${key})` : "var(--sky-revenue)" }])) satisfies ChartConfig;
  return <Panel title="Financing cost" hint="What Sky charges each prime per day on its utilized debt. Month-to-date Sky revenue also adds Sky-Direct revenue and subtracts the sUSDS spread reimbursement, which are reported per month only."
>
    {total !== null ? <>
      <p className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-2xl font-semibold tabular-nums @3xl/main:text-3xl">{usd(total)}</span>
        <span className="text-sm text-muted-foreground">{complete ? "over" : "available data ·"} {published.size} {published.size === 1 ? "day" : "days"}</span>
      </p>
      {stacked && <Legend items={series.map(({ key }) => ({ key, color: `var(--group-${key})`, label: primeName(key) }))} />}
      <ChartContainer config={config} className="aspect-auto h-72 w-full @3xl/main:h-80" aria-label="Sky debt charge per day">
        <BarChart data={rows} margin={{ top: 16, left: 4, right: 4 }} accessibilityLayer>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="start" {...xAxis} tickFormatter={dayLabel} />
          <YAxis {...yAxis} tickFormatter={(v: number) => formatCompactUSD(v)} />
          <ChartTooltip cursor={false} content={({ active, payload }) => {
            const row = active ? payload?.[0]?.payload as (typeof rows)[number] | undefined : undefined;
            if (!row) return null;
            const missing = series.some(({ key }) => row.published[key] < row.days);
            return <HoverCard period={row.start === row.end ? dayLabel(row.start) : `${dayLabel(row.start)} – ${dayLabel(row.end)}`}
              headline={usd(stacked ? row.total : row.exact[series[0].key])} caption={stacked ? "Financing cost · all primes" : "Financing cost"}
              rows={stacked ? [...series].reverse().map(({ key }) => ({ key, color: `var(--group-${key})`, label: primeName(key), value: usd(row.exact[key]) })) : []}
              note={missing ? "Some days have no published data yet." : undefined} />;
          }} />
          {series.map(({ key }, index) => <RBar key={key} dataKey={key} stackId="charge" fill={`var(--color-${key})`} isAnimationActive={false} maxBarSize={48}
            shape={(props: BarShapeProps) => {
              const row = props.payload as (typeof rows)[number];
              const values = series.map((s) => Number(row.exact[s.key] ?? 0));
              const value = values[index];
              if (value <= 0 || !props.height || values.some((v) => v < 0)) return <Rectangle {...props} radius={0} />;
              const scale = Math.abs(props.height) / value;
              const top = Number(props.y) - values.slice(index + 1).reduce((sum, v) => sum + v, 0) * scale;
              const height = values.reduce((sum, v) => sum + v, 0) * scale;
              const radius = Math.min(BAR_RADIUS, Number(props.width) / 2, height / 2);
              const id = `${clipPrefix}-${row.start}-${key}`;
              return <g>
                <defs><clipPath id={id} clipPathUnits="userSpaceOnUse">
                  <rect x={props.x} y={top} width={props.width} height={height + radius} rx={radius} ry={radius} />
                </clipPath></defs>
                <g clipPath={`url(#${id})`}><Rectangle {...props} radius={0} /></g>
              </g>;
            }} />)}
        </BarChart>
      </ChartContainer>
    </> : <p className="py-8 text-center text-sm text-muted-foreground">No daily data published for this month. Missing data does not mean zero.</p>}
  </Panel>;
}

type LineSpec = { key: string; label: string; color: string; dash?: string; value: (row: Record<string, unknown>) => string };
function DailyLines({ rows, lines, axis, label }: { rows: Record<string, unknown>[]; lines: LineSpec[]; axis: (value: number) => string; label: string }) {
  const config = Object.fromEntries(lines.map((l) => [l.key, { label: l.label, color: l.color }])) satisfies ChartConfig;
  return <>
    <Legend items={lines} />
    <ChartContainer config={config} className="aspect-auto h-60 w-full" aria-label={label}>
      <LineChart data={rows} margin={{ top: 8, left: 4, right: 12 }} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" {...xAxis} tickFormatter={dayLabel} />
        <YAxis {...yAxis} width={64} tickFormatter={axis} domain={["auto", "auto"]} />
        <ChartTooltip content={({ active, payload }) => {
          const row = active ? payload?.[0]?.payload as Record<string, unknown> | undefined : undefined;
          return row ? <HoverCard period={dayLabel(String(row.date))}
            rows={lines.filter((l) => row[l.key] !== null).map((l) => ({ key: l.key, color: l.color, label: l.label, value: l.value(row) }))} /> : null;
        }} />
        {lines.map((l) => <Line key={l.key} type="linear" dataKey={l.key} stroke={`var(--color-${l.key})`} strokeWidth={2} strokeDasharray={l.dash}
          dot={false} activeDot={{ r: 4, fill: "var(--card)", stroke: `var(--color-${l.key})`, strokeWidth: 2 }} connectNulls={false} isAnimationActive={false} />)}
      </LineChart>
    </ChartContainer>
  </>;
}

export function DebtChart({ days, prime }: { days: DailyRow[]; prime: DailyPrime }) {
  const rows = days.map((d) => ({ date: d.date, debt: Number(d.debt), utilized: Number(d.utilized), exactDebt: d.debt, exactUtilized: d.utilized }));
  return <Panel title="Debt and utilization" hint="Utilized debt is the part Sky charges for: debt less idle balances held in lending, AMM pools, the PSM and the ALM proxy." description="End of each UTC day · USD">
    <DailyLines rows={rows} axis={(v) => formatCompactUSD(v)} label="Debt and utilized debt by day" lines={[
      { key: "utilized", label: "Utilized debt", color: `var(--group-${prime})`, value: (r) => usdWhole(String(r.exactUtilized)) },
      { key: "debt", label: "Debt", color: "var(--chart-neutral)", value: (r) => usdWhole(String(r.exactDebt)) },
    ]} />
  </Panel>;
}

export function RatesChart({ days, prime }: { days: DailyRow[]; prime: DailyPrime }) {
  const rows = days.map((d) => ({ date: d.date, ...d.rates }));
  const lines = ([
    { key: "base", label: "Base rate", color: "var(--chart-neutral-bright)" },
    { key: "subsidized", label: "Subsidized rate", color: `var(--group-${prime})` },
    { key: "reference", label: "Target rate", color: "var(--chart-neutral)", dash: "6 4" },
    { key: "ssr", label: "Sky Savings Rate", color: "var(--chart-5)", dash: "2 3" },
  ] as const).filter((line) => days.some((d) => d.rates[line.key] !== null))
    .map((line): LineSpec => ({ ...line, value: (r) => percent(3)(Number(r[line.key])) }));
  return <Panel title="Daily rates" hint="Annualised. The subsidized and target rates apply only to primes on a subsidy schedule." description="Annualised · per UTC day">
    <DailyLines rows={rows} lines={lines} axis={percent(2)} label="Daily rates" />
  </Panel>;
}

export function PrimeRevenueTrend({ history, prime }: { history: History; prime: DailyPrime }) {
  const rows = trendRows(history).map((row) => {
    const estimate = history.results.find((e) => e.cutoff === row.cutoff);
    const sky = estimate ? metrics(estimate).sky : null;
    return { ...row, sky: sky === null ? null : Number(sky), exactSky: sky };
  });
  const months = [...new Set(rows.map((r) => r.cutoff.slice(0, 7)))];
  const count = rows.filter((r) => r.exact !== null).length;
  return <Panel title="Prime & Sky revenue (MTD)" hint="Each point is the month-to-date estimate published for that cutoff. A later publication can revise it, so the step between two points is not that day's earnings."
    description={`Month to date · ${count} published ${count === 1 ? "cutoff" : "cutoffs"}`}>
    <Legend items={[{ key: "prime", label: "Prime revenue", color: `var(--group-${prime})` }, { key: "sky", label: "Sky revenue", color: "var(--sky-revenue)" }]} />
    {count ? <ChartContainer config={{ prime: { label: "Prime revenue", color: `var(--group-${prime})` }, sky: { label: "Sky revenue", color: "var(--sky-revenue)" } }} className="aspect-auto h-60 w-full" aria-label="Month-to-date prime revenue by UTC cutoff">
      <LineChart data={rows} margin={{ top: 8, left: 4, right: 12 }} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="cutoff" {...xAxis} tickFormatter={dayLabel} />
        <YAxis {...yAxis} width={64} tickFormatter={(v: number) => formatCompactUSD(v)} />
        <ReferenceLine y={0} stroke="var(--border)" />
        <ChartTooltip content={({ active, payload }) => {
          const row = active ? payload?.[0]?.payload as (typeof rows)[number] | undefined : undefined;
          return row ? <HoverCard period={`Through ${dayLabel(row.cutoff)}`} headline={usd(row.exact)} caption="Prime revenue (MTD)" rows={[{ key: "sky", color: "var(--sky-revenue)", label: "Sky revenue", value: usd(row.exactSky) }]} /> : null;
        }} />
        {months.map((month) => <Line key={`sky-${month}`} type="linear" dataKey={(row) => row.cutoff.startsWith(month) ? row.sky : null} stroke="var(--sky-revenue)" strokeDasharray="5 3" strokeWidth={2} dot={{ r: 2 }} connectNulls={false} isAnimationActive={false} />)}
        <>{months.map((month) => <Line key={month} type="linear" dataKey={(row) => row.cutoff.startsWith(month) ? row.prime : null} stroke="var(--color-prime)" strokeWidth={2} dot={{ r: 3, fill: "var(--color-prime)", strokeWidth: 0 }}
          activeDot={{ r: 4, fill: "var(--card)", stroke: "var(--color-prime)", strokeWidth: 2 }} connectNulls={false} isAnimationActive={false} />)}</>
      </LineChart>
    </ChartContainer> : <p className="py-8 text-center text-sm text-muted-foreground">No publications in this month.</p>}
  </Panel>;
}

export function PublicationChanges({ history, prime }: { history: History; prime: DailyPrime }) {
  const rows = publicationChanges(history);
  return <Panel title="Change vs previous day" description="Change in the prime’s accrued revenue since the previous UTC day" hint="Includes revisions to earlier days. A missing previous publication or a new month leaves a gap. Hover to see supply-side and demand-side contributions.">
    {rows.some((r) => r.exact) ? <ChartContainer config={{ prime: { label: "Change in prime revenue", color: `var(--group-${prime})` } }} className="aspect-auto h-52 w-full" aria-label="Changes between consecutive publications">
      <BarChart data={rows} accessibilityLayer margin={{ top: 8, left: 4, right: 12 }}>
        <CartesianGrid vertical={false} /><XAxis dataKey="cutoff" {...xAxis} tickFormatter={dayLabel} />
        <YAxis {...yAxis} width={64} tickFormatter={(v: number) => formatCompactUSD(v)} /><ReferenceLine y={0} stroke="var(--border)" />
        <ChartTooltip cursor={false} content={({ active, payload }) => {
          const row = active ? payload?.[0]?.payload as (typeof rows)[number] | undefined : undefined;
          return row?.exact ? <HoverCard period={dayLabel(row.cutoff)} headline={usd(row.exact.prime)} caption="Change in prime revenue" rows={[
            { key: "supply", color: `var(--group-${prime})`, label: "Supply-side change", value: usd(row.exact.supply) },
            { key: "demand", color: "var(--chart-neutral)", label: "Demand-side change", value: usd(row.exact.demand) },
          ]} /> : null;
        }} />
        <RBar dataKey="prime" fill={`var(--group-${prime})`} isAnimationActive={false} maxBarSize={48} radius={4} />
      </BarChart>
    </ChartContainer> : <p className="py-6 text-sm text-muted-foreground">Two consecutive publications in the same month are needed to show a change.</p>}
  </Panel>;
}
