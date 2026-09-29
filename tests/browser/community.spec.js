import { test, expect } from '@playwright/test';
const api = 'https://sgia-api.example';
async function mock(page) {
  const posts = [],
    comments = [],
    members = [{ id: 'jaein', board: 'lucky', name: '재인', bio: '반가워요', avatar_url: '' }];
  await page.route('**/assets/service-config.js', (route) =>
    route.fulfill({
      contentType: 'text/javascript',
      body: `export const serviceConfig={api:'${api}',turnstileSiteKey:'test-site'};`,
    }),
  );
  await page.route('https://challenges.cloudflare.com/turnstile/**', (route) =>
    route.fulfill({
      contentType: 'text/javascript',
      body: `let seq=0;const widgets=new Map();window.turnstile={render:(el,o)=>{const id=++seq;widgets.set(id,o);setTimeout(()=>{if(widgets.has(id))o.callback('test-token')},30);return id;},reset:id=>{setTimeout(()=>widgets.get(id)?.callback('test-token'),30)},remove:id=>widgets.delete(id)};`,
    }),
  );
  await page.route(api + '/**', async (route) => {
    const req = route.request(),
      url = new URL(req.url()),
      method = req.method(),
      data = req.postDataJSON?.();
    if (url.pathname === '/members')
      return route.fulfill({
        json: { members: members.filter((m) => m.board === url.searchParams.get('board')) },
      });
    if (url.pathname === '/artist-comments')
      return route.fulfill({
        json: {
          comments: comments
            .filter((c) => c.member_id)
            .map((c) => ({ ...c, name: '재인', title: posts[0]?.title })),
          more: false,
        },
      });
    if (url.pathname === '/visitors') return route.fulfill({ json: { today: 1, total: 1 } });
    if (url.pathname === '/posts' && method === 'GET')
      return route.fulfill({
        json: {
          posts: posts
            .filter(
              (p) =>
                p.board === url.searchParams.get('board') &&
                (url.searchParams.get('feed') === 'artist'
                  ? p.member_id
                  : url.searchParams.get('feed') === 'fan'
                    ? !p.member_id
                    : true),
            )
            .map((p) => ({ ...p, comments: comments.filter((c) => c.post_id === p.id).length })),
          more: false,
        },
      });
    if (url.pathname === '/posts' && method === 'POST') {
      posts.push({
        ...data,
        images: (data.images || []).map((_, i) => ({ id: 'photo-' + i })),
        id: '11111111-1111-4111-8111-111111111111',
        pin_length: 6,
        created_at: Date.now(),
      });
      return route.fulfill({ status: 201, json: { id: posts.at(-1).id } });
    }
    if (url.pathname.endsWith('/comments') && method === 'POST') {
      comments.push({
        ...data,
        id: '22222222-2222-4222-8222-' + String(comments.length + 1).padStart(12, '0'),
        pin_length: 6,
        post_id: posts[0].id,
        created_at: Date.now(),
      });
      return route.fulfill({ status: 201, json: { id: comments[0].id } });
    }
    if (url.pathname.endsWith('/like'))
      return route.fulfill({ json: { liked: data.liked, likes: data.liked ? 1 : 0 } });
    if (method === 'PATCH') {
      const item = url.pathname.startsWith('/comments') ? comments[0] : posts[0];
      Object.assign(item, data, { updated_at: Date.now() });
      return route.fulfill({ json: { ok: true } });
    }
    if (method === 'DELETE') {
      if (url.pathname.startsWith('/comments')) comments.splice(0);
      else posts.splice(0);
      return route.fulfill({ json: { ok: true } });
    }
    return route.fulfill({ json: { post: posts[0], comments } });
  });
  return { posts, comments, members };
}
test('Shared board creates and edits posts, posts comments with nickname/time and treats HTML as text', async ({
  page,
}) => {
  const fixture = await mock(page);
  await page.goto('/community.html');
  await page.locator('#write-post').click();
  await page.locator('[name=title]').fill('첫 응원');
  await page.locator('[name=author]').fill('익명 팬');
  await page.locator('[name=password]').fill('012345');
  await page.locator('[name=body]').fill('<img src=x onerror=alert(1)> 응원합니다');
  await page.locator('[name=consent]').check();
  await page.locator('#post-form button[type=submit]').click();
  await expect(page.locator('.post-row')).toContainText('첫 응원');
  await page.locator('.post-row').click();
  await expect(page.locator('.post-body')).toContainText('<img src=x');
  await expect(page.locator('.post-body img')).toHaveCount(0);
  await page.locator('#comment-form [name=author]').fill('응원단');
  await page.locator('#comment-form [name=password]').fill('123456');
  await page.locator('#comment-form [name=body]').fill('오늘도 무사 귀환');
  await page.locator('#comment-form [name=consent]').check();
  await page.locator('#comment-form button[type=submit]').click();
  await expect(page.locator('.comment-row')).toContainText('응원단');
  await expect(page.locator('.comment-row')).toContainText('오늘도 무사 귀환');
  await page.locator('#post-edit').click();
  await page.locator('#edit-form [name=title]').fill('수정한 응원');
  await page.locator('#edit-form [name=password]').fill('012345');
  await page.locator('#edit-form button[type=submit]').click();
  await expect(page.locator('#document-title')).toHaveText('수정한 응원');
  expect(fixture.posts[0].title).toBe('수정한 응원');
});
test('Staff board gates its UI and offers monster/custom departments without granting admin', async ({
  page,
}) => {
  const fixture = await mock(page);
  await page.goto('/community.html?board=staff');
  await expect(page.locator('#staff-board-lock')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('#board-login').click();
  await page.locator('#login-submit').click();
  await expect(page.locator('#board-workspace')).toBeVisible();
  await page.locator('#write-post').click();
  await expect(page.locator('#department-choice option', { hasText: '괴물' })).toBeAttached();
  await page.locator('#department-choice').selectOption('custom');
  await page.locator('[name=customDepartment]').fill('연구소 야간반');
  await page.locator('[name=title]').fill('야간 근무');
  await page.locator('[name=author]').fill('익명');
  await page.locator('[name=password]').fill('432100');
  await page.locator('[name=body]').fill('오늘 식당 몇 시까지 하나요?');
  await page.locator('[name=consent]').check();
  await page.locator('#post-form button[type=submit]').click();
  await expect(page.locator('.post-row')).toContainText('연구소 야간반');
  expect(fixture.posts[0].board).toBe('staff');
  await page.locator('#viewer-toggle').click();
  await expect(page.locator('#staff-board-lock')).toBeVisible();
  await expect(page.locator('.post-row')).toHaveCount(0);
});

test('Fan photos survive editing; replies and comment hearts work; artist feeds stay separate', async ({
  page,
}) => {
  const f = await mock(page);
  await page.goto('/community.html?board=lucky');
  await page.locator('#write-post').click();
  await page.locator('#post-form [name=title]').fill('사진과 함께');
  await page.locator('#post-form [name=author]').fill('팬');
  await page.locator('#post-form [name=password]').fill('123456');
  await page.locator('#post-form [name=body]').fill('함께한 순간');
  await page.locator('#post-form input[type=file]').setInputFiles('assets/art/id-frame.png');
  await expect(page.locator('.upload-image')).toHaveCount(1);
  await page.locator('[name=consent]').check();
  await page.locator('#post-form button[type=submit]').click();
  await page.locator('.post-row').click();
  await page.locator('#post-edit').click();
  await expect(page.locator('.upload-image')).toHaveCount(1);
  await page.locator('#edit-form [name=password]').fill('123456');
  await page.locator('#edit-form button[type=submit]').click();
  await expect(page.locator('.post-photos img')).toHaveCount(2);
  expect(f.posts[0].images).toEqual([{ id: 'photo-0' }]);
  for (const [index, body] of ['첫 댓글', '대댓글'].entries()) {
    if (index) await page.locator('[data-reply]').first().click();
    await page.locator('#comment-form [name=author]').fill('팬');
    await page.locator('#comment-form [name=password]').fill('654321');
    await page.locator('#comment-form [name=body]').fill(body);
    await page.locator('#comment-form [name=consent]').check();
    await page.locator('#comment-form button[type=submit]').click();
    await expect(page.locator('.comment-row')).toHaveCount(index + 1);
  }
  expect(f.comments[1].parent_id).toBe(f.comments[0].id);
  await page.locator('[data-comment-like]').last().click();
  await expect(page.locator('[data-comment-like]').last()).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#document-dialog').evaluate((d) => d.close());
  f.posts.push({
    id: 'official',
    board: 'lucky',
    title: '재인의 소식',
    body: '안녕하세요',
    member_id: 'jaein',
    member: f.members[0],
    created_at: Date.now(),
  });
  f.comments.push({
    id: 'artist-reply',
    post_id: f.posts[0].id,
    member_id: 'jaein',
    body: '고마워요',
    created_at: Date.now(),
  });
  await page.locator('[data-feed=artist]').click();
  await expect(page.locator('.post-row')).toHaveCount(1);
  await expect(page.locator('.post-row')).toContainText('재인의 소식');
  await page.locator('[data-feed=comments]').click();
  await expect(page.locator('.post-row')).toContainText('고마워요');
  await page.locator('[data-member=jaein]').click();
  await expect(page.locator('.community-profile')).toContainText('반가워요');
  await expect(page.locator('.community-profile a')).toHaveAttribute('href', /admin.*member=jaein/);
});
test('Both community themes fit small screens and expose four feeds', async ({
  page,
}, testInfo) => {
  await mock(page);
  for (const board of ['lucky', 'obsidus']) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('/community.html?board=' + board);
    await expect(page.locator('.fan-feed-tabs button')).toHaveCount(4);
    await expect(page.locator('.community-admin')).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath(board + '-desktop.png'), fullPage: true });
    await page.setViewportSize({ width: 320, height: 800 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      320,
    );
    await page.screenshot({ path: testInfo.outputPath(board + '-mobile.png'), fullPage: true });
    await page.locator('#write-post').click();
    await expect(page.locator('#post-form button[type=submit]')).toBeEnabled();
    const slot = await page.locator('.captcha-slot').boundingBox();
    const widget = await page.locator('.captcha-widget').boundingBox();
    expect(slot.height).toBeLessThanOrEqual(65);
    expect(widget.width).toBeLessThanOrEqual(slot.width + 1);
    await page.locator('#document-dialog').evaluate(d => d.close());
  }
});

