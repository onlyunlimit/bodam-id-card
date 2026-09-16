import { test, expect } from '@playwright/test';
async function staff(p) {
  await p.locator('#viewer-toggle').click();
  await p.locator('#login-submit').click();
  await expect(p.locator('body')).toHaveAttribute('data-viewer', 'staff');
}
test('Sealed archive rejects bad codes, accepts physical keypad input, and runs terminal checks', async ({
  page,
}) => {
  await page.goto('/records.html');
  await staff(page);
  await expect(page.locator('#az-profile')).toHaveCount(0);
  await page.locator('#open-sealed').click();
  await page.locator('#archive-pin').fill('0000');
  await page.locator('[data-key=ENTER]').click();
  await expect(page.locator('#pin-status')).toContainText('일치하지');
  await expect(page.locator('#az-profile')).toHaveCount(0);
  for (const n of ['0', '8', '2', '6']) await page.locator('[data-key="' + n + '"]').click();
  await page.locator('[data-key=ENTER]').click();
  await expect(page.locator('.release-toasts')).toContainText('KEY ACCEPTED');
  await expect(page.locator('#az-profile')).toBeVisible();
  await page.locator('#threat-log').click();
  await page.locator('#intercept-check').click();
  await expect(page.locator('#integrity-state')).toHaveText('MISMATCH / ISOLATED');
  await page.locator('#intercept-pause').click();
  const packets = await page.locator('#packet-count').textContent();
  await page.waitForTimeout(1400);
  await expect(page.locator('#packet-count')).toHaveText(packets);
});
test('Receiver controls tune the same signal and new BGM stays mounted', async ({ page }) => {
  await page.goto('/records.html');
  await staff(page);
  await page.locator('#tune-up').click();
  await expect(page.locator('#frequency-label')).toHaveText('98.7 Hz');
  await page.locator('#receiver-dial').focus();
  await page.keyboard.press('End');
  await expect(page.locator('#frequency-label')).toHaveText('120.0 Hz');
  await page.locator('#lock-signal').click();
  await expect(page.locator('#frequency-label')).toHaveText('98.6 Hz');
  await expect(page.locator('#ambient-audio')).toHaveAttribute('src', 'bgm/sgia.mp3');
});
test('Agencies show public artist profiles and a functional gallery; compendium explains concepts', async ({
  page,
}) => {
  for (const route of ['elysian', 'hunterwind']) {
    await page.goto('/' + route + '.html');
    await expect(page.locator('.agency-lineup button')).toHaveCount(4);
    await expect(page.locator('.person-card')).toHaveCount(0);
    await page.locator('.agency-lineup button').first().click();
    await expect(page.locator('.dossier-photo')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.locator('[data-gallery-index]').first().click();
    const img = await page.locator('.gallery-lightbox>img').getAttribute('src');
    await page.locator('#gallery-next').click();
    expect(await page.locator('.gallery-lightbox>img').getAttribute('src')).not.toBe(img);
    await page.keyboard.press('Escape');
  }
  await page.goto('/manual.html');
  await page.locator('#gate summary').click();
  await expect(page.locator('#gate details')).toHaveAttribute('open', '');
  await page.locator('#compatibility-range').fill('95');
  await expect(page.locator('#compatibility-status')).toHaveText('희귀 고적합');
});
test('Hardware panels and agency pages fit a 320px screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/records.html');
  await staff(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('#open-sealed').click();
  expect(
    await page.locator('#document-dialog').evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
  ).toBe(true);
  await page.locator('#archive-pin').fill('0826');
  await page.locator('[data-key=ENTER]').click();
  await expect(page.locator('#az-profile')).toBeVisible();
  await page.locator('#threat-log').click();
  expect(
    await page.locator('#document-dialog').evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
  ).toBe(true);
});
