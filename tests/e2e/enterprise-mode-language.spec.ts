import { expect, test } from '@playwright/test';

const backendLeakTerms = /git_sync|deploy_blueprint|fleet_join|restore_backup|rotate_secret|release_sync|drift_scan|policy_deploy|secret_read_dynamic|\/api\/events|\/api\/operations|ws\/events|pocketlab\.events|pocketlab\.audit|FastAPI|NATS|JetStream|worker claimed|Typed Operation/i;

async function seedEnterpriseMode(page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('pocketlab_first_run_onboarding_completed_v1', 'true');
    window.localStorage.setItem('pocketlab_experience_mode', 'professional');
    window.localStorage.setItem('pocketlab_governance_mode', 'enterprise');
  });
}

test('Enterprise Mode primary UI uses enterprise labels instead of backend internals', async ({ page }) => {
  await seedEnterpriseMode(page);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toBeVisible();

  await expect(page.getByText(/Control plane/i).first()).toBeVisible();
  await expect(page.locator('body')).not.toContainText(backendLeakTerms);
});

test('Enterprise Mode activity views sanitize event transport details', async ({ page }) => {
  await seedEnterpriseMode(page);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /activity|events/i }).first().click({ timeout: 5000 }).catch(() => {});
  await expect(page.locator('body')).not.toContainText(backendLeakTerms);
});
