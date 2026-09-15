async function toggleViewer(page){const active=await page.locator('#viewer-toggle').getAttribute('aria-pressed');await page.locator('#viewer-toggle').click();if(active!=='true'){await page.locator('#login-submit').click();await expect(page.locator('#staff-login')).not.toBeVisible();}}
import { test, expect } from '@playwright/test';

test.beforeEach(async({page})=>{
  await page.route('https://api.open-meteo.com/**',route=>route.fulfill({json:{current:{temperature_2m:23.4,weather_code:1,time:new Date(Date.now()+9*3600000).toISOString().slice(0,16)}}}));
});
test('Public cards, staff dossiers, filter, flip and view reset',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/portal.html');
  await expect(page.locator('.character-card')).toHaveCount(4);
  await expect(page.locator('#viewer-toggle')).toHaveAttribute('aria-pressed','false');
  await expect(page.locator('.classified')).toHaveCount(4);
  await expect(page.locator('#weather-temp')).toHaveText('23');
  const card=page.locator('.card-turner').first();
  await card.click();await expect(card).toHaveAttribute('aria-pressed','true');
  await card.press('Enter');await expect(card).toHaveAttribute('aria-pressed','false');
  await toggleViewer(page);
  await expect(page.locator('.classified')).toHaveCount(0);
  await page.locator('[data-dossier="ibex"]').click();
  await expect(page.locator('#dossier')).toBeVisible();
  await expect(page.locator('#dossier')).toContainText('진우빈');
  await page.keyboard.press('Escape');await expect(page.locator('#dossier')).not.toBeVisible();
  await page.locator('[data-team="beacon"]').click();
  await page.locator('#character-search').fill('서원');await expect(page.locator('.character-card')).toHaveCount(1);
  await toggleViewer(page);
  await expect(page.locator('.classified')).toHaveCount(5);
  await page.reload();await expect(page.locator('#viewer-toggle')).toHaveAttribute('aria-pressed','false');
  expect(errors).toEqual([]);
});
test('Staff incident stamps reconcile counters, persist and can be undone',async({page})=>{
  await page.goto('/portal.html');await page.locator('#enter-staff').click();await page.locator('#login-submit').click();await expect(page.locator('#staff-login')).not.toBeVisible();
  await expect(page.locator('.incident-row')).toHaveCount(5);
  await expect(page.locator('#incident-page-info')).toContainText('15건');
  await page.locator('#incident-type').selectOption('게이트');
  const row=page.locator('.incident-row').first();const id=await row.getAttribute('data-incident');
  const before=Number(await page.locator('#stat-gates').textContent());
  await row.locator('[data-resolve]').click();await expect(page.locator('#stat-gates')).toHaveText(String(before-1).padStart(2,'0'));
  await expect(page.locator(`[data-incident="${id}"] .stamp`)).toBeVisible();
  await page.reload();await expect(page.locator('#incident-workspace')).toBeHidden();
  await toggleViewer(page);
  await expect(page.locator(`[data-incident="${id}"] .stamp`)).toBeVisible();
  await page.locator(`[data-incident="${id}"] [data-reopen]`).click();
  await expect(page.locator('#stat-gates')).toHaveText(String(before).padStart(2,'0'));
  await page.locator('#new-incident').click();await expect(page.locator('.incident-row')).toHaveCount(5);await expect(page.locator('#incident-page-info')).toContainText('16건');
});
test('Public server never serves originals, personal images, or repository metadata',async({request})=>{
  for(const pathname of ['/jy.html','/private/personal/jy.html','/caveduck/SGIA/0.%20SGIA%20기본%20세계관%20(로어북).md','/.git/config','/README.md','/180899f11f8dfba37ac06f09f2a118ba-0.png'])expect((await request.get(pathname)).status()).toBe(404);
  for(const pathname of ['/monster.html','/sgia.html','/team.html']){const response=await request.get(pathname);expect(response.status()).toBe(200);expect(await response.text()).toContain('portal.html#resources');}
});
test('Horizontal drag flips, cancelled hold does not navigate, long press connects',async({page})=>{
  await page.goto('/portal.html');
  const card=page.locator('.card-turner').first();await card.scrollIntoViewIfNeeded();
  const box=await card.boundingBox();const x=box.x+box.width/2,y=box.y+box.height/2;
  await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+60,y,{steps:6});await page.mouse.up();
  await expect(card).toHaveAttribute('aria-pressed','true');
  await page.mouse.move(x,y);await page.mouse.down();await page.waitForTimeout(200);await page.mouse.move(x,y+50,{steps:5});await page.waitForTimeout(850);await page.mouse.up();
  expect(new URL(page.url()).pathname).toBe('/portal.html');await expect(card).toHaveAttribute('aria-pressed','true');
  await page.route('https://ko.cvdk.io/**',route=>route.fulfill({body:'Character destination reached',contentType:'text/html'}));
  await page.mouse.move(x,y);await page.mouse.down();await page.waitForURL('https://ko.cvdk.io/**');await page.mouse.up();
});
test('Weather failure, corrupt storage, sound and terminal styles remain usable',async({page})=>{
  await page.unroute('https://api.open-meteo.com/**');await page.route('https://api.open-meteo.com/**',route=>route.abort());
  await page.addInitScript(()=>localStorage.setItem('onlyunlimit.sgia.incidents.v1','[{"bad":"data"}]'));
  await page.goto('/portal.html');await expect(page.locator('#weather-status')).toContainText('기상 연결 대기');
  await page.locator('#terminal-theme').selectOption('field');await expect(page.locator('html')).toHaveAttribute('data-theme','field');
  await page.locator('#terminal-theme').selectOption('paper');await expect(page.locator('html')).toHaveAttribute('data-theme','paper');
  await page.locator('#sound-toggle').click();await expect(page.locator('#sound-toggle')).toHaveAttribute('aria-pressed','true');
  await page.locator('#sound-toggle').click();await expect(page.locator('#sound-toggle')).toHaveAttribute('aria-pressed','false');
  await page.locator('#motion-toggle').click();await expect(page.locator('html')).toHaveAttribute('data-motion','off');
});
test('Mobile layout, touch flip, reduced motion and portrait failure fallback',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.route('https://cdn.caveduck.io/**',route=>route.abort());
  await page.goto('/portal.html');await expect(page.locator('html')).toHaveAttribute('data-motion','off');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.locator('.card-turner').first().click();await expect(page.locator('.card-turner').first()).toHaveAttribute('aria-pressed','true');
  await toggleViewer(page);
  await page.locator('[data-dossier="ibex"]').click();
  await expect(page.locator('#dossier .portrait-unavailable')).toBeVisible();
  await page.keyboard.press('Escape');
});

test('Touchscreen taps flip cards and vertical swipes scroll without opening links',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:4173/portal.html');
  const card=page.locator('.card-turner').first();await card.scrollIntoViewIfNeeded();
  await card.tap();await expect(card).toHaveAttribute('aria-pressed','true');
  const box=await card.boundingBox(),x=box.x+box.width/2,y=box.y+box.height/2;
  const before=await page.evaluate(()=>scrollY);
  const client=await context.newCDPSession(page);
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  for(let step=1;step<=6;step++){
    await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-step*20}]});
    await page.waitForTimeout(30);
  }
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await page.waitForTimeout(850);
  expect(new URL(page.url()).pathname).toBe('/portal.html');
  expect(await page.evaluate(()=>scrollY)).toBeGreaterThan(before);
  await expect(card).toHaveAttribute('aria-pressed','true');
  await context.close();
});
