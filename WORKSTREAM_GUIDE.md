# Flock View Refactoring Workstreams

This project has been set up with 3 parallel workstreams to explore different approaches to refactoring the flock view component.

## Quick Start

Each workstream is in its own subdirectory with all necessary files copied:

```bash
# Workstream 1 (Port 3003) - Component Structure
cd workstream-1
npm install
claude code .
npm run dev

# Workstream 2 (Port 3004) - State Management
cd workstream-2
npm install
claude code .
npm run dev

# Workstream 3 (Port 3005) - Performance
cd workstream-3
npm install
claude code .
npm run dev
```

## Workstream Overview

### Workstream 1: Component Structure (Port 3003)
**Focus**: Breaking down monolithic components into smaller, reusable pieces
- Extract FlockHeader, FlockStats, FlockActions components
- Implement compound component patterns
- Create clear component hierarchy

### Workstream 2: State Management (Port 3004)
**Focus**: Implementing better state management patterns
- Add Zustand for local state management
- Optimize tRPC query patterns
- Implement optimistic updates

### Workstream 3: Performance (Port 3005)
**Focus**: Optimizing for speed and efficiency
- Add memoization strategies
- Implement code splitting
- Optimize images and bundle size

## Key Files to Refactor

All workstreams should focus on these files:
- `/src/app/app/flocks/[flockId]/page.tsx`
- `/src/app/app/flocks/[flockId]/Flock.tsx`
- `/src/components/flocks/*`
- `/src/components/breeds/*`

## Working with Claude Code

In each workstream directory, you can:

1. Open Claude Code:
   ```bash
   claude code .
   ```

2. Ask Claude to implement the refactoring plan:
   ```
   "Please read REFACTOR_PLAN.md and start implementing the refactoring tasks for this workstream"
   ```

3. Test your changes:
   ```bash
   npm run dev
   ```

## Comparing Results

After refactoring in each workstream:

1. Compare bundle sizes:
   ```bash
   npm run build
   ```

2. Run Lighthouse tests on each port

3. Compare code complexity and maintainability

4. Choose the best approaches from each workstream to merge

## Notes

- Each workstream is independent - changes in one don't affect others
- All workstreams share the same database (be careful with data mutations)
- The main branch remains untouched during refactoring
- Each workstream can be committed and pushed to its own branch