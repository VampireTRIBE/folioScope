# FolioScope

FolioScope is a MERN-based private wealth-management and portfolio analytics system built to manage personal money decisions with better accuracy than a spreadsheet-only workflow.

It started as a Google Sheet portfolio system, but the Google Sheet approach had an important limitation: deposits and withdrawals distorted daily return tracking. FolioScope solves this with NAV-based tracking, cashflow-aware analytics, portfolio hierarchy, trade accounting, holdings aggregation, XIRR, drawdown, benchmark comparison, and a Rebalancer decision engine.

> Primary goal: reliable personal money management.  
> SaaS/commercial use is not the primary goal right now.

---

## Latest Inspected Status

Latest inspected zip:

```txt
updated folioScope-main.zip
```

Latest assessment status:

| Area | Status |
|---|---:|
| Implemented portfolio analytics prototype | ~98.5% complete |
| Full personal FolioScope vision | ~89% complete |
| Production readiness | ~75% complete |
| Backend Jest tests | 51 suites / 343 tests passing |
| Client production build | Passing |
| Relative import scan | 0 unresolved imports |
| Server syntax check | 0 syntax errors |
| Server npm audit | 0 vulnerabilities |
| Client npm audit | 7 vulnerabilities remaining |
| Client lint | Failing with 59 problems |
| Main goal | Personal financial operating system |

Current project label:

```txt
Advanced private financial operating system with meaningful backend automated test protection.
```

---

## Why FolioScope Exists

Broker apps and simple spreadsheets usually show current value, P/L, and day change. FolioScope was built to answer deeper personal-investing questions:

- What is my real cashflow-adjusted portfolio return?
- Are deposits/withdrawals distorting my performance tracking?
- What is my real portfolio drawdown?
- Is my portfolio beating or lagging a benchmark?
- Which assets/groups are overweight or underweight?
- Where should my SIP go?
- Should I deploy lumpsum during a market fall?
- Can I track my portfolio using my own rules instead of emotional decisions?

The core idea is not only tracking. It is decision support.

---

## Core Features

### Portfolio Hierarchy

- Multi-level portfolio groups
- Parent/child group structure
- Leaf-group validation
- Group metadata
- Group-level cash and snapshot data
- Soft-delete backend support
- Consolidated group analytics

### Trade & Transaction Engine

- Buy transactions
- Sell transactions
- Dividend transactions
- Group deposits
- Withdrawals
- Tax payments
- FIFO accounting
- Sell quantity guard
- Cash updates
- Ledger/group statements
- Future NAV sync after trade

### NAV System

- NAV-based portfolio tracking
- NAV gap filling
- Future NAV reconstruction
- Group NAV updates
- Cashflow-adjusted performance
- Deposit/withdrawal separation from investment return
- Drawdown/stress-test foundation

### Holdings

- Holdings endpoint
- Leaf-group holdings aggregation
- Latest and previous LTP lookup
- Current value
- Invested value
- Average price
- One-day gain
- P/L
- Expense-ratio/bucket-cost basic logic
- Summary cards and holding cards

### Analytics

- XIRR / IRR helpers
- Group XIRR
- Price drawdown
- NAV comparison
- XIRR comparison
- Rolling return comparison
- Benchmark comparison cards
- Excess return / excess drawdown

### Rebalancer

- Rebalancer creation flow
- Rebalancer list and detail pages
- Target allocation
- Cash reserve selection
- Current allocation calculation
- Drift calculation
- SIP score
- Lumpsum score
- SIP/lumpsum amount distribution
- Market-fall deployment rules
- Benchmark fall calculation
- Asset fall calculation
- Deployment score and deploy amount per asset
- Active-only rebalancer helper fixed
- Rebalancer Jest tests added

---

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS Modules / CSS
- Redux Toolkit
- React Redux
- TanStack Query
- Lightweight Charts
- Axios
- React Router

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcrypt
- Joi
- Nodemailer
- Axios
- Handlebars

### Testing

- Jest
- Backend unit tests
- Backend mocked integration-style tests
- Backend route/e2e behavior tests started

---

## Current Codebase Health

| Check | Result |
|---|---:|
| Backend Jest | 51 suites / 343 tests passing |
| Client build | Passing |
| Server syntax | 0 syntax errors |
| Relative imports | 0 unresolved |
| Server audit | 0 vulnerabilities |
| Client audit | 7 vulnerabilities |
| Client lint | 59 problems |

Client build passes, but lint and client dependency cleanup are still needed before polished deployment.

---

## Main Backend Route Mounts

```js
app.use("/", userRoute);
app.use("/", publicRoute);
app.use("/price", priceRangeRoute);
app.use("/analytic", analyticsRoute);
app.use("/admin/dataseeders", adminRoute);
app.use("/portfolio", portfolioRoute);
```

