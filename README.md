# FolioScope

FolioScope is a MERN-based, SaaS-style personal wealth-management and portfolio analytics system. It started as a Google Sheet-based personal finance/portfolio system and is being converted into a full-stack application for long-term private use.

The project is not a simple portfolio tracker. Its core focus is financial state correctness: portfolio group hierarchy, cash movement, buy/sell/dividend handling, FIFO lots, NAV reconstruction, holdings aggregation, drawdown analysis, XIRR, benchmark comparison, and rebalancing workflows.

> Current status: advanced prototype under active development. The portfolio analytics core, holdings V1, comparison V1, and rebalancer configuration V1 are implemented. Production hardening, automated tests, backup/export, deployment safety, real rebalancer calculation, and rental income module are still pending.

---

## Current Codebase Snapshot

Latest inspected zip: `updated folioScope-main.zip`

| Metric | Current |
|---|---:|
| Total files | 454 |
| Directories | 303 |
| JavaScript files | 183 |
| Server JS files | 122 |
| Client JS files | 61 |
| Client JSX files | 138 |
| CSS files | 92 |
| Markdown docs | 7 |
| HTML files | 2 |
| Images/assets | 22 |
| Server JS LOC | ~11,041 |
| Client JS LOC | ~1,718 |
| Client JSX LOC | ~9,589 |
| Client CSS LOC | ~6,391 |
| Useful source/docs LOC excluding package-lock | ~33k+ |

---

## What FolioScope Solves

Most personal portfolio tools show current value, simple gains, or manual transactions. FolioScope is built around a deeper problem:

> How can a personal wealth system correctly track money movement, trades, holdings, historical NAV, portfolio snapshots, drawdowns, XIRR, benchmark performance, and future rebalancing decisions over time?

The system supports:

- Hierarchical portfolio groups.
- Group-level and asset-level snapshots.
- Buy, sell, and dividend transactions.
- Deposit, withdrawal, and tax transactions.
- FIFO lot accounting.
- Cash propagation across portfolio groups.
- NAV reconstruction and future NAV synchronization.
- Holdings aggregation with latest and previous market prices.
- Drawdown analytics.
- XIRR and benchmark comparison.
- Public market/security dashboard.
- Session-aware authentication.
- Rebalancer configuration with target weights, bands, multipliers, and market-fall deployment rules.

---

## Tech Stack

### Frontend

- React 19
- Vite
- React Router
- TanStack Query
- React Redux / Redux Toolkit
- Axios
- Lightweight Charts
- CSS Modules
- SessionStorage caching for public securities list

### Backend

- Node.js
- Express 5
- MongoDB
- Mongoose
- Joi
- JWT
- bcrypt
- cookie-parser
- nodemailer
- Handlebars email templates

### Current Architecture Style

- Feature-based React structure.
- Protected dashboard modules separated by domain.
- Server-state handled mainly with TanStack Query.
- UI/global toggle state handled with Redux.
- Auth/session handled with React Context + backend refresh-token flow.
- Backend organized around routes, controllers, models, validations, sync scripts, and aggregation/read-model utilities.

---

## Major Features

### 1. Authentication and Session System

Implemented:

- User registration.
- Email verification.
- Login.
- Password hashing with bcrypt.
- Access token authentication.
- Refresh-token based session restoration.
- Token rotation.
- Logout current session.
- Logout all sessions.
- Password reset with OTP verification.
- Protected routes using `verifyAccessToken`.

Current auth design:

```txt
login / verify email
      ↓
access token returned to frontend
      ↓
refreshToken + sessionId stored in cookies
      ↓
frontend keeps access token in memory
      ↓
refresh endpoint restores session after reload
      ↓
protected APIs use Authorization: Bearer <accessToken>
```

---

### 2. Public Market Data

Implemented:

- Public securities list.
- Default metadata.
- Today's top securities.
- Security overview page.
- Security price range endpoint.
- Security drawdown endpoint.

The public securities list is bootstrapped at app startup using:

```txt
AppInitializerWithSessionStorage
→ usePublicSecurities
→ sessionStorage cache
→ TanStack Query
```

