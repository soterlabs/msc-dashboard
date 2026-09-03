"use client";

import * as React from "react";
import { InfoIcon } from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import { ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { Dropdown } from "./dr/dropdown";

/**
 * The console's shared vocabulary.
 *
 * Every piece here is a thin arrangement of components/ui — nothing invents a
 * surface, a colour or a type size. The rules the whole dashboard follows:
 *
 *   · one type ramp, all from Tailwind's own steps —
 *     page title `text-2xl`, KPI figure `text-3xl`, card title `text-base`,
 *     prose and tables `text-sm`. No uppercase micro-labels, no
 *     letter-spacing tricks, no arbitrary pixel sizes.
 *   · figures are set in the text face with `tabular-nums`; the mono face is
 *     reserved for machine identifiers (addresses, tx hashes, ref codes).
 *   · a border only ever separates two things — a row from the next row, a
 *     header from its body. Nothing is outlined merely to have an edge; a
 *     raised surface takes the preset's hairline ring and shadow instead.
 *     Badges are filled and borderless wherever they appear — a card's action
 *     slot or a table cell — so a tag reads as one kind of object.
 *   · state is shown by fill, never by a dot: idle controls take a tint of
 *     --input, the selected one a solid --primary. --primary is stone, so the
 *     interface carries no hue and selecting a thing says nothing about it.
 *     A filter carrying a series colour is the one that cannot invert, so it
 *     moves three quiet cues at once instead — fill, label, swatch brightness.
 *   · a figure is never coloured for emphasis, and only a fall is coloured at
 *     all: --destructive means "down", a rise is left in the text colour. A
 *     headline painted green reads as growth whether or not the number grew.
 *   · figures carry three levels, and the quiet one is still readable:
 *       headline   `font-semibold text-foreground`  — the bottom line
 *       primary    `font-medium text-foreground`    — the column you came for
 *       supporting `text-muted-foreground`          — components, shares, counts
 *     The quiet level is the muted token at 8.15:1, never an alpha fade — an
 *     alpha fade hides a figure from the reader, not just from the
 *     composition.
 *   · a table inside a card is flush to the card's edges, and its outer cells
 *     take `px-6` so no text ever crowds the card's radius.
 */

/* ------------------------------------------------------------------ header */

export interface Meta {
  label: string;
  value: React.ReactNode;
}

/** Page heading: title, one-line qualifier, and the run's key figures. */
export function PageHeader({
  title,
  description,
  meta,
  actions,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  meta?: Meta[];
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>

      {meta?.length || actions ? (
        <div
          className={cn(
            "flex flex-wrap items-center gap-x-3 gap-y-2 lg:justify-end",
            !actions && "max-sm:hidden",
          )}
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 max-sm:hidden">
            {meta?.map((m, i) => (
              <React.Fragment key={m.label}>
                {i > 0 ? (
                  <Separator
                    orientation="vertical"
                    className="hidden data-[orientation=vertical]:h-4 sm:block"
                  />
                ) : null}
                <MetaStat label={m.label} value={m.value} />
              </React.Fragment>
            ))}
          </div>
          {actions ? <div className="ml-1 flex gap-2">{actions}</div> : null}
        </div>
      ) : null}
    </div>
  );
}

/** Inline "label value" pair. */
export function MetaStat({ label, value }: Meta) {
  return (
    <span className="flex items-baseline gap-1.5 text-sm whitespace-nowrap">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </span>
  );
}

/* ------------------------------------------------------------------- cards */

/**
 * KPI tile, in shadcn's section-card shape: description above, figure as the
 * card title, footnote below.
 * `@container/card` lets the figure grow once the tile itself has room.
 */
export function StatCard({
  label,
  value,
  unit,
  note,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  unit?: string;
  note?: React.ReactNode;
}) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[16rem]/card:text-3xl">
          {value}
          {unit ? (
            <span className="ml-1.5 text-sm font-normal text-muted-foreground">
              {unit}
            </span>
          ) : null}
        </CardTitle>
      </CardHeader>
      {note ? (
        <CardFooter className="text-sm text-muted-foreground">
          {note}
        </CardFooter>
      ) : null}
    </Card>
  );
}

/**
 * A titled section. `flush` drops the content padding for tables and charts
 * that should meet the card's edges; `Th`/`Td` put the inset back where the
 * text needs it.
 */
export function Panel({
  title,
  description,
  hint,
  action,
  footer,
  flush,
  className,
  contentClassName,
  children,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  hint?: string;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  flush?: boolean;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={className}>
      {title || description || action ? (
        <CardHeader
          className={cn(
            "grid-cols-1! sm:grid-cols-[1fr_auto]!",
            flush && "border-b pb-6",
          )}
        >
          {title ? (
            <CardTitle className="flex items-center gap-1.5">
              {title}
              {hint ? <Hint label={hint} /> : null}
            </CardTitle>
          ) : null}
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
          {action ? (
            <CardAction className="col-start-1 row-start-3 justify-self-start sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:justify-self-end">
              {action}
            </CardAction>
          ) : null}
        </CardHeader>
      ) : null}
      {/* flex-1 keeps a footer on the card's floor, so a row of panels lines
          its totals up however tall each one's body happens to be. */}
      <CardContent
        className={cn(flush && "px-0", footer && "flex-1", contentClassName)}
      >
        {children}
      </CardContent>
      {footer ? (
        <CardFooter className="border-t pt-6 text-sm text-muted-foreground">
          {footer}
        </CardFooter>
      ) : null}
    </Card>
  );
}

