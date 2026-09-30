import {mockGeocode} from './geocode-fixture.js';
import { test, expect } from '@playwright/test';
async function staff(page) {
  await page.locator('#viewer-toggle').click();
  await page.locator('#login-submit').click();
  await expect(page.locator('body')).toHaveAttribute('data-viewer', 'staff');
}
test('A clicked report pin persists into operations, disappears on closure, and remains in the archived dossier', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.stack));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mockGeocode(page);
  await page.goto('/records.html');
  await staff(page);
  await page.locator('#new-incident').click();
  await page.locator('[name=reporter]').fill('Map observer');
  await page.locator('[name=location]').fill('현장 <b>표지</b>');
  await page.locator('[name=zone]').fill('EAST');
  await page.locator('[name=detail]').fill('새로운 생명체 발견. 현장 접근 대기.');
  await page.locator('#report-map').click({ position: { x: 350, y: 75 } });
  const coords = await page
    .locator('[name=latitude],[name=longitude]')
    .evaluateAll((es) => es.map((e) => Number(e.value)));
  expect(coords).not.toEqual([37.5445, 127.0557]);
  await expect(page.locator('#address-status')).toContainText('확인했습니다');
  await page.locator('#incident-form .primary').click();
  await page.locator('#emergency-stack>button').click();
  const record = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('sgia.incidents')).at(-1),
  );
  expect(record.coordinates).toEqual(coords);
  const pin = `[data-map-incident="${record.id}"]`;
  await expect(page.locator(pin)).toHaveCount(1);
  await expect(page.locator('.case-content').first().locator('h3')).toHaveText('EAST');
  await expect(page.locator('.case-content').first().locator('.case-location')).toContainText('현장 <b>표지</b>');
  await expect(page.locator('.case-location b')).toHaveCount(0);
  await page.locator('.site-nav a[href="portal.html"]').click();
  await page.locator(pin).click({ force: true });
  await expect(page.locator('.map-detection code')).toHaveText(
    coords.map((v) => v.toFixed(5)).join(', '),
  );
  await page.reload();
  await expect(page.locator(pin)).toHaveCount(1);
  await page.locator('.site-nav a[href="records.html"]').click();
  await page.locator(`[data-resolve="${record.id}"]`).click();
  await expect(page.locator(pin)).toHaveCount(0);
  await expect(page.locator(`[data-incident="${record.id}"]`)).toHaveCount(0);
  await page.locator('#incident-status').selectOption('resolved');
  await page.locator(`[data-incident="${record.id}"] .case-content`).click();
  await expect(page.locator('#case-location-map ' + pin)).toHaveCount(1);
  await expect(page.locator('.record-dossier h3')).toHaveText('EAST');
  await page.keyboard.press('Escape');
  await page.locator('.site-nav a[href="portal.html"]').click();
  await expect(page.locator(pin)).toHaveCount(0);
  expect(errors).toEqual([]);
});
test('Classified evidence opens as a document and crosshair stays decorative without horizontal overflow', async ({
  page,
}) => {
  await mockGeocode(page);
  await page.goto('/records.html');
  await staff(page);
  await page.locator('#open-sealed').hover();
  await expect(page.locator('#forensic-cursor')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('#open-sealed').click();
  await page.locator('#archive-pin').fill('0826');
  await page.locator('[data-key=ENTER]').click();
  await expect(page.locator('[data-evidence]')).toHaveCount(3);
  await page.locator('[data-evidence="01"]').click();
  await expect(page.locator('.evidence-reader')).toContainText('동일 발화');
  await page.setViewportSize({ width: 320, height: 850 });
  expect(
    await page.locator('#document-dialog').evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
  ).toBe(true);
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('Portrait artwork uses a background and expanded past records do not intersect the barcode rail', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/beacon.html');
  await staff(page);
  const photo = page.locator('[data-character="levit"] .id-photo>img');
  await expect(photo).toHaveAttribute('src', /^data:image\/svg/);
  expect(await photo.evaluate((e) => getComputedStyle(e).backgroundImage)).toContain('https://');
  await page.locator('[data-character="levit"] .card-turner').click();
  await page.locator('.past-record summary').click();
  const boxes = await page.locator('.profile-photo-index,.past-record').evaluateAll((es) =>
    es.map((e) => {
      const r = e.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom };
    }),
  );
  expect(boxes[0].bottom).toBeLessThanOrEqual(boxes[1].top + 1);
});

test('Closing a report and immediately reusing the dialog never refreshes a disposed map', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.stack));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await mockGeocode(page);
  await page.goto('/records.html');
  await staff(page);
  await page.locator('#new-incident').click();
  await page.evaluate(() => {
    document.querySelector('#document-dialog').close();
    document.querySelector('#open-sealed').click();
  });
  await page.waitForTimeout(300);
  await expect(page.locator('#archive-pin')).toBeVisible();
  expect(errors).toEqual([]);
});

