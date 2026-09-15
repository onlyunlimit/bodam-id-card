import { test, expect } from '@playwright/test';
const api = 'https://sgia-api.example';
async function mock(page) {
  const posts = [],
    comments = [];
  await page.route('**/assets/service-config.js', (route) =>
    route.fulfill({
      contentType: 'text/javascript',
      body: `export const serviceConfig={api:'${api}',turnstileSiteKey:'test-site'};`,
    }),
  );
  await page.route('https://challenges.cloudflare.com/turnstile/**', (route) =>
    route.fulfill({
      contentType: 'text/javascript',
      body: "window.turnstile={render:(el,o)=>{setTimeout(()=>o.callback('test-token'),20);return 1;},reset:()=>{},remove:()=>{}};",
    }),
  );
  await page.route(api + '/**', async (route) => {
    const req = route.request(),
      url = new URL(req.url()),
      method = req.method(),
      data = req.postDataJSON?.();
    if (url.pathname === '/visitors') return route.fulfill({ json: { today: 1, total: 1 } });
    if (url.pathname === '/posts' && method === 'GET')
      return route.fulfill({
        json: {
          posts: posts
            .filter((p) => p.board === url.searchParams.get('board'))
            .map((p) => ({ ...p, comments: comments.filter((c) => c.post_id === p.id).length })),
          more: false,
        },
      });
    if (url.pathname === '/posts' && method === 'POST') {
      posts.push({ ...data, id: '11111111-1111-4111-8111-111111111111', created_at: Date.now() });
      return route.fulfill({ status: 201, json: { id: posts.at(-1).id } });
    }
    if (url.pathname.endsWith('/comments') && method === 'POST') {
      comments.push({
        ...data,
        id: '22222222-2222-4222-8222-222222222222',
        post_id: posts[0].id,
        created_at: Date.now(),
      });
      return route.fulfill({ status: 201, json: { id: comments[0].id } });
    }
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
  return { posts, comments };
}
test('Shared board creates and edits posts, posts comments with nickname/time and treats HTML as text', async ({
  page,
}) => {
  const fixture = await mock(page);
  await page.goto('/community.html');
  await page.locator('#write-post').click();
  await page.locator('[name=title]').fill('첫 응원');
  await page.locator('[name=author]').fill('익명 팬');
  await page.locator('[name=password]').fill('0123');
  await page.locator('[name=body]').fill('<img src=x onerror=alert(1)> 응원합니다');
  await page.locator('[name=consent]').check();
  await page.locator('#post-form button[type=submit]').click();
  await expect(page.locator('.post-row')).toContainText('첫 응원');
  await page.locator('.post-row').click();
  await expect(page.locator('.post-body')).toContainText('<img src=x');
  await expect(page.locator('.post-body img')).toHaveCount(0);
  await page.locator('#comment-form [name=author]').fill('응원단');
  await page.locator('#comment-form [name=password]').fill('1234');
  await page.locator('#comment-form [name=body]').fill('오늘도 무사 귀환');
  await page.locator('#comment-form [name=consent]').check();
  await page.locator('#comment-form button[type=submit]').click();
  await expect(page.locator('.comment-row')).toContainText('응원단');
  await expect(page.locator('.comment-row')).toContainText('오늘도 무사 귀환');
  await page.locator('#post-edit').click();
  await page.locator('#edit-form [name=title]').fill('수정한 응원');
  await page.locator('#edit-form [name=password]').fill('0123');
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
  await page.locator('[name=password]').fill('4321');
  await page.locator('[name=body]').fill('오늘 식당 몇 시까지 하나요?');
  await page.locator('[name=consent]').check();
  await page.locator('#post-form button[type=submit]').click();
  await expect(page.locator('.post-row')).toContainText('연구소 야간반');
  expect(fixture.posts[0].board).toBe('staff');
  await page.locator('#viewer-toggle').click();
  await expect(page.locator('#staff-board-lock')).toBeVisible();
  await expect(page.locator('.post-row')).toHaveCount(0);
});