/* ------------------------------------------------------------------- bits */

/** Small "i" whose explanation appears in a tooltip on hover or focus. */
export function Hint({ label }: { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={label}
            className="text-muted-foreground hover:text-foreground"
          />
        }
      >
        <InfoIcon aria-hidden />
      </TooltipTrigger>
      <TooltipContent className="max-w-sm text-pretty">{label}</TooltipContent>
    </Tooltip>
  );
}

/** Series swatch, drawn exactly as shadcn's own chart legend draws it. */
export function Swatch({
  color,
  className,
}: {
  color: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      data-swatch=""
      className={cn(
        "size-2.5 shrink-0 rounded-[2px] transition-opacity",
        className,
      )}
      style={{ background: color }}
    />
  );
}

/** Series swatch + label, for a legend outside a chart. */
export function LegendItem({
  color,
  children,
  className,
}: {
  color: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 text-xs text-muted-foreground",
        className,
      )}
    >
      <Swatch color={color} />
      {children}
    </span>
  );
}

/** A note carried on a badge, with the full text in a tooltip. */
export function NoteBadge({ note }: { note: string }) {
  if (!note) return null;
  return (
    <Tooltip>
      <TooltipTrigger
        render={<Badge variant="secondary" className="cursor-help gap-1" />}
      >
        <InfoIcon aria-hidden />
        Note
      </TooltipTrigger>
      <TooltipContent className="max-w-sm text-pretty">{note}</TooltipContent>
    </Tooltip>
  );
}

/** Proportion bar for a table cell — shadcn's Progress, tinted per series. */
export function Bar({
  value,
  max,
  color,
  label,
  className,
}: {
  value: number;
  max: number;
  color: string;
  label?: string;
  className?: string;
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <Progress
      value={pct}
      aria-label={label}
      // Progress renders its own track and indicator, so the series colour
      // reaches the indicator as a custom property rather than a prop.
      style={{ "--bar": color } as React.CSSProperties}
      className={cn(
        "w-full [&_[data-slot=progress-indicator]]:rounded-full [&_[data-slot=progress-indicator]]:bg-(--bar) [&_[data-slot=progress-track]]:h-1.5",
        className,
      )}
    />
  );
}

/** Small figure in its own tile — used where two stats sit beside a chart. */
export function MiniStat({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-muted/50 p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium tabular-nums">{value}</dd>
    </div>
  );
}

/** Muted paragraph — long-form explanation inside a card. */
export function Prose({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn("text-sm leading-relaxed text-muted-foreground", className)}
    >
      {children}
    </p>
  );
}

/**
 * Placeholder for a missing figure. Quiet, but not faded: at 50% alpha it sat
 * at 2.65:1 on a card, well under AA, which is not a thing to do to a symbol
 * that means "no data".
 */
export function Dash() {
  return <span className="text-muted-foreground">—</span>;
}

/* ----------------------------------------------------------------- filters */

/**
 * Every control that lives in a toolbar — filter chip, select, search field,
 * secondary action — rests on the same tint of --input and carries no border,
 * which is the preset's own logic: it dresses inputs in a fill and reserves
 * borders for dividers.
 */
const CONTROL_IDLE =
  "border-transparent bg-input/50 text-muted-foreground hover:bg-input hover:text-foreground";

/**
 * Filter state, in two flavours, both borderless: shadcn dresses a control at
 * rest in a fill and keeps its border transparent, so an outlined chip beside a
 * filled search field and three filled dropdowns is the odd one out.
 *
 * Plain filters go from the toolbar's resting fill to a solid --primary.
 * shadcn's own `aria-pressed:bg-muted` is about a dozen values from the rest
 * state, too quiet for controls that silently change every figure below them.
 */
const FILTER_STATE = [
  CONTROL_IDLE,
  "aria-pressed:bg-primary aria-pressed:text-primary-foreground",
  "aria-pressed:hover:bg-primary/90 aria-pressed:hover:text-primary-foreground",
].join(" ");

/**
 * A filter carrying a series colour is a legend as much as a control, so it
 * cannot take the solid fill above: inverting the chip puts the swatch on a
 * ground it was never chosen against. It is shadcn's default Toggle unchanged,
 * and gets its legibility from three cues moving at once instead of one moving
 * far — fill, label contrast, and swatch brightness.
 */
