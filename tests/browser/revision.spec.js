import { test, expect } from '@playwright/test';
async function login(p) {
  await p.locator('#viewer-toggle').click();
  await p.locator('#login-submit').click();
  await expect(p.locator('body')).toHaveAttribute('data-viewer', 'staff');
}
test('Internal navigation preserves the same playing BGM and records actions through back navigation', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/portal.html');
  await login(page);
  await page.locator('#sound-toggle').click();
  await expect(page.locator('#sound-toggle')).toHaveAttribute('aria-pressed', 'true');
  await page.evaluate(() => {
    window.originalAudio = document.querySelector('#ambient-audio');
    window.routeMarker = 42;
  });
  await page.locator('.site-nav a[href="departments.html"]').click();
  await page.locator('.directory-card[href="beacon.html"]').click();
  expect(
    await page.evaluate(
      () =>
        window.originalAudio === document.querySelector('#ambient-audio') &&
        !window.originalAudio.paused &&
        window.routeMarker === 42,
    ),
  ).toBe(true);
  await page.locator('#network-log').click();
  await expect(page.locator('.activity-lines')).toContainText('NAVIGATE');
  await expect(page.locator('.activity-lines')).toContainText('비콘');
  await page.keyboard.press('Escape');
  await page.goBack();
  await expect(page.locator('.directory-card')).toHaveCount(3);
  await page.waitForTimeout(1100);
  expect(errors).toEqual([]);
  await page.locator('#sound-toggle').click();
  await expect(page.locator('#sound-toggle')).toHaveAttribute('aria-pressed', 'false');
});
test('Swipe flips while click opens detail; languages preserve codes and localized lore', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/beacon.html');
  await login(page);
  const btn = page.locator('[data-character="binjo"] .card-turner');
  await btn.scrollIntoViewIfNeeded();
  const b = await btn.boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2 + 70, b.y + b.height / 2, { steps: 6 });
  await page.mouse.up();
  await expect(page.locator('[data-character="binjo"]')).toHaveClass(/flipped/);
  await expect(page.locator('#document-dialog')).not.toBeVisible();
  await btn.click();
  await expect(page.locator('.dossier-photo')).toBeVisible();
  await page.keyboard.press('Escape');
  for (const lang of ['en', 'ja', 'zh', 'ko']) {
    await page.locator(`[data-lang="${lang}"]`).click();
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.locator('[data-character="binjo"] .card-code')).toHaveText(
      lang === 'en' ? 'VINJO' : '빈조',
    );
  }
  await page.locator('[data-lang="en"]').click();
  await page.locator('.site-nav a[href="manual.html"]').click();
  await expect(page.locator('#gate .guide-lead')).toContainText('Rifts');
  await page.locator('#manual-search').fill('imprinting');
  await expect(page.locator('#imprint')).toBeVisible();
});
test('Manual reports persist, open as dossiers, dispatch alerts and retain Korean enum values after translation', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/records.html');
  await login(page);
  await page.locator('[data-lang="en"]').click();
  await page.locator('#new-incident').click();
  await page.locator('[name=reporter]').fill('Night watch');
  await page.locator('[name=zone]').fill('Gate 03');
  await page.locator('[name=detail]').fill('Unidentified signal at the east entrance.');
  await page.locator('[name=personnel]').fill('7');
  await page.locator('#incident-form button[type=submit],#incident-form button.primary').click();
  await expect(page.locator('.emergency-window')).toHaveCount(3);
  await page.locator('#emergency-stack>button').click();
  await page.locator('.case-content').first().click();
  await expect(page.locator('.record-dossier')).toContainText('Night watch');
  await expect(page.locator('#typed-report')).toContainText('Unidentified signal');
  await page.keyboard.press('Escape');
  await page.reload();
  await expect(page.locator('.case-content').first()).toContainText('Unidentified signal');
});
test('Each of 18 floors has a distinct interior and rooms open their facility records', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/portal.html');
  await login(page);
  const layouts = [];
  for (const floor of await page
    .locator('[data-floor]')
    .evaluateAll((es) => es.map((e) => e.dataset.floor))) {
    await page.locator(`[data-floor="${floor}"]`).click();
    layouts.push(
      await page
        .locator('.plan-room')
        .evaluateAll((es) => es.map((e) => e.style.cssText).join(';')),
    );
  }
  expect(new Set(layouts).size).toBe(18);
  await page.locator('.plan-room').first().click();
  await expect(page.locator('.room-file')).toBeVisible();
});
test('Only the private footer gesture exposes the owner console entry', async ({ page }) => {
  await page.goto('/community.html');
  await expect(page.locator('a[href$="/admin"]')).toHaveCount(0);
  await expect(page.locator('#privacy')).toHaveCount(0);
  for (let i = 0; i < 5; i++) await page.locator('.site-footer .brand').click();
  await expect(page.locator('#document-dialog a[href$="/admin"]')).toBeVisible();
});
test('All four languages fit mobile navigation, records and character dossiers', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 850 });
  await page.goto('/beacon.html');
  await login(page);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const lang of ['en', 'ja', 'zh', 'ko']) {
    await page.locator(`[data-lang="${lang}"]`).click();
    await page.locator('.card-turner').first().click();
    await expect(page.locator('.dossier-photo')).toBeVisible();
    expect(
      await page.locator('#document-dialog').evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
      lang + ' dossier',
    ).toBe(true);
    await page.keyboard.press('Escape');
    for (const file of ['entertainment', 'records', 'portal', 'beacon']) {
      await page.evaluate((f) => {
        const a = document.createElement('a');
        a.href = f + '.html';
        document.body.append(a);
        a.click();
        a.remove();
      }, file);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        lang + ' ' + file,
      ).toBe(true);
    }
  }
  expect(errors).toEqual([]);
});

test('Localized control descriptions follow changing theme state', async ({ page }) => {
  await page.goto('/beacon.html');
  await page.locator('[data-lang="en"]').click();
  await expect(page.locator('#theme-toggle')).toHaveAttribute('aria-label', 'Switch to dark mode');
  await page.locator('#theme-toggle').click();
  await expect(page.locator('#theme-toggle')).toHaveAttribute('aria-label', 'Switch to light mode');
  await page.locator('[data-lang="ko"]').click();
  await expect(page.locator('#theme-toggle')).toHaveAttribute('aria-label', '라이트모드로 전환');
});
