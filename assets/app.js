import { $, $$, state, initShell, applyViewer } from './runtime.js';
import { renderOverview, renderRecords, renderOrpe } from './monitor.js';
import { renderDirectory, renderUnit, status } from './units.js';
import { renderManual, renderHeadquarters } from './guide.js';
import { renderCommunity, initVisitors } from './community.js';
const page = document.body.dataset.page,
  unit = document.body.dataset.unit;
const titles = {
  overview: '통합 관제',
  departments: '조직·부서',
  headquarters: '각성관 층별 안내',
  entertainment: '헌터 엔터테인먼트',
  records: '사건 기록실',
  orpe: '외부 위협 정보',
  manual: '세계관 안내서',
  community: '커뮤니티',
  unit: '부서 정보',
};
initShell(
  titles[page],
  page === 'unit' ? (['lucky', 'obsidus'].includes(unit) ? 'entertainment' : 'departments') : page,
);
const render = {
  overview: renderOverview,
  departments: () => renderDirectory(),
  entertainment: () => renderDirectory(true),
  unit: () => renderUnit(unit),
  headquarters: renderHeadquarters,
  manual: renderManual,
  records: renderRecords,
  orpe: renderOrpe,
  community: renderCommunity,
};
render[page]?.();
applyViewer();
initVisitors();
let minute = -1;
document.addEventListener('sgia:clock', (e) => {
  if (e.detail.minutes === minute) return;
  minute = e.detail.minutes;
  $$('[data-status-unit]').forEach((el) => {
    if (el.dataset.status === 'emergency') return;
    const a = status(el.dataset.statusUnit);
    el.dataset.status = a.type;
    el.innerHTML = '<i></i>' + a.label;
  });
  const count = $('#active-count');
  if (count)
    count.innerHTML =
      ['origin', 'beacon', 'shield'].filter((id) => status(id).active).length +
      '<small> / 3</small>';
});
