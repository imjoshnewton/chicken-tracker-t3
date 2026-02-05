# Gap Analysis: chicken-tracker-t3 vs personal-compass Architecture

## Reference Architecture (personal-compass)

The personal-compass app follows a clean three-layer architecture:

```
Database
  ↓
Repository (/src/data/*.repository.ts)     - Raw DB queries, accepts dbOrTx
  ↓
Service (/src/services/*.service.ts)        - Business logic, transactions, orchestration
  ↓
tRPC Router (/src/server/api/routers/*.ts)  - API endpoints, calls services
  ↓
Server Actions (/src/actions/*.actions.ts)  - Mutations only, wrapped with auth
  ↓
Client Components                           - useQuery for reads, useMutation for writes
```

**Key rules:**
- Pages are server components that delegate to Server Components for data loading
- Server components load data via repositories/services directly (parallel with `Promise.all`)
- Client components use tRPC `useQuery` for reads
- Mutations use server actions wrapped in `useMutation` from `@tanstack/react-query`
- NO data fetching through server actions
- shadcn UI components used consistently

---

## Gap Analysis

### GAP 1: No Repository Layer
**Current**: tRPC routers query the database directly via `ctx.db`
**Target**: Dedicated repository files in `/src/data/` with `*.repository.ts` naming

**Affected files:**
- `src/server/trpc/router/flocks.ts` - direct DB queries
- `src/server/trpc/router/logs.ts` - direct DB queries
- `src/server/trpc/router/expenses.ts` - direct DB queries
- `src/server/trpc/router/stats.ts` - direct DB queries
- `src/server/trpc/router/breeds.ts` - direct DB queries
- `src/server/trpc/router/auth.ts` - direct DB queries
- `src/lib/fetch.ts` / `src/lib/fetch-optimized.ts` - fetch helpers (proto-repositories)
- `src/app/app/server-optimized.ts` - server actions with direct DB queries

### GAP 2: No Services Layer
**Current**: Business logic is inline in tRPC routers and server actions
**Target**: Service files in `/src/services/` with `*.service.ts` naming that orchestrate repositories

**Impact**: tRPC routers should call services, not DB directly. Services handle transactions and business rules.

### GAP 3: Monolithic Server Actions
**Current**: All server actions in two large files:
- `src/app/app/server-edge.ts`
- `src/app/app/server-optimized.ts`

**Target**: Feature-specific action files in `/src/actions/`:
- `src/actions/flocks.actions.ts`
- `src/actions/logs.actions.ts`
- `src/actions/expenses.actions.ts`
- `src/actions/tasks.actions.ts`
- `src/actions/users.actions.ts`

### GAP 4: Server Actions Not Wrapped in useMutation
**Current**: Server actions called directly from onClick handlers:
```tsx
// Current pattern (DeleteButton.tsx)
onClick={async () => { await deleteExpense(id); }}
```
**Target**: Server actions wrapped in `useMutation`:
```tsx
// Target pattern
const { mutateAsync, isPending } = useMutation({
  mutationFn: () => deleteExpenseAction(id),
  onSuccess: () => { utils.expenses.invalidate(); toast.success("Deleted"); }
});
```

### GAP 5: Inconsistent Data Loading in Pages
**Current**: Mixed patterns across pages:
- Some pages do direct DB queries in server components
- Some pages pass IDs to client components that use tRPC
- `src/lib/fetch.ts` acts as a pseudo-repository but lives in lib

**Target**: Pages are thin server components that:
1. Get auth user
2. Delegate to a Server Component (e.g., `FlocksServer.tsx`) that loads data via repositories/services
3. Pass data to client components as props

### GAP 6: tRPC Client Setup Differences
**Current**: Uses `createTRPCNext()` in `/src/utils/trpc.ts` (older pattern)
**Target**: Uses `createTRPCReact()` in `/src/trpc/react.tsx` with separate server caller in `/src/trpc/server.ts`

