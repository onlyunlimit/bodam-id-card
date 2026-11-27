import { HTTPError, text } from './security.js';
const json = (data, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
const fonts = new Set(['hand', 'serif', 'sans', 'mono']);
export function validateNote(data) {
  const character = text(data.character, 1, 64, '요원');
  if (!/^[a-z0-9_-]+$/i.test(character)) throw new HTTPError(400, '요원을 확인해 주세요.');
  const author = text(data.author || '익명', 1, 24, '이름');
  const message = text(data.message, 1, 100, '메시지');
  const font = fonts.has(data.font) ? data.font : 'hand';
  const color = /^#[0-9a-f]{6}$/i.test(data.color || '') ? data.color : '#eee6cf';
  const coordinate = value => Number.isFinite(Number(value)) ? Math.max(0, Math.min(1, Number(value))) : .5;
  return { character, author, message, font, color, x: coordinate(data.x), y: coordinate(data.y) };
}
export async function guestbook(request, env, helpers) {
  const url = new URL(request.url);
  if (url.pathname !== '/guestbook') return null;
  if (request.method === 'GET') {
    const character = validateNote({ character: url.searchParams.get('character'), message: '_' }).character;
    const { results } = await env.DB.prepare('SELECT id,author,message,font,color,x,y,created_at FROM member_guestbook WHERE character=? ORDER BY created_at DESC LIMIT 100').bind(character).all();
    return json({ notes: (results || []).reverse() });
  }
  if (request.method === 'POST') {
    const { hash } = await helpers.identity(request, env);
    await helpers.blocked(env, hash);
    const note = validateNote(await helpers.body(request));
    await helpers.rate(env, 'guestbook:' + hash, 6, 3600);
    await env.DB.prepare('INSERT INTO member_guestbook (id,character,author,message,font,color,x,y,created_at,ip_hash) VALUES (?,?,?,?,?,?,?,?,?,?)')
      .bind(crypto.randomUUID(), note.character, note.author, note.message, note.font, note.color, note.x, note.y, new Date().toISOString(), hash).run();
    return json({ ok: true }, 201);
  }
  throw new HTTPError(405, '지원하지 않는 요청입니다.');
}
