"use client";

import * as React from "react";
import { ArrowUpRight, ChevronDown, ChevronUp, ChevronsUpDown, Search } from "lucide-react";

import { spellPayments } from "@/lib/spell-data";
import type { SpellKind, SpellPayment } from "@/lib/spell-types";
import { formatCompactUSD, formatUSD, monthLong, shortAddress } from "@/lib/format";
import { cn } from "@/lib/utils";

import {
  Card,
  DisplayTitle,
  FilterButton,
  KpiCard,
  MetaItem,
  Pill,
} from "../dr/primitives";

type Filter = "all" | SpellKind;
type SortKey = "castDate" | "prime" | "usds" | "settlesAccrual" | "section";
type SortDir = "asc" | "desc";

const ETHERSCAN_TX = "https://etherscan.io/tx/";
const ETHERSCAN_ADDR = "https://etherscan.io/address/";

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
  { key: "settlesAccrual", label: "Accrual" },
  { key: "section", label: "Section" },
  { key: null, label: "Tx" },
  { key: null, label: "Spell" },
];

const NUMERIC_KEYS: ReadonlySet<SortKey> = new Set<SortKey>(["usds"]);

const ROWS = spellPayments;

/** "2026-05" or "2025-11 + 2025-12" → "May 2026" / "Nov 2025 + Dec 2025". */
function accrualLabel(accrual: string): string {
  if (!accrual) return "—";
  return accrual
    .split("+")
    .map((m) => monthLong(m.trim()))
    .join(" + ");
}

function matches(row: SpellPayment, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return [
    row.prime,
    row.section,
    row.subproxyConstant,
    row.settlesAccrual,
    row.receivingWallet,
    row.txHash,
    row.spellAddress,
  ].some((f) => f.toLowerCase().includes(q));
}

function compareBy(key: SortKey, dir: SortDir) {
  const sign = dir === "asc" ? 1 : -1;
  return (a: SpellPayment, b: SpellPayment) => {
    if (NUMERIC_KEYS.has(key)) return (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0) * sign;
    return String(a[key]).localeCompare(String(b[key])) * sign;
  };
}

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

export function SpellPayments() {
  const [filter, setFilter] = React.useState<Filter>("all");
  const [query, setQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey>("castDate");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");

  const cycleTotal = ROWS.filter((r) => r.kind === "settlement cycle").reduce((s, r) => s + r.usds, 0);
  const otherTotal = ROWS.filter((r) => r.kind === "other").reduce((s, r) => s + r.usds, 0);

  const rows = ROWS.filter(
    (r) => (filter === "all" || r.kind === filter) && matches(r, query.trim())
  ).sort(compareBy(sortKey, sortDir));

  const total = rows.reduce((sum, r) => sum + r.usds, 0);

  const onSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(NUMERIC_KEYS.has(key) || key === "castDate" ? "desc" : "asc");
    }
  };

  return (
    <div className="space-y-7">
      {/* page header */}
      <header>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <DisplayTitle accent="to prime subproxies">Spell payments</DisplayTitle>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 lg:justify-end">
            <MetaItem label="payments" value={ROWS.length} />
            <MetaItem label="settlement" value={formatCompactUSD(cycleTotal)} />
            <MetaItem label="other" value={formatCompactUSD(otherTotal)} />
            <MetaItem label="total USDS" value={formatCompactUSD(cycleTotal + otherTotal)} />
          </div>
        </div>
      </header>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiCard
          label="Total paid"
          value={formatCompactUSD(cycleTotal + otherTotal)}
          unit="USDS"
          note={`${ROWS.length} spell payments to prime subproxies`}
        />
        <KpiCard
          label="Settlement cycles"
          value={formatCompactUSD(cycleTotal)}
          unit="USDS"
          note="Monthly settlement of accrued distribution rewards"
        />
        <KpiCard
          label="Genesis & transfers"
          value={formatCompactUSD(otherTotal)}
          unit="USDS"
          note="One-off capital and genesis funding transfers"
        />
      </div>

      {/* controls: filter tabs + search */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <nav className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <FilterButton key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>
              {f.label}
            </FilterButton>
          ))}
        </nav>
        <label className="relative flex items-center">
          <Search className="pointer-events-none absolute left-2.5 size-3.5 text-faint" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search prime, section, address…"
            className="w-56 rounded-[5px] border border-line-strong bg-card py-1.5 pr-2.5 pl-8 font-mono text-[11px] text-ink placeholder:text-faint focus:border-ink/40 focus:outline-none"
          />
        </label>
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
                  {formatUSD(r.usds)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted">
                  {r.kind === "settlement cycle" ? (
                    accrualLabel(r.settlesAccrual)
                  ) : (
                    <Pill>{r.kind}</Pill>
                  )}
                </td>
                <td className="max-w-88 px-4 py-3 text-muted">
                  <span title={r.section} className="line-clamp-1">
                    {r.section}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <ExplorerLink href={`${ETHERSCAN_TX}${r.txHash}`}>
                    {shortAddress(r.txHash)}
                  </ExplorerLink>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-muted">{r.spell} · </span>
                  <ExplorerLink href={`${ETHERSCAN_ADDR}${r.spellAddress}`}>
                    {shortAddress(r.spellAddress)}
                  </ExplorerLink>
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
        Showing {rows.length} of {ROWS.length} payments · {formatUSD(total)} USDS ·
        amounts are whole tokens
      </p>
    </div>
  );
}
