# FolioScope API Reference

Updated from current code inspection.

This document maps the current backend routes and the frontend API helpers used by FolioScope. The backend is mounted from `server/server.js`, and frontend Axios instances are defined in `client/src/constants/axiosInstance.js`.

---

## Base URLs

| Layer                               | Base URL                                 | Notes                                              |
| ----------------------------------- | ---------------------------------------- | -------------------------------------------------- |
| Backend                             | `http://localhost:3000`                  | `PORT` environment variable can override the port. |
| Frontend Vite dev server            | `http://localhost:5173`                  | Default Vite development server.                   |
| Frontend `BASE_URL`                 | `http://<window.location.hostname>:3000` | Axios instance without credentials.                |
| Frontend `BASE_URL_withCredentials` | `http://<window.location.hostname>:3000` | Axios instance with cookies enabled.               |

---

## Authentication Conventions

Protected routes expect an access token header:

```http
Authorization: Bearer <accessToken>
```

Refresh-token routes use HTTP-only cookies:

| Cookie         | Set by                                                   | Used by              |
| -------------- | -------------------------------------------------------- | -------------------- |
| `refreshToken` | `POST /login`, `POST /verifyemail`, `POST /refreshtoken` | `POST /refreshtoken` |
| `sessionId`    | `POST /login`, `POST /verifyemail`, `POST /refreshtoken` | `POST /refreshtoken` |

Common global error response:

```json
{
  "success": false,
  "statusCode": 500,
  "message": "Some Error"
}
```

Some controllers still return local error shapes such as:

```json
{
  "error": "Duplicate group name"
}
```

or string-valued success fields such as:

```json
{
  "success": "Group created",
  "data": {}
}
```

---

## User and Authentication Routes

Mounted at `/`.

### `GET /userdetails`

Returns the authenticated user's basic details and grouped portfolio group references.

| Field | Value               |
| ----- | ------------------- |
| Auth  | Bearer access token |
| Body  | None                |

Example response:

```json
{
  "success": true,
  "message": "User details fetched successfully",
  "user": {
    "firstName": "Amir",
    "lastName": "...",
    "role": "client",
    "groups": {
      "level1": {},
      "level2": {},
      "level3": {},
      "level4": {}
    }
  }
}
```

### `POST /signup`

Registers a new user and sends an email verification link.

Auth: Public

Body:

```json
{
  "firstName": "Amir",
  "lastName": "Khan",
  "email": "amir@example.com",
  "password": "password123",
  "role": "client",
  "isActive": true
}
```

Validation:

| Field       | Rule                                      |
| ----------- | ----------------------------------------- |
| `firstName` | Required string, max 50                   |
| `lastName`  | Required string, max 50                   |
| `email`     | Required valid email                      |
| `password`  | Required, min 6, max 128                  |
| `role`      | `client` or `admin`, defaults to `client` |
| `isActive`  | Boolean, defaults to `true`               |

Success response:

```json
{
  "success": true,
  "message": "Registration successful. Please verify your email."
}
```

### `POST /sendverificationemail`

Resends an email verification link.

Auth: Public

Body:

```json
{
  "email": "amir@example.com"
}
```

Success response:

```json
{
  "success": true,
  "message": "Check your mail for verification: amir@example.com"
}
```

Implementation behavior:

- 1-minute resend cooldown
- Daily retry reset
- Maximum retry limit before temporary lockout

### `POST /verifyemail`

Verifies the email token, creates the default root portfolio group if missing, creates a session, sets refresh cookies, and returns an access token.

Auth: Email verification token

Header:

```http
Authorization: Bearer <emailVerifyToken>
```

Body: Empty JSON object is accepted.

Success response:

```json
{
  "success": true,
  "message": "Email verified successfully",
  "accessToken": "jwt-access-token",
  "user": {
    "firstName": "Amir",
    "lastName": "Khan",
    "role": "client",
    "groups": {
      "level1": {},
      "level2": {},
      "level3": {},
      "level4": {}
    }
  }
}
```

### `POST /login`

