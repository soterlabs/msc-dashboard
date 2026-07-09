"use client";

import * as React from "react";
import { ChevronRight, Download, Search } from "lucide-react";

import { HISTORY_MONTHS, MONTH_LABELS, REPORT_MONTHS } from "@/lib/data";
import {
  allTokens,
  groupColor,
  seriesForRefCode,
  tokenColor,
  visibleRefCodeRows as refCodeRows,
} from "@/lib/domain";
import { formatUSD, formatUSD2, monthLong, monthShort } from "@/lib/format";
import { cn } from "@/lib/utils";

import { Dropdown } from "./dropdown";
import {
  Bar,
  Card,
  DarkBar,
  FilterButton,
  NoteTag,
  Pill,
  SectionTitle,
  Swatch,
} from "./primitives";

type SortKey = "total" | "refCode" | "latest";

const GROUP_NAMES = Array.from(new Set(refCodeRows.map((r) => r.group)));

export function RefCodesView({
  selectedGroups,
  onToggleGroup,
  onSelectAll,
  onClearGroups,
}: {
  /** Groups currently shown. "All" selects every group; empty shows none. */
  selectedGroups: Set<string>;
  onToggleGroup: (g: string) => void;
  onSelectAll: () => void;
  onClearGroups: () => void;
}) {
  const allSelected = GROUP_NAMES.every((g) => selectedGroups.has(g));
  const [query, setQuery] = React.useState("");
  const [token, setToken] = React.useState("All");
  const [onlyNotes, setOnlyNotes] = React.useState(false);
  const [sort, setSort] = React.useState<SortKey>("total");
  const [openRef, setOpenRef] = React.useState<string | null>(null);

  const tokens = React.useMemo(() => ["All", ...allTokens()], []);

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
        const lm = REPORT_MONTHS[REPORT_MONTHS.length - 1];
        return (b.monthly[lm] ?? 0) - (a.monthly[lm] ?? 0);
      }
      return (b.total ?? 0) - (a.total ?? 0);
    });
    return out;
  }, [query, selectedGroups, token, onlyNotes, sort]);

  const filteredTotal = rows.reduce((acc, r) => acc + (r.total ?? 0), 0);

  return (
    <div className="space-y-5">
      {/* group filter chips — multi-select; "All" clears the selection */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 font-mono text-[10.5px] tracking-[0.14em] text-muted uppercase">
          Group
        </span>
        <FilterButton
          active={allSelected}
          onClick={allSelected ? onClearGroups : onSelectAll}
        >
          All
        </FilterButton>
        {GROUP_NAMES.map((g) => (
          <FilterButton
            key={g}
            active={selectedGroups.has(g)}
            onClick={() => onToggleGroup(g)}
          >
            {g}
          </FilterButton>
        ))}
        {!allSelected ? (
          <span className="ml-1 font-mono text-[10.5px] text-muted">
            {selectedGroups.size === 0
              ? "none selected"
              : `${selectedGroups.size} selected`}
          </span>
        ) : null}
      </div>

      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="neu-inset-sm flex h-10 min-w-[230px] flex-1 items-center gap-2 rounded-full px-4">
          <Search className="size-3.5 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search ref code, token or note…"
            className="w-full bg-transparent font-mono text-xs text-ink outline-none placeholder:text-faint"
          />
        </label>

        <Dropdown
          label="token"
          value={token}
          onChange={setToken}
          options={tokens}
        />
        <Dropdown
          label="sort"
          value={sort}
          onChange={(v) => setSort(v as SortKey)}
          options={["total", "latest", "refCode"]}
          render={(v) =>
            v === "total"
              ? "total ↓"
              : v === "latest"
                ? "latest month ↓"
                : "ref code ↑"
          }
        />
        <FilterButton active={onlyNotes} onClick={() => setOnlyNotes((v) => !v)}>
          Only with notes
        </FilterButton>
        <button
          type="button"
          onClick={() => exportCsv(rows)}
          className="neu-btn neu-focus inline-flex h-10 items-center gap-1.5 rounded-full px-4 font-mono text-[11px] font-medium tracking-wide text-muted hover:text-ink"
        >
          <Download className="size-3.5" /> Export CSV
        </button>
      </div>

      <SectionTitle
        title={
          <>
            Ledger{" "}
            <span className="font-mono text-xs font-normal text-muted">
              {rows.length} codes
            </span>
          </>
        }
      />

      <Card className="overflow-hidden">
        <div className="dr-scroll max-h-[600px] overflow-auto">
          <table className="w-full min-w-[940px] border-collapse text-left">
            <thead className="sticky top-0 z-10">
              <tr className="bg-thead">
                <Th className="w-[120px]">Ref code</Th>
                <Th className="w-[130px]">Group</Th>
                {REPORT_MONTHS.map((m) => (
                  <Th key={m} className="text-right">
                    {MONTH_LABELS[m]}
                  </Th>
                ))}
                <Th className="text-right">Total</Th>
                <Th className="min-w-[180px]">Tokens</Th>
                <Th className="text-right">Note</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const isOpen = openRef === r.refCode;
                return (
                  <React.Fragment key={r.refCode}>
                    <tr
                      onClick={() =>
                        setOpenRef((o) => (o === r.refCode ? null : r.refCode))
                      }
                      className={cn(
                        "cursor-pointer border-b border-line transition-colors hover:bg-paper/60",
                        isOpen && "bg-paper/70"
                      )}
                    >
                      <Td>
                        <div className="flex items-center gap-1.5">
                          <ChevronRight
                            className={cn(
                              "size-3.5 shrink-0 text-muted transition-transform",
                              isOpen && "rotate-90"
                            )}
                          />
                          <span className="font-mono text-xs font-semibold text-ink">
                            {r.refCode}
                          </span>
                        </div>
                      </Td>
                      <Td>
                        <span className="inline-flex items-center gap-1.5">
                          <Swatch color={groupColor(r.group)} />
                          <span className="text-[11px] text-muted">
                            {r.group}
                          </span>
                        </span>
                      </Td>
                      {REPORT_MONTHS.map((m) => (
                        <Td key={m} className="text-right text-muted">
                          {fmtCell(r.monthly[m])}
                        </Td>
                      ))}
                      <Td className="text-right font-semibold text-gold">
                        {fmtCell(r.total)}
                      </Td>
                      <Td>
                        <div className="flex flex-wrap gap-1">
                          {r.tokens.length === 0 ? (
                            <span className="text-faint">—</span>
                          ) : (
                            r.tokens.map((t) => (
                              <Pill key={t} color={tokenColor(t)}>
                                {t}
                              </Pill>
                            ))
                          )}
                        </div>
                      </Td>
                      <Td className="text-right">
                        {r.notes ? <NoteTag note={r.notes} /> : null}
                      </Td>
                    </tr>

                    {isOpen ? (
                      <tr className="border-b border-line bg-paper/40">
                        <td colSpan={REPORT_MONTHS.length + 4} className="p-0">
                          <RefCodeDetail refCode={r.refCode} group={r.group} />
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                );
              })}
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={REPORT_MONTHS.length + 4}
                    className="px-3 py-10 text-center font-mono text-xs text-muted"
                  >
                    No ref codes match these filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      <DarkBar
        left="Net · filtered"
        right={`${formatUSD(filteredTotal)} · ${rows.length} codes`}
      />
    </div>
  );
}

