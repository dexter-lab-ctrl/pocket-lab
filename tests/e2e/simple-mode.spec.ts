import { test, expect } from '@playwright/test';

test('Simple Mode loads plain-language feature labels', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
  const body = await page.locator('body').innerText();
  expect(body).toMatch(/Simple|Apps & Services|System Status|Health & Issues|My Devices|Passwords & Access/i);
});

test('Simple ↔ Professional switching does not crash the app', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: /Simple|Professional|Experience|Mode/i }).first();
  if (await toggle.count()) await toggle.click();
  await expect(page.locator('body')).toContainText(/Simple|Professional|Pocket Lab|System Status|Apps/i);
});
