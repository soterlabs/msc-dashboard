# Prime payments

Two files back the Prime Payments view, both written by hand:

- **`payments.csv`** — one row per on-chain payment to a prime.
- **`wallets.csv`** — one row per wallet that needs a name or a category.

They are parsed into `data/generated/prime.json` by `scripts/generate-data.mjs`;
the column contracts live in `schema/prime-payments.mjs` and
`schema/prime-wallets.mjs`.

Nothing regenerates this README — edit it freely.

## Refreshing

```sh
DUNE_API_KEY=... pnpm fetch-prime-payments 8040299
```

`scripts/fetch-prime-payments.mjs` keeps every existing row **verbatim** (which
preserves hand-filled columns and address casing) and only appends payments the
Dune query newly returns, then regenerates `prime.json`. Rows in the CSV that
the query does not return are kept, never dropped.

New rows arrive with the hand-filled columns blank; the script lists them so you
can classify them before committing.

## Two kinds of payment

Told apart by **Source**:

- `spell` — Sky **mints** USDS straight into the prime's subproxy when a spell is
  cast, so there is no payer (the ERC-20 `from` is the zero address). These rows
  come from the Dune query in `scripts/dune/prime-payments.sql`
  ([8040299](https://dune.com/queries/8040299)) and carry Spell / Spell address /
  Subproxy constant.
- `transfer` — an ordinary ERC-20 transfer from a budget multisig to a prime's
  wallet (reimbursements, true-ups, genesis capital). No spell is involved, so
  the spell columns are blank and From address / From label identify the payer.
  The query covers the known payer and prime-side wallets; a payment outside that
  set is added by hand and preserved on refresh.

## Columns

| Column | Notes |
| --- | --- |
| **Cast date** | `YYYY-MM-DD`, the date the payment landed on-chain. Required. |
| **Prime** | Prime / agent receiving the payment, e.g. `SPARK`. Required. |
| **USDS** | Whole USDS transferred, not wei. Required, must be positive. |
| **Kind** | `settlement cycle` or `other` (genesis / capital transfers). Hand-filled, and must agree with **Label** — see below. |
| **Settles accrual** | Accrual month(s) the payment covers, e.g. `2026-05` or `2025-11 + 2025-12`. Usually blank for `other`, but not always — some genesis/reimbursement rows do settle a named month. |
| **Receiving wallet** | Wallet that received the funds. Required. |
| **Tx hash** | Transaction hash. Required. |
| **Log index** | Index of the Transfer event inside its transaction. Required — one tx can carry several payments, even two to the same wallet, so a row is identified by Tx hash + Log index, never Tx hash alone. |
| **Spell** | `YYYY-MM-DD` the spell itself is dated. Hand-filled for `spell` rows; blank for `transfer`. |
| **Spell address** | Address of the executed spell. Set for `spell`, blank for `transfer`. |
| **Subproxy constant** | On-chain constant, e.g. `SPARK_SUBPROXY`. Set for `spell`, blank for `transfer`. |
| **Label** | `MSC`, `Genesis Transfer`, `Transfer`, `Reimbursement`, `DR True-up`, `Genesis Capital`, or `Test` (1 USDS address-verification sends). Hand-filled. A new label must be registered in `LABEL_KINDS` first — see below. |
| **Reference** | Forum post URL for the payment. Blank if none. |
| **Source** | `spell` or `transfer` (see above). Required. |
| **From address** | Payer wallet. Set for `transfer`; blank for `spell`, which is minted. |
| **Line item** | What the payment covers, where a source document states it. Left blank rather than inferred. |

Three fields reach the dashboard without being columns here, because they are
facts about a wallet rather than about a payment. They are resolved from
`wallets.csv` at generate time:

- **From label** / **To label** — the payer's and the recipient's names.
- **Wallet** — the recipient's category. A `spell` mint always lands in a
  `subproxy`, so it needs no lookup; a `transfer` is keyed by its receiving
  wallet.

## wallets.csv

| Column | Notes |
| --- | --- |
| **Address** | The wallet. Matched case-insensitively. Required. |
| **Label** | Human name, e.g. `Core Council Buffer`. Required. |
| **Type** | `subproxy`, `foundation`, `msig` or `other`. Required for any wallet that **receives** a transfer; left blank for payer-only wallets rather than asserting a category nobody has verified. |

Subproxies are deliberately absent. A `spell` row's category comes from its
Source, and naming one would put text in the dashboard's To column, which is a
content decision rather than plumbing.

An address used by a `transfer` row and missing from this file is an **error**,
not a silent fallback to `other` — a miscategorised wallet is a wrong number on
the dashboard. `pnpm fetch-prime-payments` prints ready-to-paste lines for any
wallet Dune returns that is not registered yet.

## Validation

`pnpm generate-data` validates every row and **fails the build** on a malformed
one — a bad date, a non-address, an unknown `Kind`/`Source`, a non-positive
amount, a duplicate Tx hash + Log index, a row that contradicts its own Source
(a `spell` row with a payer, a `transfer` row with a spell address), or a
transfer touching a wallet that is not in `wallets.csv`. Serving silently-wrong
payment numbers is worse than a loud failure.

`Kind` and `Label` say overlapping things, so they are cross-checked: `MSC`
implies `settlement cycle` and every other label implies `other`, per
`LABEL_KINDS` in `schema/prime-payments.mjs`. A row whose `Kind` contradicts its
`Label` fails, and so does a `Label` that is not listed there — adding one is a
deliberate one-line change rather than a free-text cell.

Rows that are merely unclassified — blank `Kind`, `Label`, or `Spell` on a spell
row — are reported as warnings and still build.
