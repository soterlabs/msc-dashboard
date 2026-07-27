/**
 * Schema for data/prime/wallets.csv — the named wallets behind prime payments.
 *
 * One row per wallet that needs a human name, a category, or both. The file
 * answers three questions payments.csv used to answer per-row:
 *   - what is this wallet called?     (was the To label / From label columns)
 *   - what kind of wallet is it?      (was PRIME_TRANSFER_WALLETS in generate-data.mjs)
 *   - is it a wallet we recognise?    (was a silent fallback to "other")
 *
 * Subproxies are deliberately absent: a `spell` row always pays a subproxy, so
 * its category comes from Source and it has no name to look up. Adding one here
 * would put a name in the dashboard's To column, which is a content decision,
 * not a plumbing one.
 */

const str = (v) => (v === null || v === undefined ? "" : String(v).trim());

const ADDRESS = /^0x[0-9a-fA-F]{40}$/;

/** Mirrors PrimeWallet in src/lib/prime/types.ts. */
export const WALLET_TYPES = ["subproxy", "foundation", "msig", "other"];

export const COLUMNS = [
  { header: "Address", key: "address", required: true },
  { header: "Label", key: "label", required: true },
  // Only meaningful for wallets that RECEIVE a transfer; payer-only wallets
  // leave it blank rather than assert a category we have not verified.
  { header: "Type", key: "type" },
];

export const HEADER = COLUMNS.map((c) => c.header);

export function parseRow(cells) {
  return {
    address: str(cells.Address),
    label: str(cells.Label),
    type: str(cells.Type),
  };
}

/**
 * Validates wallet rows and returns a Map keyed by lowercased address.
 * Throws with every problem at once.
 */
export function validate(rows, { file = "wallets.csv" } = {}) {
  const errors = [];
  const byAddress = new Map();

  rows.forEach((row, i) => {
    const at = `${file} line ${i + 2}`;
    if (!ADDRESS.test(row.address)) {
      errors.push(`${at}: Address is not a 20-byte address: "${row.address}"`);
    }
    if (row.label === "") errors.push(`${at}: Label is required`);
    if (row.type !== "" && !WALLET_TYPES.includes(row.type)) {
      errors.push(
        `${at}: Type not one of ${WALLET_TYPES.map((t) => `"${t}"`).join(" / ")}: "${row.type}"`,
      );
    }
    const key = row.address.toLowerCase();
    if (byAddress.has(key)) errors.push(`${at}: duplicate Address`);
    else byAddress.set(key, row);
  });

  if (errors.length) {
    throw new Error(`${file} failed validation (${errors.length}):\n  - ${errors.join("\n  - ")}`);
  }
  return byAddress;
}
