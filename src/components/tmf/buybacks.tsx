"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRightIcon, CaretDownIcon, WarningIcon } from "@phosphor-icons/react";

import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Bar as RBar,
  CartesianGrid,
  ComposedChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  formatCompactTokens,
  formatPrice6,
  formatTokens,
  formatAge,
  formatUtc,
  shortAddress,
} from "@/lib/format";
import { explorerUrl, txUrl } from "@/lib/links";
import { paths } from "@/lib/routes";
import { fillGaps } from "@/lib/tmf/domain";
import { Badge } from "@/components/ui/badge";
import {
  TMF_DAILY_WINDOW_DAYS,
  TMF_GRANULARITIES,
  type TmfDocumentGranularity,
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
  LegendItem,
  PageHeader,
  Panel,
  Prose,
  StatCard,
  Swatch,
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

/**
 * Where the figures came from and how current they are.
 *
 * The tab is the only one reading a live source, so it is the only one that
 * can be quietly serving something stale: an API outage falls back to the
 * committed snapshot, and a snapshot renders exactly like fresh data. Saying
 * which is on screen is the whole point of carrying the discriminator this
 * far.
 */
/**
 * How current the figures are, in one line.
 *
 * `source.to_ts` is the timestamp that describes the data: the extractor stops
 * at the latest finalized block, so it trails the clock by roughly 100 minutes
 * and the block beside it is exactly what the totals cover. The producing run's
 * own timestamp used to sit here too — two instants a couple of hours apart,
 * which read as a contradiction rather than as the two facts they are.
 *
 * The fallback badge stays: a snapshot renders identically to live data, and
 * that is the one difference a reader cannot otherwise see.
 */
function Provenance({
  toTs,
  toBlock,
  tier,
  now,
}: {
  toTs: string;
  toBlock: number;
  tier: "api" | "snapshot";
  now: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
      <span>
        Data through {formatUtc(toTs)}{" "}
        <span className="text-muted-foreground/70">({formatAge(toTs, new Date(now))})</span>{" "}
        · block {formatTokens(toBlock)}
      </span>
      {tier === "snapshot" ? (
        <Badge variant="outline" className="gap-1.5 border-destructive/40 text-destructive">
          <WarningIcon aria-hidden className="size-3" />
          Totals from the last published snapshot — live history unavailable
        </Badge>
      ) : null}
    </div>
  );
}

/**
 * The sink third parties send SKY to. Not published in the dataset — it names
 * it as "0x…dEaD" in prose — so it is taken from the `sink` column of
 * `sky_burns.csv` beside it, where every non-protocol burn lands. The protocol
 * burn used the zero address instead, via `SKY.burn()`.
 */
const DEAD_ADDRESS = "0x000000000000000000000000000000000000dEaD";

const GRANULARITY_LABEL: Record<TmfGranularity, string> = {
  daily: "Daily",
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Annual",
};

const chartConfig = {
  usds_buyback: { label: LABELS.usds_buyback, color: "var(--chart-4)" },
  usds_to_stakers: { label: LABELS.usds_to_stakers, color: "var(--chart-2)" },
  sky_burn_protocol: { label: LABELS.sky_burn_protocol, color: "var(--destructive)" },
} satisfies ChartConfig;

export function Buybacks({
  granularity,
  source,
  fetchedAt,
  daily,
  last24h,
}: {
  granularity: TmfGranularity;
  /** Which tier the figures came from; see src/lib/load.ts. */
  source: "api" | "snapshot";
  /** When this render read the data — the clock the ages below are against. */
  fetchedAt: string;
  /** Aggregated from the per-kick endpoint; empty when it was unreachable. */
  daily: TmfPeriod[];
  last24h: TmfPeriod | null;
}) {
  const tmf = useTmf();
  const router = useRouter();
  const { totals, latest_kick: latest, source: sourceMeta, notes, definitions } = tmf;

  // Newest first: the question a reader arrives with is what happened lately,
  // and the chart below reads the other way because time runs left to right.
  // Gap-filled before anything is drawn: upstream publishes a period only when
  // something happened in it, so the raw series jumps from Nov 2024 to Feb 2025
  // and a bar chart draws those adjacent — reading as "consecutive months"
  // rather than "the engine was idle for two".
  const series = React.useMemo(() => {
    const raw = granularity === "daily" ? daily : tmf.periods[granularity];
    return fillGaps(raw, granularity);
  }, [tmf, granularity, daily]);
  const rows = React.useMemo(() => [...series].reverse(), [series]);

  /* Burns come from the history document, which has no sub-monthly rows — a
     daily series built from kick events carries none by construction. Driving
     the burn panel off the selected granularity therefore made it vanish on
     Daily, which reads as "no SKY has been burned" rather than "not available
     at this granularity". It falls back to the monthly series instead. */
  const burnGranularity: TmfGranularity = granularity === "daily" ? "monthly" : granularity;
  const burnSeries = React.useMemo(
    () => fillGaps(tmf.periods[burnGranularity as TmfDocumentGranularity], burnGranularity),
    [tmf, burnGranularity],
  );
  const anyBurn = burnSeries.some((r) => r.sky_burn_protocol > 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Buybacks & burn"
        description="Smart Burn Engine"
        meta={[
          { label: "kicks", value: formatTokens(totals.kicks) },
          { label: "granularity", value: GRANULARITY_LABEL[granularity].toLowerCase() },
          { label: "chain", value: sourceMeta.chain },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 @3xl/main:grid-cols-3">
        {/* One card, not three: the two USDS legs are components of the total,
            and side by side they read as three independent figures. */}
        <StatCard
          label={LABELS.usds_total}
          value={formatCompactTokens(totals.usds_total)}
          unit="USDS"
          note="Pulled from the surplus since the Splitter went live"
          rows={[
            {
              label: LABELS.usds_buyback,
              value: formatCompactTokens(totals.usds_buyback),
              unit: "USDS",
              color: "var(--chart-4)",
            },
            {
              label: LABELS.usds_to_stakers,
              value: formatCompactTokens(totals.usds_to_stakers),
              unit: "USDS",
              color: "var(--chart-2)",
            },
          ]}
        />
        <StatCard
          label="Total SKY buyback"
          value={formatCompactTokens(totals.sky_bought)}
          unit="SKY"
          note="Bought on the open market by the Smart Burn Engine"
          rows={[
            {
              label: "Average buyback price",
              /* Three decimals on the headline card, as in the design. The
                 table and the tooltip keep six, where the point is comparing
                 one period's price against another's. */
              value: totals.sky_avg_price?.toFixed(3) ?? "—",
              unit: "USDS / SKY",
            },
          ]}
        />
        {/* Aggregated from the per-kick endpoint, so it is the one card that
            can be missing — the document itself has no sub-monthly figures. */}
        {last24h ? (
          <StatCard
            label={`${LABELS.usds_total} · last 24 hours`}
            value={formatCompactTokens(last24h.usds_total)}
            unit="USDS"
            note="Pulled from the surplus in the last 24 hours"
            rows={[
              {
                label: LABELS.usds_buyback,
                value: formatCompactTokens(last24h.usds_buyback),
                unit: "USDS",
                color: "var(--chart-4)",
              },
              {
                label: LABELS.usds_to_stakers,
                value: formatCompactTokens(last24h.usds_to_stakers),
                unit: "USDS",
                color: "var(--chart-2)",
              },
            ]}
          />
        ) : (
          <StatCard
            label={`${LABELS.usds_total} · last 24 hours`}
            value="—"
            note="Per-kick data unavailable — the totals above are unaffected"
          />
        )}
      </div>

      <Provenance
        toTs={sourceMeta.to_ts}
        toBlock={sourceMeta.to_block}
        tier={source}
        now={fetchedAt}
      />

      <Panel
        title="Buyback and dividends"
        hint={`${definitions.usds_total ?? ""} The stack is the USDS pulled from the surplus; the split is how much bought SKY and how much went back to stakers.`}
        description={
          granularity === "daily"
            ? `Daily · last ${TMF_DAILY_WINDOW_DAYS} days · USDS`
            : `${GRANULARITY_LABEL[granularity]} · USDS`
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            <FilterGroup
              value={[granularity]}
              onValueChange={(v) => v[0] && router.push(paths.buybacks(v[0]))}
              aria-label="Granularity"
            >
              {/* Daily is aggregated from the per-kick endpoint, so it is
                  offered only when that call succeeded — an empty chart behind
                  a chip is worse than no chip. */}
              {TMF_GRANULARITIES.filter((g) => g !== "daily" || daily.length > 0).map((g) => (
                <FilterItem key={g} value={g}>
                  {GRANULARITY_LABEL[g]}
                </FilterItem>
              ))}
            </FilterGroup>
          </div>
        }
      >
        {/* The stack is two series of the same unit, so nothing on the bar says
            which half is which. The hover card repeats these swatches against
            the figures. */}
        <div className="mb-4 flex flex-wrap gap-4">
          <LegendItem color="var(--chart-4)">{LABELS.usds_buyback}</LegendItem>
          <LegendItem color="var(--chart-2)">{LABELS.usds_to_stakers}</LegendItem>
        </div>

        {/* Reachable by URL even when the per-kick endpoint is down, since the
            route is valid and only its data is missing. An empty plot would
            read as "nothing was bought". */}
        {series.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {granularity === "daily"
              ? "Daily figures are aggregated from the per-kick endpoint, which could not be reached. The other periods above are unaffected."
              : `No ${GRANULARITY_LABEL[granularity].toLowerCase()} periods in this dataset.`}
          </p>
        ) : (
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
            </ComposedChart>
          </ChartContainer>
        </div>
        )}
      </Panel>

      {anyBurn && (
        <BurnChart
          series={burnSeries}
          granularity={burnGranularity}
          chain={sourceMeta.chain}
          note={
            granularity === "daily"
              ? "Burns are published monthly at the finest — the daily view above has none to show."
              : undefined
          }
        />
      )}

      <PeriodTable rows={rows} granularity={granularity} />

      <LatestKick kick={latest} chain={sourceMeta.chain} />

      <ParameterHistory changes={tmf.parameter_changes} chain={sourceMeta.chain} />

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

/**
 * The burn sink, linked. Shown abbreviated because the full 40 characters would
 * swamp the sentence, with the whole address on the link and in its title so it
 * can be read and copied without leaving the page.
 */
function BurnSinkLink({ chain }: { chain: string }) {
  const url = explorerUrl(chain, DEAD_ADDRESS);
  if (!url) return <span className="font-mono text-xs">0x…dEaD</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      title={DEAD_ADDRESS}
      className="font-mono text-xs underline decoration-dotted underline-offset-2 hover:text-foreground"
    >
      0x…dEaD
    </a>
  );
}

/**
 * Every figure behind a bar, since the stack only shows two of them — and the
 * legend, because this card is where a reader looks when they want to know
 * which colour is which. A row carries a swatch only if that series is drawn:
 * the derived figures (total, kicks, price) have no colour on the chart, and
 * giving them one would invent a series that is not there.
 */
function PeriodTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: TmfPeriod }[];
}) {
  const row = active ? payload?.[0]?.payload : undefined;
  if (!row) return null;

  /* The total leads, at size: it is the figure the bar's height actually
     encodes, and it was previously the third of six rows in the same weight as
     the rest. The two legs sit under it with their swatches, and the SKY
     figures are demoted to a footer — they answer a different question, in a
     different unit, and were competing with the headline. */
  return (
    <div className="min-w-[15rem] rounded-lg border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground">{row.period}</p>
      <p className="mt-0.5 text-base font-semibold tabular-nums">
        {formatTokens(row.usds_total)}
        <span className="ml-1 text-xs font-normal text-muted-foreground">USDS</span>
      </p>
      <p className="text-[11px] text-muted-foreground">{LABELS.usds_total}</p>

      <dl className="mt-2 grid gap-1 border-t pt-2">
        <TooltipRow
          color="var(--chart-4)"
          label={LABELS.usds_buyback}
          value={formatTokens(row.usds_buyback)}
        />
        <TooltipRow
          color="var(--chart-2)"
          label={LABELS.usds_to_stakers}
          value={formatTokens(row.usds_to_stakers)}
        />
        {row.sky_burn_protocol > 0 && (
          <TooltipRow
            color="var(--destructive)"
            label={LABELS.sky_burn_protocol}
            value={`${formatTokens(row.sky_burn_protocol)} SKY`}
          />
        )}
      </dl>

      <dl className="mt-2 grid gap-1 border-t pt-2 text-[11px] text-muted-foreground">
        <TooltipRow
          muted
          label={LABELS.sky_bought}
          value={`${formatTokens(row.sky_bought)} SKY`}
        />
        <TooltipRow muted label={LABELS.sky_avg_price} value={formatPrice6(row.sky_avg_price)} />
      </dl>
    </div>
  );
}

