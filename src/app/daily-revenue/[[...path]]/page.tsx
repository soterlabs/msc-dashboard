import { notFound, redirect } from "next/navigation";
import { PageHeader, Panel } from "@/components/kit";
import { DailyMonthPicker } from "@/components/daily-revenue/month-picker";
import { DebtChart, PublicationChanges, PrimeRevenueTrend, RatesChart, SkyChargeChart } from "@/components/daily-revenue/charts";
import { AccruedSnapshot, AttemptStatus, FreshnessStatus, DailyDataTable, HistoryTable, PrimeNavigation, PrimeTable, Provenance, ReadNotice, ScheduleNote } from "@/components/daily-revenue/report";
import { Disclosure, RevenueViews } from "@/components/daily-revenue/layout";
import { FLAGS } from "@/lib/flags";
import { paths } from "@/lib/routes";
import { revenueClient } from "@/lib/daily-revenue/api";
import { addDays, monthWindow, validMonth, yesterday } from "@/lib/daily-revenue/calendar";
import { mergeHistory, rangeDays } from "@/lib/daily-revenue/domain";
import { DAILY_PRIMES, isDailyPrime, primeName, type DailyPrime, type Estimate, type History } from "@/lib/daily-revenue/types";

export const dynamic = "force-dynamic";

