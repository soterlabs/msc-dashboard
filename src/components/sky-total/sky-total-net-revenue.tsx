"use client";

import * as React from "react";

import type { SkyTotalReport } from "@/lib/sky-total/types";
import { formatCompactUSD, formatUSD, monthShort } from "@/lib/format";
import { cn } from "@/lib/utils";

import { useSkyTotal } from "../data-context";
import { Card, DisplayTitle, KpiCard, SectionTitle, Swatch } from "../dr/primitives";

const num = (v: number | null) => v ?? 0;

/** Signed compact figure for a waterfall delta, e.g. "+$12.3M" / "−$1.4M". */
function signedCompact(v: number) {
  const s = formatCompactUSD(Math.abs(v));
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
    <div className="space-y-7">
      <header>
        <DisplayTitle accent="consolidated protocol net revenue · buffer basis">
          Sky total net revenue
        </DisplayTitle>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiCard
          label="Total Sky Net Revenue"
          value={formatCompactUSD(sum((r) => r.skyNetRevenue))}
          unit="USDS"
          note={`Consolidated, across ${months.length} monthly settlements`}
        />
        <KpiCard
          label="Total MSC net"
          value={formatCompactUSD(sum((r) => r.mscNet))}
          unit="USDS"
          note="Prime-agent perimeter, buffer basis"
        />
        <KpiCard
          label="Total non-MSC net"
          value={formatCompactUSD(sum((r) => r.nonMscNet))}
          unit="USDS"
          note="Protocol P&L outside the MSC perimeter"
        />
      </div>

      <Waterfall reports={ordered} monthLabels={monthLabels} />

      <ReconciliationTable reports={ordered} monthLabels={monthLabels} />

      <p className="font-mono text-[11px] text-faint">
        Source: soter · settlement-reports · sky_total · {months.length} monthly reports · USDS ·
        methodology handoff 2026-07-16 §3 (buffer basis)
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

/** Resolve each step to a [lo, hi] span and the running level it leaves behind. */
function layoutBars(steps: Step[]) {
  let running = 0;
  return steps.map((s) => {
    if (s.kind === "total") {
      running = s.value;
      return { ...s, lo: Math.min(0, s.value), hi: Math.max(0, s.value), leaves: s.value };
    }
    const start = running;
    const end = running + s.value;
    running = end;
    return { ...s, lo: Math.min(start, end), hi: Math.max(start, end), leaves: end };
  });
}

const W = 760;
const H = 360;
const M = { top: 30, right: 16, bottom: 64, left: 58 };
const PLOT_W = W - M.left - M.right;
const PLOT_H = H - M.top - M.bottom;

function Waterfall({
  reports,
  monthLabels,
}: {
  reports: SkyTotalReport[];
  monthLabels: Record<string, string>;
}) {
  const [month, setMonth] = React.useState(reports[reports.length - 1].month);
  const report = reports.find((r) => r.month === month) ?? reports[reports.length - 1];
  const bars = layoutBars(stepsFor(report));

  const top = Math.max(...bars.map((b) => b.hi), 1);
  const niceMax = Math.ceil(top / 5_000_000) * 5_000_000;
  const y = (v: number) => M.top + PLOT_H - (v / niceMax) * PLOT_H;

  const band = PLOT_W / bars.length;
  const barW = Math.min(64, band * 0.6);
  const bandX = (i: number) => M.left + band * i;
  const barX = (i: number) => bandX(i) + (band - barW) / 2;
  const ticks = [0, niceMax / 2, niceMax];

  return (
    <section>
      <SectionTitle
        title="How the month reconciles"
        info="Debt minted to the buffer, less what flows back out to primes, the Demand-side Buffer, the Core Council (genesis portion) and the Grove TGE penalty, gives MSC net; adding non-MSC net gives Sky Net Revenue."
      />

      <Card className="px-4 pt-4 pb-3">
        {/* month selector */}
        <div className="mb-2 flex flex-wrap gap-1">
          {reports.map((r) => (
            <button
              key={r.month}
              type="button"
              onClick={() => setMonth(r.month)}
              className={cn(
                "rounded-md px-2.5 py-1 font-mono text-[11px] transition-colors",
                r.month === month
                  ? "bg-lavender/20 text-ink"
                  : "text-muted hover:bg-paper hover:text-ink",
              )}
            >
              {monthShort(r.month)}
            </button>
          ))}
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label={`Sky net revenue waterfall for ${monthLabels[report.month] ?? report.month}`}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth={1} />
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

          {/* connectors between successive bars */}
          {bars.slice(0, -1).map((b, i) => (
            <line
              key={`c-${b.key}`}
              x1={barX(i) + barW}
              x2={barX(i + 1)}
              y1={y(b.leaves)}
              y2={y(b.leaves)}
              stroke="var(--faint)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          ))}

          {bars.map((b, i) => {
            const isTotal = b.kind === "total";
            return (
              <g key={b.key}>
                <rect
                  x={barX(i)}
                  y={y(b.hi)}
                  width={barW}
                  height={Math.max(y(b.lo) - y(b.hi), 1)}
                  rx={4}
                  fill="var(--lavender)"
                  fillOpacity={isTotal ? 1 : 0.28}
                />
                {/* value label above the bar */}
                <text
                  x={barX(i) + barW / 2}
                  y={y(b.hi) - 7}
                  textAnchor="middle"
                  className={cn("font-mono text-[10px]", isTotal ? "fill-ink font-medium" : "fill-muted")}
                >
                  {isTotal ? formatCompactUSD(b.value) : signedCompact(b.value)}
                </text>
                {/* two-line x label */}
                <text
                  x={bandX(i) + band / 2}
                  y={H - 42}
                  textAnchor="middle"
                  className={cn("font-sans text-[10px]", isTotal ? "fill-ink font-medium" : "fill-muted")}
                >
                  {b.label.split(" ").map((word, k) => (
                    <tspan key={k} x={bandX(i) + band / 2} dy={k === 0 ? 0 : 11}>
                      {word}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}
        </svg>

        {/* legend */}
        <div className="mt-1 flex items-center gap-4 px-2">
          <span className="flex items-center gap-1.5 font-sans text-[11px] text-muted">
            <Swatch color="var(--lavender)" className="rounded-[3px]" />
            Subtotal / headline
          </span>
          <span className="flex items-center gap-1.5 font-sans text-[11px] text-muted">
            <Swatch color="var(--lavender)" className="rounded-[3px] opacity-30" />
            Flow (in / out)
          </span>
        </div>

        {report.notes.length > 0 && (
          <ul className="mt-3 space-y-1 border-t border-line px-2 pt-3">
            {report.notes.map((note, i) => (
              <li key={i} className="font-mono text-[10.5px] leading-relaxed text-faint">
                {note}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
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
function unionKeys(reports: SkyTotalReport[], pick: (r: SkyTotalReport) => { key: string; label: string }[]) {
  const seen = new Map<string, string>();
  for (const r of reports) for (const line of pick(r)) if (!seen.has(line.key)) seen.set(line.key, line.label);
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
  const lineVal = (list: (r: SkyTotalReport) => { key: string; value: number | null }[], key: string) =>
    (r: SkyTotalReport) => list(r).find((x) => x.key === key)?.value ?? null;

  const rows: Row[] = [
    { kind: "group", label: "MSC leg (buffer basis)" },
    ...debtPrimes.map(
      (p): Row => ({ kind: "prime", label: `Debt minted — ${p.label}`, value: lineVal((r) => r.debtMinted, p.key) }),
    ),
    { kind: "subtotal", label: "Debt minted — subtotal", value: (r) => r.debtMintedSubtotal },
    ...subproxyPrimes.map(
      (p): Row => ({ kind: "prime", label: `Subproxy — ${p.label}`, value: lineVal((r) => r.subproxy, p.key) }),
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
    <section>
      <SectionTitle
        title="Monthly reconciliation"
        info="Every line of the settlement report, components down and months across."
      />
      <Card className="overflow-x-auto">
        <table className="w-full border-collapse text-right font-mono text-[12px]">
          <thead>
            <tr className="border-b border-line text-[10.5px] text-muted">
              <th className="px-4 py-3 text-left font-medium uppercase tracking-widest">Component</th>
              {reports.map((r) => (
                <th key={r.month} className="px-4 py-3 font-medium whitespace-nowrap uppercase tracking-widest">
                  {monthLabels[r.month] ?? r.month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) =>
              row.kind === "group" ? (
                <tr key={row.label} className="border-b border-line bg-paper/60">
                  <td
                    colSpan={cols}
                    className="px-4 py-2 text-left font-sans text-[10.5px] font-semibold uppercase tracking-widest text-muted"
                  >
                    {row.label}
                  </td>
                </tr>
              ) : (
                <tr
                  key={row.label}
                  className={cn(
                    "border-b border-line last:border-0",
                    row.kind === "subtotal" && "bg-paper/40",
                    row.kind === "headline" && "bg-paper font-semibold",
                  )}
                >
                  <td
                    className={cn(
                      "px-4 py-2.5 text-left whitespace-nowrap",
                      row.kind === "prime" || row.kind === "detail" ? "pl-6 text-muted" : "text-ink",
                      (row.kind === "subtotal" || row.kind === "headline") && "font-semibold",
                    )}
                  >
                    {row.label}
                  </td>
                  {reports.map((r) => {
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
              ),
            )}
          </tbody>
        </table>
      </Card>
    </section>
  );
}
