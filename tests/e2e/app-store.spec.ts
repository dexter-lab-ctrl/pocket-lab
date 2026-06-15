import { expect, test } from '@playwright/test';

test('App Catalog action uses typed non-legacy operation path only', async ({ page }) => {
  const requests: Array<{ url: string; method: string; body: string | null }> = [];
  const allRequests: Array<{ url: string; method: string; body: string | null }> = [];
  const pageErrors: string[] = [];

  page.on('pageerror', error => {
    pageErrors.push(error.message);
  });

  page.on('request', request => {
    const url = request.url();

    if (url.includes('/api/')) {
      allRequests.push({
        url,
        method: request.method(),
        body: request.postData(),
      });
    }
  });

  await page.route('**/api/operations/execute', async route => {
    const request = route.request();

    requests.push({
      url: request.url(),
      method: request.method(),
      body: request.postData(),
    });

    await route.fulfill({
      status: 202,
      contentType: 'application/json',
      body: JSON.stringify({
        operation_id: 'e2e-app-catalog-operation',
        task_id: 'e2e-app-catalog-operation',
        status: 'accepted',
        operation: 'deploy_blueprint',
        subject: 'pocketlab.commands.operation.execute',
      }),
    });
  });

  await page.route('**/api/catalog/refresh', async route => {
    const request = route.request();

    requests.push({
      url: request.url(),
      method: request.method(),
      body: request.postData(),
    });

    await route.fulfill({
      status: 202,
      contentType: 'application/json',
      body: JSON.stringify({
        operation_id: 'e2e-catalog-refresh',
        task_id: 'e2e-catalog-refresh',
        status: 'accepted',
        operation: 'catalog_refresh',
        subject: 'pocketlab.commands.operation.execute',
      }),
    });
  });

  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();

  const appCatalogTab = page
    .getByRole('button', { name: /App Catalog|Apps & Services|Blueprint Catalog|App Store|Apps/i })
    .first();

  if ((await appCatalogTab.count()) > 0) {
    await appCatalogTab.click();
  }

  await expect(page.locator('body')).toContainText(/APP CATALOG|App Catalog|Refresh catalog/i, {
    timeout: 10000,
  });

  const visibleButtons = await page.getByRole('button').evaluateAll(buttons =>
    buttons
      .filter(button => {
        const element = button as HTMLElement;
        return !!element.offsetParent;
      })
      .map(button => ({
        text: button.textContent?.replace(/\s+/g, ' ').trim(),
        disabled:
          button.hasAttribute('disabled') ||
          button.getAttribute('aria-disabled') === 'true' ||
          (button as HTMLButtonElement).disabled,
      }))
      .filter(button => button.text),
  );

  const preferredActions = [
    /Refresh catalog/i,
    /^Install$/i,
    /Deploy Blueprint/i,
    /^Deploy$/i,
    /Apply latest/i,
  ];

  let clickedText = '';

  for (const actionName of preferredActions) {
    const action = page.getByRole('button', { name: actionName }).first();

    if ((await action.count()) === 0) continue;
    if (!(await action.isVisible().catch(() => false))) continue;
    if (!(await action.isEnabled().catch(() => false))) continue;

    clickedText = (await action.textContent())?.replace(/\s+/g, ' ').trim() || String(actionName);
    await action.click();
    break;
  }

  if (!clickedText) {
    throw new Error(
      `No enabled App Catalog write-action button was clickable. Visible buttons: ${JSON.stringify(
        visibleButtons,
        null,
        2,
      )}`,
    );
  }

  await page.waitForTimeout(1000);

  if (requests.length === 0) {
    throw new Error(
      [
        `Clicked App Catalog button: ${clickedText}`,
        `No typed App Catalog request was sent to /api/catalog/refresh or /api/operations/execute.`,
        `Visible buttons: ${JSON.stringify(visibleButtons, null, 2)}`,
        `Observed API requests: ${JSON.stringify(allRequests, null, 2)}`,
      ].join('\n'),
    );
  }

  const serialized = JSON.stringify(requests);

  expect(serialized).not.toContain('retired compatibility intent field');
  expect(serialized).not.toContain('legacy_intent');
  expect(serialized).not.toContain('sync_bash');
  expect(serialized).not.toContain('tofu_deploy');
  expect(serialized).not.toContain('/api/action/update');

  expect(serialized).toMatch(/\/api\/catalog\/refresh|\/api\/operations\/execute/i);
  expect(serialized).toMatch(/catalog_refresh|deploy_blueprint|operation|subject|task_id|operation_id/i);

  expect(pageErrors, `App Catalog caused page errors: ${pageErrors.join('\n')}`).toEqual([]);
});
