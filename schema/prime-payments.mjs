/**
 * Schema for data/prime/payments.csv — the one place the prime-payments columns
 * are defined.
 *
 * Both scripts import it: fetch-prime-payments.mjs uses the column order and
 * `dune` mappings to append newly-returned payments, generate-data.mjs uses
 * `parse` + the checks to build src/lib/prime-data.ts. Adding a column means
 * editing this file (and the matching field on PrimePayment in
 * src/lib/prime-types.ts, which is hand-written for its doc comments).
 *
 * Severity is deliberate:
 *   - a missing REQUIRED field or a malformed value is an ERROR — it means the
 *     Dune query changed shape or a hand edit went wrong, and serving wrong
 *     numbers is worse than a loud failure;
 *   - an unfilled EDITORIAL field on a freshly fetched row is a WARNING — the
 *     row is real, it just has not been classified by a human yet.
 */

const str = (v) => (v === null || v === undefined ? "" : String(v).trim());

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MONTHS = /^\d{4}-\d{2}( *\+ *\d{4}-\d{2})*$/;
const ADDRESS = /^0x[0-9a-fA-F]{40}$/;
const TX_HASH = /^0x[0-9a-fA-F]{64}$/;
const CONSTANT = /^[A-Z0-9_]+$/;

export const KINDS = ["settlement cycle", "other"];
export const SOURCES = ["spell", "transfer"];

/**
 * Label → the Kind it implies. Kind is stored rather than derived so the CSV
 * reads on its own, but the two must agree: a row whose Kind contradicts its
 * Label is an error, and so is a Label that is not listed here. Adding a label
 * is a deliberate one-line change, not a free-text cell.
 */
export const LABEL_KINDS = {
  MSC: "settlement cycle",
  Reimbursement: "other",
  "Genesis Transfer": "other",
  "DR True-up": "other",
  "Genesis Capital": "other",
  Transfer: "other",
  Test: "other",
};

/** Number from a CSV cell, tolerating thousands separators. */
function toNumber(v) {
  const n = Number(str(v).replaceAll(",", "").replaceAll("$", ""));
  return Number.isFinite(n) ? n : null;
}

