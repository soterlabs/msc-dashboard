import { notFound, redirect } from "next/navigation";
import { PageHeader, Panel, StatCard } from "@/components/kit";
import { RevenueChart } from "@/components/daily-revenue/charts";
import { AllocationTable, Breadcrumbs, DailyValues, Methodology, PageActions, PrimeTable, ReadNotice, Unavailable } from "@/components/daily-revenue/report";
import { FLAGS } from "@/lib/flags";
import { revenueClient } from "@/lib/daily-revenue/api";
import { yesterday } from "@/lib/daily-revenue/calendar";
import { latestValue, portfolioPoints, primeSeries } from "@/lib/daily-revenue/domain";
import { parseDailyRoute } from "@/lib/daily-revenue/routes";
import { usd } from "@/lib/daily-revenue/decimal";
import { DAILY_PRIMES, primeName, SEPTEMBER_END, SEPTEMBER_START, type DailyPrime, type PrimeSeries, type ReadResult, type History } from "@/lib/daily-revenue/types";

export const dynamic = "force-dynamic";

const color = (prime: DailyPrime) => `var(--group-${prime})`;
const unavailableRead = (): ReadResult<History> => ({ data: null, source: "missing", verifiedAt: null, error: "No completed September UTC day is available yet." });

export default async function Page({ params }: { params: Promise<{ path?: string[] }> }) {
  if (!FLAGS.dailyRevenue) notFound();
  const route = parseDailyRoute((await params).path ?? []);
  if (!route) notFound();
  if ("redirectTo" in route) redirect(route.redirectTo);

  const todayLimit = yesterday(new Date());
  const end = todayLimit < SEPTEMBER_END ? todayLimit : SEPTEMBER_END;
  const selected = route.prime ? [route.prime] : [...DAILY_PRIMES];
  const reads = end < SEPTEMBER_START
    ? selected.map(() => unavailableRead())
    : await Promise.all(selected.map((prime) => revenueClient.history(prime, SEPTEMBER_START, end)));
  const series = selected.map((prime, index) => reads[index].data ? primeSeries(reads[index].data!, prime) : null);

  if (!route.prime) {
    const available = series.filter((s): s is PrimeSeries => s !== null);
    const portfolio = available.length === DAILY_PRIMES.length ? portfolioPoints(available) : [];
    const common = latestValue(portfolio, "mtd");
    const lines = [
      ...available.map((s) => ({ key: s.prime, label: primeName(s.prime), color: color(s.prime), points: s.points })),
      ...(portfolio.length ? [{ key: "complete-total", label: "Complete total", color: "var(--foreground)", points: portfolio }] : []),
    ];
    return <div className="space-y-6">
      <Breadcrumbs />
      <PageHeader title="Daily Revenue · September 2026" description={`Supply-side allocation revenue · completed UTC days through ${end}`} />
      <div className="grid gap-4 sm:grid-cols-2"><StatCard label="Six-prime MTD total" value={usd(common?.mtd ?? null)} note={common ? `Latest common complete cutoff · ${common.date} UTC` : "Unavailable until all six primes have complete allocation observations on one cutoff."} />
        <StatCard label="Prime coverage" value={`${available.length} / ${DAILY_PRIMES.length}`} note="A complete total never combines different cutoffs." /></div>
      <RevenueChart lines={lines} />
      <PrimeTable rows={selected.map((prime, i) => ({ prime, series: series[i], read: reads[i] }))} />
      {reads.some((r) => r.error || r.source === "cache") && <Panel title="Data availability">{reads.map((read, i) => <div key={selected[i]} className="border-b py-2 last:border-0"><p className="font-medium">{primeName(selected[i])}</p><ReadNotice read={read} /></div>)}</Panel>}
      <Methodology />
    </div>;
  }

  const read = reads[0], primeData = series[0];
  if (!primeData) return <div className="space-y-6"><Breadcrumbs prime={route.prime} /><PageHeader title={`${primeName(route.prime)} · September 2026`} description="Supply-side allocation revenue" actions={<PageActions />} /><Unavailable read={read} /><Methodology /></div>;

  if (!route.allocation) {
    const mtd = latestValue(primeData.points, "mtd"), daily = latestValue(primeData.points, "daily");
    return <div className="space-y-6">
      <Breadcrumbs prime={route.prime} />
      <PageHeader title={`${primeName(route.prime)} · September 2026`} description="Supply-side allocation revenue" actions={<PageActions />} />
      <div className="grid gap-4 sm:grid-cols-2"><StatCard label="Latest MTD allocation revenue" value={usd(mtd?.mtd ?? null)} note={mtd ? `${mtd.date} UTC` : "No complete allocation snapshot"} />
        <StatCard label="Latest daily change" value={usd(daily?.daily ?? null)} note={daily ? `${daily.date} UTC` : "Consecutive observations unavailable"} /></div>
      <RevenueChart lines={[{ key: route.prime, label: primeName(route.prime), color: color(route.prime), points: primeData.points }]} />
      <AllocationTable series={primeData} />
      <ReadNotice read={read} /><Methodology />
    </div>;
  }

  const allocation = primeData.allocations.find((a) => a.venueId === route.allocation);
  const hidden = primeData.hidden.find((a) => a.venueId === route.allocation);
  if (!allocation && !hidden) {
    if (!primeData.breakdownAvailable) return <div className="space-y-6"><Breadcrumbs prime={route.prime} allocation={route.allocation} /><PageHeader title={`${primeName(route.prime)} · ${route.allocation}`} actions={<PageActions />} /><Unavailable read={read} /></div>;
    notFound();
  }
  const selectedAllocation = allocation ?? hidden!;
  if (selectedAllocation.hidden) return <div className="space-y-6"><Breadcrumbs prime={route.prime} allocation={selectedAllocation.label} />
    <PageHeader title={selectedAllocation.label} description={`${primeName(route.prime)} · venue ${selectedAllocation.venueId} · September 2026`} actions={<PageActions />} />
    <Panel title="Position tracking only — revenue not displayed"><p className="text-sm text-muted-foreground">The published allocation is marked <code>hide_per_venue_pnl=true</code>. It is excluded from revenue graphs, totals, and the clickable revenue-allocation list; this is not a claim of zero revenue.</p></Panel><Methodology /></div>;

  const mtd = latestValue(selectedAllocation.points, "mtd");
  return <div className="space-y-6">
    <Breadcrumbs prime={route.prime} allocation={selectedAllocation.label} />
    <PageHeader title={selectedAllocation.label} description={`${primeName(route.prime)} · venue ${selectedAllocation.venueId} · September 2026`} actions={<PageActions />} />
    <StatCard label="Latest MTD allocation revenue" value={usd(mtd?.mtd ?? null)} note={mtd ? `${mtd.date} UTC · provisional` : "No published allocation value"} />
    <RevenueChart lines={[{ key: "allocation", label: selectedAllocation.label, color: color(route.prime), points: selectedAllocation.points }]} />
    <DailyValues allocation={selectedAllocation} />
    <ReadNotice read={read} /><Methodology />
  </div>;
}
