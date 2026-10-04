import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
async function fixture(page){
 await page.route('**/members?board=*',r=>r.fulfill({json:{members:[{name:'공유 DB 인물',avatar_url:'https://studio.test/member.png'}]}}));
 await page.goto('/purikura.html');
 const data=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=200;c.height=300;const x=c.getContext('2d');x.fillStyle='#00ff00';x.fillRect(0,0,200,300);x.fillStyle='#ff0000';x.fillRect(60,70,80,120);return c.toDataURL('image/png').split(',')[1];});
 const buffer=Buffer.from(data,'base64');
 await page.route('https://studio.test/**',r=>r.fulfill({contentType:'image/png',body:buffer,headers:{'Access-Control-Allow-Origin':'*'}}));
 await page.route('https://cdn.caveduck.io/**',r=>r.fulfill({contentType:'image/png',body:buffer,headers:{'Access-Control-Allow-Origin':'*'}}));
 return {name:'photo.png',mimeType:'image/png',buffer};
}
test('Studio uploads, positions, draws, removes chroma and exports an unselected PNG with optional watermark',async({page},info)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());const file=await fixture(page);
 await page.locator('#photo-file').setInputFiles(file);await expect(page.locator('#layer-select option')).toHaveCount(1);await expect(page.locator('#status')).toContainText('추가');
 const c=page.locator('#photo-canvas'),before=await c.evaluate(e=>e.toDataURL());
 await page.locator('#chroma-enabled').check();await expect(page.locator('#chroma-enabled')).toBeChecked();expect(await c.evaluate(e=>e.toDataURL())).not.toBe(before);
 await page.locator('#undo').click();await expect(page.locator('#chroma-enabled')).not.toBeChecked();await page.locator('#redo').click();await expect(page.locator('#chroma-enabled')).toBeChecked();
 await page.locator('#item-rotation').fill('30');await page.locator('#item-rotation').dispatchEvent('change');await expect(page.locator('#rotation-output')).toHaveText('30°');
 await page.locator('#item-x').fill('300');await page.locator('#item-x').dispatchEvent('change');await expect(page.locator('#item-x')).toHaveValue('300');
 await page.getByText('글씨 & 스티커',{exact:false}).click();await page.locator('#text-input').fill('함께한 오늘 ♡');await page.locator('#text-add').click();await expect(page.locator('#layer-select option')).toHaveCount(2);
 await page.locator('#sticker-file').setInputFiles(file);await expect(page.locator('#layer-select option')).toHaveCount(3);await page.locator('#duplicate').click();await expect(page.locator('#layer-select option')).toHaveCount(4);await page.locator('#remove').click();await expect(page.locator('#layer-select option')).toHaveCount(3);
 await page.locator('[data-tool=heart]').click();await c.scrollIntoViewIfNeeded();const inkBefore=await c.evaluate(e=>e.toDataURL());const rect=await c.boundingBox();await page.mouse.move(rect.x+rect.width*.2,rect.y+rect.height*.15);await page.mouse.down();await page.mouse.move(rect.x+rect.width*.8,rect.y+rect.height*.25,{steps:15});await page.mouse.up();expect(await c.evaluate(e=>e.toDataURL())).not.toBe(inkBefore);
 await page.locator('#watermark-on').check();await page.locator('#watermark-text').fill('재인 × 나');await page.locator('#watermark-text').blur();
 const downloadPromise=page.waitForEvent('download');await page.locator('#save-png').click();const download=await downloadPromise;expect(download.suggestedFilename()).toMatch(/\.png$/);await download.saveAs(info.outputPath('studio.png'));const png=await readFile(info.outputPath('studio.png'));expect([...png.subarray(0,8)]).toEqual([137,80,78,71,13,10,26,10]);expect([png.readUInt32BE(16),png.readUInt32BE(20)]).toEqual([900,1200]);
 const dimensions=await page.evaluate(async()=>{const c=document.querySelector('canvas');return [c.width,c.height];});expect(dimensions).toEqual([900,1200]);
 await page.screenshot({path:info.outputPath('studio-desktop.png'),fullPage:true});
 await page.locator('#watermark-on').uncheck();await page.locator('#clear').click();await expect(page.locator('#empty-note')).toBeVisible();await page.locator('#undo').click();await expect(page.locator('#empty-note')).toBeHidden();expect(errors).toEqual([]);
});
test('Studio imports URL and shared catalogue, reports bad links and fits mobile layouts',async({page},info)=>{
 page.on('dialog',d=>d.accept());await fixture(page);
 await page.locator('#photo-url').fill('https://studio.test/photo.png');await page.locator('#photo-link').click();await expect(page.locator('#status')).toContainText('추가했어요');
 await expect(page.locator('#gallery-select')).toContainText('공유 DB 인물');await page.locator('#gallery-random').click();await expect(page.locator('#layer-select option')).toHaveCount(2);
 await page.locator('#photo-url').fill('javascript:alert(1)');await page.locator('#photo-link').click();await expect(page.locator('#status')).toContainText('HTTPS');await expect(page.locator('#layer-select option')).toHaveCount(2);
 await page.getByText('종이 & 프레임',{exact:false}).click();await page.locator('#paper-size').selectOption('strip');await expect(page.locator('#size-label')).toHaveText('600 × 1800 PX');await page.locator('#undo').click();await expect(page.locator('#size-label')).toHaveText('900 × 1200 PX');
 for(const width of [390,320]){await page.setViewportSize({width,height:850});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);await page.screenshot({path:info.outputPath('studio-'+width+'.png'),fullPage:true});}
});
test('Mobile eyedropper samples the photo and touch strokes can be undone',async({page})=>{
 await page.setViewportSize({width:390,height:850});const file=await fixture(page);
 await page.locator('#photo-file').setInputFiles(file);await expect(page.locator('#status')).toContainText('추가했어요');
 await page.locator('#eyedropper').click();const c=page.locator('#photo-canvas');await c.scrollIntoViewIfNeeded();const rect=await c.boundingBox();
 await page.mouse.click(rect.x+rect.width*.25,rect.y+rect.height*.3);
 await expect(page.locator('#chroma-color')).toHaveValue('#00ff00');await expect(page.locator('#chroma-enabled')).toBeChecked();
 expect(await c.evaluate(e=>[...e.getContext('2d').getImageData(225,360,1,1).data])).toEqual([255,246,248,255]);
 await page.locator('[data-tool=pen]').click();await c.scrollIntoViewIfNeeded();const before=await c.evaluate(e=>e.toDataURL());
 const touch=await page.context().newCDPSession(page),r=await c.boundingBox();
 for(const [type,x] of [['touchStart',.3],['touchMove',.6],['touchEnd',.6]])await touch.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x:r.x+r.width*x,y:r.y+r.height*.2}]});
 await touch.detach();
 expect(await c.evaluate(e=>e.toDataURL())).not.toBe(before);await page.locator('#undo').click();expect(await c.evaluate(e=>e.toDataURL())).toBe(before);
});
