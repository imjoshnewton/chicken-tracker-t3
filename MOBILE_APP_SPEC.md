# FlockNerd Mobile App — Implementation Spec

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Complete

---

## Phase 0: Monorepo Conversion
**Goal**: Restructure into Turborepo + bun workspaces without breaking the existing web app.

### Target Structure
```
chicken-tracker-t3/
  turbo.json
  package.json              <- workspace root
  apps/
    web/                    <- existing Next.js app (MOVED from root)
    mobile/                 <- NEW Expo app
  packages/
    api/                    <- shared tRPC AppRouter type + client helpers
    shared/                 <- types, Zod schemas, date-utils, constants
```

### Tasks
- [x] 0.1 Create root `package.json` (workspace root with `"workspaces"`)
- [x] 0.2 Create `turbo.json`
- [x] 0.3 Create `apps/` and `packages/` directories
- [x] 0.4 Move existing app into `apps/web/` (src, public, prisma, configs, .env)
- [x] 0.5 Update `apps/web/package.json` — fix name to `@flocknerd/web`
- [x] 0.6 Update `apps/web/tsconfig.json` — paths still work (baseUrl: ./)
- [x] 0.7 Update `apps/web/next.config.mjs` — add transpilePackages for `@flocknerd/*`
- [x] 0.8 Drizzle config paths unchanged (relative to apps/web/)
- [x] 0.9 Tailwind config paths unchanged (relative to apps/web/)
- [x] 0.10 Internal imports preserved (src/ relative imports still work)
- [x] 0.11 Update `.gitignore` for monorepo (turbo, expo, etc.)
- [x] 0.12 Run `bun install` at root
- [x] 0.13 Verify `bun run build` for web app works
- [x] 0.14 .env symlinked to apps/web/.env

---

## Phase 1: Shared Packages
**Goal**: Extract shared types, schemas, and utilities for cross-platform use.

### packages/api
- [x] 1.1 Create `packages/api/package.json`
- [x] 1.2 Create `packages/api/tsconfig.json`
- [x] 1.3 Create `packages/api/src/index.ts` — re-export `AppRouter`, `RouterInputs`, `RouterOutputs`

### packages/shared
- [x] 1.5 Create `packages/shared/package.json`
- [x] 1.6 Create `packages/shared/tsconfig.json`
- [x] 1.7 Create `packages/shared/src/types.ts` — User, Flock, Breed, EggLog, Expense, Task, Notification
- [x] 1.8 Create `packages/shared/src/constants.ts` — design tokens, expense categories
- [x] 1.9 Create `packages/shared/src/date-utils.ts` — formatDate, timezone helpers
- [x] 1.10 Create `packages/shared/src/index.ts` — barrel export

---

## Phase 2: Expo App Scaffold
**Goal**: Initialize Expo app with auth, tRPC, and navigation structure.

### 2.1 Initialize
- [x] 2.1 Create Expo app (SDK 54, Expo Router, tabs template)
- [x] 2.2 Install core dependencies (Clerk, tRPC, react-query, bottom-sheet, image, etc.)

### 2.2 Auth + Providers
- [x] 2.3 Set up Clerk provider in `_layout.tsx` with `expo-secure-store` token cache
- [x] 2.4 Set up tRPC provider with Clerk Bearer token in headers
- [x] 2.5 Set up React Query provider

### 2.3 Navigation
- [x] 2.6 Create navigation structure with Expo Router:
  - `(auth)/sign-in.tsx`, `(auth)/sign-up.tsx`
  - `(app)/(tabs)/_layout.tsx` — Bottom tabs: Home | Logs | Expenses | Settings
  - `(app)/(tabs)/index.tsx` — Flocks list
  - `(app)/(tabs)/logs.tsx`
  - `(app)/(tabs)/expenses.tsx`
  - `(app)/(tabs)/settings.tsx`
  - `(app)/flocks/[flockId]/index.tsx`
  - `(app)/flocks/[flockId]/edit.tsx`
  - `(app)/notifications.tsx`

