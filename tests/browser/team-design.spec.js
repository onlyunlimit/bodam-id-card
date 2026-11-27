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
test('Crew pages share the Lucky Trick layout and fit a phone',async({page})=>{
 for(const [route,title] of [['elysian','LUCKY TRICK'],['hunterwind','OBSIDUS']]){
  await page.goto('/'+route+'.html');await expect(page.locator('.lt-root h1')).toHaveText(title);
  for(const width of [1440,320]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);}
 }
});

test('Official personnel cards keep both faces contained on narrow screens and use actual grades',async({page})=>{
 await page.setViewportSize({width:320,height:900});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/beacon.html');
 await expect(page.locator('.credential-grade').first()).toContainText('—');
 await page.locator('#viewer-toggle').click();await page.locator('#login-submit').click();
 await expect(page.locator('body')).toHaveAttribute('data-viewer','staff');
 await expect(page.locator('[data-character=levit] .credential-grade')).toContainText('SS');
 for(const unit of ['beacon','origin','shield','blackjack']){
  await page.goto('/'+unit+'.html');
  await expect(page.locator('.official-id').first()).toBeVisible();
  const sizes=await page.locator('.official-id .card-face').evaluateAll(els=>els.map(el=>({height:el.clientHeight,scroll:el.scrollHeight,width:el.clientWidth,scrollWidth:el.scrollWidth})));
  for(const size of sizes){expect(size.scroll).toBeLessThanOrEqual(size.height+2);expect(size.scrollWidth).toBeLessThanOrEqual(size.width+2);}
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  const button=page.locator('.card-turner').first();await button.focus();await page.keyboard.press('ArrowRight');await expect(button).toHaveAttribute('aria-pressed','true');
 }
});