This avoids repeatedly fetching a large, slow-changing securities list and supports:

- Mobile search.
- Trade form asset lookup.
- Benchmark/index lookup.
- Rebalancer asset search.

---

### 3. Portfolio Group System

Implemented:

- Hierarchical portfolio groups.
- Add group.
- Update group.
- Backend soft-delete logic for group/subtree.
- Group metadata.
- Group current snapshot.
- Group current-year and lifetime stats.
- Leaf-group validation.
- Group-level NAV range.
- Group-level drawdown.

Current frontend gap:

- `DeleteGroupForm` is still a placeholder. Deletion requires careful archive/soft-delete/history design before exposing it as a UI action.

---

### 4. Trade Engine

Implemented transaction types:

- Buy
- Sell
- Dividend

The backend trade flow includes:

- User/group validation.
- Asset validation.
- FIFO lot handling.
- Sell quantity checks.
- Realized gain calculation.
- Dividend tracking.
- NAV fill/future sync after trade.
- Portfolio sync after trade.

---

### 5. Group Statement Transactions

Implemented transaction types:

- Deposit
- Withdrawal
- Tax

The group statement transaction flow includes:

- Group validation.
- Leaf checks.
- Cash movement.
- Insufficient cash guard.
- NAV fill/future sync.
- Portfolio sync after transaction.

---

### 6. NAV Reconstruction and Sync

FolioScope has a dedicated NAV reconstruction/sync layer.

Implemented ideas include:

- Fill missing NAVs.
- Future NAV synchronization after historical transactions.
- Group NAV updates.
- Asset snapshot updates.
- All-group snapshot updates.
- Current price sync.
- Portfolio-wide sync.

This is one of the most complex and valuable parts of the project.

---

### 7. Analytics

Implemented:

- Security drawdown.
- Group drawdown.
- Group XIRR action.
- XIRR comparison against benchmark.
- NAV comparison against benchmark.
- Normalized NAV comparison chart.
- Excess return/excess drawdown cards.
- Security price range analytics.

Current limitation:

- Benchmark/index is still hardcoded in some frontend comparison flow, for example `NIFTY 50`. Custom benchmark selection is pending.

---

### 8. Holdings Module

Holdings is now a real-data wired V1.

Implemented:

- Protected Holdings route.
- Header navigation to Holdings.
- Group filter/search.
- Backend holdings endpoint.
- Leaf-group based holdings aggregation.
- Latest and previous LTP lookup.
- Current value calculation.
- Invested value calculation.
- Average price.
- One-day gain.
- Profit/loss.
- Expense ratio / bucket cost basic calculations.
- Holdings summary cards.
- Holding cards.
- Mobile-first responsive layout.

Pending:

- Advanced sorting/filtering.
- Table view.
- Real strategic insight logic.
- Deeper rebalancer integration.
- Export support.

---

### 9. Portfolio Rebalancer Module

The Rebalancer has moved from skeleton to persisted configuration V1.

Implemented:

- Rebalancer routes.
- Rebalancer create page.
- Rebalancer list page.
- Rebalancer detail page.
- Backend schema.
- Joi validation.
- Custom validation against tradable securities and leaf groups.
- Create rebalancer API.
- Fetch rebalancer list API.
- Fetch rebalancer by ID API.
- Asset allocation rows.
- Target weight validation.
- Band and multiplier fields.
- Market-fall deployment rules.
- Asset-level and group-level rebalancer UI cards.

Still pending:

- Real current allocation integration from holdings.
- Actual drift calculation.
- Actual buy/SIP/lumpsum suggestion engine.
- Google Sheet rebalancer formula conversion into backend/frontend utility.
- Tests for rebalancer validation and formulas.

Known issue to review:

- `portfolioRebalancer.js` contains validation logic referencing `this.portfolioGroups`, but `portfolioGroups` is not currently defined in the schema. This is currently dead/unused validation and should be removed or implemented properly.
- `get_RebalancerListByUserId` filters with `isDeleted: false`, while the rebalancer schema currently uses `isActive` and does not define `isDeleted`. Align the schema/query before relying on this helper.

