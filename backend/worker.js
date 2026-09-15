import {
  random,
  digest,
  hmac,
  equal,
  passwordHash,
  cipherIP,
  decipherIP,
  HTTPError,
  text,
  pin,
  board,
} from './security.js';
import { adminHTML, adminJS } from './admin.js';
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
const now = () => Date.now();
const kday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
async function body(request) {
  if (!request.headers.get('content-type')?.includes('application/json'))
    throw new HTTPError(415, 'JSON 요청이 필요합니다.');
  const reader = request.body?.getReader();
  if (!reader) throw new HTTPError(400, '본문이 필요합니다.');
  let chunks = [],
    total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > 24000) {
      await reader.cancel();
      throw new HTTPError(413, '본문이 너무 큽니다.');
    }
    chunks.push(value);
  }
  try {
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const c of chunks) {
      bytes.set(c, offset);
      offset += c.length;
    }
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new HTTPError(400, '잘못된 요청입니다.');
  }
}
async function rate(env, key, limit, seconds) {
  const current = now(),
    slot = Math.floor(current / (seconds * 1000)),
    k = key + ':' + slot;
  const row = await env.DB.prepare(
    'INSERT INTO rate_limits(key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count',
  )
    .bind(k, current + seconds * 1000)
    .first();
  if (row.count > limit) throw new HTTPError(429, '요청이 많습니다. 잠시 후 다시 시도해 주세요.');
}
async function captcha(data, env, ip) {
  if (!env.TURNSTILE_SECRET) throw new HTTPError(503, '작성 보안 설정이 준비되지 않았습니다.');
  const token = text(data.captcha, 1, 2048, '보안 확인');
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token, remoteip: ip }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new HTTPError(503, '보안 확인 서버 연결 대기');
  const result = await response.json();
  if (
    !result.success ||
    result.hostname !== env.TURNSTILE_HOSTNAME ||
    result.action !== 'community'
  )
    throw new HTTPError(403, '보안 확인을 다시 완료해 주세요.');
}
async function identity(request, env) {
  const ip = request.headers.get('CF-Connecting-IP');
  if (!ip) throw new HTTPError(403, '요청 경로를 확인할 수 없습니다.');
  const hash = await hmac(env.IP_KEY, 'ip:' + ip);
  return { ip, hash };
}
async function blocked(env, hash) {
  const b = await env.DB.prepare('SELECT expires FROM blocks WHERE ip_hash=? AND expires>?')
    .bind(hash, now())
    .first();
  if (b) throw new HTTPError(403, '운영 정책에 따라 작성이 제한되었습니다.');
}
async function session(request, env) {
  const token = request.headers
    .get('cookie')
    ?.match(/(?:^|;\s*)__Host-sgia_admin=([a-f0-9]{64})(?:;|$)/)?.[1];
  if (!token) throw new HTTPError(401, '관리자 인증이 필요합니다.');
  const hash = await digest(token),
    s = await env.DB.prepare('SELECT hash FROM sessions WHERE hash=? AND expires>?')
      .bind(hash, now())
      .first();
  if (!s) throw new HTTPError(401, '관리자 세션이 만료되었습니다.');
  return hash;
}
async function sourceLog(env, id, kind, ip, hash) {
  return env.DB.prepare(
    'INSERT INTO access_logs(id,kind,ip_cipher,ip_hash,created_at) VALUES (?,?,?,?,?)',
  ).bind(id, kind, await cipherIP(ip, env.IP_KEY), hash, now());
}
const postFields = 'p.id,p.board,p.title,p.author,p.department,p.body,p.created_at,p.updated_at';
async function handle(request, env) {
  if (!env.DB || !env.PASSWORD_PEPPER || !env.IP_KEY || !env.ADMIN_KEY_HASH)
    throw new HTTPError(503, '서버 준비 중입니다.');
  const url = new URL(request.url),
    path = url.pathname,
    method = request.method,
    origin = request.headers.get('Origin');
  const isAdmin = path.startsWith('/admin');
  if (method === 'OPTIONS') {
    if (isAdmin || origin !== env.PUBLIC_ORIGIN)
      throw new HTTPError(403, '허용되지 않은 요청입니다.');
    return new Response(null, { status: 204 });
  }
  if (!['GET', 'HEAD'].includes(method)) {
    if (origin !== (isAdmin ? url.origin : env.PUBLIC_ORIGIN))
      throw new HTTPError(403, '허용되지 않은 출처입니다.');
  }
  if (path === '/health') return json({ ready: !!env.TURNSTILE_SECRET });
  if (path === '/admin' && method === 'GET')
    return new Response(adminHTML, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy':
          "default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
      },
    });
  if (path === '/admin/app.js' && method === 'GET')
    return new Response(adminJS, { headers: { 'Content-Type': 'text/javascript; charset=utf-8' } });
  if (path === '/admin/login' && method === 'POST') {
    const { hash } = await identity(request, env);
    await rate(env, 'admin-login:' + hash, 5, 900);
    const data = await body(request);
    if (
      typeof data.key !== 'string' ||
      data.key.length > 200 ||
      !equal(await digest(data.key), env.ADMIN_KEY_HASH)
    )
      throw new HTTPError(401, '관리자 인증 정보가 올바르지 않습니다.');
    const token = random();
    await env.DB.prepare('INSERT INTO sessions(hash,expires) VALUES (?,?)')
      .bind(await digest(token), now() + 8 * 3600000)
      .run();
    return new Response('{"ok":true}', {
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `__Host-sgia_admin=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`,
      },
    });
  }
  if (isAdmin) {
    const hash = await session(request, env);
    if (path === '/admin/logout' && method === 'POST') {
      await env.DB.prepare('DELETE FROM sessions WHERE hash=?').bind(hash).run();
      return new Response('{"ok":true}', {
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': '__Host-sgia_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
        },
      });
    }
    if (path === '/admin/posts' && method === 'GET') {
      const offset = Math.max(0, Math.min(100000, Number(url.searchParams.get('offset')) || 0));
      const { results } = await env.DB.prepare(
        'SELECT id,board,title,author,department,body,created_at,updated_at,hidden,deleted_at FROM posts ORDER BY created_at DESC LIMIT 30 OFFSET ?',
      )
        .bind(offset)
        .all();
      return json({ posts: results, offset });
    }
    if (path === '/admin/comments' && method === 'GET') {
      const { results } = await env.DB.prepare(
        'SELECT id,post_id,author,body,created_at,updated_at,hidden,deleted_at FROM comments WHERE post_id=? ORDER BY created_at DESC LIMIT 100',
      )
        .bind(url.searchParams.get('post'))
        .all();
      return json({ comments: results });
    }
    if (path === '/admin/ip' && method === 'POST') {
      const data = await body(request),
        id = text(data.id, 1, 80, '기록');
      const log = await env.DB.prepare(
        'SELECT ip_cipher,created_at FROM access_logs WHERE id=? AND created_at>?',
      )
        .bind(id, now() - 30 * 86400000)
        .first();
      await env.DB.prepare('INSERT INTO audit(id,action,target,created_at) VALUES (?,?,?,?)')
        .bind(random(), 'VIEW_IP', id, now())
        .run();
      return json({
        ip: log ? await decipherIP(log.ip_cipher, env.IP_KEY) : null,
        retention_days: 30,
      });
    }
    if (path === '/admin/moderate' && method === 'POST') {
      const data = await body(request),
        id = text(data.id, 1, 80, '기록');
      if (
        !['post', 'comment'].includes(data.kind) ||
        !['hide', 'restore', 'delete', 'block'].includes(data.action)
      )
        throw new HTTPError(400, '잘못된 관리 작업입니다.');
      const table = data.kind === 'post' ? 'posts' : 'comments';
      const record = await env.DB.prepare(`SELECT id FROM ${table} WHERE id=?`).bind(id).first();
      if (!record) throw new HTTPError(404, '기록이 없습니다.');
      const changes = [];
      if (data.action === 'block') {
        const log = await env.DB.prepare(
          'SELECT ip_hash FROM access_logs WHERE id=? AND created_at>?',
        )
          .bind(id, now() - 30 * 86400000)
          .first();
        if (!log?.ip_hash) throw new HTTPError(404, 'IP 보관 기간이 지났습니다.');
        changes.push(
          env.DB.prepare(
            'INSERT INTO blocks(ip_hash,expires) VALUES (?,?) ON CONFLICT(ip_hash) DO UPDATE SET expires=excluded.expires',
          ).bind(log.ip_hash, now() + 30 * 86400000),
        );
      } else if (data.action === 'delete') {
        changes.push(
          env.DB.prepare(
            `UPDATE ${table} SET body='',${data.kind === 'post' ? "title='삭제된 게시물',department=''," : ''}author='삭제됨',password_hash='',salt='',deleted_at=?,hidden=1 WHERE id=?`,
          ).bind(now(), id),
        );
        if (data.kind === 'post')
          changes.push(
            env.DB.prepare(
              "UPDATE comments SET body='',author='삭제됨',password_hash='',salt='',deleted_at=?,hidden=1 WHERE post_id=?",
            ).bind(now(), id),
          );
      } else
        changes.push(
          env.DB.prepare(`UPDATE ${table} SET hidden=? WHERE id=? AND deleted_at IS NULL`).bind(
            data.action === 'hide' ? 1 : 0,
            id,
          ),
        );
      changes.push(
        env.DB.prepare('INSERT INTO audit(id,action,target,created_at) VALUES (?,?,?,?)').bind(
          random(),
          data.action.toUpperCase(),
          id,
          now(),
        ),
      );
      await env.DB.batch(changes);
      return json({ ok: true });
    }
    if (path === '/admin/audit' && method === 'GET') {
      return json(
        await env.DB.prepare(
          'SELECT action,target,created_at FROM audit ORDER BY created_at DESC LIMIT 100',
        ).all(),
      );
    }
    if (path === '/admin/blocks' && method === 'GET')
      return json(
        await env.DB.prepare('SELECT ip_hash,expires FROM blocks WHERE expires>?')
          .bind(now())
          .all(),
      );
    if (path === '/admin/unblock' && method === 'POST') {
      const data = await body(request),
        ipHash = text(data.hash, 64, 64, '차단 식별자');
      await env.DB.batch([
        env.DB.prepare('DELETE FROM blocks WHERE ip_hash=?').bind(ipHash),
        env.DB.prepare('INSERT INTO audit(id,action,target,created_at) VALUES (?,?,?,?)').bind(
          random(),
          'UNBLOCK',
          ipHash,
          now(),
        ),
      ]);
      return json({ ok: true });
    }
    throw new HTTPError(404, '관리 경로가 없습니다.');
  }
  if (path === '/visitors' && method === 'POST') {
    const { ip, hash } = await identity(request, env);
    await rate(env, 'visit:' + hash, 30, 3600);
    const day = kday(),
      key = await hmac(env.IP_KEY, 'visit:' + day + ':' + ip);
    await env.DB.batch([
      env.DB.prepare('INSERT OR IGNORE INTO visitor_keys(key,day) VALUES (?,?)').bind(key, day),
      env.DB.prepare("UPDATE counters SET value=value+changes() WHERE name='visitors'"),
      env.DB.prepare('INSERT OR IGNORE INTO visitor_totals(day,count) VALUES (?,0)').bind(day),
      env.DB.prepare(
        'UPDATE visitor_totals SET count=(SELECT COUNT(*) FROM visitor_keys WHERE day=?) WHERE day=?',
      ).bind(day, day),
    ]);
    const today = await env.DB.prepare('SELECT count FROM visitor_totals WHERE day=?')
        .bind(day)
        .first(),
      total = await env.DB.prepare("SELECT value FROM counters WHERE name='visitors'").first();
    return json({
      today: today?.count || 0,
      total: total.value,
      metric: 'KST daily unique network visits',
    });
  }
  if (path === '/visitors' && method === 'GET') {
    const today = await env.DB.prepare('SELECT count FROM visitor_totals WHERE day=?')
        .bind(kday())
        .first(),
      total = await env.DB.prepare("SELECT value FROM counters WHERE name='visitors'").first();
    return json({ today: today?.count || 0, total: total.value });
  }
  if ((path === '/posts' || path.startsWith('/posts/')) && method === 'GET') {
    const { hash } = await identity(request, env);
    await rate(env, 'read:' + hash, 120, 60);
  }
  if (path === '/posts' && method === 'GET') {
    const b = board(url.searchParams.get('board')),
      offset = Math.max(0, Math.min(100000, Number(url.searchParams.get('offset')) || 0)),
      search = (url.searchParams.get('q') || '').slice(0, 60);
    const { results } = await env.DB.prepare(
      `SELECT ${postFields},(SELECT COUNT(*) FROM comments c WHERE c.post_id=p.id AND c.hidden=0 AND c.deleted_at IS NULL) AS comments FROM posts p WHERE p.board=? AND p.hidden=0 AND p.deleted_at IS NULL AND (p.title LIKE ? ESCAPE '\\' OR p.body LIKE ? ESCAPE '\\') ORDER BY p.created_at DESC LIMIT 21 OFFSET ?`,
    )
      .bind(
        b,
        '%' + search.replace(/[\\%_]/g, '\\$&') + '%',
        '%' + search.replace(/[\\%_]/g, '\\$&') + '%',
        offset,
      )
      .all();
    return json({
      posts: results.slice(0, 20).map(({ body, ...row }) => row),
      more: results.length > 20,
    });
  }
  const match = path.match(/^\/(posts|comments)\/([a-f0-9-]{36})(?:\/(comments))?$/);
  if (match && method === 'GET' && match[1] === 'posts') {
    const row = await env.DB.prepare(
      `SELECT ${postFields} FROM posts p WHERE p.id=? AND p.hidden=0 AND p.deleted_at IS NULL`,
    )
      .bind(match[2])
      .first();
    if (!row) throw new HTTPError(404, '게시물이 없거나 숨김 처리되었습니다.');
    const { results } = await env.DB.prepare(
      'SELECT id,author,body,created_at,updated_at FROM comments WHERE post_id=? AND hidden=0 AND deleted_at IS NULL ORDER BY created_at LIMIT 100',
    )
      .bind(row.id)
      .all();
    return json({ post: row, comments: results });
  }
  if ((path === '/posts' || match) && ['POST', 'PATCH', 'DELETE'].includes(method)) {
    const { ip, hash } = await identity(request, env);
    await blocked(env, hash);
    await rate(env, 'write:' + hash, 30, 3600);
    const data = await body(request);
    pin(data.password);
    await captcha(data, env, ip);
    if (method === 'POST' && (path === '/posts' || match?.[3] === 'comments')) {
      if (data.consent !== true) throw new HTTPError(400, '운영·IP 보관 안내에 동의해 주세요.');
      await rate(env, 'create:' + hash, 6, 60);
      const id = crypto.randomUUID(),
        salt = random(),
        pwd = await passwordHash(data.password, salt, env.PASSWORD_PEPPER),
        created = now(),
        author = text(data.author, 1, 24, '닉네임'),
        content = text(data.body, 1, path === '/posts' ? 5000 : 1000, '내용');
      let stmt;
      if (path === '/posts') {
        stmt = env.DB.prepare(
          'INSERT INTO posts(id,board,title,author,department,body,salt,password_hash,created_at) VALUES (?,?,?,?,?,?,?,?,?)',
        ).bind(
          id,
          board(data.board),
          text(data.title, 1, 100, '제목'),
          author,
          text(data.department || '', 0, 40, '부서'),
          content,
          salt,
          pwd,
          created,
        );
      } else {
        const parent = await env.DB.prepare(
          'SELECT id FROM posts WHERE id=? AND hidden=0 AND deleted_at IS NULL',
        )
          .bind(match[2])
          .first();
        if (!parent) throw new HTTPError(404, '게시물이 없습니다.');
        const count = await env.DB.prepare(
          'SELECT COUNT(*) AS n FROM comments WHERE post_id=? AND deleted_at IS NULL',
        )
          .bind(parent.id)
          .first();
        if (count.n >= 100) throw new HTTPError(409, '게시물당 댓글은 100개까지 등록됩니다.');
        stmt = env.DB.prepare(
          'INSERT INTO comments(id,post_id,author,body,salt,password_hash,created_at) VALUES (?,?,?,?,?,?,?)',
        ).bind(id, parent.id, author, content, salt, pwd, created);
      }
      await env.DB.batch([
        stmt,
        await sourceLog(env, id, path === '/posts' ? 'post' : 'comment', ip, hash),
      ]);
      return json({ id }, 201);
    }
    if (match && !match[3] && ['PATCH', 'DELETE'].includes(method)) {
      const table = match[1],
        id = match[2];
      await rate(env, 'password-ip:' + hash, 10, 900);
      await rate(env, 'password-record:' + id, 5, 900);
      const row = await env.DB.prepare(
        `SELECT salt,password_hash FROM ${table} WHERE id=? AND hidden=0 AND deleted_at IS NULL`,
      )
        .bind(id)
        .first();
      if (
        !row ||
        !equal(await passwordHash(data.password, row.salt, env.PASSWORD_PEPPER), row.password_hash)
      )
        throw new HTTPError(403, '비밀번호가 일치하지 않거나 관리할 수 없는 기록입니다.');
      if (table === 'comments') {
        const parent = await env.DB.prepare(
          'SELECT p.id FROM posts p JOIN comments c ON c.post_id=p.id WHERE c.id=? AND p.hidden=0 AND p.deleted_at IS NULL',
        )
          .bind(id)
          .first();
        if (!parent) throw new HTTPError(404, '게시물이 없습니다.');
      }
      if (method === 'PATCH') {
        if (table === 'posts')
          await env.DB.prepare('UPDATE posts SET title=?,body=?,updated_at=? WHERE id=?')
            .bind(text(data.title, 1, 100, '제목'), text(data.body, 1, 5000, '내용'), now(), id)
            .run();
        else
          await env.DB.prepare('UPDATE comments SET body=?,updated_at=? WHERE id=?')
            .bind(text(data.body, 1, 1000, '내용'), now(), id)
            .run();
      } else {
        const statements = [
          env.DB.prepare(
            `UPDATE ${table} SET body='',${table === 'posts' ? "title='삭제된 게시물',department=''," : ''}author='삭제됨',password_hash='',salt='',deleted_at=? WHERE id=?`,
          ).bind(now(), id),
        ];
        if (table === 'posts')
          statements.push(
            env.DB.prepare(
              "UPDATE comments SET body='',author='삭제됨',password_hash='',salt='',deleted_at=? WHERE post_id=?",
            ).bind(now(), id),
          );
        await env.DB.batch(statements);
      }
      return json({ ok: true });
    }
  }
  throw new HTTPError(404, '경로가 없습니다.');
}
export default {
  async fetch(request, env) {
    let response;
    try {
      response = await handle(request, env);
    } catch (e) {
      response = json(
        {
          error:
            e instanceof HTTPError
              ? e.message
              : '일시적인 서버 오류입니다. 잠시 후 다시 시도해 주세요.',
        },
        e instanceof HTTPError ? e.status : 500,
      );
    }
    const h = new Headers(response.headers),
      url = new URL(request.url);
    h.set('Cache-Control', 'no-store');
    h.set('X-Content-Type-Options', 'nosniff');
    h.set('Referrer-Policy', 'no-referrer');
    h.set('X-Frame-Options', 'DENY');
    if (!url.pathname.startsWith('/admin') && request.headers.get('Origin') === env.PUBLIC_ORIGIN) {
      h.set('Access-Control-Allow-Origin', env.PUBLIC_ORIGIN);
      h.set('Vary', 'Origin');
      h.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
      h.set('Access-Control-Allow-Headers', 'Content-Type');
    }
    return new Response(response.body, { status: response.status, headers: h });
  },
  async scheduled(event, env) {
    const time = now(),
      cutoff = new Date(time - 3 * 86400000).toISOString().slice(0, 10);
    await env.DB.batch([
      env.DB.prepare('DELETE FROM access_logs WHERE created_at<?').bind(time - 30 * 86400000),
      env.DB.prepare('DELETE FROM rate_limits WHERE expires<?').bind(time),
      env.DB.prepare('DELETE FROM sessions WHERE expires<?').bind(time),
      env.DB.prepare('DELETE FROM blocks WHERE expires<?').bind(time),
      env.DB.prepare('DELETE FROM visitor_keys WHERE day<?').bind(cutoff),
      env.DB.prepare('DELETE FROM audit WHERE created_at<?').bind(time - 90 * 86400000),
    ]);
  },
};
