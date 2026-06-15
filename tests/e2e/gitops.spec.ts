import { test, expect } from '@playwright/test';

test('GitOps flow uses current typed terminology', async ({ page }) => {
  await page.goto('/');
  const text = await page.locator('body').innerText();
  expect(text).toMatch(/GitOps|Keep My Environment Updated|Sync|Update/i);
  expect(text).not.toContain('retired sync compatibility task');
});
