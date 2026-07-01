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

/** Block-explorer base URLs per chain (address pages). */
const EXPLORERS: Record<string, { name: string; base: string }> = {
  ethereum: { name: "Etherscan", base: "https://etherscan.io/address/" },
  base: { name: "Basescan", base: "https://basescan.org/address/" },
  arbitrum: { name: "Arbiscan", base: "https://arbiscan.io/address/" },
  optimism: {
    name: "OP Etherscan",
    base: "https://optimistic.etherscan.io/address/",
  },
  unichain: { name: "Uniscan", base: "https://uniscan.xyz/address/" },
};

export function explorer(chain: string): { name: string; base: string } | null {
  return EXPLORERS[chain.toLowerCase()] ?? null;
}

export function explorerUrl(chain: string, address: string): string | null {
  const e = explorer(chain);
  return e ? `${e.base}${address}` : null;
}
