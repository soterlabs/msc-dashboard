# Generated datasets

**Machine-written. Do not edit by hand** — run `pnpm refresh` instead.
Anything you type here is overwritten on the next run.

| File | Built from | Read by |
| --- | --- | --- |
| `dr.json` | `soterlabs/settle-dr-dune` → `hypersync-results/dr_comparison_hypersync.xlsx` + `py/drhs/revenue/rates.py`, `soterlabs/settlement-cycle` → `config/dr_ref_codes.yaml`, `../dr/l2-addresses.csv` | `loadDr()` |
| `ssr.json` | `soterlabs/settlement-reports` → `reports/<partner>/<month>/` | `loadSsr()` |
| `sky-total.json` | `soterlabs/settlement-reports` → `reports/sky_total/<month>/summary.md` | `loadSkyTotal()` |
| `tmf.json` | `soterlabs/settlement-reports` → `reports/tmf/data/sbe_history.json` (copied through as published) | `loadTmf()` |
| `prime.json` | `../prime/payments.csv` + `../prime/wallets.csv` | `loadPrime()` |

The loaders live in `src/lib/load.ts` and run **on the server**: `src/app/page.tsx`
reads these files and passes the datasets to the views as props. Nothing here is
imported by a client component, so none of it becomes part of the browser's JS
bundle.

Each file's shape mirrors a `*Dataset` interface in `src/lib/<domain>/types.ts`:
`DrDataset`, `SsrDataset`, `SkyTotalDataset`, `TmfDataset`, `PrimeDataset`. Change one and you
must change the other — `src/lib/dataset-schema.ts` checks it at load and fails
the build naming the field.

## Why these are committed

The reads happen at build time, so the app needs them present to build. Keeping
them in git means:

- a build works offline, from a checkout alone;
- a data change arrives as a reviewable diff in a pull request, rather than
  appearing silently at deploy time;
- `git log` on a number actually shows when it changed.

They are pretty-printed for that last reason — one value per line diffs cleanly.

`prime.json` can be rebuilt on its own with `pnpm refresh:prime`, which needs
no network and no access to the private repos. Any subset can be rebuilt with
`pnpm refresh -- --only=dr,ssr`.

`tmf.json` is the one file here the refresh does not compute — upstream
publishes it already aggregated and already versioned, so the refresh copies it
through and checks `schema_version`. A major bump fails the refresh rather than
writing a document whose fields the views no longer recognise.