export default async function Page({ params, searchParams }: { params: Promise<{ path?: string[] }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  // Flag off means no API reads and no report payload, not merely a hidden link.
  if (!FLAGS.dailyRevenue) notFound();
  const [prime, month, ...rest] = (await params).path ?? [];
  const query = await searchParams;
  const now = new Date();
  const client = revenueClient;
  if (rest.length || (prime !== undefined && !isDailyPrime(prime))) notFound();
  if (month !== undefined) {
    const window = validMonth(month) ? monthWindow(month, now) : null;
    if (!window) notFound();
    redirect(paths.dailyRevenue(prime, month));
  }

  const primes: DailyPrime[] = prime && isDailyPrime(prime) ? [prime] : [...DAILY_PRIMES];
  const [latest, status] = await Promise.all([Promise.all(primes.map((p) => client.latest(p))), client.status()]);
  const max = yesterday(now);
  const newest = latest.map((read) => read.data?.data.cutoff).filter((c): c is string => Boolean(c)).sort().at(-1) ?? max;
  const selectedMonth = typeof query.month === "string" && validMonth(query.month) ? query.month : newest.slice(0, 7);
  const window = monthWindow(selectedMonth, now);
  if (!window) notFound();
  const range = { from: window.start, to: window.end };
  const fetchFrom = range.from;
  const [histories, availability] = await Promise.all([
    Promise.all(primes.map((p) => client.history(p, range.from, range.to))),
    Promise.all(primes.map((p) => client.history(p, addDays(newest, -89), newest))),
  ]);
  const availableMonths = [...new Set([
    ...latest.flatMap((r) => r.data ? [r.data.data.cutoff.slice(0, 7)] : []),
    ...[...histories, ...availability].flatMap((r) => r.data?.results.map((e) => e.cutoff.slice(0, 7)) ?? []),
  ])].sort().reverse();

  const reports = primes.map((p, i) => {
    const current = latest[i].data?.data ?? null;
    const merged = mergeHistory(histories[i].data, current);
    const estimates: Estimate[] = merged?.results.some((e) => e.cutoff === current?.cutoff) || !current ? merged?.results ?? [] : [...(merged?.results ?? []), current];
    const observations: History = { start: range.from, end: range.to, results: estimates.filter((e) => e.cutoff >= range.from && e.cutoff <= range.to) };
    return { prime: p, changes: { ...observations, results: estimates.filter((e) => e.cutoff >= fetchFrom && e.cutoff <= range.to) }, read: latest[i], history: histories[i], days: rangeDays(estimates, range), observations,
      freshness: latest[i].data?.freshness ?? status.data?.[p] ?? null };
  });
  const allDays = reports.flatMap((r) => r.days);
  const hasReadError = Boolean(status.error || reports.some((r) => r.read.error || r.history.error));
  const filters = <div className="flex flex-wrap items-center justify-between gap-4">
    <PrimeNavigation selected={prime && isDailyPrime(prime) ? prime : undefined} range={range} />
    <DailyMonthPicker prime={prime && isDailyPrime(prime) ? prime : undefined} month={selectedMonth} availableMonths={availableMonths} />
  </div>;
  const readError = hasReadError && <div role="status" className="rounded-xl bg-muted px-4 py-3 text-sm">
    Some data could not be loaded. {allDays.length ? "Showing the available published data." : "Try another month or check back later."} See data sources for details.
  </div>;

  if (!prime || !isDailyPrime(prime)) {
    const firstFreshness = reports[0].freshness;
    const sharedStatus = Boolean(firstFreshness && reports.every((r) => r.read.data && !r.read.error && r.freshness?.stale === firstFreshness.stale));
    return <div className="space-y-6">
      <PageHeader title="MSC revenue" />
      {filters}
        {readError}
      <SkyChargeChart series={reports.map((r) => ({ key: r.prime, days: r.days }))} range={range} />
      <PrimeTable rows={reports} range={range} showStatus={!sharedStatus} />
      <ScheduleNote />
      <Disclosure title="Data availability & sources">
        <ReadNotice read={status} />
        {reports.map((r) => <div key={r.prime} className="space-y-2 border-t pt-3">
          <p className="font-medium text-foreground">{primeName(r.prime)}</p>
          <ReadNotice read={r.read} />
          {r.history.error && <ReadNotice read={r.history} />}
          <AttemptStatus attempt={status.data?.[r.prime]?.latest_attempt ?? r.read.data?.latest_attempt ?? null} />
          {r.read.data && <Provenance estimate={r.read.data.data} />}
        </div>)}
      </Disclosure>
    </div>;
  }

  const [report] = reports;
  const estimate = report.read.data?.data ?? null;
  return <div className="space-y-6">
    <PageHeader title={`${primeName(prime)} revenue`} />
    {filters}
    {readError}
    <RevenueViews
      overview={<>
        <AccruedSnapshot history={report.observations} changes={report.changes} />
        <PrimeRevenueTrend history={report.observations} prime={prime} />
        <PublicationChanges history={report.changes} prime={prime} />
        <SkyChargeChart series={[{ key: prime, days: report.days }]} range={range} />
        {report.days.length > 0 && <Disclosure title="What drives financing costs?">
          <div className="grid gap-6 lg:grid-cols-2">
            <DebtChart days={report.days} prime={prime} />
            <RatesChart days={report.days} prime={prime} />
          </div>
        </Disclosure>}
      </>}
      history={<><DailyDataTable days={report.days} />{report.observations.results.length ? <HistoryTable history={report.observations} /> : <Panel title="No publications in this month" description="Observations will appear here as they become available."><p className="text-sm text-muted-foreground">Each publication records the month-to-date estimate.</p></Panel>}</>}
      sources={<>
        <ScheduleNote />
        <Panel title="Latest publication" action={<FreshnessStatus freshness={report.freshness} />} description={`Through ${report.freshness?.actual_cutoff ?? "—"} · expected ${report.freshness?.expected_cutoff ?? "—"} (UTC)`}>
          <div className="space-y-3">
            <AttemptStatus attempt={status.data?.[prime]?.latest_attempt ?? report.read.data?.latest_attempt ?? null} />
            <ReadNotice read={report.read} />
            {report.history.error && <ReadNotice read={report.history} />}
            {status.error && <ReadNotice read={status} />}
            {estimate && <Provenance estimate={estimate} />}
          </div>
        </Panel>
      </>}
    />
  </div>;
}
