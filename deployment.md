# Deployment & Operations Guide

## 1. Local Setup & Run

### Prerequisites
- Node.js >= 18 (Tested on Node.js v22)
- npm >= 9

### Step-by-Step Execution
1. **Clone repository and enter project root**:
   ```bash
   cd isocode
   ```

2. **Configure environment variables**:
   Create `.env` by copying from `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

4. **Initialize & Seed Database**:
   ```bash
   npm run setup
   # Or manually:
   # npx prisma generate
   # npx prisma db push
   # npx tsx prisma/seed.ts
   ```

5. **Run test suite**:
   ```bash
   npm test
   ```

6. **Start development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 2. Environment Variables

Only reference environment variable **names** (never commit real secrets):

| Variable | Description | Example / Default |
|---|---|---|
| `DATABASE_URL` | Database connection string | `file:./prisma/dev.db` (local) or `postgresql://...` (prod) |
| `NEXTAUTH_SECRET` | Secret key used to encrypt Auth.js JWTs | 32+ character random string |
| `NEXTAUTH_URL` | Canonical root URL of the application | `http://localhost:3000` |
| `OPENAI_API_KEY` | OpenAI API key for order text extraction | `sk-...` |
| `OPENAI_MODEL` | OpenAI chat completion model name | `gpt-4o-mini` |

---

## 3. Demo Logins

Pre-seeded credentials with realistic FMCG catalog data:

### Retailer Role
- **Email**: `demo@retailer.com`
- **Password**: `retailer123`
- *Capabilities*: Natural language / paste order capture, line-by-line review & suggestion picking, explicit order confirmation, viewing own past orders.

### Distributor Admin Role
- **Email**: `admin@fmcg.com`
- **Password**: `admin123`
- *Capabilities*: View all orders across all retailers, filter & view order lines, update order statuses (PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED).

---

## 4. Production Deployment (Vercel / Container / Cloud)

1. **Database**:
   - Provision a PostgreSQL database (Neon, Supabase, AWS RDS, or Railway).
   - In `prisma/schema.prisma`, update datasource provider from `sqlite` to `postgresql` when migrating to Postgres.
   - Run `npx prisma db push` or `npx prisma migrate deploy` in your CI/CD pipeline.
2. **Environment Variables**:
   - Set all 5 environment variables from the table above in your hosting platform dashboard.
3. **Build & Start**:
   ```bash
   npm run build
   npm run start
   ```

---

## 5. TDD & Architecture Outline

- **Unit Normalizer & Parser** (`lib/units/normalise.ts`):
  - Normalizes informal retailer abbreviations (`ctn`, `dz`, `kgs`, `pcs`) to canonical units.
  - Flags missing quantity instead of guessing, preventing unintended inventory or financial liability.
- **AI Extraction & Resilient Fallback** (`lib/ai/`):
  - Strictly structured JSON output via Zod schema (`ExtractedLineSchema`).
  - Automatic single retry on malformed JSON / validation mismatch.
  - Fail-safe regex parser fallback with visible UI warning banner (`AIBanner`) when LLM is unavailable or offline.
- **Fuzzy Matcher & Confidence Thresholds** (`lib/matching/`):
  - Fuse.js searching SKU, item name, and synonym aliases.
  - Threshold `score >= 0.85` -> `matched` (green indicator).
  - Threshold `0.5 <= score < 0.85` -> `needs_review` (amber indicator, top-3 SKU suggestions).
  - Threshold `score < 0.5` -> `not_found` (red indicator, prompts manual selection).
- **Pricing & Calculation Logic** (`lib/pricing/`):
  - Total line item prices, dozen multipliers, order total aggregates.
- **Role Guards & Route Security** (`lib/auth/`):
  - Defense-in-depth: Route-level server authentication & role inspection (`withAuth`, `requireRole`, `checkRole`).
  - Strict tenant boundary: Retailers can strictly only query and view their own orders.
