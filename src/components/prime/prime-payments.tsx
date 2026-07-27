"use client";

import * as React from "react";
import { ArrowUpRight, ChevronDown, ChevronUp, ChevronsUpDown, Search } from "lucide-react";

import {
  WALLET_OPTIONS,
  accrualLabel,
  defaultSortDir,
  filterPayments,
  primeKpis,
  primeOptions,
  accrualMonthOptions,
  sumUsds,
  type SortDir,
  type SortKey,
} from "@/lib/prime/domain";
import type { PrimeKind } from "@/lib/prime/types";
import { formatCompactTokens, formatTokens, monthLong, shortAddress } from "@/lib/format";
import { explorerUrl, txUrl } from "@/lib/links";
import { cn } from "@/lib/utils";

import { usePrime } from "../data-context";
import { Dropdown } from "../dr/dropdown";
import {
  Card,
  DisplayTitle,
  FilterButton,
  KpiCard,
  MetaItem,
  Pill,
} from "../dr/primitives";

type Filter = "all" | PrimeKind;
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "settlement cycle", label: "Settlement cycles" },
  { key: "other", label: "Genesis & transfers" },
];
const COLUMNS: {
  key: SortKey | null;
  label: string;
  align?: "right";
  num?: boolean;
}[] = [
  { key: "castDate", label: "Cast date" },
  { key: "prime", label: "Prime" },
  { key: "usds", label: "USDS", align: "right", num: true },
  { key: "settlesAccrual", label: "Month" },
  { key: "label", label: "Label" },
  { key: "walletType", label: "Wallet" },
  { key: null, label: "From" },
  { key: null, label: "Tx" },
  { key: null, label: "Spell" },
  { key: null, label: "Reference" },
];

function ExplorerLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-0.5 font-mono text-[11px] text-gold underline-offset-2 hover:underline"
    >
      {children}
      <ArrowUpRight className="size-3" />
    </a>
  );
}

function SortHeader({
  label,
  active,
  dir,
  align,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  align?: "right";
  onClick: () => void;
}) {
  const Icon = !active ? ChevronsUpDown : dir === "asc" ? ChevronUp : ChevronDown;
  return (
    <th
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
      className={cn("px-4 py-3 font-medium", align === "right" && "text-right")}
    >
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 uppercase tracking-[0.12em] transition-colors hover:text-ink",
          align === "right" && "flex-row-reverse",
          active ? "text-ink" : "text-muted"
        )}
      >
        {label}
        <Icon className={cn("size-3", active ? "text-gold" : "text-faint")} />
      </button>
    </th>
  );
}

