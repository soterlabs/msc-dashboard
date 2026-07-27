/**
 * Canonical Sky documentation links + small domain classifiers.
 *
 * The "XR" (exchange-rate) reward rates in this sheet are the Distribution /
 * Integration reward rates ratified by Sky governance in the Atlas, applied to
 * USDS / sUSDS (and Spark-wrapped) balances tagged by referral code. The links
 * below point readers at where those rates and the underlying mechanics are
 * defined.
 */

export interface DocLinkDef {
  label: string;
  url: string;
  note?: string;
}

export const DOCS: Record<string, DocLinkDef> = {
  atlas: {
    label: "Sky Atlas",
    url: "https://sky-atlas.io/",
    note: "Governance source of truth — where reward rates & budgets are ratified",
  },
  ecosystemRewards: {
    label: "Sky Ecosystem Rewards",
    url: "https://sky.money/sky-ecosystem-rewards",
    note: "How USDS supply earns Sky Agent rewards",
  },
  devDocs: {
    label: "Sky developer docs",
    url: "https://developers.sky.money/",
    note: "Protocol mechanics & contracts",
  },
  susds: {
    label: "sUSDS · Savings Rate",
    url: "https://developers.sky.money/protocol/tokens/susds/",
    note: "Savings USDS and the Sky Savings Rate",
  },
  stakingRewards: {
    label: "Staking rewards",
    url: "https://developers.sky.money/protocol/rewards/staking-rewards/",
  },
};

/**
 * Block explorers per chain, keyed by host so both address and transaction
 * pages come from one entry. Adding a chain here is enough for every link in
 * the app; hardcoding a scan URL at a call site is how a Base payment ends up
 * pointing at Etherscan.
 */
const EXPLORERS: Record<string, { name: string; host: string }> = {
  ethereum: { name: "Etherscan", host: "https://etherscan.io" },
  base: { name: "Basescan", host: "https://basescan.org" },
  arbitrum: { name: "Arbiscan", host: "https://arbiscan.io" },
  optimism: { name: "OP Etherscan", host: "https://optimistic.etherscan.io" },
  unichain: { name: "Uniscan", host: "https://uniscan.xyz" },
};

export function explorer(chain: string): { name: string; base: string } | null {
  const e = EXPLORERS[chain.toLowerCase()];
  return e ? { name: e.name, base: `${e.host}/address/` } : null;
}

export function explorerUrl(chain: string, address: string): string | null {
  const e = EXPLORERS[chain.toLowerCase()];
  return e ? `${e.host}/address/${address}` : null;
}

/** Transaction page for a hash on `chain`. */
export function txUrl(chain: string, hash: string): string | null {
  const e = EXPLORERS[chain.toLowerCase()];
  return e ? `${e.host}/tx/${hash}` : null;
}
