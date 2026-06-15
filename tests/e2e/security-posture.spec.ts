import { test, expect } from '@playwright/test';

test('Security Posture / Safety Center is represented', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toContainText(/Security|Safety Center|Policy|OPA|Posture/i);
});
