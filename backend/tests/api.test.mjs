import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import worker from '../worker.js';
import { digest, decipherIP } from '../security.js';
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url, ...args) =>
  String(url).startsWith('https://challenges.cloudflare.com/')
    ? new Response(
        JSON.stringify({ success: true, hostname: 'onlyunlimit.github.io', action: 'community' }),
      )
    : originalFetch(url, ...args);
async function fixture() {
  const sql = new DatabaseSync(':memory:');
  sql.exec(readFileSync(new URL('../migrations/0001.sql', import.meta.url), 'utf8'));
  sql.exec(readFileSync(new URL('../migrations/0002_likes.sql', import.meta.url), 'utf8'));
  sql.exec(readFileSync(new URL('../migrations/0004_fan_platform.sql', import.meta.url), 'utf8'));
  const DB = {
    prepare(query) {
      const statement = {
        args: [],
        bind(...args) {
          this.args = args.map((a) => (a instanceof ArrayBuffer ? new Uint8Array(a) : a));
          return this;
        },
        async first() {
          return sql.prepare(query).get(...this.args) || null;
        },
        async all() {
          return { results: sql.prepare(query).all(...this.args) };
        },
        async run() {
          const r = sql.prepare(query).run(...this.args);
          return { success: true, meta: { changes: Number(r.changes) } };
        },
      };
      return statement;
    },
    async batch(statements) {
      sql.exec('BEGIN');
      try {
        const r = [];
        for (const s of statements) r.push(await s.run());
        sql.exec('COMMIT');
        return r;
      } catch (e) {
        sql.exec('ROLLBACK');
        throw e;
      }
    },
  };
  const key = 'test-admin-256-bit-value-not-for-production';
  const env = {
    DB,
    PASSWORD_PEPPER: 'test-pepper-not-live',
    IP_KEY: 'test-encryption-not-live',
    ADMIN_KEY_HASH: await digest(key),
    PUBLIC_ORIGIN: 'https://onlyunlimit.github.io',
    TURNSTILE_HOSTNAME: 'onlyunlimit.github.io',
    TURNSTILE_SECRET: 'test-secret',
  };
  async function req(path, method = 'GET', data, options = {}) {
    const headers = {
      'CF-Connecting-IP': options.ip || '192.0.2.3',
      Origin: options.origin || 'https://onlyunlimit.github.io',
      ...options.headers,
    };
    if (data) headers['Content-Type'] = 'application/json';
    const response = await worker.fetch(
      new Request('https://sgia.test' + path, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      }),
      env,
    );
    const result = await response
      .clone()
      .json()
      .catch(() => null);
    return { response, status: response.status, data: result };
  }
  const post = {
    board: 'staff',
    title: '테스트 <script> 문서',
    author: '익명 요원',
    department: '괴물',
    body: '게시물 본문입니다.',
    password: '012345',
    consent: true,
    captcha: 'verified',
  };
  return { sql, env, key, req, post };
}
test('Posts and comments persist, expose safe fields, reject bad PIN and support author edit/delete', async () => {
  const { sql, req, post } = await fixture();
  const created = await req('/posts', 'POST', post);
  assert.equal(created.status, 201);
  const id = created.data.id;
  let list = await req('/posts?board=staff');
  assert.equal(list.data.posts[0].title, post.title);
  assert.equal(JSON.stringify(list.data).includes('password'), false);
  const comment = await req('/posts/' + id + '/comments', 'POST', {
    author: '댓글러',
    body: '안녕하세요',
    password: '123456',
    captcha: 'verified',
    consent: true,
  });
  assert.equal(comment.status, 201);
  let detail = await req('/posts/' + id);
  assert.equal(detail.data.comments.length, 1);
  assert.ok(!JSON.stringify(detail.data).includes('ip_'));
  assert.equal(
    (
      await req('/posts/' + id, 'PATCH', {
        title: '바꾼 제목',
        body: '새 본문',
        password: '999999',
        captcha: 'verified',
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await req('/posts/' + id, 'PATCH', {
        title: '바꾼 제목',
        body: '새 본문',
        password: '012345',
        captcha: 'verified',
      })
    ).status,
    200,
  );
  detail = await req('/posts/' + id);
  assert.equal(detail.data.post.title, '바꾼 제목');
  assert.equal(
    (
      await req('/comments/' + comment.data.id, 'DELETE', {
        password: '123456',
        captcha: 'verified',
      })
    ).status,
    200,
  );
  assert.equal(
    (await req('/posts/' + id, 'DELETE', { password: '012345', captcha: 'verified' })).status,
    200,
  );
  assert.equal((await req('/posts/' + id)).status, 404);
  assert.equal(sql.prepare('SELECT body FROM posts WHERE id=?').get(id).body, '');
});
test('Admin uses independent secret and HttpOnly cookie; fake staff cannot administer; IP encrypted and logged', async () => {
  const { sql, env, key, req, post } = await fixture();
  const create = await req('/posts', 'POST', post),
    id = create.data.id;
  const stored = sql.prepare('SELECT * FROM access_logs WHERE id=?').get(id);
  assert.ok(!stored.ip_cipher.includes('192.0.2.3'));
  assert.equal(await decipherIP(stored.ip_cipher, env.IP_KEY), '192.0.2.3');
  assert.equal(
    (await req('/admin/posts', 'GET', null, { headers: { Cookie: 'staff=true' } })).status,
    401,
  );
  assert.equal(
    (await req('/admin/login', 'POST', { key }, { origin: 'https://evil.example' })).status,
    403,
  );
  const auth = await req('/admin/login', 'POST', { key }, { origin: 'https://sgia.test' });
  assert.equal(auth.status, 200);
  const cookie = auth.response.headers.get('Set-Cookie');
  assert.match(cookie, /HttpOnly; Secure; SameSite=Strict/);
  const options = { origin: 'https://sgia.test', headers: { Cookie: cookie.split(';')[0] } };
  assert.equal((await req('/admin/posts', 'GET', null, options)).status, 200);
  const ip = await req('/admin/ip', 'POST', { id }, options);
  assert.equal(ip.data.ip, '192.0.2.3');
  assert.equal(sql.prepare("SELECT COUNT(*) n FROM audit WHERE action='VIEW_IP'").get().n, 1);
  await req('/admin/moderate', 'POST', { id, kind: 'post', action: 'hide' }, options);
  assert.equal((await req('/posts/' + id)).status, 404);
  await req('/admin/moderate', 'POST', { id, kind: 'post', action: 'restore' }, options);
  assert.equal((await req('/posts/' + id)).status, 200);
  await req('/admin/moderate', 'POST', { id, kind: 'post', action: 'block' }, options);
  assert.equal((await req('/posts', 'POST', post)).status, 403);
  await req('/admin/logout', 'POST', {}, options);
  assert.equal((await req('/admin/posts', 'GET', null, options)).status, 401);
});
test('Rate limiting bounds six-digit guessing across IPs; invalid requests fail closed', async () => {
  const { req, post } = await fixture();
  assert.equal((await req('/posts', 'POST', { ...post, password: '123' })).status, 400);
  assert.equal((await req('/posts', 'POST', { ...post, consent: false })).status, 400);
  assert.equal((await req('/posts', 'POST', post, { origin: 'https://evil.example' })).status, 403);
  const created = await req('/posts', 'POST', post),
    id = created.data.id;
  for (let i = 0; i < 5; i++)
    assert.equal(
      (
        await req(
          '/posts/' + id,
          'PATCH',
          { password: '000000', captcha: 'verified', title: 'bad', body: 'bad' },
          { ip: '192.0.2.' + (10 + i) },
        )
      ).status,
      403,
    );
  assert.equal(
    (
      await req(
        '/posts/' + id,
        'DELETE',
        { password: '012345', captcha: 'verified' },
        { ip: '192.0.2.100' },
      )
    ).status,
    429,
  );
  assert.equal((await req('/posts?board=staff%27%20OR%201=1')).status, 400);
});
test('Visitor count deduplicates IP per KST day and cleanup expires private logs without erasing totals', async () => {
  const { env, req, sql, post } = await fixture();
  for (let i = 0; i < 3; i++) {
    const r = await req('/visitors', 'POST', {});
    assert.equal(r.status, 200);
    assert.equal(r.data.total, 1);
  }
  const next = await req('/visitors', 'POST', {}, { ip: '192.0.2.44' });
  assert.equal(next.data.total, 2);
  assert.equal(next.data.today, 2);
  assert.equal(sql.prepare('SELECT count(*) n FROM visitor_keys').get().n, 2);
  const created = await req('/posts', 'POST', post);
  sql
    .prepare('UPDATE access_logs SET created_at=? WHERE id=?')
    .run(Date.now() - 31 * 86400000, created.data.id);
  await worker.scheduled({}, env);
  assert.equal(sql.prepare('SELECT count(*) n FROM access_logs').get().n, 0);
  assert.equal((await req('/visitors')).data.total, 2);
  assert.equal((await req('/posts/' + created.data.id)).status, 200);
});

test('Likes are idempotent per network, reversible, origin protected and unavailable for deleted posts', async () => {
  const { req, post } = await fixture();
  const created = await req('/posts', 'POST', post);
  const id = created.data.id;
  assert.equal(
    (await req('/posts/' + id + '/like', 'POST', { liked: true }, { origin: 'https://evil.test' }))
      .status,
    403,
  );
  assert.equal((await req('/posts/' + id + '/like', 'POST', { liked: true })).data.likes, 1);
  assert.equal((await req('/posts/' + id + '/like', 'POST', { liked: true })).data.likes, 1);
  assert.equal(
    (await req('/posts/' + id + '/like', 'POST', { liked: true }, { ip: '192.0.2.88' })).data.likes,
    2,
  );
  assert.equal((await req('/posts/' + id)).data.post.liked, true);
  assert.equal((await req('/posts/' + id + '/like', 'POST', { liked: false })).data.likes, 1);
  await req('/posts/' + id, 'DELETE', { password: '012345', captcha: 'verified' });
  assert.equal((await req('/posts/' + id + '/like', 'POST', { liked: true })).status, 404);
});

test('Fan platform supports official feeds, remote profiles, replies and comment likes with server-only artist identity', async () => {
  const { req, key, sql, post } = await fixture();
  const auth = await req('/admin/login', 'POST', { key }, { origin: 'https://sgia.test' }),
    options = {
      origin: 'https://sgia.test',
      headers: { Cookie: auth.response.headers.get('Set-Cookie').split(';')[0] },
    };
  const member = (await req('/members?board=lucky')).data.members[0];
  assert.equal(
    (
      await req('/admin/members/' + member.id, 'PATCH', {
        name: '변경',
        bio: '소개',
        avatar_url: '',
      })
    ).status,
    403,
  );
  assert.equal(
    (await req('/posts', 'POST', { ...post, board: 'lucky', member_id: member.id })).status,
    403,
  );
  const fan = await req('/posts', 'POST', { ...post, board: 'lucky' });
  assert.equal(fan.status, 201);
  const official = await req(
    '/admin/publish',
    'POST',
    { member_id: member.id, title: '첫 공식 소식', body: '멤버가 직접 남기는 소식입니다.' },
    options,
  );
  assert.equal(official.status, 201, JSON.stringify(official.data));
  assert.equal((await req('/posts?board=lucky&feed=fan')).data.posts.length, 1);
  assert.equal((await req('/posts?board=lucky&feed=artist')).data.posts[0].member_id, member.id);
  assert.equal(
    (
      await req('/posts/' + official.data.id, 'PATCH', {
        title: '사칭',
        body: '본문',
        password: '123456',
        captcha: 'ok',
      })
    ).status,
    403,
  );
  const root = await req('/posts/' + fan.data.id + '/comments', 'POST', {
    author: '팬',
    body: '답장을 기다려요',
    password: '123456',
    consent: true,
    captcha: 'ok',
  });
  const reply = await req(
    '/admin/reply',
    'POST',
    { member_id: member.id, post_id: fan.data.id, parent_id: root.data.id, body: '답장왔어요' },
    options,
  );
  assert.equal(reply.status, 201, JSON.stringify(reply.data));
  const foreign = await req('/posts', 'POST', { ...post, board: 'obsidus' });
  assert.equal(
    (
      await req(
        '/admin/reply',
        'POST',
        { member_id: member.id, post_id: foreign.data.id, body: '다른 그룹 사칭' },
        options,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await req('/posts/' + foreign.data.id + '/comments', 'POST', {
        author: '팬',
        body: '다른 글로 잘못 연결',
        parent_id: root.data.id,
        password: '123456',
        consent: true,
        captcha: 'ok',
      })
    ).status,
    404,
  );
  const thread = (await req('/posts/' + fan.data.id)).data.comments;
  assert.equal(thread[1].parent_id, root.data.id);
  assert.equal(thread[1].member_id, member.id);
  for (let i = 0; i < 2; i++)
    assert.equal(
      (await req('/comments/' + reply.data.id + '/like', 'POST', { liked: true })).data.likes,
      1,
    );
  assert.equal((await req('/posts/' + fan.data.id)).data.comments[1].liked, true);
  assert.equal((await req('/artist-comments?board=lucky')).data.comments[0].body, '답장왔어요');
  await req('/posts/' + fan.data.id + '/like', 'POST', { liked: true });
  assert.equal((await req('/posts?board=lucky&feed=highlight')).data.posts[0].id, fan.data.id);
  assert.equal(
    (
      await req(
        '/admin/members/' + member.id,
        'PATCH',
        { name: '새 멤버 이름', bio: '새 소개', avatar_url: 'https://example.com/photo.webp' },
        options,
      )
    ).status,
    200,
  );
  assert.equal((await req('/posts/' + official.data.id)).data.post.member.name, '새 멤버 이름');
  assert.equal((await req('/artist-comments?board=lucky')).data.comments[0].name, '새 멤버 이름');
  assert.equal(
    (
      await req(
        '/admin/members/' + member.id,
        'PATCH',
        { name: 'bad', bio: '', avatar_url: 'javascript:alert(1)' },
        options,
      )
    ).status,
    400,
  );
  await req(
    '/admin/moderate',
    'POST',
    { kind: 'comment', id: root.data.id, action: 'hide' },
    options,
  );
  assert.equal((await req('/artist-comments?board=lucky')).data.comments.length, 0);
  assert.equal(
    (await req('/comments/' + reply.data.id + '/like', 'POST', { liked: true })).status,
    404,
  );
  assert.equal((await req('/posts/' + fan.data.id)).data.comments.length, 0);
  assert.ok(sql.prepare("SELECT COUNT(*) n FROM audit WHERE action='PROFILE_UPDATE'").get().n);
});

test('Legacy PINs remain usable for verification and require a six-digit upgrade on editing', async () => {
  const { req, sql, env, post } = await fixture();
  const { passwordHash } = await import('../security.js');
  assert.equal((await req('/posts', 'POST', { ...post, password: '0123' })).status, 400);
  const created = await req('/posts', 'POST', post),
    id = created.data.id;
  const row = sql.prepare('SELECT salt FROM posts WHERE id=?').get(id);
  sql
    .prepare('UPDATE posts SET pin_length=4,password_hash=? WHERE id=?')
    .run(await passwordHash('0123', row.salt, env.PASSWORD_PEPPER), id);
  assert.equal((await req('/posts/' + id, 'PATCH', { ...post, password: '0123' })).status, 400);
  assert.equal(
    (await req('/posts/' + id, 'PATCH', { ...post, password: '0123', newPassword: '654321' }))
      .status,
    200,
  );
  assert.equal((await req('/posts/' + id)).data.post.pin_length, 6);
  assert.equal((await req('/posts/' + id, 'PATCH', { ...post, password: '012345' })).status, 403);
  assert.equal(
    (
      await req('/posts/' + id, 'PATCH', {
        ...post,
        password: '654321',
        title: '업그레이드 후 수정',
      })
    ).status,
    200,
  );
});

test('Attachments enforce format, ownership and deletion visibility; admin can edit seeded posts without author PIN', async () => {
  const { req, key, post, sql } = await fixture();
  const png =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aSp0AAAAASUVORK5CYII=';
  const a = await req('/posts', 'POST', { ...post, images: [png] });
  assert.equal(a.status, 201, JSON.stringify(a.data));
  let detail = (await req('/posts/' + a.data.id)).data;
  const image = detail.post.images[0];
  assert.equal((await req('/media/' + image.id)).response.headers.get('Content-Type'), 'image/png');
  const b = await req('/posts', 'POST', post);
  assert.equal(
    (await req('/posts/' + b.data.id, 'PATCH', { ...post, images: [{ id: image.id }] })).status,
    400,
  );
  assert.equal(
    (await req('/posts', 'POST', { ...post, images: ['data:image/svg+xml;base64,PHN2Zz4='] }))
      .status,
    400,
  );
  assert.equal((await req('/posts', 'POST', { ...post, images: [png, png, png] })).status, 400);
  const auth = await req('/admin/login', 'POST', { key }, { origin: 'https://sgia.test' }),
    options = {
      origin: 'https://sgia.test',
      headers: { Cookie: auth.response.headers.get('Set-Cookie').split(';')[0] },
    };
  sql.prepare("UPDATE posts SET password_hash='',salt='' WHERE id=?").run(a.data.id);
  assert.equal(
    (
      await req(
        '/admin/posts/' + a.data.id,
        'PATCH',
        { title: '관리자 수정', body: '새 본문' },
        options,
      )
    ).status,
    200,
  );
  await req('/admin/moderate', 'POST', { kind: 'post', id: a.data.id, action: 'hide' }, options);
  assert.equal((await req('/media/' + image.id)).status, 404);
  assert.equal((await req('/admin/media/' + image.id)).status, 401);
  assert.equal((await req('/admin/media/' + image.id, 'GET', undefined, options)).status, 200);
  await req('/admin/moderate', 'POST', { kind: 'post', id: a.data.id, action: 'restore' }, options);
  assert.equal((await req('/media/' + image.id)).status, 200);
  await req('/admin/moderate', 'POST', { kind: 'post', id: a.data.id, action: 'delete' }, options);
  assert.equal((await req('/media/' + image.id)).status, 404);
  assert.equal(sql.prepare('SELECT COUNT(*) n FROM images WHERE post_id=?').get(a.data.id).n, 0);
});
