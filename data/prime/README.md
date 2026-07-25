# Prime payments

`payments.csv` is the source of truth for the Prime Payments view: one row per
on-chain payment to a prime. It is parsed into `src/lib/prime-data.ts` by
`scripts/generate-data.mjs`; the column contract lives in
`schema/prime-payments.mjs`.

This file is written by hand. Nothing regenerates it — edit it freely.

## Refreshing

```sh
DUNE_API_KEY=... pnpm fetch-prime-payments 8040299
```

`scripts/fetch-prime-payments.mjs` keeps every existing row **verbatim** (which
preserves hand-filled columns and address casing) and only appends payments the
Dune query newly returns, then regenerates `prime-data.ts`. Rows in the CSV that
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
| **Kind** | `settlement cycle` or `other` (genesis / capital transfers). Hand-filled. |
| **Settles accrual** | Accrual month(s) the payment covers, e.g. `2026-05` or `2025-11 + 2025-12`. Usually blank for `other`, but not always — some genesis/reimbursement rows do settle a named month. |
| **Receiving wallet** | Wallet that received the funds. Required. |
| **Tx hash** | Transaction hash. Required. |
| **Log index** | Index of the Transfer event inside its transaction. Required — one tx can carry several payments, even two to the same wallet, so a row is identified by Tx hash + Log index, never Tx hash alone. |
| **Spell** | `YYYY-MM-DD` the spell itself is dated. Hand-filled for `spell` rows; blank for `transfer`. |
| **Spell address** | Address of the executed spell. Set for `spell`, blank for `transfer`. |
| **Subproxy constant** | On-chain constant, e.g. `SPARK_SUBPROXY`. Set for `spell`, blank for `transfer`. |
| **Label** | `MSC`, `Genesis Transfer`, `Transfer`, `Reimbursement`, `DR True-up`, `Genesis Capital`, or `Test` (1 USDS address-verification sends). Hand-filled; new labels are allowed. |
| **Reference** | Forum post URL for the payment. Blank if none. |
| **Source** | `spell` or `transfer` (see above). Required. |
| **From address** | Payer wallet. Set for `transfer`; blank for `spell`, which is minted. |
| **From label** | Human name for the payer, e.g. `Core Council Buffer`. |
| **To label** | Human name for the receiving wallet. |
| **Line item** | What the payment covers, where a source document states it. Left blank rather than inferred. |

**Wallet** is not a column: it is derived in `scripts/generate-data.mjs` from
Source (`spell` → `subproxy`) and the receiving wallet address. Add new
foundation/msig wallets to `PRIME_TRANSFER_WALLETS` there, or they default to
`other`.

## Validation

`pnpm generate-data` validates every row and **fails the build** on a malformed
one — a bad date, a non-address, an unknown `Kind`/`Source`, a non-positive
amount, a duplicate Tx hash + Log index, or a row that contradicts its own
Source (a `spell` row with a payer, a `transfer` row with a spell address).
Serving silently-wrong payment numbers is worse than a loud failure.

Rows that are merely unclassified — blank `Kind`, `Label`, or `Spell` on a spell
row — are reported as warnings and still build.
