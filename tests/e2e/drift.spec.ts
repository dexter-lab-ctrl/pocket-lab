import { test, expect } from '@playwright/test';

test('Drift Center shows something changed state', async ({ page }) => {
  await page.route('**/api/drift/summary', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ summary: { status: 'drift_detected', count: 2 }, items: [{ id: 'nats-config', severity: 'high' }] }) }));
  await page.goto('/');
  await expect(page.locator('body')).toContainText(/Drift|Health & Issues|Something Changed|Changed|Issue/i);
});
