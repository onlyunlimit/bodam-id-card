import { test, expect } from '@playwright/test';
async function staff(page) {
  await page.locator('#viewer-toggle').click();
  await page.locator('#login-submit').click();
  await expect(page.locator('body')).toHaveAttribute('data-viewer', 'staff');
}
test('BUG opens a cancellable fault sequence and AZ opens a classified record', async ({
  page,
}) => {
  await page.goto('/origin.html');
  await staff(page);
  await page.locator('[data-character=bug] .card-turner').click();
  await expect(page.locator('.profile-acquisition')).toHaveAttribute('data-mode', 'fault');
  await page.locator('.acquisition-skip').click();
  await expect(page.locator('.profile-acquisition')).toHaveCount(0);
  await expect(page.locator('.profile-stage')).toHaveAttribute('data-subject', 'bug');
  await page.keyboard.press('Escape');
  await page.goto('/records.html');
  await page.locator('[data-character=az] .card-turner').click();
  await expect(page.locator('.profile-acquisition')).toHaveAttribute('data-mode', 'classified');
  await expect(page.locator('.profile-acquisition')).toHaveCount(0);
  await expect(page.locator('.profile-stage')).toHaveAttribute('data-mode', 'classified');
});
test('Reduced motion suppresses opening and portrait animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/beacon.html');
  await staff(page);
  expect(
    await page
      .locator('.id-photo>img')
      .first()
      .evaluate((e) => getComputedStyle(e).animationName),
  ).toBe('none');
  await page.locator('.card-turner').first().click();
  await expect(page.locator('.profile-acquisition')).toHaveCount(0);
  await expect(page.locator('.profile-stage')).toBeVisible();
});
