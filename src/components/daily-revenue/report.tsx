import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Panel, DataTable, TableHeader, TableBody, TableRow, Th, Td } from "@/components/kit";
import { REVENUE_PUBLIC_URL } from "@/lib/daily-revenue/api";
import { utcStamp as utc } from "@/lib/daily-revenue/calendar";
import { distributionExcluded, distributionNote, metrics, historyDays } from "@/lib/daily-revenue/domain";
import { usd } from "@/lib/daily-revenue/decimal";
import { DAILY_PRIMES, primeName, type Attempt, type DailyPrime, type Estimate, type Freshness, type History, type ReadResult } from "@/lib/daily-revenue/types";
import { paths } from "@/lib/routes";
import { formatUSD2, monthLong } from "@/lib/format";
import type { SsrReport } from "@/lib/ssr/types";

export function PrimeNavigation({ selected }: { selected?: DailyPrime }) {
  return <nav aria-label="Daily revenue primes" className="flex flex-wrap gap-2">
    <Link href={paths.dailyRevenue()} aria-current={!selected ? "page" : undefined} className={`rounded-full px-4 py-2 text-sm ${!selected ? "bg-primary text-primary-foreground" : "bg-muted"}`}>All primes</Link>
    {DAILY_PRIMES.map((p) => <Link key={p} href={paths.dailyRevenue(p)} aria-current={selected === p ? "page" : undefined}
      className={`rounded-full px-4 py-2 text-sm ${selected === p ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{primeName(p)}</Link>)}
  </nav>;
}
export function ScheduleNote() {
  return <p className="max-w-5xl text-sm text-muted-foreground">
    Updated daily at 20:17 UTC through the previous completed UTC day. These are provisional month-to-date (MTD) estimates, not daily earnings.
    Monthly distribution rewards are excluded from the daily inputs, and each estimate is captioned with what its own response carries.
    Before the scheduled update, or while official reference rates are pending after weekends or holidays, a retained cutoff may be behind
    the expected one without a failed scheduled run.
  </p>;
}
export function ReadNotice({ read }: { read: Pick<ReadResult<unknown>, "source" | "verifiedAt" | "error"> }) {
  return <div className="space-y-1 text-xs text-muted-foreground">
    {read.error && <p role="status">{read.error}</p>}
    {read.verifiedAt && <p>{read.source === "cache" ? "Cached API response" : "API response"} · last verified {utc(read.verifiedAt)}</p>}
  </div>;
}
export function AttemptStatus({ attempt }: { attempt: Attempt | null }) {
  if (!attempt) return <p className="text-xs text-muted-foreground">No attempt information available.</p>;
  return <p className="text-xs text-muted-foreground">Last known attempt: {attempt.status} · cutoff {attempt.cutoff} · started {utc(attempt.started_at)}
    {attempt.finished_at ? ` · finished ${utc(attempt.finished_at)}` : ""}{attempt.error_type ? ` · ${attempt.error_type}` : ""}.
    {attempt.status === "failed" || attempt.status === "abandoned" ? " The last successful estimate is retained." : ""}
  </p>;
}
/** Staleness is the API's own judgement, not a comparison against yesterday:
 * the day's estimate publishes at 20:17 UTC, so for most of a healthy day the
 * newest published cutoff is two days back and behind nothing. */
export function FreshnessStatus({ freshness }: { freshness: Freshness | null }) {
  const cutoff = freshness?.actual_cutoff ?? null;
  return <div className="flex flex-wrap items-center gap-2 text-xs">
    <Badge variant="secondary">{cutoff === null ? "No estimate available" : freshness?.stale ? "Behind expected cutoff" : "Current cutoff"}</Badge>
    <span>Latest publication: {cutoff ?? "—"} · expected {freshness?.expected_cutoff ?? "—"} (UTC)</span>
  </div>;
}
function Metric({ label, value, exact }: { label: string; value: string; exact?: string }) {
  return <div><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 text-lg font-semibold tabular-nums" title={exact}>{value}</dd></div>;
}
export function EstimateMetrics({ estimate }: { estimate: Estimate }) {
  const m = metrics(estimate);
  return <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 @3xl/main:grid-cols-4">
    <Metric label="Prime total · MTD" value={usd(m.prime)} exact={m.prime} />
    <Metric label="Demand-side revenue · MTD" value={usd(m.demand)} exact={m.demand} />
    <Metric label="Supply-side revenue · MTD" value={usd(m.supply)} exact={m.supply} />
    <Metric label="Sky revenue · MTD" value={usd(m.sky)} exact={m.sky} />
  </dl>;
}
export function Provenance({ estimate }: { estimate: Estimate }) {
  const r = estimate.result;
  return <details className="text-xs">
    <summary className="cursor-pointer font-medium">Provenance and components</summary>
    <div className="mt-3 space-y-3 break-words text-muted-foreground">
      <dl className="grid gap-2 sm:grid-cols-2">
        <div><dt>Revision</dt><dd className="break-all font-mono">{estimate.revision_id}</dd></div>
        <div><dt>Cutoff / computation</dt><dd>{estimate.cutoff} / {utc(estimate.computed_at)}</dd></div>
        <div><dt>Code version</dt><dd className="break-all font-mono">{estimate.code_version}</dd></div>
        <div><dt>Configuration version</dt><dd className="break-all font-mono">{estimate.configuration_version}</dd></div>
        <div><dt>Input revision</dt><dd className="break-all font-mono">{estimate.input_revision}</dd></div>
        <div><dt>Excluded inputs</dt><dd>{estimate.excluded_inputs.join(", ") || "None reported"}</dd></div>
      </dl>
      <p>Prime total = supply-side revenue + agent rate + distribution rewards + Chronicle Points + GAR. External venue rewards are already included in supply-side revenue.</p>
      <dl className="grid gap-2 sm:grid-cols-2">
        {[["Agent rate", r.agent_rate], [`Distribution rewards (${distributionExcluded(estimate) ? "excluded monthly input" : "included in the prime total"})`, r.distribution_rewards], ["Chronicle Points", r.chronicle_points], ["GAR", r.gar], ["Net P&L (audit metric, not prime total)", r.monthly_pnl]].map(([label, value]) =>
          <div key={label}><dt>{label}</dt><dd title={value} className="tabular-nums">{usd(value)} <span className="break-all font-mono">(exact: {value})</span></dd></div>)}
      </dl>
      <details><summary className="cursor-pointer">Block pins and reference-rate provenance</summary>
        <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-muted p-3">{JSON.stringify({ opening_pins: estimate.opening_pins, closing_pins: estimate.closing_pins, input_provenance: estimate.input_provenance }, null, 2)}</pre>
      </details>
      <a className="underline" href={`${REVENUE_PUBLIC_URL}/v1/revenue/${estimate.prime}/at/${estimate.cutoff}?revision=${estimate.revision_id}`} target="_blank" rel="noreferrer">Read this exact published revision</a>
    </div>
  </details>;
}
export function EstimatePanel({ estimate }: { estimate: Estimate }) {
  return <Panel title={`Provisional MTD estimate through ${estimate.cutoff} (UTC)`} description={`Computed ${utc(estimate.computed_at)} · ${distributionNote(estimate)}`}>
    <div className="space-y-5"><EstimateMetrics estimate={estimate} /><Provenance estimate={estimate} /></div>
  </Panel>;
}
export function SettledPanel({ report, selectedMonth }: { report: SsrReport | undefined; selectedMonth?: string }) {
  if (!report) return <p className="text-sm text-muted-foreground">No canonical settled report is available{selectedMonth ? ` for ${monthLong(selectedMonth)}` : " for this prime"}.</p>;
  const selected = !selectedMonth || report.month === selectedMonth;
  return <Panel title={selected ? "Canonical settled report" : "Latest available settled report"}
    description={`${monthLong(report.month)} · committed settlement snapshot${selected ? " · authoritative for this month" : " · a different reporting month"}`}>
    <div className="space-y-4"><dl className="grid grid-cols-2 gap-4">
      <Metric label="Settled prime agent profit" value={formatUSD2(report.headline.primeAgentProfit)} />
      <Metric label="Settled Sky revenue" value={formatUSD2(report.headline.skyRevenue)} />
    </dl><Link className="text-sm underline" href={paths.ssrPartner(report.partner, report.month)}>Open {primeName(report.partner)}’s settled report</Link></div>
  </Panel>;
}
export function HistoryTable({ history }: { history: History }) {
  return <Panel title="Daily MTD observations" description="Each row is a cumulative month-to-date estimate. Do not sum rows. Changes can include revisions to earlier days and are not necessarily that day’s earnings." flush>
    <DataTable containerClassName="max-h-[36rem]"><TableHeader><TableRow>
      <Th>Cutoff (UTC)</Th><Th numeric>Prime total · MTD</Th><Th numeric>Sky revenue · MTD</Th><Th>Publication</Th>
    </TableRow></TableHeader><TableBody>
      {historyDays(history).map(({ cutoff, estimate }) => <TableRow key={cutoff}>
        <Td className="whitespace-nowrap">{cutoff}</Td>
        <Td numeric>{estimate ? usd(metrics(estimate).prime) : "—"}</Td>
        <Td numeric>{estimate ? usd(estimate.result.sky_revenue) : "—"}</Td>
        <Td>{estimate ? <Provenance estimate={estimate} /> : <span className="text-muted-foreground">No published estimate</span>}</Td>
      </TableRow>)}
    </TableBody></DataTable>
  </Panel>;
}
