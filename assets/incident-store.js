import { serviceConfig } from './service-config.js';
import { isIncident, generateIncident } from './model.js';
import { routeSignal, every, listen } from './lifecycle.js';
const stored = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const legacyKeys = ['sgia.incidents', 'onlyunlimit.sgia.incidents.v1', 'sgia.incidents.restored'];
let legacy = [...new Map(legacyKeys.flatMap(key => {
  const rows = stored(key, []); return Array.isArray(rows) ? rows.filter(isIncident).map(r => [r.id, r]) : [];
})).values()];
// Old automatic examples were often never saved. Restore that experience once,
// without claiming these newly generated examples are recovered user reports.
if (!legacy.length && legacyKeys.every(key => stored(key, null) === null)) {
  let seed = 437;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  legacy = Array.from({length:15}, (_, i) => generateIncident(i, random, Date.parse('2026-11-21T00:00:00+09:00') - (15-i)*180000));
  try { localStorage.setItem('sgia.incidents.restored', JSON.stringify(legacy)); } catch {}
}
let shared = [], hasSynced = false;
let publishedIds = stored('sgia.incidents.published', {});
export let incidents = [];
export function rebuildIncidents() {
  const published = publishedIds, states = stored('sgia.incidents.local-status', {});
  const sharedIds = new Set(shared.map(r => r.id));
  const local = legacy.filter(r => !sharedIds.has(r.id) && !sharedIds.has(published[r.id]) && !(hasSynced && published[r.id])).map(r => ({
    ...r, ...(Object.hasOwn(states, r.id) ? {resolvedAt:states[r.id]} : {}), localOnly:true,
  }));
  incidents = [...local, ...shared].sort((a,b) => a.created-b.created || a.id.localeCompare(b.id));
  return incidents;
}
export async function importPreviousIncidents() {
  let published = publishedIds;
  const states = stored('sgia.incidents.local-status', {});
  const pending = legacy.filter(r => !published[r.id]);
  for (let offset=0; offset<pending.length; offset+=25) {
    const records = pending.slice(offset,offset+25).map(r => ({...r,...(Object.hasOwn(states,r.id)?{resolvedAt:states[r.id]}:{})}));
    const result = await incidentRequest('/incidents/import','POST',{records});
    if (!Array.isArray(result.accepted) || result.accepted.length !== records.length || result.accepted.some((r,i)=>r.oldId !== records[i].id || typeof r.id !== 'string')) throw Error('이전 기록 이전 응답을 확인해 주세요.');
    published = {...publishedIds,...Object.fromEntries(result.accepted.map(r=>[r.oldId,r.id]))};
    publishedIds = published;
    try { localStorage.setItem('sgia.incidents.published',JSON.stringify(published)); } catch {}
  }
}
rebuildIncidents();
let revision = 0;
export async function incidentRequest(path, method = 'GET', data) {
  if (!serviceConfig.api) throw Error('공유 서버 연결을 준비 중입니다.');
  const response = await fetch(serviceConfig.api + path, {
    method, credentials: 'omit', cache: 'no-store',
    headers: data ? { 'Content-Type': 'application/json' } : {},
    body: data ? JSON.stringify(data) : undefined,
    signal: AbortSignal.any([routeSignal(), AbortSignal.timeout(15000)]),
  });
  const result = await response.json();
  if (!response.ok) throw Error(result.error || '공유 서버 연결을 확인해 주세요.');
  return result;
}
export function acceptIncident(record) {
  revision++;
  shared = [...shared.filter(r => r.id !== record.id), record];
  rebuildIncidents();
}
export async function syncIncidents() {
  const ticket = ++revision, records = [];
  let cursor = null;
  do {
    const result = await incidentRequest('/incidents' + (cursor ? '?after=' + cursor : ''));
    if (!Array.isArray(result.incidents) || !result.incidents.every(isIncident)) throw Error('공유 기록을 불러오지 못했습니다.');
    records.push(...result.incidents);
    if (result.next !== null && (!Number.isSafeInteger(result.next) || result.next <= (cursor || 0))) throw Error('공유 기록 조회를 다시 시도해 주세요.');
    cursor = result.next;
  } while (cursor !== null);
  if (ticket === revision) { shared = records; hasSynced = true; rebuildIncidents(); }
  return incidents;
}
export function watchIncidents(update, status = () => {}) {
  let pending = null;
  const signal = routeSignal();
  const refresh = () => {
    if (signal.aborted) return Promise.resolve();
    if (pending) return pending;
    status('공유 기록 수신 중…');
    pending = (async () => {
      try {
        let migrationError = false;
        try { await importPreviousIncidents(); } catch { migrationError = true; }
        await syncIncidents();
        if (!signal.aborted) {
          update();
          const time = new Date().toLocaleTimeString('ko-KR', {hour12:false});
          status(migrationError ? '이전 기록 자동 공유 재시도 중 · 원본은 이 기기에 보존됩니다.' : '최신 기록 수신 완료 · ' + time + ' · 공유 기록 ' + incidents.length + '건');
        }
      } catch (e) {
        if (!signal.aborted) status('공유 서버 연결 실패 · 수신 갱신으로 다시 시도해 주세요.');
      } finally { pending = null; }
    })();
    return pending;
  };
  every(() => { if (!document.hidden) refresh(); }, 20000);
  listen(document, 'visibilitychange', () => { if (!document.hidden) refresh(); });
  refresh();
  return refresh;
}