---

## Phase 3: Core Screens
**Goal**: Build main CRUD screens with real tRPC data.

- [x] 3.1 Flocks List — `FlatList` with flock cards, "Add Flock" FAB
- [x] 3.2 Flock Detail/Dashboard — stats cards, breeds list, edit button
- [x] 3.3 Charts — production bar chart (7/15/30d range) + expense stacked bar chart (6/9/12mo)
- [x] 3.4 Log Eggs Modal — modal with date picker, count, breed selector, notes
- [x] 3.5 Log Expense Modal — modal with date, amount, category picker, memo
- [x] 3.6 Breed Add/Edit — form with image picker (Firebase upload TODO)
- [x] 3.7 All Logs & All Expenses — FlatList screens with data

---

## Phase 4: Secondary Screens
- [x] 4.1 Flock Edit — form + image picker + type selector
- [ ] 4.2 Flock Summary — monthly stats with share capability
- [x] 4.3 Tasks — displayed on flock detail from getFlock response
- [x] 4.4 Notifications — list with mark-as-read, unread indicator
- [x] 4.5 Settings — profile via Clerk `useUser()`, sign out
- [ ] 4.6 Breeding Planner — bird profiles, pair manager

---

## Phase 5: Server-Side Changes
**Goal**: Enable mobile app to communicate with existing tRPC backend.

- [x] 5.1 Add CORS headers to `apps/web/src/app/api/trpc/[trpc]/route.ts`
- [x] 5.2 Add OPTIONS preflight handler
- [x] 5.3 Clerk middleware already supports Bearer tokens (no changes needed)
- [x] 5.4 `getAuth(req)` works with Bearer tokens from Expo Clerk

---

## Phase 6: Build & Deploy
- [ ] 6.1 Create `eas.json` with dev/preview/production profiles
- [ ] 6.2 Configure env vars (EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY, EXPO_PUBLIC_API_URL)
- [ ] 6.3 Test EAS build for iOS
- [ ] 6.4 Test EAS build for Android
- [ ] 6.5 Set up EAS Update for OTA

---

## Component Mapping (Web -> Mobile)

| Web | Mobile |
|-----|--------|
| Radix Dialog / Vaul Drawer | React Native `Modal` (pageSheet) |
| Radix Select | Chip/pill selector (custom) |
| react-day-picker | `@react-native-community/datetimepicker` |
| chart.js | Custom bar charts (RN Views) |
| next/image | `expo-image` |
| next/link | Expo Router `Link` |
| react-hot-toast | `burnt` |
| motion | `react-native-reanimated` |
| react-icons | `@expo/vector-icons` |
| Tailwind CSS | `StyleSheet` (NativeWind available) |

---

## Design Tokens
```
Primary:    #385968
Secondary:  #84A8A3
Tertiary:   #CD7660
Accent1:    #e76f51
Accent2:    #e9c46a
Background: #FEF9F6
```

---

## Files Moved to `apps/web/`
- `src/`, `public/`, `prisma/`
- `next.config.mjs`, `tsconfig.json`, `tailwind.config.cjs`, `postcss.config.cjs`
- `drizzle.config.ts`, `.eslintrc.json`, `prettier.config.cjs`
- `components.json`, `next-env.d.ts`, `next-pwa.d.ts`
- `.env` symlinked from root

## Files Staying at Root
- `turbo.json`, root `package.json`, `.gitignore`, `.claude/`, `CLAUDE.md`
- `README.md`, `bun.lockb`
- `.git/`, `.vscode/`

## Notes
- React 19 type incompatibilities with Radix UI fixed with `as any` casts (pre-existing from package upgrade)
- `apps/mobile/app/_deprecated_tabs/` contains old template files (safe to delete)
- `.env` must be manually copied/symlinked to `apps/web/.env` (currently symlinked)
- To run mobile: `cd apps/mobile && bun run ios` (requires Expo dev client or simulator)
- To run web: `cd apps/web && bun run dev` (still on port 3002)
