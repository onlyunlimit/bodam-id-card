import { test, expect } from '@playwright/test';
async function login(page) {
  await page.locator('#viewer-toggle').click();
  await page.locator('#login-submit').click();
  await expect(page.locator('body')).toHaveAttribute('data-viewer', 'staff');
}
test('Intro rings rotate around a fixed center and connection reaches a separate portal', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '접속하시겠습니까?' })).toBeVisible();
  const measure = () =>
    page.locator('.gate-core').evaluate((e) => {
      const r = e.getBoundingClientRect();
      return [r.x + r.width / 2, r.y + r.height / 2];
    });
  const before = await measure();
  await page.waitForTimeout(500);
  expect(await measure()).toEqual(before);
  await page.locator('#connect').click();
  await page.waitForURL('**/portal.html');
  await expect(page.locator('h1')).toHaveText('통합 관제 현황');
  await expect(page.locator('#character-grid')).toHaveCount(0);
});
test('Departments are separate pages and entertainment is excluded from agency directory', async ({
  page,
}) => {
  await page.goto('/departments.html');
  await expect(page.locator('.directory-card')).toHaveCount(3);
  await expect(page.locator('.directory-grid')).not.toContainText('럭키트릭');
  await page.locator('.directory-card[href="beacon.html"]').click();
  await expect(page.locator('h1')).toHaveText('비콘');
  await expect(page.locator('.person-card')).toHaveCount(5);
  await expect(page.locator('.unit-masthead')).toContainText('2F');
  await page.goto('/entertainment.html');
  await expect(page.locator('.directory-card')).toHaveCount(2);
});
test('Login cancellation stays public, staff persists across pages, photo roles and flip faces are correct', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/beacon.html');
  const card = page.locator('[data-character="binjo"]');
  const front = await card.locator('.id-photo > img').getAttribute('data-image-url');
  expect(
    await card.locator('.id-photo > img').evaluate((e) => getComputedStyle(e).filter),
  ).toContain('blur(11px)');
  await page.locator('#viewer-toggle').click();
  await page.locator('#login-submit').click();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  await expect(page.locator('body')).toHaveAttribute('data-viewer', 'public');
  await login(page);
  await card.locator('.card-turner').focus();
  await page.keyboard.press('ArrowRight');
  await expect(card.locator('.front')).toHaveAttribute('aria-hidden', 'true');
  await expect(card.locator('.back')).toHaveAttribute('aria-hidden', 'false');
  expect(await card.locator('.front').evaluate((e) => getComputedStyle(e).backfaceVisibility)).toBe(
    'hidden',
  );
  await card.locator('.card-turner').click();
  expect(await page.locator('.dossier-photo').getAttribute('data-image-url')).not.toBe(front);
  await expect(page.locator('[data-gallery]')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await page.goto('/origin.html');
  await expect(page.locator('body')).toHaveAttribute('data-viewer', 'staff');
  await expect(page.locator('[data-character="bug"] .fixed-code')).toHaveText('BUG');
  await page.locator('#viewer-toggle').click();
  await expect(page.locator('body')).toHaveAttribute('data-viewer', 'public');
});
test('Unit messenger unfolds with avatars, saves own messages and does not leak to another unit', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/beacon.html');
  await login(page);
  await page.locator('.messenger-launch').click();
  await expect(page.locator('.chat-message')).toHaveCount(4);
  await expect(page.locator('.chat-message img')).toHaveCount(4);
  await page.locator('.chat-form input').fill('비콘만 보는 메시지');
  await page.locator('.chat-form button').click();
  await expect(page.locator('.chat-log')).toContainText('비콘만 보는 메시지');
  await page.goto('/origin.html');
  await page.locator('.messenger-launch').click();
  await expect(page.locator('.chat-log')).not.toContainText('비콘만 보는 메시지');
  await page.goto('/beacon.html');
  await page.locator('.messenger-launch').click();
  await expect(page.locator('.chat-log')).toContainText('비콘만 보는 메시지');
});
test('Records require viewer entry, frequency changes, English seals persist and can reopen', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/records.html');
  await expect(page.locator('#records-workspace')).not.toBeVisible();
  await login(page);
  await page.locator('#frequency').fill('80');
  await expect(page.locator('#signal-quality')).toHaveText('신호 불안정');
  await page.locator('[data-resolve]').first().click();
  await expect(page.locator('.stamp')).toHaveCount(0);
  await page.locator('#incident-status').selectOption('resolved');
  await expect(page.locator('.stamp').first()).toContainText('RESOLVED');
  await page.reload();
  await page.locator('#incident-status').selectOption('resolved');
  await expect(page.locator('.stamp').first()).toBeVisible();
  await page.locator('[data-reopen]').first().click();
  await expect(page.locator('.stamp')).toHaveCount(0);
});
