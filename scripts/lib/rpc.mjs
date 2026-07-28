/**
 * Minimal Ethereum JSON-RPC client.
 *
 * Deliberately dependency-free and keyless: the default endpoint serves archive
 * state and traces without an API key, which is what makes the spell history
 * reproducible by anyone with a checkout. Override with ETH_RPC_URL to use your
 * own node.
 *
 * Retries on transport errors and rate limits, because public endpoints throttle
 * and a half-finished fetch is worse than a slow one.
 */

/**
 * Keyless endpoints, tried in order. The first serves eth_getLogs with a
 * 10,000-block ceiling, which is what LOG_CHUNK below is sized for.
 *
 * Note what is NOT used here: trace_filter would identify a spell execution
 * directly, but no free endpoint serves it dependably — several accept it and
 * then refuse to route, so the log sweep is the reproducible route.
 */
export const DEFAULT_RPCS = [
  "https://0xrpc.io/eth",
  "https://eth.drpc.org",
  "https://gateway.tenderly.co/public/mainnet",
];

/** Widest block range the default endpoints allow for eth_getLogs. */
export const LOG_CHUNK = 10_000;

const RETRY_DELAYS_MS = [500, 1500, 4000, 10000];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function createRpc({
  urls = process.env.ETH_RPC_URL ? [process.env.ETH_RPC_URL] : DEFAULT_RPCS,
  // Public endpoints throttle; a small gap between calls is cheaper than
  // burning retries.
  minIntervalMs = 60,
  timeoutMs = 60_000,
} = {}) {
  let last = 0;
  let calls = 0;
  let current = 0;

  async function call(method, params) {
    const wait = last + minIntervalMs - Date.now();
    if (wait > 0) await sleep(wait);

    for (let attempt = 0; ; attempt++) {
      last = Date.now();
      calls++;
      let body;
      try {
        const res = await fetch(urls[current], {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", id: calls, method, params }),
          signal: AbortSignal.timeout(timeoutMs),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        body = await res.json();
      } catch (e) {
        if (attempt >= RETRY_DELAYS_MS.length) {
          if (current + 1 < urls.length) {
            current++;
            console.warn(`[rpc] ${urls[current - 1]} failing (${e.message}) — switching to ${urls[current]}`);
            attempt = -1;
            continue;
          }
          throw new Error(`${method} failed after ${attempt} retries: ${e.message}`);
        }
        await sleep(RETRY_DELAYS_MS[attempt]);
        continue;
      }
      if (body.error) {
        const msg = body.error.message ?? JSON.stringify(body.error);
        // Rate limits and transient node errors are worth retrying; a bad
        // request is not.
        const retryable = /rate|limit|timeout|busy|try again|429|503/i.test(msg);
        if (retryable && attempt < RETRY_DELAYS_MS.length) {
          await sleep(RETRY_DELAYS_MS[attempt]);
          continue;
        }
        // Some endpoints accept a method and then refuse to serve it. Move on
        // rather than reporting a data problem.
        if (/route|unsupported|not supported|personal token/i.test(msg) && current + 1 < urls.length) {
          current++;
          console.warn(`[rpc] ${urls[current - 1]} cannot serve ${method} (${msg.slice(0, 60)}) — switching to ${urls[current]}`);
          attempt = -1;
          continue;
        }
        throw new Error(`${method}: ${msg}`);
      }
      return body.result;
    }
  }

  return {
    get url() {
      return urls[current];
    },
    call,
    get callCount() {
      return calls;
    },
    /** Block header, or null if the block does not exist. */
    getBlock: (n) => call("eth_getBlockByNumber", [hex(n), false]),
    getTransaction: (h) => call("eth_getTransactionByHash", [h]),
    getReceipt: (h) => call("eth_getTransactionReceipt", [h]),
    blockNumber: async () => Number(await call("eth_blockNumber", [])),
    ethCall: (to, data) => call("eth_call", [{ to, data }, "latest"]),
    /** Logs in a block range, optionally filtered by indexed topics. */
    getLogs: (fromBlock, toBlock, topics) =>
      call("eth_getLogs", [{ fromBlock: hex(fromBlock), toBlock: hex(toBlock), topics }]),
  };
}

export const hex = (n) => `0x${BigInt(n).toString(16)}`;

/**
 * First block whose timestamp is >= `timestamp`, by binary search over headers.
 * Blocks are monotonic in time, so this is exact rather than an estimate.
 */
export async function blockAtOrAfter(rpc, timestamp, { lo: loHint = 1, hi: hiHint = null } = {}) {
  let lo = loHint;
  let hi = hiHint ?? (await rpc.blockNumber());
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const block = await rpc.getBlock(mid);
    if (Number(block.timestamp) < timestamp) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