### GAP 7: Missing shadcn Components
**Current**: Has some shadcn-style components but missing several used in personal-compass:
- Missing: `form.tsx` (react-hook-form integration), `tabs.tsx`, `tooltip.tsx`, `alert-dialog.tsx`, `dropdown-menu.tsx`, `progress.tsx`, `slider.tsx`, `chart.tsx`
- Forms don't use react-hook-form + zod pattern consistently

### GAP 8: No Auth Service Wrapper
**Current**: Auth checks scattered - `currentUsr()` in `src/lib/auth.ts`, inline checks in server actions
**Target**: Auth service with `withAuth`, `withProtectedAuth` wrappers for server actions (like `src/services/auth.service.ts` in personal-compass)

---

## Execution Plan

### Phase 1: Create Repository Layer
Extract all database queries from tRPC routers, fetch helpers, and server actions into repository files.

**Files to create:**
1. `src/data/flocks.repository.ts` - Flock CRUD queries
2. `src/data/logs.repository.ts` - Egg log queries
3. `src/data/expenses.repository.ts` - Expense queries
4. `src/data/breeds.repository.ts` - Breed queries
5. `src/data/stats.repository.ts` - Statistics/aggregation queries
6. `src/data/users.repository.ts` - User queries
7. `src/data/tasks.repository.ts` - Task queries
8. `src/data/notifications.repository.ts` - Notification queries

**Pattern to follow:**
```typescript
// src/data/flocks.repository.ts
import { db } from "@/lib/db";
import { flock, breed } from "@/lib/db/schema-postgres";
import { eq, and } from "drizzle-orm";

type DBOrTx = typeof db;

export const getFlocksByUserId = async (dbOrTx: DBOrTx, userId: string) => {
  return dbOrTx.query.flock.findMany({
    where: eq(flock.userId, userId),
    with: { breeds: true },
  });
};

export const getFlockById = async (dbOrTx: DBOrTx, flockId: string, userId: string) => {
  return dbOrTx.query.flock.findFirst({
    where: and(eq(flock.id, flockId), eq(flock.userId, userId)),
    with: { breeds: true },
  });
};

export const createFlock = async (dbOrTx: DBOrTx, data: typeof flock.$inferInsert) => {
  const [newFlock] = await dbOrTx.insert(flock).values(data).returning();
  return newFlock;
};
```

**Migration steps:**
- Extract queries from `src/lib/fetch.ts` and `src/lib/fetch-optimized.ts` into repositories
- Extract queries from each tRPC router into the corresponding repository
- Extract queries from `src/app/app/server-optimized.ts` into repositories

### Phase 2: Create Services Layer
Create service files that orchestrate repository calls, handle transactions, and contain business logic.

**Files to create:**
1. `src/services/flocks.service.ts`
2. `src/services/logs.service.ts`
3. `src/services/expenses.service.ts`
4. `src/services/breeds.service.ts`
5. `src/services/stats.service.ts`
6. `src/services/users.service.ts`
7. `src/services/tasks.service.ts`
8. `src/services/notifications.service.ts`
9. `src/services/auth.service.ts` - Auth wrappers

**Pattern to follow:**
```typescript
// src/services/flocks.service.ts
import * as flocksRepo from "@/data/flocks.repository";
import { db } from "@/lib/db";

export const getUserFlocks = async (userId: string) => {
  return flocksRepo.getFlocksByUserId(db, userId);
};

export const createFlock = async (userId: string, data: { name: string; description?: string }) => {
  return db.transaction(async (tx) => {
    const newFlock = await flocksRepo.createFlock(tx, { ...data, userId });
    return newFlock;
  });
};
```

```typescript
// src/services/auth.service.ts
type ServerAction<T extends unknown[], R> = (...args: T) => Promise<R>;

export function withAuth<T extends unknown[], R>(
  action: ServerAction<T, R>,
): ServerAction<T, R> {
  return async (...args: T) => {
    const user = await currentUsr();
    if (!user) throw new Error("Unauthorized");
    return action(...args);
  };
}
```

