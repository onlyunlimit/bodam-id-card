import { serviceConfig } from './service-config.js';
import { isIncident } from './model.js';
import { routeSignal, every, listen } from './lifecycle.js';
export let incidents = [];
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
  incidents = [...incidents.filter(r => r.id !== record.id), record].sort((a,b) => a.created-b.created || a.id.localeCompare(b.id));
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
  if (ticket === revision) incidents = records.sort((a,b) => a.created-b.created || a.id.localeCompare(b.id));
  return incidents;
}
export function watchIncidents(update, status = () => {}) {
  let busy = false;
  const signal = routeSignal();
  const refresh = async () => {
    if (busy || signal.aborted) return;
    busy = true;
    try {
      await syncIncidents();
      if (!signal.aborted) { update(); status('공유 기록 최신 상태 · 20초마다 갱신'); }
    } catch (e) {
      if (!signal.aborted) status('공유 서버 연결 실패 · 수신 갱신으로 다시 시도해 주세요.');
    } finally { busy = false; }
  };
  every(() => { if (!document.hidden) refresh(); }, 20000);
  listen(document, 'visibilitychange', () => { if (!document.hidden) refresh(); });
  refresh();
  return refresh;
}