Logs a user in, creates a session, sets refresh cookies, and returns an access token.

Auth: Public

Body:

```json
{
  "email": "amir@example.com",
  "password": "password123",
  "role": "client"
}
```

Validation:

| Field      | Rule                          |
| ---------- | ----------------------------- |
| `email`    | Required valid email          |
| `password` | Required, min 6, max 128      |
| `role`     | Required, `client` or `admin` |

Success response:

```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "jwt-access-token",
  "user": {
    "firstName": "Amir",
    "lastName": "Khan",
    "role": "client",
    "groups": {
      "level1": {},
      "level2": {},
      "level3": {},
      "level4": {}
    }
  }
}
```

### `POST /refreshtoken`

Rotates the refresh token and returns a new access token.

| Field | Value                                  |
| ----- | -------------------------------------- |
| Auth  | `refreshToken` and `sessionId` cookies |
| Body  | None                                   |

Success response:

```json
{
  "success": true,
  "message": "Access token generated",
  "accessToken": "new-access-token"
}
```

Security behavior:

- Verifies refresh token
- Verifies session cookie match
- Looks up active session document
- Hashes and rotates refresh token
- Revokes all sessions if refresh-token reuse is detected

### `POST /forgotpassword`

Sends OTP to a verified user.

Auth: Public

Body:

```json
{
  "email": "amir@example.com"
}
```

Success response:

```json
{
  "success": true,
  "message": "OTP sent to amir@example.com",
  "email": "amir@example.com"
}
```

### `POST /verifyotp/:email`

Verifies a 6-digit OTP for password reset.

Auth: Public

Params:

| Param   | Description        |
| ------- | ------------------ |
| `email` | User email address |

Body:

```json
{
  "otp": "123456"
}
```

Success response:

