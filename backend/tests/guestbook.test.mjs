import test from 'node:test';
import assert from 'node:assert/strict';
import { guestbook, validateNote } from '../guestbook.js';

test('guestbook rejects invalid targets and oversized messages', () => {
  assert.throws(() => validateNote({ character: '../private', message: 'hello' }));
  assert.throws(() => validateNote({ character: 'vinjo', message: 'a'.repeat(101) }));
  const note = validateNote({ character: 'vinjo', message: 'hello', font: 'url(x)', color: 'red', x: -10, y: 20 });
  assert.equal(note.font, 'hand');
  assert.equal(note.color, '#eee6cf');
  assert.equal(note.x, 0);
  assert.equal(note.y, 1);
});

test('public guestbook reads are scoped to one member and exclude IP hashes', async () => {
  let statement;
  let target;
  const env = { DB: { prepare(sql) {
    statement = sql;
    return { bind(character) { target = character; return { all: async () => ({ results: [{ id: 'new' }, { id: 'old' }] }) }; } };
  } } };
  const response = await guestbook(new Request('https://example.com/guestbook?character=vinjo'), env, {});
  assert.equal(target, 'vinjo');
  assert.match(statement, /WHERE character=\?/);
  assert.doesNotMatch(statement, /ip_hash/);
  assert.deepEqual((await response.json()).notes.map(n => n.id), ['old', 'new']);
});

test('blocked visitors cannot insert a guestbook note', async () => {
  let wrote = false;
  const env = { DB: { prepare() { wrote = true; throw new Error('unexpected write'); } } };
  const helpers = {
    identity: async () => ({ hash: 'test-hash' }),
    blocked: async () => { throw new Error('blocked'); }
  };
  await assert.rejects(guestbook(new Request('https://example.com/guestbook', { method: 'POST' }), env, helpers), /blocked/);
  assert.equal(wrote, false);
});
