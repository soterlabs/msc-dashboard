/**
 * Dune → data/prime-payments.md → src/lib/prime-data.ts.
 * Fetches the latest results of the Dune query and updates the markdown file.
 *
 * Usage:
 *   DUNE_API_KEY=... DUNE_QUERY_ID=1234567 node scripts/fetch-prime-payments.mjs
 *   DUNE_API_KEY=... node scripts/fetch-prime-payments.mjs 1234567
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MD = path.join(ROOT, "data", "prime-payments.md");
const TS = path.join(ROOT, "src", "lib", "prime-data.ts");

// data/*.md column order. ONCHAIN come from Dune; EDITORIAL are preserved.
const HEADER = [
  "Cast date",
  "Prime",
  "USDS",
  "Kind",
  "Settles accrual",
  "Receiving wallet",
  "Tx hash",
  "Log index",
  "Spell",
  "Spell address",
  "Subproxy constant",
  "Label",
  "Reference",
  "Source",
  "From address",
  "From label",
  "To label",
  "Line item",
];
const EDITORIAL = new Set([
  "Kind",
  "Settles accrual",
  "Spell",
  "Subproxy constant",
  "Label",
  "Reference",
  "Source",
  "From address",
  "From label",
  "To label",
  "Line item",
]);

const str = (v) => (v === null || v === undefined ? "" : String(v).trim());

/**
 * Row identity. A transaction can hold several Transfer events, including two
 * to the same wallet, so the log index is what makes this unique; the wallet is
 * a fallback for rows recorded before the index was captured.
 */
const key = (txHash, logIndex, wallet) =>
  `${str(txHash).toLowerCase()}|${str(logIndex) || `w:${str(wallet).toLowerCase()}`}`;

function usdsStr(v) {
  const n = Number(str(v).replaceAll(",", ""));
  return Number.isNaN(n) ? str(v) : String(n);
}

function parseMdRows(md) {
  const rows = [];
  for (const line of md.split("\n")) {
    if (!line.trim().startsWith("|")) continue;
    const cells = line.trim().slice(1, -1).split("|").map(str);
    if (cells.every((c) => /^:?-+:?$/.test(c))) continue;
    if (cells[0] === HEADER[0]) continue; // header row
    if (cells.length !== HEADER.length) continue;
    rows.push(Object.fromEntries(HEADER.map((h, i) => [h, cells[i]])));
  }
  return rows;
}

function preamble() {
  return `# Prime payments

Source of truth for the Prime Payments view. One row per on-chain payment to a
prime. Parsed into src/lib/prime-data.ts by scripts/generate-data.mjs.

Two kinds of payment share this table, told apart by **Source**:

- \`spell\` — Sky MINTS USDS straight into the prime's subproxy when a spell is
  cast (so there is no payer: the ERC-20 \`from\` is the zero address). These rows
  come from the Dune query in scripts/dune/prime-payments.sql
  (https://dune.com/queries/8040299) and carry Spell / Spell address / Subproxy
  constant. Only these are refreshed by scripts/fetch-prime-payments.mjs, which
  keeps existing rows verbatim and only appends payments the query newly returns.
- \`transfer\` — an ordinary ERC-20 transfer from a budget multisig to a prime's
  wallet (reimbursements, true-ups, genesis capital). No spell is involved, so
  the spell columns are blank and From address / From label identify the payer.
  The query covers the known payer and prime-side wallets; a payment outside that
  set is added by hand and preserved on refresh.

- **USDS** — whole USDS transferred (not wei).
- **Log index** — index of the Transfer event inside its transaction. One tx can
  carry several payments, even two to the same wallet, so a row is identified by
  Tx hash + Log index rather than Tx hash alone.
- **Kind** — \`settlement cycle\` or \`other\` (genesis / capital transfers).
- **Settles accrual** — accrual month(s) the settlement cycle covers; blank for \`other\`.
- **Label** — \`MSC\`, \`Genesis Transfer\`, \`Transfer\`, \`Reimbursement\`, \`DR True-up\`,
  \`Genesis Capital\`, or \`Test\` (1 USDS address-verification sends).
- **Reference** — forum post URL for the payment (editorial; blank if none).
- **Source** — \`spell\` or \`transfer\` (see above).
- **From address / From label** — payer wallet; blank for \`spell\` rows (minted).
- **To label** — human name for the receiving wallet.
- **Line item** — what the payment covers, where a source document states it;
  left blank rather than inferred.`;
}

function writeMd(rows) {
  const body = rows
    .map((r) => `| ${HEADER.map((h) => r[h] ?? "").join(" | ")} |`)
    .join("\n");
  const md = `${preamble()}

| ${HEADER.join(" | ")} |
| ${HEADER.map(() => "---").join(" | ")} |
${body}
`;
  fs.writeFileSync(MD, md);
}

