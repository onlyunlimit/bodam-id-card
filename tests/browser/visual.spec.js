import { test, expect } from '@playwright/test';

test('Real portraits render and desktop, tablet, phone layouts stay within bounds',async({page})=>{
  test.setTimeout(90000);
  await page.goto('/');
  await page.locator('#personnel').scrollIntoViewIfNeeded();
  await page.locator('#viewer-toggle').click();
  await expect.poll(()=>page.locator('.portrait').evaluateAll(imgs=>imgs.filter(i=>i.complete&&i.naturalWidth>0).length),{timeout:20000}).toBe(4);
  await page.evaluate(()=>document.fonts.ready);
  await page.locator('[data-team="all"]').click();
  for(const width of [320,390,768,1024,1440]) {
    await page.setViewportSize({width,height:900});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),`${width}px body width`).toBe(true);
    const clipped=await page.locator('.card-back').evaluateAll(cards=>cards.filter(c=>c.scrollHeight>c.clientHeight+2).map(c=>({height:c.clientHeight,scroll:c.scrollHeight,text:c.textContent.slice(0,90)})));
    expect(clipped,`${width}px card backs`).toEqual([]);
  }
});
