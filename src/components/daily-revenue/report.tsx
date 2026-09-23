import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DataTable, Panel, TableBody, TableHeader, TableRow, Td, Th } from "@/components/kit";
import { paths } from "@/lib/routes";
import { latestValue } from "@/lib/daily-revenue/domain";
import { usd } from "@/lib/daily-revenue/decimal";
import { primeName, SEPTEMBER_MONTH, type AllocationSeries, type DailyPrime, type PrimeSeries, type ReadResult, type RevenuePoint } from "@/lib/daily-revenue/types";
import { CopyLink } from "./copy-link";

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
export function PrimeTable({ rows }: { rows: { series: PrimeSeries | null; read: ReadResult<unknown>; prime: DailyPrime }[] }) {
  return <Panel title="Prime agents" description="Each row uses that prime’s latest available September observation; dates can differ." flush>
    <DataTable><TableHeader><TableRow><Th>Prime</Th><Th numeric>MTD allocation revenue</Th><Th numeric>Latest daily change</Th><Th>Coverage / as of</Th></TableRow></TableHeader>
      <TableBody>{rows.map(({ prime, series, read }) => {
        const mtd = series ? value(series.points, "mtd") : null, daily = series ? value(series.points, "daily") : null;
        return <TableRow key={prime}><Td><Link className="font-medium hover:underline" href={paths.dailyRevenue(SEPTEMBER_MONTH, prime)}>{primeName(prime)}</Link></Td>
          <Td numeric>{usd(mtd?.mtd ?? null)}</Td><Td numeric>{usd(daily?.daily ?? null)}</Td>
          <Td><span className="text-sm">{mtd?.date ?? "Unavailable"}{series ? ` · ${series.allocations.length} allocations` : ""}</span>{read.source === "cache" && <Badge className="ml-2" variant="secondary">cached</Badge>}</Td></TableRow>;
      })}</TableBody></DataTable>
  </Panel>;
}
export function AllocationTable({ series }: { series: PrimeSeries }) {
  const sorted = [...series.allocations].sort((a, b) => {
    const av = value(a.points, "mtd")?.mtd, bv = value(b.points, "mtd")?.mtd;
    if (av === null || av === undefined) return 1;
    if (bv === null || bv === undefined) return -1;
    return Number(bv) - Number(av) || a.label.localeCompare(b.label);
  });
  return <>
    <Panel title="September allocations" description="Revenue allocations remain listed if they close later in the month." flush>
      <DataTable><TableHeader><TableRow><Th>Allocation</Th><Th>Venue ID</Th><Th numeric>MTD revenue</Th><Th numeric>Latest daily change</Th><Th>As of</Th></TableRow></TableHeader>
        <TableBody>{sorted.map((allocation) => {
          const mtd = value(allocation.points, "mtd"), daily = value(allocation.points, "daily");
          return <TableRow key={allocation.venueId}><Td><Link className="font-medium hover:underline" href={paths.dailyRevenue(SEPTEMBER_MONTH, series.prime, allocation.venueId)}>{allocation.label}</Link></Td>
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
