# E2E Review Scripts

Playwright-based browser review scripts for FlockNerd. These are used for automated UI verification, not CI test suites — they create real Clerk users and hit the live dev server.

## Prerequisites

```bash
cd /tmp/flock-review  # or any dir with playwright installed
npm install playwright
npx playwright install chromium
```

Or use the persistent Playwright tooling dir on the server at `/tmp/flock-review`.

## Running

Start the dev server first:

```bash
cd ~/Development/flocknerd/apps/web
bun run dev
```

Then run from the Playwright tooling dir (scripts reference the repo for artifact output):

```bash
cd /tmp/flock-review
node ~/Development/flocknerd/ai_review/e2e/verify-e2e.js
node ~/Development/flocknerd/ai_review/e2e/verify-extended.js
node ~/Development/flocknerd/ai_review/e2e/verify-redirect.js
```

## Scripts

### `verify-e2e.js`
Full onboarding flow: sign-up → Step 1–5 → completion → flock handoff → return visit.

### `verify-extended.js`
Extended coverage:
- Sign-in for existing users
- Onboarding resume (close and return)
- Egg log with data (non-skip path)
- Post-onboarding app usage (flocks, logs, expenses)
- Logout and re-login
- Public pages (home, about, blog)

### `verify-redirect.js`
Single-flock auto-redirect:
- Onboarding completion → flock detail
- `/app` entry → flock detail
- `/app/flocks` → flock detail
- Re-login → flock detail

## Artifacts

Screenshots and findings are saved to `ui_review_artifacts/` in the repo root (gitignored).