Test routes are gated through `enableTestRoutes` and are not exposed by default.

---

## Project Structure

```txt
folioScope-main/
├── client/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── context/
│   │   ├── features/
│   │   │   ├── protected/
│   │   │   └── public/
│   │   ├── hooks/
│   │   └── utils/
│   └── package.json
│
├── server/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── sync_Scripts/
│   ├── sync_System/
│   ├── test/
│   └── utils/
│
└── docs/
```

---

## Setup

### Backend

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Backend scripts:

```json
{
  "dev": "nodemon server.js",
  "start": "node server.js",
  "test": "jest"
}
```

### Frontend

```bash
cd client
npm install
npm run dev
```

Build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

---

## Environment Variables

`server/.env.example` exists and includes:

```txt
PORT=3000
DB_URL=mongodb://127.0.0.1:27017/folioscope
JWT_SECRET=replace_with_a_strong_secret
MAIL_USER=your_email@example.com
MAIL_PASSWORD=your_email_app_password
APPSCRIPT_SEEDER_URL=https://script.google.com/macros/s/your-script-id/exec
APPSCRIPT_SEEDER_API_KEY=replace_with_apps_script_key
```

---

## Testing

Run backend tests:

```bash
cd server
npm test
```

Latest result:

```txt
Test Suites: 51 passed, 51 total
Tests: 343 passed, 343 total
```

Current testing coverage includes:

- Rebalancer
- Market-fall deployment
- Trade actions
- Portfolio controllers
- Group statements
- Portfolio trade controllers
- Holdings read model
- Fill missing NAVs
- Sync portfolio
- Update group NAV
- XIRR group
- NAV comparison
- XIRR comparison
- Rolling returns comparison
- Drawdown
- IRR helper
- Auth middleware
- Token rotation
- Password reset
- Verification service
- Apps Script service
- Validation utilities
- Model tests
- Public data controllers
- Admin controllers
- App route behavior

---

## What Is Still Pending

### High Priority

- Rebalancer verification against Google Sheet
- Trade → NAV → Holdings full integration tests
- Deposit/withdrawal NAV correctness tests
- Backup/export
- Client dependency vulnerabilities
- Client lint cleanup

### Medium Priority

- Rebalancer edit/update
- Rebalancer archive/delete
- Custom benchmark selection
- Frontend automated tests
- Deployment checklist
- Production logging/monitoring
- Safer background job handling

### Later

- Rental Income module as separate Next.js + TypeScript app
- Audit trail
- More SaaS-like UI polish if needed
- Public/commercial hardening if ever required

---

## Rental Income Direction

The current plan is not to add Rental Income directly into the existing React/Vite FolioScope UI.

Planned direction:

```txt
Same MongoDB database
Separate Next.js + TypeScript rental-income app
Loose integration with FolioScope through summary APIs
```

This keeps FolioScope focused while allowing Next.js, TypeScript, and modular architecture learning.

---

## Reliability Status

Current private-use reliability:

```txt
Around 80% reliable for controlled personal use.
```

The system is now manually verified plus backend-test protected. The remaining reliability blockers are backup/export, deeper integration tests, Rebalancer Google Sheet verification, client lint cleanup, and client dependency cleanup.

---

## Peer-Level Assessment

Compared with an average MERN fresher project, FolioScope is far ahead in complexity and domain depth.

Average fresher projects usually contain:

```txt
login
CRUD
basic dashboard
forms
MongoDB APIs
simple CSS
```

FolioScope contains:

```txt
portfolio hierarchy
trade engine
FIFO accounting
NAV reconstruction
cashflow-aware performance
holdings aggregation
XIRR
drawdown
NAV comparison
XIRR comparison
rolling returns
public securities cache
session-aware auth
rebalancer rules
SIP/lumpsum scoring
market-fall deployment
343 backend tests
passing client production build
```

Current level:

```txt
Advanced fresher / early-junior execution.
Junior+ backend/domain complexity.
Production maturity still developing.
```

---

## Practical Next Steps

```txt
1. Verify Rebalancer output against Google Sheet.
2. Add trade → NAV → holdings integration tests.
3. Add deposit/withdrawal NAV correctness tests.
4. Add backup/export.
5. Fix client dependency vulnerabilities.
6. Fix client lint errors/warnings.
7. Add deployment checklist and env checks.
8. Add custom benchmark selection later.
9. Start Rental Income separately with Next.js + TypeScript after core stabilizes.
```

---

## Project Philosophy

FolioScope is decision-driven.

No feature should be added unless it improves:

- money-decision accuracy
- allocation discipline
- portfolio survival
- risk visibility
- data safety
- long-term maintainability

The goal is not to add random SaaS features. The goal is to manage personal money better.
