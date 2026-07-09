"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Dropdown that replaces a native <select>.
 *
 * A native select's popup is drawn by the OS and cannot be styled, so the
 * options list is rendered ourselves. The trigger is a real <button>, which
 * means the focus ring only appears for keyboard navigation — clicking never
 * leaves a ring behind, unlike <select>.
 */
export function Dropdown({
  label,
  value,
  onChange,
  options,
  render,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  render?: (v: string) => string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(() => options.indexOf(value));
  const rootRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const labelId = React.useId();

  const show = (v: string) => (render ? render(v) : v);

  // Close on outside pointer press or Escape.
  React.useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Keep the highlighted option in view as it moves.
  React.useEffect(() => {
    if (!open) return;
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const commit = (i: number) => {
    onChange(options[i]);
    setOpen(false);
  };

  const onTriggerKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setActive(Math.max(0, options.indexOf(value)));
        setOpen(true);
        return;
      }
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + step + options.length) % options.length);
    } else if (e.key === "Enter" || e.key === " ") {
      if (open) {
        e.preventDefault();
        commit(active);
      }
    } else if (e.key === "Home" && open) {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End" && open) {
      e.preventDefault();
      setActive(options.length - 1);
    }
  };

  return (
    <div ref={rootRef} className={cn("relative inline-block", className)}>
      <button
        type="button"
        onClick={() => {
          setActive(Math.max(0, options.indexOf(value)));
          setOpen((o) => !o);
        }}
        onKeyDown={onTriggerKey}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelId}
        className={cn(
          "neu-focus inline-flex h-10 w-full items-center gap-1.5 rounded-full pr-3.5 pl-4",
          open ? "neu-btn-pressed" : "neu-inset-sm"
        )}
      >
        <span
          id={labelId}
          className="font-sans text-[10px] tracking-[0.14em] text-muted uppercase"
        >
          {label}
        </span>
        <span className="font-sans text-[11px] font-medium whitespace-nowrap text-ink">
          {show(value)}
        </span>
        <ChevronDown
          aria-hidden
          className={cn(
            "ml-auto size-3.5 shrink-0 text-faint transition-transform duration-200",
            open && "rotate-180 text-muted"
          )}
        />
      </button>

      {open ? (
        <div
          ref={listRef}
          role="listbox"
          aria-labelledby={labelId}
          tabIndex={-1}
          className="dr-scroll neu-raised absolute top-full left-0 z-30 mt-2 max-h-64 min-w-full overflow-auto rounded-2xl p-1.5"
        >
          {options.map((o, i) => {
            const selected = o === value;
            return (
              <button
                key={o}
                type="button"
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActive(i)}
                onClick={() => commit(i)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left font-sans text-[11px] whitespace-nowrap transition-colors",
                  i === active ? "bg-sunken" : "bg-transparent",
                  selected ? "font-semibold text-ink" : "text-muted"
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    selected ? "bg-wasabi" : "bg-transparent"
                  )}
                />
                {show(o)}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
