# Technical Requirements Document (TRD)

### 1. Tech Stack Overview
- **Framework:** Next.js
- **Deployment:** Vercel
- **Image Storage:** Vercel Blob
- **Database:** Neon PostgreSQL (Serverless)
- **Cache & Key-Value:** Upstash Redis
- **Message Queue / Cron:** Upstash QStash
- **Messaging API:** Fonnte.com (WhatsApp API)
- **Authentication:** NextAuth v4 (Installed, but implementation bypassed/disabled initially)
- **Libraries:** `xlsx` (Excel exports), `recharts` (Data visualization)

### 2. Architecture & Design Patterns
#### 2.1 Monorepo Structure
- The Main Application and Admin Panel will reside in the **same repository**.
- Separation is handled via routing: Main app on `/`, Admin panel on `/panel`.
- Authentication will eventually use distinct Google SSO keys and separate login flows for Users and Admins.
- Use Server-Side Rendering (SSR) dont make SPA 

#### 2.2 Strict Database Constraints
- **NO ORM for Runtime Queries:** You MUST use **Raw SQL queries** (e.g., via `pg` or `@neondatabase/serverless`) for all runtime application operations.
- **Drizzle Usage:** Drizzle is strictly limited to **schema migrations** and **database seeding** only. Do not use Drizzle query builder in the application code.

#### 2.3 Strict API Separation
- **No Direct DB Queries in Pages/Components:** Server Components and Client Components are strictly forbidden from querying the database directly.
- **Microservice-style Endpoints:** Every data operation must go through a dedicated route handler inside `/api/routes/...`.
- **Atomic Endpoints:** Endpoints must be highly separated (e.g., `/api/kajian/list`, `/api/kajian/create`, `/api/kajian/delete`). Do not combine multiple unrelated operations into a single endpoint.

#### 2.4 Performance & Caching
- **Next/Image:** Use `next/image` strictly for all images to leverage edge caching and optimization.
- **Redis Caching:** Utilize Upstash Redis to cache heavy queries, list endpoints (like `/api/kajian/list`), and session states to achieve zero-delay data fetching.
- **Fast Transitions:** Optimize Next.js `Link` prefetching and utilize optimistic UI updates for instant perceived load times.

#### 2.5 Infrastructure
- **Vercel Blob:** Used for storing uploaded images from the Admin Panel.
- **Upstash QStash:** Used for background jobs (e.g., delaying Fonnte WhatsApp messages, expiring pending orders).
