import {test,expect} from '@playwright/test';
import {adminHTML,adminJS} from '../../backend/admin.js';
test('Admin can edit imported incidents, change closure and delete from the same console',async({page})=>{
 let records=[{id:'11111111-1111-4111-8111-111111111111',type:'괴물',grade:'C',location:'가상 현장',detail:'이전 사건 기록 설명입니다.',created:2000000,resolvedAt:null,managed:true}];
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/admin**',async route=>{
  const req=route.request(),u=new URL(req.url());let data={};
  if(u.pathname==='/admin')return route.fulfill({contentType:'text/html',body:adminHTML});
  if(u.pathname==='/admin/app.js')return route.fulfill({contentType:'text/javascript',body:adminJS});
  if(u.pathname==='/admin/posts')data={posts:[]};
  if(u.pathname==='/admin/members')data={members:[]};
  if(u.pathname==='/admin/notifications')data={events:[],unread:0,asOf:200};
  if(u.pathname==='/admin/incidents')data={incidents:records,next:null};
  if(u.pathname.startsWith('/admin/incidents/')){
   if(req.method()==='DELETE')records=[];
   else{const change=req.postDataJSON();records[0]={...records[0],...change};if('resolved'in change)records[0].resolvedAt=change.resolved?3000000:null;}
   data={ok:true};
  }
  return route.fulfill({json:data});
 });
 await page.goto('/admin?incident='+records[0].id);await expect(page.locator('[data-case]')).toHaveCount(1);
 await page.locator('[data-case-edit]').click();
 await expect(page.locator('#case-edit-form [name=zone]')).toHaveValue('가상 현장');
 await page.locator('#case-edit-form [name=zone]').fill('공유 구역');
 await page.locator('#case-edit-form [name=location]').fill('수정된 발생 위치');
 await page.locator('#case-edit-form [name=reporter]').fill('관측자');
 await page.locator('#case-edit-form [name=detail]').fill('<script>실행하지 않는 사건 본문</script>');
 await page.locator('#case-edit-form [type=submit]').click();
 await expect(page.locator('[data-case] h3')).toHaveText('공유 구역');
 await expect(page.locator('[data-case] p')).toHaveText('<script>실행하지 않는 사건 본문</script>');
 await page.locator('[data-case-close]').click();await expect(page.locator('[data-case-close]')).toHaveText('재개');
 await page.locator('[data-case-close]').click();await expect(page.locator('[data-case-close]')).toHaveText('종결');
 page.once('dialog',d=>d.accept());await page.locator('[data-case-delete]').click();await expect(page.locator('[data-case]')).toHaveCount(0);
 expect(errors).toEqual([]);
});
