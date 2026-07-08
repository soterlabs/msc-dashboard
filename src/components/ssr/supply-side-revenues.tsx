"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { SSR_MONTH_LABELS, SSR_MONTHS } from "@/lib/ssr-data";
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

  return (
    <div className="space-y-10">
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
  const monthly = partnerMonthlyRevenues(partner);
  // Negative prime months contribute no stacked segment, only tooltip detail.
  const maxMonthly = Math.max(1, ...monthly.map((x) => x.sky + Math.max(0, x.prime)));

  const venues = venuesFor(partner, month);
  const shownVenues = onlyEarning
    ? venues.filter((v) => v.revenue !== 0)
    : venues;

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
            ["demand-side revenue", h?.demandSideRevenue, "sum"],
            ["agent rate", h?.agentRate, "sub"],
            ["distribution rewards", h?.distributionRewards, "sub"],
            ["+ supply-side revenue", h?.primeSupplySideRevenue, "sum"],
          ]}
          total={["prime agent profit", h?.primeAgentProfit]}
          color={partnerColor(partner)}
        />
        <HeadlineCard
          title="Sky side"
          rows={[
            ["prime cost of funds", h?.primeCostOfFunds, "sum"],
            ["sky direct exposure", h?.skyDirectExposure, "sum"],
          ]}
          total={["sky revenue", h?.skyRevenue]}
          accentTotal
        />
      </div>

      <section>
        <SectionTitle
          title="Prime and Sky revenues · monthly"
          note="click a bar to change month"
        />
        <Card className="px-5 py-4">
          <div className="mb-3 flex items-center gap-4 font-mono text-[10px] text-muted">
            <span className="flex items-center gap-1.5">
              <Swatch color="var(--gold)" /> sky revenue
            </span>
            <span className="flex items-center gap-1.5">
              <Swatch color={partnerColor(partner)} /> prime revenue
            </span>
            <span className="flex items-center gap-1.5">
              <Swatch color="var(--loss)" /> negative prime revenue
            </span>
          </div>
          <div className="flex items-end gap-2">
            {monthly.map((x) => {
              const selected = month === x.month;
              const seg = (v: number, c: string) => ({
                height: `${Math.max(v > 0 ? 3 : 0, (Math.max(0, v) / maxMonthly) * 100)}%`,
                background: selected ? `color-mix(in srgb, ${c} 80%, #000)` : c,
                opacity: selected ? 1 : 0.8,
              });
              return (
                <button
                  key={x.month}
                  type="button"
                  onClick={() => setMonth(x.month)}
                  title={`${monthLong(x.month)} · sky ${formatUSD(x.sky)} · prime ${formatUSD(x.prime)}`}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <div className="flex h-24 w-full flex-col justify-end gap-px">
                    <div
                      className="w-full rounded-t-[2px] transition-[background-color]"
                      style={seg(x.prime, partnerColor(partner))}
                    />
                    {/* Negative prime months: the loss shows as a red zone eating
                        into the top of the sky segment. */}
                    <div
                      className="relative w-full overflow-hidden rounded-b-[2px] transition-[background-color]"
                      style={seg(x.sky, "var(--gold)")}
                    >
                      {x.prime < 0 && (
                        <div
                          className="absolute inset-x-0 top-0"
                          style={{
                            height: `${Math.min(100, (-x.prime / Math.max(x.sky, 1)) * 100)}%`,
                            background: "var(--loss)",
                            opacity: 0.85,
                          }}
                        />
                      )}
                    </div>
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
                      <Th className="text-right">NAV · eom</Th>
                      <Th className="text-right">Inflow</Th>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            <div className="mt-3">
              <DarkBar
                left={`total NAV · ${formatUSD(shownVenues.reduce((a, v) => a + v.valueEom, 0))}`}
                right={`total inflows · ${formatUSD(shownVenues.reduce((a, v) => a + v.periodInflow, 0))}`}
              />
            </div>
          </>
        )}
      </section>

      {/* Subsidized borrowing only applies to the debt-drawing primes. */}
      {(partner === "spark" || partner === "grove") && report?.rateBuild ? (
        <RateBuildSection rb={report.rateBuild} />
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

function RateBuildSection({ rb }: { rb: SsrRateBuild }) {
  const hasRates = rb.baseRate != null;
  if (!hasRates) return null;
  return (
    <section>
      <SectionTitle
        title="Subsidized borrowing"
        note="rate, subsidy & cost-of-funds composition"
      />
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card className="px-5 py-4">
          <p className="mb-3 font-mono text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
            Rates &amp; subsidy
          </p>
          <div className="space-y-2.5">
            <LeaderRow
              label="SR (subsidized rate)"
              value={formatRatePercent(rb.subsidisedRate)}
            />
            <LeaderRow
              label={`TR (target rate${rb.referenceRateKind ? `: ${rb.referenceRateKind}` : ": EFFR or T-Bills"})`}
              value={formatRatePercent(rb.referenceRate)}
            />
            <LeaderRow label="BR (base rate)" value={formatRatePercent(rb.baseRate)} />
            <LeaderRow
              label="ER (effective rate)"
              value={formatRatePercent(rb.effectiveRate)}
              valueClassName="text-gold"
            />
            <LeaderRow
              label="ER − BR"
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

        <Card className="px-5 py-4">
          <p className="mb-3 font-mono text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
            Formulas
          </p>
          <div className="space-y-4">
            <Formula
              label="subsidized rate (24-month ramp)"
              expr="SR = TR + ((BR − TR) × T / 24)"
            />
            <Formula
              label="cost of funds — subsidy only applies to the first $1B utilized"
              expr="CoF = SR × min(U, $1B) + BR × max(U − $1B, 0)"
            />
            <Formula label="effective rate" expr="ER = CoF / U" />
          </div>
          <p className="mt-4 border-t border-line pt-3 font-mono text-[10.5px] text-faint">
            U = time-weighted utilized debt · T = months since program start
          </p>
        </Card>
      </div>
    </section>
  );
}

function Formula({ label, expr }: { label: string; expr: string }) {
  return (
    <div>
      <p className="font-mono text-[10.5px] tracking-[0.08em] text-muted uppercase">
        {label}
      </p>
      <p className="mt-1 font-mono text-xs font-medium text-ink">{expr}</p>
    </div>
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
  const [onlyEarning, setOnlyEarning] = React.useState(true);
  const sorted = [...rows].sort((a, b) => (b.dr ?? 0) - (a.dr ?? 0));
  const shown = onlyEarning ? sorted.filter((rc) => (rc.dr ?? 0) !== 0) : sorted;
  return (
    <section>
      <SectionTitle
        title="DR per ref code"
        note="distribution rewards in this report · also in the Distribution Rewards section"
      />
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <FilterButton
          active={onlyEarning}
          onClick={() => setOnlyEarning((v) => !v)}
        >
          Hide $0 revenue
        </FilterButton>
        <span className="font-mono text-[10.5px] text-muted">
          {onlyEarning
            ? `hiding ${sorted.length - shown.length} zero-DR codes`
            : `showing all ${sorted.length} codes`}
        </span>
      </div>
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
              {shown.map((rc) => (
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

/**
 * Accounting-statement card: "sub" rows are indented components of the
 * following "sum" row; bold "sum" rows are the operands of the ruled total.
 */
function HeadlineCard({
  title,
  rows,
  total,
  color,
  accentTotal,
}: {
  title: string;
  rows: [string, number | null | undefined, ("sub" | "sum")?][];
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
        {rows.map(([label, value, kind]) => (
          <LeaderRow
            key={label}
            label={
              kind === "sub" ? (
                <span className="pl-4">{label}</span>
              ) : kind === "sum" ? (
                // A leading "+ " hangs in the card padding so sum labels align.
                <span className="relative font-semibold text-ink">
                  {label.startsWith("+ ") ? (
                    <>
                      <span className="absolute -left-3 font-normal text-muted">+</span>
                      {label.slice(2)}
                    </>
                  ) : (
                    label
                  )}
                </span>
              ) : (
                label
              )
            }
            value={fmtHeadline(value)}
            valueClassName={
              kind === "sum" ? "font-semibold" : kind === "sub" ? "font-normal" : undefined
            }
          />
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
