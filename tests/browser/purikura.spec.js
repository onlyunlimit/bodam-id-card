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
test('Size and rotation preview during dragging, with one undo step per adjustment',async({page})=>{
 const file=await fixture(page);await page.locator('#photo-file').setInputFiles(file);
 await expect(page.locator('#status')).toContainText('추가했어요');
 const canvas=page.locator('#photo-canvas');
 for(const [id,output,unit] of [['item-scale','scale-output','%'],['item-rotation','rotation-output','°']]){
  const slider=page.locator('#'+id),initial=await slider.inputValue(),before=await canvas.evaluate(e=>e.toDataURL());
  await slider.scrollIntoViewIfNeeded();const r=await slider.boundingBox();
  const ratio=await slider.evaluate(e=>(Number(e.value)-Number(e.min))/(Number(e.max)-Number(e.min)));
  await page.mouse.move(r.x+8+(r.width-16)*ratio,r.y+r.height/2);await page.mouse.down();
  await page.mouse.move(r.x+r.width*.7,r.y+r.height/2,{steps:6});
  expect(await slider.inputValue()).not.toBe(initial);
  await expect(page.locator('#'+output)).toHaveText((await slider.inputValue())+unit);
  expect((await canvas.evaluate(e=>e.toDataURL()))===before).toBe(false);
  await page.mouse.move(r.x+r.width*.85,r.y+r.height/2,{steps:6});
  const finalValue=await slider.inputValue();await page.mouse.up();
  await page.locator('#undo').click();await expect(slider).toHaveValue(initial);
  expect((await canvas.evaluate(e=>e.toDataURL()))===before).toBe(true);
  await page.locator('#redo').click();await expect(slider).toHaveValue(finalValue);
  await slider.focus();await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#'+output)).toHaveText((await slider.inputValue())+unit);
  await page.locator('#undo').click();await expect(slider).toHaveValue(finalValue);
 }
});
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
 await page.locator('[data-open-panel=inspector-panel]').click();await page.locator('#eyedropper').click();const c=page.locator('#photo-canvas');await c.scrollIntoViewIfNeeded();const rect=await c.boundingBox();
 await page.mouse.click(rect.x+rect.width*.25,rect.y+rect.height*.3);
 await expect(page.locator('#chroma-color')).toHaveValue('#00ff00');await expect(page.locator('#chroma-enabled')).toBeChecked();
 expect(await c.evaluate(e=>[...e.getContext('2d').getImageData(225,360,1,1).data])).toEqual([255,246,248,255]);
 await page.locator('[data-open-panel=tools-panel]').click();await page.locator('[data-tool=pen]').click();await c.scrollIntoViewIfNeeded();const before=await c.evaluate(e=>e.toDataURL());
 const touch=await page.context().newCDPSession(page),r=await c.boundingBox();
 for(const [type,x] of [['touchStart',.3],['touchMove',.6],['touchEnd',.6]])await touch.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x:r.x+r.width*x,y:r.y+r.height*.2}]});
 await touch.detach();
 expect(await c.evaluate(e=>e.toDataURL())).not.toBe(before);await page.locator('#undo').click();expect(await c.evaluate(e=>e.toDataURL())).toBe(before);
});
test('Two fingers resize and rotate the selected photo with a single undo step',async({page})=>{
 await page.setViewportSize({width:390,height:850});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const file=await fixture(page);await page.locator('#photo-file').setInputFiles(file);
 await expect(page.locator('#status')).toContainText('추가했어요');const c=page.locator('#photo-canvas');await c.scrollIntoViewIfNeeded();
 const before=await c.evaluate(e=>e.toDataURL()),box=await c.boundingBox(),cx=box.x+box.width/2,cy=box.y+box.height/2;
 const touch=await page.context().newCDPSession(page);
 const points=(dx,dy)=>[{id:1,x:cx-dx,y:cy-dy},{id:2,x:cx+dx,y:cy+dy}];
 await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points(30,0)});
 await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:points(50,20)});
 await expect.poll(async()=>Number(await page.locator('#item-scale').inputValue())).toBeGreaterThan(160);
 await expect.poll(async()=>Number(await page.locator('#item-rotation').inputValue())).toBeGreaterThan(15);
 expect((await c.evaluate(e=>e.toDataURL()))===before).toBe(false);
 await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:points(20,-10)});
 await expect.poll(async()=>Number(await page.locator('#item-scale').inputValue())).toBeLessThan(100);
 await expect.poll(async()=>Number(await page.locator('#item-rotation').inputValue())).toBeLessThan(-15);
 const one=points(20,-10).slice(1),pinched=await c.evaluate(e=>e.toDataURL());
 await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:one});
 expect((await c.evaluate(e=>e.toDataURL()))===pinched).toBe(true);
 const pinchX=Number(await page.locator('#item-x').inputValue());
 await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...one[0],x:one[0].x+15}]});
 await expect.poll(async()=>Number(await page.locator('#item-x').inputValue())).toBeGreaterThan(pinchX);
 await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 const after=await c.evaluate(e=>e.toDataURL());
 await page.locator('#undo').click();await expect(page.locator('#item-scale')).toHaveValue('100');await expect(page.locator('#item-rotation')).toHaveValue('0');
 expect((await c.evaluate(e=>e.toDataURL()))===before).toBe(true);
 await page.locator('#redo').click();expect((await c.evaluate(e=>e.toDataURL()))===after).toBe(true);
 // A fresh one-finger gesture still drags normally after both contacts end.
 await c.scrollIntoViewIfNeeded();const r=await c.boundingBox(),x=r.x+r.width/2,y=r.y+r.height/2;
 const previousX=Number(await page.locator('#item-x').inputValue());
 await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:3,x,y}]});
 await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:3,x:x+15,y}]});
 await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 expect(Number(await page.locator('#item-x').inputValue())).toBeGreaterThan(previousX);
 await touch.detach();expect(errors).toEqual([]);
});

