import {test,expect} from '@playwright/test';
import {adminHTML,adminJS} from '../../backend/admin.js';
test('Admin inbox opens posts, persists reads, polls new activity and clears the visible snapshot',async({page})=>{
 const id='11111111-1111-4111-8111-111111111111';let unread=true;const reads=[];
 await page.route('**/admin**',async route=>{const req=route.request(),u=new URL(req.url());let data={};
 if(u.pathname==='/admin')return route.fulfill({contentType:'text/html',body:adminHTML});
 if(u.pathname==='/admin/app.js')return route.fulfill({contentType:'text/javascript',body:adminJS});
 if(u.pathname==='/admin/posts')data={posts:u.searchParams.has('post')?[{id,board:'staff',title:'앱 알림 확인',author:'ㅇㅇ',body:'새 글',created_at:Date.now(),images:[]}]:[]};
 if(u.pathname==='/admin/members')data={members:[]};
 if(u.pathname==='/admin/notifications')data={events:unread?[{id:'event',post_id:id,title:'앱 알림 확인',kind:'comment',created_at:100}]:[],unread:unread?1:0,asOf:200};
 if(u.pathname==='/admin/notifications/read'){reads.push(req.postDataJSON());unread=false;data={ok:true};}
 return route.fulfill({json:data});});
 await page.goto('/admin');await expect(page.locator('.inbox-item')).toHaveCount(1);
 await page.getByRole('link',{name:/앱 알림 확인/}).click();
 await expect.poll(()=>reads[0]?.postId).toBe(id);await expect(page.locator('.inbox-item')).toHaveCount(0);await expect(page.locator('#notification-count')).toHaveText('0');
 await page.goto('/admin');await expect(page.locator('.inbox-empty')).toBeVisible();
 unread=true;await page.locator('#events-refresh').click();await expect(page.locator('.inbox-item')).toHaveCount(1);
 await page.locator('#events-read-all').click();expect(reads.at(-1)).toEqual({all:true,through:200});await expect(page.locator('.inbox-empty')).toBeVisible();
 await page.setViewportSize({width:320,height:720});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
