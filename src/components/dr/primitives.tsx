import * as React from "react";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

/* ----------------------------------------------------------- typography */

/**
 * Page title: the subject on one line, its qualifying clause quieter beneath.
 * Setting both on one line needed an em dash to stop them reading as a run-on
 * sentence; stacking them lets the type sizes do that work instead.
 */
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
    <div className={cn("flex flex-col", className)}>
      <h1 className="font-display text-[2rem] leading-[1.1] font-semibold tracking-tight text-ink sm:text-[2.4rem]">
        {children}
      </h1>
      {accent ? (
        <p className="mt-1.5 font-display text-[1.15rem] leading-tight font-normal text-muted sm:text-[1.3rem]">
          {accent}
        </p>
      ) : null}
    </div>
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
    <span className="font-sans text-xs whitespace-nowrap">
      <span className="text-muted">{label} </span>
      <span className="font-medium text-ink tabular-nums">{value}</span>
    </span>
  );
}

export function SectionTitle({
  title,
  note,
  info,
  className,
}: {
  title: React.ReactNode;
  /** Short right-aligned caption. Prefer `info` for anything explanatory. */
  note?: React.ReactNode;
  /** Longer explanation, tucked behind a hover (ⓘ) so it never adds clutter. */
  info?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-1",
        className
      )}
    >
      <h2 className="flex items-center gap-1.5 font-display text-[16px] font-semibold tracking-tight text-ink">
        {title}
        {info ? <InfoTip label={info} /> : null}
      </h2>
      {note ? (
        <p className="font-mono text-[11px] text-muted">{note}</p>
      ) : null}
    </div>
  );
}

/** Small circled "i" whose explanation appears on hover / focus. */
function InfoTip({ label }: { label: string }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className="neu-focus inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-line-strong text-[9px] font-medium text-faint transition-colors hover:border-muted hover:text-muted"
    >
      <span aria-hidden className="translate-y-[0.5px] not-italic">
        i
      </span>
      <span className="sr-only">info</span>
    </button>
  );
}

/* --------------------------------------------------------------- surfaces */

/** Raised cream surface — depth from paired shadows, no border. */
export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("neu-raised rounded-2xl", className)}>{children}</div>
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
    <Card className="px-5 py-4.5">
      <p className="font-sans text-[10.5px] font-medium uppercase tracking-widest text-muted">
        {label}
      </p>
      <p className="mt-2.5 flex items-baseline gap-1.5">
        <span
          className={cn(
            "font-mono text-[1.7rem] leading-none font-semibold tabular-nums",
            accent ? "text-gold" : "text-ink"
          )}
        >
          {value}
        </span>
        {unit ? (
          <span className="font-sans text-xs text-muted">{unit}</span>
        ) : null}
      </p>
      {note ? (
        <p className="mt-3 font-sans text-[11px] leading-relaxed text-muted">
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
      className={cn("inline-block size-2.5 shrink-0 rounded-full", className)}
      style={{ background: color }}
    />
  );
}

/** Soft data pill (token tags, rate families, status). */
export function Pill({
  children,
  color,
  className,
}: {
  children: React.ReactNode;
  /** Optional accent colour for a leading dot. */
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "neu-inset-sm inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10.5px] font-medium whitespace-nowrap text-ink",
        className
      )}
    >
      {color ? (
        <span
          className="inline-block size-1.5 rounded-full"
          style={{ background: color }}
        />
      ) : null}
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ bars */

/** Inline horizontal bar — carved track, rounded fill. */
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
        "neu-inset-sm h-2.5 w-full overflow-hidden rounded-full",
        className
      )}
    >
      <div
        className="h-full rounded-full"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

/** Quiet label/value row — no dotted leader. Used inside summary cards, where
 * three leaders stacked together read as noise. */
export function StatRow({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 font-sans text-[11px]">
      <span className="text-muted">{label}</span>
      <span className="font-mono font-medium text-ink tabular-nums">{value}</span>
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

/** Full-width dark aggregate footer bar — the one high-contrast anchor. */
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
        "flex items-center justify-between gap-4 rounded-2xl bg-ink-deep px-5 py-3.5 shadow-[6px_6px_14px_var(--neu-dark)]",
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
      className="inline-flex cursor-help items-center gap-1 rounded-full bg-gold/12 px-2 py-0.5 font-mono text-[10px] font-medium tracking-wide text-gold"
    >
      <InfoDot />
      NOTE
    </span>
  );
}

/** Muted note line, truncated, full text via title. */
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
      className={cn("text-[13px] leading-relaxed text-muted", className)}
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

/** Filter / tab button — raised when idle, carved in when active. */
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
        "neu-focus inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-mono text-[11px] font-medium tracking-wide whitespace-nowrap",
        active
          ? "neu-btn-pressed font-semibold text-ink"
          : "neu-btn text-muted hover:text-ink",
        className
      )}
    >
      {/* dot slot is always present so toggling never shifts the row */}
      <span
        aria-hidden
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          active ? "bg-wasabi" : "bg-transparent"
        )}
      />
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
