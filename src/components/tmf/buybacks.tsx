"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRightIcon, CaretDownIcon } from "@phosphor-icons/react";

import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Bar as RBar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import {
  formatCompactTokens,
  formatPrice6,
  formatTokens,
  formatUtc,
  shortAddress,
} from "@/lib/format";
import { explorerUrl, txUrl } from "@/lib/links";
import { paths } from "@/lib/routes";
import {
  TMF_GRANULARITIES,
  type TmfGranularity,
  type TmfParameterChange,
  type TmfPeriod,
} from "@/lib/tmf/types";
import { cn } from "@/lib/utils";

import { useTmf } from "../data-context";
import {
  ActionButton,
  DataTable,
  Dash,
  FilterGroup,
  FilterItem,
  PageHeader,
  Panel,
  Prose,
  SeriesFilterItem,
  StatCard,
  TableBody,
  TableHeader,
  TableRow,
  Td,
  Th,
} from "../kit";

/**
 * The labels this view uses for the four legs, chosen to say what each one is
 * rather than repeat the field name: the Splitter pulls USDS from the surplus,
 * sends part of it to buy SKY and part back to stakers, and SKY is burned
 * separately — so "buyback", "dividends" and "burned" are three different
 * things a reader can otherwise conflate.
 */
const LABELS = {
  usds_buyback: "Sky buyback (USDS)",
  usds_to_stakers: "USDS returned to stakers",
  usds_total: "Buyback + dividends",
  sky_bought: "SKY bought",
  sky_avg_price: "Avg price (USDS/SKY)",
  sky_burn_protocol: "SKY burned (protocol)",
};

const GRANULARITY_LABEL: Record<TmfGranularity, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Annual",
};

const chartConfig = {
  usds_buyback: { label: LABELS.usds_buyback, color: "var(--chart-4)" },
  usds_to_stakers: { label: LABELS.usds_to_stakers, color: "var(--chart-2)" },
  sky_burn_protocol: { label: LABELS.sky_burn_protocol, color: "var(--destructive)" },
} satisfies ChartConfig;