function TooltipRow({
  color,
  label,
  value,
  muted,
}: {
  color?: string;
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="flex items-center gap-1.5 text-muted-foreground">
        {color ? <Swatch color={color} /> : null}
        {label}
      </dt>
      <dd className={cn("tabular-nums", muted ? "font-normal" : "font-medium text-foreground")}>
        {value}
      </dd>
    </div>
  );
}

/**
 * SKY burned, on its own axes.
 *
 * It was a second line on the USDS chart, which put two units on one plot and
 * asked the reader to notice that the right-hand axis counted SKY — a chart
 * where 426M and 2.5M are the same unit until you look twice. Nothing is
 * comparable across the two, so they are two charts.
 */
function BurnChart({
  series,
  granularity,
  chain,
  note,
}: {
  series: TmfPeriod[];
  granularity: TmfGranularity;
  chain: string;
  /** Why this panel is on a different granularity than the one selected. */
  note?: string;
}) {
  const anyOther = series.some((r) => r.sky_burn_other > 0);
  return (
    <Panel
      title="SKY burned"
      hint="SKY sent to a burn sink by the Pause Proxy — the true burn. Third-party sends are counted separately and are not a protocol act."
      description={`${GRANULARITY_LABEL[granularity]} · SKY${note ? ` · ${note}` : ""}`}
      footer={
        anyOther ? (
          <p className="text-xs text-muted-foreground">
            Third-party sends to <BurnSinkLink chain={chain} /> are excluded from
            the bars and shown in the tooltip.
          </p>
        ) : null
      }
    >
      <div className="mb-4 flex flex-wrap gap-4">
        <LegendItem color="var(--destructive)">{LABELS.sky_burn_protocol}</LegendItem>
      </div>
      <div className="scroll-thin -mx-1 overflow-x-auto px-1">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-56 w-full min-w-[34rem] @3xl/main:h-64"
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
              tickLine={false}
              axisLine={false}
              width={52}
              fontSize={12}
              tickFormatter={(v: number) => formatCompactTokens(v)}
            />
            <ChartTooltip cursor={false} content={<BurnTooltip anyOther={anyOther} />} />
            <RBar
              dataKey="sky_burn_protocol"
              fill="var(--color-sky_burn_protocol)"
              radius={4}
              maxBarSize={48}
            />
          </ComposedChart>
        </ChartContainer>
      </div>
    </Panel>
  );
}

