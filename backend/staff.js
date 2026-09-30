import { staffTags } from '../assets/staff-tags.js';
import { HTTPError } from './security.js';
export function staffMeta(board, channel = 'free', tags = []) {
  if (!['free', 'soliloquy'].includes(channel)) throw new HTTPError(400, '게시판을 선택해 주세요.');
  if (
    !Array.isArray(tags) ||
    tags.length > 5 ||
    tags.some((t) => !staffTags.some((x) => x.id === t))
  )
    throw new HTTPError(400, '캐릭터·팀 태그는 목록에서 5개까지 선택해 주세요.');
  if (board !== 'staff' && (channel !== 'free' || tags.length))
    throw new HTTPError(400, '사내 게시판 태그만 지정할 수 있습니다.');
  if (channel === 'free' && tags.length)
    throw new HTTPError(400, '태그는 혼잣말 게시판에서 선택해 주세요.');
  return { channel, tags: JSON.stringify([...new Set(tags)]) };
}
