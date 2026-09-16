"use client";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { paths } from "@/lib/routes";
import { validMonth } from "@/lib/daily-revenue/domain";
import type { DailyPrime } from "@/lib/daily-revenue/types";

export function DailyMonthPicker({ prime, month, max }: { prime: DailyPrime; month: string; max: string }) {
  const router = useRouter();
  return <label className="flex items-center gap-3 text-sm">Reporting month
    <Input aria-label="Reporting month" type="month" value={month} min="2000-01" max={max} className="w-44"
      onChange={(e) => { if (validMonth(e.target.value) && e.target.value <= max) router.push(paths.dailyRevenue(prime, e.target.value)); }} />
  </label>;
}
