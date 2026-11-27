import { test, expect } from '@playwright/test';
async function staff(page) {
  await page.locator('#viewer-toggle').click();
  await page.locator('#login-submit').click();
  await expect(page.locator('body')).toHaveAttribute('data-viewer', 'staff');
}
test('Personnel file: badge, clearance, swipeable paper, chalkboard guestbook and photocards', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/guestbook**', (route) => route.request().method() === 'POST'
    ? route.fulfill({ status: 201, json: { ok: true } })
    : route.fulfill({ json: { notes: [{ author: '방문자', message: '저장된 메모', font: 'memo', color: '#F4F1EA', x: 0.2, y: 0.3 }] } }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/shield.html');
  await staff(page);
  await page.locator('[data-character=jion] .card-turner').click();
  await expect(page.locator('.member-archive')).toBeVisible();
  await expect(page.locator('[data-card=entry] .credential-grade')).toContainText('A+');
  await page.locator('[data-flip-card=entry]').click();
  await expect(page.locator('[data-card=entry]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-open-file]').click();
  await expect(page.locator('.ma-workspace')).toBeVisible();
  await expect(page.locator('.paper-front')).toContainText('ZION');
  await page.locator('[data-mode=berserk]').click();
  await expect(page.locator('.member-archive')).toHaveClass(/berserk-mode/);
  // Drag the sheet to turn it over.
  const sheet = page.locator('.paper-front .ma-memos');
  const box = await sheet.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + 10);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 260, box.y + 14, { steps: 8 });
  await page.mouse.up();
  await expect(page.locator('[data-dossier]')).toHaveClass(/is-flipped/);
  await expect(page.locator('.ma-chalk')).toHaveCount(4);
  await page.locator('.guest-form [name=message]').fill('<b>안녕</b>');
  await expect(page.locator('.ma-chalk.pending')).toContainText('<b>안녕</b>');
  await page.locator('.ma-chalk.pending').focus();
  await page.keyboard.press('ArrowRight');
  await page.locator('.ma-save').click();
  await expect(page.locator('.ma-output')).toContainText('칠판에 남겼습니다');
  await page.locator('.ma-nav [data-go=deck]').click();
  await expect(page.locator('.ma-fan-card')).toHaveCount(17);
  await expect(page.locator('.ma-fan-card').first().locator('img')).toHaveCount(0);
  await page.locator('.ma-fan-card').nth(3).click();
  await expect(page.locator('.photo-view')).toBeVisible();
  await page.locator('[data-poca-flip]').click();
  await expect(page.locator('[data-poca-title]')).toHaveText('White Day · 40K Edition');
  await page.keyboard.press('Escape');
  await expect(page.locator('.photo-view')).toBeHidden();
  await expect(page.locator('#document-dialog')).toBeVisible();
  expect(errors).toEqual([]);
});
test('AZ retains its keypad and opens the sealed case file with a clue hunt', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/records.html');
  await staff(page);
  await page.locator('#open-sealed').click();
  await page.locator('#archive-pin').fill('0826');
  await page.locator('[data-key=ENTER]').click();
  await page.locator('[data-character=az] .card-turner').click();
  await expect(page.locator('.az-reader')).toBeVisible();
  await expect(page.locator('.az-folder-tabs [data-sheet]')).toHaveCount(5);
  await expect(page.locator('[data-sheet="5"]')).toBeDisabled();
  await page.locator('[data-seal]').click();
  await page.locator('[data-sheet="2"]').click();
  await expect(page.locator('.az-sheet[data-page="2"] .az-page')).toContainText('ORPÉ');
  await page.locator('[data-trace=receipt]').click();
  await page.locator('[data-clue-close]').click();
  await page.locator('[data-sheet="1"]').click();
  await page.locator('[data-trace=print]').click();
  await page.locator('[data-clue-close]').click();
  await page.locator('[data-sheet="3"]').click();
  await page.locator('[data-trace=dent]').click();
  await expect(page.locator('[data-clue]')).toBeHidden();
  await page.locator('[data-uv]').click();
  await page.locator('[data-trace=dent]').click();
  await page.locator('[data-clue-close]').click();
  await expect(page.locator('[data-sheet="5"]')).toBeEnabled();
  await page.locator('[data-sheet="5"]').click();
  await expect(page.locator('.az-sheet[data-page="5"]')).toContainText('지라시');
  await expect(page.locator('.az-reader pre')).toHaveCount(0);
});
test('Reduced motion opens the archive directly', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/beacon.html');
  await staff(page);
  await page.locator('.card-turner').first().click();
  await expect(page.locator('.member-archive')).toBeVisible();
});
