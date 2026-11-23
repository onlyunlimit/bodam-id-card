import {test,expect} from '@playwright/test';
test('Uploads retain a 2560px detailed photo rather than dropping to a small low-quality preview',async({page})=>{
 await page.goto('/community.html?board=lucky');
 const result=await page.evaluate(async()=>{
  const {compressImage}=await import('/assets/community-media.js');
  const canvas=document.createElement('canvas');canvas.width=3200;canvas.height=2400;const ctx=canvas.getContext('2d');
  const gradient=ctx.createLinearGradient(0,0,3200,2400);gradient.addColorStop(0,'#21374d');gradient.addColorStop(1,'#e2b997');ctx.fillStyle=gradient;ctx.fillRect(0,0,3200,2400);
  for(let y=0;y<2400;y+=7)for(let x=0;x<3200;x+=7){ctx.fillStyle=`rgba(${(x*17+y*31)%256},${(x*11+y*7)%256},${(x+y*19)%256},.2)`;ctx.fillRect(x,y,4,4);}
  const blob=await new Promise(r=>canvas.toBlob(r,'image/png'));const data=await compressImage(new File([blob],'photo.png',{type:'image/png'}));
  const converted=await (await fetch(data)).blob(),bitmap=await createImageBitmap(converted);
  return {width:bitmap.width,height:bitmap.height,bytes:converted.size};
 });
 expect(result.width).toBe(2560);expect(result.height).toBe(1920);expect(result.bytes).toBeGreaterThan(409600);expect(result.bytes).toBeLessThanOrEqual(1800000);
});
