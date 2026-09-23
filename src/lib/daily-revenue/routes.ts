import { paths } from "../routes.ts";
import { isDailyPrime, SEPTEMBER_MONTH, type DailyPrime } from "./types.ts";

export type DailyRoute = { redirectTo: string } | { month: typeof SEPTEMBER_MONTH; prime?: DailyPrime; allocation?: string };

export function parseDailyRoute(path: string[], legacyMonth?: unknown): DailyRoute | null {
  // A month query belonged to the former prime-first route. Accept only the
  // one month this report supports; never silently replace another selection.
  if (legacyMonth !== undefined && legacyMonth !== SEPTEMBER_MONTH) return null;
  if (path.length === 0) return { redirectTo: paths.dailyRevenue() };
  if (isDailyPrime(path[0]) && path.length === 1) return { redirectTo: paths.dailyRevenue(SEPTEMBER_MONTH, path[0]) };
  if (isDailyPrime(path[0]) && path[1] === SEPTEMBER_MONTH && path.length === 2) return { redirectTo: paths.dailyRevenue(SEPTEMBER_MONTH, path[0]) };
  if (path[0] !== SEPTEMBER_MONTH || path.length > 3) return null;
  if (path.length >= 2 && !isDailyPrime(path[1])) return null;
  return { month: SEPTEMBER_MONTH, prime: path[1] as DailyPrime | undefined, allocation: path[2] };
}
