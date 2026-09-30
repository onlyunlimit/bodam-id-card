import test from 'node:test';
import assert from 'node:assert/strict';
import {
  activityFor,
  koreaTime,
  scheduleFor,
  generateIncident,
  isIncident,
  tally,
  teams,
} from '../assets/model.js';
import { characters } from '../assets/characters.js';

test('KST date and time cross UTC midnight independently of local timezone', () => {
  assert.deepEqual(koreaTime(new Date('2026-09-15T15:00:00Z')), {
    date: '2026.09.16',
    clock: '00:00:00',
    minutes: 0,
  });
  assert.equal(koreaTime(new Date('2026-09-15T00:00:00Z')).minutes, 540);
});
test('Beacon shifts respect exact start, lunch and end boundaries', () => {
  for (const [time, label, active] of [
    [539, '업무 외 시간', false],
    [540, '타겟 정보 브리핑', true],
    [719, '정보 조사 · 외근', true],
    [720, '점심 식사', false],
    [779, '점심 식사', false],
    [780, '추적 · 대상 접촉', true],
    [1050, '일일 보고서 작성', true],
    [1110, '업무 외 시간', false],
  ]) {
    const actual = activityFor('beacon', time);
    assert.equal(actual.label, label);
    assert.equal(actual.active, active);
  }
});
test('Origin, Shield and idol crews follow their own afternoon schedules', () => {
  assert.equal(activityFor('origin', 810).label, '감각 안정 검사');
  assert.equal(activityFor('shield', 810).label, '교육 · 사회 적응');
  assert.equal(activityFor('lucky', 810).label, '팬 소통 · 개인 스케줄');
  for (const id of ['origin', 'shield', 'lucky', 'obsidus']) {
    assert.equal(activityFor(id, 930).active, false);
    assert.equal(activityFor(id, 1080).label, '저녁 식사');
    assert.equal(activityFor(id, 1260).label, '취침');
    assert.equal(activityFor(id, 359).active, false);
  }
  assert.equal(activityFor('orpe', 1050).active, true);
  assert.equal(activityFor('orpe', 1110).active, false);
});
test('No source schedule overlaps or impossible active intervals', () => {
  for (const team of teams) {
    let previous = 0;
    for (const [start, end] of scheduleFor(team.id)) {
      assert.ok(start >= previous);
      assert.ok(end > start && end <= 1440);
      previous = end;
    }
  }
});
test('All five incident categories tally, resolve and reopen consistently', () => {
  const records = Array.from({ length: 5 }, (_, i) => generateIncident(i, () => 0.5, 123456789));
  assert.ok(records.every(isIncident));
  assert.equal(new Set(records.map((i) => i.type)).size, 5);
  assert.deepEqual(tally(records), { total: 5, open: 5, resolved: 0, gates: 1, monsters: 1 });
  records[0].resolvedAt = 123456799;
  assert.deepEqual(tally(records), { total: 5, open: 4, resolved: 1, gates: 0, monsters: 1 });
  records[0].resolvedAt = null;
  assert.equal(tally(records).gates, 1);
  assert.equal(isIncident({ ...records[0], detail: '<script>unexpected content</script>' }), false);
  assert.equal(isIncident({ ...records[0], x: 500 }), false);
});
test('Curated character records have unique identities and real source links', () => {
  assert.equal(characters.length, 23);
  assert.equal(new Set(characters.map((c) => c.id)).size, 23);
  for (const c of characters) {
    assert.ok(teams.some((t) => t.id === c.team));
    assert.ok(c.bio && c.ability && c.notes);
    if (c.id === 'yeomyeong') assert.equal(c.link, null);
    else assert.equal(new URL(c.link).host, 'ko.cvdk.io');
    assert.ok(c.gallery?.length);
    assert.equal(c.gallery[0].url, c.portrait);
    assert.ok(['cdn.caveduck.io', 'storage.googleapis.com'].includes(new URL(c.portrait).host));
    assert.ok(!JSON.stringify(c).includes('{{user}}'));
  }
});
test('Pinned reports accept real coordinates, preserve old records, and reject corrupt coordinates', () => {
  const original = generateIncident(0, () => 0.5, 123456789);
  assert.equal(isIncident(original), true);
  const record = {
    ...original,
    manual: true,
    location: '새 현장 / 동쪽 출입구',
    coordinates: [37.5712, 126.9811],
  };
  assert.equal(isIncident(record), true);
  for (const coordinates of [[91, 127], [37, 181], [NaN, 127], ['37', 127], [37], null])
    assert.equal(isIncident({ ...record, coordinates }), false);
  assert.equal(isIncident({ ...record, location: ' ' }), false);
});

test('Incident boundaries validate GeoJSON and retain worldwide coordinates and radius metadata',()=>{
 const record={...generateIncident(1),coordinates:[-33.8688,151.2093],radiusMeters:500,area:{type:'Polygon',coordinates:[[[151,-34],[152,-34],[152,-33],[151,-34]]]}};
 assert.equal(isIncident(record),true);assert.equal(isIncident({...record,radiusMeters:-1}),false);assert.equal(isIncident({...record,area:{type:'Polygon',coordinates:[[[0,0],[1,0],[1,1]]]}}),false);assert.equal(isIncident({...record,area:{type:'Polygon',coordinates:[[[181,0],[1,0],[1,1],[181,0]]]}}),false);
});

 test('Manual reports retain custom support teams and reject empty or oversized names', () => {
 const record = {...generateIncident(1),manual:true,detail:'직접 작성한 현장 상황',reporter:'신고자',zone:'현장',support:'합동 구조팀',personnel:2,requests:'',occurredAt:Date.now()};
 assert.equal(isIncident(record),true);
 for(const support of ['', '   ', '가'.repeat(81), null]) assert.equal(isIncident({...record,support}),false);
 for(const support of ['실드','오리진','비콘']) assert.equal(isIncident({...record,support}),true);
 });

test('Generated incidents use their generated location as the zone title', () => {
 for(let i=0;i<10;i++){const record=generateIncident(i);assert.equal(record.zone,record.location);assert.equal(isIncident(record),true);}
});