### Phase 3: Refactor tRPC Routers
Update all tRPC routers to call services instead of querying the database directly.

**Files to update:**
1. `src/server/trpc/router/flocks.ts`
2. `src/server/trpc/router/logs.ts`
3. `src/server/trpc/router/expenses.ts`
4. `src/server/trpc/router/stats.ts`
5. `src/server/trpc/router/breeds.ts`
6. `src/server/trpc/router/auth.ts`

**Pattern:**
```typescript
// Before (current):
getFlock: protectedProcedure
  .input(z.object({ flockId: z.string() }))
  .query(async ({ input, ctx }) => {
    return ctx.db.query.flock.findFirst({...})
  })

// After (target):
getFlock: protectedProcedure
  .input(z.object({ flockId: z.string() }))
  .query(async ({ input, ctx }) => {
    return flocksService.getFlockById(input.flockId, ctx.session.user.id);
  })
```

### Phase 4: Split and Refactor Server Actions
Break up monolithic server action files into feature-specific action files with auth wrappers.

**Files to create:**
1. `src/actions/flocks.actions.ts`
2. `src/actions/logs.actions.ts`
3. `src/actions/expenses.actions.ts`
4. `src/actions/tasks.actions.ts`
5. `src/actions/users.actions.ts`
6. `src/actions/notifications.actions.ts`

**Files to deprecate:**
- `src/app/app/server-edge.ts`
- `src/app/app/server-optimized.ts`

**Pattern:**
```typescript
// src/actions/logs.actions.ts
"use server";

import { withAuth } from "@/services/auth.service";
import * as logsService from "@/services/logs.service";
import { revalidatePath } from "next/cache";

export const deleteLogAction = withAuth(async (logId: string) => {
  const result = await logsService.deleteLog(logId);
  revalidatePath("/app/logs");
  return result;
});
```

### Phase 5: Update Client Components to Use useMutation Pattern
Refactor all mutation calls in client components to use `useMutation` from React Query.

**Files to update:**
- `src/app/app/expenses/DeleteButton.tsx`
- `src/components/flocks/LogModal.tsx` (already uses tRPC mutation - verify pattern)
- `src/components/flocks/ExpenseModal.tsx`
- Any other components calling server actions directly

**Pattern:**
```typescript
"use client";
import { deleteLogAction } from "@/actions/logs.actions";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/utils/trpc";

export function DeleteLogButton({ logId }: { logId: string }) {
  const utils = api.useUtils();

  const { mutateAsync: deleteLog, isPending } = useMutation({
    mutationFn: () => deleteLogAction(logId),
    onSuccess: () => {
      utils.logs.invalidate();
      toast.success("Log deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete log");
    },
  });

  return (
    <Button onClick={() => deleteLog()} disabled={isPending}>
      {isPending ? "Deleting..." : "Delete"}
    </Button>
  );
}
```

### Phase 6: Clean Up and Remove Legacy Files
Remove deprecated files and update imports throughout the codebase.

**Files to remove:**
- `src/app/app/server-edge.ts`
- `src/app/app/server-optimized.ts`
- `src/lib/fetch.ts`
- `src/lib/fetch-optimized.ts`
- Any `-optimized` tRPC router variants

**Files to update:**
- All import references to removed files
- Page components to ensure consistent server component pattern

---

## Priority Order

| Phase | Description | Risk | Dependencies |
|-------|-------------|------|--------------|
| 1 | Repository Layer | Low | None |
| 2 | Services Layer | Low | Phase 1 |
| 3 | Refactor tRPC Routers | Medium | Phase 2 |
| 4 | Split Server Actions | Medium | Phase 2 |
| 5 | useMutation Pattern | Low | Phase 4 |
| 6 | Clean Up Legacy | Low | Phases 3-5 |

Phases 3 and 4 can run in parallel after Phase 2 completes.
Phase 5 depends on Phase 4.
Phase 6 depends on all prior phases.
