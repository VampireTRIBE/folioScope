# FolioScope API Reference

This API reference reflects the latest inspected codebase of FolioScope.

Backend entry point:

```txt
server/server.js
```

Main backend route mounts:

```js
app.use("/", userRoute);
app.use("/", publicRoute);
app.use("/price", priceRangeRoute);
app.use("/analytic", analyticsRoute);
app.use("/admin/dataseeders", adminRoute);
app.use("/portfolio", portfolioRoute);
```

The test route exists in the codebase but is currently commented out in `server/server.js`:

```js
// app.use("/test", testRoutes);
```

Keep it disabled outside controlled local development.

---

## Base URLs

| Layer | Default |
|---|---|
| Backend | `http://localhost:3000` |
| Frontend Vite | `http://localhost:5173` |
| Frontend Axios `BASE_URL` | `http://<window.location.hostname>:3000` |
| Frontend Axios with credentials | `http://<window.location.hostname>:3000` |

---

## Authentication

Protected routes require:

```http
Authorization: Bearer <accessToken>
```

Refresh-token based routes use cookies:

| Cookie | Purpose |
|---|---|
| `refreshToken` | Refresh-token rotation |
| `sessionId` | Session document lookup |

Common protected backend middleware:

```js
verifyAccessToken
```

---

# User/Auth Routes

Mounted at root `/`.

## `GET /userdetails`

Protected.

Returns authenticated user details.

Frontend use:

- Auth bootstrap/user detail loading.

---

## `POST /signup`

Registers a new user.

Validation:

- `validate_RegisterData`

---

## `POST /sendverificationemail`

Sends verification email.

Validation:

- `validate_email`

---

## `POST /verifyemail`

Verifies email using email verification token.

Middleware:

- `verifyEmailTokenCheck`

Also sets session cookies and returns access token.

---

## `POST /login`

Logs in a user.

Validation:

- `validate_loginDATA`

Returns:

- access token
- user/session data

Sets:

- `refreshToken`
- `sessionId`

---

## `POST /refreshtoken`

Rotates refresh token and returns a new access token.

Middleware:

- `verifyRefreshToken`

Used by frontend auth restoration.

---

## `POST /forgotpassword`

Starts password reset flow.

Validation:

- `validate_email`

---

## `POST /verifyotp/:email`

Verifies OTP for password reset.

Validation:

- `validate_otp`
- `validateParamsEmail("email")`

---

## `POST /confirmpassword/:email`

Confirms new password after OTP verification.

Validation:

- `validate_ChangePasswordDATA`
- `validateParamsEmail("email")`

---

## `POST /logoutuser`

Protected.

Logs out current session.

---

## `POST /logoutalluser`

Protected.

Logs out all user sessions.

---

# Public Data Routes

Mounted at root `/`.

## `GET /allsecuritieslist`

Returns grouped/listed public securities metadata.

Used by:

- Mobile search bar
- Trade form
- Comparison analysis
- Rebalancer asset search
- `usePublicSecurities`
- SessionStorage cache

---

## `GET /defaultmetadata`

Returns default public metadata.

---

## `GET /top/securities`

Returns today's top securities / market discovery data.

---

## `GET /security/:securityId`

Returns overview for a security.

---

# Price Routes

Mounted at `/price`.

## `GET /price/security/:securityId`

Public.

Returns price range/history data for a security.

---

## `GET /price/group/:groupId`

Protected.

Returns group NAV/price range data.

Middleware:

- `validateID("groupId")`
- `verifyAccessToken`

---

# Analytics Routes

Mounted at `/analytic`.

## `GET /analytic/drawdown/security/:securityId`

Public.

Returns drawdown analytics for a security.

Middleware:

- `validateID("securityId")`

---

## `GET /analytic/drawdown/group/:groupId`

Protected.

Returns group drawdown analytics.

Middleware:

- `validateID("groupId")`
- `verifyAccessToken`

---

## `POST /analytic/xirr/group/:groupId`

Protected.

Computes XIRR for a portfolio group.

Middleware:

- `validateID("groupId")`
- `verifyAccessToken`

---

## `GET /analytic/comparision/xirr/:groupId/:indexId`

Protected.

Compares group XIRR against an index/benchmark.

Middleware:

- `validateID("groupId")`
- `validateID("indexId")`
- `verifyAccessToken`

Note: The route spelling is currently `comparision`, not `comparison`.

---

