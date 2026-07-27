/**
 * Tests for the block-explorer registry.
 *
 * These exist because the prerendered-HTML comparison used to check "the page
 * renders identically" only covers the default (DR) section — the Prime and SSR
 * views mount on a tab switch, client-side, so their links never appear in the
 * build output. When prime-payments.tsx stopped hardcoding
 *
 *   const ETHERSCAN_TX   = "https://etherscan.io/tx/";
 *   const ETHERSCAN_ADDR = "https://etherscan.io/address/";
 *
 * and moved to the registry, nothing else would have caught a changed URL. The
 * literals below are those two constants, so a drift in either is a failure.
 */
import assert from "node:assert/strict";
import test from "node:test";

import { explorer, explorerUrl, txUrl } from "./links.ts";

const TX = "0xa2bffc99b76e5a2e2733ac1f5c350c1d7590e5ae74862fad58b2816b7ab8fba6";
const ADDR = "0x3300f198988e4C9C63F75dF86De36421f06af8c4";

test("ethereum URLs match the constants prime-payments.tsx used to hardcode", () => {
  assert.equal(txUrl("ethereum", TX), `https://etherscan.io/tx/${TX}`);
  assert.equal(explorerUrl("ethereum", ADDR), `https://etherscan.io/address/${ADDR}`);
});

test("explorer() keeps the address base its callers expect", () => {
  // addresses-view.tsx reads .base and .name
  assert.deepEqual(explorer("ethereum"), {
    name: "Etherscan",
    base: "https://etherscan.io/address/",
  });
});

test("every known chain resolves both link kinds", () => {
  for (const chain of ["ethereum", "base", "arbitrum", "optimism", "unichain"]) {
    const e = explorer(chain);
    assert.ok(e, `${chain} should be known`);
    assert.ok(e.name.length > 0);
    assert.match(txUrl(chain, TX)!, /^https:\/\/[^/]+\/tx\/0x[0-9a-f]{64}$/);
    assert.match(explorerUrl(chain, ADDR)!, /^https:\/\/[^/]+\/address\/0x[0-9a-fA-F]{40}$/);
  }
});

test("chain names are matched case-insensitively", () => {
  assert.equal(txUrl("Ethereum", TX), txUrl("ethereum", TX));
  assert.equal(explorerUrl("BASE", ADDR), explorerUrl("base", ADDR));
});

test("an unknown chain yields null rather than a wrong host", () => {
  assert.equal(explorer("solana"), null);
  assert.equal(txUrl("solana", TX), null);
  assert.equal(explorerUrl("solana", ADDR), null);
});

test("chains do not share a host", () => {
  const hosts = ["ethereum", "base", "arbitrum", "optimism", "unichain"].map(
    (c) => new URL(txUrl(c, TX)!).host,
  );
  assert.equal(new Set(hosts).size, hosts.length, "each chain needs its own explorer host");
});
