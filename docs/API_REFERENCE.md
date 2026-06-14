# FolioScope API Reference

Last reviewed from code: 2026-06-14

This document maps the current FolioScope backend routes and the frontend API
helpers that call them. The backend is mounted from `server/server.js`; the
frontend axios instances are defined in `client/src/constants/axiosInstance.js`.

## Base URLs

| Layer | Base URL | Notes |
| --- | --- | --- |
| Backend server | `http://localhost:3000` by default | `PORT` env overrides the port. |
| Frontend `BASE_URL` | `http://<window.location.hostname>:3000` | No cookies by default. |
| Frontend `BASE_URL_withCredentials` | `http://<window.location.hostname>:3000` | Sends and receives cookies with `withCredentials: true`. |

## Authentication Conventions

Protected routes expect:

```http
Authorization: Bearer <accessToken>
```

Refresh-token routes use HTTP-only cookies:

| Cookie | Set by | Used by |
| --- | --- | --- |
| `refreshToken` | `POST /login`, `POST /verifyemail`, `POST /refreshtoken` | `POST /refreshtoken` |
| `sessionId` | `POST /login`, `POST /verifyemail`, `POST /refreshtoken` | `POST /refreshtoken` |

Common backend error shape from the global error handler:

```json
{
  "success": false,
  "statusCode": 500,
  "message": "Some Error"
}
```

Some controllers return local error shapes such as `{ "error": "..." }`.

## Backend Routes

### User And Auth Routes

Mounted at `/`.

| Method | Path | Auth | Body / Params | Success response |
| --- | --- | --- | --- | --- |
| `GET` | `/userdetails` | Bearer access token | None | `{ success, message, user: { firstName, lastName, role } }` |
| `POST` | `/signup` | Public | `{ firstName, lastName, email, password, role?, isActive? }` | `{ success: true, message }`; sends verification email |
| `POST` | `/sendverificationemail` | Public or credentialed frontend call | `{ email }` | `{ success: true, message }`; sends verification email |
| `POST` | `/verifyemail` | Email verify bearer token | Empty body; `Authorization: Bearer <emailVerifyToken>` | `{ success: true, message, accessToken }`; sets refresh cookies |
| `POST` | `/login` | Public | `{ email, password, role }` | `{ success: true, message, accessToken }`; sets refresh cookies |
| `POST` | `/refreshtoken` | Refresh cookies | None | `{ success: true, message, accessToken }`; rotates refresh cookie |
| `POST` | `/forgotpassword` | Public | `{ email }` | `{ success: true, message, email }`; sends OTP email |
| `POST` | `/verifyotp/:email` | Public | Param `email`; body `{ otp }` | `{ success: true, message }` |
| `POST` | `/confirmpassword/:email` | Public | Param `email`; body `{ newPassword, confirmPassword }` | `{ success: true, message }` |
| `POST` | `/logoutuser` | Bearer access token | None | `{ success: true, message }`; revokes current session |
| `POST` | `/logoutalluser` | Bearer access token | None | `{ success: true, message }`; revokes all user sessions |

Validation notes:

| Payload | Rules |
| --- | --- |
| Signup | `firstName`, `lastName`, `email`, `password` required; `role` is `client` or `admin`; `isActive` defaults to `true`. |
| Login | `email`, `password`, and `role` required. |
| Email | Valid email string required. |
| OTP | 6-character string required. |
| Password change | `newPassword` min 6, max 128; `confirmPassword` must match. |

### Public Market Data Routes

Mounted at `/`.

| Method | Path | Auth | Input | Success response |
| --- | --- | --- | --- | --- |
| `GET` | `/allsecuritieslist` | Public | None | `{ success: true, data: string[] }` |
| `GET` | `/defaultmetadata` | Public | None | `{ success: true, data }` |
| `GET` | `/top/securities` | Public | None | `{ success: true, data }` |
| `GET` | `/security/:securityId` | Public | Param `securityId` | `{ success: true, data }` |

### Price Range Routes

Mounted at `/price`.

| Method | Path | Auth | Input | Success response |
| --- | --- | --- | --- | --- |
| `GET` | `/price/security/:securityId` | Public | Optional query `range=W|M|Y|3Y|MAX`; omitted range returns 1D | `{ success: true, message, data }` |
| `GET` | `/price/group/:groupId` | Bearer access token | Param `groupId`; optional query `range=W|M|Y|3Y|MAX`; omitted range returns 1D | `{ success: true, message, data }` |

### Analytics Routes

Mounted at `/analytic`.

