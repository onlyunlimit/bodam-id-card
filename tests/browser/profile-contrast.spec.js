import {test,expect} from '@playwright/test';
async function contrast(locator){
 return locator.evaluate(el=>{
  const parse=c=>c.match(/[\d.]+/g).map(Number);
  const blend=(fg,bg,a)=>fg.slice(0,3).map((v,i)=>v*a+bg[i]*(1-a));
  const lum=c=>c.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
  let bg=[255,255,255],opacity=1;const chain=[];
  for(let p=el;p;p=p.parentElement)chain.unshift(p);
  for(const p of chain){const s=getComputedStyle(p),c=parse(s.backgroundColor);bg=blend(c,bg,c[3]??1);opacity*=Number(s.opacity);}
  const fg=blend(parse(getComputedStyle(el).color),bg,opacity),a=lum(fg),b=lum(bg);
  return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
 });
}
for(const team of ['blackjack','origin','beacon','shield'])test(`${team} all personnel dossiers have readable text in both themes`,async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/'+team+'.html');
 await page.locator('#viewer-toggle').click();await page.locator('#login-submit').click();
 await expect(page.locator('body')).toHaveAttribute('data-viewer','staff');
 const ids=await page.locator('.person-card').evaluateAll(es=>es.map(e=>e.dataset.character));
 for(const theme of ['dark','light']){
  if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#theme-toggle').click();
  for(const id of ids){
   await page.locator(`[data-character="${id}"] .card-turner`).click();
   const fields=page.locator('.profile-document :is(h3,h3 small,p,dt,dd,a,.coming-soon),.profile-filebar,.profile-photo-index');
   for(const field of await fields.all())expect(await contrast(field),`${id}/${theme}: ${await field.textContent()}`).toBeGreaterThanOrEqual(4.5);
   const action=page.locator('.profile-document .primary');
   if(await action.count()){await action.hover();expect(await contrast(action)).toBeGreaterThanOrEqual(4.5);}
   await page.keyboard.press('Escape');
  }
 }
 await page.setViewportSize({width:320,height:850});await page.locator('.card-turner').last().click();
 expect(await page.locator('#document-dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+1)).toBe(true);
});

test('AZ archive replaces text art with a readable evidence dossier and keeps tracing controls',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/records.html');
 await page.locator('#viewer-toggle').click();await page.locator('#login-submit').click();
 await page.locator('#open-sealed').click();await page.locator('#archive-pin').fill('0826');await page.locator('[data-key=ENTER]').click();
 await expect(page.locator('.az-dossier')).toBeVisible();await expect(page.locator('.az-dossier pre,.identity-terminal')).toHaveCount(0);
 await expect(page.locator('.evidence-file')).toHaveCount(3);
 for(const button of await page.locator('.evidence-file').all()){
  await button.click();await expect(page.locator('.evidence-reader .evidence-facts>div')).toHaveCount(3);
  await expect(page.locator('.evidence-reader pre')).toHaveCount(0);await page.keyboard.press('Escape');
 }
 await page.locator('#tracking-pause').click();await expect(page.locator('#tracking-pause')).toHaveAttribute('aria-pressed','true');
 const before=await page.locator('#sighting-log li').count();await page.locator('#track-az').click();await expect(page.locator('#sighting-log li')).toHaveCount(before+1);
 for(const theme of ['dark','light']){
  if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#theme-toggle').click();
  await page.locator('#az-profile .card-turner').click();await expect(page.locator('.profile-stage')).toBeVisible();
  for(const field of await page.locator('.profile-document :is(h3,h3 small,p,dt,dd,a,.coming-soon),.profile-filebar').all())expect(await contrast(field),`AZ/${theme}: ${await field.textContent()}`).toBeGreaterThanOrEqual(4.5);
  await page.keyboard.press('Escape');
 }
 for(const width of [1440,320]){
  await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 }
});
