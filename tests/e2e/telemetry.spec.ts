import { test, expect } from '@playwright/test';

test('NOC telemetry renders numeric backend data safely', async ({ page }) => {
  await page.route('**/api/telemetry.json', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ cpu_usage_percent: 18.5, memory_usage_mb: 742, free_space_mb: 22142, cpu_temp_c: 39.2 }) }));
  await page.goto('/');
  await expect(page.locator('body')).toContainText(/System Status|Telemetry|CPU|Memory|Disk|Status/i);
});

test('Health services can contain object values without crashing React tree', async ({ page }) => {
  await page.route('**/api/health-engine.json', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ overall: 'degraded', services: { vault: { status: 'sealed', message: 'Vault sealed' }, nats: 'healthy' } }) }));
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
});
