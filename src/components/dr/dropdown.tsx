"use client";

import * as React from "react";
import { createPortal } from "react-dom";
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

type Anchor = {
  left: number;
  top?: number;
  bottom?: number;
  minWidth: number;
  maxWidth: number;
  maxHeight: number;
};

const EDGE = 8;
const GAP = 8;
const IDEAL_H = 256;

const sameAnchor = (a: Anchor, b: Anchor) =>
  a.left === b.left &&
  a.top === b.top &&
  a.bottom === b.bottom &&
  a.minWidth === b.minWidth &&
  a.maxWidth === b.maxWidth &&
  a.maxHeight === b.maxHeight;

const useIsoLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

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
  const [anchor, setAnchor] = React.useState<Anchor | null>(null);
  const [active, setActive] = React.useState(() => options.indexOf(value));
  const rootRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const labelId = React.useId();
  const listId = `${labelId}-list`;
  const optionId = (i: number) => `${labelId}-opt-${i}`;

  const show = (v: string) => (render ? render(v) : v);

  /** The panel is portalled out of the root, so "inside" spans both subtrees. */
  const inside = React.useCallback(
    (n: Node | null) =>
      !!n && (!!rootRef.current?.contains(n) || !!listRef.current?.contains(n)),
    []
  );

  const measure = React.useCallback((): Anchor | null => {
    const t = triggerRef.current?.getBoundingClientRect();
    if (!t) return null;
    const { innerWidth: vw, innerHeight: vh } = window;

    const roomBelow = vh - t.bottom - GAP - EDGE;
    const roomAbove = t.top - GAP - EDGE;
    // Flip up only when below can't hold a full panel and above holds more.
    const up = roomBelow < IDEAL_H && roomAbove > roomBelow;

    const maxWidth = vw - 2 * EDGE;
    // Once mounted the panel may be wider than its trigger (long month labels).
    const panelW = Math.min(listRef.current?.offsetWidth ?? t.width, maxWidth);
    const left = Math.min(Math.max(EDGE, t.left), Math.max(EDGE, vw - EDGE - panelW));

    return {
      left,
      top: up ? undefined : t.bottom + GAP,
      bottom: up ? vh - t.top + GAP : undefined,
      minWidth: t.width,
      maxWidth,
      maxHeight: Math.max(96, Math.min(IDEAL_H, up ? roomAbove : roomBelow)),
    };
  }, []);

  const openMenu = () => {
    setActive(Math.max(0, options.indexOf(value)));
    setAnchor(measure());
    setOpen(true);
  };

  React.useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!inside(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, inside]);

  const place = React.useCallback(
    () =>
      setAnchor((cur) => {
        const next = measure();
        if (!next || !cur) return next;
        return sameAnchor(next, cur) ? cur : next;
      }),
    [measure]
  );

  useIsoLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  React.useEffect(() => {
    if (!open) return;
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, place]);

  // Keep the highlighted option in view as it moves.
  React.useEffect(() => {
    if (!open) return;
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const commit = (i: number) => {
    onChange(options[i]);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onTriggerKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        openMenu();
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
    <div
      ref={rootRef}
      onBlur={(e) => {
        if (!inside(e.relatedTarget)) setOpen(false);
      }}
      className={cn("relative inline-block", className)}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onTriggerKey}
        role="combobox"
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-expanded={open}
        aria-labelledby={labelId}
        aria-activedescendant={open ? optionId(active) : undefined}
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

      {open && anchor
        ? createPortal(
            <div
              ref={listRef}
              id={listId}
              role="listbox"
              aria-labelledby={labelId}
              style={{
                position: "fixed",
                left: anchor.left,
                top: anchor.top,
                bottom: anchor.bottom,
                minWidth: anchor.minWidth,
                maxWidth: anchor.maxWidth,
                maxHeight: anchor.maxHeight,
              }}
              className="dr-scroll neu-raised z-30 overflow-auto rounded-2xl p-1.5"
            >
              {options.map((o, i) => {
                const selected = o === value;
                return (
                  <button
                    key={o}
                    type="button"
                    id={optionId(i)}
                    role="option"
                    tabIndex={-1}
                    aria-selected={selected}
                    onMouseEnter={() => setActive(i)}
                    onPointerDown={(e) => e.preventDefault()}
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
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
