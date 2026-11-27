import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import worker from '../worker.js';
import {mediaClientSource} from '../admin-media.generated.js';
test('Admin media source is current before Worker bundling',()=>{
 assert.equal(mediaClientSource,readFileSync(new URL('../../assets/community-media.js',import.meta.url),'utf8').replace(/^export /gm,''));
});
import { digest, decipherIP } from '../security.js';
const originalFetch = globalThis.fetch;
let geocodeCalls=0;
const geoResult={display_name:'Paris, France',lat:'48.8566',lon:'2.3522',address:{city:'Paris'},geojson:{type:'Polygon',coordinates:[[[2.3,48.8],[2.4,48.8],[2.4,48.9],[2.3,48.8]]]}};
globalThis.fetch=async(url,...args)=>{
 if(String(url).startsWith('https://images.example/'))return new Response(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aSp0AAAAASUVORK5CYII=','base64'),{headers:{'Content-Type':'image/png'}});
 if(String(url).startsWith('https://challenges.cloudflare.com/'))return Response.json({success:true,hostname:'onlyunlimit.github.io',action:'community'});
 if(String(url).startsWith('https://nominatim.openstreetmap.org/')){geocodeCalls++;assert.match(args[0].headers['User-Agent'],/onlyunlimit.github.io/);return Response.json(String(url).includes('/search')?[geoResult]:geoResult);}
 return originalFetch(url,...args);
};
async function fixture() {
  const sql = new DatabaseSync(':memory:');
  sql.exec(readFileSync(new URL('../migrations/0001.sql', import.meta.url), 'utf8'));
  sql.exec(readFileSync(new URL('../migrations/0002_likes.sql', import.meta.url), 'utf8'));
  sql.exec(readFileSync(new URL('../migrations/0004_fan_platform.sql', import.meta.url), 'utf8'));
  sql.exec(readFileSync(new URL('../migrations/0005_image_urls.sql', import.meta.url), 'utf8'));
  sql.exec(
    readFileSync(new URL('../migrations/0006_staff_geocoding.sql', import.meta.url), 'utf8'),
  );
  sql.exec(readFileSync(new URL('../migrations/0007_staff_profiles_likes.sql', import.meta.url), 'utf8'));
  sql.exec(readFileSync(new URL('../migrations/0008_withdraw_joker.sql', import.meta.url), 'utf8'));
  sql.exec(readFileSync(new URL('../migrations/0009_comment_aliases.sql', import.meta.url), 'utf8'));
  sql.exec(readFileSync(new URL('../migrations/0010_public_codenames.sql', import.meta.url), 'utf8'));
  for(const file of ['0011_admin_notifications.sql','0012_siso_portrait.sql','0013_comment_images.sql','0014_notification_state.sql','0015_shared_incidents.sql','0016_music_playlists.sql','0017_music_requests.sql','0018_member_guestbook.sql','0019_guestbook_moderation.sql','0020_playlist_catalog.sql','0021_guestbook_examples.sql'])sql.exec(readFileSync(new URL('../migrations/'+file,import.meta.url),'utf8'));
  const DB = {
    prepare(query) {
      const statement = {
        args: [],
        bind(...args) {
          this.args = args.map((a) => (a instanceof ArrayBuffer ? new Uint8Array(a) : a));
          return this;
        },
        async first() {
          const row = sql.prepare(query).get(...this.args);
          // D1 returns BLOBs as ordinary number arrays, unlike node:sqlite.
          if (row) for (const key of Object.keys(row)) if (row[key] instanceof Uint8Array) row[key] = [...row[key]];
          return row || null;
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
  assert.equal(thread.find(c => c.id === reply.data.id).parent_id, root.data.id);
  assert.equal(thread.find(c => c.id === reply.data.id).member_id, member.id);
  for (let i = 0; i < 2; i++)
    assert.equal(
      (await req('/comments/' + reply.data.id + '/like', 'POST', { liked: true })).data.likes,
      1,
    );
  assert.equal((await req('/posts/' + fan.data.id)).data.comments.find(c => c.id === reply.data.id).liked, true);
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
  assert.equal((await req('/posts', 'POST', { ...post, images: [png] })).status,201);
  const a = await req('/posts', 'POST', { ...post, images: [{url:'https://images.example/photo.jpg'}] });
  assert.equal(a.status, 201, JSON.stringify(a.data));
  let detail = (await req('/posts/' + a.data.id)).data;
  const image = detail.post.images[0];
  assert.equal((await req('/media/' + image.id)).response.headers.get('Content-Type'), 'image/png');
  assert.deepEqual(Buffer.from(await (await req('/media/' + image.id)).response.arrayBuffer()), Buffer.from(png.split(',')[1], 'base64'));
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
  const adminMedia = await req('/admin/media/' + image.id, 'GET', undefined, options);
  assert.equal(adminMedia.status, 200);
  assert.deepEqual(Buffer.from(await adminMedia.response.arrayBuffer()), Buffer.from(png.split(',')[1], 'base64'));
  await req('/admin/moderate', 'POST', { kind: 'post', id: a.data.id, action: 'restore' }, options);
  assert.equal((await req('/media/' + image.id)).status, 200);
  await req('/admin/moderate', 'POST', { kind: 'post', id: a.data.id, action: 'delete' }, options);
  assert.equal((await req('/media/' + image.id)).status, 404);
  assert.equal(sql.prepare('SELECT COUNT(*) n FROM images WHERE post_id=?').get(a.data.id).n, 0);
});

test('Staff channels and member/team tags remain separate, filterable and editable',async()=>{
 const {req,post}=await fixture();
 const a=await req('/posts','POST',post);
 const b=await req('/posts','POST',{...post,title:'덕질 이야기',channel:'soliloquy',tags:['member:jaein','team:origin']});
 assert.equal(b.status,201,JSON.stringify(b.data));
 assert.equal((await req('/posts?board=staff&channel=free')).data.posts.length,1);
 const filtered=await req('/posts?board=staff&channel=soliloquy&tag=member:jaein');
 assert.equal(filtered.data.posts[0].id,b.data.id);assert.deepEqual(filtered.data.posts[0].tags,['member:jaein','team:origin']);
 assert.equal((await req('/posts?board=staff&channel=soliloquy&tag=team:beacon')).data.posts.length,0);
 assert.equal((await req('/posts','POST',{...post,channel:'soliloquy',tags:['invented']})).status,400);
 assert.equal((await req('/posts','POST',{...post,board:'lucky',channel:'soliloquy',tags:[]})).status,400);
 assert.equal((await req('/posts/'+b.data.id,'PATCH',{...post,channel:'free',tags:[]})).status,200);
 assert.equal((await req('/posts?board=staff&channel=free')).data.posts.length,2);
});
test('HTTPS image links persist and are gated with the parent post through a metadata-stripping media response',async()=>{
 const {req,post}=await fixture();
 const a=await req('/posts','POST',{...post,images:[{url:'https://images.example/photo.jpg'}]});assert.equal(a.status,201);
 const image=(await req('/posts/'+a.data.id)).data.post.images[0];
 const r=await req('/media/'+image.id);assert.equal(r.status,200);assert.equal(r.response.headers.get('Location'),null);assert.equal(r.response.headers.get('Content-Type'),'image/png');
 assert.equal((await req('/posts','POST',{...post,images:[{url:'javascript:alert(1)'}]})).status,400);
 assert.equal((await req('/posts','POST',{...post,images:[{url:'https://name:secret@example.com/p.jpg'}]})).status,400);
 assert.equal((await req('/posts/'+a.data.id,'PATCH',{...post,images:[]})).status,200);
 assert.equal((await req('/media/'+image.id)).status,404);
});
test('Worldwide geocoding caches queries, validates coordinates and throttles upstream calls globally',async()=>{
 const {req,sql}=await fixture();geocodeCalls=0;
 const a=await req('/geocode?q=Paris');assert.equal(a.status,200);assert.equal(a.data.results[0].lat,48.8566);assert.equal(a.data.results[0].area.type,'Polygon');
 assert.equal((await req('/geocode?q=Paris')).status,200);assert.equal(geocodeCalls,1);
 assert.equal((await req('/geocode?q=London')).status,429);assert.equal(geocodeCalls,1);
 sql.prepare('UPDATE geocode_lock SET next_at=0').run();
 assert.equal((await req('/geocode?lat=-33.8&lon=151.2&area=1')).status,200);
 assert.equal((await req('/geocode?lat=91&lon=0')).status,400);
 assert.equal((await req('/geocode?lat=0&lon=181')).status,400);
 assert.equal((await req('/geocode')).status,400);
});

test('Free lounge supports custom tags and team topics with validation and editing', async () => {
 const {req, post} = await fixture();
 const tags = ['member:jaein', 'team:origin', 'custom:오늘의 최애', 'custom-team:새로운 팀'];
 const a = await req('/posts', 'POST', {...post, tags}); assert.equal(a.status, 201);
 const list = await req('/posts?board=staff&tag='+encodeURIComponent(tags[3]));
 assert.deepEqual(list.data.posts[0].tags, tags);
 assert.equal((await req('/posts/'+a.data.id, 'PATCH', {...post, tags:['custom:수정']})).status, 200);
 assert.deepEqual((await req('/posts/'+a.data.id)).data.post.tags,['custom:수정']);
 for(const tags of [['custom:'], ['custom: '], ['custom:'+ 'x'.repeat(41)], ['member:unknown'], Array(6).fill('team:origin')]) assert.equal((await req('/posts','POST',{...post,tags})).status,400);
});

test('Hashtag suggestions read shared saved tags and exclude hidden or deleted posts', async () => {
 const {req,post,sql} = await fixture();
 const a=await req('/posts','POST',{...post,tags:['custom:야간근무','team:shield']});
 const tags=(await req('/staff-tags?q=야간')).data.tags;
 assert.deepEqual(tags,[{id:'custom:야간근무',label:'야간근무'}]);
 assert.ok((await req('/staff-tags')).data.tags.some(t=>t.id==='custom:야간근무'));
 assert.ok((await req('/staff-tags?q=실')).data.tags.some(t=>t.id==='team:shield'));
 sql.prepare('UPDATE posts SET hidden=1 WHERE id=?').run(a.data.id);
 assert.equal((await req('/staff-tags?q=야간')).data.tags.length,0);
 sql.prepare('UPDATE posts SET hidden=0,deleted_at=? WHERE id=?').run(Date.now(),a.data.id);
 assert.equal((await req('/staff-tags?q=야간')).data.tags.length,0);
});

test('Staff member profiles expose only their published feed; admin like totals retain real votes',async()=>{
 const {req,key,sql,post}=await fixture();
 const auth=await req('/admin/login','POST',{key},{origin:'https://sgia.test'});
 const options={origin:'https://sgia.test',headers:{Cookie:auth.response.headers.get('Set-Cookie').split(';')[0]}};
 const all=(await req('/members?board=staff')).data.members;
 assert.equal(all.length,27);assert.ok(all.some(m=>m.id==='siso' && m.team==='blackjack'));
 const created=await req('/admin/publish','POST',{member_id:'siso',title:'복귀 보고',body:'모두 복귀했습니다.'},options);
 assert.equal(created.status,201,JSON.stringify(created.data));const id=created.data.id;
 assert.equal((await req('/posts?board=staff')).data.posts[0].id,id);
 assert.equal((await req('/members/siso/feed')).data.posts[0].id,id);
 assert.equal((await req('/members/poker/feed')).data.posts.length,0);
 assert.equal((await req('/admin/posts/'+id+'/likes','PATCH',{likes:50})).status,403);
 for(const likes of [-1,1.5,'10',10000001]) assert.equal((await req('/admin/posts/'+id+'/likes','PATCH',{likes},options)).status,400);
 assert.equal((await req('/posts/'+id+'/like','POST',{liked:true})).data.likes,1);
 assert.equal((await req('/admin/posts/'+id+'/likes','PATCH',{likes:50},options)).status,200);
 assert.equal(sql.prepare('SELECT count(*) n FROM post_likes').get().n,1);
 assert.equal((await req('/members/siso/feed')).data.posts[0].likes,50);
 assert.equal((await req('/posts/'+id+'/like','POST',{liked:false})).data.likes,49);
 assert.equal((await req('/posts/'+id+'/like','POST',{liked:true})).data.likes,50);
 const c=await req('/posts/'+id+'/comments','POST',{author:'동료',body:'확인했습니다',password:'123456',captcha:'ok',consent:true});
 assert.equal((await req('/admin/comments/'+c.data.id+'/likes','PATCH',{likes:12},options)).status,200);
 assert.equal((await req('/comments/'+c.data.id+'/like','POST',{liked:true})).data.likes,13);
 assert.equal((await req('/posts/'+id)).data.comments[0].likes,13);
 assert.equal((await req('/admin/posts/'+id+'/likes','PATCH',{likes:0},options)).status,200);
 assert.equal((await req('/posts/'+id+'/like','POST',{liked:false})).data.likes,0);
 await req('/admin/members/siso','PATCH',{name:'시소',bio:'변경한 소개',avatar_url:''},options);
 assert.equal((await req('/members/siso')).data.member.bio,'변경한 소개');
 await req('/admin/moderate','POST',{kind:'post',id,action:'hide'},options);
 assert.equal((await req('/members/siso/feed')).data.posts.length,0);
 assert.equal((await req('/members/not-a-member/feed')).status,404);
 assert.ok(sql.prepare("SELECT count(*) n FROM audit WHERE action='LIKE_COUNT_SET'").get().n>=3);
});

test('Staff migration preserves existing member edits and foreign-key linked posts, comments and photos',()=>{
 const db=new DatabaseSync(':memory:');db.exec('PRAGMA foreign_keys=ON');
 for(const file of ['0001.sql','0002_likes.sql','0004_fan_platform.sql','0005_image_urls.sql','0006_staff_geocoding.sql']) db.exec(readFileSync(new URL('../migrations/'+file,import.meta.url),'utf8'));
 db.exec("UPDATE members SET name='편집된 재인',bio='보존할 소개' WHERE id='jaein'; INSERT INTO posts(id,board,title,author,body,salt,password_hash,created_at,member_id) VALUES('p','lucky','기존 글','재인','본문','','',1,'jaein'); INSERT INTO comments(id,post_id,author,body,salt,password_hash,created_at,member_id) VALUES('c','p','재인','댓글','','',1,'jaein'); INSERT INTO images(id,member_id,mime,data,created_at) VALUES('i','jaein','image/png',X'01',1);");
 db.exec('BEGIN');db.exec(readFileSync(new URL('../migrations/0007_staff_profiles_likes.sql',import.meta.url),'utf8'));db.exec('COMMIT');
 assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(),[]);
 assert.equal(db.prepare("SELECT name FROM members WHERE id='jaein'").get().name,'편집된 재인');
 assert.equal(db.prepare('SELECT count(*) n FROM images').get().n,1);
 assert.equal(db.prepare('SELECT member_id FROM comments').get().member_id,'jaein');
 assert.equal(db.prepare('SELECT like_adjustment FROM posts').get().like_adjustment,0);
 db.close();
});

test('Joker withdrawal only removes an unused seed and preserves edited profiles or linked content',()=>{
 const sql=new DatabaseSync(':memory:');for(const file of ['0001.sql','0002_likes.sql','0004_fan_platform.sql','0005_image_urls.sql','0006_staff_geocoding.sql','0007_staff_profiles_likes.sql'])sql.exec(readFileSync(new URL('../migrations/'+file,import.meta.url),'utf8'));
 const migration=readFileSync(new URL('../migrations/0008_withdraw_joker.sql',import.meta.url),'utf8');
 sql.exec("UPDATE members SET updated_at=123 WHERE id='joker'");sql.exec(migration);assert.ok(sql.prepare("SELECT id FROM members WHERE id='joker'").get());
 sql.exec("UPDATE members SET updated_at=0 WHERE id='joker'; INSERT INTO posts(id,board,title,author,body,salt,password_hash,created_at,member_id) VALUES('keep','staff','작성한 글','조커','보존','','',1,'joker')");sql.exec(migration);assert.ok(sql.prepare("SELECT id FROM members WHERE id='joker'").get());
 sql.exec("DELETE FROM posts WHERE id='keep'");sql.exec(migration);assert.equal(sql.prepare("SELECT id FROM members WHERE id='joker'").get(),undefined);sql.close();
});

test('Blank names use stable per-post IP aliases across replies, deletion and timestamp ordering', async () => {
 const {req,post,sql}=await fixture();
 const made=await req('/posts','POST',{...post,author:'   ',created_at:1});
 assert.equal(made.status,201);const id=made.data.id;
 assert.equal(sql.prepare('SELECT author FROM posts WHERE id=?').get(id).author,'ㅇㅇ');
 assert.notEqual(sql.prepare('SELECT created_at FROM posts WHERE id=?').get(id).created_at,1);
 const comment={body:'익명 댓글',password:'123456',captcha:'verified',consent:true};
 const add=(ip,extra={})=>req('/posts/'+id+'/comments','POST',{...comment,...extra},{ip});
 const a=await add('192.0.2.10');const b=await add('192.0.2.11');
 const reply=await add('192.0.2.10',{parent_id:b.data.id});
 for(const r of [a,b,reply])assert.equal(r.status,201);
 const name=id=>sql.prepare('SELECT author FROM comments WHERE id=?').get(id).author;
 assert.equal(name(a.data.id),'익명1');assert.equal(name(b.data.id),'익명2');assert.equal(name(reply.data.id),'익명1');
 sql.prepare('UPDATE comments SET created_at=1,deleted_at=2 WHERE id=?').run(a.data.id);
 const again=await add('192.0.2.10');assert.equal(name(again.data.id),'익명1');
 const explicit=await add('192.0.2.12',{author:'내 닉네임'});assert.equal(name(explicit.data.id),'내 닉네임');
 const invalid=await add('192.0.2.13',{parent_id:'ffffffff-ffff-4fff-8fff-ffffffffffff'});assert.equal(invalid.status,404);
 const next=await add('192.0.2.14');assert.equal(name(next.data.id),'익명3');
 const second=await req('/posts','POST',{...post,author:undefined},{ip:'192.0.2.20'});
 const reset=await req('/posts/'+second.data.id+'/comments','POST',comment,{ip:'192.0.2.11'});
 assert.equal(name(reset.data.id),'익명1');
 const rows=sql.prepare('SELECT * FROM comment_aliases').all();assert.equal(JSON.stringify(rows).includes('192.0.2.'),false);
 const detail=await req('/posts/'+id);assert.equal(JSON.stringify(detail.data).includes('voter'),false);
});

test('Only authenticated administrators can change creation time, without changing audit time',async()=>{
 const {req,key,sql,post}=await fixture();
 const auth=await req('/admin/login','POST',{key},{origin:'https://sgia.test'});
 const options={origin:'https://sgia.test',headers:{Cookie:auth.response.headers.get('Set-Cookie').split(';')[0]}};
 const stamp=Date.parse('2024-01-02T03:04:05+09:00');
 const payload={member_id:'siso',title:'지난 기록',body:'기록 본문',created_at:stamp};
 assert.equal((await req('/admin/publish','POST',payload,{origin:'https://sgia.test'})).status,401);
 const created=await req('/admin/publish','POST',payload,options);assert.equal(created.status,201);const id=created.data.id;
 const row=()=>sql.prepare('SELECT * FROM posts WHERE id=?').get(id);
 assert.equal(row().created_at,stamp);
 const patch={title:'시간 수정',body:'수정 본문',created_at:stamp+3600000};
 assert.equal((await req('/admin/posts/'+id,'PATCH',patch,options)).status,200);assert.equal(row().created_at,patch.created_at);
 assert.ok(row().updated_at>stamp);
 assert.equal((await req('/admin/posts/'+id,'PATCH',{title:'내용만',body:'시간 보존'},options)).status,200);assert.equal(row().created_at,patch.created_at);
 for(const value of [-1,'2024-01-01',null,1.5,1e16])assert.equal((await req('/admin/posts/'+id,'PATCH',{...patch,created_at:value},options)).status,400);
 const visitor=await req('/posts','POST',post);
 assert.equal((await req('/admin/posts/'+visitor.data.id,'PATCH',patch,options)).status,200);
 assert.ok(sql.prepare("SELECT created_at FROM audit WHERE action='ARTIST_PUBLISH' AND target=?").get(id).created_at>stamp);
});

test('Public member directory and profiles use only codenames',async()=>{
 const {req}=await fixture();const members=(await req('/members?board=staff')).data.members;
 for(const [id,name] of [['ibex','벡스'],['slun','슬런'],['bug','버그'],['poker','포커']]){
  assert.equal(members.find(m=>m.id===id).name,name);
  assert.equal((await req('/members/'+id)).data.member.name,name);
 }
});

test('Admin author, member and date edits preserve post IDs and reject cross-board member spoofing',async()=>{
 const {req,key,sql,post}=await fixture();
 const auth=await req('/admin/login','POST',{key},{origin:'https://sgia.test'});
 const options={origin:'https://sgia.test',headers:{Cookie:auth.response.headers.get('Set-Cookie').split(';')[0]}};
 const made=await req('/posts','POST',{...post,board:'lucky'}),id=made.data.id;
 const edit={title:'바뀐 제목',body:'본문',author:'새 닉네임',member_id:null,created_at:123456789};
 assert.equal((await req('/admin/posts/'+id,'PATCH',edit,{origin:'https://sgia.test'})).status,401);
 assert.equal((await req('/admin/posts/'+id,'PATCH',edit,options)).status,200);
 let row=sql.prepare('SELECT * FROM posts WHERE id=?').get(id);assert.equal(row.author,'새 닉네임');assert.equal(row.created_at,123456789);assert.equal(row.member_id,null);
 assert.equal((await req('/admin/posts/'+id,'PATCH',{...edit,member_id:'jaein'},options)).status,200);
 row=sql.prepare('SELECT * FROM posts WHERE id=?').get(id);assert.equal(row.author,'재인');assert.equal(row.member_id,'jaein');
 assert.equal((await req('/admin/posts/'+id,'PATCH',{...edit,member_id:'chabin'},options)).status,400);
 const c=await req('/posts/'+id+'/comments','POST',{body:'댓글',author:'팬',password:'123456',consent:true,captcha:'verified'});
 assert.equal((await req('/admin/comments/'+c.data.id,'PATCH',{body:'답글',author:'변경',member_id:'danjo',created_at:987654321},options)).status,200);
 const comment=sql.prepare('SELECT * FROM comments WHERE id=?').get(c.data.id);assert.equal(comment.author,'단조');assert.equal(comment.created_at,987654321);assert.equal(comment.post_id,id);
 assert.equal((await req('/admin/comments/'+c.data.id,'PATCH',{body:'답글',member_id:'chabin'},options)).status,400);
});


test('File attachments from existing clients are accepted, sanitized at rest, editable and supported in artist profiles', async () => {
 const {req,key,post,sql}=await fixture();
 const original=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aSp0AAAAASUVORK5CYII=','base64');
 const marker=Buffer.from('private-source-metadata'),chunk=Buffer.alloc(12+marker.length);chunk.writeUInt32BE(marker.length);chunk.write('tEXt',4);marker.copy(chunk,8);
 const uploaded='data:image/png;base64,'+Buffer.concat([original.subarray(0,33),chunk,original.subarray(33)]).toString('base64');
 const created=await req('/posts','POST',{...post,images:[uploaded]});assert.equal(created.status,201,JSON.stringify(created.data));
 const detail=(await req('/posts/'+created.data.id)).data.post;
 const imageId=detail.images[0].id;
 assert.deepEqual(Buffer.from(sql.prepare('SELECT data FROM images WHERE id=?').get(imageId).data),original);
 assert.deepEqual(Buffer.from(await (await req('/media/'+imageId)).response.arrayBuffer()),original);
 assert.equal((await req('/posts/'+created.data.id,'PATCH',{...post,body:'edited',images:[{id:imageId}]})).status,200);
 const auth=await req('/admin/login','POST',{key},{origin:'https://sgia.test'});
 const options={origin:'https://sgia.test',headers:{Cookie:auth.response.headers.get('Set-Cookie').split(';')[0]}};
 const artist=await req('/admin/publish','POST',{member_id:'jaein',title:'file upload',body:'clean image',images:[uploaded]},options);assert.equal(artist.status,201,JSON.stringify(artist.data));
 const profile=await req('/admin/members/jaein','PATCH',{name:'재인',bio:'profile',image:uploaded},options);assert.equal(profile.status,200,JSON.stringify(profile.data));
 const avatar=sql.prepare("SELECT avatar_url FROM members WHERE id='jaein'").get().avatar_url;
 assert.deepEqual(Buffer.from(await (await req(avatar)).response.arrayBuffer()),original);
 assert.equal(sql.prepare('SELECT COUNT(*) n FROM images WHERE hex(data) LIKE ?').get('%'+marker.toString('hex').toUpperCase()+'%').n,0);
});

test('Admin board move preserves the post identity, comments, PIN and likes; rejects impersonation',async()=>{
 const {sql,req,post,key}=await fixture();
 const id=(await req('/posts','POST',{...post,channel:'soliloquy',tags:['team:shield']})).data.id;
 await req('/posts/'+id+'/comments','POST',{author:'팬',body:'@데인 안녕하세요',password:'123456',captcha:'verified',consent:true});
 await req('/posts/'+id+'/like','POST',{liked:true});
 const old=sql.prepare('SELECT password_hash FROM posts WHERE id=?').get(id).password_hash;
 const login=await req('/admin/login','POST',{key},{origin:'https://sgia.test'});
 const options={origin:'https://sgia.test',headers:{Cookie:login.response.headers.get('Set-Cookie').split(';')[0]}};
 assert.equal((await req('/admin/posts/'+id,'PATCH',{title:'이동',body:'@재인 응원',board:'lucky',member_id:'dain'},options)).status,400);
 assert.equal((await req('/admin/posts/'+id,'PATCH',{title:'이동',body:'@재인 응원',board:'lucky',member_id:null},options)).status,200);
 const detail=(await req('/posts/'+id)).data;
 assert.equal(detail.post.board,'lucky');assert.equal(detail.post.channel,'free');assert.deepEqual(detail.post.tags,[]);assert.equal(detail.post.likes,1);assert.equal(detail.comments.length,1);
 assert.equal(sql.prepare('SELECT password_hash FROM posts WHERE id=?').get(id).password_hash,old);
 assert.equal((await req('/posts?board=staff')).data.posts.length,0);
 assert.equal((await req('/admin/posts?post='+id,undefined,undefined,options)).data.posts[0].id,id);
 assert.equal((await req('/admin/posts/'+id,'PATCH',{title:'이동',body:'다시 이동',board:'staff',channel:'soliloquy'},options)).status,200);
 assert.equal((await req('/posts/'+id)).data.post.channel,'soliloquy');
});

test('Admin notifications require authentication, persist creation only, and reject unsafe push endpoints',async()=>{
 const {sql,env,req,post,key}=await fixture();
 assert.equal((await req('/admin/notifications')).status,401);
 const id=(await req('/posts','POST',post)).data.id;
 const comment=(await req('/posts/'+id+'/comments','POST',{body:'@데인 확인',password:'123456',captcha:'verified',consent:true})).data.id;
 assert.equal(sql.prepare('SELECT count(*) AS n FROM notification_events').get().n,2);
 const login=await req('/admin/login','POST',{key},{origin:'https://sgia.test'});
 const options={origin:'https://sgia.test',headers:{Cookie:login.response.headers.get('Set-Cookie').split(';')[0]}};
 const events=(await req('/admin/notifications','GET',undefined,options)).data.events;
 assert.equal(events.length,2);assert.ok(events.every(e=>e.post_id===id));assert.ok(events.some(e=>e.id===comment));
 const snapshot=(await req('/admin/notifications','GET',undefined,options)).data;
 assert.equal(snapshot.unread,2);
 assert.equal((await req('/admin/notifications/read','POST',{postId:id,through:snapshot.asOf},{...options,origin:'https://attacker.test'})).status,403);
 assert.equal((await req('/admin/notifications/read','POST',{postId:id,through:snapshot.asOf},options)).status,200);
 assert.equal((await req('/admin/notifications','GET',undefined,options)).data.unread,0);
 const later=(await req('/posts/'+id+'/comments','POST',{body:'새 답글',password:'123456',captcha:'verified',consent:true})).data.id;
 sql.prepare('UPDATE notification_events SET created_at=? WHERE id=?').run(snapshot.asOf+5,later);
 await req('/admin/notifications/read','POST',{all:true,through:snapshot.asOf},options);
 assert.equal((await req('/admin/notifications','GET',undefined,options)).data.unread,1);
 await req('/admin/notifications/read','POST',{all:true,through:snapshot.asOf+5},options);
 assert.equal((await req('/admin/notifications','GET',undefined,options)).data.unread,0);
 assert.equal((await req('/admin/push/config','GET',undefined,options)).data.publicKey,null);
 env.VAPID_PUBLIC_KEY='test';env.VAPID_PRIVATE_KEY='test';
 for(const endpoint of ['https://127.0.0.1/push','https://fcm.googleapis.com.attacker.test/a','http://web.push.apple.com/a','https://user:pass@web.push.apple.com/a'])assert.equal((await req('/admin/push/subscription','POST',{endpoint,keys:{}},options)).status,400);
 assert.equal((await req('/admin/push/revoke','POST',{}, {...options,origin:'https://attacker.test'})).status,403);
 const pair=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);
 const keys={p256dh:Buffer.from(await crypto.subtle.exportKey('raw',pair.publicKey)).toString('base64url'),auth:Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64url')};
 const subscription={endpoint:'https://web.push.apple.com/test-subscription',keys};
 assert.equal((await req('/admin/push/subscription','POST',subscription,options)).status,200);
 assert.equal((await req('/admin/push/subscription','POST',subscription,options)).status,200);
 assert.equal(sql.prepare('SELECT count(*) AS n FROM push_subscriptions').get().n,1);
 assert.equal((await req('/admin/push/subscription','DELETE',{endpoint:subscription.endpoint},options)).status,200);
 assert.equal(sql.prepare('SELECT count(*) AS n FROM push_subscriptions').get().n,0);
 const manifest=await req('/admin/manifest.webmanifest');assert.equal(manifest.data.display,'standalone');
 const sw=await req('/admin/sw.js');assert.match(await sw.response.text(),/notificationclick/);assert.equal(sw.response.headers.get('Service-Worker-Allowed'),'/admin');
});

test('Comment files, GIFs and links can be edited only with the owner PIN and follow visibility',async()=>{
 const {req,key,post,sql}=await fixture();
 const id=(await req('/posts','POST',post)).data.id;
 const gif='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
 const input={body:'@재인 사진입니다',author:'처음 이름',password:'123456',captcha:'verified',consent:true,images:[gif,{url:'https://images.example/comment.png'}]};
 const c=await req('/posts/'+id+'/comments','POST',input);assert.equal(c.status,201,JSON.stringify(c.data));
 const cid=c.data.id;let detail=(await req('/posts/'+id)).data;
 assert.equal(detail.comments[0].images.length,2);const image=detail.comments[0].images.find(x=>x.mime==='image/gif').id;
 assert.equal((await req('/media/'+image)).response.headers.get('Content-Type'),'image/gif');
 assert.equal((await req('/comments/'+cid,'PATCH',{...input,password:'000000',author:'탈취',images:[]})).status,403);
 assert.equal(sql.prepare('SELECT count(*) n FROM comment_images').get().n,2);
 assert.equal((await req('/comments/'+cid,'PATCH',{...input,author:'새 이름',body:'수정한 @재인',images:[{id:image}]})).status,200);
 detail=(await req('/posts/'+id)).data;assert.equal(detail.comments[0].author,'새 이름');assert.equal(detail.comments[0].images.length,1);
 assert.equal((await req('/posts/'+id,'PATCH',{...post,author:'게시글 새 이름'})).status,200);assert.equal((await req('/posts/'+id)).data.post.author,'게시글 새 이름');
 const login=await req('/admin/login','POST',{key},{origin:'https://sgia.test'}),options={origin:'https://sgia.test',headers:{Cookie:login.response.headers.get('Set-Cookie').split(';')[0]}};
 await req('/admin/moderate','POST',{kind:'comment',id:cid,action:'hide'},options);assert.equal((await req('/media/'+image)).status,404);assert.equal(sql.prepare('SELECT count(*) n FROM comment_images').get().n,1);
 await req('/admin/moderate','POST',{kind:'comment',id:cid,action:'restore'},options);assert.equal((await req('/media/'+image)).status,200);
 const c2=(await req('/posts/'+id+'/comments','POST',{...input,images:[]})).data.id;
 assert.equal((await req('/comments/'+c2,'PATCH',{...input,images:[{id:image}]})).status,400);
 const reply=(await req('/posts/'+id+'/comments','POST',{...input,parent_id:cid})).data.id;
 const replyImage=sql.prepare('SELECT id FROM comment_images WHERE comment_id=?').get(reply).id;
 await req('/admin/moderate','POST',{kind:'comment',id:cid,action:'hide'},options);assert.equal((await req('/media/'+replyImage)).status,404);
 await req('/admin/moderate','POST',{kind:'comment',id:cid,action:'restore'},options);
 assert.equal((await req('/comments/'+cid,'DELETE',{password:'123456',captcha:'verified'})).status,200);assert.equal((await req('/media/'+image)).status,404);
 assert.equal(sql.prepare('SELECT count(*) n FROM comment_images WHERE comment_id=?').get(cid).n,0);
});


test('Incident reports are shared across visitors with protected closure, validated locations and idempotent creation', async () => {
 const {req,sql,env}=await fixture();
 const record={id:'abcdef01-1234-4123-8123-123456789abc',type:'괴물',grade:'B',location:'가상 연구동',zone:'서울 동부',reporter:'관측자',detail:'현장에서 미확인 신호를 발견했습니다.',support:'합동팀',supportCustom:true,personnel:1250,requests:'',occurredAt:Date.now(),coordinates:[37.56,126.97],approximate:true,area:{type:'Polygon',coordinates:[[[126,37],[127,37],[127,38],[126,37]]]},areaSource:'manual'};
 const payload={record,password:'123456',consent:true,captcha:'verified'};
 assert.equal((await req('/incidents','POST',payload,{origin:'https://evil.test'})).status,403);
 assert.equal((await req('/incidents','POST',{...payload,consent:false})).status,400);
 assert.equal((await req('/incidents','POST',{...payload,record:{...record,coordinates:[100,0]}})).status,400);
 assert.equal((await req('/incidents','POST',{...payload,record:{...record,personnel:-1}})).status,400);
 const created=await req('/incidents','POST',payload);assert.equal(created.status,200);assert.equal(created.data.incident.personnel,1250);
 assert.equal((await req('/incidents','POST',payload)).status,200);assert.equal(sql.prepare('SELECT count(*) n FROM incidents').get().n,1);
 const stranger=await req('/incidents','GET',null,{ip:'192.0.2.99'});assert.equal(stranger.status,200);assert.equal(stranger.data.incidents[0].location,record.location);assert.deepEqual(stranger.data.incidents[0].area,record.area);assert.ok(!JSON.stringify(stranger.data).includes('pin_hash'));assert.ok(!JSON.stringify(stranger.data).includes('owner_hash'));
 assert.equal((await req('/incidents/'+record.id,'PATCH',{resolved:true,password:'000000'},{ip:'192.0.2.99'})).status,403);
 assert.equal((await req('/incidents/'+record.id,'PATCH',{resolved:true,password:'123456'})).status,200);
 assert.ok((await req('/incidents')).data.incidents[0].resolvedAt);
 assert.equal((await req('/incidents/'+record.id,'PATCH',{resolved:false,password:'123456'})).status,200);
 assert.equal((await req('/incidents')).data.incidents[0].resolvedAt,null);
 // More than one page is returned through an explicit increasing cursor.
 for(let i=0;i<205;i++)sql.prepare('INSERT INTO incidents(id,record,owner_hash,pin_salt,pin_hash,updated_at) VALUES (?,?,?,?,?,?)').run('seed-'+i,JSON.stringify({...created.data.incident,id:'seed-'+i}),'x','x','x',i);
 const first=(await req('/incidents')).data;assert.equal(first.incidents.length,200);assert.ok(first.next);
 const second=(await req('/incidents?after='+first.next)).data;assert.equal(second.incidents.length,6);assert.equal(second.next,null);
 env.TURNSTILE_SECRET='';assert.equal((await req('/incidents','POST',{...payload,record:{...record,id:'abcdef02-1234-4123-8123-123456789abc'}})).status,503);
});


test('Legacy reports automatically import once, preserve history, and only admins can edit or delete them',async()=>{
 const {req,sql,key}=await fixture();
 const {generateIncident}=await import('../../assets/model.js');
 const automatic=generateIncident(1,()=>.2,1000000);
 const manual={...generateIncident(2,()=>.3,2000000),manual:true,reporter:'이전 신고자',zone:'이전 구역',location:'가상 현장',detail:'다른 브라우저에서도 확인할 기존 신고입니다.',support:'실드',personnel:99,requests:'',occurredAt:1500000,resolvedAt:3000000,coordinates:[37.5,127]};
 const data={records:[automatic,manual]};
 assert.equal((await req('/incidents/import','POST',data,{origin:'https://evil.test'})).status,403);
 assert.equal((await req('/incidents/import','POST',{records:[{...manual,coordinates:[999,0]}]})).status,400);
 const imported=await req('/incidents/import','POST',data);assert.equal(imported.status,200);
 const id=imported.data.accepted[1].id;
 assert.equal((await req('/incidents/import','POST',data,{ip:'192.0.2.44'})).status,200);
 assert.equal(sql.prepare('SELECT count(*) n FROM incidents').get().n,2);
 let rows=(await req('/incidents','GET',null,{ip:'192.0.2.99'})).data.incidents;
 const record=rows.find(r=>r.id===id);assert.equal(record.created,2000000);assert.equal(record.resolvedAt,3000000);assert.deepEqual(record.coordinates,[37.5,127]);assert.equal(record.reporter,manual.reporter);
 assert.equal((await req('/incidents/'+id,'PATCH',{resolved:false,password:'123456'})).status,403);
 assert.equal((await req('/admin/incidents/'+id,'DELETE',null,{origin:'https://sgia.test'})).status,401);
 const auth=await req('/admin/login','POST',{key},{origin:'https://sgia.test'});
 const admin={origin:'https://sgia.test',headers:{Cookie:auth.response.headers.get('Set-Cookie').split(';')[0]}};
 assert.equal((await req('/admin/incidents/'+id,'PATCH',{detail:'관리자가 수정한 사건 설명입니다.',zone:'수정 구역',resolved:false},admin)).status,200);
 assert.equal((await req('/incidents')).data.incidents.find(r=>r.id===id).zone,'수정 구역');
 await req('/incidents/import','POST',data);assert.equal((await req('/incidents')).data.incidents.find(r=>r.id===id).zone,'수정 구역');
 assert.equal((await req('/admin/incidents/'+id,'DELETE',null,admin)).status,200);
 await req('/incidents/import','POST',data);assert.equal((await req('/incidents')).data.incidents.length,1);
 assert.equal(sql.prepare("SELECT count(*) n FROM audit WHERE action LIKE 'INCIDENT_%'").get().n,2);
 assert.deepEqual(JSON.parse(sql.prepare('SELECT record FROM incidents WHERE id=?').get(id).record),{id,deleted:true});
});

test('Large comment threads paginate, focus an old reply, and include member replies in profiles',async()=>{
 const {req,sql,post,key}=await fixture();const created=await req('/posts','POST',{...post,board:'lucky'});const id=created.data.id;
 const ids=Array.from({length:125},()=>crypto.randomUUID());
 for(let i=0;i<125;i++)sql.prepare("INSERT INTO comments(id,post_id,author,body,salt,password_hash,created_at,parent_id,member_id) VALUES (?,?,?,'댓글','','',?,?,?)").run(ids[i],id,'ㅇㅇ',1000+i,i===124?ids[0]:null,i===124?'jaein':null);
 let r=await req('/posts/'+id);assert.equal(r.data.commentTotal,125);assert.equal(r.data.comments.length,50);assert.equal(r.data.nextComments,50);
 r=await req('/posts/'+id+'/comments?offset=100');assert.equal(r.data.comments.length,26);assert.equal(r.data.nextComments,null);assert.ok(r.data.comments.some(c=>c.id===ids[0]));
 r=await req('/posts/'+id+'?focus='+ids[124]);assert.ok(r.data.comments.some(c=>c.id===ids[124]));
 const feed=await req('/members/jaein/feed');assert.ok(feed.data.items.some(c=>c.kind==='comment'&&c.id===ids[124]));
 sql.prepare('UPDATE comments SET hidden=1 WHERE id=?').run(ids[0]);
 assert.equal((await req('/posts/'+id+'?focus='+ids[124])).data.comments.some(c=>c.id===ids[124]),false);
 assert.equal((await req('/members/jaein/feed')).data.items.some(c=>c.id===ids[124]),false);
 const login=await req('/admin/login','POST',{key},{origin:'https://sgia.test'});const admin={origin:'https://sgia.test',headers:{Cookie:login.response.headers.get('Set-Cookie').split(';')[0]}};
 const first=await req('/admin/comments?post='+id,'GET',null,admin),second=await req('/admin/comments?post='+id+'&offset=30','GET',null,admin);
 assert.equal(first.data.next,30);assert.equal(second.data.comments.length,30);assert.equal(first.data.comments.some(c=>second.data.comments.some(d=>c.id===d.id)),false);
});

test('Bulk incident moderation is authenticated, validates the whole selection, and preserves deletion tombstones',async()=>{
 const {req,sql,key}=await fixture();const {generateIncident}=await import('../../assets/model.js');
 const records=[generateIncident(31,()=>.3,1000000),generateIncident(32,()=>.4,2000000)];
 const imported=await req('/incidents/import','POST',{records});const ids=imported.data.accepted.map(x=>x.id);
 assert.equal((await req('/admin/incidents/bulk','POST',{ids,action:'delete'},{origin:'https://sgia.test'})).status,401);
 const login=await req('/admin/login','POST',{key},{origin:'https://sgia.test'}),admin={origin:'https://sgia.test',headers:{Cookie:login.response.headers.get('Set-Cookie').split(';')[0]}};
 assert.equal((await req('/admin/incidents/bulk','POST',{ids:[...ids,crypto.randomUUID()],action:'delete'},admin)).status,409);
 assert.equal((await req('/incidents')).data.incidents.length,2);
 assert.equal((await req('/admin/incidents/bulk','POST',{ids,action:'resolve'},admin)).status,200);
 assert.ok((await req('/incidents')).data.incidents.every(r=>r.resolvedAt&&r.detail));
 assert.equal((await req('/admin/incidents/bulk','POST',{ids,action:'delete'},admin)).data.count,2);
 await req('/incidents/import','POST',{records});assert.equal((await req('/incidents')).data.incidents.length,0);
 assert.equal(sql.prepare('SELECT count(*) n FROM incidents').get().n,2);
});

test('Translation sends only requested visible text and never hidden comments or unsupported targets',async()=>{
 const {req,sql,post}=await fixture();const id=(await req('/posts','POST',post)).data.id;
 const saved=globalThis.fetch;let calls=0;
 globalThis.fetch=async(url,...args)=>{if(String(url).startsWith('https://api.mymemory.translated.net/')){calls++;assert.equal(new URL(url).searchParams.get('langpair'),'ko|en');return Response.json({responseStatus:200,responseData:{translatedText:'This is a post.'}});}return saved(url,...args);};
 try{
  assert.equal((await req('/translate?kind=post&id='+id+'&target=en')).data.text,'This is a post.');assert.equal(calls,1);
  assert.equal((await req('/translate?kind=post&id='+id+'&target=ko')).data.text,post.body);assert.equal(calls,1);
  sql.prepare('UPDATE posts SET hidden=1 WHERE id=?').run(id);
  assert.equal((await req('/translate?kind=post&id='+id+'&target=en')).status,404);assert.equal(calls,1);
  assert.equal((await req('/translate?kind=post&id='+id+'&target=xx')).status,400);
 }finally{globalThis.fetch=saved;}
});

test('Playlist catalog is shared, admin-only writes validate videos and retain ordering',async()=>{
 const {req,key}=await fixture();
 assert.equal((await req('/playlists')).data.playlists.length,0);
 assert.equal((await req('/admin/playlists','POST',{} ,{origin:'https://sgia.test'})).status,401);
 const auth=await req('/admin/login','POST',{key},{origin:'https://sgia.test'});
 const options={origin:'https://sgia.test',headers:{Cookie:auth.response.headers.get('Set-Cookie').split(';')[0]}};
 const draft={title:'재인 — 퇴근길',member_id:'jaein',description:'운영자 선곡',tracks:[{title:'첫 곡',artist:'가수',url:'https://youtu.be/abcdefghijk'},{title:'다음 곡',artist:'',url:'https://www.youtube.com/watch?v=zyxwvutsrqp'}]};
 const saved=await req('/admin/playlists','POST',draft,options);assert.equal(saved.status,200);
 let list=(await req('/playlists')).data.playlists;assert.equal(list[0].tracks[1].video_id,'zyxwvutsrqp');
 assert.equal((await req('/admin/playlists/'+saved.data.id,'PATCH',{...draft,tracks:[{title:'bad',url:'https://youtube.com.evil.example/watch?v=abcdefghijk'}]},options)).status,400);
 assert.equal((await req('/admin/playlists/'+saved.data.id,'PATCH',{...draft,tracks:[{title:'bad',url:'javascript:alert(1)'}]},options)).status,400);
 assert.equal((await req('/admin/playlists/'+saved.data.id,'PATCH',{...draft,member_id:'not-a-member'},options)).status,400);
 assert.equal((await req('/playlists','POST',draft)).status,405);
 await req('/admin/playlists/'+saved.data.id,'PATCH',{...draft,title:'수정',tracks:[]},options);
 list=(await req('/playlists')).data.playlists;assert.equal(list[0].title,'수정');assert.deepEqual(list[0].tracks,[]);
 await req('/admin/playlists/'+saved.data.id,'DELETE',{},options);assert.equal((await req('/playlists')).data.playlists.length,0);
});

test('Song suggestions are private, retry-safe, validated and readable only by administrators',async()=>{
 const {req,key}=await fixture();const id=crypto.randomUUID();
 const draft={id,character:'직접 입력 인물',title:'추천곡',artist:'가수',url:''};
 assert.equal((await req('/music-requests','POST',draft,{origin:'https://evil.example'})).status,403);
 assert.equal((await req('/music-requests','POST',{...draft,artist:''})).status,400);
 assert.equal((await req('/music-requests','POST',{...draft,url:'https://youtube.com.evil.example/watch?v=abcdefghijk'})).status,400);
 assert.equal((await req('/music-requests','POST',draft)).status,201);
 assert.equal((await req('/music-requests','POST',draft)).status,200);
 assert.equal((await req('/music-requests')).status,405);
 assert.equal((await req('/music-requests/'+id)).status,405);
 assert.equal((await req('/admin/music-requests')).status,401);
 assert.equal((await req('/admin/music-requests/'+id,'PATCH',{},{origin:'https://sgia.test'})).status,401);
 const login=await req('/admin/login','POST',{key},{origin:'https://sgia.test'});
 const admin={origin:'https://sgia.test',headers:{Cookie:login.response.headers.get('Set-Cookie').split(';')[0]}};
 const inbox=await req('/admin/music-requests','GET',undefined,admin);
 assert.equal(inbox.data.requests.length,1);assert.equal(inbox.data.requests[0].character,draft.character);
 assert.equal(inbox.data.requests[0].youtube_url,'');assert.equal(inbox.response.headers.get('Cache-Control'),'no-store');
 const notices=await req('/admin/notifications','GET',undefined,admin);
 assert.equal(notices.data.unread,1);assert.equal(notices.data.events[0].kind,'music');assert.equal(notices.data.events[0].id,id);
 assert.equal((await req('/admin/music-requests/'+id,'GET',undefined,admin)).data.requests[0].title,draft.title);
 assert.equal((await req('/admin/music-requests/'+id)).status,401);
 assert.equal((await req('/admin/music-requests/'+id,'PATCH',{},admin)).status,200);
 assert.equal((await req('/admin/notifications','GET',undefined,admin)).data.unread,0);
 assert.equal((await req('/admin/music-requests','GET',undefined,admin)).data.requests.length,0);
 assert.equal((await req('/admin/music-requests?filter=all','GET',undefined,admin)).data.requests.length,1);
 for(let i=0;i<5;i++)assert.equal((await req('/music-requests','POST',{...draft,id:crypto.randomUUID(),url:'https://youtu.be/abcdefghijk'})).status,201);
 assert.equal((await req('/admin/notifications','GET',undefined,admin)).data.unread,5);
 assert.equal((await req('/admin/notifications/read','POST',{all:true,through:Date.now()},admin)).status,200);
 assert.equal((await req('/admin/notifications','GET',undefined,admin)).data.unread,0);
 assert.equal((await req('/music-requests','POST',{...draft,id:crypto.randomUUID()})).status,429);
});

test('Guestbook notes notify the owner and can be edited, hidden, traced and deleted',async()=>{
 const {req,key}=await fixture();
 const posted=await req('/guestbook','POST',{character:'binjo',author:'방문자',message:'안녕',font:'memo',color:'#1F2430',x:.2,y:.3,size:40});
 assert.equal(posted.status,201);const id=posted.data.id;assert.match(id,/^[a-f0-9-]{36}$/);
 assert.equal((await req('/guestbook?character=binjo')).data.notes[0].size,28);
 assert.equal((await req('/admin/guestbook')).status,401);
 const login=await req('/admin/login','POST',{key},{origin:'https://sgia.test'});
 const admin={origin:'https://sgia.test',headers:{Cookie:login.response.headers.get('Set-Cookie').split(';')[0]}};
 const notices=await req('/admin/notifications','GET',undefined,admin);
 assert.equal(notices.data.unread,1);assert.equal(notices.data.events[0].kind,'guestbook');assert.equal(notices.data.events[0].id,id);
 assert.equal((await req('/admin/guestbook?filter=new','GET',undefined,admin)).data.notes.length,1);
 assert.equal((await req('/admin/guestbook/'+id,'PATCH',{read:true},admin)).status,200);
 assert.equal((await req('/admin/notifications','GET',undefined,admin)).data.unread,0);
 assert.equal((await req('/admin/guestbook/'+id,'PATCH',{message:'수정됨'},admin)).status,200);
 assert.equal((await req('/guestbook?character=binjo')).data.notes[0].message,'수정됨');
 assert.equal((await req('/admin/guestbook/'+id,'PATCH',{hidden:true},admin)).status,200);
 assert.equal((await req('/guestbook?character=binjo')).data.notes.length,0);
 assert.ok((await req('/admin/ip','POST',{id},admin)).data.ip);
 assert.equal((await req('/admin/moderate','POST',{kind:'guestbook',id,action:'delete'},admin)).status,400);
 assert.equal((await req('/admin/moderate','POST',{kind:'guestbook',id,action:'block'},admin)).status,200);
 assert.equal((await req('/guestbook','POST',{character:'binjo',message:'차단 후'})).status,403);
 assert.equal((await req('/admin/guestbook/'+id,'DELETE',undefined,admin)).status,200);
 assert.equal((await req('/admin/guestbook?filter=all','GET',undefined,admin)).data.notes.filter(n=>n.character==='binjo').length,0);
 // Zion's former built-in examples are ordinary, already-read rows the owner can manage.
 const examples=(await req('/guestbook?character=jion')).data.notes;assert.equal(examples.length,3);
 const example=examples[0].id;
 assert.equal((await req('/admin/guestbook/'+example,'PATCH',{message:'예시 수정'},admin)).status,200);
 assert.equal((await req('/guestbook?character=jion')).data.notes[0].message,'예시 수정');
 assert.equal((await req('/admin/guestbook/'+example,'DELETE',undefined,admin)).status,200);
 assert.equal((await req('/guestbook?character=jion')).data.notes.length,2);
});

test('Playlists keep SGIA before HKU, accept new teams and cover links, and hide on request',async()=>{
 const {req,key}=await fixture();
 const auth=await req('/admin/login','POST',{key},{origin:'https://sgia.test'});
 const options={origin:'https://sgia.test',headers:{Cookie:auth.response.headers.get('Set-Cookie').split(';')[0]}};
 const track={title:'곡',artist:'가수',url:'https://youtu.be/abcdefghijk'};
 assert.equal((await req('/admin/playlists','POST',{title:'HKU',universe:'hku',tracks:[track]},options)).status,400);
 const hku=await req('/admin/playlists','POST',{title:'HKU',universe:'hku',character:'새 인물',tracks:[{...track,cover:'https://example.com/a.jpg'},{...track,title:'숨김 곡',hidden:true}]},options);
 assert.equal(hku.status,200);
 assert.equal((await req('/admin/playlists','POST',{title:'X',team:'새팀',tracks:[{...track,cover:'http://example.com/a.jpg'}]},options)).status,400);
 const sgia=await req('/admin/playlists','POST',{title:'새 팀',team:'실드',tracks:[track]},options);
 const hidden=await req('/admin/playlists','POST',{title:'비공개',team:'비콘',hidden:true,tracks:[track]},options);
 const list=(await req('/playlists')).data.playlists;
 assert.equal(list.length,2);
 const h=list.find(p=>p.id===hku.data.id);assert.equal(h.team,'hankuk');assert.equal(h.universe,'hku');assert.equal(h.character,'새 인물');
 assert.equal(h.tracks.length,1);assert.equal(h.tracks[0].cover,'https://example.com/a.jpg');
 assert.equal(list.find(p=>p.id===sgia.data.id).team,'shield');
 assert.equal((await req('/admin/playlists','GET',undefined,options)).data.playlists.length,3);
 assert.ok(!list.some(p=>p.id===hidden.data.id));
});
