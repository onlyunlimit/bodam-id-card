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
  expect(await reader.evaluate(()=>JSON.parse(localStorage.getItem('sgia.incidents')))).toEqual([]);
  await reader.locator('.case-content').click();await expect(reader.locator('.record-dossier')).toContainText('공유 관측자');await reader.keyboard.press('Escape');
  await reader.goto(baseURL+'/portal.html');await expect(reader.locator('[data-map-incident]')).toHaveCount(1);
  await reader.goto(baseURL+'/records.html');await reader.locator('[data-resolve]').click();await reader.locator('#incident-status-form [name=password]').fill('000000');await reader.locator('#incident-status-form [type=submit]').click();await expect(reader.locator('#incident-status-form .form-error')).toContainText('일치하지');
  await confirmStatus(reader);await expect(reader.locator('.case-file')).toHaveCount(0);await reader.locator('#incident-status').selectOption('resolved');await expect(reader.locator('.stamp')).toContainText('RESOLVED');
  await writer.reload();await expect(writer.locator('[data-map-incident]')).toHaveCount(0);await writer.locator('#incident-status').selectOption('resolved');await expect(writer.locator('.case-file')).toHaveCount(1);
  await reader.setViewportSize({width:320,height:850});expect(await reader.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await reader.screenshot({path:'private/checks/shared-records-mobile.png'});
 } finally { await a.close();await b.close(); }
});

test('Previous reports automatically become public without review and keep their location and original time',async({browser,baseURL})=>{
 const state={records:[],fail:true};
 const a=await browser.newContext(),b=await browser.newContext();
 try{
  await mockIncidents(a,state);await mockIncidents(b,state);
  const old={id:'old-local-report',manual:true,type:'괴물',grade:'C',zone:'예전 구역',location:'가상 현장',reporter:'예전 요원',detail:'이전에 이 브라우저에서 작성한 신고입니다.',support:'실드',personnel:80,requests:'',occurredAt:1000000,created:2000000,resolvedAt:null,x:50,y:50,coordinates:[35.18,129.07],area:{type:'Polygon',coordinates:[[[129,35],[129.1,35],[129.1,35.1],[129,35]]]},areaSource:'manual'};
  await a.addInitScript(record=>localStorage.setItem('sgia.incidents',JSON.stringify([record])),old);
  const owner=await a.newPage(),reader=await b.newPage();
  await owner.goto(baseURL+'/records.html');
  await expect(owner.locator('#incident-sync-status')).toContainText('재시도');
  await expect(owner.locator('.case-file')).toHaveCount(1);
  expect(state.records).toHaveLength(0);
  state.fail=false;await owner.locator('#refresh-incidents').click();
  await expect(owner.locator('#incident-sync-status')).toContainText('최신');
  await expect(owner.locator('#legacy-incidents')).toHaveCount(0);
  expect(state.records).toHaveLength(1);
  expect(state.records[0].coordinates).toEqual(old.coordinates);expect(state.records[0].area).toEqual(old.area);expect(state.records[0].created).toBe(old.created);
  await reader.goto(baseURL+'/records.html');await expect(reader.locator('.case-content h3')).toHaveText('예전 구역');
  await expect(reader.locator('.case-action a')).toHaveText('종결 승인');
  await expect(reader.locator('.case-action a')).toHaveAttribute('href',/\/admin\?incident=/);
  await expect(owner.locator('#incident-sync-status')).toBeHidden();
  await owner.reload();await expect(owner.locator('#incident-sync-status')).toContainText('최신');
  expect(state.records).toHaveLength(1);
  expect(await owner.evaluate(()=>JSON.parse(localStorage.getItem('sgia.incidents')))).toEqual([old]);
  await owner.route('**/incidents',route=>route.fulfill({status:503,json:{error:'일시 장애'}}));
  await owner.reload();await expect(owner.locator('#incident-sync-status')).toContainText('연결 실패');
  await expect(owner.locator('.case-file')).toHaveCount(1);
  await owner.unroute('**/incidents');
  state.records=[];await owner.locator('#refresh-incidents').click();await expect(owner.locator('.case-file')).toHaveCount(0);
 }finally{await a.close();await b.close();}
});

test('Saved automatic records from both legacy keys retain closure and import valid records despite invalid siblings', async({page})=>{
 const state={records:[],fail:false};await mockIncidents(page,state);
 const {generateIncident}=await import('../../assets/model.js');
 const automatic=generateIncident(1,()=>.3,1000000),closed={...generateIncident(2,()=>.4,2000000),resolvedAt:3000000};
 await page.addInitScript(records=>{
  localStorage.setItem('sgia.incidents',JSON.stringify([records[0],{broken:true}]));
  localStorage.setItem('onlyunlimit.sgia.incidents.v1',JSON.stringify([records[1]]));
 },[automatic,closed]);
 await page.goto('/records.html');await expect(page.locator('#incident-sync-status')).toContainText('최신');
 expect(state.records).toHaveLength(2);
 await expect(page.locator('.case-file')).toHaveCount(1);
 await expect(page.locator('.incident-origin')).toHaveText('자동 관측 기록');
 await expect(page.locator('#records-map [data-map-incident]')).toHaveCount(1);
 await page.locator('#incident-status').selectOption('resolved');await expect(page.locator('.case-file')).toHaveCount(1);
 await expect(page.locator('[data-reopen]')).toHaveCount(0);
 expect(state.records.find(r=>r.created===2000000).resolvedAt).toBe(3000000);
 await page.reload();await expect(page.locator('#incident-sync-status')).toContainText('최신');
 expect(state.records).toHaveLength(2);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('onlyunlimit.sgia.incidents.v1')))).toEqual([closed]);
});

test('Fresh browsers restore the same shared automatic baseline without multiplying records',async({browser,baseURL})=>{
 const state={records:[],fail:false};
 for(let n=0;n<2;n++){
  const context=await browser.newContext();
  try{
   await mockIncidents(context,state);
   await context.addInitScript(()=>localStorage.removeItem('sgia.incidents'));
   const page=await context.newPage();await page.goto(baseURL+'/records.html');
   await expect(page.locator('#incident-sync-status')).toContainText('최신');
   expect(state.records).toHaveLength(15);
   await expect(page.locator('#incident-summary')).toContainText('15');
   const id=await page.locator('.case-file').first().getAttribute('data-incident');
   await page.reload();await expect(page.locator('#incident-sync-status')).toContainText('최신');
   await expect(page.locator('.case-file').first()).toHaveAttribute('data-incident',id);
   expect(state.records).toHaveLength(15);
  }finally{await context.close();}
 }
});
