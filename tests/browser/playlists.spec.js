import {test,expect} from '@playwright/test';
test('Curated music survives navigation, pauses BGM, supports queue and close',async({page})=>{
 await page.route('**/playlists',r=>r.fulfill({json:{playlists:[{id:'mix',title:'퇴근길',member_id:'jaein',description:'오늘의 선곡',tracks:[{title:'첫 곡',artist:'Artist',video_id:'abcdefghijk'},{title:'두 번째',artist:'Artist',video_id:'zyxwvutsrqp'}]}]}}));
 await page.route('**/members?board=staff',r=>r.fulfill({json:{members:[{id:'jaein',name:'재인'}]}}));
 await page.route('https://www.youtube.com/iframe_api',r=>r.fulfill({contentType:'text/javascript',body:`window.__music=[];window.YT={Player:class{constructor(id,o){this.o=o;this.state=2;document.getElementById(id).innerHTML='<div data-video-mock>Video</div>';setTimeout(()=>o.events.onReady({target:this}),0);}loadVideoById(id){window.__music.push(id);this.state=1;this.o.events.onStateChange({data:1});}getPlayerState(){return this.state}playVideo(){this.state=1;this.o.events.onStateChange({data:1})}pauseVideo(){this.state=2;this.o.events.onStateChange({data:2})}stopVideo(){this.state=2;}}};window.onYouTubeIframeAPIReady();`}));
 await page.goto('/manual.html');await page.locator('#music-library-open').click();await page.locator('.room-library').click();await page.locator('[data-playlist]').click();await page.locator('[data-track="0"]').click();
 await expect(page.locator('#music-player')).toBeVisible();await expect.poll(()=>page.evaluate(()=>window.__music.at(-1))).toBe('abcdefghijk');
 await page.locator('.site-nav a[href="departments.html"]').click();await expect(page.locator('body')).toHaveAttribute('data-page','departments');await expect(page.locator('#music-player')).toBeVisible();await expect(page.locator('[data-video-mock]')).toHaveCount(1);
 await page.locator('[data-music-next]').click();await expect(page.locator('[data-music-title]')).toHaveText('두 번째');await expect.poll(()=>page.evaluate(()=>window.__music.at(-1))).toBe('zyxwvutsrqp');
 await page.locator('#music-library-open').click();await page.locator('.room-library').click();await expect(page.locator('[data-playlist]')).toHaveCount(1);await page.keyboard.press('Escape');
 await page.locator('[data-music-queue]').click();await expect(page.locator('#music-library')).toBeVisible();await expect(page.locator('[data-track]')).toHaveCount(2);await expect(page.locator('[data-track="1"]')).toHaveAttribute('aria-current','true');await page.keyboard.press('Escape');
 await page.setViewportSize({width:320,height:800});await expect(page.locator('#music-player')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator('[data-music-close]').click();await expect(page.locator('#music-player')).toBeHidden();
});
test('Empty playlists and network retry remain usable',async({page})=>{
 let calls=0;await page.route('**/playlists',r=>++calls===1?r.fulfill({status:503,body:'unavailable'}):r.fulfill({json:{playlists:[]}}));await page.route('**/members?board=staff',r=>r.fulfill({json:{members:[]}}));
 await page.goto('/playlists.html');await page.locator('.room-retry').click();await page.locator('.room-library').click();await expect(page.locator('.music-empty')).toBeVisible();await expect(page.locator('#music-player')).toBeHidden();
});
const mixes=[{id:'beacon-test',title:'VINJO',member_id:'binjo',tracks:[{title:'One',artist:'Artist A',video_id:'abcdefghijk'},{title:'Two',artist:'Artist B',video_id:'zyxwvutsrqp'},{title:'Three',artist:'Artist C',video_id:'12345678901'}]},{id:'blackjack-test',title:'SEESAW',member_id:'siso',tracks:[{title:'Second side',artist:'Artist D',video_id:'ABCDEFGHIJK'}]}];
async function room(page){
 await page.route('**/playlists',r=>r.fulfill({json:{playlists:mixes}}));
 await page.route('https://www.youtube.com/iframe_api',r=>r.fulfill({contentType:'text/javascript',body:`window.__music=[];window.YT={Player:class{constructor(id,o){this.o=o;this.state=2;setTimeout(()=>o.events.onReady({target:this}),0)}loadVideoById(id){window.__music.push(id);this.state=1;this.o.events.onStateChange({data:1})}getPlayerState(){return this.state}playVideo(){this.state=1;this.o.events.onStateChange({data:1})}pauseVideo(){this.state=2;this.o.events.onStateChange({data:2})}stopVideo(){this.state=2}getDuration(){return 180}getCurrentTime(){return 20}seekTo(t){window.__seek=t}}};window.onYouTubeIframeAPIReady();`}));
 await page.goto('/playlists.html');await expect(page.locator('[data-room-track]')).toHaveCount(3);
}
test('CD themes, selection queue, pause, seek and internal navigation use actual playback state',async({page})=>{
 await room(page);await expect(page.locator('#music-player')).toBeHidden();
 await page.locator('[data-room-select]').click();await page.locator('[data-track-check]').nth(0).check();await page.locator('[data-track-check]').nth(2).check();await page.locator('[data-play-selection]').click();
 await expect(page.locator('.listening-room')).toHaveClass(/is-playing/);await expect.poll(()=>page.evaluate(()=>window.__music.at(-1))).toBe('abcdefghijk');
 await page.locator('[data-room-next]').click();await expect.poll(()=>page.evaluate(()=>window.__music.at(-1))).toBe('12345678901');await expect(page.locator('[data-room-next]')).toBeDisabled();
 await page.locator('[data-room-play]').click();await expect(page.locator('.listening-room')).not.toHaveClass(/is-playing/);
 await page.locator('[data-music-queue]').click();await expect(page.locator('[data-track]')).toHaveCount(2);await expect(page.locator('[data-track="1"]')).toHaveAttribute('aria-current','true');await page.keyboard.press('Escape');
 await page.locator('.room-progress input').fill('80');await page.locator('.room-progress input').dispatchEvent('change');await expect.poll(()=>page.evaluate(()=>window.__seek)).toBe(80);
 await page.locator('[data-clear-selection]').click();await expect(page.locator('[data-play-selection]')).toBeDisabled();
 await page.locator('[data-theme-next]').click();await expect(page.locator('.theme-title')).toHaveText('BLACKJACK');await expect(page.locator('[data-room-track]')).toHaveCount(1);
 await page.locator('.site-nav a[href="manual.html"]').click();await expect(page.locator('#music-player')).toBeVisible();await page.locator('#music-library-open').click();await expect(page.locator('.theme-title')).toHaveText('BEACON');await expect(page.locator('[aria-current=true][data-room-track]')).toHaveCount(1);
});
test('Music page supports 320px, theme swipe, searching and reduced motion',async({page})=>{
 await page.setViewportSize({width:320,height:800});await page.emulateMedia({reducedMotion:'reduce'});await room(page);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(await page.evaluate(()=>document.querySelector('.deck-body').getBoundingClientRect().top>=document.querySelector('.room-heading').getBoundingClientRect().bottom)).toBe(true);
 const stage=page.locator('.deck-stage');await stage.dispatchEvent('pointerdown',{button:0,clientX:220,clientY:100});await stage.dispatchEvent('pointerup',{clientX:80,clientY:110});await expect(page.locator('.theme-title')).toHaveText('BLACKJACK');
 await stage.focus();await page.keyboard.press('ArrowLeft');await expect(page.locator('.theme-title')).toHaveText('BEACON');
 await page.locator('.track-search input').fill('Two');await expect(page.locator('[data-room-track]')).toHaveCount(1);await page.locator('[data-room-track]').click();
 await expect(page.locator('.listening-room')).toHaveClass(/is-playing/);expect(await page.locator('.disc').evaluate(e=>getComputedStyle(e).animationName)).toBe('none');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