## `GET /analytic/comparision/nav/:groupId/:indexId`

Protected.

Compares normalized NAV between group and benchmark/index.

Middleware:

- `validateID("groupId")`
- `validateID("indexId")`
- `verifyAccessToken`

Note: The route spelling is currently `comparision`, not `comparison`.

---

# Admin Seeder Routes

Mounted at `/admin/dataseeders`.

All protected.

## `POST /admin/dataseeders/seedclassification`

Seeds/updates asset classification data.

Middleware:

- `verifyAccessToken`

---

## `POST /admin/dataseeders/seedassetmetadata`

Seeds/updates asset metadata.

Middleware:

- `verifyAccessToken`

---

## `POST /admin/dataseeders/seedpricehistory`

Seeds/inserts price history.

Middleware:

- `verifyAccessToken`

---

# Portfolio Routes

Mounted at `/portfolio`.

## `POST /portfolio/holdings`

Protected.

Fetches current user holdings for a selected group.

Request body:

```json
{
  "groupId": "MongoObjectId"
}
```

Backend flow:

```txt
groupId
→ leaf group IDs
→ active financial assets
→ latest/previous LTP
→ current value
→ invested value
→ average price
→ one-day gain
→ P/L
→ expense ratio/bucket cost
→ total stats
→ holdings list
```

Response shape:

```json
{
  "success": true,
  "message": "Metadata Fetched",
  "data": {
    "totalStats": {},
    "holdings": []
  }
}
```

Frontend use:

- Holdings page
- Holdings filter
- Summary cards
- Holding cards

---

# Portfolio Rebalancer Routes

## `POST /portfolio/rebalancer/new`

Protected.

Creates a new rebalancer configuration.

Middleware:

- `verifyAccessToken`
- `validate_CreatePortfolioRebalancerData`

Request body example:

```json
{
  "portfolioGroupId": "MongoObjectId",
  "rebalancerName": "Core Portfolio Rebalancer",
  "rebalancerDescription": "Target allocation and market-fall deployment rules",
  "assets": [
    {
      "assetId": "MongoObjectId",
      "groupId": "MongoObjectId",
      "targetWeight": 20,
      "band": 5,
      "multiplier": 1
    }
  ],
  "marketFallRules": [
    {
      "fallPercentage": 10,
      "deployPercentage": 20,
      "assets": [
        {
          "assetId": "MongoObjectId",
          "multiplier": 1,
          "min": 0.15
        }
      ]
    }
  ]
}
```

Validation:

- Portfolio group ID is required.
- Rebalancer name is required.
- At least one asset is required.
- Total asset target weight must equal 100.
- Duplicate assets are not allowed.
- Market-fall rule assets must exist inside the main assets list.
- Duplicate market-fall percentages are not allowed.
- Backend validates that selected assets are tradable and groups are leaf groups.

Response:

```json
{
  "success": true,
  "message": "Rebalancer Created",
  "data": {}
}
```

Current limitation:

- This creates persisted rebalancer configuration. It does not yet calculate real current allocation, drift, SIP/lumpsum suggestions, or deployment output.

---

## `GET /portfolio/rebalancer/list`

Protected.

Fetches the authenticated user's rebalancer configurations.

Response:

```json
{
  "success": true,
  "message": "Rebalancers Fetched",
  "data": []
}
```

---

## `GET /portfolio/rebalancer/:rebalancerId`

Protected.

Fetches one rebalancer by ID.

Middleware:

- `verifyAccessToken`
- `validateID("rebalancerId")`

Response:

```json
{
  "success": true,
  "message": "Rebalancer Fetched",
  "data": {}
}
```

---

# Portfolio Group Routes

## `GET /portfolio/:pg_id`

Protected.

Fetches group metadata and current dashboard stats.

Middleware:

- `verifyAccessToken`
- `validateID("pg_id")`

Returns:

- group name
- description
- level
- consolidated snapshot
- current investment stats
- net worth range
- current year stats
- lifetime stats

---

## `POST /portfolio/:pg_id`

Protected.

Creates a child group under `pg_id`.

Middleware:

- `verifyAccessToken`
- `validateID("pg_id")`

Important rules:

- Parent must exist.
- Parent must belong to user.
- Parent cannot already contain financial assets.
- Max depth is enforced.
- Duplicate group names are handled.

---

## `PATCH /portfolio/:pg_id`

Protected.

Updates group name/description.

Middleware:

