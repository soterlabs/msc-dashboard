"use client";

import * as React from "react";
import {
  ArrowUpRightIcon,
  CaretDownIcon,
  CaretUpDownIcon,
  CaretUpIcon,
  DownloadSimpleIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { downloadCsv, filteredFilename, toCsv } from "@/lib/csv";
import {
  CSV_COLUMNS,
  WALLET_OPTIONS,
  accrualLabel,
  isWalletFilter,
  toCsvRow,
  defaultSortDir,
  filterPayments,
  primeKpis,
  primeOptions,
  accrualMonthOptions,
  sumUsds,
  type SortDir,
  type SortKey,
  type WalletFilter,
} from "@/lib/prime/domain";
import type { PrimeKind } from "@/lib/prime/types";
import {
  formatCompactTokens,
  formatTokens,
  monthLong,
  shortAddress,
} from "@/lib/format";
import { explorerUrl, txUrl } from "@/lib/links";
import { cn } from "@/lib/utils";

import { usePrime } from "../data-context";
import { Dropdown } from "../dr/dropdown";
import {
  ActionButton,
  DataTable,
  Dash,
  EmptyRow,
  FilterGroup,
  FilterItem,
  PageHeader,
  Panel,
  StatCard,
  TableBody,
  TableHeader,
  TableRow,
  Td,
  Th,
} from "../kit";

type Filter = "all" | PrimeKind;
/**
 * Prime payments are all mainnet today, and PrimePayment carries no chain, so
 * the explorer chain is an assumption of this view rather than data. Add a
 * `chain` column to data/prime/payments.csv before any prime is paid elsewhere,
 * and read it here instead.
 */
const PAYMENT_CHAIN = "ethereum";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "settlement cycle", label: "Settlement cycles" },
  { key: "other", label: "Genesis & transfers" },
];

const COLUMNS: {
  key: SortKey | null;
  label: string;
  numeric?: boolean;
}[] = [
  { key: "castDate", label: "Cast date" },
  { key: "prime", label: "Prime" },
  { key: "usds", label: "USDS", numeric: true },
  { key: "settlesAccrual", label: "Month" },
  { key: "label", label: "Label" },
  { key: "walletType", label: "Wallet" },
  { key: null, label: "From" },
  { key: null, label: "Tx" },
  { key: null, label: "Spell" },
  { key: null, label: "Reference" },
];

function ExplorerLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      // A column of primary-coloured links was the loudest thing on the page,
      // and primary means "headline / on" everywhere else. The underline is
      // what makes these read as links; the colour stays out of it.
      className="inline-flex items-center gap-1 font-mono underline decoration-muted-foreground underline-offset-4 hover:decoration-foreground"
    >
      {children}
      <ArrowUpRightIcon aria-hidden className="size-3 text-muted-foreground" />
    </a>
  );
}

/** Sortable column header, in shadcn's data-table idiom: the whole header is a
 * ghost button carrying the sort affordance. */
