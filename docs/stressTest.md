# FolioScope NAV and Portfolio Stress-Test Report

## 1. Scope

This report tests two different things:

1. NAV and accounting-engine correctness under historical and adversarial
   events.
2. Current portfolio behavior under shocks already experienced or discussed,
   plus larger hypothetical crashes.

The peer comparison uses three reference levels:

- ordinary B.Tech or fresher MERN portfolio projects;
- strong backend-focused fresher projects;
- production financial-accounting systems.

The database fixture is the corrected FolioScope export dated 10 July 2026.

## 2. Tested dataset

| Component | Count |
| --- | ---: |
| Portfolio groups | 18 |
| Parent groups | 6 |
| Leaf groups | 12 |
| Group statements | 85 |
| Deposits | 83 |
| Taxes | 2 |
| Ledger statements | 117 |
| Buys | 117 |
| NAV documents | 4,846 |
| Parent NAV documents | 2,694 |
| Price-history documents | 104,342 |
| Replayed economic events | 202 |
| Longest NAV history | 751 calendar days |

This fixture contains no withdrawal, sell or dividend. Those paths were tested
synthetically, not against real stored transactions.

## 3. Stress-test result

```text
Algorithmic tests passed: 15
Algorithmic tests failed:  0
Known design failures:      6
Database concurrency tests: not executed
```

The mathematical algorithm passed. The surrounding database service is not
production-safe yet.

## 4. Historical stresses already present in the data

### 4.1 Children starting on different dates and NAV bases

This was the failure that exposed the original parent-unit bug.

The test replayed every deposit and independently issued units for:

```text
leaf -> parent -> grandparent -> root
```

Result:

```text
Leaf-unit mismatches:        0
Parent records still wrong:  0
```

The root now has:

```text
Value:  â‚¹16,80,318.3677046
Units:  16,983.07296882104
NAV:    98.94077301495851
```

### 4.2 Four-level hierarchy

The replay covered paths such as:

```text
NET WORTH
  Net Investment
    Unstable Assets
      Broad Equity ETFs
```

Every parent value matched the sum of descendant leaf values. Every parent
unit balance matched independent external-flow replay.

### 4.3 Multiple same-day events

The fixture includes multiple deposits on the same date and deposit, buy and
tax sequences on the same date.

Result: passed.

The event ordering never produced negative cash.

### 4.4 Daily market-gap filling

The fixture contains continuous calendar-day NAV history, including weekends
and non-trading days with carried prices.

Result:

```text
NAV calendar gaps:       0
Duplicate NAV days:      0
NAV identity failures:   0
Parent-value failures:   0
```

### 4.5 Post-repair market refresh

After the historical correction, a later market refresh updated the latest NAV
documents while preserving the corrected parent units.

Result: passed.

This proves the corrected market-only `fill_MissingNAVs` behavior for the
current data.

## 5. Adversarial accounting tests

| Test | Result | Purpose |
| --- | --- | --- |
| Replay all 202 stored events | Pass | Full historical consistency |
| Reproduce every leaf unit | Pass | Validates price cutoff and event order |
| Reproduce every parent NAV | Pass | Validates independent parent units |
| Verify all 4,846 NAV identities | Pass | Confirms `value = nav x units` |
| Parent NAV differs from child NAV | Pass | Regression for the original defect |
| Partial withdrawal | Pass | Cancels proportional units |
| Full withdrawal | Pass | Resets value and units to zero |
| Tax | Pass | Reduces value without changing units |
| 99.9% market crash | Pass | Preserves units under extreme loss |
| Internal transfer | Pass | Common-parent units remain unchanged |
| Hierarchy cycle | Pass | Invalid hierarchy rejected |
| Duplicate price timestamp | Pass | Ambiguous price rejected |
| Negative cash sequence | Pass | Invalid transaction order rejected |
| Missing price required by later flow | Pass | Incomplete valuation rejected |
| 500,000 alternating flow calculations | Pass | Numeric drift and CPU stress |

### Execution measurements

```text
Load, replay and rebuild using the full fixture: approximately 420 ms
500,000 alternating deposit/withdraw calculations: approximately 26 ms
```

These are in-memory CPU measurements. They do not represent MongoDB network,
index, lock or transaction performance.

## 6. Experienced and discussed portfolio shocks

Current portfolio inputs:

| Exposure | Current value |
| --- | ---: |
| Indian equity ETFs | â‚¹5,62,432.11 |
| International ETFs | â‚¹1,44,614.22 |
| Gold ETF | â‚¹1,47,610.40 |
| Silver ETF | â‚¹46,813.76 |
| Debt ETF | â‚¹1,29,686.16 |
| Liquid mutual funds | â‚¹6,49,135.08 |
| Cash | â‚¹26.64 |
| Total | â‚¹16,80,318.37 |

