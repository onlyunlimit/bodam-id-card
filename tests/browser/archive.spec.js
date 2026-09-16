import { test, expect } from '@playwright/test';
test('Briefing connects, decodes, and acknowledges the selected message', async ({ page }) => {
  await page.goto('/portal.html');
  const row = page.locator('.bulletin').first();
  await row.click();
  await expect(page.locator('#transmission-body')).toBeHidden();
  await expect(page.locator('#transmission-ack')).toBeVisible();
  await page.locator('#transmission-ack').click();
  await expect(row).toHaveAttribute('data-read', 'true');
  await page.keyboard.press('Escape');
  await page.locator('#brief-refresh').click();
  await expect(page.locator('#brief-refresh')).toBeDisabled();
  await expect(page.locator('#brief-refresh')).toBeEnabled();
});
test('Schedule entries select a dispatch and team logos are absent', async ({ page }) => {
  await page.goto('/beacon.html');
  await expect(page.locator('.unit-masthead img,.beacon-mark')).toHaveCount(0);
  const row = page.locator('.schedule-slot').last();
  await row.click();
  await expect(row).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#shift-focus h3')).toHaveText(
    await row.locator('span').last().textContent(),
  );
});
test('Incident narrative can be paused and completed without waiting', async ({ page }) => {
  await page.goto('/records.html');
  await page.locator('#viewer-toggle').click();
  await page.locator('#login-submit').click();
  await expect(page.locator('body')).toHaveAttribute('data-viewer', 'staff');
  await page.locator('.case-file').first().click();
  await page.locator('#report-pause').click();
  const text = await page.locator('#typed-report').textContent();
  await page.waitForTimeout(300);
  await expect(page.locator('#typed-report')).toHaveText(text);
  await page.locator('#report-complete').click();
  expect((await page.locator('#typed-report').textContent()).length).toBeGreaterThan(text.length);
});
