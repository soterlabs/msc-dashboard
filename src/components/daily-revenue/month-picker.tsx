"use client";

import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { paths } from "@/lib/routes";
import type { DailyPrime } from "@/lib/daily-revenue/types";

const label = (month: string) => new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

export function DailyMonthPicker({ prime, month, availableMonths }: { prime?: DailyPrime; month: string; availableMonths: string[] }) {
  const router = useRouter();
  return <div className="flex items-center gap-3 text-sm">
    <span className="text-muted-foreground">Reporting month</span>
    <Select value={month} onValueChange={(value) => { if (value) router.push(paths.dailyRevenue(prime, value)); }}>
      <SelectTrigger aria-label="Reporting month"><SelectValue>{label(month)}</SelectValue></SelectTrigger>
      <SelectContent alignItemWithTrigger={false} align="end" sideOffset={6}><SelectGroup>
        {availableMonths.map((value) => <SelectItem key={value} value={value}>{label(value)}</SelectItem>)}
        {!availableMonths.includes(month) && <SelectItem value={month} disabled>{label(month)} · No data</SelectItem>}
      </SelectGroup></SelectContent>
    </Select>
  </div>;
}