/* ----------------------------------------------------------- detail panel */

function RefCodeDetail({ refCode, group }: { refCode: string; group: string }) {
  const series = seriesForRefCode(refCode);

  // Code-level monthly totals across the full history (sum of tokens).
  const history = HISTORY_MONTHS.map((m) => ({
    m,
    v: series.reduce((acc, s) => acc + (s.monthly[m] ?? 0), 0),
  }));
  const maxHist = Math.max(1, ...history.map((h) => h.v));
  const activeMonths = history.filter((h) => h.v > 0).length;
  const peak = history.reduce(
    (best, h) => (h.v > best.v ? h : best),
    history[0] ?? { m: "", v: 0 }
  );

  // Month filter for the token breakdown. "all" = full-history totals; any
  // other value scopes the composition to a single month. Only months that
  // actually carry DR for this code are offered (latest first).
  const [month, setMonth] = React.useState<string>("all");
  const activeMonthKeys = history.filter((h) => h.v > 0).map((h) => h.m);
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
      : history.find((h) => h.m === month)?.v ?? 0;
  const compositionLabel = month === "all" ? "full history" : monthLong(month);

  return (
    <div className="grid gap-6 px-6 py-5 lg:grid-cols-[1fr_360px]">
      {/* left: token composition */}
      <div className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="font-mono text-[10px] font-medium tracking-[0.16em] text-muted uppercase">
              Token composition · {compositionLabel}
            </p>
            <Dropdown
              label="month"
              value={month}
              onChange={setMonth}
              options={monthOptions}
              render={(v) => (v === "all" ? "All history" : monthLong(v))}
            />
          </div>
          <div className="space-y-1.5">
            {shownTokens.map((s) => (
              <div
                key={s.token}
                className="grid grid-cols-[104px_1fr_auto] items-center gap-3"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Swatch color={tokenColor(s.token)} />
                  <span className="font-mono text-[11px] text-ink">
                    {s.token}
                  </span>
                </span>
                <Bar value={s.value} max={maxToken} color={tokenColor(s.token)} />
                <span className="min-w-28 text-right font-mono text-[11px] whitespace-nowrap text-muted tabular-nums">
                  {formatUSD2(s.value)}
                </span>
              </div>
            ))}
            {series.length === 0 ? (
              <p className="font-mono text-[11px] text-faint">
                No token-level history recorded.
              </p>
            ) : null}
          </div>
          {series.length > 0 ? (
            <div className="mt-2 flex items-center justify-between border-t border-line pt-2 font-mono text-[10px] text-faint">
              <span>
                Total · {month === "all" ? "full history" : monthLong(month)}
              </span>
              <span className="text-muted tabular-nums">
                {formatUSD2(monthTotal)}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* right: history sparkbars + stats */}
      <div className="space-y-3">
        <p className="font-mono text-[10px] font-medium tracking-[0.16em] text-muted uppercase">
          DR history · monthly{" "}
          <span className="text-faint normal-case tracking-normal">
            (click a bar to filter)
          </span>
        </p>
        <div className="flex h-24 items-end gap-[2px]">
          {history.map((h) => {
            const selected = month === h.m;
            const active = h.v > 0;
            return (
              <button
                key={h.m}
                type="button"
                disabled={!active}
                onClick={() =>
                  setMonth((cur) => (cur === h.m ? "all" : h.m))
                }
                title={`${monthLong(h.m)} · ${formatUSD2(h.v)}`}
                className={cn(
                  "flex-1 rounded-[1px] transition-[background-color,opacity]",
                  active ? "cursor-pointer hover:opacity-100" : "cursor-default"
                )}
                style={{
                  height: `${Math.max(2, (h.v / maxHist) * 100)}%`,
                  // Selection is signalled purely by colour — a darker shade of
                  // the bar's own group colour. Height stays value-driven, so
                  // the bar never grows.
                  background: selected
                    ? `color-mix(in srgb, ${groupColor(group)} 80%, #000)`
                    : groupColor(group),
                  opacity: selected ? 1 : active ? 0.85 : 0.18,
                }}
              />
            );
          })}
        </div>
        <div className="flex justify-between font-mono text-[10px] text-faint">
          <span>{monthShort(HISTORY_MONTHS[0])} ’{HISTORY_MONTHS[0].slice(2, 4)}</span>
          <span>
            {monthShort(HISTORY_MONTHS[HISTORY_MONTHS.length - 1])} ’
            {HISTORY_MONTHS[HISTORY_MONTHS.length - 1].slice(2, 4)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <MiniStat label="Months active" value={String(activeMonths)} />
          <MiniStat
            label="Peak month"
            value={peak.v > 0 ? monthLong(peak.m) : "—"}
          />
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="neu-inset-sm rounded-xl px-3 py-2.5">
      <p className="font-mono text-[9.5px] tracking-[0.12em] text-muted uppercase">
        {label}
      </p>
      <p className="mt-1 font-mono text-xs font-medium text-ink">{value}</p>
    </div>
  );
}

/* --------------------------------------------------------------- helpers */

function fmtCell(v: number | null | undefined) {
  if (v == null) return <span className="text-faint">—</span>;
  if (v === 0) return <span className="text-faint">0</span>;
  return formatUSD(v);
}

function exportCsv(rows: typeof refCodeRows) {
  const header = [
    "ref_code",
    "group",
    ...REPORT_MONTHS,
    "total",
    "tokens",
    "notes",
  ];
  const body = rows.map((r) =>
    [
      r.refCode,
      r.group,
      ...REPORT_MONTHS.map((m) => r.monthly[m] ?? ""),
      r.total ?? "",
      r.tokens.join(" "),
      `"${r.notes.replace(/"/g, '""')}"`,
    ].join(",")
  );
  const csv = [header.join(","), ...body].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "soter_by_ref_code.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "bg-thead px-3 py-2.5 font-mono text-[10.5px] font-medium tracking-[0.1em] text-muted uppercase",
        className
      )}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={cn("px-3 py-2.5 font-mono text-xs whitespace-nowrap", className)}
    >
      {children}
    </td>
  );
}