export function Buybacks({ granularity }: { granularity: TmfGranularity }) {
  const tmf = useTmf();
  const router = useRouter();
  const { totals, latest_kick: latest, source, notes, definitions } = tmf;

  // Newest first: the question a reader arrives with is what happened lately,
  // and the chart below reads the other way because time runs left to right.
  const rows = React.useMemo(
    () => [...tmf.periods[granularity]].sort((a, b) => (a.period < b.period ? 1 : -1)),
    [tmf, granularity],
  );
  const series = React.useMemo(() => [...rows].reverse(), [rows]);

  // Off by default: the burn series is zero in every period but one, so a line
  // flat on the axis would only invite the reading that nothing is happening.
  const [showBurn, setShowBurn] = React.useState(false);
  const anyBurn = series.some((r) => r.sky_burn_protocol > 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Buybacks & burn"
        description="Smart Burn Engine"
        meta={[
          { label: "kicks", value: formatTokens(totals.kicks) },
          { label: "granularity", value: GRANULARITY_LABEL[granularity].toLowerCase() },
          { label: "chain", value: source.chain },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 @2xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <StatCard
          label={LABELS.usds_total}
          value={formatCompactTokens(totals.usds_total)}
          unit="USDS"
          note="Pulled from the surplus since the Splitter went live"
        />
        <StatCard
          label={LABELS.usds_buyback}
          value={formatCompactTokens(totals.usds_buyback)}
          unit="USDS"
          note={`Bought ${formatCompactTokens(totals.sky_bought)} SKY at ${formatPrice6(totals.sky_avg_price)} average`}
        />
        <StatCard
          label={LABELS.usds_to_stakers}
          value={formatCompactTokens(totals.usds_to_stakers)}
          unit="USDS"
          note="The dividend leg — sent to the USDS staker farm"
        />
        <StatCard
          label={LABELS.sky_burn_protocol}
          value={formatCompactTokens(totals.sky_burn_protocol)}
          unit="SKY"
          /* The "other" series is third parties sending SKY to 0x…dEaD. It is
             not a protocol act and never a headline, but hiding it entirely
             would leave the on-chain burn address unexplained. */
          note={
            totals.sky_burn_other > 0
              ? /* Exact, not whole units: this figure is single digits, and
                   rounding 4.82 to "5" would overstate a rounding error as a
                   burn. The headline SKY figures are whole units as specified. */
                `Plus ${totals.sky_burn_other.toFixed(2)} SKY sent to 0x…dEaD by third parties`
              : "SKY sent to a burn sink by the Pause Proxy"
          }
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Data through {formatUtc(source.to_ts)} · block{" "}
        {formatTokens(source.to_block)}
      </p>

      <Panel
        title="Buyback and dividends"
        hint={`${definitions.usds_total ?? ""} The stack is the USDS pulled from the surplus; the split is how much bought SKY and how much went back to stakers.`}
        description={`${GRANULARITY_LABEL[granularity]} · USDS`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <FilterGroup
              value={[granularity]}
              onValueChange={(v) => v[0] && router.push(paths.buybacks(v[0]))}
              aria-label="Granularity"
            >
              {TMF_GRANULARITIES.map((g) => (
                <FilterItem key={g} value={g}>
                  {GRANULARITY_LABEL[g]}
                </FilterItem>
              ))}
            </FilterGroup>
            {anyBurn && (
              <FilterGroup
                value={showBurn ? ["burn"] : []}
                onValueChange={(v) => setShowBurn(v.includes("burn"))}
                aria-label="Show SKY burned"
              >
                <SeriesFilterItem
                  value="burn"
                  style={{ "--series": "var(--destructive)" } as React.CSSProperties}
                >
                  SKY burned
                </SeriesFilterItem>
              </FilterGroup>
            )}
          </div>
        }
      >
        <div className="scroll-thin -mx-1 overflow-x-auto px-1">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-72 w-full min-w-[34rem] @3xl/main:h-80"
          >
            <ComposedChart data={series} margin={{ top: 16, left: 4, right: 4 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="period"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
                interval="preserveStartEnd"
              />
              <YAxis
                yAxisId="usds"
                tickLine={false}
                axisLine={false}
                width={52}
                fontSize={12}
                tickFormatter={(v: number) => formatCompactTokens(v)}
              />
              {showBurn && (
                <YAxis
                  yAxisId="sky"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  fontSize={12}
                  tickFormatter={(v: number) => formatCompactTokens(v)}
                />
              )}
              <ChartTooltip cursor={false} content={<PeriodTooltip />} />
              <RBar
                yAxisId="usds"
                dataKey="usds_buyback"
                stackId="usds"
                fill="var(--color-usds_buyback)"
                radius={[0, 0, 4, 4]}
                maxBarSize={48}
              />
              <RBar
                yAxisId="usds"
                dataKey="usds_to_stakers"
                stackId="usds"
                fill="var(--color-usds_to_stakers)"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
              {showBurn && (
                <Line
                  yAxisId="sky"
                  type="monotone"
                  dataKey="sky_burn_protocol"
                  stroke="var(--color-sky_burn_protocol)"
                  strokeWidth={2}
                  dot={false}
                />
              )}
            </ComposedChart>
          </ChartContainer>
        </div>
      </Panel>

      <PeriodTable rows={rows} granularity={granularity} />

      <LatestKick kick={latest} chain={source.chain} />

      <ParameterHistory changes={tmf.parameter_changes} chain={source.chain} />

      {notes.length > 0 && (
        <Panel title="Notes" hint="Published with the dataset; shown as written.">
          <Prose>
            <ul className="grid gap-2">
              {notes.map((note, i) => (
                <li key={i} className="text-[12.5px] leading-relaxed">
                  {note}
                </li>
              ))}
            </ul>
          </Prose>
        </Panel>
      )}

      <p className="text-xs text-muted-foreground">
        Source: soter · settlement-reports · reports/tmf/data/sbe_history.json ·
        schema {tmf.schema_version} · generated {formatUtc(tmf.generated_at)}
      </p>
    </div>
  );
}

/** Every figure behind a bar, since the stack only shows two of them. */
function PeriodTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: TmfPeriod }[];
}) {
  const row = active ? payload?.[0]?.payload : undefined;
  if (!row) return null;
  const lines: [string, string][] = [
    [LABELS.usds_buyback, formatTokens(row.usds_buyback)],
    [LABELS.usds_to_stakers, formatTokens(row.usds_to_stakers)],
    [LABELS.usds_total, formatTokens(row.usds_total)],
    ["Kicks", formatTokens(row.kicks)],
    [LABELS.sky_bought, formatTokens(row.sky_bought)],
    [LABELS.sky_avg_price, formatPrice6(row.sky_avg_price)],
  ];
  if (row.sky_burn_protocol > 0) {
    lines.push([LABELS.sky_burn_protocol, formatTokens(row.sky_burn_protocol)]);
  }
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="mb-1.5 font-medium">{row.period}</p>
      <dl className="grid gap-1">
        {lines.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function PeriodTable({
  rows,
  granularity,
}: {
  rows: TmfPeriod[];
  granularity: TmfGranularity;
}) {
  return (
    <Panel
      title="By period"
      hint="Newest first. A period appears only if it holds a kick or a burn."
      description={`${rows.length} ${GRANULARITY_LABEL[granularity].toLowerCase()} periods`}
      flush
    >
      <DataTable>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <Th>Period</Th>
            <Th numeric>Kicks</Th>
            <Th numeric>{LABELS.usds_buyback}</Th>
            <Th numeric>{LABELS.usds_to_stakers}</Th>
            <Th numeric>{LABELS.usds_total}</Th>
            <Th numeric>{LABELS.sky_bought}</Th>
            <Th numeric>{LABELS.sky_avg_price}</Th>
            <Th numeric>{LABELS.sky_burn_protocol}</Th>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.period}>
              <Td className="font-mono text-xs">{r.period}</Td>
              {/* A period with burns but no kicks has nothing to count, price
                  or time — a dash, because 0 would read as a figure. */}
              <Td numeric>{r.kicks === 0 ? <Dash /> : formatTokens(r.kicks)}</Td>
              <Td numeric>{formatTokens(r.usds_buyback)}</Td>
              <Td numeric className={cn(r.usds_to_stakers === 0 && "text-muted-foreground")}>
                {r.usds_to_stakers === 0 ? <Dash /> : formatTokens(r.usds_to_stakers)}
              </Td>
              <Td numeric className="font-medium">
                {formatTokens(r.usds_total)}
              </Td>
              <Td numeric>{formatTokens(r.sky_bought)}</Td>
              <Td numeric>{formatPrice6(r.sky_avg_price)}</Td>
              <Td numeric className={cn(r.sky_burn_protocol === 0 && "text-muted-foreground")}>
                {r.sky_burn_protocol === 0 ? <Dash /> : formatTokens(r.sky_burn_protocol)}
              </Td>
            </TableRow>
          ))}
        </TableBody>
      </DataTable>
    </Panel>
  );
}