const check = {
  date: (v) => (DATE.test(v) ? null : `not a YYYY-MM-DD date: "${v}"`),
  months: (v) => (MONTHS.test(v) ? null : `not a YYYY-MM month (or "A + B" list): "${v}"`),
  address: (v) => (ADDRESS.test(v) ? null : `not a 20-byte address: "${v}"`),
  txHash: (v) => (TX_HASH.test(v) ? null : `not a 32-byte tx hash: "${v}"`),
  constant: (v) => (CONSTANT.test(v) ? null : `not an UPPER_SNAKE constant: "${v}"`),
  url: (v) => (/^https?:\/\//.test(v) ? null : `not an http(s) URL: "${v}"`),
  oneOf: (allowed) => (v) =>
    allowed.includes(v) ? null : `not one of ${allowed.map((a) => `"${a}"`).join(" / ")}: "${v}"`,
  /** Amounts are always positive: 0 would mean an empty or unparseable cell. */
  positive: (v) => (typeof v === "number" && v > 0 ? null : `not a positive amount: "${v}"`),
  index: (v) =>
    Number.isInteger(v) && v >= 0 ? null : `not a non-negative integer: "${v}"`,
};

/**
 * Columns in CSV order.
 *   header   — CSV column name (also the hand-editing contract)
 *   key      — field name on PrimePayment
 *   required — blank is an error
 *   dune     — field on the Dune result row that seeds this column on a new row
 *   fromDune — how to render that Dune value as a cell (default: trimmed string)
 *   parse    — cell → value for prime-data.ts
 *   check    — validates a NON-BLANK value
 */
export const COLUMNS = [
  {
    header: "Cast date",
    key: "castDate",
    required: true,
    dune: "cast_date",
    fromDune: (v) => str(v).slice(0, 10),
    parse: str,
    check: check.date,
  },
  { header: "Prime", key: "prime", required: true, dune: "prime", parse: str },
  {
    header: "USDS",
    key: "usds",
    required: true,
    dune: "usds",
    fromDune: (v) => String(toNumber(v) ?? str(v)),
    parse: (v) => toNumber(v) ?? 0,
    check: check.positive,
  },
  { header: "Kind", key: "kind", parse: str, check: check.oneOf(KINDS) },
  { header: "Settles accrual", key: "settlesAccrual", parse: str, check: check.months },
  {
    header: "Receiving wallet",
    key: "receivingWallet",
    required: true,
    dune: "receiving_wallet",
    parse: str,
    check: check.address,
  },
  {
    header: "Tx hash",
    key: "txHash",
    required: true,
    dune: "tx_hash",
    parse: str,
    check: check.txHash,
  },
  {
    header: "Log index",
    key: "logIndex",
    required: true,
    dune: "log_index",
    parse: (v) => toNumber(v) ?? -1,
    check: check.index,
  },
  { header: "Spell", key: "spell", parse: str, check: check.date },
  {
    header: "Spell address",
    key: "spellAddress",
    dune: "spell_address",
    parse: str,
    check: check.address,
  },
  {
    header: "Subproxy constant",
    key: "subproxyConstant",
    dune: "subproxy_constant",
    parse: str,
    check: check.constant,
  },
  { header: "Label", key: "label", parse: str },
  { header: "Reference", key: "reference", parse: str, check: check.url },
  {
    header: "Source",
    key: "source",
    required: true,
    dune: "source",
    parse: str,
    check: check.oneOf(SOURCES),
  },
  {
    header: "From address",
    key: "fromAddress",
    dune: "from_address",
    parse: str,
    check: check.address,
  },
  { header: "Line item", key: "lineItem", parse: str },
];

export const HEADER = COLUMNS.map((c) => c.header);

/**
 * Field order of the generated PrimePayment objects — the CSV columns plus the
 * three fields resolved from data/prime/wallets.csv at generate time. Pinned
 * here so reordering or adding a CSV column cannot silently reshuffle
 * src/lib/prime-data.ts, and must stay in step with src/lib/prime-types.ts.
 */
export const OUTPUT_FIELDS = [
  ...COLUMNS.map((c) => c.key).filter((k) => k !== "lineItem"),
  "fromLabel",
  "toLabel",
  "lineItem",
  "walletType",
];

/** Cells a fresh Dune row cannot fill, so a human has to. */
export const HAND_FILLED = COLUMNS.filter((c) => !c.dune).map((c) => c.header);

/**
 * Row identity. A transaction can hold several Transfer events, including two
 * to the same wallet, so the log index is what makes this unique.
 */
export const rowKey = (txHash, logIndex) =>
  `${str(txHash).toLowerCase()}|${str(logIndex)}`;

/** CSV row (header→string) → PrimePayment-shaped object (minus walletType). */
export function parseRow(cells) {
  return Object.fromEntries(COLUMNS.map((c) => [c.key, c.parse(cells[c.header])]));
}

/**
 * Structural rules that span columns. `spell` rows are minted by a spell (so no
 * payer); `transfer` rows are plain ERC-20 sends (so no spell). Every field
 * named here is seeded from Dune, so these hold for freshly fetched rows too.
 */
function crossFieldErrors(row) {
  const out = [];
  const blank = (k) => row[k] === "";

  // Kind restates Label, so the two must not disagree.
  if (row.label !== "") {
    const implied = LABEL_KINDS[row.label];
    if (implied === undefined) {
      out.push(
        `unknown Label "${row.label}" — add it to LABEL_KINDS in schema/prime-payments.mjs with the Kind it implies`,
      );
    } else if (row.kind !== "" && row.kind !== implied) {
      out.push(`Label "${row.label}" implies Kind "${implied}", but the row says "${row.kind}"`);
    }
  }

  if (row.source === "spell") {
    if (!blank("fromAddress")) out.push("spell rows are minted, so From address must be blank");
    if (blank("spellAddress")) out.push("spell rows need a Spell address");
    if (blank("subproxyConstant")) out.push("spell rows need a Subproxy constant");
  } else if (row.source === "transfer") {
    if (blank("fromAddress")) out.push("transfer rows need a From address");
    if (!blank("spell")) out.push("transfer rows have no spell, so Spell must be blank");
    if (!blank("spellAddress")) out.push("transfer rows have no spell, so Spell address must be blank");
    if (!blank("subproxyConstant"))
      out.push("transfer rows do not pay a subproxy, so Subproxy constant must be blank");
  }
  return out;
}

/** Editorial fields a row is still missing; empty when fully classified. */
export function needsClassifying(row) {
  const missing = [];
  if (row.kind === "") missing.push("Kind");
  if (row.label === "") missing.push("Label");
  // Only spell rows have a spell date to record.
  if (row.source === "spell" && row.spell === "") missing.push("Spell");
  return missing;
}

/**
 * Validates parsed rows. Returns `{ warnings }` and throws on any error, with
 * every problem listed at once rather than only the first.
 */
export function validate(rows, { file = "payments.csv" } = {}) {
  const errors = [];
  const warnings = [];
  const seen = new Map();

  rows.forEach((row, i) => {
    // +2: 1-based lines, plus the header row.
    const at = `${file} line ${i + 2}`;
    for (const col of COLUMNS) {
      const value = row[col.key];
      const isBlank = value === "" || value === null || value === undefined;
      if (isBlank && !col.required) continue;
      if (isBlank) {
        errors.push(`${at}: ${col.header} is required but blank`);
        continue;
      }
      const problem = col.check?.(value);
      if (problem) errors.push(`${at}: ${col.header} ${problem}`);
    }
    for (const problem of crossFieldErrors(row)) errors.push(`${at}: ${problem}`);

    const key = rowKey(row.txHash, row.logIndex);
    if (seen.has(key)) {
      errors.push(`${at}: duplicate Tx hash + Log index (also ${file} line ${seen.get(key) + 2})`);
    } else {
      seen.set(key, i);
    }

    const missing = needsClassifying(row);
    if (missing.length) {
      warnings.push(`${at}: ${row.castDate} ${row.prime} needs ${missing.join(" / ")}`);
    }
  });

  if (errors.length) {
    throw new Error(`${file} failed validation (${errors.length}):\n  - ${errors.join("\n  - ")}`);
  }
  return { warnings };
}
