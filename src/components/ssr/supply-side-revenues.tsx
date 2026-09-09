"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import {
  Bar as RBar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  grandSkyRevenue,
  monthSkyRevenues,
  orderedPartners,
  partnerColor,
  partnerMeta,
  partnerMonthlyRevenues,
  partnerPrimeProfit,
  partnerSkyRevenue,
  reportFor,
  reportsFor,
  ssrKpis,
  venuesFor,
} from "@/lib/ssr/domain";
import type {
  SsrExcludedVenue,
  SsrPartner,
  SsrRateBuild,
  SsrRefCode,
  SsrSkyDirectExposure,
} from "@/lib/ssr/types";
import {
  formatCompactUSD,
  formatRatePercent,
  formatUSD,
  monthLong,
  monthRangeLabel,
} from "@/lib/format";
import { paths } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { useSsr } from "../data-context";
import {
  ActionButton,
  DataTable,
  Dash,
  MonthPicker,
  FilterToggle,
  LegendItem,
  PageHeader,
  Panel,
  Prose,
  Swatch,
  TableBody,
  TableHeader,
  TableRow,
  Td,
  Th,
  TotalRow,
  moneyTooltip,
} from "../kit";

/**
 * `partner` and `month` come from the URL — /supply-side-revenues/grove/2026-08
 * is Grove's August settlement, and that link means the same thing to whoever
 * it is sent to. A bare partner path shows its latest month.
 */
