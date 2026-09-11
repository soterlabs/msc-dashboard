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

## Two tiers

Most of this dashboard is settled data: written by a refresh, committed, and
read by an offline build. One dataset is not, because it has no monthly
settlement to hang a refresh off — the buyback series moves daily.

| Tier | Source | Freshness | Datasets |
| --- | --- | --- | --- |
| settled | committed JSON, offline build | monthly, in a reviewed PR | `dr`, `ssr`, `sky-total`, `prime` |
| live | settle-api, fetched server-side with revalidation, falling back to the committed snapshot | daily | `tmf` (Buybacks & Burn) |

**The settled tier is unchanged and stays that way.** Its loaders do not fetch;
a build still reproduces from a checkout alone. The split below — refresh
writes, build reads — describes it exactly as before.

The live tier adds one thing and keeps everything else: `loadTmf()` asks
settle-api first (`src/lib/tmf/api.ts`, revalidated hourly) and validates the
response with the same `validateTmf` the committed file goes through, because a
payload nobody reviewed in a pull request deserves more checking, not less. Any
failure — unreachable, non-200, timeout, a field renamed upstream — logs a
warning and falls back to `data/generated/tmf.json`. **A build with no network
therefore still succeeds**, rendering the snapshot.

The tab says which one it is showing: "data through … · run N" when live, and a
badge reading "showing the last published snapshot — live data unavailable"
when it fell back. A stale figure that looks live is the failure worth
preventing; an outage that is visible is not.

## Commands

| | |
| --- | --- |
| `pnpm dev` | dev server |
| `pnpm build` / `pnpm start` | production build / serve. Offline. |
| `pnpm refresh` | rebuild all datasets from source. Needs network and access to the private repos. |
| `pnpm refresh -- --only=dr,ssr` | rebuild just those, cloning only the repos they need. |
| `pnpm refresh:sky-total` | rebuild `sky-total.json` from `settlement-reports` only. Needs network. |
| `pnpm refresh:tmf` | rebuild `tmf.json` (Smart Burn Engine) from `settlement-reports` only. Needs network. |
| `pnpm refresh:prime` | rebuild `prime.json` from the local CSVs only. Offline. |
| `pnpm fetch-prime-payments` | pull new payments from Dune into `data/prime/payments.csv`. Needs `DUNE_API_KEY`. |
| `pnpm test` | validator tests (`node:test`, nothing to install) |
| `pnpm lint` | eslint |

`pnpm refresh` clones over SSH by default, or over HTTPS if `GITHUB_TOKEN` is
set. Point `SETTLE_DR_DUNE_DIR` / `SETTLEMENT_CYCLE_DIR` / `SETTLEMENT_REPORTS_DIR`
at existing checkouts to skip cloning.

Datasets fail independently: an upstream report format change breaks one parser
while the others are fine, and `--only=` is how the unaffected ones keep moving
until it is fixed. Nothing is ever half-written — every selected dataset is
parsed before any file is replaced.

## Which tabs are shown

Three tabs sit behind feature flags and are **hidden unless switched on**
(`src/lib/flags.ts`, see `.env.example`):

| Variable | Tab |
| --- | --- |
| `NEXT_PUBLIC_SHOW_SKY_TOTAL_NET_REVENUE` | Sky Total Net Revenue |
| `NEXT_PUBLIC_SHOW_BUYBACKS` | Buybacks & Burn |
| `NEXT_PUBLIC_SHOW_PRIME_PAYMENTS` | Prime Payments |

Set either to `true` (or `1`) to show its tab; anything else, unset included,
hides it. Hidden means hidden, not merely unlinked: a flagged-off tab's route
404s and its loader is never called, so those numbers reach neither the page nor
the payload.

The values are inlined at **build** time (they must be, to reach a client
component), so flipping one on Railway takes a redeploy, not a restart.

## Where the data lives

```
data/
  dr/                     hand-maintained — see its README
    l2-addresses.csv        L2 sUSDS addresses behind ref code 10001
  prime/                  hand-maintained — see its README
    payments.csv            one row per on-chain payment to a prime
    wallets.csv             address → name + category
  generated/              machine-written, committed — see its README
    dr.json  ssr.json  sky-total.json  tmf.json  prime.json
```

Sources of truth:

| Dataset | From |
| --- | --- |
| `dr.json` | `soterlabs/settle-dr-dune` **at the commit settlement-cycle pins** → `hypersync-results/dr_comparison_hypersync.xlsx` (amounts) + `py/drhs/revenue/rates.py` (reward schedule) |
| | `soterlabs/settlement-cycle` → `config/dr_ref_codes.yaml` (ref code → prime) |
| | `data/dr/l2-addresses.csv` in this repo |
| `ssr.json` | `soterlabs/settlement-reports` → `reports/<partner>/<month>/` |
| `sky-total.json` | `soterlabs/settlement-reports` → `reports/sky_total/<month>/summary.md` |
| `tmf.json` | `soterlabs/settlement-reports` → `reports/tmf/data/sbe_history.json` |
| `prime.json` | `data/prime/*.csv` in this repo, fed by a Dune query |

