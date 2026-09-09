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

/**
 * ["2026-01" … "2026-07"] → "Jan–Jul 2026"; a range spanning years keeps both
 * ("Nov 2025 – Feb 2026"). Derived from the data rather than written into the
 * views, which is how they went on claiming "Jan–May 2026" two months on.
 */
export function monthRangeLabel(months: string[]): string {
  if (!months.length) return "—";
  const [first, last] = [months[0], months[months.length - 1]];
  if (first === last) return monthLong(first);
  return first.slice(0, 4) === last.slice(0, 4)
    ? `${monthShort(first)}–${monthShort(last)} ${last.slice(0, 4)}`
    : `${monthLong(first)} – ${monthLong(last)}`;
}

/** "2026-07-09" → "9 Jul 2026". Parsed by hand: no timezone to shift it. */
export function dayLong(ymd: string): string {
  const [y, m, d] = ymd.split("-");
  const name = MONTH_NAMES[Number(m) - 1];
  return name ? `${Number(d)} ${name} ${y}` : ymd;
}

/**
 * A SKY price, six decimals: "0.062997". SKY trades in cents of a cent, so the
 * usual two would round every month in the series to the same figure.
 */
export function formatPrice6(value: number | null | undefined): string {
  if (value == null) return "—";
  return value.toFixed(6);
}

/**
 * An ISO-8601 instant as "9 Sep 2026 11:56 UTC".
 *
 * Always UTC, and labelled: these are on-chain times, and the same kick shown
 * in the reader's local zone would not match the block explorer they check it
 * against.
 */
export function formatUtc(iso: string | null | undefined, withTime = true): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const date = `${d.getUTCDate()} ${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  if (!withTime) return date;
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${date} ${hh}:${mm} UTC`;
}

/** Shorten an EVM address: 0x1234…cdef. */
export function shortAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
