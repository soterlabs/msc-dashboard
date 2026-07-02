"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { SSR_MONTH_LABELS, SSR_MONTHS } from "@/lib/ssr-data";
import {
  grandPrimeProfit,
  grandSkyRevenue,
  monthSkyRevenues,
  orderedPartners,
  partnerColor,
  partnerMeta,
  partnerMonthlySky,
  partnerPrimeProfit,
  partnerSkyRevenue,
  reportFor,
  ssrKpis,
  venuesFor,
} from "@/lib/ssr-domain";
import type {
  SsrDebtDay,
  SsrExcludedVenue,
  SsrPartner,
  SsrRateBuild,
  SsrRefCode,
  SsrSkyDirectExposure,
} from "@/lib/ssr-types";
import {
  formatCompactUSD,
  formatRatePercent,
  formatUSD,
  monthLong,
} from "@/lib/format";
import { cn } from "@/lib/utils";

import {
  Bar,
  Card,
  DarkBar,
  Eyebrow,
  DisplayTitle,
  FilterButton,
  KpiCard,
  LeaderRow,
  MetaItem,
  NoteText,
  Pill,
  SectionTitle,
  Swatch,
} from "../dr/primitives";

export function SupplySideRevenues() {
  const [openPartner, setOpenPartner] = React.useState<SsrPartner | null>(null);
  const kpis = ssrKpis();
  const partners = orderedPartners();

  const meta = openPartner ? partnerMeta(openPartner) : null;

  return (
    <div className="space-y-7">
      <header className="space-y-3">
        <Eyebrow>
          {openPartner
            ? "Supply side revenues · breakdown"
            : "Supply side revenues · summary"}
        </Eyebrow>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          {openPartner && meta ? (
            <DisplayTitle accent={`${meta.label}.`}>Prime breakdown —</DisplayTitle>
          ) : (
            <DisplayTitle accent="settlement reports.">
              Supply side revenues —
            </DisplayTitle>
          )}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 lg:justify-end">
            {openPartner ? (
              <>
                <MetaItem label="partner" value={meta?.label} />
                <MetaItem label="window" value="Jan–May 2026" />
                <MetaItem
                  label="sky rev"
                  value={formatCompactUSD(partnerSkyRevenue(openPartner))}
                />
              </>
            ) : (
              <>
                <MetaItem label="primes" value={kpis.partnerCount} />
                <MetaItem label="window" value="Jan–May 2026" />
                <MetaItem label="venues" value={kpis.venueCount} />
                <MetaItem label="sky rev" value={formatCompactUSD(kpis.grandSky)} />
              </>
            )}
          </div>
        </div>
      </header>

      {openPartner ? (
        <PartnerBreakdown
          partner={openPartner}
          onBack={() => setOpenPartner(null)}
        />
      ) : (
        <Summary partners={partners} onOpenPartner={setOpenPartner} />
      )}
    </div>
  );
}

