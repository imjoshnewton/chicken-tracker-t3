# Flock Refactoring Workstreams Setup

This guide helps you set up 3 independent workstreams for refactoring the flock view component.

## Setup Instructions

1. **Navigate to the parent directory:**
   ```bash
   cd /Users/joshnewton/Development
   ```

2. **Run the setup script:**
   ```bash
   ./chicken-tracker-t3/setup-workstreams.sh
   ```

   This will create 3 directories:
   - `chicken-tracker-refactor-1` (port 3003)
   - `chicken-tracker-refactor-2` (port 3004)
   - `chicken-tracker-refactor-3` (port 3005)

3. **Open Claude Code in each workstream:**

   For Workstream 1:
   ```bash
   cd chicken-tracker-refactor-1
   npm install
   claude-code .
   ```

   For Workstream 2:
   ```bash
   cd chicken-tracker-refactor-2
   npm install
   claude-code .
   ```

   For Workstream 3:
   ```bash
   cd chicken-tracker-refactor-3
   npm install
   claude-code .
   ```

## Workstream Details

### Workstream 1 (Port 3003)
- Branch: `flock-refactor-workstream-1`
- Focus: Component structure refactoring
- Goal: Break down the flock view into smaller, reusable components

### Workstream 2 (Port 3004)
- Branch: `flock-refactor-workstream-2`
- Focus: State management optimization
- Goal: Implement better state management patterns (Context API or Zustand)

### Workstream 3 (Port 3005)
- Branch: `flock-refactor-workstream-3`
- Focus: Performance optimization
- Goal: Implement React Query optimizations, memoization, and lazy loading

## Running the Workstreams

Each workstream can be run independently:

```bash
npm run dev
```

The applications will be available at:
- Workstream 1: http://localhost:3003
- Workstream 2: http://localhost:3004
- Workstream 3: http://localhost:3005

## Important Files to Refactor

The main files for the flock view refactoring are:
- `/src/app/app/flocks/[flockId]/page.tsx` - Main flock page
- `/src/app/app/flocks/[flockId]/Flock.tsx` - Flock component
- `/src/components/flocks/*` - All flock-related components
- `/src/server/trpc/router/flocks.ts` - Flock API routes

## Merging Changes

After refactoring in each workstream:

1. Commit your changes in each workstream
2. Push to remote: `git push origin flock-refactor-workstream-[1|2|3]`
3. Create pull requests to merge back into `app-dir`
4. Review and integrate the best solutions from each approach