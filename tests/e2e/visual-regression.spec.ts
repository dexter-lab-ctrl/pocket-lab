import { expect, test } from '@playwright/test';

test('app-shell screenshot', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();

  // Keep the app-shell visual check stable across WSL2/system Chrome and
  // Playwright-managed Chromium by capturing a fixed viewport instead of the
  // full scroll height, which can vary with fonts, browser builds, and generated content.
  await expect(page).toHaveScreenshot('app-shell.png', {
    animations: 'disabled',
    fullPage: false,
    // Allow tiny WSL2/system Chrome rasterization differences while still
    // failing on meaningful app-shell layout or content drift.
    maxDiffPixels: 500
  });
});
