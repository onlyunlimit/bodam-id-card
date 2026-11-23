import {test,expect} from '@playwright/test';
test('Mention picker supports repeated mentions, keyboard selection, IME and safe profile links',async({page})=>{
 await page.goto('/community.html?board=lucky');
 await page.evaluate(async()=>{
  const {attachMentions,mentionMarkup}=await import('/assets/mentions.js');
  const panel=document.createElement('section');panel.id='mention-fixture';panel.innerHTML='<textarea aria-label="입력" maxlength="100"></textarea><div id="mention-result"></div>';document.body.prepend(panel);
  const members=[{id:'jaein',name:'재인',board:'lucky'},{id:'danjo',name:'단조',board:'lucky'}];attachMentions(panel.querySelector('textarea'),()=>members);
  panel.querySelector('textarea').addEventListener('input',e=>document.querySelector('#mention-result').innerHTML=mentionMarkup(e.target.value,members));
 });
 const field=page.getByRole('textbox',{name:'입력'});await field.fill('@');await expect(page.locator('#mention-fixture').getByRole('option')).toHaveCount(2);await field.press('ArrowDown');await field.press('Enter');await expect(field).toHaveValue('@단조 ');
 await field.pressSequentially('@');await page.locator('#mention-fixture').getByRole('option',{name:'@재인 · LUCKY'}).click();await expect(field).toHaveValue('@단조 @재인 ');
 await expect(page.locator('#mention-result a')).toHaveCount(2);await expect(page.locator('#mention-result a').last()).toHaveAttribute('href','community.html?board=lucky&member=jaein');
 await field.fill('@재');await field.dispatchEvent('compositionstart');await field.press('Enter');await expect(field).not.toHaveValue('@재인 ');await field.dispatchEvent('compositionend');
 await field.fill('@');await field.press('Escape');await expect(page.getByRole('listbox')).toBeHidden();
 await field.fill('메일 test@example.com');await expect(page.getByRole('listbox')).toBeHidden();
});

test('Mention taps after existing text preserve the field and do not jump the page',async({browser,baseURL})=>{
 const context=await browser.newContext({hasTouch:true,isMobile:true,viewport:{width:390,height:844}});
 const page=await context.newPage();
 try{
  await page.goto(baseURL+'/community.html?board=lucky');
  await page.evaluate(async()=>{
   const {attachMentions}=await import('/assets/mentions.js');
   document.body.innerHTML='<div style="height:500px"></div><label>댓글<textarea id="touch-mention" style="width:300px;height:80px"></textarea></label><div style="height:1400px"></div>';
   attachMentions(document.querySelector('textarea'),()=>Array.from({length:25},(_,i)=>({id:'member-'+i,name:'멤버'+i,board:'lucky'})));
  });
  const field=page.locator('#touch-mention');await field.fill('오늘도 고생했어요 ');await field.tap();
  const before=await page.evaluate(()=>scrollY);await field.pressSequentially('@멤버');
  expect(Math.abs(await page.evaluate(()=>scrollY)-before)).toBeLessThan(30);
  await page.getByRole('option').first().tap();
  await expect(field).toHaveValue('오늘도 고생했어요 @멤버0 ');await expect(field).toBeFocused();
  await field.pressSequentially('고마워요 @');await page.getByRole('option').nth(1).tap();
  await expect(field).toHaveValue('오늘도 고생했어요 @멤버0 고마워요 @멤버1 ');
 }finally{await context.close();}
});