test('Report addresses and worldwide pins stay in sync, save real boundaries and allow custom areas',async({page},testInfo)=>{
 await mockGeocode(page);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/records.html');await staff(page);
 await expect(page.locator('.receiver svg.wave')).toHaveCount(0);
 await page.locator('#new-incident').click();await expect(page.locator('.report-location-pin span')).toBeVisible();await expect(page.locator('#report-map img.leaflet-marker-icon')).toHaveCount(0);
 await page.locator('[name=location]').fill('Paris');await page.locator('#search-address').click();await expect(page.locator('[name=latitude]')).toHaveValue('48.856600');await expect(page.locator('[name=longitude]')).toHaveValue('2.352200');
 await page.locator('[name=areaMode]').selectOption('boundary');await page.locator('[name=radiusMeters]').fill('500');await page.locator('[name=reporter]').fill('구역 관측');await page.locator('[name=detail]').fill('프랑스 구역에서 생명체 발견');await page.locator('#document-dialog').screenshot({path:testInfo.outputPath('report-area.png')});await page.locator('#incident-form .primary').click();
 const record=await page.evaluate(()=>JSON.parse(localStorage.getItem('sgia.incidents')).at(-1));expect(record.coordinates).toEqual([48.8566,2.3522]);expect(record.area.type).toBe('Polygon');expect(record.radiusMeters).toBe(500);expect(record.areaSource).toBe('osm');
 await page.locator('#emergency-stack>button').click();await page.locator(`[data-incident="${record.id}"] .case-content`).click();await expect(page.locator('#case-location-map .leaflet-overlay-pane path')).toHaveCount(1);await page.keyboard.press('Escape');
 await page.locator('#new-incident').click();await page.locator('#world-view').click();await page.locator('[name=latitude]').fill('-33.8688');await page.locator('[name=longitude]').fill('151.2093');await page.locator('#apply-coordinate').click();await expect(page.locator('[name=location]')).toHaveValue('현장 <b>표지</b>');
 await page.locator('[name=areaMode]').selectOption('draw');for(const position of [{x:130,y:70},{x:180,y:110},{x:120,y:140}])await page.locator('#report-map').click({position});await expect(page.locator('#address-status')).toContainText('3개');
 await page.locator('[name=reporter]').fill('구역 작성');await page.locator('[name=detail]').fill('호주에서 직접 지정한 현장');await page.locator('#incident-form .primary').click();const drawn=await page.evaluate(()=>JSON.parse(localStorage.getItem('sgia.incidents')).at(-1));expect(drawn.areaSource).toBe('manual');expect(drawn.area.coordinates[0]).toHaveLength(4);expect(drawn.coordinates).toEqual([-33.8688,151.2093]);
});


