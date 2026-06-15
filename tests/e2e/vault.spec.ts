import { test, expect } from '@playwright/test';

test('Vault tab exposes access language but not root material', async ({ page }) => {
  await page.goto('/');
  const text = await page.locator('body').innerText();
  expect(text).toMatch(/Vault|Passwords & Access|Secret|Access|Password/i);
  expect(text).not.toMatch(/root_token|unseal_key|VAULT_TOKEN=.*hvs\./i);
});
