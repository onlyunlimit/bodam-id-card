import { test, expect } from '@playwright/test';
test('Manual covers core lore, searches and headquarters shows all 18 floors', async ({ page }) => {
  await page.goto('/manual.html');
  for (const id of [
    'gate',
    'sentinel',
    'guide',
    'imprint',
    'matching',
    'pair',
    'ranks',
    'commands',
  ])
    await expect(page.locator('#' + id)).toBeAttached();
  await page.locator('#manual-search').fill('100%');
  await expect(page.locator('#matching')).toBeVisible();
  await expect(page.locator('#gate')).not.toBeVisible();
  await page.goto('/headquarters.html');
  await expect(page.locator('[data-floor]')).toHaveCount(18);
  await page.locator('[data-floor="B4"]').click();
  await expect(page.locator('#floor-detail')).toContainText('오리진 생활');
  await page.locator('[data-floor="B9"]').click();
  await expect(page.locator('#floor-detail')).toContainText('접근 제한 시설');
});
test('ORPE is a dark classified file with trace footprints and pause control', async ({ page }) => {
  await page.goto('/orpe.html');
  await page.locator('#open-sealed').click();
  await page.locator('#archive-pin').fill('0826');
  await page.locator('[data-key=ENTER]').click();
  await expect(page.locator('#open-sealed')).toHaveCount(0);
  await expect(page.locator('.classified-header')).toContainText('TOP SECRET');
  await expect(page.locator('.threat-class')).toContainText('UNMEASURABLE');
  await page.locator('#track-az').click();
  await expect(page.locator('.footprint-marker')).toHaveCount(2);
  await page.locator('#tracking-pause').click();
  await expect(page.locator('#tracking-pause')).toHaveAttribute('aria-pressed', 'true');
});
test('Theme has just light/dark, public and staff have distinct system appearance, cursor maps to radar', async ({
  page,
}) => {
  await page.goto('/portal.html');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.locator('#theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('#theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  const before = await page.locator('body').evaluate((e) => getComputedStyle(e).backgroundColor);
  await page.locator('#viewer-toggle').click();
  await page.locator('#login-submit').click();
  await expect(page.locator('body')).toHaveAttribute('data-viewer', 'staff');
  expect(await page.locator('body').evaluate((e) => getComputedStyle(e).backgroundColor)).not.toBe(
    before,
  );
  await expect(page.locator('.staff-ribbon')).toBeVisible();
  await page.mouse.move(900, 350);
  await expect.poll(() => page.locator('#map-target').evaluate((e) => e.style.left)).not.toBe('');
});
