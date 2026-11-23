import {test,expect} from '@playwright/test';
test('Translation is opt-in, preserves original text and renders provider output safely',async({page})=>{
 await page.goto('/community.html?board=lucky');
 await page.evaluate(async()=>{
  const {setLanguage}=await import('/assets/i18n.js');setLanguage('en');
  const {attachTranslation}=await import('/assets/community-translation.js');
  const section=document.createElement('section');section.id='translation-fixture';section.innerHTML='<p>오늘도 고생했어요.</p>';document.body.prepend(section);
  window.translationRequests=[];
  attachTranslation(section.firstChild,'post','test-id',async url=>{window.translationRequests.push(url);return {text:'Good work &amp; rest. <img src=x onerror=alert(1)>'};});
 });
 expect(await page.evaluate(()=>window.translationRequests)).toEqual([]);
 const fixture=page.locator('#translation-fixture');await fixture.getByRole('button',{name:'See translation'}).click();
 await expect(fixture.locator('.translated-copy')).toHaveText('Good work & rest. <img src=x onerror=alert(1)>');
 await expect(fixture.locator('img')).toHaveCount(0);await expect(fixture.locator('p').first()).toHaveText('오늘도 고생했어요.');
 expect(await page.evaluate(()=>window.translationRequests)).toHaveLength(1);
 await fixture.getByRole('button',{name:'Show original'}).click();await expect(fixture.locator('.translated-copy')).toBeHidden();
 await fixture.getByRole('button',{name:'See translation'}).click();expect(await page.evaluate(()=>window.translationRequests)).toHaveLength(1);
});
