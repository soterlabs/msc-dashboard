-- Spell payments to prime subproxies — USDS minted into each prime's subproxy.
--
-- SAVED AS: query_8040299  (https://dune.com/queries/8040299)
--
-- Primes are NOT paid by an ERC-20 transfer from a payer wallet: Sky MINTS USDS
-- straight into the subproxy, so evt_Transfer.from is the zero address. The spell
-- that did it is the transaction target (ethereum.transactions.to). One cast tx
-- mints to several primes at once.
--
-- Produces the on-chain columns of data/spell-payments-to-prime-subproxies.md.
-- The editorial columns (kind, settles_accrual, spell date, label) are not
-- on-chain and are filled in by hand — note a single mint tx mixes settlement
-- cycles with one-off capital/genesis transfers, so `kind` can't be inferred here.
--
-- DuneSQL (Trino). USDS = 0xdC035D45d973E3EC169d2276DDab16f1e407384F (18 decimals).

with
    subproxies (prime, subproxy_constant, wallet) as (
        values
            ('SPARK',   'SPARK_SUBPROXY',   0x3300f198988e4C9C63F75dF86De36421f06af8c4),
            ('SKYBASE', 'SKYBASE_SUBPROXY', 0x08978E3700859E476201c1D7438B3427e3C81140),
            ('OBEX',    'OBEX_SUBPROXY',    0x8be042581f581E3620e29F213EA8b94afA1C8071),
            ('GROVE',   'GROVE_SUBPROXY',   0x1369f7b2b38c76B6478c0f0E66D94923421891Ba),
            ('KEEL',    'KEEL_SUBPROXY',    0x355CD90Ecb1b409Fdf8b64c4473C3B858dA2c310),
            ('AMATSU',  'AMATSU_SUBPROXY',  0xF33B14329e7115dD0B40DBb2985E1A0Df10E3fAa),
            ('OZONE',   'OZONE_SUBPROXY',   0x9FE628BFc33f0352Bb1f93168881a9Ef93C8d2CF),
            ('PRYSM',   'PRYSM_SUBPROXY',   0x24fdcd3bFA5C2553e05B2f9AD0365EBC296278D3),
            ('CCEA1',   'CCEA1_SUBPROXY',   0x64a2b7CfA832fE83BE6a7C1a67521B350519B9c1)
    ),

    mints as (
        select
            t.evt_block_time,
            t.evt_tx_hash,
            s.prime,
            s.subproxy_constant,
            s.wallet,
            round(cast(t.value as double) / 1e18, 2) as usds
        from erc20_ethereum.evt_Transfer t
        join subproxies s on t."to" = s.wallet
        where t.contract_address = 0xdC035D45d973E3EC169d2276DDab16f1e407384F
          and t."from" = 0x0000000000000000000000000000000000000000
          and t.evt_block_time >= timestamp '2024-09-01'
    )

select
    date(m.evt_block_time)  as cast_date,
    m.prime,
    m.usds,
    m.wallet                as receiving_wallet,
    m.evt_tx_hash           as tx_hash,
    tx."to"                 as spell_address,
    m.subproxy_constant
from mints m
join ethereum.transactions tx
  on tx.hash = m.evt_tx_hash
 and tx.block_time >= timestamp '2024-09-01'
order by m.evt_block_time desc, m.usds desc