function LatestKick({
  kick,
  chain,
}: {
  kick: import("@/lib/tmf/types").TmfLatestKick;
  chain: string;
}) {
  const url = txUrl(chain, kick.tx);
  return (
    <Panel
      title="Latest kick"
      hint="The most recent Splitter kick, and the levers in force when it ran."
      description={formatUtc(kick.ts)}
      action={
        url ? (
          <ActionButton render={<a href={url} target="_blank" rel="noreferrer" />}>
            Transaction
            <ArrowUpRightIcon className="size-3.5" />
          </ActionButton>
        ) : undefined
      }
    >
      <div className="grid grid-cols-2 gap-4 @3xl/main:grid-cols-3 @5xl/main:grid-cols-6">
        <Figure label={LABELS.usds_buyback} value={formatTokens(kick.usds_buyback)} />
        <Figure label={LABELS.usds_to_stakers} value={formatTokens(kick.usds_to_stakers)} />
        <Figure label={LABELS.usds_total} value={formatTokens(kick.usds_total)} />
        <Figure label={LABELS.sky_bought} value={formatTokens(kick.sky_bought)} />
        {/* burn is the share of the surplus routed to the buyback, hop the
            seconds between kicks — the two levers that set the pace. */}
        <Figure
          label="Splitter burn"
          value={`${(kick.splitter_burn * 100).toFixed(0)}%`}
        />
        <Figure label="Hop" value={`${formatTokens(kick.splitter_hop)}s`} />
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Block {formatTokens(kick.block)}
      </p>
    </Panel>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium tabular-nums">{value}</p>
    </div>
  );
}

