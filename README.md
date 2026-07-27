# msc-dashboard

Dashboard for Sky prime-agent accounting: distribution rewards, supply-side
revenues, and payments to primes. Next.js, deployed on Railway.

- dev — https://dev.settle.soterlabs.com
- production — https://settle.soterlabs.com

## Refresh and build are separate

This is the thing to understand before changing anything here.

```
  REFRESH  (network, on demand)          BUILD  (offline, deterministic)
  ───────────────────────────────        ─────────────────────────────────
  pnpm refresh                           pnpm build
    ├─ clones the private source repos     └─ reads data/generated/*.json
    ├─ parses xlsx / md / csv                 as committed. No network.
    └─ writes data/generated/*.json
         ↓
       git commit  →  reviewed in a PR
```

A data change therefore arrives as **a reviewable diff**, not as something that
appears at deploy time. Two consequences worth knowing:

- **A build never fetches anything.** It cannot break because someone changed a
  spreadsheet upstream, and it reproduces from a checkout alone. Deploys need no
  `GITHUB_TOKEN`.
- **Deploying does not refresh the numbers.** They are whatever was last
  refreshed and committed. `git log data/generated/` tells you when that was.

Before this split, `prebuild` ran the refresh on every deploy. A new directory
in the `settlement-reports` repo then broke five consecutive deploys over four
days, silently, because both environments kept serving their last good build.

## Commands

| | |
| --- | --- |
| `pnpm dev` | dev server |
| `pnpm build` / `pnpm start` | production build / serve. Offline. |
| `pnpm refresh` | rebuild all datasets from source. Needs network and access to the private repos. |
| `pnpm refresh:prime` | rebuild `prime.json` from the local CSVs only. Offline. |
| `pnpm fetch-prime-payments` | pull new payments from Dune into `data/prime/payments.csv`. Needs `DUNE_API_KEY`. |
| `pnpm test` | validator tests (`node:test`, nothing to install) |
| `pnpm lint` | eslint |

`pnpm refresh` clones over SSH by default, or over HTTPS if `GITHUB_TOKEN` is
set. Point `SETTLE_DR_DUNE_DIR` / `SETTLEMENT_REPORTS_DIR` at existing checkouts
to skip cloning.

## Where the data lives

```
data/
  prime/                  hand-maintained — see its README
    payments.csv            one row per on-chain payment to a prime
    wallets.csv             address → name + category
  generated/              machine-written, committed — see its README
    dr.json  ssr.json  prime.json
```

Sources of truth:

| Dataset | From |
| --- | --- |
| `dr.json` | `soterlabs/settle-dr-dune` → `dune-results/dr_comparison_latest.xlsx` |
| `ssr.json` | `soterlabs/settlement-reports` → `reports/<partner>/<month>/` |
| `prime.json` | `data/prime/*.csv` in this repo, fed by a Dune query |

## How the app reads it

`src/app/page.tsx` is a server component: it reads `data/generated/` through
`src/lib/load.ts` and passes the datasets to the client views as props, which
reach them via `useDr()` / `useSsr()` / `usePrime()`. The loaders use `node:fs`,
so importing one from a client component fails the build on purpose — the
datasets are not meant to be part of the browser bundle.

The page is statically prerendered, so the numbers are fixed at build time.

`src/lib/dataset-schema.ts` validates each dataset against its TypeScript type
on load and **fails the build** naming the offending field. That matters because
JSON gives no compile-time guarantee: a number arriving as a string would
otherwise render silently wrong, and `sum()` concatenates rather than adds.

```
src/lib/
  dr/{types,domain}.ts       one directory per report section
  ssr/{types,domain}.ts
  prime/{types,domain}.ts
  load.ts                    server-only reads of data/generated/
  dataset-schema.ts          runtime validation of those files (+ .test.ts)
  format.ts  links.ts        formatting and block-explorer URLs (+ links.test.ts)
  utils.ts
```

Domain selectors take their dataset as the first argument — they hold no module
state, which is what lets client components use them without pulling the data in.

## Adding data

- **A new prime payment** — usually `pnpm fetch-prime-payments`, then fill in the
  hand-maintained columns. See `data/prime/README.md`.
- **A new prime wallet** — add a row to `data/prime/wallets.csv`. An unregistered
  wallet on a transfer fails the refresh rather than defaulting to a category.
- **A new SSR partner** — add it to `SSR_KNOWN_PARTNERS` in
  `scripts/generate-data.mjs`, `SSR_PARTNER_META` in `src/lib/ssr/domain.ts`, and
  `SSR_PARTNERS` in `src/lib/dataset-schema.ts`. A protocol-wide aggregate that
  is not a partner goes in `SSR_NON_PARTNER_DIRS` instead.
- **A new payment label** — add it to `LABEL_KINDS` in
  `schema/prime-payments.mjs` with the `Kind` it implies.

Each of these fails loudly if skipped, which is deliberate.
