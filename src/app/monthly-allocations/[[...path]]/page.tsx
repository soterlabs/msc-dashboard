import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DataTable, PageHeader, Panel, StatCard, TableBody, TableHeader, TableRow, Td, Th } from "@/components/kit";
import { ReadNotice } from "@/components/daily-revenue/report";
import { CopyLink } from "@/components/daily-revenue/copy-link";
import { revenueClient, REVENUE_PUBLIC_URL } from "@/lib/daily-revenue/api";
import { addMoney, compareMoney } from "@/lib/daily-revenue/decimal";
import { DAILY_PRIMES, primeName } from "@/lib/daily-revenue/types";
import { completedMonth, costReason, monthlyUsd, parseMonthlyRoute, percent, type MonthlyAllocation } from "@/lib/monthly-allocations/model";
import { paths } from "@/lib/routes";

export const dynamic = "force-dynamic";
const knownCosts = (rows: MonthlyAllocation[]) => rows.filter(r => r.borrowing_cost_usd !== null);

export default async function Page({ params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params;
  const route = parseMonthlyRoute(path);
  if (!route) notFound();
  if (!path.length) redirect(paths.monthlyAllocations());
  const { month, prime, venue } = route;
  const selected = prime ? [prime] : [...DAILY_PRIMES];
  const reads = await Promise.all(selected.map(p => revenueClient.monthly(p, month)));
  const monthLabel = new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
  const months = Array.from({ length: 12 }, (_, i) => `2026-${String(i + 1).padStart(2, "0")}`).filter(m => completedMonth(m));
  const doc = reads[0].data;
  const allocation = venue && doc ? doc.allocations.find(r => r.venue_id === venue) : undefined;
  if (venue && doc && !allocation && !reads[0].error) notFound();
  const sorted = doc ? [...doc.allocations].sort((a, b) => a.borrowing_cost_usd === null ? (b.borrowing_cost_usd === null ? 0 : 1) : b.borrowing_cost_usd === null ? -1 : compareMoney(b.borrowing_cost_usd, a.borrowing_cost_usd)) : [];
  return <div className="space-y-6">
    <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm text-muted-foreground">
      <Link href={paths.monthlyAllocations(month)}>Allocation Costs &amp; Yields</Link>
      {prime && <><span>/</span><Link href={paths.monthlyAllocations(month, prime)}>{primeName(prime)}</Link></>}
      {venue && <><span>/</span><span>{allocation?.label ?? venue}</span></>}
    </nav>
    <PageHeader title={allocation?.label ?? (prime ? primeName(prime) : "Monthly Allocation Costs & Yields")}
      description={`${monthLabel} · provisional allocation analytics · USD`} actions={<CopyLink />} />
    <nav aria-label="Report month" className="flex flex-wrap gap-3 text-sm">
      {months.map(m => <Link key={m} href={paths.monthlyAllocations(m, prime, venue)} aria-current={m === month ? "page" : undefined} className={m === month ? "font-semibold underline" : "text-muted-foreground hover:underline"}>{m}</Link>)}
    </nav>
    <p className="text-sm text-muted-foreground">Currently published: August 2026 for Spark and Grove. Other selections show availability from the API. A dash means unavailable, never zero.</p>
    {!prime ? <div className="grid gap-4 md:grid-cols-2">{selected.map((p, i) => {
      const read = reads[i], data = read.data, known = knownCosts(data?.allocations ?? []);
      return <Panel key={p} title={<Link className="hover:underline" href={paths.monthlyAllocations(month, p)}>{primeName(p)} →</Link>}>
        {data ? <><p className="text-2xl font-semibold tabular-nums">{known.length ? monthlyUsd(addMoney(known.map(r => r.borrowing_cost_usd!))) : "—"}</p>
          <p className="text-sm text-muted-foreground">Known allocation costs · {known.length} of {data.allocations.length} rows have a cost. This subtotal is not the prime’s total financing charge.</p></> : <p className="text-sm">{read.source === "missing" ? "No published monthly allocation data." : "Monthly data temporarily unavailable."}</p>}
        <ReadNotice read={read} />
      </Panel>;
    })}</div> : !doc || (venue && !allocation) ? <Panel title="Monthly allocation data unavailable"><p>No verified data is available for this selection.</p><ReadNotice read={reads[0]} /></Panel> : <>
      {allocation ? <>
        <p className="text-sm text-muted-foreground">{allocation.venue_id} · {costReason(allocation)}</p>
        <div className="grid gap-4 sm:grid-cols-3"><StatCard label="Monthly borrowing cost" value={monthlyUsd(allocation.borrowing_cost_usd)} />
          <StatCard label="Gross yield · annualized (APY)" value={percent(allocation.gross_apy)} />
          <StatCard label="Net yield · annualized (APY)" value={percent(allocation.net_apy)} /></div>
        <Panel title="Monthly return and capital"><dl className="grid gap-4 sm:grid-cols-2">
          {[["Gross monthly return", percent(allocation.gross_monthly_return)], ["Net monthly return", percent(allocation.net_monthly_return)],
            ["Gross revenue", monthlyUsd(allocation.gross_revenue_usd)], ["Prime-retained revenue", monthlyUsd(allocation.prime_retained_revenue_usd)],
            ["Net PnL", monthlyUsd(allocation.net_pnl_usd)], ["Average original principal", monthlyUsd(allocation.average_original_principal_usd)],
            ["Average yield exposure", monthlyUsd(allocation.average_yield_exposure_usd)]].map(([label, value]) => <div key={label}><dt className="text-sm text-muted-foreground">{label}</dt><dd className="font-medium tabular-nums">{value}</dd></div>)}
        </dl><p className="mt-4 text-sm text-muted-foreground">Yield denominator: {allocation.yield_denominator ?? "Unavailable"}.</p></Panel>
      </> : <Panel title="Borrowing costs and yields per allocation">
        <DataTable><TableHeader><TableRow><Th>Allocation</Th><Th>Monthly borrowing cost</Th><Th>Gross APY</Th><Th>Net APY</Th><Th>Funding / availability</Th></TableRow></TableHeader>
          <TableBody>{sorted.map(r => <TableRow key={r.venue_id}>
            <Td><Link className="font-medium hover:underline" href={paths.monthlyAllocations(month, prime, r.venue_id)}>{r.label}</Link><div className="text-xs text-muted-foreground">{r.venue_id}</div></Td>
            <Td className="tabular-nums whitespace-nowrap">{monthlyUsd(r.borrowing_cost_usd)}</Td><Td className="tabular-nums whitespace-nowrap">{percent(r.gross_apy)}</Td><Td className="tabular-nums whitespace-nowrap">{percent(r.net_apy)}</Td><Td>{costReason(r)}</Td>
          </TableRow>)}</TableBody></DataTable>
      </Panel>}
      <ReadNotice read={reads[0]} />
      <p className="text-xs text-muted-foreground">Published {doc.published_at} · <a className="underline" href={`${REVENUE_PUBLIC_URL}/v1/revenue/${prime}/monthly/${month}/allocations?revision=${doc.revision_id}${venue ? `&venue=${encodeURIComponent(venue)}` : ""}`} target="_blank" rel="noreferrer">View this API revision</a></p>
    </>}
    <Panel title="How to read these figures"><div className="space-y-2 text-sm text-muted-foreground">
      <p>Borrowing costs apply to original Sky-funded principal, excluding retained and reinvested gains. Principal is assumed Sky-funded except Spark Savings. Unresolved funding splits have no borrowing-cost or net-yield estimate.</p>
      <p>Gross yield uses investment revenue before SDE sharing. Net yield uses prime-retained venue revenue after SDE sharing, less allocation borrowing cost; it excludes prime-level adjustments and spread reimbursements. Net is therefore not simply gross minus borrowing cost.</p>
      <p>APY annualizes the selected month’s return using average exposure. It is not a contracted or forecast rate. Monthly returns are available on each allocation page. Cash-recognized revenue can be lumpy.</p>
      <p>These analytics do not replace settlement reports. Known-cost subtotals exclude unresolved rows and prime-level financing adjustments; they should not be read as total ilk borrowing costs.</p>
    </div></Panel>
  </div>;
}
