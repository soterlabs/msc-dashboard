"use client";

import * as React from "react";
import {
  CaretRightIcon,
  DownloadSimpleIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
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
import { refCodeFragment, refCodeFromFragment } from "@/lib/dr/ref-code-navigation";
import { cn } from "@/lib/utils";

import { useDr } from "../data-context";
import { Dropdown } from "./dropdown";
import {
  ActionButton,
  Bar,
  DataTable,
  Dash,
  EmptyRow,
  FilterToggle,
  NoteBadge,
  Panel,
  Swatch,
  TableBody,
  TableHeader,
  TableRow,
  Td,
  Th,
  TotalRow,
} from "../kit";

// Fragments preserve shareable row selection without making a static report
// depend on server search parameters. Subscribe to Back/Forward as well.
function subscribeToFragment(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener("popstate", onChange);
  };
}
const currentRefCode = () => refCodeFromFragment(window.location.hash);
const serverRefCode = () => null;
function setOpenRefCode(code: string | null) {
  window.history.pushState(null, "", code ? refCodeFragment(code) : "#distribution-rewards");
  window.dispatchEvent(new Event("hashchange"));
}

type SortKey = "total" | "refCode" | "latest";

export function RefCodesView() {
  const dr = useDr();
  const { monthLabels, reportMonths } = dr;
  const refCodeRows = React.useMemo(() => visibleRefCodeRows(dr), [dr]);
  const openRefCode = React.useSyncExternalStore(subscribeToFragment, currentRefCode, serverRefCode);
  React.useEffect(() => {
    if (openRefCode) {
      document.getElementById(refCodeFragment(openRefCode).slice(1))?.scrollIntoView({ block: "nearest" });
    }
  }, [openRefCode]);
  const [query, setQuery] = React.useState("");
  const [token, setToken] = React.useState("All");
  const [onlyNotes, setOnlyNotes] = React.useState(false);
  const [sort, setSort] = React.useState<SortKey>("total");

  const tokens = React.useMemo(() => ["All", ...allTokens(dr)], [dr]);

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = refCodeRows.filter((r) => {
      if (token !== "All" && !r.tokens.includes(token)) return false;
      if (onlyNotes && !r.notes.trim()) return false;
      if (q) {
        const hay =
          `${r.refCode} ${r.group} ${r.tokens.join(" ")} ${r.notes}`.toLowerCase();
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
  }, [
    query,
    token,
    onlyNotes,
    sort,
    refCodeRows,
    reportMonths,
  ]);

  const filteredTotal = rows.reduce((acc, r) => acc + (r.total ?? 0), 0);

  return (
    <Panel
      title="Calculated distribution rewards by ref code"
      description={`${monthLong(reportMonths[0])} · ${rows.length} of ${refCodeRows.length} ref codes · select a row for its token composition`}
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
            const isOpen = openRefCode === r.refCode;
            return (
              <React.Fragment key={r.refCode}>
                <TableRow
                  id={refCodeFragment(r.refCode).slice(1)}
                  onClick={() =>
                    setOpenRefCode(isOpen ? null : r.refCode)
                  }
                  aria-expanded={isOpen}
                  className="scroll-mt-20 cursor-pointer"
                >
                  <Td className="font-mono font-medium">
                    <button
                      type="button"
                      aria-label={`Token composition for ref code ${r.refCode}`}
                      aria-expanded={isOpen}
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenRefCode(isOpen ? null : r.refCode);
                      }}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <CaretRightIcon
                        aria-hidden
                        className={cn(
                          "size-3.5 shrink-0 text-muted-foreground transition-transform",
                          isOpen && "rotate-90",
                        )}
                      />
                      {r.refCode}
                    </button>
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
                  <Td numeric>
                    {r.notes ? <NoteBadge note={r.notes} /> : null}
                  </Td>
                </TableRow>

                {isOpen ? (
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <Td
                      colSpan={reportMonths.length + 5}
                      className="p-0 first:pl-0 last:pr-0"
                    >
                      <RefCodeDetail refCode={r.refCode} />
                    </Td>
                  </TableRow>
                ) : null}
              </React.Fragment>
            );
          })}
          {rows.length === 0 ? (
            <EmptyRow colSpan={reportMonths.length + 5}>
              {refCodeRows.length === 0
                ? "No distribution rewards recorded for this prime and month."
                : "No ref codes match these filters."}
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

function RefCodeDetail({ refCode }: { refCode: string }) {
  const dr = useDr();
  const month = dr.reportMonths[0];
  const series = seriesForRefCode(dr, refCode);
  const shownTokens = series
    .map((s) => ({ token: s.token, value: s.monthly[month] ?? 0 }))
    .filter((s) => s.value !== 0)
    .sort((a, b) => b.value - a.value);
  const maxToken = Math.max(1, ...shownTokens.map((t) => t.value));
  const monthTotal = shownTokens.reduce((sum, s) => sum + s.value, 0);
  const compositionLabel = monthLong(month);

  return (
    <div className="sticky left-0 w-[min(100%,calc(100vw-2rem))]">
      <div className="grid gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:gap-8">
        {/* left: token composition */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-medium">
              Token composition{" "}
              <span className="font-normal text-muted-foreground">
                · {compositionLabel}
              </span>
            </h3>

          </div>

          <div className="flex flex-col gap-2.5">
            {shownTokens.map((s) => (
              <div
                key={s.token}
                className="grid grid-cols-[6rem_1fr_auto] items-center gap-2 text-xs sm:grid-cols-[7rem_1fr_auto] sm:gap-3 sm:text-sm"
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
            {shownTokens.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No token rewards recorded for this month.
              </p>
            ) : null}
          </div>

          {shownTokens.length > 0 ? (
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
  const header = [
    "ref_code",
    "group",
    ...reportMonths,
    "total",
    "tokens",
    "notes",
  ];
  const body = rows.map((r) => [
    r.refCode,
    r.group,
    ...reportMonths.map((m) => r.monthly[m] ?? ""),
    r.total ?? "",
    r.tokens.join(" "),
    r.notes,
  ]);
  downloadCsv(`soter_${rows[0]?.group.toLowerCase() ?? "prime"}_${reportMonths[0]}_ref_codes.csv`, toCsv(header, body));
}