Current corrected units remain constant in every market-only shock:

```text
16,983.07296882104 units
```

### Scenario A: combined approximation of reported bad daily moves

This combines moves discussed previously. It is not claimed to be one recorded
historical date.

```text
Indian equity:   -1.5%
International:   -4.0%
Gold:            -2.5%
Silver:          -7.0%
Debt and liquid:  0.0%
```

Result:

```text
Portfolio loss:  â‚¹21,188.27
Portfolio move:  -1.2610%
Resulting value: â‚¹16,59,130.09
Resulting NAV:   97.69316172
```

This is consistent with the previously reported typical daily swing range of
roughly â‚¹5,000 to â‚¹15,000, with worse multi-asset days exceeding that range.

### Scenario B: 16% broad equity correction

```text
Indian equity:  -16%
International:  -16%
Metals:           0%
Debt and liquid:  0%
```

Result:

```text
Portfolio loss:  â‚¹1,13,127.41
Portfolio move:  -6.7325%
Resulting value: â‚¹15,67,190.95
Resulting NAV:   92.27958673
```

The portfolio falls much less than equity because liquid funds, debt and metals
do not fall in this scenario.

### Scenario C: extreme metals crash

```text
Gold:   -30%
Silver: -45%
Everything else: 0%
```

Result:

```text
Portfolio loss:  â‚¹65,349.31
Portfolio move:  -3.8891%
Resulting value: â‚¹16,14,969.06
Resulting NAV:   95.09286445
```

Silver has a larger percentage fall, but gold creates the larger rupee loss
because the gold position is much larger.

### Scenario D: combined 2008-style crash

```text
Indian equity:  -50%
International:  -50%
Gold:            -30%
Silver:          -45%
Debt and liquid:   0%
```

Result:

```text
Portfolio loss:  â‚¹4,18,872.48
Portfolio move:  -24.9282%
Resulting value: â‚¹12,61,445.89
Resulting NAV:   74.27665729
```

### Scenario E: all risky assets fall 60%

```text
Indian equity:  -60%
International:  -60%
Gold:            -60%
Silver:          -60%
Debt and liquid:   0%
```

Result:

```text
Portfolio loss:  â‚¹5,40,882.29
Portfolio move:  -32.1893%
Resulting value: â‚¹11,39,436.07
Resulting NAV:   67.09245587
```

The fall is capped near 32% because debt, liquid funds and cash represent about
46.35% of the current value in this full NET WORTH dataset.

### Scenario F: liquid-price data error

This is a data-quality shock rather than an economic forecast.

```text
Liquid mutual funds: -2%
Debt ETF:             -5%
Everything else:       0%
```

Result:

```text
Portfolio loss:  â‚¹19,467.01
Portfolio move:  -1.1585%
Resulting value: â‚¹16,60,851.36
Resulting NAV:   97.79451346
```

This demonstrates why stale or incorrect liquid prices cannot be dismissed.
The affected capital is large even though daily volatility is normally low.

## 7. What the portfolio stress test proves

The NAV engine behaves correctly under market shocks:

```text
Units remain unchanged.
Value changes by the shocked asset values.
NAV changes as value / existing units.
```

The current NET WORTH dataset is protected by a large liquid and debt base, but
that conclusion applies to NET WORTH, not only the long-term investment group.
Using the same result to claim that the aggressive investment portfolio has low
drawdown would be false.

The main portfolio concentration risks are:

1. Indian equity ETFs: â‚¹5.62 lakh.
2. Gold and silver together: â‚¹1.94 lakh.
3. International ETFs: â‚¹1.45 lakh.
4. Axis Liquid Fund alone: more than â‚¹5.23 lakh using the stored valuation.

## 8. Known failures and untested areas

### 8.1 Backdated NAV write protection: fail

`update_GroupNAV` finds the latest row on or before the requested date but does
not reject a later existing row. A backdated write can corrupt all later NAVs.

### 8.2 Concurrent updates: fail by design

The current pattern is read, calculate in JavaScript, then write. Two concurrent
same-group events can read the same state and overwrite each other.

No real concurrent MongoDB writer test was executed.

### 8.3 Invalid first `job` event: fail

With `job === true`, a first `tax` or unsupported event can create a default
NAV row without applying the event.

### 8.4 Silent negative-value clamp: fail

Material negative value is converted to zero. That hides accounting corruption
instead of rejecting it.

### 8.5 Dividend event: unsupported

The current `update_GroupNAV` rejects dividend. The stored fixture also has no
dividend transaction, so this path is not historically validated.

