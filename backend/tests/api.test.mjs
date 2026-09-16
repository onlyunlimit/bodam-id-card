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
  const DB = {
    prepare(query) {
      const statement = {
        args: [],
        bind(...args) {
          this.args = args;
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
    password: '0123',
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
    password: '1234',
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
        password: '9999',
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
        password: '0123',
        captcha: 'verified',
      })
    ).status,
    200,
  );
  detail = await req('/posts/' + id);
  assert.equal(detail.data.post.title, '바꾼 제목');
  assert.equal(
    (await req('/comments/' + comment.data.id, 'DELETE', { password: '1234', captcha: 'verified' }))
      .status,
    200,
  );
  assert.equal(
    (await req('/posts/' + id, 'DELETE', { password: '0123', captcha: 'verified' })).status,
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
test('Rate limiting bounds four-digit guessing across IPs; invalid requests fail closed', async () => {
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
          { password: '0000', captcha: 'verified', title: 'bad', body: 'bad' },
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
        { password: '0123', captcha: 'verified' },
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
  await req('/posts/' + id, 'DELETE', { password: '0123', captcha: 'verified' });
  assert.equal((await req('/posts/' + id + '/like', 'POST', { liked: true })).status, 404);
});
