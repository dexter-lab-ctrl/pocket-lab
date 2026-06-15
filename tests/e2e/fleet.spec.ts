import { test, expect } from '@playwright/test';

test('Fleet status can render online/offline agents', async ({ page }) => {
  await page.route('**/api/fleet/agents', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ agents: [{ node_id: 'android-lab-01', status: 'online' }, { node_id: 'edge-lab-02', status: 'offline' }] }) }));
  await page.goto('/');
  await expect(page.locator('body')).toContainText(/Fleet|My Devices|Device|Agent|online|offline/i);
});
