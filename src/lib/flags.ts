/**
 * Feature flags for the dashboard tabs.
 *
 * A flagged tab is HIDDEN by default and appears only when its variable is set
 * to `true` (or `1`). Hiding is not just cosmetic: src/app/page.tsx skips the
 * dataset load for a hidden tab, so its numbers never reach the page payload.
 *
 * `NEXT_PUBLIC_` because src/components/app-shell.tsx is a client component.
 * Two consequences worth knowing:
 *
 *   - the values are inlined at BUILD time, so flipping a flag needs a rebuild
 *     (a Railway redeploy), not just a restart;
 *   - each variable must be read as a literal `process.env.NEXT_PUBLIC_X`
 *     property access for that inlining to happen — a dynamic
 *     `process.env[name]` lookup silently reads as undefined in the browser.
 */

export interface Flags {
  /** "Prime Payments" — payments to primes, from data/prime/payments.csv. */
  primePayments: boolean;
  /** "Sky Total Net Revenue" — consolidated Sky net revenue (MSC + non-MSC). */
  skyTotalNetRevenue: boolean;
  /** "Buybacks & Burn" — the Smart Burn Engine's buyback, dividend and burn legs. */
  buybacks: boolean;
}

/** Anything other than "true"/"1" (unset included) leaves the tab hidden. */
function on(value: string | undefined): boolean {
  const v = value?.trim().toLowerCase();
  return v === "true" || v === "1";
}

export const FLAGS: Flags = {
  primePayments: on(process.env.NEXT_PUBLIC_SHOW_PRIME_PAYMENTS),
  skyTotalNetRevenue: on(process.env.NEXT_PUBLIC_SHOW_SKY_TOTAL_NET_REVENUE),
  buybacks: on(process.env.NEXT_PUBLIC_SHOW_BUYBACKS),
};