test('Fictional place names use approximate city pins and show errors above the modal and completion after closing', async ({page}) => {
 await mockGeocode(page); await page.emulateMedia({reducedMotion:'reduce'}); await page.goto('/records.html'); await staff(page);
 await page.locator('#new-incident').click();
 await page.locator('[name=approximate]').check();
 await page.locator('[name=location]').fill('달빛 연구소 지하 7구역');
 await page.locator('[name=citySearch]').fill('Seoul'); await page.locator('#search-address').click();
 await expect(page.locator('#address-status')).toContainText('확인했습니다');
 await expect(page.locator('[name=location]')).toHaveValue('달빛 연구소 지하 7구역');
 await page.locator('[name=location]').fill('별빛 연구소');
 await page.locator('[name=reporter]').fill('야간조'); await page.locator('[name=detail]').fill('가상 연구소에서 관측한 신호');
 await page.locator('[name=support]').selectOption('custom'); await page.locator('[name=customSupport]').fill('   ');
 await page.locator('#incident-form .primary').click(); await expect(page.locator('#report-error')).toBeVisible(); await expect(page.locator('#document-dialog')).toBeVisible();
 await page.locator('[name=customSupport]').fill('합동팀'); await page.locator('#incident-form .primary').click();
 await expect(page.locator('#document-dialog')).not.toBeVisible(); await expect(page.locator('#report-success')).toContainText('신고 접수가 완료');
 const record = await page.evaluate(()=>JSON.parse(localStorage.getItem('sgia.incidents')).at(-1)); expect(record.location).toBe('별빛 연구소'); expect(record.approximate).toBe(true); expect(record.coordinates).toEqual([48.8566,2.3522]);
 await page.reload(); await expect(page.locator('.case-content').first()).toContainText('별빛 연구소');
 await page.route('**/geocode?**', route=>route.fulfill({status:503,json:{error:'검색 연결 실패'}}));
 await page.locator('#new-incident').click(); await page.locator('[name=approximate]').check();
 await page.locator('[name=location]').fill('미등록 가상 기지'); await page.locator('[name=citySearch]').fill('서울');
 await page.locator('#search-address').click(); await expect(page.locator('#address-status')).toContainText('검색 연결 실패');
 await page.locator('#confirm-approximate').click();
 await page.locator('[name=reporter]').fill('관측자'); await page.locator('[name=detail]').fill('대략적인 위치로 접수합니다');
 await page.evaluate(()=>{window.restoreStorage=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='sgia.incidents')throw Error('quota');return window.restoreStorage.call(this,k,v);};});
 await page.locator('#incident-form .primary').click(); await expect(page.locator('#report-error')).toContainText('저장 공간'); await expect(page.locator('#document-dialog')).toBeVisible();
 await page.evaluate(()=>{Storage.prototype.setItem=window.restoreStorage;delete window.restoreStorage;});
 await page.locator('#incident-form .primary').click(); await expect(page.locator('#document-dialog')).not.toBeVisible();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('sgia.incidents')).at(-1).location)).toBe('미등록 가상 기지');
});

test('Worldwide map zooms on two quick mobile taps', async ({browser}) => {
 const context = await browser.newContext({hasTouch:true,isMobile:true,viewport:{width:390,height:844},reducedMotion:'reduce'});
 const page = await context.newPage();
 try {
  await page.goto('http://127.0.0.1:4173/portal.html');
  const map=page.locator('#seoul-map'); await map.scrollIntoViewIfNeeded();
  const zoom=()=>map.locator('img.leaflet-tile').evaluateAll(es=>Math.max(...es.map(e=>Number(e.src.match(/\/(\d+)\/\d+\/\d+\.png/)?.[1]||0))));
  await expect.poll(zoom).toBe(2); const box=await map.boundingBox();
  await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);
  await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);
  await expect.poll(zoom).toBe(3);
 } finally { await context.close(); }
});


test('Compact records show the zone heading with a separate location and old records have a safe fallback', async ({page},testInfo) => {
 await page.emulateMedia({reducedMotion:'reduce'}); await page.goto('/records.html'); await staff(page);
 await expect(page.locator('.case-content h3').first()).toHaveText('구역 미지정');
 await page.locator('#incident-list').screenshot({path:testInfo.outputPath('compact-records.png')});
 await page.locator('.case-content').first().click();
 await expect(page.locator('.record-dossier h3')).toHaveText('구역 미지정');
 await expect(page.locator('.record-dossier .facts')).toContainText('발생 위치');
 await page.locator('#document-dialog').screenshot({path:testInfo.outputPath('compact-dossier.png')});
 await page.setViewportSize({width:320,height:800});
 expect(await page.locator('#document-dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+1)).toBe(true);
 await page.locator('#document-dialog').screenshot({path:testInfo.outputPath('compact-dossier-mobile.png')});
});
