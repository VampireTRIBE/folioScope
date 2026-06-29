# FolioScope — Priority Roadmap

This priority roadmap is based on the latest actual code assessment.

## Current Situation

| Area | Status |
|---|---:|
| Portfolio analytics prototype | ~98.5% complete |
| Full personal vision | ~89% complete |
| Production readiness | ~75% |
| Backend tests | 50 suites / 337 passing |
| Client build | Passing |
| Server audit | 0 vulnerabilities |
| Client audit | 7 vulnerabilities |
| Client lint | Failing with 59 problems |

Main principle:

```text
Do not add random features.
Prioritize what improves money-decision accuracy, data safety, reliability, and long-term maintainability.
```

---

# Priority 1 — Verify Rebalancer Against Google Sheet

Rebalancer is now a real decision engine. Before trusting it, compare it with your Google Sheet.

## Tasks

- [ ] Select 5-10 real portfolio cases from Google Sheet.
- [ ] Run same cases in FolioScope.
- [ ] Compare current weight.
- [ ] Compare target weight.
- [ ] Compare drift percentage.
- [ ] Compare drift amount.
- [ ] Compare SIP score.
- [ ] Compare lumpsum score.
- [ ] Compare SIP allocation amount.
- [ ] Compare lumpsum allocation amount.
- [ ] Compare market-fall deployment amount.
- [ ] Document expected vs actual differences.

## Why this is priority 1

```text
Rebalancer directly affects future buy/deployment decisions.
Wrong output can affect real money decisions.
```

---

# Priority 2 — Rebalancer Cleanup

## Tasks

- [ ] Rename `totalTeirscore` to `totalTierScore`.
- [ ] Add direct test for `get_RebalancerListByUserId` active-only behavior.
- [ ] Confirm inactive rebalancers do not block new rebalancer creation.
- [ ] Confirm same group cannot be used in two active rebalancers.
- [ ] Decide whether NIFTY 50 remains default benchmark or becomes configurable.
- [ ] Add more edge-case tests for market-fall tiers.
- [ ] Add tests for missing benchmark and asset prices.

## Why this matters

```text
Rebalancer is now one of FolioScope's most valuable decision modules.
It should be clean, verified, and protected.
```

---

# Priority 3 — Trade → NAV → Holdings Integration Tests

This is the most important full-chain test area.

## Full chain to protect

```text
Trade action
→ cash update
→ FIFO update
→ NAV gap fill
→ future NAV update
→ holdings update
→ analytics impact
```

## Buy trade tests

- [ ] Buy trade creates/updates financial asset.
- [ ] Buy trade reduces cash.
- [ ] Buy trade creates FIFO lot.
- [ ] Buy trade fills missing NAV dates.
- [ ] Buy trade updates future NAV records.
- [ ] Holdings after buy show correct quantity.
- [ ] Holdings after buy show correct invested value.
- [ ] Holdings after buy show correct current value.

## Sell trade tests

- [ ] Sell trade reduces quantity.
- [ ] Sell trade updates FIFO lots correctly.
- [ ] Sell trade calculates realized gain.
- [ ] Sell trade increases cash.
- [ ] Sell quantity greater than holding is rejected.
- [ ] Future NAV updates after sell.
- [ ] Holdings after sell match expected values.

## Dividend tests

- [ ] Dividend increases cash.
- [ ] Dividend is included in cashflows.
- [ ] Dividend affects XIRR correctly.
- [ ] Dividend does not incorrectly change asset quantity.

## Why this matters

```text
Trade execution is the heart of FolioScope.
If this chain is reliable, the whole system becomes much more trustworthy.
```

---

# Priority 4 — Deposit / Withdrawal NAV Correctness Tests

NAV was created to solve Google Sheet distortion from deposits and withdrawals.

## Tasks

- [ ] Deposit does not falsely increase NAV return.
- [ ] Withdrawal does not falsely reduce NAV return.
- [ ] NAV units adjust correctly after deposit.
- [ ] NAV units adjust correctly after withdrawal.
- [ ] Daily return remains cashflow-adjusted.
- [ ] Drawdown is not distorted by deposit.
- [ ] Drawdown is not distorted by withdrawal.
- [ ] Portfolio value movement is separated from portfolio performance.

## Why this matters

```text
This protects the main reason you replaced Google Sheet with FolioScope.
```

---

# Priority 5 — Holdings Read Model Tests

## Tasks

- [ ] NET WORTH group returns all leaf assets.
- [ ] Specific group returns only its leaf assets.
- [ ] Sold-out/inactive assets are handled correctly.
- [ ] Latest LTP is picked correctly.
- [ ] Previous LTP is picked correctly.
- [ ] One-day gain is calculated correctly.
- [ ] Invested value is calculated correctly.
- [ ] Current value is calculated correctly.
- [ ] Unrealized P/L is calculated correctly.
- [ ] Expense ratio cost is calculated correctly.
- [ ] Bucket cost is calculated correctly.

## Why this matters

```text
Holdings powers portfolio visibility and feeds Rebalancer decisions.
```

---

# Priority 6 — Supertest API Route Tests

After helper and integration tests, test real HTTP route behavior.