test('Context actions crop nondestructively, flip, tint and fade images, and paper keeps pixel size',async({page})=>{
 const file=await fixture(page);await page.locator('#photo-file').setInputFiles(file);await expect(page.locator('#status')).toContainText('추가했어요');
 const canvas=page.locator('#photo-canvas'),pixels=()=>canvas.evaluate(e=>e.toDataURL());
 const redBounds=()=>canvas.evaluate(e=>{const c=e.getContext('2d'),d=c.getImageData(0,0,e.width,e.height).data;let minX=e.width,maxX=0,minY=e.height,maxY=0;for(let y=0;y<e.height;y++)for(let x=0;x<e.width;x++){const i=(y*e.width+x)*4;if(d[i]>250&&d[i+1]<5&&d[i+2]<5){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}}return [maxX-minX,maxY-minY];});
 await expect(page.locator('#quick-remove')).toBeVisible();const original=await pixels(),size=await redBounds();
 await page.locator('#quick-crop').click();await expect(page.locator('#crop-dialog')).toBeVisible();
 await page.locator('#crop-width').fill('50');await page.locator('#crop-width').blur();await page.locator('#crop-apply').click();
 await expect(page.locator('#crop-dialog')).not.toBeVisible();expect((await pixels())===original).toBe(false);
 const cropped=await pixels();await page.locator('#flip-x').click();await expect(page.locator('#flip-x')).toHaveAttribute('aria-pressed','true');expect((await pixels())===cropped).toBe(false);
 await page.locator('#undo').click();expect((await pixels())===cropped).toBe(true);
 await page.locator('#crop-restore').click();expect((await pixels())===original).toBe(true);
 await page.locator('#item-opacity').fill('40');await expect(page.locator('#opacity-output')).toHaveText('40%');expect((await pixels())===original).toBe(false);await page.locator('#undo').click();
 await page.locator('#image-filter').selectOption('mono');const gray=await canvas.evaluate(e=>[...e.getContext('2d').getImageData(450,500,1,1).data]);expect(gray[0]).toBe(gray[1]);expect(gray[1]).toBe(gray[2]);await page.locator('#undo').click();
 await page.getByText('종이 & 프레임',{exact:false}).click();await page.locator('#paper-size').selectOption('square');expect(await redBounds()).toEqual(size);await expect(page.locator('#item-scale')).toHaveValue('100');
 await page.locator('#frame').selectOption('lace');expect(await redBounds()).toEqual(size);
 await page.locator('#frame-front').click();await expect(page.locator('#frame-layer-label')).toContainText('맨앞');await page.locator('#frame-down').click();await expect(page.locator('#frame-layer-label')).toContainText('1개');
 await page.locator('#item-scale').locator('..').getByRole('button',{name:'크기 늘리기'}).click();await expect(page.locator('#item-scale')).toHaveValue('101');await page.locator('#undo').click();await expect(page.locator('#item-scale')).toHaveValue('100');
 await page.locator('#quick-remove').click();await expect(page.locator('#selection-actions')).toBeHidden();await expect(page.locator('#empty-note')).toBeVisible();await page.locator('#undo').click();await expect(page.locator('#empty-note')).toBeHidden();await canvas.click();await expect(page.locator('#selection-actions')).toBeVisible();
});

