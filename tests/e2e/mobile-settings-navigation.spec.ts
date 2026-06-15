import { expect, test } from '@playwright/test';

async function seedProfessionalPersonalMode(page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('pocketlab_first_run_onboarding_completed_v1', 'true');
    window.localStorage.setItem('pocketlab_experience_mode', 'professional');
    window.localStorage.setItem('pocketlab_governance_mode', 'personal');
  });
}

test('mobile More sheet exposes Settings', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seedProfessionalPersonalMode(page);

  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await page.getByRole('button', { name: /more pocket lab sections/i }).click();

  await expect(page.getByRole('complementary', { name: /more pocket lab sections/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Settings$/i })).toBeVisible();
});
