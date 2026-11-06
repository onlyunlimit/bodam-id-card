import { test, expect } from '@playwright/test';
import { build } from '../../backend/node_modules/esbuild/lib/main.js';
// Exercise the same keepNames transform used by Wrangler, not raw source functions.
const bundled = await build({entryPoints:['backend/admin.js'],bundle:true,write:false,format:'esm',platform:'neutral',keepNames:true});
const {adminHTML,adminJS:bundledAdminJS} = await import('data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text).toString('base64'));
const adminJS = process.env.SGIA_ADMIN_SCRIPT_URL
  ? await (await fetch(process.env.SGIA_ADMIN_SCRIPT_URL)).text()
  : bundledAdminJS;

test('Owner console publishes with a member identity, edits profiles and manages posts and replies', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
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
        created_at: data.created_at ?? Date.now(),
      });
    if (path === '/admin/logout') authenticated = false;
    return route.fulfill({ json: { ok: true } });
  });
  await page.goto('https://admin.test/admin?board=lucky&member=jaein');
  await page.locator('#key').fill('test-only-strong-secret-not-a-production-key');
  await page.locator('#login button').click();
  await expect(page.locator('#workspace')).toBeVisible();
  await page.locator('#artist-compose').click();
  await page.locator('#admin-editor [name=created_at]').fill('2024-01-02T03:04:05');
  await page.locator('#admin-editor [name=title]').fill('공식 첫 인사');
  await page.locator('#admin-editor [name=body]').fill('팬 여러분 안녕하세요');
  await page.locator('[data-image-url]').fill('https://images.example/photo.jpg');await page.locator('[data-add-image-url]').click();await expect(page.locator('.upload-image')).toHaveCount(1);
  await page.locator('.attachment-remove').click();await expect(page.locator('.upload-image')).toHaveCount(0);
  await page.locator('[data-image-url]').fill('https://images.example/photo.jpg');await page.locator('[data-add-image-url]').click();
  await page.locator('[data-images]').setInputFiles('assets/art/id-frame.png');await expect(page.locator('.upload-image')).toHaveCount(2);
  await page.locator('.attachment-remove').nth(1).click();await expect(page.locator('.upload-image')).toHaveCount(1);
  await page.locator('[data-images]').setInputFiles('assets/art/id-frame.png');await expect(page.locator('.upload-image')).toHaveCount(2);

  await page.locator('#admin-editor button[type=submit]').click();
  await expect(page.locator('#posts')).toContainText('공식 첫 인사');
  expect(calls.find(c=>c.path==='/admin/publish').data.created_at).toBe(Date.parse('2024-01-02T03:04:05+09:00'));
  expect(calls.find((c) => c.path === '/admin/publish').data.member_id).toBe('jaein');
  expect(calls.find(c=>c.path==='/admin/publish').data.images).toHaveLength(2);
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
  await expect(page.locator('#admin-editor [name=created_at]')).toHaveValue('2024-01-02T03:04:05');
  await page.locator('#admin-editor [name=created_at]').fill('2024-01-03T12:30');
  await page.locator('#admin-editor [name=body]').fill('관리자로 수정');
  await page.locator('#admin-editor button[type=submit]').click();
  await expect(page.locator('#admin-editor')).not.toBeVisible();
  expect(calls.find(c=>c.path.startsWith('/admin/posts/')).data.created_at).toBe(Date.parse('2024-01-03T12:30:00+09:00'));
  expect(calls.find((c) => c.path.startsWith('/admin/posts/')).data.body).toBe('관리자로 수정');
  await page.locator('#artist-compose').click();
  await page.locator('[name=title]').fill('사진 없이 작성');await page.locator('[name=body]').fill('취소한 사진은 등록하지 않음');
  await page.locator('[data-images]').setInputFiles('assets/art/id-frame.png');await expect(page.locator('.upload-image')).toHaveCount(1);
  await page.locator('.attachment-remove').click();await expect(page.locator('.upload-image')).toHaveCount(0);
  await page.locator('#admin-editor button[type=submit]').click();await expect(page.locator('#admin-editor')).not.toBeVisible();
  expect(calls.filter(c=>c.path==='/admin/publish').at(-1).data.images).toEqual([]);
  await page.locator('[data-like-edit]').first().click();
  await page.locator('#admin-editor [name=likes]').fill('321');
  await page.locator('#admin-editor button[type=submit]').click();
  await expect(page.locator('#admin-editor')).not.toBeVisible();
  expect(calls.find(c=>c.path.endsWith('/likes')).data.likes).toBe(321);
  expect(errors).toEqual([]);
  await page.locator('#logout').click();
  await expect(page.locator('#workspace')).not.toBeVisible();
});