function Summary({
  partners,
  onOpenPartner,
}: {
  partners: SsrPartner[];
  onOpenPartner: (p: SsrPartner) => void;
}) {
  const kpis = ssrKpis();
  const grand = grandSkyRevenue();
  const totals = monthSkyRevenues();
  const maxPartner = Math.max(1, ...partners.map((p) => partnerSkyRevenue(p)));

  const mom =
    kpis.prevSky > 0
      ? ((kpis.latestSky - kpis.prevSky) / kpis.prevSky) * 100
      : 0;

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Sky revenue · window"
          value={formatCompactUSD(grand)}
          note="Jan–May 2026 · all primes (excl. Skybase)"
        />
        <KpiCard
          label={`Latest · ${monthLong(kpis.latestMonth)}`}
          value={formatCompactUSD(kpis.latestSky)}
          accent
          note={`${mom >= 0 ? "+" : ""}${mom.toFixed(1)}% vs prior month`}
        />
        <KpiCard
          label="Prime agent profit"
          value={formatCompactUSD(grandPrimeProfit())}
          note="Agent rate + DR + net revenue + SDE"
        />
        <KpiCard
          label="Primes"
          value={kpis.partnerCount}
          unit="active"
          note={`${kpis.venueCount} venues tracked · latest month`}
        />
      </div>

      <section>
        <SectionTitle
          title="Sky revenue by prime"
          note="click a prime for its per-venue breakdown · Jan–May 2026"
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {partners.map((p) => {
            const meta = partnerMeta(p);
            const sky = partnerSkyRevenue(p);
            const share = grand > 0 ? (sky / grand) * 100 : 0;
            const latest = reportFor(p, kpis.latestMonth)?.headline.skyRevenue ?? 0;
            return (
              <Card key={p} className="flex flex-col px-5 py-4">
                <div className="flex items-center gap-2">
                  <Swatch color={partnerColor(p)} />
                  <span className="font-mono text-[11px] font-medium tracking-[0.12em] text-muted uppercase">
                    {meta.label}
                  </span>
                </div>
                <p className="mt-3 font-mono text-[1.5rem] leading-none font-semibold text-ink tabular-nums">
                  {formatCompactUSD(sky)}
                </p>
                <p className="mt-1.5 font-mono text-[11px] text-muted">
                  sky revenue · window
                </p>

                <div className="mt-4 space-y-2 border-t border-line pt-3.5">
                  <LeaderRow
                    label={`latest · ${SSR_MONTH_LABELS[kpis.latestMonth]}`}
                    value={formatCompactUSD(latest)}
                  />
                  <LeaderRow
                    label="share of total"
                    value={`${share.toFixed(1)}%`}
                    valueClassName="text-gold"
                  />
                  <LeaderRow
                    label="prime profit"
                    value={formatCompactUSD(partnerPrimeProfit(p))}
                  />
                </div>

                <p className="mt-3 font-serif text-[12px] leading-snug text-muted italic">
                  {meta.blurb}
                </p>

                <button
                  type="button"
                  onClick={() => onOpenPartner(p)}
                  className="mt-4 inline-flex items-center gap-1 self-start font-mono text-[11px] font-medium tracking-wide text-gold uppercase transition-opacity hover:opacity-70"
                >
                  View breakdown <ArrowRight className="size-3" />
                </button>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <SectionTitle
          title="Sky revenue by prime & month"
          note="click a prime to open its breakdown · USD"
        />
        <Card className="overflow-hidden">
          <div className="dr-scroll overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="bg-thead">
                  <Th className="w-[200px]">Prime</Th>
                  <Th className="w-[150px]">Distribution</Th>
                  {SSR_MONTHS.map((m) => (
                    <Th key={m} className="text-right">
                      {SSR_MONTH_LABELS[m]}
                    </Th>
                  ))}
                  <Th className="text-right">Total</Th>
                  <Th className="text-right">Share</Th>
                </tr>
              </thead>
              <tbody>
                {partners.map((p) => {
                  const sky = partnerSkyRevenue(p);
                  const share = grand > 0 ? (sky / grand) * 100 : 0;
                  return (
                    <tr
                      key={p}
                      onClick={() => onOpenPartner(p)}
                      className="group cursor-pointer border-b border-line transition-colors hover:bg-paper/60"
                    >
                      <Td>
                        <div className="flex items-center gap-2">
                          <Swatch color={partnerColor(p)} />
                          <span className="font-sans text-[13px] font-semibold text-ink">
                            {partnerMeta(p).label}
                          </span>
                          <ArrowRight className="size-3 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                      </Td>
                      <Td>
                        <Bar value={sky} max={maxPartner} color={partnerColor(p)} />
                      </Td>
                      {SSR_MONTHS.map((m) => (
                        <Td key={m} className="text-right text-muted">
                          {fmtCell(reportFor(p, m)?.headline.skyRevenue)}
                        </Td>
                      ))}
                      <Td className="text-right font-semibold text-gold">
                        {formatCompactUSD(sky)}
                      </Td>
                      <Td className="text-right text-ink">{share.toFixed(1)}%</Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
        <div className="mt-3">
          <DarkBar
            left="Aggregate · all primes"
            right={`${formatUSD(grand)} sky revenue`}
          />
        </div>
      </section>

      <section>
        <SectionTitle title="Window totals" note="all primes combined, by month" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {SSR_MONTHS.map((m) => (
            <Card key={m} className="px-4 py-3">
              <p className="font-mono text-[10.5px] tracking-[0.12em] text-muted uppercase">
                {monthLong(m)}
              </p>
              <p className="mt-1.5 font-mono text-base font-semibold text-ink tabular-nums">
                {formatCompactUSD(totals[m])}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function PartnerBreakdown({
  partner,
  onBack,
}: {
  partner: SsrPartner;
  onBack: () => void;
}) {
  const [month, setMonth] = React.useState<string>(
    SSR_MONTHS[SSR_MONTHS.length - 1]
  );
  const [onlyEarning, setOnlyEarning] = React.useState(true);

  const report = reportFor(partner, month);
  const h = report?.headline;
  const monthly = partnerMonthlySky(partner);
  const maxMonthly = Math.max(1, ...monthly.map((x) => x.v));

  const venues = venuesFor(partner, month);
  const shownVenues = onlyEarning
    ? venues.filter((v) => v.revenue !== 0)
    : venues;
  const maxVenueRev = Math.max(1, ...shownVenues.map((v) => Math.abs(v.revenue)));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-9 items-center gap-1.5 rounded-[6px] border border-line-strong bg-card px-3 font-mono text-[11px] font-medium tracking-wide text-muted transition-colors hover:border-ink/40 hover:text-ink"
        >
          <ArrowLeft className="size-3.5" /> All primes
        </button>
        <span className="mx-1 font-mono text-[10.5px] tracking-[0.14em] text-muted uppercase">
          Month
        </span>
        {SSR_MONTHS.map((m) => (
          <FilterButton key={m} active={month === m} onClick={() => setMonth(m)}>
            {SSR_MONTH_LABELS[m]}
          </FilterButton>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <HeadlineCard
          title="Prime side"
          rows={[
            ["agent rate", h?.agentRate],
            ["distribution rewards", h?.distributionRewards],
            ["prime agent net revenue", h?.primeAgentNetRevenue],
            ["sky direct exposure", h?.primeSideSkyDirectExposure],
          ]}
          total={["prime agent profit", h?.primeAgentProfit]}
          color={partnerColor(partner)}
        />
        <HeadlineCard
          title="Sky side"
          rows={[
            ["prime cost of funds", h?.primeCostOfFunds],
            ["sky direct exposure", h?.skySideSkyDirectExposure],
          ]}
          total={["sky revenue", h?.skyRevenue]}
          accentTotal
        />
      </div>

      <section>
        <SectionTitle
          title="Sky revenue · monthly"
          note="click a bar to change month"
        />
        <Card className="px-5 py-4">
          <div className="flex items-end gap-2">
            {monthly.map((x) => {
              const selected = month === x.month;
              return (
                <button
                  key={x.month}
                  type="button"
                  onClick={() => setMonth(x.month)}
                  title={`${monthLong(x.month)} · ${formatUSD(x.v)}`}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <div className="flex h-24 w-full items-end">
                    <div
                      className="w-full rounded-[2px] transition-[background-color]"
                      style={{
                        height: `${Math.max(3, (x.v / maxMonthly) * 100)}%`,
                        background: selected
                          ? `color-mix(in srgb, ${partnerColor(partner)} 80%, #000)`
                          : partnerColor(partner),
                        opacity: selected ? 1 : 0.8,
                      }}
                    />
                  </div>
                  <span
                    className={cn(
                      "font-mono text-[10px]",
                      selected ? "font-semibold text-ink" : "text-muted"
                    )}
                  >
                    {SSR_MONTH_LABELS[x.month]}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      </section>

      <section>
        <SectionTitle
          title={
            <>
              Per-venue breakdown{" "}
              <span className="font-mono text-xs font-normal text-muted">
                {monthLong(month)} · {shownVenues.length} venues
              </span>
            </>
          }
          note="AUM & revenue per deployment venue"
        />

        {venues.length === 0 ? (
          <Card className="px-5 py-6">
            <NoteText
              className="max-w-2xl text-ink/80"
              note={`${partnerMeta(partner).label} is a bridge / aggregator — it reports no venue-level deployments. Its contribution is distribution-rewards attribution only (see the Distribution Rewards section).`}
            />
          </Card>
        ) : (
          <>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <FilterButton
                active={onlyEarning}
                onClick={() => setOnlyEarning((v) => !v)}
              >
                Hide $0 revenue
              </FilterButton>
              <span className="font-mono text-[10.5px] text-muted">
                {onlyEarning
                  ? `hiding ${venues.length - shownVenues.length} idle venues · negative = loss shown in red`
                  : `showing all ${venues.length} venues`}
              </span>
            </div>
            <Card className="overflow-hidden">
              <div className="dr-scroll max-h-[560px] overflow-auto">
                <table className="w-full min-w-[820px] border-collapse text-left">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-thead">
                      <Th className="w-[60px]">Venue</Th>
                      <Th className="min-w-[260px]">Deployment</Th>
                      <Th className="text-right">AUM · eom</Th>
                      <Th className="text-right">Inflow</Th>
                      <Th className="w-[150px]">Revenue</Th>
                      <Th className="text-right">SD</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {shownVenues.map((v) => (
                      <tr
                        key={v.id}
                        className="border-b border-line transition-colors hover:bg-paper/60"
                      >
                        <Td className="font-semibold text-ink">{v.id}</Td>
                        <Td className="max-w-[360px] truncate text-muted" title={v.label}>
                          {v.label}
                        </Td>
                        <Td className="text-right text-muted">
                          {formatCompactUSD(v.valueEom)}
                        </Td>
                        <Td className="text-right text-muted">
                          {v.periodInflow === 0 ? (
                            <span className="text-faint">—</span>
                          ) : (
                            <span
                              className={
                                v.periodInflow > 0 ? "text-success" : "text-gold"
                              }
                            >
                              {v.periodInflow > 0 ? "+" : ""}
                              {formatCompactUSD(v.periodInflow)}
                            </span>
                          )}
                        </Td>
                        <Td>
                          <div className="flex items-center gap-2">
                            <Bar
                              value={Math.abs(v.revenue)}
                              max={maxVenueRev}
                              color={
                                v.revenue < 0 ? "var(--loss)" : partnerColor(partner)
                              }
                              className="w-[80px]"
                            />
                            <span
                              className={cn(
                                "tabular-nums",
                                v.revenue < 0 ? "text-loss" : "text-ink"
                              )}
                            >
                              {formatCompactUSD(v.revenue)}
                            </span>
                          </div>
                        </Td>
                        <Td className="text-right">
                          {v.sdShare > 0 ? (
                            <Pill color="var(--group-osero)">
                              {(v.sdShare * 100).toFixed(0)}%
                            </Pill>
                          ) : (
                            <span className="text-faint">—</span>
                          )}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            <div className="mt-3">
              <DarkBar
                left={`${partnerMeta(partner).label} · ${monthLong(month)}`}
                right={`${formatUSD(h?.skyRevenue ?? 0)} sky revenue`}
              />
            </div>
          </>
        )}
      </section>

      {report?.rateBuild ? (
        <RateBuildSection rb={report.rateBuild} skyRevenue={h?.skyRevenue ?? 0} />
      ) : null}

      {report && report.debtDaily.length > 0 ? (
        <DebtDailySection days={report.debtDaily} partner={partner} />
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

function RateBuildSection({
  rb,
  skyRevenue,
}: {
  rb: SsrRateBuild;
  skyRevenue: number;
}) {
  const hasRates = rb.baseRate != null;
  return (
    <section>
      <SectionTitle
        title="How Sky's take is built"
        note="rate, subsidy & cost-of-funds composition"
      />
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {hasRates ? (
          <Card className="px-5 py-4">
            <p className="mb-3 font-mono text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
              Rates &amp; subsidy
            </p>
            <div className="space-y-2.5">
              <LeaderRow label="base rate · BR" value={formatRatePercent(rb.baseRate)} />
              <LeaderRow
                label={`reference rate${rb.referenceRateKind ? ` · ${rb.referenceRateKind}` : ""}`}
                value={formatRatePercent(rb.referenceRate)}
              />
              <LeaderRow
                label="subsidised rate · BR*"
                value={formatRatePercent(rb.subsidisedRate)}
              />
              <LeaderRow
                label="effective blended"
                value={formatRatePercent(rb.effectiveRate)}
                valueClassName="text-gold"
              />
              <LeaderRow
                label="diff vs base"
                value={
                  rb.diffVsBaseBps != null
                    ? `${rb.diffVsBaseBps.toFixed(1)} bps`
                    : "—"
                }
              />
              <LeaderRow
                label="time-weighted utilized"
                value={formatCompactUSD(rb.timeWeightedUtilized)}
              />
              <LeaderRow
                label="subsidy benefit to prime"
                value={formatCompactUSD(rb.subsidyBenefit)}
              />
            </div>
          </Card>
        ) : null}

        <Card className="px-5 py-4">
          <p className="mb-3 font-mono text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
            Component build
          </p>
          <div className="space-y-2.5">
            <LeaderRow
              label="CoF on utilized debt"
              value={formatUSD(rb.cofOnUtilized)}
            />
            <LeaderRow
              label="+ Sky-Direct revenue"
              value={formatUSD(rb.skyDirectComponent)}
            />
          </div>
          <div className="mt-4 flex items-baseline justify-between border-t border-line-strong pt-3">
            <span className="font-mono text-[11px] font-medium tracking-[0.1em] text-muted uppercase">
              = sky revenue
            </span>
            <span className="font-mono text-lg font-semibold text-gold tabular-nums">
              {formatUSD(skyRevenue)}
            </span>
          </div>
          {rb.skyRevenueMax != null ? (
            <p className="mt-3 font-mono text-[10.5px] text-faint">
              max (BR × full debt, no deductions):{" "}
              {formatCompactUSD(rb.skyRevenueMax)}
            </p>
          ) : null}
        </Card>
      </div>
    </section>
  );
}

function DebtDailySection({
  days,
  partner,
}: {
  days: SsrDebtDay[];
  partner: SsrPartner;
}) {
  const max = Math.max(1, ...days.map((d) => d.dailySkyCharge));
  const total = days.reduce((a, d) => a + d.dailySkyCharge, 0);
  return (
    <section>
      <SectionTitle
        title="Daily Sky charge"
        note="on-chain ilk-debt cost of funds, per day"
      />
      <Card className="px-5 py-4">
        <div className="flex h-24 items-end gap-[3px]">
          {days.map((d) => (
            <div
              key={d.date}
              title={`${d.date} · ${formatUSD(d.dailySkyCharge)} · utilized ${formatCompactUSD(d.utilized)}`}
              className="flex-1 rounded-[1px]"
              style={{
                height: `${Math.max(2, (d.dailySkyCharge / max) * 100)}%`,
                background: partnerColor(partner),
                opacity: 0.85,
              }}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between font-mono text-[10px] text-faint">
          <span>{days[0]?.date}</span>
          <span className="text-muted">Σ {formatUSD(total)} · month CoF</span>
          <span>{days[days.length - 1]?.date}</span>
        </div>
      </Card>
    </section>
  );
}

function SkyDirectSection({ rows }: { rows: SsrSkyDirectExposure[] }) {
  return (
    <section>
      <SectionTitle
        title="Sky-Direct exposures"
        note="fixed / capped venues whose yield accrues to Sky"
      />
      <Card className="overflow-hidden">
        <div className="dr-scroll overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="bg-thead">
                <Th>Venue</Th>
                <Th className="min-w-[220px]">Label</Th>
                <Th>Kind</Th>
                <Th className="text-right">Actual rev</Th>
                <Th className="text-right">To Sky</Th>
                <Th className="text-right">Active</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr
                  key={s.id}
                  title={s.source}
                  className="border-b border-line transition-colors hover:bg-paper/60"
                >
                  <Td className="font-semibold text-ink">{s.id}</Td>
                  <Td className="text-muted">{s.label}</Td>
                  <Td className="text-muted">{s.kind}</Td>
                  <Td className="text-right text-muted">
                    {formatUSD(s.actualRevenue)}
                  </Td>
                  <Td className="text-right text-ink">{formatUSD(s.sdRevenue)}</Td>
                  <Td className="text-right">
                    {s.active ? (
                      <Pill color="var(--success)">yes</Pill>
                    ) : (
                      <span className="text-faint">no</span>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}

function ExcludedSection({ rows }: { rows: SsrExcludedVenue[] }) {
  return (
    <section>
      <SectionTitle
        title="Excluded holdings"
        note="tracked for NAV · not in prime or sky revenue"
      />
      <Card className="overflow-hidden">
        <div className="dr-scroll overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="bg-thead">
                <Th>Venue</Th>
                <Th className="min-w-[260px]">Label</Th>
                <Th className="text-right">AUM · som</Th>
                <Th className="text-right">AUM · eom</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((v) => (
                <tr
                  key={v.id}
                  className="border-b border-line transition-colors hover:bg-paper/60"
                >
                  <Td className="font-semibold text-ink">{v.id}</Td>
                  <Td className="text-muted">{v.label}</Td>
                  <Td className="text-right text-muted">
                    {formatCompactUSD(v.valueSom)}
                  </Td>
                  <Td className="text-right text-muted">
                    {formatCompactUSD(v.valueEom)}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}

function RefCodesSection({ rows }: { rows: SsrRefCode[] }) {
  const sorted = [...rows].sort((a, b) => (b.dr ?? 0) - (a.dr ?? 0));
  return (
    <section>
      <SectionTitle
        title="DR per ref code"
        note="distribution rewards in this report · also in the Distribution Rewards section"
      />
      <Card className="overflow-hidden">
        <div className="dr-scroll max-h-[420px] overflow-auto">
          <table className="w-full min-w-[520px] border-collapse text-left">
            <thead className="sticky top-0 z-10">
              <tr className="bg-thead">
                <Th>Ref code</Th>
                <Th className="text-right">DR</Th>
                <Th className="min-w-[240px]">Notes</Th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((rc) => (
                <tr
                  key={rc.refCode}
                  className="border-b border-line transition-colors hover:bg-paper/60"
                >
                  <Td className="font-semibold text-ink">{rc.refCode}</Td>
                  <Td className="text-right text-gold">
                    {rc.dr == null ? "—" : formatUSD(rc.dr)}
                  </Td>
                  <Td className="max-w-[360px] truncate text-muted" title={rc.notes}>
                    {rc.notes || <span className="text-faint">—</span>}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}

function HeadlineCard({
  title,
  rows,
  total,
  color,
  accentTotal,
}: {
  title: string;
  rows: [string, number | null | undefined][];
  total: [string, number | null | undefined];
  color?: string;
  accentTotal?: boolean;
}) {
  return (
    <Card className="flex flex-col px-5 py-4">
      <div className="flex items-center gap-2">
        {color ? <Swatch color={color} /> : null}
        <span className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
          {title}
        </span>
      </div>
      <div className="mt-4 space-y-2.5">
        {rows.map(([label, value]) => (
          <LeaderRow key={label} label={label} value={fmtHeadline(value)} />
        ))}
      </div>
      <div className="mt-4 flex items-baseline justify-between border-t border-line-strong pt-3">
        <span className="font-mono text-[11px] font-medium tracking-[0.1em] text-muted uppercase">
          {total[0]}
        </span>
        <span
          className={cn(
            "font-mono text-lg font-semibold tabular-nums",
            accentTotal ? "text-gold" : "text-ink"
          )}
        >
          {fmtHeadline(total[1])}
        </span>
      </div>
    </Card>
  );
}

function fmtHeadline(v: number | null | undefined) {
  if (v == null) return "TBD";
  return formatUSD(v);
}

function fmtCell(v: number | null | undefined) {
  if (v == null) return <span className="text-faint">—</span>;
  if (v === 0) return <span className="text-faint">0</span>;
  return formatCompactUSD(v);
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "bg-thead px-3 py-2.5 font-mono text-[10.5px] font-medium tracking-[0.1em] text-muted uppercase",
        className
      )}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <td
      title={title}
      className={cn("px-3 py-2.5 font-mono text-xs whitespace-nowrap", className)}
    >
      {children}
    </td>
  );
}
