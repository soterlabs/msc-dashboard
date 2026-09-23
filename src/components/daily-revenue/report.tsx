import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DataTable, Panel, TableBody, TableHeader, TableRow, Td, Th } from "@/components/kit";
import { paths } from "@/lib/routes";
import { latestValue } from "@/lib/daily-revenue/domain";
import { compareMoney, usd } from "@/lib/daily-revenue/decimal";
import { primeName, SEPTEMBER_MONTH, type AllocationSeries, type DailyPrime, type PrimeSeries, type ReadResult, type RevenuePoint } from "@/lib/daily-revenue/types";
import { CopyLink } from "./copy-link";

function LinkAffordance({ className = "" }: { className?: string }) {
  return <svg aria-hidden className={className} fill="none" viewBox="0 0 24 24">
    <path d="M8 16 16 8M9 8h7v7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
  </svg>;
}

export function Breadcrumbs({ prime, allocation }: { prime?: DailyPrime; allocation?: string }) {
  return <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
    <Link className="hover:text-foreground hover:underline" href={paths.dailyRevenue()}>Daily Revenue</Link>
    {prime && <><span aria-hidden>/</span><Link className="hover:text-foreground hover:underline" href={paths.dailyRevenue(SEPTEMBER_MONTH, prime)}>{primeName(prime)}</Link></>}
    {allocation && <><span aria-hidden>/</span><span className="text-foreground">{allocation}</span></>}
  </nav>;
}
export function Methodology() {
  return <details className="rounded-xl bg-muted/50 p-4 text-sm">
    <summary className="cursor-pointer font-medium">Methodology and availability</summary>
    <div className="mt-3 max-w-4xl space-y-2 text-muted-foreground">
      <p>Supply-side allocation revenue is each allocation’s <code>revenue</code>: the amount attributable to the prime after SDE sharing, including external allocation income, and before prime-level borrowing costs. External revenue is not added again.</p>
      <p>Daily values are changes between consecutive provisional month-to-date snapshots. September 1 uses a zero opening baseline. Missing snapshots or allocation rows remain gaps; changes can include revisions to earlier days.</p>
    </div>
  </details>;
}
export function PageActions() { return <CopyLink />; }
export function ReadNotice({ read }: { read: Pick<ReadResult<unknown>, "source" | "verifiedAt" | "error"> }) {
  if (!read.error && !read.verifiedAt) return null;
  return <div role={read.error ? "status" : undefined} className="text-xs text-muted-foreground">
    {read.error && <p>{read.error}</p>}
    {read.verifiedAt && <p>{read.source === "cache" ? "Retained API response" : "API response"} verified {new Date(read.verifiedAt).toISOString().slice(0, 19).replace("T", " ")} UTC.</p>}
  </div>;
}
export function Unavailable({ read }: { read: ReadResult<unknown> }) {
  return <Panel title="Allocation data unavailable" description="September data could not be established from the live API."><ReadNotice read={read} /><p className="mt-2 text-sm text-muted-foreground">No settlement snapshot or fixture is substituted for missing daily allocation data.</p></Panel>;
}
const value = (points: RevenuePoint[], key: "mtd" | "daily") => latestValue(points, key);
export function PrimeAgentLauncher({ rows }: { rows: { series: PrimeSeries | null; read: ReadResult<unknown>; prime: DailyPrime }[] }) {
  return <section aria-labelledby="choose-prime" className="space-y-4">
    <div className="space-y-1"><h2 id="choose-prime" className="text-xl font-semibold">Choose a prime agent</h2>
      <p className="text-sm text-muted-foreground">Open its September daily revenue and allocation breakdown.</p></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{rows.map(({ prime, series, read }) => {
      const mtd = series ? value(series.points, "mtd") : null;
      return <Link key={prime} href={paths.dailyRevenue(SEPTEMBER_MONTH, prime)}
        className="group flex min-h-28 items-center justify-between gap-4 rounded-xl bg-card p-5 shadow-sm ring-1 ring-border transition-[background-color,box-shadow] hover:bg-muted/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <span className="min-w-0 space-y-2"><span className="block text-lg font-semibold">{primeName(prime)}</span>
          <span className="block text-sm text-muted-foreground"><span className="font-medium tabular-nums text-foreground">{usd(mtd?.mtd ?? null)}</span> MTD
            <span className="block">{mtd ? `through ${mtd.date} UTC · ${series?.allocations.length ?? 0} allocations` : "Allocation data unavailable"}{read.source === "cache" && <Badge className="ml-2" variant="secondary">cached</Badge>}</span>
          </span></span>
        <LinkAffordance className="size-5 shrink-0 text-muted-foreground opacity-100 transition-[color,opacity,transform] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground group-focus-visible:text-foreground md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100" />
      </Link>;
    })}</div>
  </section>;
}
export function AllocationTable({ series }: { series: PrimeSeries }) {
  const sorted = [...series.allocations].sort((a, b) => {
    const av = value(a.points, "mtd")?.mtd, bv = value(b.points, "mtd")?.mtd;
    if (av === null || av === undefined) return 1;
    if (bv === null || bv === undefined) return -1;
    return compareMoney(bv, av) || a.label.localeCompare(b.label);
  });
  return <>
    <Panel title="September allocations" description="Revenue allocations remain listed if they close later in the month." flush>
      <div className="divide-y md:hidden">{sorted.map((allocation) => {
        const mtd = value(allocation.points, "mtd"), daily = value(allocation.points, "daily");
        return <Link key={allocation.venueId} href={paths.dailyRevenue(SEPTEMBER_MONTH, series.prime, allocation.venueId)}
          className="group block space-y-3 px-6 py-4 transition-colors hover:bg-muted/70 focus-visible:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
          <span className="flex items-start justify-between gap-3"><span className="min-w-0 break-words font-medium group-hover:underline">{allocation.label}</span>
            <LinkAffordance className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-[color,transform] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" /></span>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="min-w-0"><dt className="text-muted-foreground">Venue ID</dt><dd className="break-all font-mono">{allocation.venueId}</dd></div>
            <div><dt className="text-muted-foreground">As of</dt><dd>{mtd?.date ?? "Unavailable"}</dd></div>
            <div><dt className="text-muted-foreground">MTD revenue</dt><dd className="font-medium tabular-nums">{usd(mtd?.mtd ?? null)}</dd></div>
            <div><dt className="text-muted-foreground">Latest daily change</dt><dd className="font-medium tabular-nums">{usd(daily?.daily ?? null)}</dd></div>
          </dl>
        </Link>;
      })}</div>
      <DataTable containerClassName="hidden md:block"><TableHeader><TableRow><Th>Allocation</Th><Th>Venue ID</Th><Th numeric>MTD revenue</Th><Th numeric>Latest daily change</Th><Th>As of</Th></TableRow></TableHeader>
        <TableBody>{sorted.map((allocation) => {
          const mtd = value(allocation.points, "mtd"), daily = value(allocation.points, "daily");
          return <TableRow className="group relative cursor-pointer hover:bg-muted/70" key={allocation.venueId}><Td><Link
            className="inline-flex items-center gap-1.5 font-medium after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-ring group-hover:underline"
            href={paths.dailyRevenue(SEPTEMBER_MONTH, series.prime, allocation.venueId)}>
            {allocation.label}<LinkAffordance className="size-4 shrink-0 text-muted-foreground opacity-0 transition-[color,opacity,transform] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground group-hover:opacity-100 group-focus-within:text-foreground group-focus-within:opacity-100" />
          </Link></Td>
            <Td className="font-mono">{allocation.venueId}</Td><Td numeric>{usd(mtd?.mtd ?? null)}</Td><Td numeric>{usd(daily?.daily ?? null)}</Td><Td>{mtd?.date ?? "Unavailable"}</Td></TableRow>;
        })}</TableBody></DataTable>
    </Panel>
    {series.hidden.length > 0 && <details className="rounded-xl bg-muted/50 p-4 text-sm"><summary className="cursor-pointer font-medium">Position tracking only — revenue not displayed ({series.hidden.length})</summary>
      <ul className="mt-3 space-y-1 text-muted-foreground">{series.hidden.map((a) => <li key={a.venueId}>{a.label} <span className="font-mono">{a.venueId}</span></li>)}</ul></details>}
  </>;
}
export function DailyValues({ allocation }: { allocation: AllocationSeries }) {
  return <Panel title="Daily values" description="Accessible table alternative to the chart. Missing values are unavailable, not zero." flush>
    <DataTable containerClassName="max-h-[36rem]"><TableHeader><TableRow><Th>Date (UTC)</Th><Th numeric>Daily change</Th><Th numeric>MTD revenue</Th></TableRow></TableHeader>
      <TableBody>{allocation.points.map((p) => <TableRow key={p.date}><Td>{p.date}</Td><Td numeric title={p.daily ?? undefined}>{usd(p.daily)}</Td><Td numeric title={p.mtd ?? undefined}>{usd(p.mtd)}</Td></TableRow>)}</TableBody></DataTable>
  </Panel>;
}