test('Font previews apply to text layers and outlined watermarks; foreground frame covers photos',async({page},info)=>{
 const file=await fixture(page);await page.locator('#photo-file').setInputFiles(file);await expect(page.locator('#status')).toContainText('추가했어요');
 await page.evaluate(()=>document.fonts.ready);expect(await page.evaluate(()=>document.fonts.check('24px Jua','우리'))).toBe(true);
 await page.getByText('글씨 & 스티커',{exact:false}).click();
 await page.locator('[data-font-picker=text-font] [data-font=pen]').click();await page.locator('#text-input').fill('우리의 오늘 ♡');await page.locator('#text-add').click();
 await expect(page.locator('#edit-text-box')).toBeVisible();await expect(page.locator('#edit-font')).toHaveValue('pen');await expect(page.locator('#layer-select option')).toHaveCount(2);
 await page.locator('[data-font-picker=edit-font] [data-font=jua]').click();await expect(page.locator('#edit-font')).toHaveValue('jua');
 await page.locator('#item-rotation').fill('15');await page.locator('#item-scale').fill('120');await page.locator('#layer-down').click();expect(await page.locator('#layer-select option').last().textContent()).toContain('글자');
 await page.locator('#watermark-on').check();await page.locator('#watermark-text').fill('우리 둘의 기념일');await page.locator('#watermark-text').blur();await page.locator('[data-font-picker=watermark-font] [data-font=brush]').click();await page.locator('#watermark-outline').fill('5');await page.locator('#watermark-size').fill('40');
 const downloadPromise=page.waitForEvent('download');await page.locator('#save-png').click();await (await downloadPromise).saveAs(info.outputPath('styled.png'));
 await page.locator('#layer-select').selectOption({label:'사진 · photo.png'});await page.locator('#item-scale').fill('250');
 await page.getByText('종이 & 프레임',{exact:false}).click();await page.locator('#frame').selectOption('film');
 const edge=()=>page.locator('#photo-canvas').evaluate(e=>[...e.getContext('2d').getImageData(5,400,1,1).data]);const behind=await edge();await page.locator('#frame-front').click();expect(await edge()).not.toEqual(behind);expect(await edge()).toEqual([37,27,36,255]);
 await page.screenshot({path:info.outputPath('editor-desktop.png'),fullPage:true});
});

test('Mobile side panels open, close, keep focus, and expose context crop and delete',async({page},info)=>{
 await page.setViewportSize({width:320,height:850});const file=await fixture(page);
 await expect(page.locator('#tools-panel')).toBeHidden();await expect(page.locator('#inspector-panel')).toBeHidden();
 await page.locator('[data-open-panel=tools-panel]').click();await expect(page.locator('#tools-panel')).toBeVisible();
 await page.locator('#photo-file').setInputFiles(file);await expect(page.locator('#status')).toContainText('추가했어요');await expect(page.locator('#tools-panel')).toBeHidden();
 await page.locator('#quick-crop').click();await expect(page.locator('#crop-dialog')).toBeVisible();const crop=page.locator('#crop-canvas'),r=await crop.boundingBox();
 await page.mouse.move(r.x+r.width*.1,r.y+r.height*.1);await page.mouse.down();await page.mouse.move(r.x+r.width*.8,r.y+r.height*.8);await page.mouse.up();await page.locator('#crop-apply').click();
 await page.locator('#quick-edit').click();await expect(page.locator('#inspector-panel')).toBeVisible();
 await page.locator('#item-scale').locator('..').getByRole('button',{name:'크기 늘리기'}).click();await expect(page.locator('#item-scale')).toHaveValue('101');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);await page.screenshot({path:info.outputPath('editor-mobile-panel.png'),fullPage:true});
 await page.keyboard.press('Escape');await expect(page.locator('#inspector-panel')).toBeHidden();await expect(page.locator('[data-open-panel=inspector-panel]')).toBeFocused();
 await page.screenshot({path:info.outputPath('editor-mobile-canvas.png'),fullPage:true});
 await page.locator('#quick-remove').click();await expect(page.locator('#empty-note')).toBeVisible();
});

test('Dragging snaps to the center with a visible guide and can be switched off',async({page})=>{
 const file=await fixture(page);await page.locator('#photo-file').setInputFiles(file);await expect(page.locator('#status')).toContainText('추가했어요');
 await page.locator('#item-x').fill('410');await page.locator('#item-x').dispatchEvent('change');
 const c=page.locator('#photo-canvas');await c.scrollIntoViewIfNeeded();const r=await c.boundingBox();
 await page.mouse.move(r.x+r.width*410/900,r.y+r.height/2);await page.mouse.down();await page.mouse.move(r.x+r.width*448/900,r.y+r.height/2,{steps:5});
 await expect(page.locator('#item-x')).toHaveValue('450');expect(await c.evaluate(e=>[...e.getContext('2d').getImageData(450,100,1,1).data])).toEqual([0,143,159,255]);await page.mouse.up();
 expect(await c.evaluate(e=>[...e.getContext('2d').getImageData(450,100,1,1).data])).toEqual([255,246,248,255]);
 await page.locator('#snap-on').uncheck();await c.scrollIntoViewIfNeeded();const b=await c.boundingBox();
 await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width*454/900,b.y+b.height/2);await page.mouse.up();await expect(page.locator('#item-x')).toHaveValue('454');
});
