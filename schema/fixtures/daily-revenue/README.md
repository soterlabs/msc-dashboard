These are actual public settle-api responses retrieved on 2026-09-16, with all
six primes published through 2026-09-15. Only unused MonthlyPnL fields (venue
arrays and the SDE daily breakdown) have been omitted; `sky_revenue_daily`,
`sde_revenue` and `susds_spread_reimbursement` were added on 2026-09-17 from
the same revisions. History is the actual Grove
September response, containing September 14 and 15; earlier dates are gaps.
Tests clone and modify these fixtures to simulate missing/error/revision cases.
They are test inputs, never production fallbacks or fabricated live results.