export function SupplySideRevenues({
  partner: openPartner,
  month,
}: {
  partner: SsrPartner | null;
  month: string | null;
}) {
  const router = useRouter();
  const ssr = useSsr();
  const kpis = ssrKpis(ssr);
  const partners = orderedPartners(ssr);

  const meta = openPartner ? partnerMeta(openPartner) : null;

  return (
    <div className="flex flex-col gap-6">
      {openPartner && meta ? (
        /* No meta row: "partner" repeated the subtitle and "window" is the row
           of month chips below. The whole-window Sky revenue was the one figure
           unique to it — the Sky side panel totals the selected month, not the
           range — so it moves into the subtitle. */
        <PageHeader
          title="Prime breakdown"
          description={`${meta.label} · ${formatCompactUSD(
            partnerSkyRevenue(ssr, openPartner),
          )} Sky revenue over ${monthRangeLabel(
            reportsFor(ssr, openPartner).map((r) => r.month),
          )}`}
        />
      ) : (
        <PageHeader
          title="Supply side revenues"
          description="Settlement reports"
          /* "primes" is the ranked bar below and "sky rev" is the table's own
             aggregate row; only these two are not already on the page */
          meta={[
            { label: "window", value: monthRangeLabel(ssr.months) },
            { label: "venues", value: kpis.venueCount },
          ]}
        />
      )}

      {openPartner ? (
        <PartnerBreakdown
          partner={openPartner}
          month={month}
          onBack={() => router.push(paths.ssr())}
        />
      ) : (
        <Summary
          partners={partners}
          onOpenPartner={(p) => router.push(paths.ssrPartner(p))}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------- summary */

const monthlyConfig = {
  total: { label: "Sky revenue", color: "var(--sky-revenue)" },
} satisfies ChartConfig;

/* the ranked bar paints itself per prime, so the config only names the series */
const rankedConfig = {
  sky: { label: "Sky revenue" },
} satisfies ChartConfig;

function Summary({
  partners,
  onOpenPartner,
}: {
  partners: SsrPartner[];
  onOpenPartner: (p: SsrPartner) => void;
}) {
  const ssr = useSsr();
  const { months, monthLabels } = ssr;
  const grand = grandSkyRevenue(ssr);
  const totals = monthSkyRevenues(ssr);
  const monthly = months.map((m) => ({
    month: monthLabels[m],
    total: totals[m] ?? 0,
  }));

  // sorted by size rather than by the canonical partner order the table keeps:
  // a ranked bar that is not ranked is just a list with extra ink
  const ranked = partners
    .map((p) => ({
      label: partnerMeta(p).label,
      sky: partnerSkyRevenue(ssr, p),
      color: partnerColor(p),
    }))
    .sort((a, b) => b.sky - a.sky);

  return (
    <div className="flex flex-col gap-6">
      {/* A ranked bar rather than a card each: it fills the row at any prime
          count and makes the lopsidedness visible at a glance. Everything the
          cards held now lives in the table below. */}
      <Panel
        title="Sky revenue by prime"
        description="Sky's take over the whole window, ranked. Select a prime in the table below for its settlement detail."
      >
        <ChartContainer
          config={rankedConfig}
          className="aspect-auto w-full"
          style={{ height: partners.length * 44 + 16 }}
        >
          <BarChart
            data={ranked}
            layout="vertical"
            margin={{ left: 0, right: 72, top: 4, bottom: 4 }}
          >
            <XAxis type="number" dataKey="sky" hide />
            <YAxis
              type="category"
              dataKey="label"
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
                  formatter={moneyTooltip({ sky: "Sky revenue" }, (n) =>
                    formatUSD(n),
                  )}
                />
              }
            />
            {/* minPointSize keeps a sliver for a prime whose share rounds to
                nothing, so its row never reads as missing data */}
            <RBar dataKey="sky" radius={6} maxBarSize={26} minPointSize={3}>
              {ranked.map((r) => (
                <Cell key={r.label} fill={r.color} />
              ))}
              <LabelList
                dataKey="sky"
                position="right"
                offset={10}
                className="fill-foreground"
                fontSize={12}
                formatter={(v: unknown) => formatCompactUSD(Number(v))}
              />
            </RBar>
          </BarChart>
        </ChartContainer>
      </Panel>

      <Panel
        title="Monthly breakdown"
        description="Sky's take per prime, month by month. Select a row to open that prime's settlement detail."
        flush
      >
        <DataTable>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <Th className="w-[280px]">Prime</Th>
              {months.map((m) => (
                <Th key={m} numeric>
                  {monthLabels[m]}
                </Th>
              ))}
              <Th numeric>Total</Th>
              <Th numeric>Share</Th>
              <Th numeric>Prime profit</Th>
              <Th className="w-0" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {partners.map((p) => {
              const sky = partnerSkyRevenue(ssr, p);
              const share = grand > 0 ? (sky / grand) * 100 : 0;
              return (
                <TableRow
                  key={p}
                  onClick={() => onOpenPartner(p)}
                  className="group cursor-pointer"
                >
                  <Td className="whitespace-normal">
                    <span className="flex items-center gap-2 font-medium">
                      <Swatch color={partnerColor(p)} />
                      {partnerMeta(p).label}
                    </span>
                    {/* what each prime actually deploys into — it used to be
                        the body copy of that prime's card */}
                    <span className="mt-0.5 block pl-4 text-muted-foreground">
                      {partnerMeta(p).blurb}
                    </span>
                  </Td>
                  {months.map((m) => (
                    <Td key={m} numeric className="text-muted-foreground">
                      {cell(reportFor(ssr, p, m)?.headline.skyRevenue)}
                    </Td>
                  ))}
                  <Td numeric className="font-medium">
                    {formatCompactUSD(sky)}
                  </Td>
                  <Td numeric className="text-muted-foreground">
                    {share.toFixed(1)}%
                  </Td>
                  <Td numeric className="text-muted-foreground">
                    {formatCompactUSD(partnerPrimeProfit(ssr, p))}
                  </Td>
                  <Td className="text-muted-foreground">
                    <ArrowRightIcon
                      aria-hidden
                      className="size-4 opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </Td>
                </TableRow>
              );
            })}
          </TableBody>
        </DataTable>
        <TotalRow
          className="border-t pt-4"
          label="Aggregate · all primes"
          value={`${formatUSD(grand)} sky revenue`}
        />
      </Panel>

      <Panel
        title="Monthly totals"
        description={`Sky revenue across every prime, ${monthLabels[months[0]]} – ${monthLabels[months[months.length - 1]]}.`}
      >
        <ChartContainer
          config={monthlyConfig}
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
                  formatter={moneyTooltip({ total: "Sky revenue" }, (n) =>
                    formatUSD(n),
                  )}
                />
              }
            />
            <RBar
              dataKey="total"
              fill="var(--color-total)"
              radius={8}
              maxBarSize={72}
            >
              <LabelList
                position="top"
                offset={10}
                className="fill-foreground"
                fontSize={12}
                formatter={(v: unknown) => formatCompactUSD(Number(v))}
              />
            </RBar>
          </BarChart>
        </ChartContainer>
      </Panel>
    </div>
  );
}

/* --------------------------------------------------------- breakdown */

function PartnerBreakdown({
  partner,
  month: monthFromUrl,
  onBack,
}: {
  partner: SsrPartner;
  month: string | null;
  onBack: () => void;
}) {
  const router = useRouter();
  const ssr = useSsr();
  const { monthLabels } = ssr;
  // Only the months this prime settled — Osero has two, and a picker offering
  // the other six would produce links that 404.
  const months = reportsFor(ssr, partner).map((r) => r.month);
  // A bare /supply-side-revenues/grove means "the latest", so it keeps working
  // as months are added; a pinned month stays pinned.
  const month = monthFromUrl ?? months[months.length - 1];
  const [onlyEarning, setOnlyEarning] = React.useState(true);

  const report = reportFor(ssr, partner, month);
  const h = report?.headline;
  const monthly = partnerMonthlyRevenues(ssr, partner);

  const venues = venuesFor(ssr, partner, month);
  const shownVenues = onlyEarning
    ? venues.filter((v) => v.revenue !== 0)
    : venues;

  const revenueConfig = {
    sky: { label: "Sky revenue", color: "var(--sky-revenue)" },
    prime: { label: "Prime revenue", color: partnerColor(partner) },
  } satisfies ChartConfig;

  const revenueData = monthly.map((x) => ({
    month: monthLabels[x.month],
    key: x.month,
    sky: x.sky,
    prime: x.prime,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <ActionButton onClick={onBack}>
          <ArrowLeftIcon data-icon="inline-start" aria-hidden />
          All primes
        </ActionButton>
        <span className="text-sm text-muted-foreground">Month</span>
        <MonthPicker
          value={month}
          onChange={(m) => router.push(paths.ssrPartner(partner, m))}
          months={months}
          render={(m) => monthLabels[m] ?? m}
          label="Settlement month"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 @4xl/main:grid-cols-2">
        <HeadlinePanel
          title="Prime side"
          swatch={partnerColor(partner)}
          rows={[
            ["Demand-side revenue", h?.demandSideRevenue, "sum"],
            ["Agent rate", h?.agentRate, "sub"],
            ["Distribution rewards", h?.distributionRewards, "sub"],
            ["+ Supply-side revenue", h?.primeSupplySideRevenue, "sum"],
          ]}
          total={["Prime agent profit", h?.primeAgentProfit]}
        />
        <HeadlinePanel
          title="Sky side"
          rows={[
            ["Prime cost of funds", h?.primeCostOfFunds, "sum"],
            ["Sky direct exposure", h?.skyDirectExposure, "sum"],
          ]}
          total={["Sky revenue", h?.skyRevenue]}
        />
      </div>

      <Panel
        title="Prime & Sky revenue"
        description="Stacked per settlement month. A negative prime revenue is drawn below the axis. Select a bar to change the month above."
        action={
          <div className="flex flex-wrap gap-4">
            <LegendItem color="var(--sky-revenue)">Sky revenue</LegendItem>
            <LegendItem color={partnerColor(partner)}>Prime revenue</LegendItem>
          </div>
        }
      >
        <ChartContainer
          config={revenueConfig}
          className="aspect-auto h-60 w-full @3xl/main:h-72"
        >
          <BarChart data={revenueData} margin={{ top: 8, left: 4, right: 4 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={56}
              fontSize={12}
              tickFormatter={(v: number) => formatCompactUSD(v)}
            />
            <ReferenceLine y={0} stroke="var(--border)" />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={moneyTooltip(
                    { sky: "Sky revenue", prime: "Prime revenue" },
                    (n) => formatUSD(n),
                  )}
                />
              }
            />
            <RBar
              dataKey="sky"
              stackId="rev"
              fill="var(--color-sky)"
              radius={[0, 0, 4, 4]}
              maxBarSize={64}
              onClick={(d: { payload?: { key?: string } }) =>
                d?.payload?.key &&
                router.push(paths.ssrPartner(partner, d.payload.key))
              }
              cursor="pointer"
            />
            <RBar
              dataKey="prime"
              stackId="rev"
              fill="var(--color-prime)"
              radius={[4, 4, 0, 0]}
              maxBarSize={64}
              onClick={(d: { payload?: { key?: string } }) =>
                d?.payload?.key &&
                router.push(paths.ssrPartner(partner, d.payload.key))
              }
              cursor="pointer"
            />
          </BarChart>
        </ChartContainer>
      </Panel>

      {venues.length === 0 ? (
        <Panel title="Per-venue breakdown" description={monthLong(month)}>
          <Prose className="max-w-3xl">
            {partnerMeta(partner).label} is a bridge / aggregator — it reports
            no venue-level deployments. Its contribution is distribution-rewards
            attribution only (see the Distribution Rewards section).
          </Prose>
        </Panel>
      ) : (
        <Panel
          title="Per-venue breakdown"
          description={`${monthLong(month)} · ${shownVenues.length} venues · negative inflow is an outflow`}
          action={
            <FilterToggle
              pressed={onlyEarning}
              onPressedChange={setOnlyEarning}
            >
              Hide $0 revenue
            </FilterToggle>
          }
          flush
        >
          <DataTable containerClassName="max-h-[34rem]">
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow className="hover:bg-transparent">
                <Th className="w-[80px]">Venue</Th>
                <Th className="min-w-[260px]">Deployment</Th>
                <Th numeric>NAV · eom</Th>
                <Th numeric>Inflow</Th>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shownVenues.map((v) => (
                <TableRow key={v.id}>
                  <Td className="font-mono font-medium">{v.id}</Td>
                  <Td
                    className="max-w-[380px] truncate text-muted-foreground"
                    title={v.label}
                  >
                    {v.label}
                  </Td>
                  <Td numeric className="text-muted-foreground">
                    {formatCompactUSD(v.valueEom)}
                  </Td>
                  <Td numeric>
                    {v.periodInflow === 0 ? (
                      <Dash />
                    ) : (
                      /* Money arriving is the ordinary case and stays in the
                         text colour; only money leaving is marked, and it is
                         marked in the theme's one negative colour. */
                      <span
                        className={cn(v.periodInflow < 0 && "text-destructive")}
                      >
                        {v.periodInflow > 0 ? "+" : ""}
                        {formatCompactUSD(v.periodInflow)}
                      </span>
                    )}
                  </Td>
                </TableRow>
              ))}
            </TableBody>
          </DataTable>
          <TotalRow
            className="border-t pt-4"
            label={`Total NAV · ${formatUSD(shownVenues.reduce((a, v) => a + v.valueEom, 0))}`}
            value={`Total inflows · ${formatUSD(shownVenues.reduce((a, v) => a + v.periodInflow, 0))}`}
          />
        </Panel>
      )}

      {/* Subsidized borrowing only applies to the debt-drawing primes. */}
      {(partner === "spark" || partner === "grove") && report?.rateBuild ? (
        <RateBuildSection rb={report.rateBuild} />
      ) : null}

      {report && report.skyDirect.length > 0 ? (
        <SkyDirectSection rows={report.skyDirect} />
      ) : null}

      {report && report.excludedVenues.length > 0 ? (
        <ExcludedSection rows={report.excludedVenues} />
      ) : null}

      {report && report.refCodes.length > 0 ? (
        <RefCodesSection rows={report.refCodes} />
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------- sections */

function RateBuildSection({ rb }: { rb: SsrRateBuild }) {
  const hasRates = rb.baseRate != null;
  if (!hasRates) return null;
  return (
    <div className="grid grid-cols-1 gap-4 @4xl/main:grid-cols-2">
      <Panel
        title="Rates & subsidy"
        hint="How Sky's take is built: base rate, the subsidy applied to it, and the cost-of-funds composition."
      >
        <dl className="grid gap-2.5 text-sm">
          <Line
            label="SR (subsidized rate)"
            value={formatRatePercent(rb.subsidisedRate)}
          />
          <Line
            label={`TR (target rate${rb.referenceRateKind ? `: ${rb.referenceRateKind}` : ": EFFR or T-Bills"})`}
            value={formatRatePercent(rb.referenceRate)}
          />
          <Line label="BR (base rate)" value={formatRatePercent(rb.baseRate)} />
          <Line
            label="ER (effective rate)"
            value={formatRatePercent(rb.effectiveRate)}
            emphasis
          />
          <Line
            label="ER − BR"
            value={
              rb.diffVsBaseBps != null
                ? `${rb.diffVsBaseBps.toFixed(1)} bps`
                : "—"
            }
          />
          <Line
            label="Time-weighted utilized"
            value={formatCompactUSD(rb.timeWeightedUtilized)}
          />
          <Line
            label="Subsidy benefit to prime"
            value={formatCompactUSD(rb.subsidyBenefit)}
          />
        </dl>
      </Panel>

      <Panel
        title="Formulas"
        footer="U = time-weighted utilized debt · T = months since program start"
      >
        <div className="flex flex-col gap-4">
          <Formula
            label="Subsidized rate (24-month ramp)"
            expr="SR = TR + ((BR − TR) × T / 24)"
          />
          <Formula
            label="Cost of funds — subsidy only applies to the first $1B utilized"
            expr="CoF = SR × min(U, $1B) + BR × max(U − $1B, 0)"
          />
          <Formula label="Effective rate" expr="ER = CoF / U" />
        </div>
      </Panel>
    </div>
  );
}

function Line({
  label,
  value,
  emphasis,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  /** The derived figure of the block — carried by weight, not by colour. */
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/60 pb-2.5 last:border-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "tabular-nums",
          emphasis ? "font-semibold" : "font-medium",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function Formula({ label, expr }: { label: string; expr: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <code className="block rounded-lg bg-muted px-3 py-2 font-mono text-xs">
        {expr}
      </code>
    </div>
  );
}

function SkyDirectSection({ rows }: { rows: SsrSkyDirectExposure[] }) {
  return (
    <Panel
      title="Sky-Direct exposures"
      hint="Fixed or capped venues whose yield accrues directly to Sky."
      flush
    >
      <DataTable>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <Th>Venue</Th>
            <Th className="min-w-[220px]">Label</Th>
            <Th>Kind</Th>
            <Th numeric>Actual rev</Th>
            <Th numeric>To Sky</Th>
            <Th numeric>Active</Th>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((s) => (
            <TableRow key={s.id} title={s.source}>
              <Td className="font-mono font-medium">{s.id}</Td>
              <Td className="text-muted-foreground">{s.label}</Td>
              <Td className="text-muted-foreground">{s.kind}</Td>
              <Td numeric className="text-muted-foreground">
                {formatUSD(s.actualRevenue)}
              </Td>
              <Td numeric>{formatUSD(s.sdRevenue)}</Td>
              <Td numeric>
                {s.active ? (
                  <Badge variant="secondary">Yes</Badge>
                ) : (
                  <span className="text-muted-foreground">No</span>
                )}
              </Td>
            </TableRow>
          ))}
        </TableBody>
      </DataTable>
    </Panel>
  );
}

function ExcludedSection({ rows }: { rows: SsrExcludedVenue[] }) {
  return (
    <Panel
      title="Excluded holdings"
      hint="Tracked for NAV only — not counted in prime or sky revenue."
      flush
    >
      <DataTable>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <Th>Venue</Th>
            <Th className="min-w-[260px]">Label</Th>
            <Th numeric>AUM · som</Th>
            <Th numeric>AUM · eom</Th>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((v) => (
            <TableRow key={v.id}>
              <Td className="font-mono font-medium">{v.id}</Td>
              <Td className="text-muted-foreground">{v.label}</Td>
              <Td numeric className="text-muted-foreground">
                {formatCompactUSD(v.valueSom)}
              </Td>
              <Td numeric className="text-muted-foreground">
                {formatCompactUSD(v.valueEom)}
              </Td>
            </TableRow>
          ))}
        </TableBody>
      </DataTable>
    </Panel>
  );
}

function RefCodesSection({ rows }: { rows: SsrRefCode[] }) {
  const [onlyEarning, setOnlyEarning] = React.useState(true);
  const sorted = [...rows].sort((a, b) => (b.dr ?? 0) - (a.dr ?? 0));
  const shown = onlyEarning
    ? sorted.filter((rc) => (rc.dr ?? 0) !== 0)
    : sorted;
  return (
    <Panel
      title="DR per ref code"
      hint="Distribution rewards attributed in this report — also shown in full on the Distribution Rewards tab."
      description={
        onlyEarning
          ? `Hiding ${sorted.length - shown.length} zero-DR codes`
          : `Showing all ${sorted.length} codes`
      }
      action={
        <FilterToggle pressed={onlyEarning} onPressedChange={setOnlyEarning}>
          Hide $0 revenue
        </FilterToggle>
      }
      flush
    >
      <DataTable containerClassName="max-h-[26rem]">
        <TableHeader className="sticky top-0 z-10 bg-card">
          <TableRow className="hover:bg-transparent">
            <Th>Ref code</Th>
            <Th numeric>DR</Th>
            <Th className="min-w-[260px]">Notes</Th>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shown.map((rc) => (
            <TableRow key={rc.refCode}>
              <Td className="font-mono font-medium">{rc.refCode}</Td>
              <Td numeric>{rc.dr == null ? <Dash /> : formatUSD(rc.dr)}</Td>
              <Td
                className="max-w-[420px] truncate text-muted-foreground"
                title={rc.notes}
              >
                {rc.notes || <Dash />}
              </Td>
            </TableRow>
          ))}
        </TableBody>
      </DataTable>
    </Panel>
  );
}

/**
 * Accounting statement: "sub" rows are indented components of the "sum" row
 * that follows, and the bold "sum" rows are the operands of the ruled total.
 */
function HeadlinePanel({
  title,
  swatch,
  rows,
  total,
}: {
  title: string;
  swatch?: string;
  rows: [string, number | null | undefined, ("sub" | "sum")?][];
  total: [string, number | null | undefined];
}) {
  return (
    <Panel
      title={
        <span className="flex items-center gap-2">
          {swatch ? <Swatch color={swatch} /> : null}
          {title}
        </span>
      }
      footer={
        <span className="flex w-full items-baseline justify-between gap-4">
          <span className="text-muted-foreground">{total[0]}</span>
          {/* the footer sets a muted colour for its label; the figure is the
              point of the card, so it takes the text colour back */}
          <span className="text-lg font-semibold text-foreground tabular-nums">
            {headline(total[1])}
          </span>
        </span>
      }
    >
      <dl className="grid gap-2.5 text-sm">
        {rows.map(([label, value, kind]) => (
          <div
            key={label}
            className="flex items-baseline justify-between gap-4 border-b border-border/60 pb-2.5 last:border-0 last:pb-0"
          >
            <dt
              className={cn(
                kind === "sub" && "pl-4 text-muted-foreground",
                kind === "sum" && "font-medium",
              )}
            >
              {label}
            </dt>
            <dd className={cn("tabular-nums", kind === "sum" && "font-medium")}>
              {headline(value)}
            </dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}

function headline(v: number | null | undefined) {
  if (v == null) return "TBD";
  return formatUSD(v);
}

function cell(v: number | null | undefined) {
  if (v == null) return <Dash />;
  // A real zero is a reported figure, not a gap, so it keeps its digit.
  if (v === 0) return <span className="text-muted-foreground">0</span>;
  return formatCompactUSD(v);
}
