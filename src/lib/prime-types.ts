/**
 * Prime payments — one on-chain payment to a prime per row.
 *
 * Source of truth is data/prime-payments.md; the shape here mirrors that table
 * (parsed by scripts/generate-data.mjs into prime-data.ts).
 */

/** `settlement cycle` closes a monthly accrual; `other` is a genesis/capital transfer. */
export type PrimeKind = "settlement cycle" | "other";

/**
 * How the prime was paid. `spell` mints USDS into a subproxy (no payer — the
 * ERC-20 `from` is the zero address) and carries the spell columns; `transfer`
 * is a plain ERC-20 send from a budget multisig and carries the `from*` columns.
 */
export type PrimeSource = "spell" | "transfer";

export interface PrimePayment {
  /** Date the spell was cast on-chain, `YYYY-MM-DD`. */
  castDate: string;
  /** Prime / agent receiving the payment, e.g. "SPARK". */
  prime: string;
  /** Whole USDS transferred (not wei). */
  usds: number;
  kind: PrimeKind;
  /** Accrual month(s) a settlement cycle covers, e.g. "2026-05"; "" for `other`. */
  settlesAccrual: string;
  /** Wallet that received the funds (subproxy for `spell`, any wallet for `transfer`). */
  receivingWallet: string;
  /** Transaction hash of the payment. */
  txHash: string;
  /**
   * Index of this Transfer event inside the transaction. One transaction can
   * carry several payments — even two to the same wallet — so `txHash` alone
   * does not identify a row; `txHash` + `logIndex` does.
   */
  logIndex: string;
  /** Date the spell itself is dated, `YYYY-MM-DD`; "" for `transfer`. */
  spell: string;
  /** Address of the executed spell; "" for `transfer`. */
  spellAddress: string;
  /** On-chain subproxy constant, e.g. "SPARK_SUBPROXY"; "" for `transfer`. */
  subproxyConstant: string;
  /** Short category label, e.g. "MSC", "Reimbursement", "Genesis Capital". */
  label: string;
  /** Forum post URL for this payment (editorial); empty string if none. */
  reference: string;
  source: PrimeSource;
  /** Payer wallet; "" for `spell` rows, which are minted rather than sent. */
  fromAddress: string;
  /** Human name for the payer, e.g. "Core Council Buffer"; "" for `spell`. */
  fromLabel: string;
  /** Human name for the receiving wallet, e.g. "Grove Reimbursements". */
  toLabel: string;
  /** What the payment covers, per a source document; "" when not stated. */
  lineItem: string;
}