function SortHeader({
  label,
  active,
  dir,
  numeric,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  numeric?: boolean;
  onClick: () => void;
}) {
  const Icon = !active ? CaretUpDownIcon : dir === "asc" ? CaretUpIcon : CaretDownIcon;
  return (
    <Th
      numeric={numeric}
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
      className="px-1 first:pl-3 last:pr-3"
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        className={cn(
          "h-8 gap-1 px-3 text-xs font-medium",
          // row-reverse pins the pair to the column's right edge, so a numeric
          // header sits directly over its own figures.
          numeric && "flex-row-reverse",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
        <Icon
          aria-hidden
          className={cn("size-3", active ? "text-foreground" : "opacity-60")}
        />
      </Button>
    </Th>
  );
}

export function PrimePayments() {
  const { payments: ROWS } = usePrime();
  const PRIME_OPTIONS = React.useMemo(() => primeOptions(ROWS), [ROWS]);
  const MONTH_OPTIONS = React.useMemo(() => accrualMonthOptions(ROWS), [ROWS]);
  const kpis = React.useMemo(() => primeKpis(ROWS), [ROWS]);
  const [filter, setFilter] = React.useState<Filter>("all");
  const [prime, setPrime] = React.useState("all");
  const [wallet, setWallet] = React.useState<WalletFilter>("all");
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

  /**
   * Downloads exactly what is on screen — the filters and sort applied, every
   * column included. A reviewer checking whether a payment is covered needs the
   * same rows they are looking at, not the whole table.
   */
  const download = () =>
    downloadCsv(
      filteredFilename("prime_payments", { kind: filter, prime, wallet, month, query }),
      toCsv(CSV_COLUMNS, rows.map(toCsvRow)),
    );

  const onSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(defaultSortDir(key));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Prime payments"
        description="Spell mints & budget transfers"
        /* no meta row: all four figures are the three KPI cards below plus the
           payments panel's own count */
        actions={
          <ActionButton
            onClick={download}
            title={`Download the ${rows.length} row(s) currently shown, as CSV`}
          >
            <DownloadSimpleIcon data-icon="inline-start" aria-hidden />
            Download CSV
          </ActionButton>
        }
      />

      <div className="grid grid-cols-1 gap-4 @3xl/main:grid-cols-3">
        <StatCard
          label="Total paid"
          value={formatCompactTokens(kpis.cycleTotal + kpis.otherTotal)}
          unit="USDS"
          note={`${kpis.paymentCount} payments to primes`}
        />
        <StatCard
          label="Settlement cycles"
          value={formatCompactTokens(kpis.cycleTotal)}
          unit="USDS"
          note="Monthly settlement of accrued distribution rewards"
        />
        <StatCard
          label="Genesis & transfers"
          value={formatCompactTokens(kpis.otherTotal)}
          unit="USDS"
          note="One-off capital and genesis funding transfers"
        />
      </div>

      <Panel
        title="Payments"
        description={`Showing ${rows.length} of ${kpis.paymentCount} payments · ${formatTokens(total)} USDS · amounts are whole tokens`}
        flush
      >
        {/* toolbar */}
        <div className="flex flex-wrap items-center gap-2 px-6 pt-6 pb-4">
          <FilterGroup
            value={[filter]}
            onValueChange={(v) => v[0] && setFilter(v[0] as Filter)}
            aria-label="Payment kind"
          >
            {FILTERS.map((f) => (
              <FilterItem key={f.key} value={f.key}>
                {f.label}
              </FilterItem>
            ))}
          </FilterGroup>

          <div className="ml-auto flex flex-wrap items-center gap-2">
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
              onChange={(v) => isWalletFilter(v) && setWallet(v)}
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
            <div className="relative w-full sm:w-64">
              <MagnifyingGlassIcon
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search prime, label or address…"
                aria-label="Search payments"
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <DataTable containerClassName="max-h-[42rem]">
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow className="hover:bg-transparent">
              {COLUMNS.map((c) =>
                c.key ? (
                  <SortHeader
                    key={c.label}
                    label={c.label}
                    numeric={c.numeric}
                    active={sortKey === c.key}
                    dir={sortDir}
                    onClick={() => onSort(c.key!)}
                  />
                ) : (
                  <Th key={c.label}>{c.label}</Th>
                )
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={`${r.txHash}-${r.subproxyConstant}-${i}`}>
                <Td>{r.castDate}</Td>
                <Td className="font-medium">{r.prime}</Td>
                <Td numeric className="font-medium">
                  {formatTokens(r.usds)}
                </Td>
                <Td className="text-muted-foreground">
                  {r.settlesAccrual ? accrualLabel(r.settlesAccrual) : <Dash />}
                </Td>
                <Td>
                  <Badge
                    variant="secondary"
                    className="font-normal"
                    title={r.lineItem || undefined}
                  >
                    {r.label}
                  </Badge>
                </Td>
                <Td className="text-muted-foreground">{r.walletType}</Td>
                <Td>
                  {r.source === "transfer" ? (
                    <span title={r.fromAddress || undefined}>
                      {r.fromLabel || (
                        <span className="font-mono">
                          {shortAddress(r.fromAddress)}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">mint</span>
                  )}
                </Td>
                <Td>
                  {txUrl(PAYMENT_CHAIN, r.txHash) ? (
                    <ExplorerLink href={txUrl(PAYMENT_CHAIN, r.txHash)!}>
                      {shortAddress(r.txHash)}
                    </ExplorerLink>
                  ) : (
                    <span className="font-mono text-muted-foreground">
                      {shortAddress(r.txHash)}
                    </span>
                  )}
                </Td>
                <Td>
                  {r.spellAddress ? (
                    <span className="flex items-center gap-1.5">
                      <span className="font-mono text-muted-foreground">
                        {r.spell}
                      </span>
                      {explorerUrl(PAYMENT_CHAIN, r.spellAddress) ? (
                        <ExplorerLink
                          href={explorerUrl(PAYMENT_CHAIN, r.spellAddress)!}
                        >
                          {shortAddress(r.spellAddress)}
                        </ExplorerLink>
                      ) : (
                        <span className="font-mono text-muted-foreground">
                          {shortAddress(r.spellAddress)}
                        </span>
                      )}
                    </span>
                  ) : (
                    <Dash />
                  )}
                </Td>
                <Td>
                  {r.reference ? (
                    <ExplorerLink href={r.reference}>post</ExplorerLink>
                  ) : (
                    <Dash />
                  )}
                </Td>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <EmptyRow colSpan={COLUMNS.length}>
                No payments match the current filter.
              </EmptyRow>
            )}
          </TableBody>
        </DataTable>
      </Panel>
    </div>
  );
}
