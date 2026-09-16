"use client";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { paths } from "@/lib/routes";
import { validMonth } from "@/lib/daily-revenue/calendar";
import type { DailyPrime } from "@/lib/daily-revenue/types";

export function DailyMonthPicker({ prime, month, max }: { prime: DailyPrime; month: string; max: string }) {
  const router = useRouter();
  // Uncontrolled, keyed on the month it was rendered for: a month is typed one
  // segment at a time, and a value controlled straight off the prop would
  // revert on every keystroke that does not yet parse, leaving the native
  // picker as the only way in. The key remounts it once navigation lands.
  return <label className="flex items-center gap-3 text-sm">Reporting month
    <Input key={month} aria-label="Reporting month" type="month" defaultValue={month} min="2000-01" max={max} className="w-44"
      onChange={(e) => { if (validMonth(e.target.value) && e.target.value <= max) router.push(paths.dailyRevenue(prime, e.target.value)); }} />
  </label>;
}