export function PrimePayments() {
  const { payments: ROWS } = usePrime();
  const PRIME_OPTIONS = React.useMemo(() => primeOptions(ROWS), [ROWS]);
  const MONTH_OPTIONS = React.useMemo(() => accrualMonthOptions(ROWS), [ROWS]);
  const kpis = React.useMemo(() => primeKpis(ROWS), [ROWS]);
  const [filter, setFilter] = React.useState<Filter>("all");
  const [prime, setPrime] = React.useState("all");
  const [wallet, setWallet] = React.useState("all");
  const [month, setMonth] = React.useState("all");
  const [query, setQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey>("castDate");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");

  const rows = React.useMemo(
    () =>
      filterPayments(
        ROWS,
        { kind: filter, prime, wallet, month, query },
        sortKey,
        sortDir
      ),
    [ROWS, filter, prime, wallet, month, query, sortKey, sortDir]
  );

  const total = sumUsds(rows);

  const onSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(defaultSortDir(key));
    }
  };

  return (
    <div className="space-y-7">
      {/* page header */}
      <header>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <DisplayTitle accent="spell mints & budget transfers">
            Prime payments
          </DisplayTitle>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 lg:justify-end">
            <MetaItem label="payments" value={ROWS.length} />
            <MetaItem label="settlement" value={formatCompactTokens(kpis.cycleTotal)} />
            <MetaItem label="other" value={formatCompactTokens(kpis.otherTotal)} />
            <MetaItem label="total USDS" value={formatCompactTokens(kpis.cycleTotal + kpis.otherTotal)} />
          </div>
        </div>
      </header>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiCard
          label="Total paid"
          value={formatCompactTokens(kpis.cycleTotal + kpis.otherTotal)}
          unit="USDS"
          note={`${ROWS.length} payments to primes`}
        />
        <KpiCard
          label="Settlement cycles"
          value={formatCompactTokens(kpis.cycleTotal)}
          unit="USDS"
          note="Monthly settlement of accrued distribution rewards"
        />
        <KpiCard
          label="Genesis & transfers"
          value={formatCompactTokens(kpis.otherTotal)}
          unit="USDS"
          note="One-off capital and genesis funding transfers"
        />
      </div>

      {/* controls: filter tabs + selects + search */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <nav className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <FilterButton key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>
              {f.label}
            </FilterButton>
          ))}
        </nav>
        <div className="flex flex-wrap items-center gap-2">
          <Dropdown
            label="Prime"
            value={prime}
            onChange={setPrime}
            options={PRIME_OPTIONS}
            render={(v) => (v === "all" ? "All" : v)}
          />
          <Dropdown
            label="Wallet"
            value={wallet}
            onChange={setWallet}
            options={WALLET_OPTIONS}
            render={(v) => (v === "all" ? "All" : v)}
          />
          <Dropdown
            label="Month"
            value={month}
            onChange={setMonth}
            options={MONTH_OPTIONS}
            render={(v) => (v === "all" ? "All" : monthLong(v))}
          />
          <label className="neu-inset-sm flex h-10 min-w-57.5 items-center gap-2 rounded-full px-4">
            <Search className="size-3.5 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search prime, label or address…"
              className="w-full bg-transparent font-mono text-xs text-ink outline-none placeholder:text-faint"
            />
          </label>
        </div>
      </div>

      {/* payments table */}
      <Card className="overflow-x-auto">
        <table className="w-full border-collapse text-left font-mono text-[12px]">
          <thead>
            <tr className="border-b border-line text-[10.5px] text-muted">
              {COLUMNS.map((c) =>
                c.key ? (
                  <SortHeader
                    key={c.label}
                    label={c.label}
                    align={c.align}
                    active={sortKey === c.key}
                    dir={sortDir}
                    onClick={() => onSort(c.key!)}
                  />
                ) : (
                  <th
                    key={c.label}
                    className="px-4 py-3 font-medium uppercase tracking-[0.12em]"
                  >
                    {c.label}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={`${r.txHash}-${r.subproxyConstant}-${i}`}
                className="border-b border-line last:border-0 hover:bg-paper"
              >
                <td className="px-4 py-3 whitespace-nowrap text-ink">{r.castDate}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="font-medium text-ink">{r.prime}</span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap font-medium tabular-nums text-ink">
                  {formatTokens(r.usds)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted">
                  {r.settlesAccrual ? accrualLabel(r.settlesAccrual) : <span className="text-faint">—</span>}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span title={r.lineItem || undefined}>
                    <Pill>{r.label}</Pill>
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted">
                  {r.walletType}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {r.source === "transfer" ? (
                    <span title={r.fromAddress || undefined} className="text-ink">
                      {r.fromLabel || shortAddress(r.fromAddress)}
                    </span>
                  ) : (
                    <span className="text-faint">mint</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <ExplorerLink href={txUrl("ethereum", r.txHash)!}>
                    {shortAddress(r.txHash)}
                  </ExplorerLink>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {r.spellAddress ? (
                    <>
                      <span className="text-muted">{r.spell} · </span>
                      <ExplorerLink href={explorerUrl("ethereum", r.spellAddress)!}>
                        {shortAddress(r.spellAddress)}
                      </ExplorerLink>
                    </>
                  ) : (
                    <span className="text-faint">—</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {r.reference ? (
                    <ExplorerLink href={r.reference}>post</ExplorerLink>
                  ) : (
                    <span className="text-faint">—</span>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-4 py-10 text-center text-muted">
                  No payments match the current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <p className={cn("font-mono text-[11px] text-faint")}>
        Showing {rows.length} of {ROWS.length} payments · {formatTokens(total)} USDS ·
        amounts are whole tokens
      </p>
    </div>
  );
}
