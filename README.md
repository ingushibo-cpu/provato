# Provato — Verified AI Talent Marketplace

Production-ready Next.js 15 monorepo connecting clients with verified AI specialists.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router, TypeScript strict) |
| API | tRPC v11 |
| Database | Prisma 5 + PostgreSQL (Railway) + pgvector |
| Auth | Clerk (SSO, OAuth) |
| Payments | Stripe Connect (Escrow) |
| Email | Resend |
| Cache | Upstash Redis |
| UI | Tailwind CSS + shadcn/ui |

## Structure

```
/apps/web          → Next.js 15 Frontend + tRPC handler
/packages/db       → Prisma schema, client, migrations, seed
/packages/api      → tRPC router (talent, project, application, review, payment)
/packages/ui       → Shared components (Button, Card, Badge, Input)
/packages/config   → Shared ESLint, TypeScript, Tailwind config
```

## Setup

### 1. Prerequisites

- Node.js 20+
- PostgreSQL with `pgvector` extension (Railway recommended)

### 2. Install dependencies

```bash
cd /Users/huskyrose/Documents/provato
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
# Fill in DATABASE_URL, Clerk keys, Stripe keys, etc.
```

### 4. Enable pgvector + push schema

```bash
cd packages/db
npx prisma db push
```

### 5. Generate Prisma client

```bash
npx prisma generate
```

### 6. Seed the database

```bash
npx tsx prisma/seed.ts
```

Seeded data:
- 8 skills (RAG, Fine-Tuning, Prompt Engineering, …)
- 5 talent profiles with verified skill scores
- 2 client users
- 3 open projects
- 1 admin user

### 7. Start dev server

```bash
cd ../..
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data Models

- **User** — Clerk-synced (TALENT | CLIENT | ADMIN)
- **TalentProfile** — Bio, hourly rate, languages, pgvector embedding
- **Skill** — Categorized AI skills
- **SkillVerification** — Scored challenge assessments (0–100, expires annually)
- **Project** — Client postings with status lifecycle
- **Application** — Talent → Project applications
- **Review** — Post-project ratings with per-skill breakdown
- **Payment** — Stripe escrow (PENDING → ESCROWED → RELEASED)

## tRPC Routes

```
talent.list         → Paginated talent browse (filter by category/score)
talent.getById      → Full talent profile
talent.updateProfile → Update own profile
project.list        → Paginated project browse
project.getById     → Full project with applications
project.create      → Create new project
project.updateStatus → Change project status
application.apply   → Apply to a project
application.listByProject → List applications for a project
application.updateStatus  → Accept/reject application
review.create       → Submit a review (auto-updates talent score)
review.listByUser   → Reviews for a user
payment.create      → Initialize escrow payment
payment.listByProject → List payments for a project
payment.updateStatus  → Update payment status (webhook target)
```