`settlement-reports` is `settlement-cycle`'s publish target: `reports/<partner>/
<month>/` there is byte-identical to `settlements/<partner>/<month>/` in the
cycle repo, and it carries only the reports. That is why the SSR datasets read
the small published mirror while DR reads one config file from the cycle repo
itself — the ref-code attribution has no published copy.

### Why DR takes three sources

Until July 2026 it took one: the Dune workbook's `Summary` tab carried the
amounts, the `group` column that attributed each ref code to a prime, a rates
tab and an L2 address list. The pipeline was then rebuilt on HyperSync and that
workbook is flat — no `Summary`, no `group`, no rates, no addresses. So each
piece now comes from wherever it actually lives: attribution from the config the
settlement itself reads, rates from the pipeline's own schedule (which is how
the dashboard picked up the 2026-07-09 cut of XR from 0.5% to 0.2%), and the
address list from a frozen copy in this repo.

### Why DR follows a pinned commit

`settle-dr-dune` is a submodule of `settlement-cycle`, and a settlement is
computed from the commit pinned at the time it ran. The refresh reads that
pin — `git ls-tree HEAD settle-dr-dune` in the cycle checkout — and fetches
exactly that commit, rather than the pipeline repo's own HEAD.

The pipeline keeps moving between settlements. On 2026-09-07 its HEAD carried a
ref code (`3006`) that no settlement had attributed yet, so a refresh from HEAD
failed the attribution guard outright; had it not, the DR tab would have been
showing amounts the August settlement never paid, next to an SSR tab that read
the settled ones. Following the pin is what keeps the two agreeing by
construction rather than by luck of timing.

`SETTLE_DR_DUNE_DIR` overrides this — the checkout it points at is used as-is,
at whatever revision it happens to be on.

`SETTLEMENT_CYCLE_DIR` therefore decides the DR revision too, when
`SETTLE_DR_DUNE_DIR` is not also set: the pin is read from whatever branch that
checkout is on. The refresh prints the commit it resolved, so the log says which
one was used.

## Sky total spans two methodologies

`sky_total` changed definition mid-series. Closed months are not *converted* to
the newer basis — each keeps the reading it was published under — though their
figures do get restated upstream when the methodology behind that reading
changes (the 2026-08-06 execution-month re-bucketing moved every Jan–Jun
month's Sky Net Revenue, and the refresh reflected it):

| Months | Basis | The month carries |
| --- | --- | --- |
| Jan–Jun 2026 | buffer | the settlement that **executed** in it — so the previous cycle's revenue |
| Jul 2026 → | accrual | the revenue **earned** in it, paid at the settlement that follows |

`SkyTotalReport.basis` says which reading a month is on, and the view labels
every column with it. The two do not add up: summing across the boundary either
counts a cycle twice or skips one, which is why that tab headlines the latest
month rather than a running total.

## URLs

Every view has one, so it can be sent to someone:

| | |
| --- | --- |
| `/distribution-rewards` | summary; `/refcodes` and `/rates` are the other tabs |
| `/distribution-rewards/refcodes/128` | that code's token history, open |
| `/settlement-revenues` | all primes |
| `/settlement-revenues/grove` | Grove, its latest settlement |
| `/settlement-revenues/grove/2026-08` | Grove, August |
| `/sky-total/2026-08` | that month's waterfall; bare `/sky-total` is the latest |
| `/buybacks` | buybacks and burn, monthly; `/quarterly` and `/annual` regroup it |
| `/prime-payments` | the payments ledger |

`src/lib/routes.ts` is the one place these are spelled: the route segments, the
sidebar links and the views' drill-downs all read it, because a slug typed
twice is a 404 nobody notices until they share the link.

**Navigation only.** The URL carries which report, prime, month and ref code —
not the filters, sort or search, which are how a page is being read rather than
which page it is, and would otherwise rewrite history on every keystroke.

**A month is optional and pinned.** `/settlement-revenues/grove` keeps working
as months are added; `/settlement-revenues/grove/2026-08` keeps showing August.
The former `/supply-side-revenues/…` paths redirect here (`next.config.ts`).
A month a prime never settled 404s — Osero has no January, and a link claiming
otherwise should say so rather than quietly showing different figures.

**A hidden report has no address.** With its flag off, the route 404s and its
loader is never called, so the tab being unreachable and its numbers being
absent stay the same fact.

## How the app reads it

Each route's `page.tsx` is a server component: it reads the one file it needs
from `data/generated/` through `src/lib/load.ts` and hands it to its view
through the matching provider, which the view reads with `useDr()` / `useSsr()`
/ `useSkyTotal()` / `usePrime()`. The loaders use `node:fs`, so importing one
from a client component fails the build on purpose — the datasets are not meant
to be part of the browser bundle.

Because a route loads only its own dataset, opening Prime Payments no longer
ships the DR, SSR and Sky Total numbers with it; before the routes there was one
page and every payload carried all four.

The pages are statically prerendered — including one per prime, month and ref
code, from `generateStaticParams` — so the numbers are fixed at build time.

`src/lib/dataset-schema.ts` validates each dataset against its TypeScript type
on load and **fails the build** naming the offending field. That matters because
JSON gives no compile-time guarantee: a number arriving as a string would
otherwise render silently wrong, and `sum()` concatenates rather than adds.

```
src/lib/
  dr/{types,domain}.ts       one directory per report section
  ssr/{types,domain}.ts
  sky-total/types.ts
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
- **A new sky_total month** — publish `reports/sky_total/<month>/summary.md` in
  `settlement-reports`, then `pnpm refresh:sky-total`. Picked up automatically;
  the parser reconciles the waterfall against the report's own headline and fails
  if it drifts by over a cent.
- **A new payment label** — add it to `LABEL_KINDS` in
  `schema/prime-payments.mjs` with the `Kind` it implies.

Each of these fails loudly if skipped, which is deliberate.
