# FolioScope Testing Priority Roadmap

This roadmap is based on the latest FolioScope assessment and is focused on making the system reliable for personal money management.

## Current Testing Status

| Area | Status |
|---|---|
| Backend Jest tests | Started strongly |
| Current backend tests | 50 suites / 337 tests passing |
| Manual testing | Strong for most modules |
| Rebalancer manual verification | Still important |
| Frontend automated tests | Not started |
| Full DB integration tests | Pending |
| Backup/export tests | Pending |

Current label:

```text
Backend financial-core Jest protected V1.
Still needs real DB integration, backup/restore, Google Sheet parity, and frontend E2E testing.
```

## Completed in this automated backend pass

- Rebalancer active-only group lookup, duplicate active group blocking, inactive rebalancer allowance, zero-score safety, missing price safety, cash reserve deployment exclusion, locked tier behavior, and deployment amount bounds.
- Trade execution scenarios for buy, sell, dividend, insufficient cash, insufficient sell quantity, FIFO lot updates, realized gain, cash movement, and dividend quantity safety.
- Holdings read model math for latest/previous LTP, one-day gain, invested value, current value, unrealized P/L, expense ratio, bucket cost, and group summary stats.
- Deposit/withdrawal controller and NAV helper coverage through group statement transaction and NAV update unit tests.
- XIRR, drawdown, NAV comparison, rolling comparison, price analytics, and route-level analytics coverage.
- Critical HTTP route coverage for portfolio, rebalancer, trade, analytics, auth/session, password reset, and protected-route access behavior.
- Model/schema validation coverage for portfolio rebalancer, NAV system, portfolio Joi schemas, ObjectId/date validators, and core middleware.

## Still outside this pass

- Google Sheet parity for 5-10 real rebalancer cases should be checked with real exported numbers.
- Real MongoDB integration tests are still pending.
- Backup/export and restore/import features/tests are still pending.
- Frontend Playwright tests are still pending.

---

# Priority 1 — Rebalancer Final Verification

Rebalancer is now one of the most important decision-making modules. It should be verified before moving to new modules.

## Test goals

- Confirm FolioScope output matches your Google Sheet.
- Confirm active rebalancer validation works.
- Confirm duplicate group usage is blocked.
- Confirm inactive rebalancers do not block new rebalancers.
- Confirm no `NaN` values in zero-score cases.
- Confirm market-fall deployment rules work correctly.

## Test cases

- [ ] `get_RebalancerListByUserId` returns only active rebalancers.
- [ ] Same group cannot be used in two active rebalancers.
- [ ] Inactive rebalancer does not block new rebalancer.
- [ ] Zero SIP score returns `0`, not `NaN`.
- [ ] Zero lumpsum score returns `0`, not `NaN`.
- [ ] Missing benchmark price is handled safely.
- [ ] Missing asset price is handled safely.
- [ ] Cash reserve is excluded from deployment.
- [ ] Market fall tier locks/unlocks correctly.
- [ ] Deployment amount total does not exceed available amount.
- [ ] FolioScope rebalancer output matches Google Sheet for 5-10 real cases.

---

# Priority 2 — Trade → NAV → Holdings Integration

This is the heart of FolioScope. A trade affects many downstream calculations.

## Test goals

Verify the full chain:

```text
buy/sell/dividend
→ cash update
→ FIFO lot update
→ NAV gap fill
→ future NAV update
→ holdings update
→ analytics impact
```

## Buy trade tests

- [ ] Buy trade creates or updates financial asset.
- [ ] Buy trade reduces available cash.
- [ ] Buy trade creates FIFO lot.
- [ ] Buy trade fills missing NAV dates.
- [ ] Buy trade updates future NAV records.
- [ ] Holdings after buy show correct quantity.
- [ ] Holdings after buy show correct invested value.
- [ ] Holdings after buy show correct current value.

## Sell trade tests

- [ ] Sell trade reduces holding quantity.
- [ ] Sell trade updates FIFO lots correctly.
- [ ] Sell trade calculates realized gain correctly.
- [ ] Sell trade increases cash.
- [ ] Sell quantity greater than available quantity is rejected.
- [ ] Future NAV updates after sell.
- [ ] Holdings after sell match expected values.

## Dividend tests

- [ ] Dividend transaction increases cash.
- [ ] Dividend is included in cashflows.
- [ ] Dividend affects XIRR correctly.
- [ ] Dividend does not incorrectly change asset quantity.

---

# Priority 3 — Deposit / Withdrawal NAV Correctness

This is important because FolioScope replaced Google Sheet tracking to avoid distorted returns from deposits and withdrawals.

## Test goals

NAV should measure real portfolio performance, not cashflow movement.

## Test cases

- [ ] Deposit does not falsely increase NAV return.
- [ ] Withdrawal does not falsely reduce NAV return.
- [ ] NAV units adjust correctly after deposit.
- [ ] NAV units adjust correctly after withdrawal.
- [ ] Daily return remains cashflow-adjusted.
- [ ] Drawdown is not distorted by deposit.
- [ ] Drawdown is not distorted by withdrawal.
- [ ] Portfolio value changes are separated from portfolio performance.