---

## Current Completion Estimate

There are three different completion numbers depending on scope.

| Scope | Current estimate |
|---|---:|
| Implemented portfolio analytics prototype | ~95% |
| Full personal lifetime FolioScope vision | ~82% |
| Production readiness | ~60% |

The prototype is very strong, but the full lifetime system still needs:

- Real rebalancer calculation engine.
- Rental income module.
- Backup/export.
- Audit trail.
- Tests.
- Safe sync job orchestration.
- Deployment hardening.
- Custom benchmark selection.
- UI polish.

---

## Project Structure

```txt
folioScope-main/
├── client/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── context/
│   │   ├── CustomProviders/
│   │   ├── features/
│   │   │   ├── public/
│   │   │   └── protected/
│   │   │       ├── userDashboard/
│   │   │       ├── userHoldings/
│   │   │       └── userPortfolioRebalancers/
│   │   ├── hooks/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── controllers/
│   ├── init_Scripts/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── sync_Scripts/
│   ├── sync_System/
│   ├── utils/
│   ├── package.json
│   └── server.js
├── docs/
│   └── API_REFERENCE.md
└── README.md
```

---

## Installation and Setup

### Prerequisites

- Node.js
- MongoDB
- npm

### Backend

```bash
cd server
npm install
```

Create a `.env` file.

Typical backend environment variables:

```env
PORT=3000
MONGO_URL=<mongodb_connection_string>
JWT_SECRET=<access_token_secret>
JWT_REFRESH_SECRET=<refresh_token_secret>
EMAIL_USER=<email_user>
EMAIL_PASS=<email_password>
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Start script currently needs cleanup. The current `server/package.json` still has:

```json
"dev": "echo \"Error: no test specified\" && exit 1"
```

Recommended scripts:

```json
{
  "start": "node server.js",
  "dev": "nodemon server.js",
  "test": "jest"
}
```

### Frontend

```bash
cd client
npm install
npm run dev
```

Frontend default:

```txt
http://localhost:5173
```

Backend default:

```txt
http://localhost:3000
```

---

## Known Limitations

Important current limitations:

1. No automated test suite yet.
2. Server scripts need cleanup.
3. Startup sync jobs run directly from `server.js`.
4. `DeleteGroupForm` is still a placeholder.
5. Rebalancer configuration persists, but real rebalancing calculation/suggestion engine is pending.
6. Rental income module is not implemented yet.
7. Backup/export is not implemented yet.
8. Audit trail and archive/delete policy are pending.
9. Custom benchmark selection is pending.
10. CSS Modules have grown significantly; UI system enforcement and cleanup are needed.
11. Some older code still has inconsistent naming/spelling from the learning phase.
12. `prototype.html` still exists in the active protected source tree and should eventually move to docs/design-reference.

---

## Development Priorities

Recommended next order:

1. Connect Rebalancer detail to real holdings/current allocation.
2. Convert Google Sheet rebalancer logic into JS utility.
3. Fix rebalancer schema/query inconsistencies.
4. Add tests for holdings aggregation and rebalancer formulas.
5. Fix server scripts.
6. Add backup/export before serious private deployment.
7. Deploy private version safely.
8. Decide Delete Group as archive/soft delete/delete-empty-only.
9. Add custom benchmark selection.
10. Start Rental Income V1.

---

## Why This Project Stands Out

Compared with normal fresher MERN projects, FolioScope includes:

- Historical state reconstruction.
- Financial transaction processing.
- FIFO accounting.
- NAV reconstruction.
- Portfolio hierarchy propagation.
- Holdings aggregation.
- Benchmark comparison.
- Session-aware auth.
- Rebalancer rule configuration.

This makes it closer to a private SaaS-style financial operating system than a tutorial dashboard.

---

## Disclaimer

FolioScope is a personal financial software project under active development. It is not financial advice, not a regulated investment product, and not production-hardened for public users yet.

Use real money data carefully. Backup/export, tests, and audit trails should be added before depending on it as the only financial record system.