/**
 * Collapsed by default: 31 rows of governance filings are context for the
 * series above, not the reason anyone opened the page.
 */
function ParameterHistory({
  changes,
  chain,
}: {
  changes: TmfParameterChange[];
  chain: string;
}) {
  const [open, setOpen] = React.useState(false);
  const rows = React.useMemo(
    () => [...changes].sort((a, b) => (a.ts < b.ts ? 1 : -1)),
    [changes],
  );

  return (
    <Panel
      title="Parameter history"
      hint="Every File event on the Splitter, Kicker and Flapper — the changes that set the pace and the split."
      description={`${rows.length} changes`}
      action={
        <ActionButton onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? "Hide" : "Show"}
          <CaretDownIcon className={cn("size-3.5 transition-transform", open && "rotate-180")} />
        </ActionButton>
      }
      flush={open}
    >
      {open && (
        <DataTable>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <Th>When</Th>
              <Th>Contract</Th>
              <Th>Parameter</Th>
              <Th>Value</Th>
              <Th>Tx</Th>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((c, i) => {
              const tx = txUrl(chain, c.tx);
              // `value` is an address for a pointer re-filing (farm, flapper,
              // pip) and exact decimal digits otherwise.
              const isAddress = /^0x[0-9a-fA-F]{40}$/.test(c.value);
              const valueUrl = isAddress ? explorerUrl(chain, c.value) : null;
              return (
                <TableRow key={`${c.tx}-${c.what}-${i}`}>
                  <Td className="whitespace-nowrap">{formatUtc(c.ts)}</Td>
                  <Td>
                    <span className="font-mono text-xs">{c.contract}</span>{" "}
                    {/* The legacy and live Flapper share the MCD_FLAP role, so
                        the role alone does not say which one filed this. */}
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {shortAddress(c.address)}
                    </span>
                  </Td>
                  <Td className="font-mono text-xs">{c.what}</Td>
                  <Td className="font-mono text-xs">
                    {valueUrl ? (
                      <a
                        href={valueUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline decoration-dotted underline-offset-2"
                      >
                        {shortAddress(c.value)}
                      </a>
                    ) : (
                      c.value
                    )}
                  </Td>
                  <Td>
                    {tx ? (
                      <a
                        href={tx}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-xs underline decoration-dotted underline-offset-2"
                      >
                        {shortAddress(c.tx)}
                      </a>
                    ) : (
                      <Dash />
                    )}
                  </Td>
                </TableRow>
              );
            })}
          </TableBody>
        </DataTable>
      )}
      {!open && (
        <p className="text-[12.5px] leading-relaxed text-muted-foreground">
          Filings to <code className="font-mono text-xs">hop</code>,{" "}
          <code className="font-mono text-xs">burn</code>,{" "}
          <code className="font-mono text-xs">farm</code>,{" "}
          <code className="font-mono text-xs">flapper</code>,{" "}
          <code className="font-mono text-xs">want</code>,{" "}
          <code className="font-mono text-xs">pip</code>,{" "}
          <code className="font-mono text-xs">kbump</code> and{" "}
          <code className="font-mono text-xs">khump</code> since the Splitter
          was deployed.
        </p>
      )}
    </Panel>
  );
}
