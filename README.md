# KiranaFlow 🛒✨

> **AI-Powered FMCG Retailer Ordering App with Intelligent SKU Extraction & Fuzzy Matching**

KiranaFlow streamlines the ordering workflow between FMCG distributors and local retailers. Retailers can simply paste unformatted messages (e.g. *"10 ctn parle-g, 5 surf excel 1kg, 2 dz maggi"*), and KiranaFlow uses LLM extraction paired with Fuse.js fuzzy matching to reconcile lines against the catalog with confidence scores and top-3 suggestions.

---

## 🚀 Key Features

1. **Role-Based Authentication (NextAuth.js v5)**
   - Roles: `RETAILER` and `ADMIN`.
   - Strict tenant boundary: Retailers only see and place their own orders.
   - Distributors inspect all incoming orders across retailers and manage lifecycle statuses.

2. **AI Order Capture & Fail-Safe Fallback**
   - Single LLM call extracting `[{ rawText, quantity, unit }]` as strictly validated JSON (Zod schema).
   - Retries automatically on malformed output.
   - **Fail-safe fallback**: Automatically falls back to a regex line-item splitter if LLM is offline or times out, accompanied by a prominent warning banner.

3. **Confidence Scoring & Threshold Matching (Fuse.js)**
   - Threshold `score >= 0.85` ➔ **`matched`** (Green badge).
   - Threshold `0.5 <= score < 0.85` ➔ **`needs_review`** (Amber badge, human-readable reason & top-3 suggestions).
   - Threshold `score < 0.5` ➔ **`not_found`** (Red badge, prompts manual selection).
   - Unit normalization (`ctn` ➔ `carton`, `dz` ➔ `dozen`, `kg`, `pcs`, etc.) with missing quantity flags (no blind guesses).

4. **Review & Confirmation UX**
   - Visual review screen with color + icon + reason text.
   - **Safety lock**: Order placement button is disabled until all flagged lines are resolved. Never auto-confirms ambiguous lines.

5. **Distributor Admin Dashboard**
   - High-level KPIs (Total orders, pending count, delivered count, revenue).
   - Real-time status progression (`PENDING` ➔ `CONFIRMED` ➔ `PROCESSING` ➔ `SHIPPED` ➔ `DELIVERED` ➔ `CANCELLED`).
   - Drill-down drawer into individual order items.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript (Strict)
- **Styling**: Tailwind CSS 4
- **Database**: SQLite locally via `@prisma/adapter-better-sqlite3` (PostgreSQL-compatible schema)
- **Auth**: NextAuth.js v5 (Credentials Provider + bcrypt)
- **Validation**: Zod
- **Fuzzy Search**: Fuse.js
- **Testing**: Vitest (52 tests across 5 test suites)

---

## ⚡ Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/optimusprimeleader345/KiranaFlow.git
cd KiranaFlow
npm install --legacy-peer-deps
```

### 2. Environment Setup
```bash
cp .env.example .env
```
*(Default `.env` is pre-configured to run with local SQLite and regex fallback right out of the box).*

### 3. Database Initialization & Seeding
```bash
npm run setup
```
> Seeds 40 realistic FMCG SKUs, 8 retailers, 1 distributor admin, and 12 past orders.

### 4. Run Test Suite
```bash
npm test
```
> Runs all 52 unit and integration tests.

### 5. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Credentials

| Role | Email | Password | Scope |
|---|---|---|---|
| **Retailer** | `demo@retailer.com` | `retailer123` | Paste & AI capture orders, review flagged lines, confirm & track own orders |
| **Distributor Admin** | `admin@fmcg.com` | `admin123` | View all retailers' orders, revenue analytics, update order statuses |

---

## 🧪 Testing Outline (Vitest)

Run `npm test` to execute:
- `matcher.test.ts`: Matching thresholds (`matched`, `needs_review`, `not_found`), typos, Hinglish.
- `normalise.test.ts`: Alias normalization (`ctn`, `dz`, `kg`, etc.) and missing quantity handling.
- `pricing.test.ts`: Line total calculation, dozen 12x multiplier logic, aggregate total verification.
- `guards.test.ts`: Role-guard validation, 401 unauthenticated & 403 forbidden responses.
- `extract.test.ts`: Regex fallback line parser, semicolon/newline separators, duplicate handling, empty inputs.

---

## 📄 Documentation
- [ASSUMPTIONS.md](ASSUMPTIONS.md): Architectural decisions and scope assumptions.
- [deployment.md](deployment.md): Detailed deployment instructions, environment variable descriptions, and TDD outline.