## Portfolio routes

- [ ] `POST /portfolio/trade`
- [ ] `POST /portfolio/holdings`
- [ ] `POST /portfolio/rebalancer/new`
- [ ] `GET /portfolio/rebalancer/list`
- [ ] `GET /portfolio/rebalancer/:id`

## Analytics routes

- [ ] XIRR endpoint.
- [ ] NAV comparison endpoint.
- [ ] XIRR comparison endpoint.
- [ ] Drawdown endpoint.

## Auth routes

- [ ] Register user.
- [ ] Login user.
- [ ] Refresh token.
- [ ] Logout current session.
- [ ] Logout all sessions.
- [ ] Protected route with valid token.
- [ ] Protected route without token is rejected.
- [ ] Protected route with invalid token is rejected.

---

# Priority 7 — Fix Frontend Lint Problems

Client build passes, but lint fails.

## Main categories to clean

- [ ] Remove unused variables.
- [ ] Remove unused imports.
- [ ] Fix empty blocks.
- [ ] Fix missing React hook dependencies.
- [ ] Fix `setState` inside effect warnings where needed.
- [ ] Fix manual memoization dependency issues.
- [ ] Fix React fast-refresh warnings.

## Why this matters

```text
Lint cleanliness improves maintainability and professional polish.
```

---

# Priority 8 — Fix Client Dependency Vulnerabilities

Client currently has 7 vulnerabilities.

## Tasks

- [ ] Run `npm audit`.
- [ ] Run safe `npm audit fix`.
- [ ] Manually update packages if needed.
- [ ] Re-run client build.
- [ ] Re-run lint.
- [ ] Confirm app behavior still works.

## Why this matters

```text
Before private deployment, security/dependency risk should be reduced.
```

---

# Priority 9 — Backup / Export

Backup/export is critical for a personal finance system.

## Export areas

- [ ] Portfolio groups.
- [ ] Financial assets.
- [ ] Trades.
- [ ] FIFO lots.
- [ ] NAV history.
- [ ] Group statements.
- [ ] Rebalancers.
- [ ] User settings/config.

## Restore/check areas

- [ ] Backup file validation.
- [ ] Restore/import dry run.
- [ ] Check exported collection counts.
- [ ] Ensure secrets/tokens are not exported.
- [ ] Add backup/export tests.

## Why this matters

```text
If FolioScope manages your own money records, data recovery is not optional.
```

---

# Priority 10 — Deployment Checklist

## Tasks

- [ ] Create `.env.example`.
- [ ] Add required environment variable list.
- [ ] Ensure `/test` routes stay disabled in production.
- [ ] Add production startup checklist.
- [ ] Add MongoDB backup plan.
- [ ] Add logging plan.
- [ ] Add monitoring/error tracking later.
- [ ] Review startup sync jobs.
- [ ] Confirm server/client builds pass before deployment.

---

# Priority 11 — Custom Benchmark Selection

## Tasks

- [ ] Allow user to choose benchmark.
- [ ] Store benchmark in Rebalancer config.
- [ ] Use selected benchmark in market-fall deployment.
- [ ] Use selected benchmark in comparison analysis.
- [ ] Add tests for benchmark selection.
- [ ] Keep NIFTY 50 as default if no benchmark is selected.

---

# Priority 12 — Frontend Tests

Backend correctness is more important now, but frontend tests should come later.

## Recommended tool

```text
Playwright for end-to-end user flow tests.
```

## Test flows

- [ ] Login page works.
- [ ] Dashboard loads.
- [ ] Holdings page loads.
- [ ] Holdings filter works.
- [ ] Trade form validation works.
- [ ] Rebalancer create form validation works.
- [ ] Rebalancer detail renders computed result.
- [ ] Logout redirects correctly.

---

# Priority 13 — Rental Income Module

Build this after FolioScope core is stable.

## Planned architecture

```text
Same MongoDB database.
Separate Next.js + TypeScript app.
Loose integration with FolioScope through summary APIs.
```

## Initial tasks

- [ ] Create Next.js + TypeScript project.
- [ ] Property model.
- [ ] Tenant model.
- [ ] Lease/agreement model.
- [ ] Rent payment model.
- [ ] Maintenance expense model.
- [ ] Monthly rental summary.
- [ ] Rental summary API.
- [ ] FolioScope net worth/income integration.

---

# Recommended Practical Order

```text
1. Rebalancer Google Sheet verification.
2. Rebalancer cleanup and direct tests.
3. Trade → NAV → Holdings integration tests.
4. Deposit/withdrawal NAV correctness tests.
5. Holdings read model tests.
6. Supertest API route tests.
7. Fix frontend lint.
8. Fix client dependency vulnerabilities.
9. Add backup/export.
10. Add deployment checklist.
11. Add custom benchmark selection.
12. Add frontend Playwright tests.
13. Start Rental Income as separate Next.js + TypeScript app.
```

---

# Final Priority Principle

```text
Priority should follow decision risk.

If a bug can distort portfolio return, allocation, NAV, holdings, XIRR, Rebalancer suggestion, or backup safety,
test and fix it before adding new features.
```
