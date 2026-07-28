/**
 * Chain → data/spells/{executions,transfers}.csv
 *
 * Finds every core spell the Sky pause proxy executed since a cut-off date, and
 * lists the ERC-20 Transfer events each one emitted, attributed to a prime where
 * one is involved.
 *
 * How a spell is found. The pause proxy (MCD_PAUSE_PROXY) only acts when
 * `DSPause.exec` delegatecalls a spell's action, and nothing announces that with
 * an event of its own. `trace_filter` would show it directly, but no free
 * endpoint serves traces dependably — so instead this sweeps for logs carrying
 * the pause proxy in their first indexed argument. Sky's core contracts use
 * DSNote, whose `LogNote` indexes the caller there, and an ERC-20 `Transfer`
 * indexes the sender there, so any contract the proxy touches leaves such a log.
 *
 * That set is then reconciled against the archived spells in
 * sky-ecosystem/spells-mainnet, so a transaction matching no known spell and an
 * archived spell never seen on-chain are both reported rather than assumed away.
 *
 * The transaction's `to` is the spell contract itself — normally a DssSpell whose
 * source sits in sky-ecosystem/spells-mainnet. `Target` records what was actually
 * called, so a direct `DSPause.exec` is visible rather than mislabelled as a spell.
 *
 * Usage:
 *   pnpm fetch-core-spells                 # since 2025-07-01
 *   pnpm fetch-core-spells --from 2026-01-01
 *   ETH_RPC_URL=… pnpm fetch-core-spells   # use your own node
 *
 * Options:
 *   --from <YYYY-MM-DD>  cut-off, by block timestamp (default 2025-07-01)
 *   --to <YYYY-MM-DD>    last day to include, inclusive (default: latest block)
 *   --no-names           skip the GitHub lookups that name spells and addresses
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import {
  EXECUTIONS_FILE,
  EXECUTION_COLUMNS,
  TRANSFERS_FILE,
  TRANSFER_COLUMNS,
  movement,
  tagTransfer,
} from "../schema/core-spells.mjs";
import { readCells } from "./lib/prime-payments.mjs";
import { toCsv } from "./lib/csv.mjs";
import {
  ZERO_ADDRESS,
  createTokenInfo,
  formatUnits,
  transfersFromReceipt,
} from "./lib/erc20.mjs";
import { LOG_CHUNK, blockAtOrAfter, createRpc } from "./lib/rpc.mjs";
import { loadDirectory } from "./lib/sky-directory.mjs";
import { fetchArchiveSpells } from "./lib/spell-archive.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "data", "spells");

/** MCD_PAUSE_PROXY — the executor of every core spell. */
const PAUSE_PROXY = "0xBE8E3e3618f7474F8cB1d074A26afFef007E98FB";
/** MCD_PAUSE — the target when `exec` is called directly rather than via a spell. */
const PAUSE = "0xbE286431454714F511008713973d3B053A2d38f3";

const DEFAULT_FROM = "2025-07-01";

/** The pause proxy as a 32-byte log topic. */
const PROXY_TOPIC = `0x${"0".repeat(24)}${PAUSE_PROXY.slice(2).toLowerCase()}`;

/**
 * `DssSpell.cast()`. The log sweep alone is too broad: the proxy's address shows
 * up in the first indexed argument both when it ACTS (a DSNote `LogNote`, an
 * ERC-20 `Transfer`) and when it is merely the SUBJECT — `rely(pauseProxy)`
 * emits `Rely(address indexed usr)`, and a Chainlink feed's `transmit` can name
 * it too. Requiring the transaction to call `cast()` is what separates the two,
 * and it needs no reference data to decide.
 */
const CAST_SELECTOR = "0x96d373e5";

function arg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
}

const DAY = 86_400;
const dayStart = (date) => Math.floor(Date.parse(`${date}T00:00:00Z`) / 1000);
const isoDate = (ts) => new Date(ts * 1000).toISOString().slice(0, 10);
const isoTime = (ts) => new Date(ts * 1000).toISOString().replace(".000Z", "Z");

/** Every transaction in which the pause proxy acted, oldest first. */
async function findSpellCasts(rpc, fromBlock, toBlock) {
  const byTx = new Map();
  const total = toBlock - fromBlock + 1;
  for (let lo = fromBlock; lo <= toBlock; lo += LOG_CHUNK) {
    const hi = Math.min(lo + LOG_CHUNK - 1, toBlock);
    const logs = await rpc.getLogs(lo, hi, [null, PROXY_TOPIC]);
    for (const log of logs) {
      const hash = log.transactionHash;
      if (!hash) continue;
      if (!byTx.has(hash)) byTx.set(hash, { hash, block: Number(log.blockNumber), logs: 0 });
      byTx.get(hash).logs++;
    }
    const pct = Math.round(((hi - fromBlock + 1) / total) * 100);
    process.stderr.write(`\r[fetch-core-spells] scanning logs… ${pct}% (${byTx.size} tx found)`);
  }
  process.stderr.write("\n");
  return [...byTx.values()].sort((a, b) => a.block - b.block);
}

