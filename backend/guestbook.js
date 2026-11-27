import { HTTPError, text } from './security.js';
const json = (data, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
const fonts = new Set(['hand', 'memo', 'serif', 'sans', 'mono']);
const ID = /^[a-f0-9-]{36}$/;
export function validateNote(data) {
  const character = text(data.character, 1, 64, '요원');
  if (!/^[a-z0-9_-]+$/i.test(character)) throw new HTTPError(400, '요원을 확인해 주세요.');
  const author = text(data.author || '익명', 1, 24, '이름');
  const message = text(data.message, 1, 100, '메시지');
  const font = fonts.has(data.font) ? data.font : 'hand';
  const color = /^#[0-9a-f]{6}$/i.test(data.color || '') ? data.color : '#eee6cf';
  const coordinate = value => Number.isFinite(Number(value)) ? Math.max(0, Math.min(1, Number(value))) : .5;
  const size = Number.isFinite(Number(data.size)) ? Math.round(Math.max(10, Math.min(28, Number(data.size)))) : 14;
  return { character, author, message, font, color, x: coordinate(data.x), y: coordinate(data.y), size };
}
/** Public reads and writes. `helpers.log(id, ip, hash)` keeps the writer's IP for owner moderation. */
export async function guestbook(request, env, helpers) {
  const url = new URL(request.url);
  if (url.pathname !== '/guestbook') return null;
  if (request.method === 'GET') {
    const character = validateNote({ character: url.searchParams.get('character'), message: '_' }).character;
    const { results } = await env.DB.prepare('SELECT id,author,message,font,color,x,y,size,created_at FROM member_guestbook WHERE character=? AND hidden=0 ORDER BY created_at DESC LIMIT 100').bind(character).all();
    return json({ notes: (results || []).reverse() });
  }
  if (request.method === 'POST') {
    const { ip, hash } = await helpers.identity(request, env);
    await helpers.blocked(env, hash);
    const note = validateNote(await helpers.body(request));
    await helpers.rate(env, 'guestbook:' + hash, 6, 3600);
    const id = crypto.randomUUID();
    const statements = [env.DB.prepare('INSERT INTO member_guestbook (id,character,author,message,font,color,x,y,size,created_at,ip_hash) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
      .bind(id, note.character, note.author, note.message, note.font, note.color, note.x, note.y, note.size, new Date().toISOString(), hash)];
    if (helpers.log) statements.push(await helpers.log(env, id, 'guestbook', ip, hash));
    await env.DB.batch(statements);
    return json({ ok: true, id }, 201);
  }
  throw new HTTPError(405, '지원하지 않는 요청입니다.');
}
/** Owner console: list, read, edit, hide/restore and delete. IP view and blocking use /admin/ip and /admin/moderate. */
export async function guestbookAdmin(request, env, { body, audit }) {
  const url = new URL(request.url), base = '/admin/guestbook';
  if (url.pathname !== base && !url.pathname.startsWith(base + '/')) return null;
  const id = url.pathname.slice(base.length + 1), method = request.method;
  if (method === 'GET' && !id) {
    const offset = Math.max(0, Math.min(100000, Number.parseInt(url.searchParams.get('offset'), 10) || 0));
    const filter = url.searchParams.get('filter');
    const target = url.searchParams.get('note');
    let rows;
    if (target && ID.test(target)) rows = await env.DB.prepare('SELECT id,character,author,message,font,color,size,hidden,read_at,created_at,updated_at FROM member_guestbook WHERE id=?').bind(target).all();
    else rows = await env.DB.prepare(`SELECT id,character,author,message,font,color,size,hidden,read_at,created_at,updated_at FROM member_guestbook ${filter === 'new' ? 'WHERE read_at IS NULL' : ''} ORDER BY created_at DESC,id LIMIT 51 OFFSET ?`).bind(offset).all();
    return json({ notes: rows.results.slice(0, 50), more: rows.results.length > 50 });
  }
  if (!ID.test(id)) throw new HTTPError(400, '방명록을 확인해 주세요.');
  if (method === 'PATCH') {
    const data = await body(request);
    const current = await env.DB.prepare('SELECT id,author,message FROM member_guestbook WHERE id=?').bind(id).first();
    if (!current) throw new HTTPError(404, '방명록이 없습니다.');
    const sets = [], values = [];
    if (data.read === true) { sets.push('read_at=COALESCE(read_at,?)'); values.push(Date.now()); }
    if (typeof data.hidden === 'boolean') { sets.push('hidden=?'); values.push(data.hidden ? 1 : 0); }
    if (data.message !== undefined || data.author !== undefined) {
      sets.push('message=?', 'author=?', 'updated_at=?');
      values.push(text(data.message ?? current.message, 1, 100, '메시지'), text(data.author ?? current.author, 1, 24, '이름'), new Date().toISOString());
    }
    if (!sets.length) throw new HTTPError(400, '변경할 내용이 없습니다.');
    await env.DB.batch([
      env.DB.prepare(`UPDATE member_guestbook SET ${sets.join(',')} WHERE id=?`).bind(...values, id),
      ...(data.read === true && sets.length === 1 ? [] : [audit(data.hidden === true ? 'GUESTBOOK_HIDE' : data.hidden === false ? 'GUESTBOOK_RESTORE' : 'GUESTBOOK_EDIT', id)]),
    ]);
    return json({ ok: true });
  }
  if (method === 'DELETE') {
    await env.DB.batch([env.DB.prepare('DELETE FROM member_guestbook WHERE id=?').bind(id), audit('GUESTBOOK_DELETE', id)]);
    return json({ ok: true });
  }
  throw new HTTPError(405, '지원하지 않는 요청입니다.');
}
