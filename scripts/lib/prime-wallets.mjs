/**
 * The one door to data/prime/wallets.csv.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import { HEADER, parseRow, validate } from "../../schema/prime-wallets.mjs";
import { fromCsv } from "./csv.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

export const PRIME_WALLETS_CSV = path.join(ROOT, "data", "prime", "wallets.csv");

const REL = path.relative(ROOT, PRIME_WALLETS_CSV);

/** Lowercased address → { address, label, type }. Throws on malformed rows. */
export function readPrimeWallets() {
  const { header, rows } = fromCsv(fs.readFileSync(PRIME_WALLETS_CSV, "utf8"), { file: REL });
  if (header.join("|") !== HEADER.join("|")) {
    throw new Error(
      `${REL} header does not match schema/prime-wallets.mjs\n  expected: ${HEADER.join(", ")}\n  found:    ${header.join(", ")}`,
    );
  }
  return validate(rows.map(parseRow), { file: REL });
}
