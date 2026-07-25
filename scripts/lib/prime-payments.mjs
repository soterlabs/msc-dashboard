/**
 * The one door to data/prime/payments.csv.
 *
 * generate-data.mjs reads validated rows through `readPrimePayments()`;
 * fetch-prime-payments.mjs round-trips raw cells through `readCells()` /
 * `writeCells()` so that hand-filled columns and address casing survive a
 * refresh untouched.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import { HEADER, parseRow, validate } from "../../schema/prime-payments.mjs";
import { fromCsv, toCsv } from "./csv.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

export const PRIME_PAYMENTS_CSV = path.join(ROOT, "data", "prime", "payments.csv");

const REL = path.relative(ROOT, PRIME_PAYMENTS_CSV);

/** Raw rows as header→string cells, with the header checked against the schema. */
export function readCells() {
  const { header, rows } = fromCsv(fs.readFileSync(PRIME_PAYMENTS_CSV, "utf8"), { file: REL });
  if (header.join("|") !== HEADER.join("|")) {
    const extra = header.filter((h) => !HEADER.includes(h));
    const missing = HEADER.filter((h) => !header.includes(h));
    throw new Error(
      `${REL} header does not match schema/prime-payments.mjs` +
        (missing.length ? `\n  missing: ${missing.join(", ")}` : "") +
        (extra.length ? `\n  unexpected: ${extra.join(", ")}` : "") +
        (!missing.length && !extra.length ? " (column order differs)" : ""),
    );
  }
  return rows;
}

/** Parsed, validated payments. Throws on malformed data; warns on unclassified. */
export function readPrimePayments() {
  const parsed = readCells().map(parseRow);
  const { warnings } = validate(parsed, { file: REL });
  return { payments: parsed, warnings };
}

export function writeCells(rows) {
  fs.writeFileSync(PRIME_PAYMENTS_CSV, toCsv(HEADER, rows));
}
