import {test,expect} from '@playwright/test';
test('Each unit has its own composition, Blackjack has five members and the withdrawn Joker experience is absent',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/blackjack.html');await page.locator('#viewer-toggle').click();await page.locator('#login-submit').click();await expect(page.locator('body')).toHaveAttribute('data-viewer','staff');
 await expect(page.locator('.field-tv .tv-screen')).toBeVisible();
 await expect(page.locator('.person-card')).toHaveCount(5);
 await expect(page.locator('[data-character=joker]')).toHaveCount(0);
 await expect(page.locator('a[href="joker.html"]')).toHaveCount(0);
 for(const [route,selector] of [['origin','.origin-aperture'],['beacon','.beacon-evidence'],['shield','.shield-lineup']]){
  await page.goto('/'+route+'.html');await expect(page.locator(selector)).toBeVisible();
 }
 expect(errors).toEqual([]);
});
test('Team surfaces follow light/dark preference, modal controls remain legible, navigation restores portal colors',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/blackjack.html');await page.locator('#viewer-toggle').click();await page.locator('#login-submit').click();await expect(page.locator('body')).toHaveAttribute('data-viewer','staff');
 for(const theme of ['light','dark']){
  if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#theme-toggle').click();
  await page.locator('.card-turner').first().click();
  const colors=await page.locator('#document-dialog .close-button').evaluate(e=>{const s=getComputedStyle(e);return [s.color,s.backgroundColor]});
  expect(colors[0]).not.toBe(colors[1]);if(theme==='light')expect(colors[1]).toBe('rgb(235, 231, 236)');
  await page.keyboard.press('Escape');
 }
 const team=await page.locator('body').evaluate(e=>getComputedStyle(e).backgroundColor);
 await page.locator('.site-nav a[href="portal.html"]').click();
 expect(await page.locator('body').evaluate(e=>getComputedStyle(e).backgroundColor)).not.toBe(team);
});
test('Entertainment image controls change slides and reduced motion does not auto-advance',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/elysian.html');
 await page.locator('#spotlight-next').click();await expect(page.locator('#spotlight-count')).toHaveText('02 / 04');
 await page.waitForTimeout(6700);await expect(page.locator('#spotlight-count')).toHaveText('02 / 04');
 await page.locator('#spotlight-prev').click();await expect(page.locator('#spotlight-count')).toHaveText('01 / 04');
});

test('Artist introduction logos occupy the centered navigation slot at desktop and mobile widths',async({page})=>{
 for(const route of ['elysian','hunterwind']){
  await page.goto('/'+route+'.html');
  await expect(page.locator('.agency-nav-logo')).toBeVisible();await expect(page.locator('.agency-hero .agency-wordmark')).toHaveCount(0);
  for(const width of [1440,320]){
   await page.setViewportSize({width,height:900});
   const position=await page.locator('.agency-nav-logo').evaluate(el=>{const a=el.getBoundingClientRect(),b=el.parentElement.getBoundingClientRect();return Math.abs(a.x+a.width/2-b.x-b.width/2);});expect(position).toBeLessThan(2);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  }
 }
});
