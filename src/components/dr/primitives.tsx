import * as React from "react";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

/* ----------------------------------------------------------- typography */

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-gold",
        className
      )}
    >
      {children}
    </p>
  );
}

/** Big serif page title with an optional gold-italic accent clause. */
export function DisplayTitle({
  children,
  accent,
  className,
}: {
  children: React.ReactNode;
  accent?: React.ReactNode;
  className?: string;
}) {
  return (
    <h1
      className={cn(
        "font-serif text-[2rem] leading-tight font-semibold tracking-tight text-ink sm:text-[2.4rem]",
        className
      )}
    >
      {children}
      {accent ? (
        <>
          {" "}
          <span className="font-normal text-gold">{accent}</span>
        </>
      ) : null}
    </h1>
  );
}

/** Inline "label value" meta pair (mono). */
export function MetaItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <span className="font-mono text-xs whitespace-nowrap">
      <span className="text-muted">{label} </span>
      <span className="font-medium text-ink">{value}</span>
    </span>
  );
}

export function SectionTitle({
  title,
  note,
  className,
}: {
  title: React.ReactNode;
  note?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-1",
        className
      )}
    >
      <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
      {note ? (
        <p className="font-mono text-[11px] text-muted">{note}</p>
      ) : null}
    </div>
  );
}

/* --------------------------------------------------------------- surfaces */

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-md border border-line bg-card", className)}>
      {children}
    </div>
  );
}

/** KPI card: mono eyebrow label, big mono figure + unit, sub note. */
export function KpiCard({
  label,
  value,
  unit,
  note,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  unit?: string;
  note?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <Card className="px-5 py-4">
      <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
      <p className="mt-2 flex items-baseline gap-1.5">
        <span
          className={cn(
            "font-mono text-[1.7rem] leading-none font-semibold tabular-nums",
            accent ? "text-gold" : "text-ink"
          )}
        >
          {value}
        </span>
        {unit ? (
          <span className="font-mono text-xs text-muted">{unit}</span>
        ) : null}
      </p>
      {note ? (
        <p className="mt-2.5 font-mono text-[11px] leading-relaxed text-muted">
          {note}
        </p>
      ) : null}
    </Card>
  );
}

/* ----------------------------------------------------------------- chips */

/** Small colour chip (group / token swatch). */
export function Swatch({
  color,
  className,
}: {
  color: string;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-block size-2.5 shrink-0 rounded-[2px]", className)}
      style={{ background: color }}
    />
  );
}

/** Outlined data pill (token tags, rate families, status). */
export function Pill({
  children,
  color,
  className,
}: {
  children: React.ReactNode;
  /** Optional accent colour for a leading dot + border tint. */
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[4px] border border-line-strong bg-card px-1.5 py-0.5 font-mono text-[10.5px] font-medium whitespace-nowrap text-ink",
        className
      )}
    >
      {color ? (
        <span
          className="inline-block size-1.5 rounded-[1px]"
          style={{ background: color }}
        />
      ) : null}
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ bars */

/** Inline horizontal bar (table cells, allocation depth). */
export function Bar({
  value,
  max,
  color,
  className,
}: {
  value: number;
  max: number;
  color: string;
  className?: string;
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div
      className={cn(
        "h-2.5 w-full overflow-hidden rounded-[2px] bg-track",
        className
      )}
    >
      <div
        className="h-full rounded-[2px]"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

/** Label …… value row with a dotted leader (card detail rows). */
export function LeaderRow({
  label,
  value,
  valueClassName,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-baseline gap-2 font-mono text-xs">
      <span className="text-muted">{label}</span>
      <span className="mb-[3px] flex-1 border-b border-dotted border-line-strong" />
      <span className={cn("font-medium text-ink tabular-nums", valueClassName)}>
        {value}
      </span>
    </div>
  );
}

/** Full-width dark aggregate footer bar. */
export function DarkBar({
  left,
  right,
  className,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-md bg-ink-deep px-5 py-3.5",
        className
      )}
    >
      <span className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-ondark-muted">
        {left}
      </span>
      <span className="font-mono text-sm font-semibold text-gold-soft">
        {right}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ notes */

/** Compact gold "NOTE" tag — full text via native title (never clips). */
export function NoteTag({ note }: { note: string }) {
  if (!note) return null;
  return (
    <span
      title={note}
      className="inline-flex cursor-help items-center gap-1 rounded-[4px] border border-gold/35 bg-gold/10 px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-wide text-gold"
    >
      <InfoDot />
      NOTE
    </span>
  );
}

/** Muted serif-italic note line, truncated, full text via title. */
export function NoteText({
  note,
  className,
}: {
  note: string;
  className?: string;
}) {
  if (!note) return null;
  return (
    <p
      title={note}
      className={cn(
        "font-serif text-[13px] leading-relaxed text-muted italic",
        className
      )}
    >
      {note}
    </p>
  );
}

function InfoDot() {
  return (
    <span className="inline-flex size-3 items-center justify-center rounded-full border border-gold/50 text-[8px] leading-none not-italic">
      i
    </span>
  );
}

/* --------------------------------------------------------- controls */

/** Pill-style filter / tab button (active = dark navy). */
export function FilterButton({
  active,
  children,
  onClick,
  className,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-[5px] border px-3 py-1.5 font-mono text-[11px] font-medium tracking-wide whitespace-nowrap transition-colors",
        active
          ? "border-ink-deep bg-ink-deep text-ondark"
          : "border-line-strong bg-card text-muted hover:border-ink/40 hover:text-ink",
        className
      )}
    >
      {children}
    </button>
  );
}

/** Right-aligned count badge for buttons/labels. */
export function CountBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-1 font-mono text-[10px] text-current opacity-60">
      {children}
    </span>
  );
}

/* ------------------------------------------------------- docs + tags */

/** External documentation link — gold, with a trailing up-right arrow. */
export function DocLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1 font-mono text-[11px] font-medium text-gold underline-offset-2 hover:underline",
        className
      )}
    >
      {children}
      <ArrowUpRight className="size-3" />
    </a>
  );
}

