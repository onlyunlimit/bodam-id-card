import {test,expect} from '@playwright/test';
test('Curated music survives navigation, pauses BGM, supports queue and close',async({page})=>{
 await page.route('**/playlists',r=>r.fulfill({json:{playlists:[{id:'mix',title:'퇴근길',member_id:'jaein',description:'오늘의 선곡',tracks:[{title:'첫 곡',artist:'Artist',video_id:'abcdefghijk'},{title:'두 번째',artist:'Artist',video_id:'zyxwvutsrqp'}]}]}}));
 await page.route('**/members?board=staff',r=>r.fulfill({json:{members:[{id:'jaein',name:'재인'}]}}));
 await page.route('https://www.youtube.com/iframe_api',r=>r.fulfill({contentType:'text/javascript',body:`window.__music=[];window.YT={Player:class{constructor(id,o){this.o=o;this.state=2;document.getElementById(id).innerHTML='<div data-video-mock>Video</div>';setTimeout(()=>o.events.onReady({target:this}),0);}loadVideoById(id){window.__music.push(id);this.state=1;this.o.events.onStateChange({data:1});}getPlayerState(){return this.state}playVideo(){this.state=1;this.o.events.onStateChange({data:1})}pauseVideo(){this.state=2;this.o.events.onStateChange({data:2})}stopVideo(){this.state=2;}}};window.onYouTubeIframeAPIReady();`}));
 await page.goto('/manual.html');await page.locator('#music-library-open').click();await page.locator('[data-room-track]').first().click();
 await expect(page.locator('#music-player')).toBeVisible();await expect.poll(()=>page.evaluate(()=>window.__music?.at(-1))).toBe('abcdefghijk');
 await page.locator('.site-nav a[href="departments.html"]').click();await expect(page.locator('body')).toHaveAttribute('data-page','departments');await expect(page.locator('#music-player')).toBeVisible();await expect(page.locator('[data-video-mock]')).toHaveCount(1);
 await page.locator('[data-music-next]').click();await expect(page.locator('[data-music-title]')).toHaveText('두 번째');await expect.poll(()=>page.evaluate(()=>window.__music?.at(-1))).toBe('zyxwvutsrqp');
 await page.locator('#music-library-open').click();await expect(page.locator('.room-library')).toHaveCount(0);
 await page.locator('[data-music-queue]').click();await expect(page.locator('#music-library')).toBeVisible();await expect(page.locator('[data-track]')).toHaveCount(2);await expect(page.locator('[data-track="1"]')).toHaveAttribute('aria-current','true');await page.keyboard.press('Escape');
 await page.setViewportSize({width:320,height:800});await expect(page.locator('#music-player')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 if(await page.locator('[data-music-collapse]').getAttribute('aria-expanded')==='false')await page.locator('[data-music-collapse]').click();await page.locator('[data-music-close]').click();await expect(page.locator('#music-player')).toBeHidden();
});
test('Empty playlists and network retry remain usable',async({page})=>{
 let calls=0;await page.route('**/playlists',r=>++calls===1?r.fulfill({status:503,body:'unavailable'}):r.fulfill({json:{playlists:[]}}));await page.route('**/members?board=staff',r=>r.fulfill({json:{members:[]}}));
 await page.goto('/playlists.html');await page.locator('.room-retry').click();await expect(page.locator('.room-empty')).toBeVisible();await expect(page.locator('#music-player')).toBeHidden();
});
const mixes=[{id:'beacon-test',title:'VINJO',member_id:'binjo',tracks:[{title:'One',artist:'Artist A',video_id:'abcdefghijk'},{title:'Two',artist:'Artist B',video_id:'zyxwvutsrqp'},{title:'Three',artist:'Artist C',video_id:'12345678901'}]},{id:'blackjack-test',title:'SEESAW',member_id:'siso',tracks:[{title:'Second side',artist:'Artist D',video_id:'ABCDEFGHIJK'}]}];
async function room(page,lists=mixes){
 await page.route('**/playlists',r=>r.fulfill({json:{playlists:lists}}));
 await page.route('https://www.youtube.com/iframe_api',r=>r.fulfill({contentType:'text/javascript',body:`window.__music=[];window.YT={Player:class{constructor(id,o){this.o=o;this.state=2;setTimeout(()=>o.events.onReady({target:this}),0)}loadVideoById(id){window.__music.push(id);this.state=1;this.o.events.onStateChange({data:1})}getPlayerState(){return this.state}playVideo(){this.state=1;this.o.events.onStateChange({data:1})}pauseVideo(){this.state=2;this.o.events.onStateChange({data:2})}stopVideo(){this.state=2}getDuration(){return 180}getCurrentTime(){return 20}seekTo(t){window.__seek=t}}};window.onYouTubeIframeAPIReady();`}));
 await page.goto('/playlists.html');await expect(page.locator('[data-room-track]')).toHaveCount(lists.reduce((n,p)=>n+p.tracks.length,0));await page.locator('[data-theme="1"]').click();await expect(page.locator('[data-room-track]')).toHaveCount(lists[0].tracks.length);
}
test('CD themes, selection queue, pause, seek and internal navigation use actual playback state',async({page})=>{
 await room(page);await expect(page.locator('#music-player')).toBeHidden();
 await page.locator('[data-room-select]').click();await page.locator('[data-track-check]').nth(0).check();await page.locator('[data-track-check]').nth(2).check();await page.locator('[data-play-selection]').click();
 await expect(page.locator('.listening-room')).toHaveClass(/is-playing/);await expect.poll(()=>page.evaluate(()=>window.__music?.at(-1))).toBe('abcdefghijk');
 await page.locator('[data-room-next]').click();await expect.poll(()=>page.evaluate(()=>window.__music?.at(-1))).toBe('12345678901');await expect(page.locator('[data-room-next]')).toBeDisabled();
 await page.locator('[data-room-play]').click();await expect(page.locator('.listening-room')).not.toHaveClass(/is-playing/);
 await page.locator('[data-music-queue]').click();await expect(page.locator('[data-track]')).toHaveCount(2);await expect(page.locator('[data-track="1"]')).toHaveAttribute('aria-current','true');await page.keyboard.press('Escape');
 await page.locator('.room-progress input').fill('80');await page.locator('.room-progress input').dispatchEvent('change');await expect.poll(()=>page.evaluate(()=>window.__seek)).toBe(80);
 await page.locator('[data-clear-selection]').click();await expect(page.locator('[data-play-selection]')).toBeDisabled();
 await page.locator('[data-theme="2"]').click();await expect(page.locator('.theme-title')).toHaveText('BLACKJACK');await expect(page.locator('[data-room-track]')).toHaveCount(1);
 await page.locator('.site-nav a[href="manual.html"]').click();await expect(page.locator('#music-player')).toBeVisible();await page.locator('#music-library-open').click();await expect(page.locator('.theme-title')).toHaveText('BEACON');await expect(page.locator('[aria-current=true][data-room-track]')).toHaveCount(1);
});
test('Mobile rows stay slim and expand playback controls inside the current song',async({page})=>{
 await page.setViewportSize({width:320,height:800});await page.emulateMedia({reducedMotion:'reduce'});await room(page);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(await page.evaluate(()=>document.querySelector('.deck-body').getBoundingClientRect().top>=document.querySelector('.room-heading').getBoundingClientRect().bottom)).toBe(true);
 const stage=page.locator('.deck-stage');await stage.dispatchEvent('pointerdown',{button:0,clientX:220,clientY:100});await stage.dispatchEvent('pointerup',{clientX:80,clientY:110});await expect(page.locator('.theme-title')).toHaveText('BLACKJACK');
 await stage.focus();await page.keyboard.press('ArrowLeft');await expect(page.locator('.theme-title')).toHaveText('BEACON');
 await expect(page.locator('.track-search')).toHaveCount(0);await page.locator('[data-room-track]').nth(1).click();
 await expect(page.locator('#music-player')).toBeVisible();await expect(page.locator('.track-player-slot')).toHaveCount(0);
 const sizes=await page.locator('.room-track').evaluateAll(es=>es.map(e=>({current:e.classList.contains('track-current'),height:e.getBoundingClientRect().height})));
 expect(sizes.filter(e=>!e.current).every(e=>e.height<=55)).toBe(true);expect(sizes.find(e=>e.current).height).toBeGreaterThan(100);
 await page.locator('.track-current .room-progress input').fill('65');await page.locator('.track-current .room-progress input').dispatchEvent('change');await expect.poll(()=>page.evaluate(()=>window.__seek)).toBe(65);
 await expect(page.locator('.listening-room')).toHaveClass(/is-playing/);expect(await page.locator('.disc').evaluate(e=>getComputedStyle(e).animationName)).toBe('none');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator('[data-music-next]').click();await expect(page.locator('.track-current .track-copy strong')).toHaveText('Three');await expect(page.locator('.track-player-slot')).toHaveCount(0);
 await page.locator('.site-nav a[href="manual.html"]').click();await expect(page.locator('#music-player')).not.toHaveClass(/is-row-player/);await expect(page.locator('#music-player')).toBeVisible();
});
test('Disc keeps its animation between same-character songs and settles upright when paused',async({page})=>{
 await room(page);await page.locator('[data-room-track]').first().click();
 await expect(page.locator('.listening-room')).toHaveClass(/is-playing/);
 await expect.poll(()=>page.locator('.disc').evaluate(e=>e.getAnimations().length)).toBe(1);
 await page.evaluate(()=>window.__discSpin=document.querySelector('.disc').getAnimations()[0]);
 await expect.poll(()=>page.evaluate(()=>window.__discSpin.currentTime)).toBeGreaterThan(100);
 await page.locator('[data-room-next]').click();
 expect(await page.evaluate(()=>document.querySelector('.disc').getAnimations()[0]===window.__discSpin)).toBe(true);
 await page.locator('[data-room-play]').click();
 await expect.poll(()=>page.locator('.disc').evaluate(e=>{const m=new DOMMatrixReadOnly(getComputedStyle(e).transform);return Math.abs(m.b)+Math.abs(m.a-1);})).toBeLessThan(.001);
 await page.locator('[data-room-play]').click();await page.emulateMedia({reducedMotion:'reduce'});
 await expect.poll(()=>page.locator('.disc').evaluate(e=>e.getAnimations().length)).toBe(0);
});
test('Album artwork differs from the character disc and the compact player survives navigation',async({page})=>{
 const lists=structuredClone(mixes);lists[0].tracks[0].video_id='T_V76Dm42bY';await room(page,lists);
 await expect(page.locator('.track-art').first()).toHaveCSS('background-image',/music-albums\/T_V76Dm42bY.webp/);
 await page.locator('[data-room-track]').first().click();await expect(page.locator('.disc-print')).toHaveCSS('background-image',/music-binjo.webp/);
 await expect(page.locator('.room-aura')).toHaveCSS('background-image',/music-albums\/T_V76Dm42bY.webp/);
 await expect(page.locator('.music-cover-play')).toHaveCSS('background-image',/music-albums\/T_V76Dm42bY.webp/);
 await expect(page.locator('.music-cover-play')).toBeVisible();
 await page.locator('[data-music-collapse]').click();await expect(page.locator('.music-artwork')).toBeHidden();await expect(page.locator('.music-video')).toBeVisible();
 expect(await page.locator('#music-player').evaluate(e=>e.getBoundingClientRect().height)).toBeLessThan(110);
 await page.locator('[data-music-play]').click();await expect(page.locator('.music-video')).toBeVisible();
 await page.locator('.site-nav a[href="manual.html"]').click();await expect(page.locator('#music-player')).toHaveClass(/is-collapsed/);await expect(page.locator('[data-music-title]')).toHaveText('One');
 await page.locator('[data-music-play]').click();await expect(page.locator('.music-video')).toBeVisible();
});
test('ALL bookmarks and circular scrolling work at 320px with a long catalogue',async({page})=>{
 await page.setViewportSize({width:320,height:800});const lists=structuredClone(mixes);lists[0].tracks=Array.from({length:20},(_,i)=>({title:'Song '+i,artist:'Artist',video_id:'abcdefghijk'}));await room(page,lists);
 await page.locator('[data-theme="0"]').click();await expect(page.locator('.theme-title')).toHaveText('ALL');await expect(page.locator('[data-room-track]')).toHaveCount(21);
 await expect(page.locator('.theme-dots button')).toHaveText(['ALL','BEACON','BLACKJACK','HKU']);
 const first=page.locator('.room-track').nth(3);const before=await first.evaluate(e=>e.style.getPropertyValue('--orbit-x'));
 await page.locator('.room-tracks').evaluate(e=>e.scrollTop=210);
 await expect.poll(()=>first.evaluate(e=>e.style.getPropertyValue('--orbit-x'))).not.toBe(before);
 await page.locator('[data-room-track]').last().focus();await expect(page.locator('[data-room-track]').last()).toBeInViewport();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('Music and work panels are exclusive; collapse and routing preserve the player',async({page})=>{
 for(const viewport of [{width:1280,height:720},{width:390,height:844}]){
  await page.setViewportSize(viewport);await room(page);await page.locator('[data-room-track]').first().click();
  await expect(page.locator('.listening-room')).toHaveClass(/is-playing/);
  await expect(page.locator('#floating-comms')).toBeHidden();
  await page.evaluate(()=>{window.__mediaNode=document.querySelector('#music-youtube');window.__loads=window.__music.length;});
  await page.locator('[data-music-collapse]').click();
  await expect(page.locator('.listening-room')).toHaveClass(/is-playing/);
  await expect(page.locator('.music-video')).toBeVisible();
  await page.locator('.site-nav a[href="manual.html"]').click();
  await expect(page.locator('#music-player')).toBeVisible();
  expect(await page.evaluate(()=>document.querySelector('#music-youtube')===window.__mediaNode&&window.__music.length===window.__loads)).toBe(true);
  await page.locator('#work-channel-open').click();await expect(page.locator('#music-player')).toBeHidden();await expect(page.locator('#floating-comms')).toBeVisible();
  await page.locator('#comms-hide').click();await expect(page.locator('#floating-comms')).toBeHidden();await expect(page.locator('#music-player')).toBeVisible();
  await expect(page.locator('[data-music-play]')).toHaveText('▶');await page.locator('[data-music-play]').click();await expect(page.locator('[data-music-play]')).toHaveText('Ⅱ');
 }
});

test('Bookmark lower corners remain buried in the CD including raised tabs',async({page})=>{
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:1000});await room(page);
  for(const i of [0,1,2,3]){
   await page.locator(`[data-theme="${i}"]`).click();
   // Allow the bookmark spring to settle before measuring the raised bottom edge.
   await expect.poll(()=>page.evaluate(()=>{
    const d=document.querySelector('.deck-body').getBoundingClientRect(),r=d.width/2;
    return [...document.querySelectorAll('.theme-dots [data-theme]')].every(b=>{const t=b.getBoundingClientRect();return [t.left+1,t.right-1].every(x=>Math.hypot(x-d.left-r,t.bottom-1-d.top-r)<r);});
   })).toBe(true);
  }
 }
});
