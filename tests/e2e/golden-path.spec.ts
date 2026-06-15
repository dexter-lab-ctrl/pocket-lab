import { test, expect } from '@playwright/test';

test('Pocket Lab golden path smoke', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
  const body = page.locator('body');
  await expect(body).toContainText(/Pocket Lab|System Status|Apps & Services|Professional|Simple/i);
  const text = await body.innerText();
  for (const phrase of [/Apps|Catalog|Blueprint/i, /GitOps|Update|Sync/i, /Fleet|Device/i, /Drift|Health/i, /Release|Update/i, /Vault|Password|Access/i, /Security|Safety/i, /Telemetry|NOC|System Status/i]) {
    expect(text).toMatch(phrase);
  }
});
