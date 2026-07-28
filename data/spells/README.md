# Core spell executions

What the Sky pause proxy executed, and the ERC-20 transfers each execution
emitted, attributed to a prime where one is involved.

Both files are written by `pnpm fetch-core-spells` — **machine-written, do not
edit by hand.** They are committed so a change is a reviewable diff, and because
re-fetching takes a few minutes and ~700 RPC calls.

| File | One row per |
| --- | --- |
| `executions.csv` | core spell that executed |
| `transfers.csv` | ERC-20 `Transfer` emitted by one of those executions |

Nothing in the app reads these yet.

## Refreshing

```sh
pnpm fetch-core-spells                    # since 2025-07-01
pnpm fetch-core-spells --from 2026-01-01
ETH_RPC_URL=https://… pnpm fetch-core-spells
```

No API key needed: the default endpoints serve `eth_getLogs` over historical
ranges without one. `--no-names` skips the GitHub lookups, which costs the spell
names and most address names but not the data.

## How a spell is found

The pause proxy (`MCD_PAUSE_PROXY`, `0xBE8E…98FB`) acts only when
`DSPause.exec` delegatecalls a spell's action, and **nothing announces that with
an event of its own**. `trace_filter` would show it directly, but no free
endpoint serves traces dependably — several accept the method and then refuse to
route it. So instead:

1. **Sweep** for logs carrying the pause proxy in their first indexed argument.
   Sky's core contracts use DSNote, whose `LogNote` indexes the caller there, and
   an ERC-20 `Transfer` indexes the sender there — so any contract the proxy
   touches leaves such a log.
2. **Filter** to transactions that call `cast()` (`0x96d373e5`). The sweep alone
   is far too broad: over a year it finds ~260 transactions, of which 24 are
   spells. The proxy's address also appears in that topic position when it is the
   *subject* rather than the actor — `rely(pauseProxy)` emits
   `Rely(address indexed usr)`, and Chainlink feeds name it too.
3. **Reconcile** against the archived spells in `sky-ecosystem/spells-mainnet`,
   which records each spell's deployed address in
   `archive/<dir>/test/config.sol`. That supplies the names, and makes two kinds
   of gap visible rather than silent: a cast matching no archived spell, and an
   archived spell that never appears on-chain.

## Prime attribution

An address is tied to a prime through three layers, most authoritative first:

1. `src/test/addresses_mainnet.sol` in the spells repo — the canonical name for
   every core contract, including one `<PRIME>_SUBPROXY` per prime. This is what
   makes attribution possible at all.
2. `../prime/wallets.csv` — our own names for payer and non-subproxy wallets.
3. `../prime/payments.csv` — the prime each receiving wallet has been paid for.

`Kind` says what the transfer means for a prime:

| Kind | Meaning |
| --- | --- |
| `inflow` | a prime wallet received the tokens |
| `outflow` | a prime wallet sent them |
| `mint` / `burn` / `transfer` | no prime on either side |

Most rows are the last case, and that is expected: a USDS payment travels
through a DAI mint → `DAI_USDS` → burn, so the plumbing outnumbers the payments
roughly ten to one.

## Known gaps

- **37 addresses have no name.** Third parties a spell paid that appear in
  neither reference list. They are reported by frequency at the end of a run, and
  an unnamed address still gets its full row — nothing is dropped for being
  unrecognised.
- **`2025-08-07-DssSpell` is archived but was never cast** in this window. Worth
  a look: either it was superseded before execution, or it executed by a route
  the `cast()` filter does not see.
- A spell cast through a relayer, so that the transaction's `to` is not the spell
  and the selector is not `cast()`, would be missed. None so far — the archive
  reconciliation is what would reveal it.

## Verification

Every spell payment recorded in `../prime/payments.csv` since 2025-07-01 —
**36 of 36** — is reproduced here with the same transaction, recipient, amount
and prime. That data was assembled independently, from a Dune query, so the
agreement is a real cross-check rather than a tautology.
