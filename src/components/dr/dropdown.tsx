"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * A labelled select.
 *
 * Was a hand-rolled listbox — a portalled panel with its own placement maths
 * and keyboard handling — because a native <select>'s popup is drawn by the OS
 * and cannot be styled. shadcn's Select solves that with the library's own
 * popup, so all of it is gone. What remains is the dashboard's one addition:
 * the field's name sits inside the trigger next to the current value, because
 * these filters live in a crowded toolbar with no room for a label above.
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
  const show = (v: string) => (render ? render(v) : v);

  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (typeof next === "string") onChange(next);
      }}
    >
      <SelectTrigger aria-label={label} className={cn("gap-2", className)}>
        <span className="text-muted-foreground">{label}</span>
        <SelectValue className="font-medium whitespace-nowrap">
          {(v: string | null) => (v == null ? show(value) : show(v))}
        </SelectValue>
      </SelectTrigger>

      {/* Base UI's Select defaults to the macOS behaviour — it lifts the popup
          so the selected item lands on the trigger, centred. These triggers
          carry a label as well as a value, so that covered the label and spilled
          over the neighbouring control; `alignItemWithTrigger` off with
          `align="start"` drops it below the trigger's left edge instead.

          w-auto releases the popup from the trigger's width, so a long month
          label is never clipped by a narrow control. */}
      <SelectContent
        alignItemWithTrigger={false}
        align="start"
        className="scroll-thin w-auto min-w-(--anchor-width)"
      >
        <SelectGroup>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {show(o)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
