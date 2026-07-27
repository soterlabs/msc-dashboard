# Generated datasets

**Machine-written. Do not edit by hand** — run `pnpm refresh` instead.
Anything you type here is overwritten on the next run.

| File | Built from | Read by |
| --- | --- | --- |
| `dr.json` | `soterlabs/settle-dr-dune` → `dune-results/dr_comparison_latest.xlsx` | `loadDr()` |
| `ssr.json` | `soterlabs/settlement-reports` → `reports/<partner>/<month>/` | `loadSsr()` |
| `prime.json` | `../prime/payments.csv` + `../prime/wallets.csv` | `loadPrime()` |

The loaders live in `src/lib/load.ts` and run **on the server**: `src/app/page.tsx`
reads these files and passes the datasets to the views as props. Nothing here is
imported by a client component, so none of it becomes part of the browser's JS
bundle.

Each file's shape mirrors a `*Dataset` interface in `src/lib/`:
`DrDataset` (`types.ts`), `SsrDataset` (`ssr-types.ts`), `PrimeDataset`
(`prime-types.ts`). Change one and you must change the other.

## Why these are committed

The reads happen at build time, so the app needs them present to build. Keeping
them in git means:

- a build works offline, from a checkout alone;
- a data change arrives as a reviewable diff in a pull request, rather than
  appearing silently at deploy time;
- `git log` on a number actually shows when it changed.

They are pretty-printed for that last reason — one value per line diffs cleanly.

`prime.json` can be rebuilt on its own with `pnpm refresh:prime`, which needs
no network and no access to the private repos.
