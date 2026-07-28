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
pnpm fetch-core-spells --from 2026-01-01 --to 2026-06-30   # --to is inclusive
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
   makes attribution possible at all. The roster it defines: AMATSU, CCEA1,
   GROVE, INTERVAL, KEEL, OBEX, OZONE, PATTERN, PRYSM, SKYBASE, SPARK.
2. `../prime/wallets.csv` — our own names, and the `Prime` each wallet belongs
   to. Governance and programme wallets are deliberately left unattributed: the
   Core Council buffer pays primes but is not one.
3. `../prime/payments.csv` — the prime each receiving wallet has been paid for.

## Tagging

Two columns carry the classification, kept apart on purpose:

- **`Movement`** — the mechanical fact: `mint`, `burn` or `transfer`.
- **`Tag`** — what it means. Where `../prime/payments.csv` already records the
  transfer, its hand-curated `Label` decides the tag, because a human did.
  Otherwise the tag is derived from the parties, token and amount — never from
  guessed intent.
- **`Coverage`** — `payments.csv` if already recorded, `new` if not. **This is
  the column to sort by.** Every `new` row is one nobody has classified.

| Tag | Meaning |
| --- | --- |
| `msc-payment` | settlement-cycle payment to a prime |
| `capital-transfer` | capital minted into a prime, not a settlement cycle |
| `prime-mint` | minted into a prime, **not yet classified** in payments.csv |
| `cross-prime` | between two different primes — e.g. Spark → Grove for Ethena |
| `intra-prime` | between wallets of one prime |
| `prime-inflow` / `prime-outflow` | a prime received from / sent to a non-prime |
| `prime-dust` | a sub-unit or 1-unit movement to or from a prime |
| `plumbing` | no prime, both sides known Sky contracts |
| `protocol-outflow` / `protocol-inflow` | value crossed the protocol boundary |
| `unclassified` | neither side recognised |

`prime-dust` and `prime-mint` both stop at what is known rather than naming a
motive the data cannot support. Two of the six dust rows are spDAI/spUSDS residue
from Spark's vault-share accounting, not the 1 USDS address checks — so the tag
says "dust" and leaves why to a reader. Note the threshold counts **units, not
value**: 1 WETH would qualify.

`prime-mint` deliberately does **not** guess between `msc-payment` and
`capital-transfer`. The transfer says only that USDS was minted into a prime;
which accrual it settles is the judgement payments.csv records. A row tagged
`prime-mint` is a row somebody should classify.

Current distribution over the 633 transfers:

```
plumbing          433
protocol-outflow  123
msc-payment        29 ✓    prime-dust          6
unclassified       17      prime-mint          6  ← need classifying
prime-outflow       8      prime-inflow        2
capital-transfer    7 ✓    cross-prime         1
                           protocol-inflow     1
```

`✓` = every row already in payments.csv. Plumbing dominating is expected: a
USDS payment travels through a DAI mint → `DAI_USDS` → burn.

## Known gaps

- **6 `prime-mint` rows are unclassified**: the five 2026-07-20 mints (an MSC
  cycle that payments.csv has not caught up with) and a 10,000,000 USDS mint to
  SKYBASE_SUBPROXY on 2026-02-02.
- **37 addresses have no name.** Third parties a spell paid that appear in
  neither reference list. Six of them are named in the ecosystem address book —
  BLUE-AD, Cloaky-AD, Bonapublica-AD, Aave-IB, the Aligned Delegate Buffer
  Multisig and Integration Boost — but none is prime-related, so none is used
  here. They are reported by frequency at the end of a run, and an unnamed
  address still gets its full row.
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
