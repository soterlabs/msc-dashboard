/**
 * Tests for the hand-rolled ERC-20 decoding.
 *
 * Worth having because there is no ABI library to lean on: every one of these is
 * a place a wrong offset or a missing edge case would produce a plausible-looking
 * but wrong number in a payment list. The fixtures are real mainnet logs from the
 * 2026-06-18 spell (tx 0xa2bffc99…), whose amounts are independently recorded in
 * data/prime/payments.csv.
 */
import assert from "node:assert/strict";
import test from "node:test";

import {
  TRANSFER_TOPIC,
  ZERO_ADDRESS,
  addressFromTopic,
  decodeSymbol,
  decodeTransferLog,
  decodeUint,
  formatUnits,
  transferKind,
  transfersFromReceipt,
} from "./erc20.mjs";

const USDS = "0xdC035D45d973E3EC169d2276DDab16f1e407384F";
const SPARK_SUBPROXY = "0x3300f198988e4C9C63F75dF86De36421f06af8c4";

/** The real USDS mint to Spark's subproxy: 4,204,857 USDS. */
const MINT_LOG = {
  address: USDS,
  topics: [
    TRANSFER_TOPIC,
    `0x${"0".repeat(64)}`,
    `0x${"0".repeat(24)}${SPARK_SUBPROXY.slice(2).toLowerCase()}`,
  ],
  data: "0x000000000000000000000000000000000000000000037a69c1354ccf49440000",
  logIndex: "0x98",
};

test("a Transfer log decodes to token, parties and value", () => {
  const t = decodeTransferLog(MINT_LOG);
  assert.equal(t.token, USDS.toLowerCase());
  assert.equal(t.from, ZERO_ADDRESS);
  assert.equal(t.to, SPARK_SUBPROXY.toLowerCase());
  assert.equal(t.logIndex, 152);
  assert.equal(formatUnits(t.value, 18), "4204857");
});

test("addresses come out of topics lowercased and 20 bytes", () => {
  assert.equal(
    addressFromTopic(`0x${"0".repeat(24)}${SPARK_SUBPROXY.slice(2)}`),
    SPARK_SUBPROXY.toLowerCase(),
  );
});

test("a four-topic Transfer is an NFT, not a value transfer", () => {
  // ERC-721 shares the signature but indexes the token id as a fourth topic.
  const nft = { ...MINT_LOG, topics: [...MINT_LOG.topics, `0x${"0".repeat(63)}1`] };
  assert.equal(decodeTransferLog(nft), null);
});

test("other events are ignored", () => {
  assert.equal(decodeTransferLog({ ...MINT_LOG, topics: [`0x${"a".repeat(64)}`, "0x", "0x"] }), null);
  assert.equal(decodeTransferLog({ address: USDS, topics: [], data: "0x" }), null);
});

test("empty data reads as zero rather than throwing", () => {
  assert.equal(decodeTransferLog({ ...MINT_LOG, data: "0x" }).value, 0n);
});

test("mint, burn and plain transfer are told apart", () => {
  const a = "0x1111111111111111111111111111111111111111";
  const b = "0x2222222222222222222222222222222222222222";
  assert.equal(transferKind({ from: ZERO_ADDRESS, to: a }), "mint");
  assert.equal(transferKind({ from: a, to: ZERO_ADDRESS }), "burn");
  assert.equal(transferKind({ from: a, to: b }), "transfer");
});

test("a receipt yields its Transfers in log order, skipping everything else", () => {
  const receipt = {
    logs: [
      { address: USDS, topics: [`0x${"b".repeat(64)}`], data: "0x" },
      MINT_LOG,
      { ...MINT_LOG, logIndex: "0x99" },
    ],
  };
  const out = transfersFromReceipt(receipt);
  assert.equal(out.length, 2);
  assert.deepEqual(out.map((t) => t.logIndex), [152, 153]);
});

test("a receipt with no logs yields nothing", () => {
  assert.deepEqual(transfersFromReceipt({}), []);
  assert.deepEqual(transfersFromReceipt({ logs: [] }), []);
});

/* --------------------------------------------------------------- amounts */

test("formatUnits is exact, including the awkward cases", () => {
  assert.equal(formatUnits(4204857000000000000000000n, 18), "4204857");
  assert.equal(formatUnits(1n, 18), "0.000000000000000001");
  assert.equal(formatUnits(0n, 18), "0");
  assert.equal(formatUnits(1500000n, 6), "1.5");
  assert.equal(formatUnits(123456n, 0), "123456");
  assert.equal(formatUnits(-2500000000000000000n, 18), "-2.5");
  // Trailing zeros in the fraction are dropped, leading ones are not.
  assert.equal(formatUnits(1000000000000000000n, 18), "1");
  assert.equal(formatUnits(1010000000000000000n, 18), "1.01");
  assert.equal(formatUnits(10000000000000000n, 18), "0.01");
});

test("formatUnits keeps full precision on values a float would round", () => {
  // 2^53 + 1 wei: any float round-trip loses the last digit.
  assert.equal(formatUnits(9007199254740993n, 0), "9007199254740993");
  assert.equal(formatUnits(123456789012345678901234567890n, 18), "123456789012.34567890123456789");
});

/* -------------------------------------------------------------- metadata */

test("decodeUint reads decimals, and nothing from nothing", () => {
  assert.equal(decodeUint(`0x${"0".repeat(62)}12`), 18);
  assert.equal(decodeUint(`0x${"0".repeat(62)}06`), 6);
  assert.equal(decodeUint("0x"), null);
  assert.equal(decodeUint(null), null);
});

test("decodeSymbol handles an ABI string", () => {
  // offset 0x20, length 4, "USDS"
  const data =
    "0x" +
    "20".padStart(64, "0") +
    "4".padStart(64, "0") +
    Buffer.from("USDS").toString("hex").padEnd(64, "0");
  assert.equal(decodeSymbol(data), "USDS");
});

test("decodeSymbol handles a bytes32 symbol, as the older DSToken contracts return", () => {
  const data = `0x${Buffer.from("MKR").toString("hex").padEnd(64, "0")}`;
  assert.equal(decodeSymbol(data), "MKR");
});

test("decodeSymbol gives up quietly on junk", () => {
  assert.equal(decodeSymbol("0x"), "");
  assert.equal(decodeSymbol(null), "");
  assert.equal(decodeSymbol("0xabcd"), "");
});
