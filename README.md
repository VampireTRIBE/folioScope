# FolioScope

FolioScope is a full-stack wealth management and market analytics application built with the MERN stack. It is designed to track investment portfolios, manage hierarchical portfolio groups, process buy/sell/dividend transactions, reconstruct NAV history, analyze security price behavior, and display market data through a React-based interface.

The project is not a simple portfolio dashboard. It focuses on financial state computation, portfolio synchronization, historical data reconstruction, and analytical market views.

> **Project Status:** Advanced prototype under active development. Core architecture and analytics systems are implemented, while production hardening, automated testing, deployment workflows, and UI polish are still in progress.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Core Modules](#core-modules)
- [API Overview](#api-overview)
- [Environment Variables](#environment-variables)
- [Installation and Setup](#installation-and-setup)
- [Project Structure](#project-structure)
- [Current Development Status](#current-development-status)
- [Known Limitations](#known-limitations)
- [Future Improvements](#future-improvements)
- [Disclaimer](#disclaimer)

---

## Overview

FolioScope is built to solve a real portfolio-management problem: tracking assets, transactions, historical prices, portfolio NAV, benchmark performance, and market movement in one system.

The application supports multiple financial asset classes such as stocks, ETFs, mutual funds, indices, and other securities. It includes backend systems for asset metadata, historical price ingestion, portfolio group hierarchy, transaction ledgers, FIFO lot tracking, NAV snapshots, and analytical computations.

On the frontend, FolioScope provides public market views, security dashboards, price charts, market discovery sections, authentication flows, and protected user portfolio areas.

---

## Key Features

### Portfolio Management

- Hierarchical portfolio group structure
- Root and child portfolio groups
- Group-level cash and NAV tracking
- Buy, sell, and dividend transaction support
- Group transaction support such as deposit, withdrawal, and tax entries
- Portfolio state synchronization after transactions
- Current portfolio value and historical performance tracking

### Transaction Engine

- FIFO-based lot tracking
- Realized gain calculation
- STCG and LTCG classification logic
- Dividend handling
- Cash balance updates
- Asset quantity updates
- Transaction ledger creation
- Parent group value propagation

### Market Data System

- Asset classification system
- Asset metadata management
- Historical price storage
- Current price synchronization
- Google Apps Script based external data integration
- Market discovery sections for stocks, ETFs, and mutual funds
- Gainers, losers, 52-week high, and 52-week low analysis

### Analytics Engine

- Drawdown analysis
- Price range analysis
- Benchmark comparison
- Rolling return comparison
- NAV comparison
- XIRR comparison structure
- Portfolio drift and rebalance-related computations
- Historical reconstruction and missing NAV filling

### Authentication System

- User signup and login
- Email verification flow
- OTP-based password reset flow
- Access token and refresh token system
- Refresh token rotation
- Session persistence
- Logout from current session
- Logout from all sessions
- Request validation using Joi

### Frontend Interface

- React + Vite frontend
- Public homepage with market sections
- Security dashboard with metadata, chart, and analysis sections
- Lazy-loaded price chart rendering
- React Query based server-state fetching
- Redux Toolkit based UI-state management
- Reusable cards, badges, buttons, layouts, and request-status components
- Vanilla CSS and CSS Modules based styling

---

## Tech Stack

### Frontend

- React
- Vite
- React Router DOM
- Redux Toolkit
- React Redux
- TanStack React Query
- Axios
- Lightweight Charts
- CSS Modules
- Vanilla CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Joi
- Nodemailer
- Cookie Parser
- CORS
- Dotenv
- Axios
- Handlebars

### External Integration

- Google Apps Script for market data and price updates

---

## System Architecture

FolioScope follows a layered architecture:

```txt
Frontend React App
        |
        | HTTP Requests
        v
Express API Layer
        |
        | Controllers
        v
Service / Domain Logic
        |
        | Aggregations / Computation / Validation
        v
MongoDB Data Layer
        |
        | Sync Scripts / External Data Fetching
        v
Google Apps Script / Market Data Source
```

The system is designed around financial state changes. A transaction does not only create a database entry. It may also affect asset quantity, cash balance, FIFO lots, realized gains, NAV history, group snapshots, and parent portfolio state.

---

## Backend Architecture

The backend is organized around domain responsibilities.

### Main Backend Areas

- `controllers/users` - authentication, verification, password reset, token rotation
- `controllers/portfolio` - portfolio groups, group statements, trade execution
- `controllers/publicDataView` - public market and security data APIs
- `controllers/analytic` - price and security analytics APIs
- `controllers/admin` - asset classification, metadata, and price history seeders
- `models` - MongoDB schemas for users, assets, portfolio groups, ledgers, sessions, and market data
- `routes` - Express route definitions
- `sync_Scripts` - portfolio synchronization and derived computation systems
- `sync_System` - system bootup, current price sync, and portfolio sync orchestration
- `utils/mongodb/aggregations` - reusable MongoDB aggregation pipelines and read models
- `utils/shared/tools/computationFormula` - financial computation utilities
- `utils/validations` - Joi and content validation systems
- `utils/authentication` - token, session, email, and auth helper utilities

---

## Frontend Architecture

The frontend is organized using a feature-based structure.

### Main Frontend Areas

- `features/public/home` - homepage, market sections, about section, service section, advertisements
- `features/public/securityDashboard` - security overview, price chart, metadata, and analysis views
- `features/public/login` - login flow
- `features/public/signup` - signup flow
- `features/public/emailverification` - email verification flow
- `features/public/otpSubmit` - OTP verification flow
- `features/public/sendOTPMail` - forgot password OTP request flow
- `features/public/confirmPassword` - password reset confirmation flow
- `features/protected/userDashboard` - protected portfolio dashboard area
- `components/layout/public` - reusable public layout components
- `components/UI` - buttons, inputs, labels, and shared UI primitives
- `app/subRoutes` - route configuration
- `context` - authentication context
- `styles` - global and shared styles

The frontend separates market data based on volatility and rendering cost. For example, security metadata, current price, historical price range, and drawdown analysis are fetched through separate hooks and endpoints.

---

## Core Modules

### 1. Portfolio Group System

FolioScope supports a tree-like portfolio structure where a user can create portfolio groups and subgroups. Portfolio-level metrics can be propagated from child groups to parent groups.

### 2. Trade Processing System

The trade engine processes buy, sell, and dividend transactions. It updates portfolio cash, asset quantity, FIFO lots, realized gains, and transaction ledgers.

### 3. NAV Reconstruction System

The system can backfill missing NAV values and reconstruct portfolio performance history using available price and portfolio-state data.

### 4. Market Analytics System

The public market module provides structured security views, including top securities, price movement, drawdown analysis, and 52-week high/low proximity.

### 5. Authentication and Session System

The authentication module includes email verification, OTP password reset, JWT-based access tokens, refresh token rotation, and session tracking.

---

## API Overview

### User and Authentication Routes

Base path: `/`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/signup` | Register a new user |
| POST | `/sendverificationemail` | Send verification email |
| POST | `/verifyemail` | Verify email token |
| POST | `/login` | Login user |
| POST | `/refreshtoken` | Rotate access token using refresh token |
| POST | `/forgotpassword` | Send password reset OTP |
| POST | `/verifyotp/:email` | Verify OTP |
| POST | `/confirmpassword/:email` | Confirm new password |
| POST | `/logoutuser` | Logout current session |
| POST | `/logoutalluser` | Logout all sessions |

### Public Market Routes

Base path: `/`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/allsecuritieslist` | Fetch all securities list |
| GET | `/defaultmetadata` | Fetch default market metadata |
| GET | `/top/securities` | Fetch today's top securities |
| GET | `/security/:securityId` | Fetch security overview |

### Price Routes

Base path: `/price`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/:securityId` | Fetch price range data for a security |

### Analytics Routes

Base path: `/analytic`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/drawdown/:securityId` | Fetch drawdown analytics for a security |

### Portfolio Routes

Base path: `/portfolio`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/:pg_id` | Create child portfolio group |
| PATCH | `/:pg_id` | Update portfolio group |
| DELETE | `/:pg_id` | Delete portfolio group |
| POST | `/:pg_id/grouptransaction` | Add deposit, withdrawal, or tax transaction |
| POST | `/:pg_id/trade/:a_id` | Execute buy, sell, or dividend transaction |

### Admin Data Seeder Routes

Base path: `/admin/dataseeders`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/seedclassification` | Seed or update asset classification data |
| POST | `/seedassetmetadata` | Seed or update asset metadata |
| POST | `/seedpricehistory` | Insert historical price data |

---

## Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=3000
DB_URL=mongodb://127.0.0.1:27017/folioscope
JWT_SECRET=your_jwt_secret
MAIL_USER=your_email@example.com
MAIL_PASSWORD=your_email_app_password
APPSCRIPT_SEEDER_URL=your_google_apps_script_url
APPSCRIPT_SEEDER_API_KEY=your_apps_script_api_key
```

> Use strong secrets in production. Do not commit `.env` files to GitHub.

---

## Installation and Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd folioScope-main
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Configure Backend Environment

Create a `.env` file in the `server` folder and add the required environment variables.

### 4. Start Backend Server

```bash
node server.js
```

The backend runs on:

```txt
http://localhost:3000
```

### 5. Install Frontend Dependencies

Open a new terminal:

```bash
cd client
npm install
```

### 6. Start Frontend Development Server

```bash
npm run dev
```

The frontend runs on the Vite development server, usually:

```txt
http://localhost:5173
```

---

## Available Frontend Scripts

Inside the `client` directory:

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run build` | Create production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |

---

## Project Structure

```txt
folioScope-main/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── APIs/
│   │   ├── app/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── context/
│   │   ├── features/
│   │   │   ├── public/
│   │   │   └── protected/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── init_Scripts/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── sync_Scripts/
│   ├── sync_System/
│   ├── test/
│   ├── utils/
│   ├── package.json
│   └── server.js
│
├── README.md
└── LICENSE.txt
```

---

## Current Development Status

### Implemented

- Backend API structure
- User authentication flows
- Email verification and OTP reset flows
- Session and refresh token handling
- Asset metadata and classification systems
- Public market data APIs
- Security overview APIs
- Price range APIs
- Drawdown analytics API
- Portfolio group structure
- Trade execution system
- FIFO lot tracking
- NAV gap filling and synchronization logic
- React public homepage
- React security dashboard
- Market discovery sections
- React Query based data fetching
- Redux Toolkit based UI-state management

### In Progress

- Protected user dashboard completion
- UI consistency improvements
- Responsive design refinement
- Error and loading state standardization
- Production-ready job orchestration
- Test coverage for financial logic

---

## Known Limitations

- Automated testing is currently limited.
- Production monitoring and observability are not fully implemented.
- Some long-running sync jobs are executed during server startup and should later be moved to a scheduler or job queue.
- Protected dashboard UI is still less mature than the public market and security sections.
- Styling is currently built with vanilla CSS and CSS Modules. A stronger design-token system is needed as the project scales.
- Route-level authentication should be consistently standardized across protected backend routes.

---

## Future Improvements

- Add unit tests for financial computation utilities
- Add integration tests for portfolio transactions
- Add test coverage for refresh-token rotation and session handling
- Move sync tasks into scheduled jobs or queue-based workers
- Add structured logging and monitoring
- Improve protected portfolio dashboard UI
- Add portfolio analytics visualizations
- Add better mobile responsiveness
- Add deployment configuration
- Improve README diagrams and architecture documentation
- Standardize naming conventions across folders and files

---

## Suggested Testing Roadmap

High-priority tests to add:

```txt
drawdown.test.js
priceRange.test.js
fillMissingNavs.test.js
tradeBuySell.test.js
fifoLot.test.js
tokenRotation.test.js
portfolioSnapshot.test.js
```

These tests are important because financial systems can produce incorrect outputs silently if analytical logic is not verified.

---

## Disclaimer

FolioScope is a software project for portfolio tracking, analytics, and learning purposes. It does not provide financial advice. Any investment-related calculations or analytics should be independently verified before being used for real financial decisions.

---

## Author

Built as a full-stack wealth management and financial analytics project using React, Node.js, Express, MongoDB, and custom portfolio computation logic.
