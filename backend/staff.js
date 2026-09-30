import { validStaffTag } from '../assets/staff-tags.js';
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