function BurnTooltip({
  active,
  payload,
  anyOther,
}: {
  active?: boolean;
  payload?: { payload?: TmfPeriod }[];
  anyOther?: boolean;
}) {
  const row = active ? payload?.[0]?.payload : undefined;
  if (!row) return null;
  return (
    <div className="min-w-[13rem] rounded-lg border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground">{row.period}</p>
      <p className="mt-0.5 text-base font-semibold tabular-nums">
        {formatTokens(row.sky_burn_protocol)}
        <span className="ml-1 text-xs font-normal text-muted-foreground">SKY</span>
      </p>
      <p className="text-[11px] text-muted-foreground">{LABELS.sky_burn_protocol}</p>
      {anyOther && (
        <dl className="mt-2 grid gap-1 border-t pt-2 text-[11px] text-muted-foreground">
          <TooltipRow
            muted
            label="Third-party sends to 0x…dEaD"
            value={`${row.sky_burn_other.toFixed(2)} SKY`}
          />
          <TooltipRow muted label="Burn events" value={formatTokens(row.burn_events)} />
        </dl>
      )}
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
  // Gap filling means the row count is now a span, not a count of events.
  const active = rows.filter((r) => r.kicks > 0 || r.burn_events > 0).length;
  return (
    <Panel
      title="By period"
      hint="Newest first. Periods with no kick and no burn are shown as zero rather than skipped, so the series reads continuously."
      description={`${rows.length} ${GRANULARITY_LABEL[granularity].toLowerCase()} periods · ${active} with activity`}
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
