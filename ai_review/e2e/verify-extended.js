const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const outDir = '/home/joshnewton/Development/flocknerd/ui_review_artifacts/extended-e2e-' + new Date().toISOString().replace(/[:.]/g, '-');
fs.mkdirSync(outDir, { recursive: true });
const findings = [];
const note = (severity, title, detail) => findings.push({ severity, title, detail });
const BASE = 'http://127.0.0.1:3002';

async function waitForStep(page, stepNum, timeout = 15000) {
  const re = new RegExp(`step ${stepNum} of 5`, 'i');
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const body = (await page.textContent('body')) || '';
    if (re.test(body)) return true;
    await page.waitForTimeout(500);
  }
  return false;
}

async function signUp(page, email, password) {
  await page.goto(`${BASE}/auth/sign-up`, { waitUntil: 'networkidle', timeout: 60000 });
  const inputs = page.locator('input');
  await inputs.nth(0).fill('E2E');
  await inputs.nth(1).fill('Extended');
  await inputs.nth(2).fill(email);
  await inputs.nth(3).fill(password);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.waitForURL('**/app/onboarding**', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3000);
}

async function completeOnboarding(page, flockName, withEggLog = false) {
  // Step 1
  await page.getByRole('button', { name: /save and continue/i }).click();
  await page.waitForURL('**/step=2', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(4000);
  // Step 2
  await page.locator('#flock-name').fill(flockName);
  await page.locator('#flock-type').click();
  await page.getByRole('option', { name: 'Layer flock' }).click();
  await page.getByRole('button', { name: /save flock/i }).click();
  await page.waitForURL('**/step=3', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(4000);
  // Step 3
  const step3Inputs = page.locator('input, textarea');
  await step3Inputs.nth(0).fill('Test Breed');
  await step3Inputs.nth(1).fill('TB');
  await step3Inputs.nth(2).fill('4');
  await step3Inputs.nth(3).fill('3');
  await page.getByRole('button', { name: /save breed groups/i }).click();
  await page.waitForURL('**/step=4', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(4000);
  // Step 4
  if (withEggLog) {
    await page.getByRole('button', { name: /add baseline log/i }).click();
    await page.waitForTimeout(1000);
    await page.locator('input[type="number"]').first().fill('5');
    await page.getByRole('button', { name: /save egg log/i }).click();
  } else {
    await page.getByRole('button', { name: /continue/i }).click();
  }
  await page.waitForURL('**/step=5', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(4000);
  // Step 5
  await page.getByRole('button', { name: /finish onboarding/i }).click();
  await page.waitForTimeout(6000);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ts = Date.now();

  // ===== TEST 1: Sign-in for existing user =====
  console.log('--- Test 1: Sign-in existing user ---');
  const email1 = `flockext1+${ts}@imjoshnewton.com`;
  const password = 'ReviewTest2026!';
  try {
    const ctx1 = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const p1 = await ctx1.newPage();
    await signUp(p1, email1, password);
    await completeOnboarding(p1, 'SignIn Test Coop');
    await ctx1.close();

    // Now sign in fresh
    const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const p2 = await ctx2.newPage();
    await p2.goto(`${BASE}/auth/sign-in`, { waitUntil: 'networkidle', timeout: 60000 });
    await p2.screenshot({ path: path.join(outDir, 't1-01-signin-page.png'), fullPage: true });
    const signInInputs = p2.locator('input');
    await signInInputs.nth(0).fill(email1);
    await signInInputs.nth(1).fill(password);
    await p2.getByRole('button', { name: /continue|sign in/i }).first().click();
    await p2.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
    await p2.waitForTimeout(5000);
    await p2.screenshot({ path: path.join(outDir, 't1-02-after-signin.png'), fullPage: true });
    const signInUrl = p2.url();
    if (signInUrl.includes('/auth/sign-in')) {
      note('blocker', 'Existing user sign-in did not leave sign-in page', signInUrl);
    } else if (signInUrl.includes('/app/onboarding')) {
      note('blocker', 'Completed user was sent to onboarding after sign-in', signInUrl);
    } else {
      console.log('✅ Test 1: Sign-in → ' + signInUrl);
    }
    await ctx2.close();
  } catch (err) {
    note('blocker', 'Test 1 failed', err.stack || String(err));
  }

  // ===== TEST 2: Onboarding resume =====
  console.log('--- Test 2: Onboarding resume ---');
  const email2 = `flockext2+${ts}@imjoshnewton.com`;
  try {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const p = await ctx.newPage();
    await signUp(p, email2, password);
    // Complete step 1 only
    await p.getByRole('button', { name: /save and continue/i }).click();
    await p.waitForURL('**/step=2', { timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(3000);
    await p.screenshot({ path: path.join(outDir, 't2-01-at-step2.png'), fullPage: true });
    // Close and reopen
    const cookies = await ctx.cookies();
    await ctx.close();

    const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await ctx2.addCookies(cookies);
    const p2 = await ctx2.newPage();
    await p2.goto(`${BASE}/app`, { waitUntil: 'networkidle', timeout: 30000 });
    await p2.waitForTimeout(4000);
    await p2.screenshot({ path: path.join(outDir, 't2-02-resumed.png'), fullPage: true });
    const resumeUrl = p2.url();
    if (!resumeUrl.includes('/app/onboarding')) {
      note('blocker', 'Incomplete user was not sent back to onboarding on resume', resumeUrl);
    } else {
      const body = (await p2.textContent('body')) || '';
      if (/step 2 of 5/i.test(body)) {
        console.log('✅ Test 2: Resume at Step 2');
      } else if (/step 1 of 5/i.test(body)) {
        note('tech_debt', 'Resume went to Step 1 instead of Step 2', 'Onboarding resumed but not at the saved step');
      } else {
        console.log('✅ Test 2: Resume into onboarding at ' + resumeUrl);
      }
    }
    await ctx2.close();
  } catch (err) {
    note('blocker', 'Test 2 failed', err.stack || String(err));
  }

  // ===== TEST 3: Egg log with data =====
  console.log('--- Test 3: Egg log with data ---');
  const email3 = `flockext3+${ts}@imjoshnewton.com`;
  try {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const p = await ctx.newPage();
    await signUp(p, email3, password);
    // Steps 1-3
    await p.getByRole('button', { name: /save and continue/i }).click();
    await p.waitForURL('**/step=2', { timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(3000);
    await p.locator('#flock-name').fill('Egg Log Coop');
    await p.getByRole('button', { name: /save flock/i }).click();
    await p.waitForURL('**/step=3', { timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(3000);
    const s3 = p.locator('input, textarea');
    await s3.nth(0).fill('Leghorn');
    await s3.nth(1).fill('LH');
    await s3.nth(2).fill('5');
    await s3.nth(3).fill('4');
    await p.getByRole('button', { name: /save breed groups/i }).click();
    await p.waitForURL('**/step=4', { timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(3000);
    // Step 4 — add baseline log
    await p.getByRole('button', { name: /add baseline log/i }).click();
    await p.waitForTimeout(1000);
    await p.screenshot({ path: path.join(outDir, 't3-01-egg-log-form.png'), fullPage: true });
    // Fill egg count using the number input visible after expanding
    const eggCountInput = p.locator('input[type="number"]').first();
    await eggCountInput.fill('7');
    await p.screenshot({ path: path.join(outDir, 't3-02-egg-log-filled.png'), fullPage: true });
    await p.getByRole('button', { name: /save egg log/i }).click();
    await p.waitForURL('**/step=5', { timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(3000);
    await p.screenshot({ path: path.join(outDir, 't3-03-completion-with-eggs.png'), fullPage: true });
    const body = (await p.textContent('body')) || '';
    if (/7 eggs/i.test(body)) {
      console.log('✅ Test 3: Egg log saved and reflected in summary');
    } else if (/skipped/i.test(body)) {
      note('blocker', 'Egg log was submitted but summary shows skipped', body.slice(0, 500));
    } else {
      note('tech_debt', 'Egg log summary unclear', body.slice(0, 500));
    }
    await ctx.close();
  } catch (err) {
    note('blocker', 'Test 3 failed', err.stack || String(err));
  }

  // ===== TEST 4: Post-onboarding app usage =====
  console.log('--- Test 4: Post-onboarding app usage ---');
  try {
    // Reuse email1 which already completed onboarding
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const p = await ctx.newPage();
    await p.goto(`${BASE}/auth/sign-in`, { waitUntil: 'networkidle', timeout: 60000 });
    await p.locator('input').nth(0).fill(email1);
    await p.locator('input').nth(1).fill(password);
    await p.getByRole('button', { name: /continue|sign in/i }).first().click();
    await p.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
    await p.waitForTimeout(5000);

    // Navigate to flocks
    await p.goto(`${BASE}/app/flocks`, { waitUntil: 'networkidle', timeout: 30000 });
    await p.waitForTimeout(3000);
    await p.screenshot({ path: path.join(outDir, 't4-01-flocks-list.png'), fullPage: true });
    const flockBody = (await p.textContent('body')) || '';
    if (/SignIn Test Coop/i.test(flockBody)) {
      console.log('✅ Test 4: Flock from onboarding visible in app');
    } else if (/add new flock/i.test(flockBody.toLowerCase())) {
      note('tech_debt', 'Flocks page loaded but onboarding flock not visible', flockBody.slice(0, 500));
    } else {
      note('blocker', 'Flocks page did not load properly', flockBody.slice(0, 500));
    }

    // Try navigating to logs and expenses
    await p.goto(`${BASE}/app/logs`, { waitUntil: 'networkidle', timeout: 30000 });
    await p.waitForTimeout(2000);
    await p.screenshot({ path: path.join(outDir, 't4-02-logs-page.png'), fullPage: true });
    if (p.url().includes('/app/logs')) {
      console.log('✅ Test 4: Logs page accessible');
    } else {
      note('blocker', 'Logs page redirected unexpectedly', p.url());
    }

    await p.goto(`${BASE}/app/expenses`, { waitUntil: 'networkidle', timeout: 30000 });
    await p.waitForTimeout(2000);
    await p.screenshot({ path: path.join(outDir, 't4-03-expenses-page.png'), fullPage: true });
    if (p.url().includes('/app/expenses')) {
      console.log('✅ Test 4: Expenses page accessible');
    } else {
      note('blocker', 'Expenses page redirected unexpectedly', p.url());
    }
    await ctx.close();
  } catch (err) {
    note('blocker', 'Test 4 failed', err.stack || String(err));
  }

  // ===== TEST 5: Logout and re-login =====
  console.log('--- Test 5: Logout and re-login ---');
  try {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const p = await ctx.newPage();
    // Sign in
    await p.goto(`${BASE}/auth/sign-in`, { waitUntil: 'networkidle', timeout: 60000 });
    await p.locator('input').nth(0).fill(email1);
    await p.locator('input').nth(1).fill(password);
    await p.getByRole('button', { name: /continue|sign in/i }).first().click();
    await p.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
    await p.waitForTimeout(5000);
    // Logout
    const logoutBtn = p.getByRole('button', { name: /logout|sign out/i });
    if (await logoutBtn.count()) {
      await logoutBtn.click();
      await p.waitForTimeout(4000);
      await p.screenshot({ path: path.join(outDir, 't5-01-after-logout.png'), fullPage: true });
      const logoutUrl = p.url();
      // Try accessing protected route
      await p.goto(`${BASE}/app/flocks`, { waitUntil: 'networkidle', timeout: 30000 });
      await p.waitForTimeout(3000);
      const protectedUrl = p.url();
      if (protectedUrl.includes('/auth/sign-in') || protectedUrl.includes('/sign-in')) {
        console.log('✅ Test 5: Logout works, protected route redirects to sign-in');
      } else if (protectedUrl.includes('/app/flocks')) {
        note('blocker', 'Protected route still accessible after logout', protectedUrl);
      } else {
        console.log('✅ Test 5: Logout redirected to ' + protectedUrl);
      }
      // Re-login
      await p.goto(`${BASE}/auth/sign-in`, { waitUntil: 'networkidle', timeout: 60000 });
      await p.locator('input').nth(0).fill(email1);
      await p.locator('input').nth(1).fill(password);
      await p.getByRole('button', { name: /continue|sign in/i }).first().click();
      await p.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
      await p.waitForTimeout(5000);
      await p.screenshot({ path: path.join(outDir, 't5-02-after-relogin.png'), fullPage: true });
      if (!p.url().includes('/auth/sign-in')) {
        console.log('✅ Test 5: Re-login successful → ' + p.url());
      } else {
        note('blocker', 'Re-login failed, still on sign-in page', p.url());
      }
    } else {
      note('tech_debt', 'Logout button not found', 'Could not locate logout/sign out button');
    }
    await ctx.close();
  } catch (err) {
    note('blocker', 'Test 5 failed', err.stack || String(err));
  }

  // ===== TEST 6: Public pages =====
  console.log('--- Test 6: Public pages ---');
  try {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const p = await ctx.newPage();
    const publicRoutes = ['/', '/about', '/blog'];
    for (const route of publicRoutes) {
      await p.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 30000 });
      await p.waitForTimeout(2000);
      const status = p.url().includes('/auth/sign-in') ? 'REDIRECTED_TO_AUTH' : 'OK';
      const screenshot = `t6-${route.replace(/\//g, '-') || 'home'}.png`;
      await p.screenshot({ path: path.join(outDir, screenshot), fullPage: true });
      if (status === 'OK') {
        console.log(`✅ Test 6: ${route} loads OK`);
      } else {
        note('blocker', `Public route ${route} redirected to auth`, p.url());
      }
    }
    await ctx.close();
  } catch (err) {
    note('blocker', 'Test 6 failed', err.stack || String(err));
  }

  // ===== SUMMARY =====
  fs.writeFileSync(path.join(outDir, 'findings.json'), JSON.stringify(findings, null, 2));
  console.log('\n========================================');
  console.log('OUT: ' + outDir);
  console.log('FINDINGS: ' + findings.length);
  if (findings.length) {
    console.log(JSON.stringify(findings, null, 2));
  } else {
    console.log('ALL TESTS PASSED');
  }
  await browser.close();
})();
