# Distribution rewards — hand-maintained input

- **`l2-addresses.csv`** — the L2 sUSDS addresses behind ref code `10001`
  (smart-contract-held L2 sUSDS), one row per `chain,label,address,ref_code`.
  Read by `scripts/generate-data.mjs` into `dr.json`'s `l2Addresses`, which
  backs the "L2 addresses" tab of the Distribution Rewards view.

Nothing regenerates this README — edit it freely.

## Why it is hand-maintained

It was not always. Until the July 2026 settlement the list came from the
`L2 sUSDS Filtered Addresses` sheet of
`settle-dr-dune/dune-results/dr_comparison_latest.xlsx`. The DR pipeline was
then rebuilt on HyperSync (`hypersync-results/dr_comparison_hypersync.xlsx`),
and that workbook emits no such sheet — the addresses are an input to the
pipeline now, not an output of it.

The rows here are the last published version of that sheet, frozen from the
Dune workbook at `settle-dr-dune` commit `903f844` (2026-07-07), the same
snapshot the dashboard had been serving. **They are a reference list, not a
settlement input:** no revenue number is computed from them, so a stale row
misleads a reader without misstating a total.

## Editing

Add or remove rows as the L2 deployments change, then:

```sh
pnpm refresh -- --only=dr
```

`chain` must be one of the chains the explorer registry knows
(`src/lib/links.ts`), and `address` is checksummed as published on-chain — it
is rendered as a block-explorer link.
