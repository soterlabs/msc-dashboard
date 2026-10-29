import { paths } from "../routes.ts";
import { isDailyPrime, isDailyMonth, type DailyMonth, type DailyPrime } from "./types.ts";

export type DailyRoute = { redirectTo: string } | { month: DailyMonth; prime?: DailyPrime; allocation?: string };

export function parseDailyRoute(path: string[], legacyMonth?: unknown): DailyRoute | null {
  if (legacyMonth !== undefined && !isDailyMonth(legacyMonth)) return null;
  if (path.length === 0) return { redirectTo: paths.dailyRevenue(legacyMonth) };
  if (isDailyPrime(path[0]) && path.length === 1) return { redirectTo: paths.dailyRevenue(legacyMonth, path[0]) };
  if (isDailyPrime(path[0]) && isDailyMonth(path[1]) && path.length === 2) {
    if (legacyMonth !== undefined && legacyMonth !== path[1]) return null;
    return { redirectTo: paths.dailyRevenue(path[1], path[0]) };
  }
  if (!isDailyMonth(path[0]) || path.length > 3) return null;
  if (legacyMonth !== undefined && legacyMonth !== path[0]) return null;
  if (path.length >= 2 && !isDailyPrime(path[1])) return null;
  return { month: path[0], prime: path[1] as DailyPrime | undefined, allocation: path[2] };
}