test('Community palette covers the shell and restores the saved theme on navigation and history', async ({
  page,
}) => {
  await mock(page);
  await page.goto('/beacon.html');
  await page
    .locator('body')
    .evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
  const base = await page.evaluate(() => ({
    color: getComputedStyle(document.body).backgroundColor,
    theme: document.documentElement.dataset.theme,
  }));
  await page.locator('.site-nav a[href="community.html"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-community-theme', 'lucky');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(243, 233, 239)');
  await expect(page.locator('.site-footer')).toHaveCSS('background-color', 'rgb(248, 237, 245)');
  await page.locator('.community-switch a[href$="board=obsidus"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-community-theme', 'obsidus');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(20, 20, 22)');
  await expect(page.locator('.site-nav')).toHaveCSS('background-color', 'rgb(25, 25, 28)');
  expect(await page.locator('html').getAttribute('data-theme')).toBe(base.theme);
  await page.locator('.site-nav a[href="departments.html"]').click();
  await expect(page.locator('html')).not.toHaveAttribute('data-community-theme');
  await expect(page.locator('body')).toHaveCSS('background-color', base.color);
  await page.goBack();
  await expect(page.locator('html')).toHaveAttribute('data-community-theme', 'obsidus');
  await page.goForward();
  await expect(page.locator('html')).not.toHaveAttribute('data-community-theme');
  await expect(page.locator('body')).toHaveCSS('background-color', base.color);
});
