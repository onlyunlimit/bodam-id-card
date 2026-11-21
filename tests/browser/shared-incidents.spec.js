import { test, expect } from '@playwright/test';
import { mockIncidents, reportConsent, confirmStatus } from './incident-fixture.js';
import { mockGeocode } from './geocode-fixture.js';

test('Independent visitors share a report, its map pin, and closure without local storage', async ({browser,baseURL})=>{
 test.setTimeout(60000);
 const state={records:[],fail:false};
 const a=await browser.newContext({reducedMotion:'reduce',viewport:{width:1440,height:1000}});
 const b=await browser.newContext({reducedMotion:'reduce',viewport:{width:1440,height:1000}});
 try {
  await mockIncidents(a,state);await mockIncidents(b,state);
  const writer=await a.newPage(),reader=await b.newPage();await mockGeocode(writer);
  await reader.goto(baseURL+'/records.html');await expect(reader.locator('#records-workspace')).toBeVisible();
  const map=await reader.locator('#records-map').boundingBox();expect(map.width).toBeGreaterThan(650);expect(map.height).toBeGreaterThanOrEqual(420);
  await writer.goto(baseURL+'/records.html');await writer.locator('#viewer-toggle').click();await writer.locator('#login-submit').click();
  await writer.locator('#new-incident').click();await writer.locator('[name=reporter]').fill('공유 관측자');await writer.locator('[name=location]').fill('Paris');await writer.locator('#search-address').click();
  await expect(writer.locator('[name=latitude]')).toHaveValue('48.856600');await writer.locator('[name=zone]').fill('공유 현장');await writer.locator('[name=detail]').fill('서로 다른 방문자가 함께 확인할 신고입니다.');await writer.locator('[name=personnel]').fill('1250');await reportConsent(writer);
  await writer.locator('#incident-form [type=submit]').click();await expect(writer.locator('#document-dialog')).not.toBeVisible();await expect(writer.locator('#report-success')).toContainText('완료');
  // No manual reload: the other visitor receives the new report on the polling cycle.
  await expect(reader.locator('.case-content h3')).toHaveText('공유 현장',{timeout:25000});
  expect(await reader.evaluate(()=>localStorage.getItem('sgia.incidents'))).toBeNull();
  await reader.locator('.case-content').click();await expect(reader.locator('.record-dossier')).toContainText('공유 관측자');await reader.keyboard.press('Escape');
  await reader.goto(baseURL+'/portal.html');await expect(reader.locator('[data-map-incident]')).toHaveCount(1);
  await reader.goto(baseURL+'/records.html');await reader.locator('[data-resolve]').click();await reader.locator('#incident-status-form [name=password]').fill('000000');await reader.locator('#incident-status-form [type=submit]').click();await expect(reader.locator('#incident-status-form .form-error')).toContainText('일치하지');
  await confirmStatus(reader);await expect(reader.locator('.case-file')).toHaveCount(0);await reader.locator('#incident-status').selectOption('resolved');await expect(reader.locator('.stamp')).toContainText('RESOLVED');
  await writer.reload();await expect(writer.locator('[data-map-incident]')).toHaveCount(0);await writer.locator('#incident-status').selectOption('resolved');await expect(writer.locator('.case-file')).toHaveCount(1);
  await reader.setViewportSize({width:320,height:850});expect(await reader.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await reader.screenshot({path:'private/checks/shared-records-mobile.png'});
 } finally { await a.close();await b.close(); }
});

test('Previous local reports stay private until explicitly shared, preserving coordinates and area',async({page})=>{
 const state={records:[],fail:false};await mockIncidents(page,state);
 const old={id:'old-local-report',manual:true,type:'괴물',grade:'C',zone:'예전 구역',location:'가상 현장',reporter:'예전 요원',detail:'이전에 이 브라우저에서 작성한 신고입니다.',support:'실드',personnel:80,requests:'',occurredAt:Date.now(),created:Date.now(),resolvedAt:null,x:50,y:50,coordinates:[35.18,129.07],area:{type:'Polygon',coordinates:[[[129,35],[129.1,35],[129.1,35.1],[129,35]]]},areaSource:'manual'};
 await page.addInitScript(record=>localStorage.setItem('sgia.incidents',JSON.stringify([record])),old);
 await page.goto('/records.html');await expect(page.locator('#legacy-incidents')).toContainText('예전 구역');await expect(page.locator('.case-file')).toHaveCount(0);expect(state.records).toHaveLength(0);
 await page.locator('#viewer-toggle').click();await page.locator('#login-submit').click();await page.locator('[data-publish-draft]').click();await reportConsent(page);await page.locator('#incident-form [type=submit]').click();await expect(page.locator('#document-dialog')).not.toBeVisible();
 expect(state.records).toHaveLength(1);expect(state.records[0].coordinates).toEqual(old.coordinates);expect(state.records[0].area).toEqual(old.area);
 await page.reload();await expect(page.locator('#legacy-incidents')).not.toBeVisible();await expect(page.locator('.case-file')).toHaveCount(1);
});
