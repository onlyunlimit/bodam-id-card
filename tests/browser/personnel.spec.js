import { test, expect } from '@playwright/test';
async function staff(page) {
  await page.locator('#viewer-toggle').click();
  await page.locator('#login-submit').click();
  await expect(page.locator('body')).toHaveAttribute('data-viewer', 'staff');
}
test('Personnel file: floating badge, paper record with guestbook on its back, photocard fan', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  let posted;
  await page.route('**/guestbook**', (route) => {
    if (route.request().method() === 'POST') { posted = route.request().postDataJSON(); return route.fulfill({ status: 201, json: { ok: true, id: crypto.randomUUID() } }); }
    return route.fulfill({ json: { notes: [{ author: '방문자', message: '저장된 메모', font: 'memo', color: '#F4F1EA', x: 0.2, y: 0.3, size: 16 }] } });
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/shield.html');
  await staff(page);
  await page.locator('[data-character=jion] .card-turner').click();
  await expect(page.locator('.member-archive')).toBeVisible();
  // Only the badge floats at first: no paper, deck, nav or helper text.
  await expect(page.locator('.ma-file')).toBeHidden();
  await expect(page.locator('.ma-deck')).toBeHidden();
  await expect(page.locator('.member-archive :is(.ma-nav,.ma-hint,[data-open-file])')).toHaveCount(0);
  await expect(page.locator('[data-card=badge] .credential-grade')).toContainText('A+');
  await expect(page.locator('[data-card=badge] .fixed-code')).toHaveText('ZION');
  await page.locator('[data-card=badge]').click();
  await expect(page.locator('.ma-file')).toBeVisible();
  await expect(page.locator('.paper-front')).toContainText('06/18');
  await expect(page.locator('.paper-front')).not.toContainText('//');
  await page.locator('[data-mode]').click();
  await expect(page.locator('.member-archive')).toHaveClass(/berserk-mode/);
  // Drag the sheet to turn it over.
  const sheet = page.locator('.paper-front .ma-observe');
  const box = await sheet.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + 10);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 260, box.y + 14, { steps: 8 });
  await page.mouse.up();
  await expect(page.locator('[data-dossier]')).toHaveClass(/is-flipped/);
  await expect(page.locator('.paper-front')).toBeHidden();
  await expect(page.locator('.ma-chalk,.ma-board')).toHaveCount(0);
  await expect(page.locator('.ma-sheet .ma-ink-note')).toHaveCount(4);
  await page.locator('.guest-form [name=message]').fill('<b>안녕</b>');
  await expect(page.locator('.ma-ink-note.pending')).toContainText('<b>안녕</b>');
  await page.locator('[data-size-step="1"]').click();
  await page.locator('.ma-ink-note.pending').focus();
  await page.keyboard.press('+');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-size-out]')).toHaveText('16');
  await page.locator('.ma-save').click();
  await expect(page.locator('.ma-output')).toContainText('종이에 남겼습니다');
  expect(posted.size).toBe(16);
  expect(posted.message).toBe('<b>안녕</b>');
  const cards = page.locator('.ma-fan-card');
  await expect(cards).toHaveCount(17);
  await expect(cards.first().locator('img')).toHaveCount(0);
  await cards.nth(3).click();
  await expect(cards.nth(3)).toHaveAttribute('aria-pressed', 'true');
  await expect(cards.nth(3).locator('.ma-poca-title')).toHaveText('White Day · 40K Edition');
  await page.keyboard.press('Escape');
  await expect(page.locator('#document-dialog')).toBeHidden();
  expect(errors).toEqual([]);
});
test('AZ case file is the vault door: seal, keypad, then the file opens with a clue hunt', async ({ page }) => {
  await page.goto('/records.html');
  await staff(page);
  await expect(page.locator('.az-vault-file .az-reader')).toHaveAttribute('data-sealed', 'true');
  await page.locator('#open-sealed').click();
  await page.locator('#archive-pin').fill('0826');
  await page.locator('[data-key=ENTER]').click();
  const file = page.locator('.az-vault-file .az-reader');
  await expect(file).toHaveAttribute('data-open', 'true');
  await expect(file.locator('.az-folder-tabs [data-sheet]')).toHaveCount(5);
  await expect(file.locator('[data-sheet="5"]')).toBeDisabled();
  await expect(file).not.toContainText('다부진');
  await file.locator('[data-sheet="2"]').click();
  await expect(file.locator('.az-sheet[data-page="2"] .az-page')).toContainText('ORPÉ');
  // The turned sheet shows blank paper only.
  await expect(file.locator('.az-sheet[data-page="1"] .az-sheet-front')).toBeHidden();
  await expect(file.locator('.az-sheet[data-page="1"] .az-sheet-back')).toHaveText('');
  await file.locator('[data-trace=receipt]').click();
  await file.locator('[data-clue-close]').click();
  await file.locator('[data-sheet="1"]').click();
  await file.locator('[data-trace=print]').click();
  await file.locator('[data-clue-close]').click();
  await file.locator('[data-sheet="3"]').click();
  await file.locator('[data-trace=dent]').click();
  await expect(file.locator('[data-clue]')).toBeHidden();
  await file.locator('[data-uv]').click();
  await file.locator('[data-trace=dent]').click();
  await file.locator('[data-clue-close]').click();
  await expect(file.locator('[data-sheet="5"]')).toBeEnabled();
  await file.locator('[data-sheet="5"]').click();
  await expect(file.locator('.az-sheet[data-page="5"]')).toContainText('지라시');
  await expect(file.locator('pre')).toHaveCount(0);
});
test('Phone: the AZ dock stays on screen while reading', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/records.html');
  await staff(page);
  await page.locator('#open-sealed').click();
  await page.locator('#archive-pin').fill('0826');
  await page.locator('[data-key=ENTER]').click();
  const file = page.locator('.az-vault-file .az-reader');
  await expect(file).toHaveAttribute('data-open', 'true');
  await file.locator('.az-sheet[data-page="1"]').scrollIntoViewIfNeeded();
  const dock = await file.locator('.az-dock').boundingBox();
  expect(dock.y + dock.height).toBeLessThanOrEqual(844);
  expect(dock.width).toBeLessThanOrEqual(390);
});
test('Reduced motion opens the archive directly', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/beacon.html');
  await staff(page);
  await page.locator('.card-turner').first().click();
  await expect(page.locator('.member-archive')).toBeVisible();
});
