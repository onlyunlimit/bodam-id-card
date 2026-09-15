import { test, expect } from '@playwright/test';
async function login(page){await page.locator('#viewer-toggle').click();await page.locator('#login-submit').click();await expect(page.locator('#staff-login')).not.toBeVisible();}
test('Intro offers a reduced-motion connection and reaches the public portal',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await expect(page.getByRole('heading',{name:'접속하시겠습니까?'})).toBeVisible();
  await page.locator('#connect').click();await page.waitForURL('**/portal.html');
  await expect(page.locator('#viewer-toggle')).toHaveAttribute('aria-pressed','false');
  const blur=await page.locator('.public .portrait').first().evaluate(e=>getComputedStyle(e).filter);
  expect(blur).toContain('blur(');expect(errors).toEqual([]);
});
test('Login cancellation never grants access; badges and gallery unlock deliberately',async({page})=>{
  await page.goto('/portal.html');await page.locator('[data-dossier="bug"]').click();
  await expect(page.locator('#staff-login')).toBeVisible();await page.locator('#login-submit').click();
  await page.keyboard.press('Escape');await page.waitForTimeout(1400);
  await expect(page.locator('#viewer-toggle')).toHaveAttribute('aria-pressed','false');
  await page.locator('[data-dossier="bug"]').click();await page.locator('#login-submit').click();
  await expect(page.locator('#dossier-title')).toHaveText('BUG');
  const original=await page.locator('#dossier .portrait').getAttribute('src');
  await page.locator('[data-gallery="1"]').click();expect(await page.locator('#dossier .portrait').getAttribute('src')).not.toBe(original);
  await page.keyboard.press('Escape');await page.locator('[data-team="beacon"]').click();
  await expect(page.locator('[data-character="binjo"] .card-code')).toHaveText('VINJO');
  await expect(page.locator('[data-character="yeomyeong"] .coming-soon')).toHaveText('COMING SOON');
  await expect(page.locator('[data-character="yeomyeong"] a')).toHaveCount(0);
});
test('Wanted tracking produces footprints and classified records; receiver and seal work',async({page})=>{
  await page.goto('/portal.html');await page.locator('[data-team="orpe"]').click();
  await expect(page.locator('#wanted-panel')).toBeVisible();
  const before=await page.locator('#last-sighting').textContent();
  await page.locator('#track-az').click();expect(await page.locator('#last-sighting').textContent()).not.toBe(before);
  await expect(page.locator('.track-footprint')).toHaveCount(2);
  await page.locator('#tracking-pause').click();await expect(page.locator('#tracking-pause')).toHaveAttribute('aria-pressed','true');
  await login(page);await page.locator('#wanted-file').click();await expect(page.locator('#record-dialog')).toContainText('발화');await page.keyboard.press('Escape');
  await page.locator('#frequency').fill('80');await expect(page.locator('#frequency-label')).toHaveText('80.0 Hz');await expect(page.locator('#signal-quality')).toContainText('불안정');
  await page.locator('#frequency').fill('98.6');await expect(page.locator('#signal-quality')).toHaveText('수신 양호');
  await page.locator('[data-resolve]').first().click();await expect(page.locator('.stamp').first()).toBeVisible();
  expect(await page.locator('.stamp').first().evaluate(e=>getComputedStyle(e).color)).toBe('rgb(163, 41, 35)');
});
test('Fan posts persist as text, reactions and team chats remain isolated',async({page})=>{
  await page.goto('/portal.html');await page.locator('#fan-message').fill('<img src=x onerror=alert(1)> 오늘도 무사 귀환!');await page.locator('#fan-form button').click();
  await expect(page.locator('#fan-posts')).toContainText('<img src=x');await expect(page.locator('#fan-posts img')).toHaveCount(0);
  await page.locator('[data-like]').first().click();await expect(page.locator('[data-like]').first()).toHaveAttribute('aria-pressed','true');
  await page.locator('#lightstick').click();await expect(page.locator('#lightstick')).toHaveAttribute('aria-pressed','true');
  await page.locator('#fan-team').selectOption('obsidus');await expect(page.locator('#fan-posts')).not.toContainText('<img src=x');
  await login(page);await page.locator('#chat-message').fill('오리진만 보는 테스트 메시지');await page.locator('#chat-form button').click();await expect(page.locator('#chat-messages')).toContainText('오리진만 보는 테스트 메시지');
  await page.locator('#chat-team').selectOption('beacon');await expect(page.locator('#chat-messages')).not.toContainText('오리진만 보는 테스트 메시지');
  await page.reload();await page.locator('#fan-team').selectOption('lucky');await expect(page.locator('#fan-posts')).toContainText('<img src=x');
  await expect(page.locator('#chat-workspace')).not.toBeVisible();
});
test('Historical files, emergency acknowledgement and session logs are readable',async({page})=>{
  await page.goto('/portal.html');await page.locator('[data-history="origin"]').click();
  await expect(page.locator('#record-title')).toContainText('문이라고');await page.keyboard.press('Escape');
  await expect(page.locator('[data-history="origin"]')).toContainText('열람 완료');
  await page.locator('#emergency-alert').click();await expect(page.locator('#record-dialog')).toContainText('실제 경보가 아닙니다');await page.locator('#alert-ack').click();
  await page.locator('#network-log').click();await expect(page.locator('#record-dialog')).toContainText('비상 지침 수신 완료');
});
test('Expanded mobile sections do not overflow and motion can be paused',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/portal.html');await login(page);
  for(const team of ['orpe','lucky','obsidus']){await page.locator(`[data-team="${team}"]`).click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),team).toBe(true);}
  await page.locator('#motion-toggle').click();await expect(page.locator('html')).toHaveAttribute('data-motion','off');
  await page.setViewportSize({width:320,height:800});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