// mirrors the prime step of scripts/generate-data.mjs
const TS_COLUMNS = [
  ["Cast date", "castDate", str],
  ["Prime", "prime", str],
  ["USDS", "usds", (v) => Number(str(v).replaceAll(",", "")) || 0],
  ["Kind", "kind", str],
  ["Settles accrual", "settlesAccrual", str],
  ["Receiving wallet", "receivingWallet", str],
  ["Tx hash", "txHash", str],
  ["Log index", "logIndex", str],
  ["Spell", "spell", str],
  ["Spell address", "spellAddress", str],
  ["Subproxy constant", "subproxyConstant", str],
  ["Label", "label", str],
  ["Reference", "reference", str],
  ["Source", "source", str],
  ["From address", "fromAddress", str],
  ["From label", "fromLabel", str],
  ["To label", "toLabel", str],
  ["Line item", "lineItem", str],
];

function writeTs(rows) {
  const payments = rows.map((r) =>
    Object.fromEntries(TS_COLUMNS.map(([h, k, parse]) => [k, parse(r[h])])),
  );
  const ts = `/**
 * Sky Prime Payments — dataset.
 *
 * GENERATED by scripts/generate-data.mjs from data/prime-payments.md.
 * Do not edit by hand — run \`pnpm generate-data\` instead.
 *
 * One row per on-chain payment to a prime, either a spell mint into a subproxy
 * or a direct transfer from a budget multisig. USDS is whole USDS (not wei).
 */
import type { PrimePayment } from "./prime-types";

export const primePayments: PrimePayment[] = ${JSON.stringify(payments, null, 2)};
`;
  fs.writeFileSync(TS, ts);
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
    parseMdRows(fs.readFileSync(MD, "utf8")).map((r) => [
      key(r["Tx hash"], r["Log index"], r["Receiving wallet"]),
      r,
    ]),
  );

  // Existing rows are kept verbatim (preserves editorial + address casing); only
  // payments the query newly returns are appended, with blank editorial fields.
  const seen = new Set();
  const merged = [];
  const needClassifying = [];
  for (const d of duneRows) {
    const k = key(d.tx_hash, d.log_index, d.receiving_wallet);
    seen.add(k);
    const prev = existing.get(k);
    if (prev) {
      merged.push(prev);
      continue;
    }
    const row = {
      "Cast date": str(d.cast_date).slice(0, 10),
      Prime: str(d.prime),
      USDS: usdsStr(d.usds),
      "Receiving wallet": str(d.receiving_wallet),
      "Tx hash": str(d.tx_hash),
      "Log index": str(d.log_index),
      "Spell address": str(d.spell_address),
    };
    // these look editorial but the query does know them, so seed them from Dune
    const fromDune = {
      "Subproxy constant": d.subproxy_constant,
      Source: d.source,
      "From address": d.from_address,
      "From label": d.from_label,
      "To label": d.to_label,
    };
    for (const h of HEADER) {
      if (EDITORIAL.has(h)) row[h] = str(fromDune[h]);
    }
    needClassifying.push(`${row["Cast date"]} ${row.Prime} ${row.USDS} (${row["Tx hash"]})`);
    merged.push(row);
  }

  // keep any hand rows the query didn't return, rather than silently dropping them
  const orphans = [...existing.values()].filter(
    (r) => !seen.has(key(r["Tx hash"], r["Log index"], r["Receiving wallet"])),
  );
  for (const o of orphans) merged.push(o);

  // `transfer` rows are hand-maintained, so Dune never returns them: they are
  // expected orphans and only missing spell rows are worth warning about.
  const unexpectedOrphans = orphans.filter((r) => r.Source !== "transfer");

  merged.sort((a, b) => {
    if (a["Cast date"] !== b["Cast date"]) return a["Cast date"] < b["Cast date"] ? 1 : -1;
    return (Number(b.USDS) || 0) - (Number(a.USDS) || 0);
  });

  writeMd(merged);
  writeTs(merged);

  const transferCount = orphans.length - unexpectedOrphans.length;
  console.log(
    `[fetch-prime-payments] ${merged.length} rows → ${path.relative(ROOT, MD)} + ${path.relative(ROOT, TS)}` +
      (transferCount ? ` (incl. ${transferCount} hand-maintained transfer row(s))` : ""),
  );
  if (unexpectedOrphans.length) {
    console.warn(`[fetch-prime-payments] ${unexpectedOrphans.length} spell row(s) in the markdown were NOT returned by Dune (kept):`);
    for (const o of unexpectedOrphans) console.warn(`  - ${o["Cast date"]} ${o.Prime} (${o["Tx hash"]})`);
  }
  if (needClassifying.length) {
    console.warn(`[fetch-prime-payments] ${needClassifying.length} new row(s) need Kind / Settles accrual / Label filled in by hand:`);
    for (const n of needClassifying) console.warn(`  - ${n}`);
  }
}

main().catch((e) => {
  console.error(`[fetch-prime-payments] ${e.message}`);
  process.exit(1);
});
