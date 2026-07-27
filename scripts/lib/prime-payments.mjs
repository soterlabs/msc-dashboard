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

import { HEADER, OUTPUT_FIELDS, parseRow, validate } from "../../schema/prime-payments.mjs";
import { fromCsv, toCsv } from "./csv.mjs";
import { readPrimeWallets } from "./prime-wallets.mjs";

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

/**
 * Fills in the three fields that are not columns, from data/prime/wallets.csv:
 *
 *   walletType — category of the recipient. A `spell` mint always lands in a
 *                subproxy, so it needs no lookup; a `transfer` is keyed by the
 *                receiving wallet.
 *   toLabel    — name of the receiving wallet ("" for subproxies, which are
 *                deliberately unnamed).
 *   fromLabel  — name of the payer ("" for `spell` rows, which have no payer).
 *
 * An address that is not registered is an error, not a silent "other": a
 * miscategorised wallet is a wrong number on the dashboard.
 */
function resolveWallets(payments, wallets) {
  // Keyed by address so one unregistered wallet is one message, however many
  // rows it appears on.
  const problems = new Map();
  const flag = (address, message, i) => {
    const key = address.toLowerCase();
    const prev = problems.get(key);
    if (prev) prev.rows.push(i + 2);
    else problems.set(key, { message, rows: [i + 2] });
  };

  const resolved = payments.map((p, i) => {
    const lookup = (addr) => (addr ? wallets.get(addr.toLowerCase()) : undefined);
    let walletType = "subproxy";
    let toLabel = "";
    let fromLabel = "";

    if (p.source === "transfer") {
      const recipient = lookup(p.receivingWallet);
      if (!recipient) {
        flag(
          p.receivingWallet,
          `${p.receivingWallet} receives a transfer but is not in data/prime/wallets.csv — add it with a Label and a Type`,
          i,
        );
      } else if (recipient.type === "") {
        flag(
          p.receivingWallet,
          `${p.receivingWallet} ("${recipient.label}") receives a transfer but has no Type in data/prime/wallets.csv`,
          i,
        );
      } else {
        walletType = recipient.type;
        toLabel = recipient.label;
      }

      const payer = lookup(p.fromAddress);
      if (!payer) {
        flag(
          p.fromAddress,
          `${p.fromAddress} pays a transfer but is not in data/prime/wallets.csv — add it with a Label`,
          i,
        );
      } else {
        fromLabel = payer.label;
      }
    } else {
      // A named subproxy would put a name in the dashboard's To column, so an
      // unregistered one is expected rather than an error.
      toLabel = lookup(p.receivingWallet)?.label ?? "";
    }

    // Built in a pinned order so the generated file stays stable.
    const out = { ...p, fromLabel, toLabel, walletType };
    return Object.fromEntries(OUTPUT_FIELDS.map((k) => [k, out[k]]));
  });

  if (problems.size) {
    const lines = [...problems.values()].map(
      ({ message, rows }) => `${message}\n    (${REL} line${rows.length > 1 ? "s" : ""} ${rows.join(", ")})`,
    );
    throw new Error(`unregistered wallets (${problems.size}):\n  - ${lines.join("\n  - ")}`);
  }
  return resolved;
}

/**
 * Parsed and validated payments with wallet fields resolved — everything
 * data/generated/prime.json needs. Throws on malformed data or an unregistered
 * wallet; warns on a row that is merely unclassified.
 */
export function readPrimePayments() {
  const parsed = readCells().map(parseRow);
  const { warnings } = validate(parsed, { file: REL });
  return { payments: resolveWallets(parsed, readPrimeWallets()), warnings };
}

export function writeCells(rows) {
  fs.writeFileSync(PRIME_PAYMENTS_CSV, toCsv(HEADER, rows));
}
