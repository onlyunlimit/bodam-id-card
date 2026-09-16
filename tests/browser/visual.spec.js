import { test, expect } from '@playwright/test';
test('All new pages render without browser errors at desktop and narrow mobile sizes', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const file of [
      'index',
      'portal',
      'departments',
      'beacon',
      'origin',
      'shield',
      'headquarters',
      'entertainment',
      'lucky',
      'obsidus',
      'records',
      'orpe',
      'manual',
      'community',
    ]) {
      await page.goto('/' + file + '.html');
      await expect(page.locator('h1')).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        width + ' ' + file,
      ).toBe(true);
    }
  }
  expect(errors).toEqual([]);
});
test('Long profile backs and a messenger fit at mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/beacon.html');
  await page.locator('#viewer-toggle').click();
  await page.locator('#login-submit').click();
  await expect(page.locator('body')).toHaveAttribute('data-viewer', 'staff');
  await page.locator('.messenger-launch').click();
  await page.locator('.card-turner').first().focus();
  await page.keyboard.press('ArrowRight');
  const back = page.locator('.card-face.back').first();
  expect(await back.evaluate((e) => e.scrollHeight <= e.clientHeight + 2)).toBe(true);
  await page.locator('.card-turner').first().click();
  await expect(page.locator('.dossier-photo')).toBeVisible();
  expect(
    await page.locator('#document-dialog').evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
  ).toBe(true);
});
