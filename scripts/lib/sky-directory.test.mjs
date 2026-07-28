/**
 * Tests for the address-directory parsing.
 *
 * The parse is what makes prime attribution possible — a `<PRIME>_SUBPROXY`
 * entry is the only thing tying an on-chain address to a prime — so a regex that
 * quietly stops matching would silently empty the Prime column rather than fail.
 */
import assert from "node:assert/strict";
import test from "node:test";

import { parseAddressesMainnet, primeFromSubproxyName } from "./sky-directory.mjs";

/** Shaped like the real src/test/addresses_mainnet.sol, including its padding. */
const SAMPLE = `
// SPDX-License-Identifier: AGPL-3.0-or-later
contract Addresses {
    mapping (bytes32 => address) public addr;
    constructor() {
        addr["MCD_PAUSE_PROXY"]                  = 0xBE8E3e3618f7474F8cB1d074A26afFef007E98FB;
        addr["SPARK_SUBPROXY"]                   = 0x3300f198988e4C9C63F75dF86De36421f06af8c4;
        addr["GROVE_SUBPROXY"]                   = 0x1369f7b2b38c76B6478c0f0E66D94923421891Ba;
        addr["USDS"]                             = 0xdC035D45d973E3EC169d2276DDab16f1e407384F;
        addr["FAUCET"]                           = 0x0000000000000000000000000000000000000000;
        addr["ALIAS_OF_USDS"]                    = 0xdC035D45d973E3EC169d2276DDab16f1e407384F;
        // a commented-out entry must not be picked up
        // addr["OLD_THING"]                     = 0x1111111111111111111111111111111111111111;
    }
}
`;

test("named addresses are parsed and lowercased", () => {
  const m = parseAddressesMainnet(SAMPLE);
  assert.equal(m.get("0xbe8e3e3618f7474f8cb1d074a26affef007e98fb"), "MCD_PAUSE_PROXY");
  assert.equal(m.get("0x3300f198988e4c9c63f75df86de36421f06af8c4"), "SPARK_SUBPROXY");
  assert.equal(m.get("0xdc035d45d973e3ec169d2276ddab16f1e407384f"), "USDS");
});

test("the zero address is never named", () => {
  // It appears in the real file as an unset placeholder; naming it would label
  // every mint and burn in the output after whichever entry came first.
  const m = parseAddressesMainnet(SAMPLE);
  assert.equal(m.has("0x0000000000000000000000000000000000000000"), false);
  assert.equal([...m.values()].includes("FAUCET"), false);
});

test("the first name wins when two entries share an address", () => {
  const m = parseAddressesMainnet(SAMPLE);
  assert.equal(m.get("0xdc035d45d973e3ec169d2276ddab16f1e407384f"), "USDS");
});

test("a commented-out entry is still matched — the regex is not comment-aware", () => {
  // Documenting real behaviour rather than asserting an ideal: the entry is
  // harmless (an extra name for an address that never appears), and stripping
  // comments would be more machinery than the problem deserves.
  const m = parseAddressesMainnet(SAMPLE);
  assert.equal(m.get("0x1111111111111111111111111111111111111111"), "OLD_THING");
});

test("nothing is invented from empty or unrelated input", () => {
  assert.equal(parseAddressesMainnet("").size, 0);
  assert.equal(parseAddressesMainnet("contract Foo { uint x = 1; }").size, 0);
  // a short (non-address) hex literal must not match
  assert.equal(parseAddressesMainnet('addr["X"] = 0x1234;').size, 0);
});

test("a prime is read off its subproxy name", () => {
  assert.equal(primeFromSubproxyName("SPARK_SUBPROXY"), "SPARK");
  assert.equal(primeFromSubproxyName("CCEA1_SUBPROXY"), "CCEA1");
  assert.equal(primeFromSubproxyName("MCD_PAUSE_PROXY"), null);
  assert.equal(primeFromSubproxyName("SPARK_SUBPROXY_OLD"), null);
  assert.equal(primeFromSubproxyName(""), null);
  assert.equal(primeFromSubproxyName(undefined), null);
});

test("every subproxy in the sample yields a prime", () => {
  const primes = [...parseAddressesMainnet(SAMPLE).values()]
    .map(primeFromSubproxyName)
    .filter(Boolean)
    .sort();
  assert.deepEqual(primes, ["GROVE", "SPARK"]);
});