const SERIES_FILTER_STATE = [
  "border-transparent bg-transparent text-muted-foreground",
  "hover:bg-muted hover:text-foreground",
  "aria-pressed:bg-muted aria-pressed:text-foreground",
  "[&_[data-swatch]]:opacity-30 aria-pressed:[&_[data-swatch]]:opacity-100",
].join(" ");

export function FilterToggle({
  className,
  ...props
}: React.ComponentProps<typeof Toggle>) {
  return (
    <Toggle size="sm" className={cn(FILTER_STATE, className)} {...props} />
  );
}

/** Secondary action in a toolbar — same resting surface as the filters. */
export function ActionButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(CONTROL_IDLE, className)}
      {...props}
    />
  );
}

export function MonthPicker({
  value,
  onChange,
  months,
  render,
  label = "Month",
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (m: string) => void;
  months: string[];
  render: (m: string) => string;
  label?: string;
  "aria-label"?: string;
}) {
  return (
    <>
      <Dropdown
        label={label}
        value={value}
        onChange={onChange}
        options={months}
        render={render}
        className="h-8 sm:hidden"
      />
      <FilterGroup
        value={[value]}
        onValueChange={(v) => v[0] && onChange(v[0])}
        aria-label={ariaLabel ?? label}
        className="max-sm:hidden"
      >
        {months.map((m) => (
          <FilterItem key={m} value={m}>
            {render(m)}
          </FilterItem>
        ))}
      </FilterGroup>
    </>
  );
}

export function FilterGroup({
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroup>) {
  return (
    <ToggleGroup size="sm" className={cn("flex-wrap", className)} {...props} />
  );
}

export function FilterItem({
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroupItem>) {
  return <ToggleGroupItem className={cn(FILTER_STATE, className)} {...props} />;
}

/** A filter whose chip carries a series colour — a legend you can click. */
export function SeriesFilterItem({
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroupItem>) {
  return (
    <ToggleGroupItem
      className={cn(SERIES_FILTER_STATE, className)}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ tables */

export { TableBody, TableHeader, TableRow };

/**
 * Table skin for the console. Left on shadcn's own `text-sm`: the ledgers were
 * dropped to `text-xs` to fit more columns without scrolling, but they scroll
 * anyway, so the density bought nothing and cost legibility.
 */
export function DataTable({
  className,
  children,
  containerClassName,
}: {
  className?: string;
  children: React.ReactNode;
  containerClassName?: string;
}) {
  return (
    <div className={cn("scroll-thin w-full overflow-auto", containerClassName)}>
      <Table className={className}>{children}</Table>
    </div>
  );
}

export function Th({
  className,
  numeric,
  ...props
}: React.ComponentProps<typeof TableHead> & { numeric?: boolean }) {
  return (
    <TableHead
      className={cn(
        "h-10 px-4 text-sm font-medium text-muted-foreground first:pl-6 last:pr-6",
        numeric && "text-right",
        className,
      )}
      {...props}
    />
  );
}

export function Td({
  className,
  numeric,
  ...props
}: React.ComponentProps<typeof TableCell> & { numeric?: boolean }) {
  return (
    <TableCell
      className={cn(
        "px-4 py-2.5 first:pl-6 last:pr-6",
        numeric && "text-right tabular-nums",
        className,
      )}
      {...props}
    />
  );
}

/** Full-width "nothing matches" row. */
export function EmptyRow({
  colSpan,
  children,
}: {
  colSpan: number;
  children: React.ReactNode;
}) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell
        colSpan={colSpan}
        className="h-24 text-center text-sm text-muted-foreground"
      >
        {children}
      </TableCell>
    </TableRow>
  );
}

/**
 * Summary line under a table — the filtered or aggregate total. A quiet strip
 * rather than a slab: the figures above are the subject, this is the sum.
 */
export function TotalRow({
  label,
  value,
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 px-6 py-3 text-sm",
        className,
      )}
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ charts */

type TooltipFormatter = NonNullable<
  React.ComponentProps<typeof ChartTooltipContent>["formatter"]
>;

/**
 * Tooltip rows for a chart whose values are money.
 *
 * shadcn's default row prints `value.toLocaleString()` in the mono face, which
 * loses the currency and breaks the "figures are set in the text face" rule —
 * so the row is rebuilt here with the series' own swatch, its label from
 * `labels`, and the same formatter the tables use.
 */
export function moneyTooltip(
  labels: Record<string, string>,
  format: (n: number) => string,
): TooltipFormatter {
  const Rows: TooltipFormatter = (value, name, item) => (
    <>
      <span
        aria-hidden
        className="size-2.5 shrink-0 rounded-[2px]"
        style={{ background: (item as { color?: string })?.color }}
      />
      <span className="flex flex-1 items-center justify-between gap-4 leading-none">
        <span className="text-muted-foreground">
          {labels[String(name)] ?? String(name)}
        </span>
        <span className="font-medium text-foreground tabular-nums">
          {format(Number(value))}
        </span>
      </span>
    </>
  );
  return Rows;
}
