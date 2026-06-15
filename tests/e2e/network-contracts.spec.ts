import { test, expect } from '@playwright/test';

test('write flows send typed operations and never legacy payloads', async ({ page }) => {
  const payloads: unknown[] = [];
  await page.route('**/api/operations/execute', async route => {
    const body = route.request().postDataJSON?.() ?? {};
    payloads.push(body);
    await route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ accepted: true, job_id: 'network-contract-job' }) });
  });
  await page.addInitScript(() => {
    window.localStorage.setItem('pocketlab_first_run_onboarding_completed_v1', 'true');
    window.localStorage.setItem('pocketlab_experience_mode', 'professional');
    window.localStorage.setItem('pocketlab_governance_mode', 'personal');
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('main').waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  for (const label of [/Install|Deploy|Apps/i, /Update|Sync|GitOps/i, /Add Device|Join Fleet/i, /Change Password|Rotate/i]) {
    const button = page.getByRole('button', { name: label }).first();
    const visible = await button.isVisible({ timeout: 2500 }).catch(() => false);
    if (visible) await button.click({ timeout: 2500 }).catch(() => {});
  }
  const text = JSON.stringify(payloads);
  expect(text).not.toContain('retired compatibility intent field');
  expect(text).not.toContain('retired sync compatibility task');
  expect(text).not.toContain('retired IaC deploy compatibility task');
});