```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

### `POST /confirmpassword/:email`

Changes password after OTP verification.

Auth: Public

Params:

| Param   | Description        |
| ------- | ------------------ |
| `email` | User email address |

Body:

```json
{
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

Validation:

| Field             | Rule                               |
| ----------------- | ---------------------------------- |
| `newPassword`     | Required, min 6, max 128           |
| `confirmPassword` | Required, must match `newPassword` |

Success response:

```json
{
  "success": true,
  "message": "Password changed successfully "
}
```

### `POST /logoutuser`

Revokes the current session and clears cookies.

Auth: Bearer access token

Success response:

```json
{
  "success": true,
  "message": "Logout successful"
}
```

### `POST /logoutalluser`

Revokes all active sessions for the user and clears cookies.

Auth: Bearer access token

Success response:

```json
{
  "success": true,
  "message": "Logout All successful"
}
```

---

## Public Market Data Routes

Mounted at `/`.

### `GET /allsecuritieslist`

Returns all security names from the asset metadata cache.

Auth: Public

Success response:

```json
{
  "success": true,
  "data": ["NIFTY 50", "NIFTY NEXT 50"]
}
```

### `GET /defaultmetadata`

Returns default market metadata used by the homepage market-glance section.

Auth: Public

Success response:

```json
{
  "success": true,
  "data": {}
}
```

### `GET /top/securities`

Returns structured today's-market sections such as stocks, ETFs, mutual funds, gainers, losers, and 52-week groups.

Auth: Public

Success response:

```json
{
  "success": true,
  "data": {}
}
```

### `GET /security/:securityId`

Returns a security overview by asset metadata/security ID.

Auth: Public

Params:

| Param        | Description                |
| ------------ | -------------------------- |
| `securityId` | Asset metadata/security ID |

Success response:

```json
{
  "success": true,
  "data": {}
}
```

---

## Price Range Routes

Mounted at `/price`.

Supported `range` query values:

```txt
W, M, Y, 3Y, MAX
```

If no `range` is provided, the controller returns 1D data.

### `GET /price/security/:securityId`

Returns public price range data for a security.

Auth: Public

Examples:

```http
GET /price/security/SECURITY_ID
GET /price/security/SECURITY_ID?range=W
GET /price/security/SECURITY_ID?range=M
GET /price/security/SECURITY_ID?range=Y
GET /price/security/SECURITY_ID?range=3Y
GET /price/security/SECURITY_ID?range=MAX
```

Success response:

```json
{
  "success": true,
  "message": "W Price Range",
  "data": {}
}
```

### `GET /price/group/:groupId`

Returns protected NAV range data for a portfolio group.

Auth: Bearer access token

Params:

| Param     | Description                             |
| --------- | --------------------------------------- |
| `groupId` | MongoDB ObjectId of the portfolio group |

Examples:

```http
GET /price/group/GROUP_ID
GET /price/group/GROUP_ID?range=W
GET /price/group/GROUP_ID?range=M
GET /price/group/GROUP_ID?range=Y
GET /price/group/GROUP_ID?range=3Y
GET /price/group/GROUP_ID?range=MAX
```

Success response:

```json
{
  "success": true,
  "message": "M Price Range",
  "data": {}
}
```

---

## Analytics Routes

Mounted at `/analytic`.

### `GET /analytic/drawdown/security/:securityId`

Returns drawdown analysis for a public security.

Auth: Public

Success response:

```json
{
  "success": true,
  "message": "Price Drawdown Analysis",
  "data": {}
}
```

### `GET /analytic/drawdown/group/:groupId`

Returns NAV drawdown analysis for a protected portfolio group.

Auth: Bearer access token

Success response:

```json
{
  "success": true,
  "message": "Price Drawdown Analysis",
  "data": {}
}
```

---

## Portfolio Routes

Mounted at `/portfolio`.

All portfolio routes require:

```http
Authorization: Bearer <accessToken>
```

`pg_id` must be a valid MongoDB ObjectId in current route validation.

### `GET /portfolio/:pg_id`

Returns portfolio group metadata, consolidated snapshot, current investment snapshot, net worth range, current-year values, and lifetime values.

Auth: Bearer access token

Success response shape:

```json
{
  "success": true,
  "message": "Metadata Fetched",
  "data": {
    "_id": "group-id",
    "groupName": "NET WORTH",
    "description": "...",
    "level": 1,
    "consolidatedSnapshot": {
      "netcurrentvalue": 0,
      "consolidatedcash": 0,
      "consolidatedtax": 0
    },
    "currentInvestment": {
      "investmentvalue": 0,
      "currentvalue": 0,
      "pl": "0.00",
      "pl%": "0.00"
    },
    "networth": {},
    "currentyear": {},
    "lifetime": {}
  }
}
```

### `POST /portfolio/:pg_id`

Adds a child group under a parent group.

Auth: Bearer access token

Body:

```json
{
  "name": "Core Equity",
  "description": "Long-term equity portfolio"
}
```

Business rules:

- Parent group must exist
- Parent must belong to the authenticated user
- Parent group cannot already contain a direct asset
- Maximum group depth is enforced

Success response:

```json
{
  "success": "Group created",
  "data": {}
}
```

### `PATCH /portfolio/:pg_id`

Updates an existing portfolio group.

Auth: Bearer access token

Body:

```json
{
  "name": "Updated Group Name",
  "description": "Updated description"
}
```

Success response:

```json
{
  "success": "Group updated",
  "data": {}
}
```

### `DELETE /portfolio/:pg_id`

Soft-deletes a portfolio group and descendants.

Auth: Bearer access token

Rules:

- Group must exist
- Group must belong to authenticated user
- Root level group cannot be deleted

Success response:

```json
{
  "success": "Group deleted"
}
```

### `POST /portfolio/:pg_id/grouptransaction`

Creates a group-level cash transaction on a leaf portfolio group.

Auth: Bearer access token

Body:

```json
{
  "type": "deposit",
  "date": "2026-06-20T10:30:00.000Z",
  "amount": 10000
}
```

Validation:

| Field    | Rule                              |
| -------- | --------------------------------- |
| `type`   | `deposit`, `withdrawal`, or `tax` |
| `date`   | ISO date string                   |
| `amount` | Number greater than 0             |

Success response:

```json
{
  "success": "Transaction completed successfully",
  "result": {}
}
```

### `POST /portfolio/:pg_id/trade/:a_id`

Executes a buy, sell, or dividend transaction for an asset inside a portfolio group.

Auth: Bearer access token

Params:

| Param   | Description                      |
| ------- | -------------------------------- |
| `pg_id` | Portfolio group ObjectId         |
| `a_id`  | Asset metadata/security ObjectId |

Buy body:

```json
{
  "type": "buy",
  "date": "2026-06-20T10:30:00.000Z",
  "qty": 10,
  "price": 100
}
```

Sell body:

```json
{
  "type": "sell",
  "date": "2026-06-20T10:30:00.000Z",
  "qty": 5,
  "price": 120
}
```

Dividend body:

```json
{
  "type": "dividend",
  "date": "2026-06-20T10:30:00.000Z",
  "dividendAmount": 500
}
```

Validation:

| Type       | Required fields          |
| ---------- | ------------------------ |
| `buy`      | `date`, `qty`, `price`   |
| `sell`     | `date`, `qty`, `price`   |
| `dividend` | `date`, `dividendAmount` |

Backend behavior:

- Validates transaction type
- Requires leaf portfolio group
- Prevents direct index transactions
- Prevents backdated or same timestamp transactions
- Fills missing NAVs before mutation
- Handles FIFO lots for sells
- Calculates realized gains and STCG/LTCG
- Updates cash and asset quantities
- Uses MongoDB sessions for transaction flow

Success response:

```json
{
  "success": true,
  "message": "Trade Executed Successfully"
}
```

---

## Admin Seeder Routes

Mounted at `/admin/dataseeders`.

All routes require bearer access token. Admin authorization is checked inside controllers through `is_Admin`.

### `POST /admin/dataseeders/seedclassification`

Seeds asset classification data from Apps Script.

Success response:

```json
{
  "success": "Classification Seeding Successful"
}
```

### `POST /admin/dataseeders/seedassetmetadata`

Seeds asset metadata and refreshes related cache/live ticker setup.

Success response:

```json
{
  "success": "AssetMetaData Update Successful",
  "summary": {}
}
```

### `POST /admin/dataseeders/seedpricehistory`

Seeds historical price data for a named security or group of securities depending on seeder implementation.

Body:

```json
{
  "name": "NIFTY 50"
}
```

Success response:

```json
{
  "success": "Price History Insertion is Successful",
  "summary": {}
}
```

---

## Test Routes

Mounted at `/test` in the currently inspected `server/server.js`.

> Warning: These routes are development-only and should not be exposed in production.

### `GET /test/cleardatabase`

Deletes major collections, including client users, NAV performance, financial assets, portfolio groups, ledger statements, group statements, and FIFO lots.

Success response:

```json
{
  "success": "Clearing Database Successful"
}
```

### `GET /test/:g_id`

Attempts to return a portfolio group by ID. Current implementation reads `req.user.id`, so it may fail unless upstream middleware provides `req.user`.

---

## Frontend API Helper Map

### Shared Axios Instances

| Export                     | File                                    | Purpose                                   |
| -------------------------- | --------------------------------------- | ----------------------------------------- |
| `BASE_URL`                 | `client/src/constants/axiosInstance.js` | Axios client without cookies              |
| `BASE_URL_withCredentials` | `client/src/constants/axiosInstance.js` | Axios client with `withCredentials: true` |

### Global Helpers

| Helper                                              | File                                     | Backend call                            |
| --------------------------------------------------- | ---------------------------------------- | --------------------------------------- |
| `POST_TOKENROTATION()`                              | `client/src/APIs/FETCH_APIs.js`          | `POST /refreshtoken`                    |
| `FETCH_RANGEPRICE(securityID, range?)`              | `client/src/features/apis/FETCH_APIs.js` | `GET /price/security/:securityID`       |
| `FETCH_RANGENAVGROUP(groupID, accessToken, range?)` | `client/src/features/apis/FETCH_APIs.js` | `GET /price/group/:groupID`             |
| `FETCH_USERDETAILS(accessToken)`                    | `client/src/features/apis/FETCH_APIs.js` | `GET /userdetails`                      |
| `FETCH_GROUPDRAWDOWN(groupId, accessToken)`         | `client/src/features/apis/FETCH_APIs.js` | `GET /analytic/drawdown/group/:groupId` |

### Public Helpers

| Helper                               | File                                                             | Backend call                                  |
| ------------------------------------ | ---------------------------------------------------------------- | --------------------------------------------- |
| `FETCH_SECURITIESLIST()`             | `client/src/features/public/header/api/FETCH_APIs.js`            | `GET /allsecuritieslist`                      |
| `FETCH_MARKETGLANCE()`               | `client/src/features/public/home/api/FETCH_APIs.js`              | `GET /defaultmetadata`                        |
| `FETCH_TODAYS_MARKETS()`             | `client/src/features/public/home/api/FETCH_APIs.js`              | `GET /top/securities`                         |
| `FETCH_SECURITYOVERVIEW(securityID)` | `client/src/features/public/securityDashboard/api/FETCH_APIs.js` | `GET /security/:securityID`                   |
| `FETCH_SECURITYDRAWDOWN(securityID)` | `client/src/features/public/securityDashboard/api/FETCH_APIs.js` | `GET /analytic/drawdown/security/:securityID` |

### Authentication Helpers

| Helper                                 | Backend call                   |
| -------------------------------------- | ------------------------------ |
| `POST_LOGINFORM(data)`                 | `POST /login`                  |
| `POST_SIGNUPFORM(data)`                | `POST /signup`                 |
| `POST_VERIFYEMAIL(token)`              | `POST /verifyemail`            |
| `POST_SENDVERIFICATIONEMAIL(data)`     | `POST /sendverificationemail`  |
| `POST_SENDOTPEMAIL(data)`              | `POST /forgotpassword`         |
| `POST_VERIFYOTP({ email, otp })`       | `POST /verifyotp/:email`       |
| `POST_CHANGEPASSWORD({ email, data })` | `POST /confirmpassword/:email` |

### Protected Dashboard Helpers

| Helper                                                  | Backend call                            |
| ------------------------------------------------------- | --------------------------------------- |
| `FETCH_GROUPMETADATA(accessToken, gp_id)`               | `GET /portfolio/:gp_id`                 |
| `POST_ADDGROUPFORM({ accessToken, groupId, data })`     | `POST /portfolio/:groupId`              |
| `PATCH_UPDATEGROUPFORM({ accessToken, groupId, data })` | `PATCH /portfolio/:groupId`             |
| `use1DNavRangeGroup(groupid, accessToken)`              | `GET /price/group/:groupid`             |
| `useNavGroupChartRange(groupid, accessToken, range)`    | `GET /price/group/:groupid?range=...`   |
| `useGroupDrawdown(groupId, accessToken)`                | `GET /analytic/drawdown/group/:groupId` |

---

## Current Implementation Notes

These notes reflect the inspected code state and should be resolved before production deployment:

| Area                       | Note                                                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Test route                 | `/test/cleardatabase` is mounted and deletes data. Guard or remove before production.                                    |
| Admin auth                 | Admin controllers should be checked to ensure they consistently use `req.userId` with `verifyAccessToken`.               |
| Password reset             | `passwordResetVerified` and `passwordResetVerifiedAt` are used by service logic. Confirm they exist in the user schema.  |
| Protected Add Group helper | `POST_APIs.js` uses a deep relative import for `axiosInstance`; verify build resolution.                                 |
| Response consistency       | Some routes return `{ success: true }`, others return string-valued `success`, and some local errors return `{ error }`. |
| Tests                      | No complete automated test suite exists yet for financial correctness.                                                   |
| Startup jobs               | `systemBootup`, `sync_CurrentPrices`, and `sync_AllUsersPortfolio` run directly from `server.js`.                        |
