"use client";

import * as React from "react";
import {
  CaretRightIcon,
  DownloadSimpleIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import { Bar as RBar, BarChart, Cell, XAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import {
  allTokens,
  groupColor,
  seriesForRefCode,
  tokenColor,
  visibleRefCodeRows,
} from "@/lib/dr/domain";
import { downloadCsv, toCsv } from "@/lib/csv";
import { formatUSD, formatUSD2, monthLong } from "@/lib/format";
import type { RefCodeRow } from "@/lib/dr/types";
import { cn } from "@/lib/utils";

import { useDr } from "../data-context";
import { Dropdown } from "./dropdown";
import {
  ActionButton,
  Bar,
  DataTable,
  Dash,
  EmptyRow,
  FilterGroup,
  FilterToggle,
  MiniStat,
  NoteBadge,
  Panel,
  SeriesFilterItem,
  Swatch,
  TableBody,
  TableHeader,
  TableRow,
  Td,
  Th,
  TotalRow,
  moneyTooltip,
} from "../kit";

type SortKey = "total" | "refCode" | "latest";

export function RefCodesView({
  selectedGroups,
  onSetGroups,
  onSelectAll,
  onClearGroups,
}: {
  /** Groups currently shown. Empty shows none. */
  selectedGroups: Set<string>;
  onSetGroups: (groups: string[]) => void;
  onSelectAll: () => void;
  onClearGroups: () => void;
}) {
  const dr = useDr();
  const { monthLabels, reportMonths } = dr;
  const refCodeRows = React.useMemo(() => visibleRefCodeRows(dr), [dr]);
  const groupNames = React.useMemo(
    () => Array.from(new Set(refCodeRows.map((r) => r.group))),
    [refCodeRows]
  );
  const allSelected = groupNames.every((g) => selectedGroups.has(g));
  const [query, setQuery] = React.useState("");
  const [token, setToken] = React.useState("All");
  const [onlyNotes, setOnlyNotes] = React.useState(false);
  const [sort, setSort] = React.useState<SortKey>("total");
  const [openRef, setOpenRef] = React.useState<string | null>(null);

  const tokens = React.useMemo(() => ["All", ...allTokens(dr)], [dr]);

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = refCodeRows.filter((r) => {
      if (!selectedGroups.has(r.group)) return false;
      if (token !== "All" && !r.tokens.includes(token)) return false;
      if (onlyNotes && !r.notes.trim()) return false;
      if (q) {
        const hay = `${r.refCode} ${r.group} ${r.tokens.join(" ")} ${r.notes}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    out = [...out].sort((a, b) => {
      if (sort === "refCode") return Number(a.refCode) - Number(b.refCode);
      if (sort === "latest") {
        const lm = reportMonths[reportMonths.length - 1];
        return (b.monthly[lm] ?? 0) - (a.monthly[lm] ?? 0);
      }
      return (b.total ?? 0) - (a.total ?? 0);
    });
    return out;
  }, [query, selectedGroups, token, onlyNotes, sort, refCodeRows, reportMonths]);

  const filteredTotal = rows.reduce((acc, r) => acc + (r.total ?? 0), 0);

  return (
    <Panel
      title="Ledger"
      description={`${rows.length} of ${refCodeRows.length} ref codes · select a row for its token composition and history`}
      action={
        <ActionButton onClick={() => exportCsv(rows, reportMonths)}>
          <DownloadSimpleIcon data-icon="inline-start" aria-hidden />
          Export CSV
        </ActionButton>
      }
      flush
    >
      {/* toolbar */}
      <div className="flex flex-col gap-3 px-6 pt-6 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:max-w-xs">
            <MagnifyingGlassIcon
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ref code, token or note…"
              aria-label="Search ref codes"
              className="pl-9"
            />
          </div>

          <Dropdown
            label="Token"
            value={token}
            onChange={setToken}
            options={tokens}
          />
          <Dropdown
            label="Sort"
            value={sort}
            onChange={(v) => setSort(v as SortKey)}
            options={["total", "latest", "refCode"]}
            render={(v) =>
              v === "total"
                ? "Total"
                : v === "latest"
                  ? "Latest month"
                  : "Ref code"
            }
          />
          <FilterToggle pressed={onlyNotes} onPressedChange={setOnlyNotes}>
            Only with notes
          </FilterToggle>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Groups</span>
          <FilterGroup
            multiple
            value={groupNames.filter((g) => selectedGroups.has(g))}
            onValueChange={onSetGroups}
            aria-label="Filter by partner group"
          >
            {groupNames.map((g) => (
              <SeriesFilterItem key={g} value={g} className="gap-2">
                <Swatch color={groupColor(g)} />
                {g}
              </SeriesFilterItem>
            ))}
          </FilterGroup>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={allSelected ? onClearGroups : onSelectAll}
          >
            {allSelected ? "Clear" : "Select all"}
          </Button>
        </div>
      </div>

      <DataTable containerClassName="max-h-[36rem]">
        <TableHeader className="sticky top-0 z-10 bg-card">
          <TableRow className="hover:bg-transparent">
            <Th className="w-[130px]">Ref code</Th>
            <Th className="w-[140px]">Group</Th>
            {reportMonths.map((m) => (
              <Th key={m} numeric>
                {monthLabels[m]}
              </Th>
            ))}
            <Th numeric>Total</Th>
            <Th className="w-[19rem] min-w-[19rem]">Tokens</Th>
            <Th numeric>Note</Th>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => {
            const isOpen = openRef === r.refCode;
            return (
              <React.Fragment key={r.refCode}>
                <TableRow
                  onClick={() =>
                    setOpenRef((o) => (o === r.refCode ? null : r.refCode))
                  }
                  aria-expanded={isOpen}
                  className="cursor-pointer"
                >
                  <Td className="font-mono font-medium">
                    <span className="flex items-center gap-2">
                      <CaretRightIcon
                        aria-hidden
                        className={cn(
                          "size-3.5 shrink-0 text-muted-foreground transition-transform",
                          isOpen && "rotate-90",
                        )}
                      />
                      {r.refCode}
                    </span>
                  </Td>
                  <Td>
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Swatch color={groupColor(r.group)} />
                      {r.group}
                    </span>
                  </Td>
                  {reportMonths.map((m) => (
                    <Td key={m} numeric className="text-muted-foreground">
                      {cell(r.monthly[m])}
                    </Td>
                  ))}
                  <Td numeric className="font-medium">
                    {cell(r.total)}
                  </Td>
                  <Td>
                    <span className="flex flex-wrap gap-1">
                      {r.tokens.length === 0 ? (
                        <Dash />
                      ) : (
                        r.tokens.map((t) => (
                          <Badge
                            key={t}
                            variant="secondary"
                            className="gap-1.5 font-normal"
                          >
                            <Swatch
                              color={tokenColor(dr, t)}
                              className="size-1.5 rounded-full"
                            />
                            {t}
                          </Badge>
                        ))
                      )}
                    </span>
                  </Td>
                  <Td numeric>{r.notes ? <NoteBadge note={r.notes} /> : null}</Td>
                </TableRow>

                {isOpen ? (
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <Td
                      colSpan={reportMonths.length + 4}
                      className="p-0 first:pl-0 last:pr-0"
                    >
                      <RefCodeDetail refCode={r.refCode} group={r.group} />
                    </Td>
                  </TableRow>
                ) : null}
              </React.Fragment>
            );
          })}
          {rows.length === 0 ? (
            <EmptyRow colSpan={reportMonths.length + 4}>
              No ref codes match these filters.
            </EmptyRow>
          ) : null}
        </TableBody>
      </DataTable>

      <TotalRow
        className="border-t pt-4"
        label="Net · filtered"
        value={`${formatUSD(filteredTotal)} · ${rows.length} codes`}
      />
    </Panel>
  );
}

/* ----------------------------------------------------------- detail panel */

function RefCodeDetail({ refCode, group }: { refCode: string; group: string }) {
  const dr = useDr();
  const { historyMonths } = dr;
  const series = seriesForRefCode(dr, refCode);

  // Code-level monthly totals across the full history (sum of tokens).
  const history = historyMonths.map((m) => ({
    m,
    label: monthLong(m),
    value: series.reduce((acc, s) => acc + (s.monthly[m] ?? 0), 0),
  }));
  const activeMonths = history.filter((h) => h.value > 0).length;
  const peak = history.reduce(
    (best, h) => (h.value > best.value ? h : best),
    history[0] ?? { m: "", label: "", value: 0 }
  );

  // Month filter for the token breakdown. "all" = full-history totals; any
  // other value scopes the composition to a single month. Only months that
  // actually carry DR for this code are offered (latest first).
  const [month, setMonth] = React.useState<string>("all");
  const activeMonthKeys = history.filter((h) => h.value > 0).map((h) => h.m);
  const monthOptions = ["all", ...[...activeMonthKeys].reverse()];

  const tokenValue = (s: (typeof series)[number]) =>
    month === "all" ? s.total ?? 0 : s.monthly[month] ?? 0;

  const shownTokens = [...series]
    .map((s) => ({ token: s.token, value: tokenValue(s) }))
    .sort((a, b) => b.value - a.value);
  const maxToken = Math.max(1, ...shownTokens.map((t) => t.value));
  const monthTotal =
    month === "all"
      ? series.reduce((acc, s) => acc + (s.total ?? 0), 0)
      : history.find((h) => h.m === month)?.value ?? 0;
  const compositionLabel = month === "all" ? "full history" : monthLong(month);

  const historyConfig = {
    value: { label: "DR", color: groupColor(group) },
  } satisfies ChartConfig;

  return (
    <div className="grid gap-8 px-6 py-6 lg:grid-cols-[1fr_24rem]">
      {/* left: token composition */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-medium">
            Token composition{" "}
            <span className="font-normal text-muted-foreground">
              · {compositionLabel}
            </span>
          </h3>
          <Dropdown
            label="Month"
            value={month}
            onChange={setMonth}
            options={monthOptions}
            render={(v) => (v === "all" ? "All history" : monthLong(v))}
            className="h-8"
          />
        </div>

        <div className="flex flex-col gap-2.5">
          {shownTokens.map((s) => (
            <div
              key={s.token}
              className="grid grid-cols-[7rem_1fr_auto] items-center gap-3 text-sm"
            >
              <span className="flex items-center gap-2">
                <Swatch color={tokenColor(dr, s.token)} />
                {/* sans, to match the token badges in the ledger above:
                    the same symbol was being set in two different faces */}
                <span className="truncate">{s.token}</span>
              </span>
              <Bar
                value={s.value}
                max={maxToken}
                color={tokenColor(dr, s.token)}
                label={`${s.token} share`}
              />
              <span className="tabular-nums">{formatUSD2(s.value)}</span>
            </div>
          ))}
          {series.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No token-level history recorded.
            </p>
          ) : null}
        </div>

        {series.length > 0 ? (
          <div className="flex items-center justify-between border-t pt-3 text-sm">
            <span className="text-muted-foreground">
              Total · {compositionLabel}
            </span>
            <span className="font-medium tabular-nums">
              {formatUSD2(monthTotal)}
            </span>
          </div>
        ) : null}
      </div>

      {/* right: history + stats */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-medium">
          DR history{" "}
          <span className="font-normal text-muted-foreground">
            · monthly, select a bar to filter
          </span>
        </h3>

        <ChartContainer config={historyConfig} className="aspect-auto h-32 w-full">
          <BarChart data={history} margin={{ top: 4, left: 0, right: 0 }}>
            <XAxis
              dataKey="m"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={28}
              tickFormatter={(m: string) => monthLong(m)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideIndicator
                  labelFormatter={(_, p) => monthLong(String(p?.[0]?.payload?.m))}
                  formatter={moneyTooltip({ value: "DR" }, (n) => formatUSD2(n))}
                />
              }
            />
            <RBar
              dataKey="value"
              radius={3}
              onClick={(d: { payload?: { m?: string; value?: number } }) => {
                const m = d?.payload?.m;
                if (!m || !d.payload?.value) return;
                setMonth((cur) => (cur === m ? "all" : m));
              }}
            >
              {history.map((h) => (
                <Cell
                  key={h.m}
                  fill="var(--color-value)"
                  // Selection is carried by opacity against the same hue, so
                  // the bar never changes colour or height as it is picked.
                  fillOpacity={month === h.m ? 1 : h.value > 0 ? 0.55 : 0.15}
                  cursor={h.value > 0 ? "pointer" : "default"}
                />
              ))}
            </RBar>
          </BarChart>
        </ChartContainer>

        <dl className="grid grid-cols-2 gap-3">
          <MiniStat label="Months active" value={activeMonths} />
          <MiniStat
            label="Peak month"
            value={peak.value > 0 ? monthLong(peak.m) : "—"}
          />
        </dl>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- helpers */

function cell(v: number | null | undefined) {
  if (v == null) return <Dash />;
  // A real zero is a reported figure, not a gap, so it keeps its digit.
  if (v === 0) return <span className="text-muted-foreground">0</span>;
  return formatUSD(v);
}

function exportCsv(rows: RefCodeRow[], reportMonths: string[]) {
  // Was hand-rolled here, quoting only `notes` — a comma anywhere else shifted
  // every column after it. Now goes through the shared RFC 4180 builder.
  const header = ["ref_code", "group", ...reportMonths, "total", "tokens", "notes"];
  const body = rows.map((r) => [
    r.refCode,
    r.group,
    ...reportMonths.map((m) => r.monthly[m] ?? ""),
    r.total ?? "",
    r.tokens.join(" "),
    r.notes,
  ]);
  downloadCsv("soter_by_ref_code.csv", toCsv(header, body));
}
