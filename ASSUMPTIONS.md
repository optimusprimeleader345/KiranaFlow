# Assumptions Log

All deviations, architectural details, or assumptions outside the strict brief boundaries are recorded here.

1. **LLM Provider & Configuration**:
   - Provider assumes OpenAI-compatible Chat Completions endpoint (`https://api.openai.com/v1/chat/completions`).
   - Configurable strictly via environment variables `OPENAI_API_KEY` and `OPENAI_MODEL` (default: `gpt-4o-mini`).
   - If `OPENAI_API_KEY` is invalid, times out (15s), or fails after 1 retry, falls back gracefully to a robust regex line-item extractor and flags `aiFailed = true` with a prominent user-facing warning banner.

2. **Currency & Localization**:
   - Currency is Indian Rupee (₹). No dynamic FX conversions are needed for local FMCG distribution.
   - Price calculations are bounded to 2 decimal places to prevent floating-point rounding drifts.

3. **Units & Dozen Multiplier**:
   - Units canonicalized: `carton` (from ctn/case/box), `dozen` (from dz/dzn/12), `pcs` (from pc/unit/packet/nos), `kg` (from kgs/kilogram), `g` (from gm/grams), `litre` (from ltr/l), and `ml`.
   - When a product is ordered with unit `dozen`, total pricing applies a 12x multiplier against unit piece rate if the product standard unit is piece/unit.

4. **Authentication & Session Tokens**:
   - Handled via NextAuth / Auth.js Credentials provider with bcrypt-hashed passwords.
   - JWT session strategy without database session store overhead, keeping API routes lean and fast.
   - Server-side role checks (`RETAILER` vs `ADMIN`) are enforced on every route handler and layout segment.

5. **Order Flow & Draft Lifecycle**:
   - Orders are never persisted to the database in draft mode. Saving only happens on explicit confirmation from the retailer after resolving flagged lines.
   - Flagged lines (`needs_review` or `not_found`, or missing quantity) disable the "Place Order" button until resolved or manually chosen via the suggestion picker.

6. **Fuzzy Matching Calibration**:
   - Fuse.js returns score in `[0, 1]` where 0 is exact match.
   - Inverted to `matchScore = 1 - fuseScore`:
     - `>= 0.85`: `matched`
     - `0.5 .. 0.85`: `needs_review` (suggests top 3 SKU options with human-readable reason)
     - `< 0.5`: `not_found` (prompts manual product pick)
