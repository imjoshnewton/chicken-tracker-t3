# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Development
- **Start dev server**: `npm run dev` (runs on port 3002)
- **Build**: `npm run build`
- **Start production**: `npm run start`
- **Lint**: `npm run lint`

### Database Commands
- **Generate Prisma client**: `prisma generate` (runs automatically after npm install)
- **Generate Drizzle migrations**: `npm run migrations:generate`
- **Run migrations**: `npm run push` (runs migrate.ts)
- **Drop migrations**: `npm run migrations:drop`
- **Introspect DB**: `npm run db:pull`
- **Push to DB**: `npm run db:push`
- **Drizzle Studio**: `npm run db:studio`
- **Check DB**: `npm run db:check`

## Application Architecture

This is a T3 Stack application with Next.js 14 App Router using:
- **Frontend**: Next.js with App Router, React, Tailwind CSS
- **Authentication**: Clerk (for auth flow)
- **Database**: MySQL via PlanetScale with both Prisma and Drizzle ORM
- **API Layer**: tRPC for type-safe API routes
- **State Management**: React Query (via tRPC)
- **PWA**: next-pwa for progressive web app functionality

## Key Architecture Components

### Database Schema
- Dual ORM setup: Prisma for schema definition, Drizzle for queries
- Tables prefixed with `flocknerd_` in Drizzle
- Key models: User, Flock, Breed, EggLog, Expense, Task, Notification
- PlanetScale MySQL with Prisma relation mode

### Authentication
- Clerk integration for user authentication
- Users are synced to database via clerkId
- Protected procedures in tRPC check for auth and database user

### API Structure
- tRPC routers in `/src/server/trpc/router/`: auth, breeds, expenses, flocks, logs, stats
- Public REST endpoints for Home Assistant integration:
  - `/api/eggs` - Today's egg count
  - `/api/eggs/stats` - Egg statistics (today, yesterday, week, month)
  - `/api/eggs/history` - Historical egg data

### File Organization
- `/src/app/` - Next.js App Router pages
- `/src/app/(site)/` - Public site pages
- `/src/app/app/` - Authenticated app pages
- `/src/components/` - Reusable React components
- `/src/server/` - Server-side code (tRPC, DB)
- `/src/lib/` - Shared utilities and configurations

### Key Technologies
- TypeScript for type safety
- Next.js App Router with server components
- tRPC for type-safe APIs
- Drizzle ORM for database queries with SQL-like syntax
- Prisma for schema management
- Clerk for authentication
- Tailwind CSS for styling
- Chart.js for data visualization

## Environment Configuration

Required environment variables:
- `DATABASE_URL` - PlanetScale connection string
- `DB_URL` - Alternative DB connection for Drizzle
- Clerk environment variables for authentication
- Firebase configuration (for legacy features)

## Important Notes
- Application tracks chicken flocks, egg production, and expenses
- Uses both server and edge runtimes for different routes
- PWA capabilities for mobile experience
- Timezone handling is critical - dates are stored/compared in UTC