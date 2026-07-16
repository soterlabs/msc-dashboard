/**
 * Spell payments to prime subproxies — one on-chain spell payment per row.
 *
 * Source of truth is data/spell-payments-to-prime-subproxies.md; the shape here
 * mirrors that table (parsed by scripts/generate-data.mjs into spell-data.ts).
 */

/** `settlement cycle` closes a monthly accrual; `other` is a genesis/capital transfer. */
export type SpellKind = "settlement cycle" | "other";

export interface SpellPayment {
  /** Date the spell was cast on-chain, `YYYY-MM-DD`. */
  castDate: string;
  /** Prime / agent receiving the payment, e.g. "SPARK". */
  prime: string;
  /** Whole USDS transferred (not wei). */
  usds: number;
  kind: SpellKind;
  /** Accrual month(s) a settlement cycle covers, e.g. "2026-05"; "" for `other`. */
  settlesAccrual: string;
  /** Subproxy wallet that received the funds. */
  receivingWallet: string;
  /** Transaction hash of the payment. */
  txHash: string;
  /** Date the spell itself is dated, `YYYY-MM-DD`. */
  spell: string;
  /** Address of the executed spell. */
  spellAddress: string;
  /** On-chain subproxy constant, e.g. "SPARK_SUBPROXY". */
  subproxyConstant: string;
  /** Human-readable spell section / title. */
  section: string;
}