| Method | Path | Auth | Input | Success response |
| --- | --- | --- | --- | --- |
| `GET` | `/analytic/drawdown/:securityId` | Public | Param `securityId` | `{ success: true, message: "Price Drawdown Analysis", data }` |

### Portfolio Routes

Mounted at `/portfolio`. All routes require a bearer access token.

| Method | Path | Body / Params | Success response |
| --- | --- | --- | --- |
| `GET` | `/portfolio/:pg_id` | Param `pg_id`; use `net-portfolio` for the root portfolio metadata | `{ success: true, message: "Metadata Fetched", data }` |
| `POST` | `/portfolio/:pg_id` | Param parent group id; body `{ name, description }` | `{ success: "Group created", data }` |
| `PATCH` | `/portfolio/:pg_id` | Param group id; body `{ name, description }` | `{ success: "Group updated", data }` |
| `DELETE` | `/portfolio/:pg_id` | Param group id | `{ success: "Group deleted" }` |
| `POST` | `/portfolio/:pg_id/grouptransaction` | Param leaf group id; body `{ type, date, amount }` | `{ success: "Transaction completed successfully", result }` |
| `POST` | `/portfolio/:pg_id/trade/:a_id` | Params group id and asset id; body depends on trade type | `{ success: true, message }` |

Portfolio validation:

| Payload | Rules |
| --- | --- |
| Group transaction | `type` is `deposit`, `withdrawal`, or `tax`; `date` is ISO date; `amount` is greater than 0. |
| Trade buy/sell | `type` is `buy` or `sell`; `date` ISO; `qty` and `price` required. |
| Trade dividend | `type` is `dividend`; `date` ISO; `dividendAmount` required. |

### Admin Seeder Routes

Mounted at `/admin/dataseeders`. All routes require a bearer access token.

| Method | Path | Body | Success response |
| --- | --- | --- | --- |
| `POST` | `/admin/dataseeders/seedclassification` | None | `{ success: "Classification Seeding Successful" }` |
| `POST` | `/admin/dataseeders/seedassetmetadata` | None | `{ success: "AssetMetaData Update Successful", summary }` |
| `POST` | `/admin/dataseeders/seedpricehistory` | `{ name }` | `{ success: "Price History Insertion is Successful", summary }` |

### Test Routes

