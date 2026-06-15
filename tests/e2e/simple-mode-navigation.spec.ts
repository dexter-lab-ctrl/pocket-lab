import { expect, test } from '@playwright/test';

async function seedSimpleMode(page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('pocketlab_first_run_onboarding_completed_v1', 'true');
    window.localStorage.setItem('pocketlab_experience_mode', 'simple');
    window.localStorage.setItem('pocketlab_governance_mode', 'personal');
  });
}

test('Simple Mode uses bottom navigation and plain-language sections', async ({ page }) => {
  await seedSimpleMode(page);
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const simpleNav = page.getByRole('navigation', { name: /Simple Mode sections/i });
  await expect(simpleNav).toBeVisible();

  for (const label of ['Home', 'Apps', 'Health', 'Devices', 'More']) {
    await expect(simpleNav.getByRole('button', { name: new RegExp(label, 'i') })).toBeVisible();
  }

  await simpleNav.getByRole('button', { name: /Apps/i }).click();
  await expect(page.getByRole('heading', { name: /Apps/i }).first()).toBeVisible();
  await expect(page.getByText(/Install and manage apps or services/i).first()).toBeVisible();

  await simpleNav.getByRole('button', { name: /Health/i }).click();
  await expect(page.getByRole('heading', { name: /Health/i }).first()).toBeVisible();
  await expect(page.getByText(/changed or needs attention/i).first()).toBeVisible();

  await simpleNav.getByRole('button', { name: /Devices/i }).click();
  await expect(page.getByRole('heading', { name: /Devices/i }).first()).toBeVisible();
  await expect(page.getByText(/connected devices/i).first()).toBeVisible();

  await simpleNav.getByRole('button', { name: /More/i }).click();
  const moreSheet = page.getByLabel(/More Simple Mode sections/i);
  await expect(moreSheet).toBeVisible();

  for (const label of ['System Status', 'Passwords & Access', 'Safety Center', 'Backups', 'Updates', 'Activity', 'Advanced Details']) {
    await expect(moreSheet.getByRole('button', { name: new RegExp(label, 'i') })).toBeVisible();
  }
});

test('Simple Mode primary navigation avoids professional jargon', async ({ page }) => {
  await seedSimpleMode(page);
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const simpleNavText = await page.getByRole('navigation', { name: /Simple Mode sections/i }).innerText();
  expect(simpleNavText).not.toMatch(/GitOps|Blueprint|Drift|NOC|Vault|Runbook|NATS|JetStream|Worker|Typed Operation|Desired State|Reconcile|Policy Guardrails/i);
});
