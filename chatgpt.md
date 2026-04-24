````markdown
# Portfolio Management & NAV Tracking Backend

A Node.js + Express + MongoDB backend for managing hierarchical investment portfolios, executing transactions, maintaining financial snapshots, and calculating NAV-based performance across portfolio groups.

---

## Core Purpose

Most portfolio trackers fail at:

- Multi-level portfolio grouping
- Internal capital allocation tracking
- NAV-based performance measurement
- Consolidated returns across categories
- Tax and gains separation
- Hierarchical rollup calculations

This system solves that.

---

## Features

### 1. Hierarchical Portfolio Groups

Create nested structures like:

```text
My Wealth
├── Equity
│   ├── Indian Stocks
│   └── US Stocks
├── Mutual Funds
└── Debt
````

Supports:

* Parent-child groups
* Depth control
* Soft delete
* Automatic hierarchy path tracking

---

### 2. Transaction Engine

Supports:

#### Group Transactions

* Deposit
* Withdrawal
* Tax

#### Asset Transactions

* Buy
* Sell

---

### 3. NAV Performance System

Each group maintains its own NAV.

Rules:

* Deposits create units
* Withdrawals redeem units
* Market movement changes NAV
* Taxes reduce portfolio value
* NAV resets if units become zero

This isolates investment performance from cash flows.

---

### 4. Portfolio Snapshots

Tracks:

* Invested amount
* Current value
* Realized gain
* Unrealized gain
* Dividend income
* IRR / XIRR
* Yearly summaries

---

### 5. Automatic Rollups

Leaf group data rolls upward to parent groups automatically.

Parent groups receive aggregated:

* Value
* Gains
* Cash
* Taxes
* NAV

---

### 6. Asset Metadata

Supports structured asset data:

* Category
* Subcategory
* Sector
* Industry
* Class
* AMC
* Index name
* ISIN

---

### 7. Price History Engine

Supports:

* Latest market price sync
* Historical close prices
* Missing date backfill
* Price seeding

---

### 8. Authentication

Includes:

* Signup
* Login
* Logout
* Session authentication
* Passport.js support

---

## Tech Stack

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Auth

* Passport.js
* Express Session

### Validation

* Joi

### Config

* dotenv

---

## Project Structure

```text
controllers/
routes/
models/
services/
utils/
middlewares/
init_Scripts/
config/
server.js
```

---

## Main Models

* User
* PortfolioGroup
* FinancialAsset
* Trade
* GroupStatement
* NAVPerformance
* AssetPriceHistory

---

## API Routes

### User

```http
POST /signup
POST /login
GET  /logout
GET  /islogedin
```

### Portfolio Groups

```http
POST   /portfolio/:pg_id
PATCH  /portfolio/:pg_id
DELETE /portfolio/:pg_id
```

### Group Transactions

```http
POST /portfolio/:pg_id/grouptransaction
```

### Asset Trades

```http
POST /portfolio/:pg_id/trade/:a_id
```

---

## NAV Example

### Day 1 Deposit ₹10,000

NAV starts at `100`

Units issued:

```text
10000 / 100 = 100 units
```

### Day 2 Value grows to ₹11,000

```text
NAV = 11000 / 100 = 110
```

### Day 3 Deposit ₹5,500

```text
New units = 5500 / 110 = 50
```

Total units:

```text
150
```

Total value:

```text
16500
```

NAV remains cash-flow neutral.

---

## Installation

### Clone Repository

```bash
git clone <repo-url>
cd project
```

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create `.env`

```env
NODE_ENV=development
PORT=3000
MONGO_URI=your_mongodb_url
SESSION_SECRET=your_secret
```

### Run Server

```bash
npm start
```

or

```bash
node server.js
```

---

## Startup Flow

1. Database connection
2. Cache warmup
3. Init scripts
4. Price sync
5. NAV sync
6. Gap-fill jobs

---

## Use Cases

### Retail Investor

Track multiple accounts in one system.

### Family Office

Separate wealth buckets.

### Advisory Platform

Use NAV logic for client reporting.

### Long-Term Capital System

Stable core accounting engine.

---

## Recommended Improvements

### Immediate

* Swagger API docs
* Unit tests
* Docker support
* Role-based auth
* Rate limiting

### Advanced

* Benchmark comparison
* Rolling returns
* Rebalancing engine
* Tax harvesting
* Multi-currency support
* Live prices via WebSocket

---

## Security Before Production

* Secure cookies
* HTTPS
* Helmet
* CSRF protection
* Input sanitization
* Audit logs

---

## Final Assessment

This is not a CRUD toy project.

It is a portfolio ledger + NAV computation backend with real structural depth.

If maintained properly, it can become a complete wealth operating system.

```
```
