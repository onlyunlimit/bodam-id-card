const enc = new TextEncoder();
export const hex = (b) =>
  Array.from(new Uint8Array(b), (n) => n.toString(16).padStart(2, '0')).join('');
export const random = () => hex(crypto.getRandomValues(new Uint8Array(32)));
export async function digest(value) {
  return hex(await crypto.subtle.digest('SHA-256', enc.encode(value)));
}
export async function hmac(secret, value) {
  const k = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return hex(await crypto.subtle.sign('HMAC', k, enc.encode(value)));
}
export function equal(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
export async function passwordHash(pin, salt, pepper) {
  const mixed = await hmac(pepper, pin);
  const key = await crypto.subtle.importKey('raw', enc.encode(mixed), 'PBKDF2', false, [
    'deriveBits',
  ]);
  return hex(
    await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' },
      key,
      256,
    ),
  );
}
export async function cipherIP(ip, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    await crypto.subtle.digest('SHA-256', enc.encode(secret)),
    'AES-GCM',
    false,
    ['encrypt'],
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(ip));
  return hex(iv) + ':' + hex(cipher);
}
export async function decipherIP(value, secret) {
  if (!value) return null;
  const [iv, c] = value
    .split(':')
    .map((s) => new Uint8Array(s.match(/../g).map((h) => parseInt(h, 16))));
  const key = await crypto.subtle.importKey(
    'raw',
    await crypto.subtle.digest('SHA-256', enc.encode(secret)),
    'AES-GCM',
    false,
    ['decrypt'],
  );
  return new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, c));
}
export class HTTPError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
export function text(value, min, max, label) {
  if (
    typeof value !== 'string' ||
    value.trim().length < min ||
    value.length > max ||
    /[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(value)
  )
    throw new HTTPError(400, label + ' 입력을 확인해 주세요.');
  return value.trim();
}
export function pin(value) {
  if (typeof value !== 'string' || !/^\d{4}$/.test(value))
    throw new HTTPError(400, '비밀번호는 숫자 4자리입니다.');
  return value;
}
export function board(value) {
  if (!['lucky', 'obsidus', 'staff'].includes(value))
    throw new HTTPError(400, '잘못된 게시판입니다.');
  return value;
}
