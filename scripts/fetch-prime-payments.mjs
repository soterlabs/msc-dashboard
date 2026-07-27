/**
 * Dune → data/prime/payments.csv → data/generated/prime.json.
 * Fetches the latest results of the Dune query and appends new payments.
 *
 * The column contract lives in schema/prime-payments.mjs; this script only
 * decides which rows to add. Existing rows are copied verbatim, so hand-filled
 * columns and address casing survive a refresh, and rows the query no longer
 * returns are kept rather than silently dropped.
 *
 * Usage:
 *   DUNE_API_KEY=... DUNE_QUERY_ID=1234567 node scripts/fetch-prime-payments.mjs
 *   DUNE_API_KEY=... node scripts/fetch-prime-payments.mjs 1234567
 */
import { execFileSync } from "node:child_process";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import { COLUMNS, HAND_FILLED, rowKey } from "../schema/prime-payments.mjs";
import { PRIME_PAYMENTS_CSV, readCells, writeCells } from "./lib/prime-payments.mjs";
import { readPrimeWallets } from "./lib/prime-wallets.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const str = (v) => (v === null || v === undefined ? "" : String(v).trim());

/** Dune result row → CSV cells. Columns the query does not carry stay blank. */
function cellsFromDune(d) {
  const row = {};
  for (const col of COLUMNS) {
    if (!col.dune) {
      row[col.header] = "";
      continue;
    }
    const raw = d[col.dune];
    row[col.header] = col.fromDune ? col.fromDune(raw) : str(raw);
  }
  return row;
}

// prime.json is regenerated from the CSV by generate-data.mjs, the single
// owner of the CSV → .ts step (incl. validation and derived fields like
// walletType). Delegating here keeps this script from re-implementing — and
// drifting from — that logic.
function writeTs() {
  execFileSync("node", ["scripts/generate-data.mjs", "--prime-only"], {
    cwd: ROOT,
    stdio: "inherit",
  });
}

async function fetchDune(queryId, apiKey) {
  const url = `https://api.dune.com/api/v1/query/${queryId}/results?limit=10000`;
  const res = await fetch(url, { headers: { "X-Dune-API-Key": apiKey } });
  if (!res.ok) {
    throw new Error(`Dune API ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  const rows = data?.result?.rows;
  if (!rows) throw new Error("Dune response has no result.rows — run the query on Dune at least once");
  return rows;
}

async function main() {
  const queryId = process.argv[2] || process.env.DUNE_QUERY_ID;
  const apiKey = process.env.DUNE_API_KEY;
  if (!queryId) throw new Error("No query id. Pass it as an argument or set DUNE_QUERY_ID.");
  if (!apiKey) throw new Error("No DUNE_API_KEY in the environment.");

  const duneRows = await fetchDune(queryId, apiKey);
  const existing = new Map(
    readCells().map((r) => [rowKey(r["Tx hash"], r["Log index"]), r]),
  );

  // Wallet names and categories now live in data/prime/wallets.csv, so a new
  // payment to or from an unregistered wallet has to be registered before it
  // can be generated. Dune knows the names, so offer them for pasting rather
  // than letting generate-data.mjs fail with only an address.
  const wallets = readPrimeWallets();
  const unregistered = new Map();
  const noteWallet = (address, label) => {
    const a = str(address).toLowerCase();
    if (a && !wallets.has(a) && !unregistered.has(a)) unregistered.set(a, str(label));
  };

  const seen = new Set();
  const merged = [];
  const added = [];
  for (const d of duneRows) {
    const row = cellsFromDune(d);
    const key = rowKey(row["Tx hash"], row["Log index"]);
    seen.add(key);
    const prev = existing.get(key);
    if (prev) {
      merged.push(prev);
      continue;
    }
    if (row.Source === "transfer") {
      noteWallet(row["Receiving wallet"], d.to_label);
      noteWallet(row["From address"], d.from_label);
    }
    added.push(`${row["Cast date"]} ${row.Prime} ${row.USDS} (${row["Tx hash"]})`);
    merged.push(row);
  }

  // Keep any hand-added rows the query didn't return, rather than dropping them.
  const orphans = [...existing.values()].filter(
    (r) => !seen.has(rowKey(r["Tx hash"], r["Log index"])),
  );
  merged.push(...orphans);

  // `transfer` rows are hand-maintained, so Dune never returns them: they are
  // expected orphans and only missing spell rows are worth warning about.
  const unexpectedOrphans = orphans.filter((r) => r.Source !== "transfer");

  merged.sort((a, b) => {
    if (a["Cast date"] !== b["Cast date"]) return a["Cast date"] < b["Cast date"] ? 1 : -1;
    return (Number(b.USDS) || 0) - (Number(a.USDS) || 0);
  });

  writeCells(merged);

  const transferCount = orphans.length - unexpectedOrphans.length;
  const summary = `${merged.length} rows → ${path.relative(ROOT, PRIME_PAYMENTS_CSV)}${
    transferCount ? ` (incl. ${transferCount} hand-maintained transfer row(s))` : ""
  }`;

  // Regenerating would fail on an unregistered wallet. Stop with the lines to
  // paste instead, so the CSV update is not paired with an opaque error.
  if (unregistered.size) {
    console.log(`[fetch-prime-payments] ${summary}`);
    console.error(
      `[fetch-prime-payments] ${unregistered.size} new wallet(s) — add to data/prime/wallets.csv, then run \`pnpm generate-data\`:`,
    );
    for (const [address, label] of unregistered) {
      console.error(`  ${address},${label},<subproxy|foundation|msig|other>`);
    }
    process.exit(1);
  }

  writeTs();
  console.log(`[fetch-prime-payments] ${summary} (+ regenerated prime.json)`);
  if (unexpectedOrphans.length) {
    console.warn(`[fetch-prime-payments] ${unexpectedOrphans.length} spell row(s) in the CSV were NOT returned by Dune (kept):`);
    for (const o of unexpectedOrphans) console.warn(`  - ${o["Cast date"]} ${o.Prime} (${o["Tx hash"]})`);
  }
  if (added.length) {
    console.warn(
      `[fetch-prime-payments] ${added.length} new row(s) added — fill in ${HAND_FILLED.join(" / ")} by hand:`,
    );
    for (const a of added) console.warn(`  - ${a}`);
  }
}

main().catch((e) => {
  console.error(`[fetch-prime-payments] ${e.message}`);
  process.exit(1);
});
