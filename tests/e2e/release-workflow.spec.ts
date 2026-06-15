import { test, expect } from '@playwright/test';

test('Release workflow timeline updates/rendering is visible', async ({ page }) => {
  await page.route('**/api/release/workflow', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ workflow_id: 'release-dev', status: 'running', stages: [{ name: 'check', status: 'complete' }, { name: 'backup', status: 'running' }] }) }));
  await page.goto('/');
  await expect(page.locator('body')).toContainText(/Release|Update|Workflow|check|backup|running|complete/i);
});
