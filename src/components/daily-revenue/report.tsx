import Link from "next/link";
import { Disclosure, EstimateDetails } from "./layout";
import { Badge } from "@/components/ui/badge";
import { Hint, Panel, StatCard, Swatch, DataTable, TableHeader, TableBody, TableRow, Th, Td } from "@/components/kit";
import { REVENUE_PUBLIC_URL } from "@/lib/daily-revenue/api";
import { utcStamp as utc, rangeLength, type DayRange } from "@/lib/daily-revenue/calendar";
import { publicationChanges } from "@/lib/daily-revenue/charts";
import { distributionExcluded, metrics, historyDays } from "@/lib/daily-revenue/domain";
import { addMoney, usd } from "@/lib/daily-revenue/decimal";
import { DAILY_PRIMES, primeName, type Attempt, type DailyPrime, type DailyRow, type Estimate, type Freshness, type History, type Latest, type ReadResult } from "@/lib/daily-revenue/types";
import { paths } from "@/lib/routes";

export function PrimeNavigation({ selected, range }: { selected?: DailyPrime; range: DayRange }) {
  return <nav aria-label="Daily revenue primes" className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-full bg-muted p-1">
    <Link href={paths.dailyRevenue(undefined, range.from.slice(0, 7))} aria-current={!selected ? "page" : undefined} className={`shrink-0 rounded-full px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring ${!selected ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-background/60 hover:text-foreground"}`}>All primes</Link>
    {DAILY_PRIMES.map((p) => <Link key={p} href={paths.dailyRevenue(p, range.from.slice(0, 7))} aria-current={selected === p ? "page" : undefined}
      className={`shrink-0 rounded-full px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring ${selected === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-background/60 hover:text-foreground"}`}>{primeName(p)}</Link>)}
  </nav>;
}
export function ScheduleNote() {
  return <Disclosure title="How to read these estimates">
    <p>Each observation can revise earlier estimates. Differences between observations are not necessarily that day’s earnings.</p>
    <p>Updated daily at 20:17 UTC through the previous completed UTC day. Reference-rate delays after weekends or holidays can hold back an update.</p>
    <p>Sky debt charge is reported per UTC day, so it can be summed over any range. Prime revenue is only published month to date. Final monthly amounts, their breakdown and per-venue detail are in Prime Agent Revenues.</p>
  </Disclosure>;
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
  return <Badge variant="secondary" title={freshness ? `Latest cutoff: ${cutoff ?? "unavailable"}. Expected: ${freshness.expected_cutoff} (UTC).` : undefined}>
    {cutoff === null ? "Unavailable" : freshness?.stale ? "Update delayed" : "Up to date"}
  </Badge>;
}
export function Provenance({ estimate }: { estimate: Estimate }) {
  const date = (value: string) => new Date(`${value}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  return <EstimateDetails title={`${primeName(estimate.prime)} · estimate details`} description={`Month-to-date through ${date(estimate.cutoff)}`}>
    <section className="space-y-3">
      <h3 className="font-medium">About this estimate</h3>
      <dl className="space-y-3 text-sm">
        <div><dt className="text-muted-foreground">Period covered</dt><dd className="mt-1">{date(`${estimate.cutoff.slice(0, 7)}-01`)} – {date(estimate.cutoff)} (UTC)</dd></div>
        <div><dt className="text-muted-foreground">Calculated on</dt><dd className="mt-1">{utc(estimate.computed_at)}</dd></div>
        <div><dt className="text-muted-foreground">Daily rows</dt><dd className="mt-1">{estimate.days.length ? `${estimate.days.length} UTC days` : "Not carried by this publication"}</dd></div>
      </dl>
      <p className="text-xs leading-relaxed text-muted-foreground">This is a running monthly estimate. It may change before the final monthly report. {distributionExcluded(estimate) ? "Monthly distribution rewards are excluded." : "This estimate includes reported distribution rewards."}</p>
    </section>
    <Disclosure title="Technical records">
      <p>These identifiers track the calculation and its source data. They are reference IDs, not amounts.</p>
      <dl className="space-y-4">
        {[
          ["Published estimate ID", estimate.revision_id],
          ["Calculation software version", estimate.code_version],
          ["Calculation settings version", estimate.configuration_version],
          ["Source data version", estimate.input_revision],
        ].map(([label, value]) => <div key={label}><dt className="font-medium text-foreground">{label}</dt><dd className="mt-1 break-all font-mono text-xs">{value}</dd></div>)}
      </dl>
      <details className="text-xs">
        <summary className="cursor-pointer rounded py-2 font-medium text-foreground focus-visible:outline-2 focus-visible:outline-ring">Raw inputs & full-precision amounts</summary>
        <p className="my-2">Unrounded values, blockchain reference blocks and rate sources used to reproduce this estimate.</p>
        <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-muted p-3">{JSON.stringify({ amounts: estimate.result, excluded_inputs: estimate.excluded_inputs, opening_blocks: estimate.opening_pins, closing_blocks: estimate.closing_pins, rate_sources: estimate.input_provenance }, null, 2)}</pre>
      </details>
      <a className="inline-block py-1 text-sm underline underline-offset-4" href={`${REVENUE_PUBLIC_URL}/v1/revenue/${estimate.prime}/at/${estimate.cutoff}?revision=${estimate.revision_id}`} target="_blank" rel="noreferrer">Open original data (JSON)</a>
    </Disclosure>
  </EstimateDetails>;
}
const columnHelp = {
  prime: "The prime agent. Select its name to open daily details for the same month.",
  revenue: "Revenue accrued from the start of the selected month to this publication. Includes supply-side revenue, agent rate and any reported distribution rewards, Chronicle Points and GAR. This is a running total in USD, not one day’s earnings.",
  sky: "Sky’s accrued revenue for the month: daily financing charges plus Sky Direct revenue, less sUSDS spread reimbursement. USD; not just the financing charge.",
  change: "Latest accrued prime revenue minus the previous UTC day’s published total. May include corrections to earlier days. A dash means there is no comparable previous-day publication in the same month.",
  cost: "Sum of available daily Sky financing charges in the selected month, in USD. This is not total Sky revenue and is not subtracted again from Prime revenue. A day count indicates incomplete coverage.",
  status: "Whether the latest data meets the API’s expected reporting date. Saved estimate means a previous response is shown after a fetch error; unavailable means no usable response.",
  cutoff: "The last UTC day included in this month-to-date estimate, not the time the report was published.",
  date: "The UTC day this row describes. Values come from the newest available publication for the month and may include revisions.",
  charge: "Sky’s financing charge for this UTC day, in USD. Read directly from daily_sky_rev; it excludes the separate Sky Direct revenue component.",
  debt: "Debt reported for this UTC day, in USD, from the API’s cum_debt field. This is a balance, not an amount to sum across days.",
  utilized: "The portion of debt treated as utilized by the calculation for this UTC day, in USD. Read directly from utilized; this is a balance, not revenue.",
  details: "Open the calculation date, included inputs and source record for this publication.",
};
function ColumnLabel({ label, help }: { label: string; help: keyof typeof columnHelp }) {
  return <span className="inline-flex items-center gap-1">{label}<Hint label={columnHelp[help]} /></span>;
}

export function HistoryTable({ history }: { history: History }) {
  return <Panel title="Published observations" description="Dates without a publication are omitted." flush>
    <DataTable containerClassName="max-h-[36rem]"><TableHeader><TableRow>
      <Th><ColumnLabel label="Through (UTC)" help="cutoff" /></Th><Th numeric><ColumnLabel label="Prime revenue (MTD)" help="revenue" /></Th><Th numeric><ColumnLabel label="Sky revenue (MTD)" help="sky" /></Th><Th><ColumnLabel label="Details" help="details" /></Th>
    </TableRow></TableHeader><TableBody>
      {historyDays(history).filter(({ estimate }) => estimate !== null).map(({ cutoff, estimate }) => <TableRow key={cutoff}>
        <Td className="whitespace-nowrap">{cutoff}</Td>
        <Td numeric>{estimate ? usd(metrics(estimate).prime) : "—"}</Td>
        <Td numeric>{estimate ? usd(estimate.result.sky_revenue) : "—"}</Td>
        <Td>{estimate ? <Provenance estimate={estimate} /> : <span className="text-muted-foreground">No published estimate</span>}</Td>
      </TableRow>)}
    </TableBody></DataTable>
  </Panel>;
}

export function PrimeTable({ rows, range, showStatus }: {
  showStatus: boolean;
  range: DayRange;
  rows: { prime: DailyPrime; observations: History; changes: History; days: DailyRow[]; read: ReadResult<Latest>; freshness: Freshness | null }[];
}) {
  const totals = rows.map(({ days }) => days.length ? addMoney(days.map((d) => d.charge)) : null);
  const latest = rows.map(({ observations }) => [...observations.results].sort((a, b) => b.cutoff.localeCompare(a.cutoff))[0]);
  return <Panel title="By prime" flush>
    <DataTable><TableHeader><TableRow>
      <Th><ColumnLabel label="Prime" help="prime" /></Th><Th numeric><ColumnLabel label="Prime revenue (MTD)" help="revenue" /></Th><Th numeric><ColumnLabel label="Change vs previous day" help="change" /></Th><Th numeric><ColumnLabel label="Financing cost" help="cost" /></Th>{showStatus && <Th><ColumnLabel label="Status" help="status" /></Th>}
    </TableRow></TableHeader><TableBody>
      {rows.map(({ prime, changes, days, read, freshness }, i) => {
        const last = latest[i];
        const change = last ? publicationChanges(changes).find((r) => r.cutoff === last.cutoff)?.exact : null;
        return <TableRow key={prime}>
          <Td><Link className="inline-flex items-center gap-2 py-2 font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring" href={paths.dailyRevenue(prime, range.from.slice(0, 7))}><Swatch color={`var(--group-${prime})`} />{primeName(prime)}<span aria-hidden className="text-muted-foreground">→</span></Link></Td>
          <Td numeric><span className="font-medium">{usd(last ? metrics(last).prime : null)}</span></Td>
          <Td numeric>{usd(change?.prime ?? null)}</Td>
          <Td numeric>{usd(totals[i])}{days.length < rangeLength(range) && <span className="block text-xs text-muted-foreground">{days.length}/{rangeLength(range)} days</span>}</Td>
          {showStatus && <Td>{read.error ? <Badge variant="secondary">{read.data ? "Saved estimate" : "Unavailable"}</Badge> : <FreshnessStatus freshness={freshness} />}</Td>}
        </TableRow>;
      })}
    </TableBody></DataTable>
  </Panel>;
}

export function AccruedSnapshot({ history, changes }: { history: History; changes: History }) {
  const estimate = [...history.results].sort((a, b) => b.cutoff.localeCompare(a.cutoff))[0];
  if (!estimate) return <Panel title="No publications in this month"><p className="text-sm text-muted-foreground">Daily financing costs may still be available below.</p></Panel>;
  const m = metrics(estimate);
  const change = publicationChanges(changes).find((r) => r.cutoff === estimate.cutoff)?.exact;
  const signed = (value: string) => `${Number(value) > 0 ? "+" : ""}${usd(value)}`;
  return <section aria-label="Latest accrued revenue" className="space-y-3">
    <div className="grid gap-4 sm:grid-cols-2">
      <StatCard label="Prime revenue (MTD)" value={usd(m.prime)} note={change ? `${signed(change.prime)} since previous publication` : "No previous-day publication to compare"} />
      <StatCard label="Sky revenue (MTD)" value={usd(m.sky)} note={change ? `${signed(change.sky)} since previous publication` : undefined} />
    </div>
  </section>;
}

export function DailyDataTable({ days }: { days: DailyRow[] }) {
  return <Panel title="Daily financing data" description="Latest published daily values · USD · UTC" flush>
    <DataTable><TableHeader><TableRow><Th><ColumnLabel label="Date" help="date" /></Th><Th numeric><ColumnLabel label="Financing cost (daily)" help="charge" /></Th><Th numeric><ColumnLabel label="Debt" help="debt" /></Th><Th numeric><ColumnLabel label="Utilized debt" help="utilized" /></Th></TableRow></TableHeader>
      <TableBody>{days.length ? [...days].reverse().map((day) => <TableRow key={day.date}>
        <Td>{day.date}</Td><Td numeric>{usd(day.charge)}</Td><Td numeric>{usd(day.debt)}</Td><Td numeric>{usd(day.utilized)}</Td>
      </TableRow>) : <TableRow><Td colSpan={4}>No daily data published for this month.</Td></TableRow>}</TableBody>
    </DataTable>
  </Panel>;
}
