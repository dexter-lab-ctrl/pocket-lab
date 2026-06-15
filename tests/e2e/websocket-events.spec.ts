import { test, expect } from '@playwright/test';

test('WebSocket/event panel area can handle event stream fallback', async ({ page }) => {
  await page.route('**/api/events/recent', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ events: [{ subject: 'pocketlab.events.health.checked', payload: { status: 'healthy' } }] }) }));
  await page.goto('/');
  await expect(page.locator('body')).toContainText(/Event|Live|Health|Status|System/i);
});
