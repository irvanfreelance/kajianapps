# AI Agent Technical Guidelines
**TARGET:** Cursor, Windsurf, Copilot, or any AI coding assistant modifying this repository.

### CRITICAL RULES (MUST FOLLOW)

1. **NO ORM FOR DATA FETCHING:**
   - DO NOT write Drizzle queries inside application logic. 
   - ALWAYS write RAW SQL queries using the standard Postgres driver.
   - Example: `await sql\`SELECT * FROM users WHERE id = ${id}\``
   - Drizzle is ONLY allowed in `schema.ts`, `/migrations`, and `/seed` files.

2. **STRICT API ROUTE SEPARATION:**
   - DO NOT write direct database queries inside React Server Components (`page.tsx`, `layout.tsx`).
   - ALL database interactions MUST be exposed as highly separated REST API routes inside `/api/...` (e.g., `/api/products/get`, `/api/products/update`).
   - Pages must use `fetch()` or a fetching library to call these APIs.

3. **ROUTING & MONOREPO ARCHITECTURE:**
   - Main user application operates on `/` and its subdirectories.
   - Admin panel strictly operates on `/panel` and its subdirectories.
   - Maintain shared generic components in `/components/ui` but keep domain-specific components separate (e.g., `/components/admin` vs `/components/client`).

4. **PERFORMANCE FIRST:**
   - Ensure zero-delay transitions. Use React concurrent features and optimistic updates.
   - ALWAYS use `next/image` for images, never raw `<img>` tags, to ensure Vercel edge caching.
   - Implement Upstash Redis caching for read-heavy API routes.

5. **AUTHENTICATION:**
   - `next-auth` v4 is installed. DO NOT implement the actual auth lock yet. Keep the login flow simulated until further notice.
   - Ensure architecture supports 2 separate Google SSO credentials (one for User, one for Admin).
