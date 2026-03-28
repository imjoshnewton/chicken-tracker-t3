const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const outDir = '/home/joshnewton/Development/flocknerd/ui_review_artifacts/redirect-e2e-' + new Date().toISOString().replace(/[:.]/g, '-');
fs.mkdirSync(outDir, { recursive: true });
const findings = [];
const note = (severity, title, detail) => findings.push({ severity, title, detail });
const BASE = 'http://127.0.0.1:3002';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ts = Date.now();
  const password = 'ReviewTest2026!';

  // ===== Single flock user: should auto-redirect to flock detail =====
  console.log('--- Single flock redirect ---');
  const email1 = `flockrdr1+${ts}@imjoshnewton.com`;
  try {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const p = await ctx.newPage();
    // Sign up
    await p.goto(`${BASE}/auth/sign-up`, { waitUntil: 'networkidle', timeout: 60000 });
    await p.locator('input').nth(0).fill('Rdr');
    await p.locator('input').nth(1).fill('Test');
    await p.locator('input').nth(2).fill(email1);
    await p.locator('input').nth(3).fill(password);
    await p.getByRole('button', { name: 'Continue' }).click();
    await p.waitForURL('**/app/onboarding**', { timeout: 30000 }).catch(() => {});
    await p.waitForTimeout(4000);
    // Complete onboarding
    await p.getByRole('button', { name: /save and continue/i }).click();
    await p.waitForURL('**/step=2', { timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(4000);
    await p.locator('#flock-name').fill('Solo Coop');
    await p.locator('#flock-type').click();
    await p.getByRole('option', { name: 'Layer flock' }).click();
    await p.getByRole('button', { name: /save flock/i }).click();
    await p.waitForURL('**/step=3', { timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(4000);
    const s3 = p.locator('input, textarea');
    await s3.nth(0).fill('Hen');
    await s3.nth(1).fill('H');
    await s3.nth(2).fill('3');
    await s3.nth(3).fill('2');
    await p.getByRole('button', { name: /save breed groups/i }).click();
    await p.waitForURL('**/step=4', { timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(4000);
    await p.getByRole('button', { name: /continue/i }).click();
    await p.waitForURL('**/step=5', { timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(4000);
    await p.getByRole('button', { name: /finish onboarding/i }).click();
    await p.waitForTimeout(6000);

    const finishUrl = p.url();
    await p.screenshot({ path: path.join(outDir, '01-after-onboarding.png'), fullPage: true });
    if (finishUrl.includes('/app/flocks/') && !finishUrl.endsWith('/app/flocks')) {
      console.log('✅ Onboarding completion → flock detail: ' + finishUrl);
    } else {
      note('blocker', 'Onboarding did not redirect to flock detail', finishUrl);
    }

    // Navigate to /app — should redirect to flock detail, not list
    await p.goto(`${BASE}/app`, { waitUntil: 'networkidle', timeout: 30000 });
    await p.waitForTimeout(4000);
    const appUrl = p.url();
    await p.screenshot({ path: path.join(outDir, '02-app-entry.png'), fullPage: true });
    if (appUrl.includes('/app/flocks/') && !appUrl.endsWith('/app/flocks')) {
      console.log('✅ /app → single flock detail: ' + appUrl);
    } else {
      note('blocker', '/app did not redirect to single flock detail', appUrl);
    }

    // Navigate to /app/flocks — should also redirect to flock detail
    await p.goto(`${BASE}/app/flocks`, { waitUntil: 'networkidle', timeout: 30000 });
    await p.waitForTimeout(4000);
    const flocksUrl = p.url();
    await p.screenshot({ path: path.join(outDir, '03-flocks-list.png'), fullPage: true });
    if (flocksUrl.includes('/app/flocks/') && !flocksUrl.endsWith('/app/flocks')) {
      console.log('✅ /app/flocks → single flock detail: ' + flocksUrl);
    } else {
      note('tech_debt', '/app/flocks did not redirect to single flock (may show list)', flocksUrl);
    }

    // Sign out and sign back in — should land on flock detail
    await p.getByRole('button', { name: /logout/i }).click();
    await p.waitForTimeout(4000);
    await p.goto(`${BASE}/auth/sign-in`, { waitUntil: 'networkidle', timeout: 60000 });
    await p.locator('input').nth(0).fill(email1);
    await p.locator('input').nth(1).fill(password);
    await p.getByRole('button', { name: /continue|sign in/i }).first().click();
    await p.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
    await p.waitForTimeout(6000);
    const loginUrl = p.url();
    await p.screenshot({ path: path.join(outDir, '04-after-relogin.png'), fullPage: true });
    if (loginUrl.includes('/app/flocks/') && !loginUrl.endsWith('/app/flocks')) {
      console.log('✅ Re-login → single flock detail: ' + loginUrl);
    } else if (loginUrl.includes('/app/flocks')) {
      note('tech_debt', 'Re-login landed on flocks list instead of single flock', loginUrl);
    } else {
      note('blocker', 'Re-login landed somewhere unexpected', loginUrl);
    }

    await ctx.close();
  } catch (err) {
    note('blocker', 'Single flock redirect test failed', err.stack || String(err));
  }

  // ===== Summary =====
  fs.writeFileSync(path.join(outDir, 'findings.json'), JSON.stringify(findings, null, 2));
  console.log('\n========================================');
  console.log('OUT: ' + outDir);
  console.log('FINDINGS: ' + findings.length);
  if (findings.length) {
    console.log(JSON.stringify(findings, null, 2));
  } else {
    console.log('ALL REDIRECT TESTS PASSED');
  }
  await browser.close();
})();
