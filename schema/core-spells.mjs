/**
 * Column contracts and the transfer taxonomy for the two files under
 * data/spells/.
 *
 * Same shape as schema/prime-payments.mjs: header order lives in one place so
 * the writer and any future reader cannot drift.
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
  "Movement",
  "Tag",
  "Coverage",
  "From",
  "From name",
  "From prime",
  "To",
  "To name",
  "To prime",
];

export const EXECUTIONS_FILE = "executions.csv";
export const TRANSFERS_FILE = "transfers.csv";

/**
 * What a transfer is, in one word.
 *
 * Derived from the parties, the token and the amount — never guessed from
 * intent. Where a transfer is already recorded in data/prime/payments.csv the
 * hand-curated Label there wins instead, because a human decided it.
 *
 * The list is closed on purpose: a movement that fits none of these should turn
 * up as `unclassified` and be looked at, not be absorbed into a vague bucket.
 */
export const TAGS = {
  /** USDS minted into a prime's subproxy to settle a monthly accrual. */
  "msc-payment": "settlement-cycle payment to a prime",
  /** USDS minted into a prime's subproxy outside a cycle: genesis or top-up capital. */
  "capital-transfer": "capital minted into a prime, not a settlement cycle",
  /**
   * Tokens minted into a prime that payments.csv has not recorded yet.
   *
   * Deliberately NOT split into msc-payment vs capital-transfer: the transfer
   * itself does not say which, only the accrual it settles does, and that is a
   * human judgement recorded in payments.csv. Every row with this tag is a row
   * somebody should classify — which is the point of having it.
   */
  "prime-mint": "minted into a prime, not yet classified in payments.csv",
  /** One prime's wallet to a different prime's — e.g. Spark → Grove for the Ethena position. */
  "cross-prime": "between two different primes",
  /** Between two wallets of the same prime. */
  "intra-prime": "between wallets of one prime",
  /** A prime sent tokens somewhere that is not a prime — deploying into a venue, paying a counterparty. */
  "prime-outflow": "out of a prime to a non-prime address",
  /** A prime received tokens from somewhere that is not a prime, and not by minting. */
  "prime-inflow": "into a prime from a non-prime address",
  /**
   * A sub-unit or 1-unit movement to or from a prime.
   *
   * Usually one of the 1 USDS address-verification sends, but not always —
   * spDAI/spUSDS residue from Spark's vault-share accounting lands here too. The
   * tag says the amount is dust and stops there, because why it is dust is not
   * something the amount can establish.
   *
   * The threshold counts UNITS, not value: 1 WETH would qualify. That is fine
   * for the stablecoins this mostly sees, and worth remembering if it is not.
   */
  "prime-dust": "a dust amount to or from a prime",
  /** No prime involved, and both sides are known Sky contracts: the DAI↔USDS and PSM machinery. */
  plumbing: "protocol plumbing, no prime involved",
  /** A known Sky contract paid an unrecognised address — a contributor or delegate, typically. */
  "protocol-outflow": "out of a Sky contract to an unrecognised address",
  /** An unrecognised address paid a known Sky contract. */
  "protocol-inflow": "into a Sky contract from an unrecognised address",
  /** Neither side recognised, no prime. Third-party token movements inside a spell. */
  unclassified: "neither side recognised",
};

/** payments.csv `Label` → tag, so a curated classification is reused verbatim. */
const LABEL_TAGS = {
  MSC: "msc-payment",
  "Genesis Transfer": "capital-transfer",
  "Genesis Capital": "capital-transfer",
  "DR True-up": "capital-transfer",
  Reimbursement: "prime-inflow",
  Transfer: "capital-transfer",
  Test: "prime-dust",
};

/** At or below this many whole units, a transfer to a prime is an address check. */
const TEST_MAX = 1;

export const ZERO = "0x0000000000000000000000000000000000000000";

/**
 * Tags one transfer.
 *
 * `payment` is the matching row from data/prime/payments.csv, when there is one.
 * Precedence is deliberate: a curated label beats anything derived, a dust
 * amount is a test before it is an outflow, and a mint into a prime is a payment
 * rather than an inflow.
 */
export function tagTransfer({ transfer, fromPrime, toPrime, fromNamed, toNamed, payment }) {
  if (payment) {
    return {
      tag: LABEL_TAGS[payment.Label] ?? "prime-inflow",
      coverage: "payments.csv",
    };
  }

  // `Number("")` is 0, which would file a transfer with no amount as a dust
  // test — so an empty string has to be rejected before the numeric check.
  const raw = String(transfer.amount ?? "").trim();
  const amount = raw === "" ? NaN : Number(raw);
  const minted = transfer.from === ZERO;
  const burned = transfer.to === ZERO;
  const tag = (() => {
    if (fromPrime && toPrime) return fromPrime === toPrime ? "intra-prime" : "cross-prime";
    if (toPrime) {
      if (Number.isFinite(amount) && amount <= TEST_MAX) return "prime-dust";
      // A mint into a prime is a payment of some kind, but which kind is the
      // accrual question payments.csv answers — so say only what is known.
      return minted ? "prime-mint" : "prime-inflow";
    }
    if (fromPrime) {
      if (Number.isFinite(amount) && amount <= TEST_MAX) return "prime-dust";
      return "prime-outflow";
    }
    // No prime. Named on both sides (allowing for a mint or burn) is machinery;
    // one named side means value crossed the protocol boundary, which is worth
    // distinguishing from a movement between two addresses we know nothing about.
    const knownFrom = fromNamed || minted;
    const knownTo = toNamed || burned;
    if (knownFrom && knownTo) return "plumbing";
    if (knownFrom) return "protocol-outflow";
    if (knownTo) return "protocol-inflow";
    return "unclassified";
  })();

  return { tag, coverage: "new" };
}

/** The mechanical fact, kept separate from the interpretation in `Tag`. */
export function movement({ from, to }) {
  if (from === ZERO) return "mint";
  if (to === ZERO) return "burn";
  return "transfer";
}
