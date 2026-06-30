# FolioScope API Reference

This API reference is based on the latest inspected FolioScope codebase.

Backend app entry:

```txt
server/app.js
```

Server entry:

```txt
server/server.js
```

Main route mounts:

```js
app.use("/", userRoute);
app.use("/", publicRoute);
app.use("/price", priceRangeRoute);
app.use("/analytic", analyticsRoute);
app.use("/admin/dataseeders", adminRoute);
app.use("/portfolio", portfolioRoute);
```

Test routes are available only when the app is created with:

```js
createApp({ enableTestRoutes: true })
```

They are not exposed by default.

---

## Base URL

Default local backend:

```txt
http://localhost:3000
```

---

## Standard Response Shape

Most successful responses follow:

```json
{
  "success": true,
  "message": "Action message",
  "data": {}
}
```

Most error responses through the central error middleware follow:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message"
}
```

Some older controllers still return direct `{ error: "..." }` shapes. Standardization is still pending.

---

## Authentication

Protected routes require:

```http
Authorization: Bearer <accessToken>
```

Refresh-token flow uses cookies.

---

# User / Auth Routes

Mounted at root `/`.

## GET `/userdetails`

Protected.

Returns authenticated user details.

Response:

```json
{
  "success": true,
  "data": {}
}
```

---

## POST `/signup`

Registers a new user.

Validation middleware:

```txt
validate_RegisterData
```

Body usually includes user registration fields such as name/email/password.

---

## POST `/sendverificationemail`

Sends verification email.

Validation middleware:

```txt
validate_email
```

---

## POST `/verifyemail`

Verifies email token.

Middleware:

```txt
verifyEmailTokenCheck
```

---

## POST `/login`

Logs in user.

Validation middleware:

```txt
validate_loginDATA
```

Expected result includes access-token/session handling.

---

## POST `/refreshtoken`

Rotates access token using refresh token.

Middleware:

```txt
verifyRefreshToken
```

---

## POST `/forgotpassword`

Starts password reset flow.

Validation middleware:

```txt
validate_email
```

---

## POST `/verifyotp/:email`

Verifies OTP for password reset.

Middleware:

```txt
validate_otp
validateParamsEmail("email")
```

---

## POST `/confirmpassword/:email`

Confirms new password.

Middleware:

```txt
validate_ChangePasswordDATA
validateParamsEmail("email")
```

---

## POST `/logoutuser`

Protected.

Logs out the current session.

---

## POST `/logoutalluser`

Protected.

Logs out all sessions for the user.

---

# Public Data Routes

Mounted at root `/`.

## GET `/allsecuritieslist`

Returns public securities grouped by asset class and tradable list.

Response includes:

```json
{
  "success": true,
  "message": "All Securities List",
  "data": {
    "INDEX": {},
    "ETF": {},
    "MUTUAL FUND": {},
    "BOND": {},
    "TRADABLE SECURITIES": {}
  }
}
```

---

## GET `/defaultmetadata`

Returns default asset metadata.

---

## GET `/top/securities`

Returns today's top securities data.

---

## GET `/security/:securityId`

Returns public security overview.

Params:

| Param | Description |
|---|---|
| `securityId` | Asset/security metadata id |

---

# Price Range Routes

Mounted at `/price`.

## GET `/price/security/:securityId`

Returns security price range.

Query:

| Query | Allowed |
|---|---|
| `range` | `W`, `M`, `Y`, `3Y`, `MAX` |

If `range` is omitted, returns 1D data.

---

## GET `/price/group/:groupId`

Protected.

Returns group/NAV price range.

Query:

| Query | Allowed |
|---|---|
| `range` | `W`, `M`, `Y`, `3Y`, `MAX` |

If `range` is omitted, returns 1D data.

---

# Analytics Routes

Mounted at `/analytic`.

## GET `/analytic/drawdown/security/:securityId`

Public.

Returns drawdown analysis for a security.

---

## GET `/analytic/drawdown/group/:groupId`

Protected.

Returns drawdown analysis for a portfolio group using NAV.

---

## POST `/analytic/xirr/group/:groupId`

Protected.

Computes or returns cached group XIRR.

Behavior:

- validates group ownership
- recomputes if cached value is older than one day
- stores result in group snapshot cache

Response:

```json
{
  "success": true,
  "message": "Group Xirr Analysis",
  "data": 12.34
}
```

---

## GET `/analytic/comparision/xirr/:groupId/:indexId`

Protected.

Compares group XIRR against an index/benchmark.

Params:

| Param | Description |
|---|---|
| `groupId` | Portfolio group id |
| `indexId` | Benchmark/security id |

---

## GET `/analytic/comparision/nav/:groupId/:indexId`

Protected.

Compares group NAV performance against a benchmark NAV/price series.

Params:

| Param | Description |
|---|---|
| `groupId` | Portfolio group id |
| `indexId` | Benchmark/security id |

---

# Portfolio Routes

Mounted at `/portfolio`.

## POST `/portfolio/holdings`

Protected.

Fetches user holdings for a selected group.

Body:

```json
{
  "groupId": "portfolioGroupId"
}
```

Response data includes holdings aggregation:

```txt
selected group
leaf group IDs
active financial assets
latest and previous LTP
current value
invested value
average price
one-day gain
profit/loss
expense ratio
bucket cost
total stats
holdings list
```

---

## POST `/portfolio/rebalancer/new`

Protected.

Creates a new portfolio rebalancer.

Middleware:

```txt
validate_CreatePortfolioRebalancerData
validate_NewRebalancer_ReqData
```

Body includes:

```json
{
  "portfolioGroupId": "root/group id",
  "rebalancerName": "Main Portfolio Rebalancer",
  "rebalancerDescription": "Rules for SIP and market fall deployment",
  "sipAmount": 11000,
  "assets": [
    {
      "assetId": "asset metadata id",
      "assetName": "SETFNIF50",
      "groupId": "portfolio group id",
      "groupName": "Large Cap",
      "targetWeight": 18,
      "band": 2,
      "multiplier": 1,
      "isCashReserve": false
    }
  ],
  "marketFallRules": [
    {
      "fallPercentage": 10,
      "deployPercentage": 20,
      "shotNumber": 0,
      "isLocked": false,
      "isTriggered": false,
      "assets": [
        {
          "assetId": "asset metadata id",
          "assetName": "SETFNIF50",
          "multiplier": 1,
          "min": 0.15
        }
      ]
    }
  ]
}
```

Important validation:

- user is injected from access token
- total target weight validation
- active rebalancer group duplication validation
- asset/group validation

Response:

```json
{
  "success": true,
  "message": "Rebalancer Created",
  "data": {}
}
```

---

## GET `/portfolio/rebalancer/list`

Protected.

Fetches all user's rebalancers.

Response includes:

```txt
rebalancerName
rebalancerDescription
portfolioGroupId
sipAmount
assets
marketFallRules
isActive
createdAt
updatedAt
```

---

## GET `/portfolio/rebalancer/:rebalancerId`

Protected.

Fetches computed rebalancer detail.

Computation includes:

```txt
current allocation
target allocation
drift percentage
drift amount
status
SIP score
lumpsum score
SIP/lumpsum amount distribution
market-fall deployment rule stats
benchmark fall
asset fall
deployment score
deployment amount
```

Response data shape:

```json
{
  "success": true,
  "message": "Rebalancer Fetched",
  "data": {
    "groupId": "portfolioGroupId",
    "rebalancerName": "Main Rebalancer",
    "rebalancerDescription": "...",
    "summary": {
      "sipAmount": 11000,
      "investmentValue": 0,
      "currentValue": 0,
      "price": {
        "price": 0,
        "today": 0
      }
    },
    "groupLevelData": [],
    "assetLevelData": [],
    "marketFallRulesStats": []
  }
}
```

---

## GET `/portfolio/:pg_id`

Protected.

Returns portfolio group metadata and dashboard snapshot.

Response data includes:

```txt
group identity
level
consolidated snapshot
current investment
net worth range
current-year gain data
lifetime gain data
```

---

## POST `/portfolio/:pg_id`

Protected.

Creates a child portfolio group under `pg_id`.

Body:

```json
{
  "name": "Group name",
  "description": "Group description"
}
```

Rules:

- parent must exist
- parent must belong to user
- cannot create child under group that already has financial assets
- max level/depth enforced
- duplicate group names are rejected

---

## PATCH `/portfolio/:pg_id`

Protected.

Updates group name/description.

Body:

```json
{
  "name": "Updated name",
  "description": "Updated description"
}
```

---

## DELETE `/portfolio/:pg_id`

Protected.

Soft-deletes a portfolio group and descendants.

Current caution:

```txt
Frontend DeleteGroupForm is still placeholder.
Use carefully until archive/delete product rules are finalized.
```

---

## POST `/portfolio/:pg_id/grouptransaction`

Protected.

Creates group-level cash transaction.

Validation:

```txt
validate_GroupStatementData
```

Body:

```json
{
  "type": "deposit",
  "date": "2026-06-29T10:30:00.000Z",
  "amount": 10000
}
```

Supported conceptual types include:

```txt
deposit
withdrawal
tax
```

Behavior:

- validates leaf group
- checks funds for withdrawal/tax
- rejects backdated/same timestamp transaction
- fills missing NAVs
- creates group statement
- updates cash/current value
- updates group NAV
- syncs future NAVs

---

## POST `/portfolio/:pg_id/trade/:a_id`

Protected.

Executes trade for a portfolio group and asset/security.

Validation:

```txt
validate_tradeData
```

Params:

| Param | Description |
|---|---|
| `pg_id` | Portfolio group id |
| `a_id` | Asset/security metadata id |

Behavior:

- executes trade transaction
- fills past NAV gaps
- updates FIFO/asset/cash/ledger
- syncs future NAVs
- syncs portfolio snapshot

Successful response:

```json
{
  "success": true,
  "message": "Trade, Sync & NAV Update Completed Successfully"
}
```

---

# Admin Seeder Routes

Mounted at `/admin/dataseeders`.

All protected.

## POST `/admin/dataseeders/seedclassification`

Seeds/updates classification data.

## POST `/admin/dataseeders/seedassetmetadata`

Seeds/updates asset metadata.

## POST `/admin/dataseeders/seedpricehistory`

Seeds/inserts price history.

---

# Test Routes

Mounted only when app is created with:

```js
createApp({ enableTestRoutes: true })
```

## GET `/test/cleardatabase`

Dangerous local-only test helper.

Do not expose in production.

## GET `/test/:g_id`

Test helper for group debug.

---

# Current API Gaps / Cleanup

## Pending standardization

- Some older controllers return `{ error: "..." }` instead of central `{ success:false, statusCode, message }`.
- Some response messages use old spelling like `Comparision`.
- Some routes use `comparision` spelling in URLs; keep for backward compatibility unless refactoring frontend too.
- Custom benchmark selection is pending in Rebalancer and comparison flows.
- Delete/archive frontend rules are pending.
- Backup/export API is not implemented yet.
- Rental Income API is planned separately in a future Next.js + TypeScript app.

---

# Testing Status

Latest backend test result:

```txt
Test Suites: 51 passed, 51 total
Tests: 343 passed, 343 total
```

Recommended next API testing priorities:

```txt
1. Trade → NAV → Holdings integration
2. Deposit/withdrawal NAV correctness
3. Rebalancer real holdings cases
4. Backup/export once implemented
5. Auth full lifecycle
6. Frontend E2E with Playwright later
```
