import { test, expect } from '@playwright/test';
async function staff(page) {
  await page.locator('#viewer-toggle').click();
  await page.locator('#login-submit').click();
  await expect(page.locator('body')).toHaveAttribute('data-viewer', 'staff');
}
test('Personnel opens a badge, paper archive and photo collection', async ({ page }) => {
  await page.goto('/origin.html');
  await staff(page);
  await page.locator('[data-character=bug] .card-turner').click();
  await expect(page.locator('.member-archive')).toBeVisible();
  await page.locator('.badge-flip').click();
  await expect(page.locator('.badge-flip')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-tab="paper"]').click();
  await expect(page.locator('.paper-front')).toContainText('BUG');
  await page.locator('[data-paper-flip]').click();
  await expect(page.locator('.guest-form')).toBeVisible();
  await page.locator('[data-tab="photos"]').click();
  await page.locator('[data-photo]').first().click();
  await expect(page.locator('.photo-view')).toBeVisible();
  await page.locator('.photo-close').click();
  await expect(page.locator('.photo-view')).toBeHidden();
  await page.keyboard.press('Escape');
});
test('AZ retains its keypad and opens an interactive case archive', async ({ page }) => {
  await page.goto('/records.html');
  await staff(page);
  await page.locator('#open-sealed').click();
  await page.locator('#archive-pin').fill('0826');
  await page.locator('[data-key=ENTER]').click();
  await page.locator('[data-character=az] .card-turner').click();
  await expect(page.locator('.az-reader')).toBeVisible();
  await expect(page.locator('.az-folder-tabs [data-sheet]')).toHaveCount(5);
  await page.locator('[data-sheet="2"]').click();
  await expect(page.locator('.az-page')).toContainText('ORPÉ');
  await expect(page.locator('.az-reader pre')).toHaveCount(0);
});
test('Reduced motion opens the archive directly', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/beacon.html');
  await staff(page);
  await page.locator('.card-turner').first().click();
  await expect(page.locator('.member-archive')).toBeVisible();
});