---

# Priority 4 — XIRR / Comparison / Drawdown Scenario Tests

You already have tests here, but add more real-world scenarios.

## XIRR tests

- [ ] Multiple deposits and withdrawals.
- [ ] Buy/sell/dividend sequence.
- [ ] Zero-current-value case.
- [ ] Negative-return case.
- [ ] Irregular cashflow dates.
- [ ] Cashflow order does not break calculation.

## Comparison tests

- [ ] Benchmark comparison over same dates.
- [ ] Missing benchmark dates are handled.
- [ ] Group and benchmark date ranges align correctly.
- [ ] Excess return is calculated correctly.
- [ ] Excess drawdown is calculated correctly.

## Drawdown tests

- [ ] Large fall creates correct max drawdown.
- [ ] Recovery after fall is handled correctly.
- [ ] Flat NAV returns zero drawdown.
- [ ] Missing data does not crash calculation.

---

# Priority 5 — Holdings Read Model Tests

Holdings is important because it powers portfolio visibility and later Rebalancer decisions.

## Test cases

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

---

# Priority 6 — API Route Tests with Supertest

After calculation and integration helpers, test actual HTTP routes like the frontend uses.

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

## User/auth routes

- [ ] Register user.
- [ ] Login user.
- [ ] Refresh token.
- [ ] Logout current session.
- [ ] Logout all sessions.
- [ ] Access protected route with valid token.
- [ ] Reject protected route without token.
- [ ] Reject protected route with invalid/expired token.

---

# Priority 7 — Auth / Session Lifecycle Tests

Auth is already strong, but full lifecycle testing will protect it long-term.

## Test cases

- [ ] Register user.
- [ ] Verify email.
- [ ] Login user.
- [ ] Access protected route.
- [ ] Rotate access token using refresh token.
- [ ] Logout current session.
- [ ] Logout all sessions.
- [ ] Invalid refresh token is rejected.
- [ ] Expired token is rejected.
- [ ] Password reset flow works.
- [ ] Unverified user cannot access restricted flow where applicable.

---

# Priority 8 — Backup / Export Tests

For personal finance, backup/export is not optional long-term.

## Test goals

Make sure you can recover your data if something breaks.

## Test cases

- [ ] Export users' portfolio data.
- [ ] Export portfolio groups.
- [ ] Export financial assets.
- [ ] Export trades.
- [ ] Export FIFO lots.
- [ ] Export NAV history.
- [ ] Export group statements.
- [ ] Export rebalancers.
- [ ] Export file includes expected collections.
- [ ] Exported data can be validated.
- [ ] Restore/import dry run works.
- [ ] Backup does not expose secrets/tokens.

---

# Priority 9 — Frontend Tests

Frontend tests are lower priority than backend financial correctness, but should be added later.

## Recommended tool

Use Playwright later for end-to-end user flow tests.

## Test cases

- [ ] Login page works.
- [ ] Dashboard loads after login.
- [ ] Holdings page loads.
- [ ] Holdings filter works.
- [ ] Trade form validation works.
- [ ] Rebalancer create form validation works.
- [ ] Rebalancer detail renders computed result.
- [ ] Navigation routes work.
- [ ] Auth redirect works after logout.

---

# Priority 10 — Model / Schema Tests

These are lower priority but useful for long-term safety.

## Test cases

- [ ] PortfolioRebalancer schema rejects invalid target weights.
- [ ] PortfolioRebalancer schema requires required fields.
- [ ] User schema requires email/password.
- [ ] NAV schema stores required NAV fields.
- [ ] AssetPriceHistory schema handles date/price fields.
- [ ] Financial asset schema handles active/sold-out state.
- [ ] Validation rejects invalid ObjectIds.
- [ ] Validation rejects invalid dates.

---

# Practical Execution Order

Use this order in real work:

```text
1. Finish Rebalancer manual verification against Google Sheet.
2. Add tests for Rebalancer active-only validation and duplicate group protection.
3. Add Rebalancer edge-case tests.
4. Add trade → NAV → holdings integration tests.
5. Add deposit/withdrawal NAV correctness tests.
6. Add Supertest API tests for key portfolio routes.
7. Add backup/export feature.
8. Add backup/export tests.
9. Fix client dependency vulnerabilities before deployment.
10. Add frontend Playwright tests later.
```

---

# Current Testing Maturity Target

## Current level

```text
Manual testing: strong
Backend Jest: good early stage
Integration testing: still needs work
Frontend testing: not started
```

## Target before private deployment

```text
Rebalancer verified
Trade/NAV/Holdings integration tested
Backup/export available
Critical API routes tested
Client vulnerabilities fixed
```

## Target before public/commercial use

```text
Full integration tests
Frontend E2E tests
CI/CD test pipeline
Monitoring/logging
Audit trail
Backup/restore tested
Security review
```

---

# Final Testing Principle

Do not test every file just because it exists.

Test every behavior that can affect financial decision accuracy.

Highest-value behaviors:

```text
Rebalancer correctness
Trade execution correctness
NAV cashflow separation
Holdings accuracy
XIRR/comparison correctness
Backup and recovery
```
