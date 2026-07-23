-- Prime payments — USDS reaching a prime, by either route.
--
-- SAVED AS: query_8040299  (https://dune.com/queries/8040299)
--
-- Two routes, tagged by `source`:
--
--   spell    — Sky MINTS USDS straight into the prime's subproxy, so
--              evt_Transfer.from is the zero address and there is no payer. The
--              spell that did it is the transaction target
--              (ethereum.transactions.to). One cast tx mints to several primes.
--   transfer — an ordinary ERC-20 send from a budget multisig to a prime-side
--              wallet (reimbursements, true-ups, genesis capital). No spell, so
--              spell_address is null and from_address / from_label name the payer.
--
-- One transaction can carry several Transfer events — even two to the same
-- wallet — so a row is identified by tx_hash + log_index, not tx_hash alone.
--
-- Produces the on-chain columns of data/prime-payments.md. The editorial columns
-- (kind, settles_accrual, spell date, label, reference, line item) are not
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

    -- Budget multisigs that pay primes directly. The payer changed over time:
    -- Launch Project, then an ops multisig funded by the Simplification Buffer
    -- Budget and Launch Project, then the Core Council Buffer.
    payers (from_label, wallet) as (
        values
            ('Core Council Buffer',               0x210CFcF53d1f9648C1c4dcaEE677f0Cb06914364),
            ('Launch Project',                    0x3c5142f28567e6a0f172fd0baaf1f2847f49d02f),
            ('SBB / Launch Project ops multisig', 0xfa22c2acfee6221829510d98d57ace29ec497009)
    ),

    -- Prime-side wallets that receive those transfers. Deliberately excludes
    -- 0x9106cbf2c882340b23cc40985c05648173e359e7: it owns the Grove
    -- Reimbursements Safe, but it is a broad operational multisig predating
    -- Grove and its earlier inflows are not confirmed to be Grove's, so the one
    -- row we do count from it is kept by hand rather than pulled in wholesale.
    prime_wallets (prime, to_label, wallet) as (
        values
            ('GROVE',   'Grove Reimbursements', 0x1E12328d9726f6bDb53B8B2526da3ed5Dca5058E),
            ('SKYBASE', 'Skybase Foundation',   0x58B945c8Ce34BD8cEA3Fc0437626F9F87d58A621),
            ('OSERO',   'Osero Foundation',     0xfDD055D3CCEE0D955031CF1FD76c8Db9317cCC58)
    ),

    mints as (
        select
            t.evt_block_time,
            t.evt_tx_hash,
            t.evt_index,
            s.prime,
            s.wallet                                as receiving_wallet,
            round(cast(t.value as double) / 1e18, 2) as usds,
            'spell'                                 as source,
            s.subproxy_constant,
            cast(null as varbinary)                 as from_address,
            cast(null as varchar)                   as from_label,
            cast(null as varchar)                   as to_label
        from erc20_ethereum.evt_Transfer t
        join subproxies s on t."to" = s.wallet
        where t.contract_address = 0xdC035D45d973E3EC169d2276DDab16f1e407384F
          and t."from" = 0x0000000000000000000000000000000000000000
          and t.evt_block_time >= timestamp '2024-09-01'
    ),

    direct as (
        select
            t.evt_block_time,
            t.evt_tx_hash,
            t.evt_index,
            w.prime,
            w.wallet                                as receiving_wallet,
            round(cast(t.value as double) / 1e18, 2) as usds,
            'transfer'                              as source,
            cast(null as varchar)                   as subproxy_constant,
            p.wallet                                as from_address,
            p.from_label,
            w.to_label
        from erc20_ethereum.evt_Transfer t
        join prime_wallets w on t."to" = w.wallet
        join payers p on t."from" = p.wallet
        where t.contract_address = 0xdC035D45d973E3EC169d2276DDab16f1e407384F
          and t.evt_block_time >= timestamp '2024-09-01'
    ),

    payments as (
        select * from mints
        union all
        select * from direct
    )

select
    date(p.evt_block_time) as cast_date,
    p.prime,
    p.usds,
    p.receiving_wallet,
    p.evt_tx_hash          as tx_hash,
    p.evt_index            as log_index,
    -- only a spell mint has a spell behind it; for a transfer the tx target is
    -- just the paying Safe, which would be misleading here
    case when p.source = 'spell' then tx."to" end as spell_address,
    p.subproxy_constant,
    p.source,
    p.from_address,
    p.from_label,
    p.to_label
from payments p
left join ethereum.transactions tx
  on tx.hash = p.evt_tx_hash
 and tx.block_time >= timestamp '2024-09-01'
order by p.evt_block_time desc, p.usds desc
