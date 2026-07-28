/**
 * ERC-20 log and return-value decoding, by hand.
 *
 * No ABI library: the four things needed here (a Transfer log, a uint, a symbol,
 * a fixed-point amount) are a few lines each, and every function below is pure
 * so it can be tested without a network. See erc20.test.mjs.
 */

/** keccak256("Transfer(address,address,uint256)") */
export const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

/** Selectors for the two metadata calls used here. */
export const SELECTOR = {
  symbol: "0x95d89b41",
  decimals: "0x313ce567",
};

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

/** A 32-byte topic holding an address → a 20-byte address, lowercased. */
export const addressFromTopic = (topic) => `0x${topic.slice(26).toLowerCase()}`;

/**
 * An ERC-20 Transfer log, or null if this log is not one.
 *
 * ERC-721 shares the event signature but indexes the token id, giving four
 * topics instead of three — so the topic count is what separates a value
 * transfer from an NFT transfer.
 */
export function decodeTransferLog(log) {
  const topics = log.topics ?? [];
  if (topics.length !== 3) return null;
  if (topics[0].toLowerCase() !== TRANSFER_TOPIC) return null;
  return {
    token: log.address.toLowerCase(),
    from: addressFromTopic(topics[1]),
    to: addressFromTopic(topics[2]),
    value: BigInt(log.data === "0x" ? "0x0" : log.data),
    logIndex: Number(log.logIndex),
  };
}

/** Every ERC-20 Transfer in a receipt, in log order. */
export const transfersFromReceipt = (receipt) =>
  (receipt.logs ?? []).map(decodeTransferLog).filter(Boolean);

/** Whether a transfer is a mint, a burn, or an ordinary move. */
export function transferKind({ from, to }) {
  if (from === ZERO_ADDRESS) return "mint";
  if (to === ZERO_ADDRESS) return "burn";
  return "transfer";
}

/** ABI-encoded uint256/uint8 return data → number. */
export function decodeUint(data) {
  if (!data || data === "0x") return null;
  return Number(BigInt(data));
}

/**
 * A `symbol()` return value → string.
 *
 * Two encodings are in the wild: a proper ABI string (offset, length, bytes) and
 * a bare bytes32 of padded ASCII, which the older DSToken contracts use — MKR
 * being the one that matters here.
 */
export function decodeSymbol(data) {
  if (!data || data === "0x") return "";
  const body = data.slice(2);
  if (body.length === 64) {
    // bytes32: trim the zero padding and read as ASCII.
    const bytes = body.replace(/(00)+$/, "");
    return hexToUtf8(bytes);
  }
  // Dynamic string: [0]=offset, [1]=length, then the bytes.
  if (body.length < 128) return "";
  const length = Number(BigInt(`0x${body.slice(64, 128)}`));
  return hexToUtf8(body.slice(128, 128 + length * 2));
}

function hexToUtf8(hexBody) {
  const bytes = hexBody.match(/../g) ?? [];
  return Buffer.from(bytes.map((b) => parseInt(b, 16))).toString("utf8").replace(/\0+$/, "");
}

/**
 * Fixed-point integer → decimal string, exactly. Amounts here are token values
 * that end up in a ledger, so they are formatted by string surgery on the
 * BigInt rather than passed through a float.
 */
export function formatUnits(value, decimals) {
  const negative = value < 0n;
  const digits = (negative ? -value : value).toString().padStart(decimals + 1, "0");
  const whole = digits.slice(0, digits.length - decimals);
  const fraction = decimals === 0 ? "" : digits.slice(digits.length - decimals).replace(/0+$/, "");
  return `${negative ? "-" : ""}${whole}${fraction ? `.${fraction}` : ""}`;
}

/**
 * Reads and caches `symbol()` / `decimals()` per token.
 *
 * A token that answers neither is still reported — with its address and raw
 * value — rather than dropped, because a silent omission in a payment list is
 * worse than an unlabelled row.
 */
export function createTokenInfo(rpc) {
  const cache = new Map();
  return async function tokenInfo(address) {
    const key = address.toLowerCase();
    if (!cache.has(key)) {
      const [symbolData, decimalsData] = await Promise.all([
        rpc.ethCall(key, SELECTOR.symbol).catch(() => null),
        rpc.ethCall(key, SELECTOR.decimals).catch(() => null),
      ]);
      cache.set(key, {
        symbol: decodeSymbol(symbolData) || "",
        decimals: decodeUint(decimalsData) ?? 18,
      });
    }
    return cache.get(key);
  };
}
