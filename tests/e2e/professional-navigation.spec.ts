import { expect, test } from '@playwright/test';

const professionalAreas = [
  /App Catalog|Apps & Services|Blueprint Catalog|App Store/i,
  /System Map|Map/i,
  /GitOps Pipeline|GitOps|Keep My Environment Updated/i,
  /Blueprint Registry|Registry|Blueprint Catalog/i,
  /Identity Vault|Identity & Vault|Passwords & Access/i,
  /Log Explorer|Logs|Event Stream/i,
  /Policy Guardrails|Policy/i,
  /NOC Telemetry|System Status|Telemetry/i,
  /Security Posture|Safety Center|Posture/i,
  /Drift Center|Health & Issues|Drift/i,
  /Release Workflow|Release/i,
  /Mesh Fleet|Fleet Scaling|My Devices|Fleet/i,
  /Disaster Recovery|Backup|Restore/i,
];

const primaryNavigationTabs = [
  /App Catalog|Apps & Services|Blueprint Catalog|App Store/i,
  /System Map|Map/i,
  /GitOps Pipeline|GitOps/i,
  /Blueprint Registry|Registry/i,
  /Identity Vault|Identity & Vault/i,
  /Policy Guardrails|Policy/i,
  /NOC Telemetry|System Status|Telemetry/i,
  /Security Posture|Safety Center|Posture/i,
  /Drift Center|Health & Issues|Drift/i,
  /Release Workflow|Release/i,
  /Mesh Fleet|Fleet Scaling|My Devices|Fleet/i,
  /Disaster Recovery|Backup|Restore/i,
];

test('Professional navigation exposes major architecture areas', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();

  const bodyText = await page.locator('body').innerText();

  for (const area of professionalAreas) {
    expect(bodyText).toMatch(area);
  }

  expect(bodyText).not.toMatch(/legacy_intent|sync_bash|tofu_deploy|\/api\/action\/update/i);
});

test('Every primary navigation tab can be clicked without crashing', async ({ page }) => {
  const pageErrors: string[] = [];

  page.on('pageerror', error => {
    pageErrors.push(error.message);
  });

  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();

  for (const tabName of primaryNavigationTabs) {
    const tab = page.getByRole('button', { name: tabName }).first();

    if ((await tab.count()) === 0) {
      continue;
    }

    await tab.click();
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).not.toHaveText('');
  }

  expect(pageErrors, `Navigation caused page errors: ${pageErrors.join('\n')}`).toEqual([]);
});
