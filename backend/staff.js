import { validStaffTag, staffTags, staffTagInfo } from '../assets/staff-tags.js';
import { HTTPError } from './security.js';
export function staffMeta(board, channel = 'free', tags = []) {
  if (!['free', 'soliloquy'].includes(channel)) throw new HTTPError(400, '게시판을 선택해 주세요.');
  if (
    !Array.isArray(tags) ||
    tags.length > 5 ||
    tags.some((t) => !validStaffTag(t))
  )
    throw new HTTPError(400, '태그는 5개까지, 직접 입력은 1~40자로 지정해 주세요.');
  if (board !== 'staff' && (channel !== 'free' || tags.length))
    throw new HTTPError(400, '사내 게시판 태그만 지정할 수 있습니다.');
  return { channel, tags: JSON.stringify([...new Set(tags)]) };
}

// Suggestions are read from shared, visible posts, so tags survive browser/device changes.
export async function staffTagSuggestions(env, query = '') {
  const q = query.trim().slice(0, 40).toLocaleLowerCase();
  const { results } = await env.DB.prepare(`SELECT DISTINCT j.value AS id
    FROM posts p, json_each(p.tags) j
    WHERE p.board='staff' AND p.hidden=0 AND p.deleted_at IS NULL
    AND instr(lower(j.value), ?) > 0 ORDER BY j.value LIMIT 100`).bind(q).all();
  const seen = new Set();
  return [...results, ...staffTags].filter(t => validStaffTag(t.id)).map(t => ({ id: t.id, label: staffTagInfo(t.id).label }))
    .filter(t => { const key = t.label.toLocaleLowerCase(); if (!key.includes(q) || seen.has(key)) return false; seen.add(key); return true; }).slice(0, 20);
}