### 8.6 Zero-NAV recapitalization: undefined

A complete loss can produce zero value with positive units and NAV zero. A
later deposit cannot use `amount / NAV`. The product needs an explicit policy:

- permanently close the group and open a new unit series; or
- perform a controlled unit reset with an auditable event.

Silently changing zero NAV to 100 is invalid.

### 8.7 Real sell and withdrawal history: not covered

The current fixture contains no sell or withdrawal. Synthetic formulas pass,
but FIFO realization, cash availability and withdrawal integration need real
database integration tests.

### 8.8 JavaScript `Number`: acceptable at current scale, not final

The current â‚¹16.8 lakh scale is safe for the tested calculations. Large values,
fractional mutual-fund units and repeated rounding eventually require a defined
precision policy, preferably Decimal128 or a decimal library.

## 9. Comparison with peers

| Capability | FolioScope now | Typical student MERN project | Production finance system |
| --- | --- | --- | --- |
| Authentication and CRUD | Implemented | Common | Baseline |
| Hierarchical portfolio groups | Implemented to four levels | Rare | Common |
| Cash-flow-neutral NAV units | Implemented and repaired | Extremely rare | Required |
| FIFO lots and tax classification | Implemented | Rare | Required |
| XIRR and benchmark comparison | Implemented | Uncommon | Required |
| Daily historical price processing | 104,342 rows tested | Usually absent | Millions of rows |
| Historical event replay | Implemented | Almost absent | Required |
| Dry-run migration with backup | Implemented | Almost absent | Required |
| Data-quality checks | Partial, known defects remain | Usually weak | Strict |
| Automated unit tests | Not integrated | Often absent | Mandatory |
| Integration tests | Not integrated | Usually absent | Mandatory |
| Concurrent-write safety | Incomplete | Usually ignored | Mandatory |
| Backdated-event controls | Incomplete in NAV updater | Usually ignored | Mandatory |
| Decimal precision policy | Undefined | Usually `Number` | Mandatory |
| Monitoring and audit logs | Partial | Minimal | Mandatory |

### Direct peer verdict

Against ordinary student MERN projects, FolioScope is in the top 5% to 10% for
domain difficulty and backend depth.

Against the strongest backend-focused fresher projects, it is currently closer
to the top 15% to 20%. The gap is automated testing, concurrency correctness,
precision rules and operational monitoring.

Calling FolioScope production-grade would be false. It has production-like
domain modeling, but it does not yet have production-grade failure handling.

## 10. Engineering score

| Area | Score | Reason |
| --- | ---: | --- |
| Domain modeling | 9/10 | Hierarchy, FIFO, NAV, XIRR and cash flows |
| Accounting correctness | 8/10 | Tested math is correct; unsupported paths remain |
| Historical repairability | 9/10 | Replay, dry-run, backup and restore exist |
| Current-scale performance | 8/10 | Full fixture replayed in under half a second in memory |
| Data quality | 6/10 | OHLC, stale price and metadata defects remain |
| Automated testing | 3/10 | Stress tests exist outside the normal test suite |
| Concurrency safety | 4/10 | Read-calculate-write race remains |
| Production readiness | 5/10 | Core logic is advanced; operational guarantees are incomplete |

## 11. Required work before deployment

### Priority 0

1. Reject backdated NAV events inside `update_GroupNAV`.
2. Require a session for every unit-changing or value-changing event.
3. Prevent concurrent same-group updates using locking or optimistic versioning.
4. Remove the `job` first-entry hole.
5. Throw on material negative value instead of setting it to zero.
6. Define dividend behavior exactly once.

### Priority 1

1. Convert the 15 algorithmic stress tests into Jest tests.
2. Add MongoDB integration tests using a replica-set test environment.
3. Test real sell, withdrawal, dividend and tax sequences.
4. Add an internal-transfer transaction type.
5. Establish Decimal128 or decimal-library precision and rounding rules.
6. Clean the known price-history defects.

### Priority 2

1. Run 10, 50 and 100 concurrent writer tests against the same group.
2. Add CI that blocks deployment on accounting-test failure.
3. Add structured logs for every NAV unit change.
4. Add a reconciliation job that verifies leaf and parent invariants daily.

## 12. Final verdict

The corrected NAV mathematics survived the actual 202-event history, a
four-level hierarchy, different group starting NAVs, same-day events, extreme
market shocks, invalid-data rejection and 500,000 alternating flow operations.

The algorithm is strong relative to peers.

The service boundary around the algorithm is still weak. Until concurrency,
backdated events, dividends, precision and automated integration tests are
fixed, the system is reliable for controlled personal use but not for multiple
users or unattended production writes.
