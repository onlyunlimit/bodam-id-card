import {test,expect} from '@playwright/test';
import {adminHTML,adminJS} from '../../backend/admin.js';
test('Administrator sees private suggestions and can clear reviewed entries from the inbox',async({page})=>{
 let read=false;const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/admin**',async route=>{
  const req=route.request(),u=new URL(req.url());let data={};
  if(u.pathname==='/admin')return route.fulfill({contentType:'text/html',body:adminHTML});
  if(u.pathname==='/admin/app.js')return route.fulfill({contentType:'text/javascript',body:adminJS});
  if(u.pathname==='/admin/posts')data={posts:[]};
  if(u.pathname==='/admin/members')data={members:[]};
  if(u.pathname==='/admin/notifications')data={events:[],unread:0,asOf:200};
  if(u.pathname==='/admin/incidents')data={incidents:[],next:null};
  if(u.pathname==='/admin/music-requests')data={requests:read&&u.searchParams.get('filter')!=='all'?[]:[{id:'test',character:'<img src=x onerror=alert(1)>',title:'추천곡',artist:'Artist',youtube_url:'https://www.youtube.com/watch?v=abcdefghijk',created_at:1795700000000,read_at:read?1795700000001:null}],more:false};
  if(u.pathname==='/admin/music-requests/test'&&req.method()==='PATCH'){read=true;data={ok:true};}
  return route.fulfill({json:data});
 });
 await page.goto('/admin');await page.locator('.admin-tabs [data-tab=music]').click();const inbox=page.locator('.music-request-inbox');await expect(inbox.locator('article')).toContainText('추천곡 · Artist');
 await expect(inbox.locator('article p')).toHaveText('<img src=x onerror=alert(1)>');await expect(inbox.locator('img')).toHaveCount(0);
 await inbox.locator('[data-request-read]').click();await expect(inbox.locator('article')).toHaveCount(0);await expect(inbox.locator('[data-request-status]')).toHaveText('신청이 없습니다.');
 await inbox.locator('select').selectOption('all');await expect(inbox.locator('article')).toContainText('확인함');expect(errors).toEqual([]);
});

 test('Recommendation push link opens its private entry and clears the unread count',async({page})=>{
 const id='12345678-1234-1234-1234-123456789abc';let read=false;const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const entry=()=>({id,character:'빈조',title:'추천곡',artist:'Artist',created_at:1795700000000,read_at:read?1795700000001:null});
 await page.route('**/admin**',async route=>{
  const req=route.request(),u=new URL(req.url());let data={};
  if(u.pathname==='/admin')return route.fulfill({contentType:'text/html',body:adminHTML});
  if(u.pathname==='/admin/app.js')return route.fulfill({contentType:'text/javascript',body:adminJS});
  if(u.pathname==='/admin/posts')data={posts:[]};
  if(u.pathname==='/admin/members')data={members:[]};
  if(u.pathname==='/admin/incidents')data={incidents:[],next:null};
  if(u.pathname==='/admin/notifications')data={events:read?[]:[{id,kind:'music',board:'music',title:'추천곡',created_at:1795700000000}],unread:read?0:1,asOf:Date.now()};
  if(u.pathname==='/admin/music-requests')data={requests:read?[]:[entry()],more:false};
  if(u.pathname==='/admin/music-requests/'+id){if(req.method()==='PATCH'){read=true;data={ok:true};}else data={requests:[entry()],more:false};}
  return route.fulfill({json:data});
 });
 await page.goto('/admin?musicRequest='+id);
 const inbox=page.locator('#music-request-inbox');await expect(inbox.locator('article')).toContainText('추천곡 · Artist');
 await expect(inbox.locator('[data-request-read]')).toHaveText('확인함');expect(read).toBe(true);expect(errors).toEqual([]);
});
