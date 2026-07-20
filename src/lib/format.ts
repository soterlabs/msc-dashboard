/**
 * Number / currency formatting for the Sky DR console.
 *
 * Money is grouped with thin spaces ("$1 234 567"). Big headline figures use a
 * compact form ("$6.73M", "$797K"); table cells stay precise.
 */

/** Group integer thousands with a regular space: 1234567 → "1 234 567". */
export function groupSpaces(value: number): string {
  const negative = value < 0;
  const n = Math.abs(Math.round(value));
  const grouped = String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return negative ? `-${grouped}` : grouped;
}

/** Whole-dollar, space-grouped: "$1 234 567". */
export function formatUSD(value: number | null | undefined): string {
  if (value == null) return "—";
  return `$${groupSpaces(value)}`;
}

/** Two-decimal, space-grouped for precise table cells: "$1 234.56". */
export function formatUSD2(value: number | null | undefined): string {
  if (value == null) return "—";
  const negative = value < 0;
  const abs = Math.abs(value);
  const whole = Math.floor(abs);
  const cents = (abs - whole).toFixed(2).slice(1); // ".56"
  return `${negative ? "-" : ""}$${groupSpaces(whole)}${cents}`;
}

/**
 * Compact headline money: "$1.07B", "$6.73M", "$797K", "$842".
 * Sub-$1 values that are not exactly zero collapse to "<$1".
 */
export function formatCompactUSD(value: number | null | undefined): string {
  if (value == null) return "—";
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) {
    const b = abs / 1_000_000_000;
    return `${sign}$${b < 10 ? b.toFixed(2) : b.toFixed(1)}B`;
  }
  if (abs >= 1_000_000) {
    const m = abs / 1_000_000;
    return `${sign}$${m < 10 ? m.toFixed(2) : m.toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    const k = abs / 1_000;
    return `${sign}$${k < 100 ? k.toFixed(1) : Math.round(k)}K`;
  }
  if (abs > 0 && abs < 1) return `${sign}<$1`;
  return `${sign}$${Math.round(abs)}`;
}

/** Whole-token, space-grouped, no currency symbol: "1 234 567" (USDS etc.). */
export function formatTokens(value: number | null | undefined): string {
  if (value == null) return "—";
  return groupSpaces(value);
}

/** Compact token amount, no symbol: "1.07B", "6.73M", "797K", "842". */
export function formatCompactTokens(value: number | null | undefined): string {
  if (value == null) return "—";
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) {
    const b = abs / 1_000_000_000;
    return `${sign}${b < 10 ? b.toFixed(2) : b.toFixed(1)}B`;
  }
  if (abs >= 1_000_000) {
    const m = abs / 1_000_000;
    return `${sign}${m < 10 ? m.toFixed(2) : m.toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    const k = abs / 1_000;
    return `${sign}${k < 100 ? k.toFixed(1) : Math.round(k)}K`;
  }
  if (abs > 0 && abs < 1) return `${sign}<1`;
  return `${sign}${Math.round(abs)}`;
}

/** Decimal rate → percent: 0.005 → "0.50%", 0.001998 → "0.20%". */
export function formatRatePercent(
  value: number | null | undefined,
  digits = 2
): string {
  if (value == null) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

/** Share/percent already on a 0–100 scale. */
export function formatPercent(value: number, withSign = false): string {
  const sign = withSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

/** Month-over-month delta as a signed percent, or "—" when undefined. */
export function formatMoM(
  current: number | null,
  previous: number | null
): { label: string; trend: "up" | "down" } | null {
  if (current == null || previous == null || previous === 0) return null;
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  return {
    label: `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`,
    trend: pct >= 0 ? "up" : "down",
  };
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "2026-03" → "Mar". */
export function monthShort(ym: string): string {
  const m = Number(ym.slice(5, 7));
  return MONTH_NAMES[m - 1] ?? ym;
}

/** "2026-03" → "Mar 2026". */
export function monthLong(ym: string): string {
  return `${monthShort(ym)} ${ym.slice(0, 4)}`;
}

/** Shorten an EVM address: 0x1234…cdef. */
export function shortAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
