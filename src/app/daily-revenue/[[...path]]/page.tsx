import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Panel } from "@/components/kit";
import { DailyMonthPicker } from "@/components/daily-revenue/month-picker";
import { PrimeComparison, RevenueComponents, RevenueTrend } from "@/components/daily-revenue/charts";
import { AttemptStatus, EstimateMetrics, EstimatePanel, FreshnessStatus, HistoryTable, PrimeNavigation, Provenance, ReadNotice, ScheduleNote, SettledPanel } from "@/components/daily-revenue/report";
import { FLAGS } from "@/lib/flags";
import { paths } from "@/lib/routes";
import { loadSsr } from "@/lib/load";
import { revenueClient } from "@/lib/daily-revenue/api";
import { monthWindow, utcStamp, validMonth } from "@/lib/daily-revenue/calendar";
import { distributionNote, mergeHistory, selectedEstimate } from "@/lib/daily-revenue/domain";
import { DAILY_PRIMES, isDailyPrime, primeName, type History, type ReadResult } from "@/lib/daily-revenue/types";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ path?: string[] }> }) {
  // Flag off means no API reads and no report payload, not merely a hidden link.
  if (!FLAGS.dailyRevenue) notFound();
  const path = (await params).path ?? [];
  const [prime, month, ...rest] = path;
  const now = new Date();
  if (rest.length || (prime !== undefined && !isDailyPrime(prime)) || (month !== undefined && (!validMonth(month) || month > now.toISOString().slice(0, 7)))) notFound();
  const ssr = loadSsr();
  const settledFor = (p: string, selectedMonth?: string) => {
    const reports = ssr.reports.filter((r) => r.partner === p).sort((a, b) => b.month.localeCompare(a.month));
    return reports.find((r) => r.month === selectedMonth) ?? reports[0];
  };
  if (!prime) {
    const [latest, status] = await Promise.all([
      Promise.all(DAILY_PRIMES.map(async (p) => ({ prime: p, read: await revenueClient.latest(p) }))),
      revenueClient.status(),
    ]);
    return <div className="space-y-6">
      <PageHeader title="Daily MSC Revenue" description="Provisional revenue estimates by prime agent" />
      <PrimeNavigation /><ScheduleNote />
      <ReadNotice read={status} />
      <PrimeComparison estimates={latest.flatMap(({ read }) => read.data ? [read.data.data] : [])} />
      <div className="grid gap-6 @4xl/main:grid-cols-2">
        {latest.map(({ prime: p, read }) => <Panel key={p} title={<Link className="underline-offset-4 hover:underline" href={paths.dailyRevenue(p)}>{primeName(p)}</Link>}
          description={read.data ? `Provisional MTD estimate through ${read.data.data.cutoff} (UTC)` : "Daily estimate unavailable"}>
          <div className="space-y-4">
            <FreshnessStatus freshness={read.data?.freshness ?? status.data?.[p] ?? null} />
            <AttemptStatus attempt={status.data?.[p]?.latest_attempt ?? read.data?.latest_attempt ?? null} />
            <ReadNotice read={read} />
            {read.data ? <><EstimateMetrics estimate={read.data.data} /><p className="text-xs text-muted-foreground">Computed {utcStamp(read.data.data.computed_at)} · {distributionNote(read.data.data)}</p><Provenance estimate={read.data.data} /></>
              : <SettledPanel report={settledFor(p)} />}
            <Link href={paths.dailyRevenue(p)} className="text-sm underline">View {primeName(p)}’s daily observations</Link>
          </div>
        </Panel>)}
      </div>
    </div>;
  }
  // Narrow after route validation; each API failure is contained to its source.
  if (!isDailyPrime(prime)) notFound();
  const [latest, status] = await Promise.all([revenueClient.latest(prime), revenueClient.status()]);
  const selectedMonth = month ?? latest.data?.data.cutoff.slice(0, 7) ?? now.toISOString().slice(0, 7);
  const window = monthWindow(selectedMonth, now);
  const history: ReadResult<History> = window ? await revenueClient.history(prime, window.start, window.end)
    : { data: null, source: "missing", verifiedAt: null, error: "This month has no completed UTC days yet." };
  const observations = mergeHistory(history.data, latest.data?.data ?? null);
  const estimate = selectedEstimate(selectedMonth, observations, latest.data?.data ?? null);
  const settled = settledFor(prime, selectedMonth);
  return <div className="space-y-6">
    <PageHeader title={`Daily MSC Revenue: ${primeName(prime)}`} description="Provisional MTD estimates and canonical settled reports" />
    <PrimeNavigation selected={prime} /><ScheduleNote />
    <DailyMonthPicker prime={prime} month={selectedMonth} max={now.toISOString().slice(0, 7)} />
    <div className="space-y-2 rounded-xl bg-muted/40 p-4">
      <FreshnessStatus freshness={latest.data?.freshness ?? status.data?.[prime] ?? null} />
      <AttemptStatus attempt={status.data?.[prime]?.latest_attempt ?? latest.data?.latest_attempt ?? null} />
      <ReadNotice read={latest} />
      {status.error && <ReadNotice read={status} />}
      {latest.data && !latest.data.data.cutoff.startsWith(selectedMonth) && <Link className="text-sm underline" href={paths.dailyRevenue(prime, latest.data.data.cutoff.slice(0, 7))}>Latest estimate belongs to {latest.data.data.cutoff.slice(0, 7)}</Link>}
    </div>
    <ReadNotice read={history} />
    {estimate ? <EstimatePanel estimate={estimate} /> : <Panel title="No published estimate for this month"><p className="text-sm text-muted-foreground">Missing observations are unavailable, not zero revenue. Use the separately dated settled report when available.</p></Panel>}
    <div className="grid gap-6 @5xl/main:grid-cols-2">
      {observations && <RevenueTrend history={observations} />}
      {estimate && <RevenueComponents estimate={estimate} />}
    </div>
    <SettledPanel report={settled} selectedMonth={selectedMonth} />
    {observations && <HistoryTable history={observations} />}
  </div>;
}
