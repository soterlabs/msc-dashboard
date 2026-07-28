/**
 * Names for the addresses that turn up in a spell's Transfer events, and the
 * prime each one belongs to.
 *
 * Three layers, most authoritative first:
 *
 *   1. sky-ecosystem/spells-mainnet → src/test/addresses_mainnet.sol. The
 *      canonical name for every core contract, including one `<PRIME>_SUBPROXY`
 *      per prime — which is what makes prime attribution possible at all.
 *   2. data/prime/wallets.csv — our own names for the payer and non-subproxy
 *      recipient wallets, which the Sky list does not cover.
 *   3. data/prime/payments.csv — the prime each receiving wallet has been paid
 *      on behalf of, for wallets whose name does not encode it.
 *
 * Layer 1 needs the network; the other two are committed. If GitHub is
 * unreachable the directory still works, with fewer names — the fetch is a
 * labelling nicety, not the data.
 */
import { readCells } from "./prime-payments.mjs";
import { readPrimeWallets } from "./prime-wallets.mjs";

const ADDRESSES_MAINNET_URL =
  "https://raw.githubusercontent.com/sky-ecosystem/spells-mainnet/master/src/test/addresses_mainnet.sol";

/** `addr["NAME"] = 0x…;` → Map(lowercased address → NAME). */
export function parseAddressesMainnet(source) {
  const out = new Map();
  const re = /addr\[\s*"([A-Za-z0-9_]+)"\s*\]\s*=\s*(0x[0-9a-fA-F]{40})\s*;/g;
  for (const [, name, address] of source.matchAll(re)) {
    const key = address.toLowerCase();
    // The list maps a few unset entries to the zero address; naming it would
    // label every mint and burn after whichever one came first.
    if (/^0x0+$/.test(key)) continue;
    // First name wins: the file lists a few aliases for the same address, and
    // the earlier entry is the canonical one.
    if (!out.has(key)) out.set(key, name);
  }
  return out;
}

/** `SPARK_SUBPROXY` → `SPARK`; anything else → null. */
export const primeFromSubproxyName = (name) =>
  /^([A-Z0-9]+)_SUBPROXY$/.exec(name ?? "")?.[1] ?? null;

async function fetchSkyNames() {
  try {
    const res = await fetch(ADDRESSES_MAINNET_URL, { signal: AbortSignal.timeout(30_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return parseAddressesMainnet(await res.text());
  } catch (e) {
    console.warn(
      `[sky-directory] could not fetch addresses_mainnet.sol (${e.message}) — names will be sparser`,
    );
    return new Map();
  }
}

/**
 * Builds the directory. Entries are `{ name, prime, source }`, where `prime` is
 * set only when the address is attributable to one.
 */
export async function loadDirectory({ offline = false } = {}) {
  const entries = new Map();
  const put = (address, fields) => {
    const key = address.toLowerCase();
    entries.set(key, { name: "", prime: "", source: "", ...entries.get(key), ...fields });
  };

  // 1. Canonical Sky names.
  const skyNames = offline ? new Map() : await fetchSkyNames();
  for (const [address, name] of skyNames) {
    const prime = primeFromSubproxyName(name);
    put(address, { name, source: "sky", ...(prime ? { prime } : {}) });
  }

  // 2. Our wallet names, where Sky has none.
  for (const [address, wallet] of readPrimeWallets()) {
    const existing = entries.get(address);
    put(address, {
      name: existing?.name || wallet.label,
      source: existing?.name ? existing.source : "wallets.csv",
    });
  }

  // 3. Prime attribution from payments we have already recorded.
  const conflicts = [];
  for (const row of readCells()) {
    const address = row["Receiving wallet"]?.toLowerCase();
    const prime = row.Prime;
    if (!address || !prime) continue;
    const existing = entries.get(address);
    if (existing?.prime && existing.prime !== prime) {
      conflicts.push(`${address} is attributed to both ${existing.prime} and ${prime}`);
      continue;
    }
    // payments.csv carries no label of its own since #14 — names come from
    // layers 1 and 2.
    put(address, { prime, name: existing?.name ?? "" });
  }
  if (conflicts.length) {
    console.warn(`[sky-directory] conflicting prime attribution:\n  - ${conflicts.join("\n  - ")}`);
  }

  return {
    size: entries.size,
    /** `{ name, prime }` for an address; blanks when unknown. */
    lookup(address) {
      return entries.get(address?.toLowerCase()) ?? { name: "", prime: "", source: "" };
    },
    /** Address → name, for reporting which spell contracts were recognised. */
    nameOf(address) {
      return this.lookup(address).name;
    },
  };
}