async function main() {
  const from = arg("from", DEFAULT_FROM);
  const to = arg("to");
  const withNames = !process.argv.includes("--no-names");
  for (const [flag, value] of [["from", from], ["to", to]]) {
    if (value !== null && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new Error(`--${flag} must be YYYY-MM-DD, got "${value}"`);
    }
  }

  const rpc = createRpc();
  console.log(`[fetch-core-spells] rpc ${rpc.url}`);

  const latest = await rpc.blockNumber();
  const fromBlock = await blockAtOrAfter(rpc, dayStart(from), { hi: latest });
  // Inclusive: --to 2026-07-20 has to cover that whole day, or a spell cast on
  // the boundary date is silently dropped.
  const toBlock = to
    ? Math.min((await blockAtOrAfter(rpc, dayStart(to) + DAY, { hi: latest })) - 1, latest)
    : latest;
  if (fromBlock > toBlock) {
    throw new Error(
      `--from ${from} is after --to ${to} (blocks ${fromBlock} > ${toBlock}) — nothing to scan.`,
    );
  }
  console.log(
    `[fetch-core-spells] blocks ${fromBlock}–${toBlock} (${from} → ${to ?? "latest"})`,
  );

  const candidates = await findSpellCasts(rpc, fromBlock, toBlock);
  if (!candidates.length) {
    throw new Error(
      `no pause-proxy activity at all in blocks ${fromBlock}–${toBlock}. ` +
        `Does ${rpc.url} serve eth_getLogs over that range? Set ETH_RPC_URL to a node that does.`,
    );
  }

  // Read once and share: the directory needs these rows for prime attribution
  // and the tagger needs them to decide coverage.
  const payments = readCells();
  const directory = await loadDirectory({ offline: !withNames, payments });
  const archive = withNames ? await fetchArchiveSpells(from) : new Map();
  const tokenInfo = createTokenInfo(rpc);
  // Payments already recorded by hand, keyed as the spell emitted them. A match
  // means this transfer is covered; the absence of one is the interesting case.
  const recorded = new Map(
    payments.map((r) => [
      `${r["Tx hash"].toLowerCase()}|${r["Receiving wallet"].toLowerCase()}`,
      r,
    ]),
  );
  if (archive.size) console.log(`[fetch-core-spells] ${archive.size} archived spell(s) to match against`);

  // Keep only the transactions that actually cast a spell.
  const casts = [];
  const skipped = new Map();
  for (const [i, candidate] of candidates.entries()) {
    const tx = await rpc.getTransaction(candidate.hash);
    const target = (tx.to ?? "").toLowerCase();
    const selector = (tx.input ?? "").slice(0, 10);
    const kind = classifyTarget(target, selector, archive);
    if (kind) casts.push({ ...candidate, tx, target, kind });
    else {
      const key = `${target} ${selector}`;
      skipped.set(key, (skipped.get(key) ?? 0) + 1);
    }
    process.stderr.write(`\r[fetch-core-spells] classifying… ${i + 1}/${candidates.length}`);
  }
  process.stderr.write("\n");
  console.log(
    `[fetch-core-spells] ${casts.length} spell execution(s) ` +
      `(${candidates.length - casts.length} other transaction(s) mentioned the proxy)`,
  );
  if (skipped.size) {
    const top = [...skipped.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    console.log("[fetch-core-spells] not spell casts, by target and selector:");
    for (const [key, n] of top) console.log(`  ${key}  x${n}`);
  }

  const executionRows = [];
  const transferRows = [];
  const unnamed = new Map();

  for (const [i, cast] of casts.entries()) {
    const [block, receipt] = await Promise.all([
      rpc.getBlock(cast.block),
      rpc.getReceipt(cast.hash),
    ]);
    const ts = Number(block.timestamp);
    const target = cast.target;
    const transfers = transfersFromReceipt(receipt);

    const primesPaid = new Set();
    let usdsToPrimes = 0n;

    for (const t of transfers) {
      const { symbol, decimals } = await tokenInfo(t.token);
      const fromEntry = directory.lookup(t.from);
      const toEntry = directory.lookup(t.to);
      const amount = formatUnits(t.value, decimals);
      const { tag, coverage } = tagTransfer({
        transfer: { ...t, amount },
        fromPrime: fromEntry.prime,
        toPrime: toEntry.prime,
        fromNamed: Boolean(fromEntry.name),
        toNamed: Boolean(toEntry.name),
        payment: recorded.get(`${cast.hash.toLowerCase()}|${t.to}`),
      });

      if (symbol === "USDS" && (tag === "msc-payment" || tag === "capital-transfer")) {
        primesPaid.add(toEntry.prime);
        usdsToPrimes += t.value;
      }
      for (const [address, entry] of [
        [t.from, fromEntry],
        [t.to, toEntry],
      ]) {
        // The zero address is a mint/burn counterparty, not an unnamed wallet.
        if (!entry.name && address !== ZERO_ADDRESS) {
          unnamed.set(address, (unnamed.get(address) ?? 0) + 1);
        }
      }

      transferRows.push({
        "Cast date": isoDate(ts),
        "Tx hash": cast.hash,
        "Log index": String(t.logIndex),
        "Spell address": target,
        Token: t.token,
        Symbol: symbol,
        Amount: amount,
        Movement: movement(t),
        Tag: tag,
        Coverage: coverage,
        From: t.from,
        "From name": fromEntry.name,
        "From prime": fromEntry.prime,
        To: t.to,
        "To name": toEntry.name,
        "To prime": toEntry.prime,
      });
    }

    executionRows.push({
      "Cast date": isoDate(ts),
      "Cast time": isoTime(ts),
      Block: String(cast.block),
      "Tx hash": cast.hash,
      "Spell address": target,
      "Spell name": archive.get(target)?.dir ?? "",
      Target: cast.kind,
      Transfers: String(transfers.length),
      "Primes paid": [...primesPaid].sort().join(" "),
      "USDS to primes": formatUnits(usdsToPrimes, 18),
    });

    process.stderr.write(
      `\r[fetch-core-spells] reading receipts… ${i + 1}/${casts.length}`,
    );
  }
  process.stderr.write("\n");

  // Reconcile against the archive: anything unaccounted for on either side is
  // reported rather than quietly dropped.
  if (archive.size) {
    const seen = new Set(executionRows.map((r) => r["Spell address"]));
    const unmatched = executionRows.filter((r) => !r["Spell name"]);
    const neverCast = [...archive].filter(([address]) => !seen.has(address));
    if (unmatched.length) {
      console.warn(
        `[fetch-core-spells] ${unmatched.length} cast(s) matched no archived spell — ` +
          `a non-standard spell, or one not archived yet:`,
      );
      for (const r of unmatched) console.warn(`  ${r["Cast date"]} ${r["Spell address"]} (${r["Tx hash"]})`);
    }
    // Only spells DATED inside the window are expected to appear in it.
    const expected = neverCast.filter(([, { date }]) => date >= from && (!to || date <= to));
    if (expected.length) {
      console.warn(`[fetch-core-spells] ${expected.length} archived spell(s) dated in range but never cast:`);
      for (const [address, { dir }] of expected) console.warn(`  ${dir} (${address})`);
    }
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, EXECUTIONS_FILE), toCsv(EXECUTION_COLUMNS, executionRows));
  fs.writeFileSync(path.join(OUT_DIR, TRANSFERS_FILE), toCsv(TRANSFER_COLUMNS, transferRows));

  console.log(
    `[fetch-core-spells] wrote data/spells/${EXECUTIONS_FILE} (${executionRows.length} spells) ` +
      `and data/spells/${TRANSFERS_FILE} (${transferRows.length} transfers)`,
  );
  const byTag = new Map();
  for (const r of transferRows) byTag.set(r.Tag, (byTag.get(r.Tag) ?? 0) + 1);
  console.log("[fetch-core-spells] by tag:");
  for (const [tag, n] of [...byTag].sort((a, b) => b[1] - a[1])) {
    const covered = transferRows.filter((r) => r.Tag === tag && r.Coverage === "payments.csv").length;
    console.log(`  ${tag.padEnd(18)} ${String(n).padStart(4)}  (${covered} already in payments.csv)`);
  }
  const unnamedTotal = [...unnamed.entries()].sort((a, b) => b[1] - a[1]);
  if (unnamedTotal.length) {
    console.warn(
      `[fetch-core-spells] ${unnamedTotal.length} address(es) had no name; most frequent:`,
    );
    for (const [address, n] of unnamedTotal.slice(0, 8)) {
      console.warn(`  ${address}  ${n} transfer(s)`);
    }
  }
  console.log(`[fetch-core-spells] ${rpc.callCount} rpc calls`);
}

/**
 * How this transaction executed a spell, or null if it did not.
 *
 * `cast()` is the definitive signal and needs no reference data. The archive is
 * a second route, so a spell cast through some other entry point is still kept
 * rather than dropped for having an unfamiliar selector.
 */
function classifyTarget(target, selector, archive) {
  if (selector === CAST_SELECTOR) return "spell";
  if (archive.has(target)) return "spell (non-standard entry)";
  if (target === PAUSE.toLowerCase()) return "DSPause.exec (direct)";
  return null;
}

main().catch((e) => {
  console.error(`[fetch-core-spells] ${e.message}`);
  process.exit(1);
});