Mounted at `/test`.

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/test/cleardatabase` | None | Deletes client users and portfolio/ledger/nav data. Development-only danger route. |
| `GET` | `/test/:g_id` | None in route file | Reads `req.user.id`, so it will fail unless upstream middleware supplies `req.user`. |

## Frontend API Helpers

### Shared Axios Instances

| Export | File | Purpose |
| --- | --- | --- |
| `BASE_URL` | `client/src/constants/axiosInstance.js` | Axios client without cookies. |
| `BASE_URL_withCredentials` | `client/src/constants/axiosInstance.js` | Axios client with cookies for login/session refresh. |

### Global Helpers

| Helper | File | Backend call | Returns |
| --- | --- | --- | --- |
| `POST_TOKENROTATION()` | `client/src/APIs/FETCH_APIs.js` | `POST /refreshtoken` using credentials | Full response data |
| `FETCH_RANGEPRICE(securityID, range?)` | `client/src/features/apis/FETCH_APIs.js` | `GET /price/security/:securityID?range=...` | `response.data.data` |
| `FETCH_USERDETAILS(accessToken)` | `client/src/features/apis/FETCH_APIs.js` | `GET /userdetails` with bearer token | Full response data |

### Public Header And Home Helpers

| Helper | File | Backend call | Returns |
| --- | --- | --- | --- |
| `FETCH_SECURITIESLIST()` | `client/src/features/public/header/api/FETCH_APIs.js` | `GET /allsecuritieslist` | `response.data.data` |
| `FETCH_MARKETGLANCE()` | `client/src/features/public/home/api/FETCH_APIs.js` | `GET /defaultmetadata` | `response.data.data` |
| `FETCH_TODAYS_MARKETS()` | `client/src/features/public/home/api/FETCH_APIs.js` | `GET /top/securities` | `response.data.data` |

### Security Dashboard Helpers

| Helper | File | Backend call | Returns |
| --- | --- | --- | --- |
| `FETCH_SECURITYOVERVIEW(securityID)` | `client/src/features/public/securityDashboard/api/FETCH_APIs.js` | `GET /security/:securityID` | `response.data.data` |
| `FETCH_SECURITYDRAWDOWN(securityID)` | `client/src/features/public/securityDashboard/api/FETCH_APIs.js` | `GET /analytic/drawdown/:securityID` | `response.data.data` |
| `useSecurityOverview(securityID)` | `client/src/features/public/securityDashboard/hooks/RTK Query/useSecurityQuery.js` | Wraps `FETCH_SECURITYOVERVIEW` | React Query result |
| `useSecurityDrawdown(securityID)` | `client/src/features/public/securityDashboard/hooks/RTK Query/useSecurityQuery.js` | Wraps `FETCH_SECURITYDRAWDOWN` | React Query result |

### Auth Helpers

| Helper / Hook | File | Backend call | Notes |
| --- | --- | --- | --- |
| `POST_LOGINFORM(data)` | `client/src/features/public/Authentication/login/APIs/POST_APIs.js` | `POST /login` with credentials | Returns full response data. |
| `useLoginFormMutation()` | `client/src/features/public/Authentication/login/hooks/RTK Query/useformMutation.jsx` | Wraps `POST_LOGINFORM` | React Query mutation. |
| `POST_SIGNUPFORM(data)` | `client/src/features/public/Authentication/signup/api/POST_apis.js` | `POST /signup` | Returns full response data. |
| `POST_SENDVERIFICATIONEMAIL(data)` | `client/src/features/public/Authentication/sendVerificationMail/APIs/POST_APIs.js` | `POST /sendverificationemail` | Uses `BASE_URL`. |
| `POST_SENDVERIFICATIONEMAIL(data)` | `client/src/features/public/Authentication/emailverification/APIs/POST_APIs.js` | `POST /sendverificationemail` | Uses `BASE_URL_withCredentials`. |
| `POST_VERIFYEMAIL(token)` | `client/src/features/public/Authentication/emailverification/APIs/POST_APIs.js` | `POST /verifyemail` with bearer email token | Returns access token and sets cookies server-side. |
| `useEmailVerificationMutation()` | `client/src/features/public/Authentication/emailverification/hooks/RTK Query/useEmailVerificationMutation.jsx` | Wraps `POST_VERIFYEMAIL` | React Query mutation. |
| `useEmailSendVerificationMutation()` | `client/src/features/public/Authentication/emailverification/hooks/RTK Query/useEmailVerificationMutation.jsx` | Wraps resend verification helper | React Query mutation. |
| `POST_SENDOTPEMAIL(data)` | `client/src/features/public/Authentication/sendOTPMail/APIs/POST_APIs.js` | `POST /forgotpassword` | Body `{ email }`. |
| `POST_VERIFYOTP({ email, otp })` | `client/src/features/public/Authentication/otpSubmit/APIs/POST_APIs.js` | `POST /verifyotp/:email` | Body `{ otp }`. |
| `POST_CHANGEPASSWORD({ email, data })` | `client/src/features/public/Authentication/confirmPassword/APIs/POST_APIs.js` | `POST /confirmpassword/:email` | `data` contains `newPassword` and `confirmPassword`. |
| `useRotateTokenMutation()` | `client/src/hooks/RTK Query Hooks/useRotateToken.jsx` | Wraps `POST_TOKENROTATION` | React Query mutation. |

### Protected Dashboard Helpers

| Helper / Hook | File | Backend call | Notes |
| --- | --- | --- | --- |
| `FETCH_GROUPMETADATA(accessToken, gp_id = "null")` | `client/src/features/protected/userDashboard/APIs/FETCH_APIs.js` | `GET /portfolio/:gp_id` with bearer token | Returns full response data. |
| `useGROUPMETADATA(accessToken, gp_id = "null")` | `client/src/features/protected/userDashboard/hooks/ReactQuery/useQuery.jsx` | Wraps `FETCH_GROUPMETADATA` | React Query result; refetches every 10 seconds. |

## Current Implementation Notes

These are API-relevant behaviors observed in the current code, not design
recommendations:

| Area | Note |
| --- | --- |
| Admin auth contract | `verifyAccessToken` sets `req.userId`, but admin controllers currently read `req.user._id`. These routes may fail until the controller contract is aligned. |
| Password reset persistence | `confirmPassword` checks `passwordResetVerified` fields, but the current user schema does not declare those fields. Confirm behavior under the active Mongoose strict-mode settings before relying on this flow. |
| Test clear route | `GET /test/cleardatabase` is mounted without auth and deletes data. Keep it development-only or remove/protect it before production use. |
| Response shape consistency | Some controllers use `{ success, message, data }`; others use string-valued `success` or `{ error }`. Frontend callers should not assume one universal shape yet. |