- `verifyAccessToken`
- `validateID("pg_id")`

---

## `DELETE /portfolio/:pg_id`

Protected.

Soft-deletes a group subtree by setting `isDeleted: true`.

Middleware:

- `verifyAccessToken`
- `validateID("pg_id")`

Important:

- Root group cannot be deleted.
- Frontend `DeleteGroupForm` is still placeholder.
- Delete/archive behavior should be reviewed carefully because portfolio history, transactions, NAV, and analytics depend on historical state.

---

# Group Statement Transaction Route

## `POST /portfolio/:pg_id/grouptransaction`

Protected.

Creates deposit, withdrawal, or tax group transaction.

Middleware:

- `verifyAccessToken`
- `validateID("pg_id")`
- `validate_GroupStatementData`

Request body:

```json
{
  "type": "deposit",
  "date": "2026-06-27T00:00:00.000Z",
  "amount": 10000
}
```

Allowed `type` values:

- `deposit`
- `withdrawal`
- `tax`

Backend behavior:

- Validates group.
- Handles group cash movement.
- Applies insufficient cash checks.
- Fills NAV/future NAV.
- Syncs portfolio state.

---

# Trade Route

## `POST /portfolio/:pg_id/trade/:a_id`

Protected.

Creates buy, sell, or dividend transaction for an asset/security.

Middleware:

- `verifyAccessToken`
- `validateID("pg_id")`
- `validateID("a_id")`
- `validate_tradeData`

Buy/sell request:

```json
{
  "type": "buy",
  "date": "2026-06-27T00:00:00.000Z",
  "qty": 10,
  "price": 100
}
```

Dividend request:

```json
{
  "type": "dividend",
  "date": "2026-06-27T00:00:00.000Z",
  "dividendAmount": 500
}
```

Allowed `type` values:

- `buy`
- `sell`
- `dividend`

Backend behavior:

- Handles buy/sell/dividend.
- Maintains FIFO lots.
- Validates sell quantity.
- Updates realized/unrealized data.
- Handles dividend.
- Fills future NAV.
- Syncs portfolio.

---

# Frontend API Helper Mapping

## Auth/public helpers

Key frontend API helpers include:

- `FETCH_USERDETAILS`
- `FETCH_SECURITIESLIST`
- public security overview APIs
- auth mutation APIs

## Holdings

```js
FETCH_USERSHOLDINGS({ accessToken, data })
```

Calls:

```txt
POST /portfolio/holdings
```

## Rebalancer

```js
POST_NEWREBALANCER({ accessToken, data })
```

Calls:

```txt
POST /portfolio/rebalancer/new
```

```js
FETCH_REBALANCERLIST(accessToken)
```

Calls:

```txt
GET /portfolio/rebalancer/list
```

```js
FETCH_REBALANCER(accessToken, rebalancerId)
```

Calls:

```txt
GET /portfolio/rebalancer/:rebalancerId
```

## Portfolio Dashboard

Includes API helpers for:

- group metadata
- group NAV chart
- drawdown
- XIRR
- XIRR comparison
- NAV comparison
- add/update group
- group transaction
- trade transaction

---

# Current API Risks and Cleanup Notes

1. `/analytic/comparision/...` route spelling is currently `comparision`; keep frontend/backend aligned or add corrected aliases later.
2. `server/package.json` does not have a real `dev`, `start`, or `test` script yet.
3. No automated API tests are present.
4. Rebalancer persists configuration but does not yet calculate real allocation drift or suggestions.
5. `portfolioRebalancer.js` references `this.portfolioGroups`, but the schema does not define `portfolioGroups`.
6. `get_RebalancerListByUserId` filters by `isDeleted: false`, but the rebalancer schema currently defines `isActive`, not `isDeleted`.
7. The test route file exists and can clear database data, but it is currently not mounted in `server.js`. Keep it disabled outside local controlled development.
8. Some response shapes are inconsistent between controllers, for example `{ success: true, message, data }` vs `{ success: "Group updated" }` or `{ error }`.

---

# Recommended API Priorities

1. Add rebalancer calculation endpoint.
2. Add rebalancer update/delete/archive endpoints.
3. Add holdings table/sorting/filtering API support if needed.
4. Add backup/export API.
5. Add test setup and integration tests.
6. Add route aliases for corrected spelling: `/comparison/...`.
7. Standardize response shapes.
8. Add safe deployment guard around test utilities.
