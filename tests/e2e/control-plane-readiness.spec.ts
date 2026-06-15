import { test, expect } from '@playwright/test';

test('ControlPlaneBanner appears when FastAPI/NATS/worker are degraded', async ({ page }) => {
  await page.route('**/ready', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ready: false, reason: 'nats_unavailable' }) }));
  await page.route('**/api/nats/status', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ connected: false, jetstream: false }) }));
  await page.route('**/api/workers/status', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ available: false }) }));
  await page.goto('/');
  await expect(page.locator('body')).toContainText(/NATS|worker|control plane|degraded|unavailable|not ready|offline/i);
});

test('Write actions do not advertise unsafe local fallback', async ({ page }) => {
  await page.route('**/api/operations/execute', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ detail: 'NATS/JetStream worker execution is required; local fallback is disabled.' }) }));
  await page.goto('/');
  const text = await page.locator('body').innerText();
  expect(text).not.toContain('simulated production');
});
