/**
 * Column contracts for the two files under data/spells/.
 *
 * Same shape as schema/prime-payments.mjs: the header order lives in one place
 * so the writer and any future reader cannot drift.
 */

/** One row per executed core spell. */
export const EXECUTION_COLUMNS = [
  "Cast date",
  "Cast time",
  "Block",
  "Tx hash",
  "Spell address",
  "Spell name",
  "Target",
  "Transfers",
  "Primes paid",
  "USDS to primes",
];

/** One row per ERC-20 Transfer emitted by a spell execution. */
export const TRANSFER_COLUMNS = [
  "Cast date",
  "Tx hash",
  "Log index",
  "Spell address",
  "Token",
  "Symbol",
  "Amount",
  "Kind",
  "From",
  "From name",
  "To",
  "To name",
  "Prime",
];

export const EXECUTIONS_FILE = "executions.csv";
export const TRANSFERS_FILE = "transfers.csv";

/**
 * What a transfer tells us about a prime.
 *
 *   inflow   — a prime wallet received the tokens
 *   outflow  — a prime wallet sent them
 *   ""       — no prime on either side (protocol plumbing: the DAI mint/convert
 *              /burn path a USDS payment travels through, surplus moves, and so on)
 */
export function primeDirection({ fromPrime, toPrime }) {
  if (toPrime) return "inflow";
  if (fromPrime) return "outflow";
  return "";
}
