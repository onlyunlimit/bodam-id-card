import { test, expect } from '@playwright/test';
import { adminHTML, adminJS } from '../../backend/admin.js';

test('Owner console publishes with a member identity, edits profiles and manages posts and replies', async ({
  page,
}) => {
  const calls = [],
    members = [{ id: 'jaein', board: 'lucky', name: '재인', bio: '소개', avatar_url: '' }],
    posts = [
      {
        id: '11111111-1111-4111-8111-111111111111',
        board: 'lucky',
        title: '팬 이야기',
        author: '팬',
        body: '응원',
        created_at: Date.now(),
      },
    ];
  let authenticated = false;
  await page.route('https://admin.test/**', async (route) => {
    const req = route.request(),
      url = new URL(req.url()),
      path = url.pathname;
    if (path === '/admin') return route.fulfill({ contentType: 'text/html', body: adminHTML });
    if (path === '/admin/app.js')
      return route.fulfill({ contentType: 'text/javascript', body: adminJS });
    if (path === '/admin/login') {
      authenticated = true;
      return route.fulfill({ json: { ok: true } });
    }
    if (!authenticated) return route.fulfill({ status: 401, json: { error: '관리자 인증 필요' } });
    if (req.method() === 'GET')
      return route.fulfill({
        json:
          path === '/admin/members'
            ? { members }
            : path === '/admin/posts'
              ? { posts }
              : { comments: [] },
      });
    const data = req.postDataJSON();
    calls.push({ path, data });
    if (path === '/admin/members/jaein') Object.assign(members[0], data);
    if (path === '/admin/publish')
      posts.unshift({
        ...data,
        id: '22222222-2222-4222-8222-222222222222',
        board: 'lucky',
        author: '재인',
        created_at: Date.now(),
      });
    if (path === '/admin/logout') authenticated = false;
    return route.fulfill({ json: { ok: true } });
  });
  await page.goto('https://admin.test/admin?board=lucky&member=jaein');
  await page.locator('#key').fill('test-only-strong-secret-not-a-production-key');
  await page.locator('#login button').click();
  await expect(page.locator('#workspace')).toBeVisible();
  await page.locator('#artist-compose').click();
  await page.locator('#admin-editor [name=title]').fill('공식 첫 인사');
  await page.locator('#admin-editor [name=body]').fill('팬 여러분 안녕하세요');
  await page.locator('#admin-editor button[type=submit]').click();
  await expect(page.locator('#posts')).toContainText('공식 첫 인사');
  expect(calls.find((c) => c.path === '/admin/publish').data.member_id).toBe('jaein');
  await page.locator('#profile-edit').click();
  await page.locator('[name=bio]').fill('웹에서 수정한 프로필');
  await page.locator('#admin-editor button[type=submit]').click();
  await expect(page.locator('#admin-editor')).not.toBeVisible();
  expect(members[0].bio).toBe('웹에서 수정한 프로필');
  await page.locator('[data-artist-reply]').first().click();
  await page.locator('#admin-editor [name=body]').fill('고마워요!');
  await page.locator('#admin-editor button[type=submit]').click();
  await expect(page.locator('#admin-editor')).not.toBeVisible();
  expect(calls.find((c) => c.path === '/admin/reply').data.body).toBe('고마워요!');
  await page.locator('[data-action=edit]').first().click();
  await page.locator('#admin-editor [name=body]').fill('관리자로 수정');
  await page.locator('#admin-editor button[type=submit]').click();
  await expect(page.locator('#admin-editor')).not.toBeVisible();
  expect(calls.find((c) => c.path.startsWith('/admin/posts/')).data.body).toBe('관리자로 수정');
  await page.locator('#logout').click();
  await expect(page.locator('#workspace')).not.toBeVisible();
});
