const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const outDir = '/home/joshnewton/Development/flocknerd/ui_review_artifacts/onboarding-e2e-' + new Date().toISOString().replace(/[:.]/g, '-');
fs.mkdirSync(outDir, { recursive: true });
const findings = [];
const note = (severity, title, detail) => findings.push({ severity, title, detail });

async function waitForStep(page, stepNum, timeout = 15000) {
  const urlPattern = stepNum === 1 ? /\/app\/onboarding(\?|$)/ : new RegExp(`step=${stepNum}`);
  const re = new RegExp(`step ${stepNum} of 5`, 'i');
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const url = page.url();
    const body = (await page.textContent('body')) || '';
    if ((urlPattern.test(url) || re.test(body)) && re.test(body)) return true;
    await page.waitForTimeout(500);
  }
  return false;
}

(async () => {
  const email = `flocke2e+${Date.now()}@imjoshnewton.com`;
  const password = 'ReviewTest2026!';
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('pageerror', err => fs.appendFileSync(path.join(outDir, 'console.log'), `[pageerror] ${err.message}\n`));

  try {
    // === SIGN UP ===
    await page.goto('http://127.0.0.1:3002/auth/sign-up', { waitUntil: 'networkidle', timeout: 60000 });
    const inputs = page.locator('input');
    await inputs.nth(0).fill('E2E');
    await inputs.nth(1).fill('Tester');
    await inputs.nth(2).fill(email);
    await inputs.nth(3).fill(password);
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForURL('**/app/onboarding**', { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(outDir, '01-after-signup.png'), fullPage: true });

    if (!page.url().includes('/app/onboarding')) {
      note('blocker', 'Sign-up did not land in onboarding', page.url());
      throw new Error('Auth handoff failed: ' + page.url());
    }
    console.log('✅ Sign-up → onboarding');

    // === STEP 1: Welcome ===
    if (!await waitForStep(page, 1)) { note('blocker', 'Step 1 not visible', ''); throw new Error('Step 1 missing'); }
    await page.getByRole('button', { name: /save and continue/i }).click();
    await page.waitForURL('**/onboarding?step=2', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(4000);
    await page.screenshot({ path: path.join(outDir, '02-after-step1.png'), fullPage: true });
    if (!await waitForStep(page, 2)) { note('blocker', 'Did not advance to Step 2', ''); throw new Error('Step 1 stuck'); }
    console.log('✅ Step 1 → Step 2');

    // === STEP 2: Create first flock ===
    await page.locator('#flock-name').fill('E2E Test Coop');
    // shadcn Select (Radix combobox) — click trigger then click option
    await page.locator('#flock-type').click();
    await page.getByRole('option', { name: 'Layer flock' }).click();
    await page.locator('#flock-description').fill('Automated review flock');
    await page.getByRole('button', { name: /save flock/i }).click();
    await page.waitForURL('**/onboarding?step=3', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(outDir, '03-after-step2.png'), fullPage: true });
    if (!await waitForStep(page, 3)) { note('blocker', 'Did not advance to Step 3', ''); throw new Error('Step 2 stuck'); }
    console.log('✅ Step 2 → Step 3');

    // === STEP 3: Breed groups ===
    // Now using proper label associations (accessibility fix)
    await page.getByLabel('Group name').first().fill('Rhode Island Red');
    await page.getByLabel('Breed').first().fill('RIR');
    await page.getByLabel('Bird count').first().fill('6');
    await page.getByLabel('Average eggs per day').first().fill('4.5');
    await page.getByRole('button', { name: /save breed groups/i }).click();
    await page.waitForURL('**/onboarding?step=4', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(outDir, '04-after-step3.png'), fullPage: true });
    if (!await waitForStep(page, 4)) { note('blocker', 'Did not advance to Step 4', ''); throw new Error('Step 3 stuck'); }
    console.log('✅ Step 3 → Step 4');

    // === STEP 4: Optional egg log (skip) ===
    // "Skip for now" is already the default, so just click Continue
    await page.getByRole('button', { name: /continue/i }).click();
    await page.waitForURL('**/onboarding?step=5', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(outDir, '05-after-step4.png'), fullPage: true });
    if (!await waitForStep(page, 5)) { note('blocker', 'Did not advance to Step 5', ''); throw new Error('Step 4 stuck'); }
    console.log('✅ Step 4 → Step 5');

    // === STEP 5: Completion ===
    await page.screenshot({ path: path.join(outDir, '06-completion-summary.png'), fullPage: true });
    await page.getByRole('button', { name: /finish onboarding/i }).click();
    await page.waitForTimeout(6000);
    await page.screenshot({ path: path.join(outDir, '07-after-finish.png'), fullPage: true });

    const finalUrl = page.url();
    fs.writeFileSync(path.join(outDir, 'final-url.txt'), finalUrl);
    if (finalUrl.includes('/app/onboarding')) {
      note('blocker', 'Finish did not exit onboarding', finalUrl);
    } else {
      console.log('✅ Onboarding complete → ' + finalUrl);
    }

    // === RETURN VISIT ===
    await page.goto('http://127.0.0.1:3002/app', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    const returnUrl = page.url();
    if (returnUrl.includes('/app/onboarding')) {
      note('blocker', 'Completed user sent back to onboarding', returnUrl);
    } else {
      console.log('✅ Return visit → ' + returnUrl);
    }
    await page.screenshot({ path: path.join(outDir, '08-return-visit.png'), fullPage: true });

  } catch (err) {
    note('blocker', 'E2E error', err.stack || String(err));
  } finally {
    fs.writeFileSync(path.join(outDir, 'findings.json'), JSON.stringify(findings, null, 2));
    console.log('\nOUT: ' + outDir);
    console.log(JSON.stringify(findings, null, 2));
    await browser.close();
  }
})();
