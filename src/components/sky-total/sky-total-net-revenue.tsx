"use client";

import * as React from "react";

import type { SkyTotalReport } from "@/lib/sky-total/types";
import { formatCompactUSD, formatUSD, monthShort } from "@/lib/format";
import { cn } from "@/lib/utils";

import { useSkyTotal } from "../data-context";
import { Card, DisplayTitle, KpiCard, SectionTitle } from "../dr/primitives";

type StatementRow = {
  label: string;
  value: (r: SkyTotalReport) => number | null;
  kind?: "prime" | "subtotal" | "less" | "headline";
};

export function SkyTotalNetRevenue() {
  const { months, monthLabels, reports } = useSkyTotal();

  // Chronological; the last month is the headline everything else contextualises.
  const ordered = React.useMemo(
    () => [...reports].sort((a, b) => a.month.localeCompare(b.month)),
    [reports],
  );
  const latest = ordered[ordered.length - 1];

  const sum = (pick: (r: SkyTotalReport) => number | null) =>
    ordered.reduce((t, r) => t + (pick(r) ?? 0), 0);
  const totalNet = sum((r) => r.skyTotalNetRevenue);
  const totalGross = sum((r) => r.sumPrimeSkyRevenue);
  const totalNonMsc = sum((r) => r.nonMscNetRevenue);

  const primeRows: StatementRow[] = latest.primeRevenue.map((p) => ({
    label: p.label,
    kind: "prime",
    value: (r) => r.primeRevenue.find((x) => x.key === p.key)?.value ?? null,
  }));

  const rows: StatementRow[] = [
    ...primeRows,
    { label: "Σ prime sky revenue", kind: "subtotal", value: (r) => r.sumPrimeSkyRevenue },
    { label: "less: prime demand-side payments", kind: "less", value: (r) => r.demandSidePayments },
    { label: "non-MSC net revenue", kind: "less", value: (r) => r.nonMscNetRevenue },
    { label: "Sky total net revenue", kind: "headline", value: (r) => r.skyTotalNetRevenue },
  ];

  return (
    <div className="space-y-7">
      {/* page header */}
      <header>
        <DisplayTitle accent="consolidated protocol net revenue">
          Sky total net revenue
        </DisplayTitle>
      </header>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiCard
          label="Total Sky net revenue"
          value={formatCompactUSD(totalNet)}
          unit="USDS"
          note={`Across ${months.length} monthly reports`}
        />
        <KpiCard
          label="Total prime sky revenue"
          value={formatCompactUSD(totalGross)}
          unit="USDS"
          note="Gross supply-side revenue from the prime agents (MSC)"
        />
        <KpiCard
          label="Total non-MSC net revenue"
          value={formatCompactUSD(totalNonMsc)}
          unit="USDS"
          note="Protocol P&L outside the prime-agent perimeter"
        />
      </div>

      {/* chart: gross prime revenue (ghost) vs net (solid) per month */}
      <section>
        <SectionTitle
          title="Net revenue by month"
          info="Each column's full height is Σ prime supply-side sky revenue (gross); the solid fill is what remains as Sky total net revenue after demand-side payments and non-MSC P&L."
        />
        <NetRevenueChart reports={ordered} />
      </section>

      {/* statement: components down, months across */}
      <section>
        <SectionTitle
          title="Monthly reconciliation"
          info="Sky total net revenue = Σ prime supply-side sky revenue − prime demand-side payments + non-MSC net revenue."
        />
        <Card className="overflow-x-auto">
          <table className="w-full border-collapse text-right font-mono text-[12px]">
            <thead>
              <tr className="border-b border-line text-[10.5px] text-muted">
                <th className="px-4 py-3 text-left font-medium uppercase tracking-widest">
                  Component
                </th>
                {ordered.map((r) => (
                  <th
                    key={r.month}
                    className="px-4 py-3 font-medium whitespace-nowrap uppercase tracking-widest"
                  >
                    {monthLabels[r.month] ?? r.month}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.label}
                  className={cn(
                    "border-b border-line last:border-0",
                    row.kind === "subtotal" && "bg-paper/60",
                    row.kind === "headline" && "bg-paper font-semibold",
                  )}
                >
                  <td
                    className={cn(
                      "px-4 py-2.5 text-left whitespace-nowrap",
                      row.kind === "prime" ? "pl-6 text-muted" : "text-ink",
                      (row.kind === "subtotal" || row.kind === "headline") && "font-semibold",
                    )}
                  >
                    {row.label}
                  </td>
                  {ordered.map((r) => {
                    const v = row.value(r);
                    return (
                      <td
                        key={r.month}
                        className={cn(
                          "px-4 py-2.5 whitespace-nowrap tabular-nums",
                          row.kind === "headline"
                            ? "text-lavender"
                            : row.kind === "less"
                              ? "text-muted"
                              : "text-ink",
                        )}
                      >
                        {v === null ? <span className="text-faint">—</span> : formatUSD(v)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      <p className="font-mono text-[11px] text-faint">
        Source: soter · settlement-reports · sky_total · {months.length} monthly reports · USDS
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ chart */

const W = 760;
const H = 300;
const M = { top: 22, right: 16, bottom: 34, left: 60 };
const PLOT_W = W - M.left - M.right;
const PLOT_H = H - M.top - M.bottom;

function NetRevenueChart({ reports }: { reports: SkyTotalReport[] }) {
  const [hover, setHover] = React.useState<number | null>(null);

  const grossMax = Math.max(...reports.map((r) => r.sumPrimeSkyRevenue ?? 0), 1);
  const niceMax = Math.ceil(grossMax / 5_000_000) * 5_000_000;
  const y = (v: number) => M.top + PLOT_H - (v / niceMax) * PLOT_H;
  const baseline = M.top + PLOT_H;

  const band = PLOT_W / reports.length;
  const barW = Math.min(56, band * 0.5);
  const bandX = (i: number) => M.left + band * i;
  const barX = (i: number) => bandX(i) + (band - barW) / 2;

  const ticks = [0, niceMax / 2, niceMax];
  const active = hover ?? reports.length - 1;

  return (
    <Card className="px-4 pt-5 pb-3">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Sky total net revenue by month, against gross prime sky revenue"
      >
        {/* gridlines + y labels */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={M.left}
              x2={W - M.right}
              y1={y(t)}
              y2={y(t)}
              stroke="var(--line)"
              strokeWidth={1}
            />
            <text
              x={M.left - 8}
              y={y(t)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-faint font-mono text-[10px]"
            >
              {formatCompactUSD(t)}
            </text>
          </g>
        ))}

        {reports.map((r, i) => {
          const gross = r.sumPrimeSkyRevenue ?? 0;
          const net = r.skyTotalNetRevenue ?? 0;
          const isActive = active === i;
          return (
            <g key={r.month}>
              <rect
                x={barX(i)}
                y={y(gross)}
                width={barW}
                height={baseline - y(gross)}
                rx={4}
                fill="var(--lavender)"
                fillOpacity={isActive ? 0.28 : 0.16}
              />
              {/* solid = net */}
              <rect
                x={barX(i)}
                y={y(Math.max(net, 0))}
                width={barW}
                height={baseline - y(Math.max(net, 0))}
                rx={4}
                fill="var(--lavender)"
              />
              {/* net value label — above the solid bar it belongs to */}
              <text
                x={barX(i) + barW / 2}
                y={y(Math.max(net, 0)) - 7}
                textAnchor="middle"
                className={cn(
                  "font-mono text-[10px]",
                  isActive ? "fill-ink font-medium" : "fill-muted",
                )}
              >
                {formatCompactUSD(net)}
              </text>
              {/* month label */}
              <text
                x={bandX(i) + band / 2}
                y={H - 12}
                textAnchor="middle"
                className={cn(
                  "font-sans text-[11px]",
                  isActive ? "fill-ink font-medium" : "fill-muted",
                )}
              >
                {monthShort(r.month)}
              </text>
              {/* hover hit target */}
              <rect
                x={bandX(i)}
                y={M.top}
                width={band}
                height={PLOT_H}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
            </g>
          );
        })}
      </svg>

      {/* legend */}
      <div className="mt-1 flex items-center gap-4 px-2">
        <LegendSwatch opacity={1} label="Sky total net revenue" />
        <LegendSwatch opacity={0.16} label="Prime sky revenue (gross)" />
      </div>
    </Card>
  );
}

function LegendSwatch({ opacity, label }: { opacity: number; label: string }) {
  return (
    <span className="flex items-center gap-1.5 font-sans text-[11px] text-muted">
      <span
        className="inline-block size-3 rounded-[3px]"
        style={{ background: "var(--lavender)", opacity }}
      />
      {label}
    </span>
  );
}
