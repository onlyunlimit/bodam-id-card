import { installFacilityTranslations } from './facility-i18n.js';
import { installVoiceTranslations } from './voice-i18n.js';
import { installInterfaceTranslations } from './interface-i18n.js';
import { installProfileTranslations } from './profile-i18n.js';
import { installContentTranslations } from './content-i18n.js';
import { $, $$, initShell, applyViewer, logActivity } from './runtime.js';
import { renderOverview, renderRecords, renderOrpe } from './monitor.js';
import { renderDirectory, renderUnit, status, messenger } from './units.js';
import { renderManual, renderHeadquarters } from './guide.js';
import { renderCommunity, initVisitors } from './community.js';
import { disposeRoute } from './lifecycle.js';
import { initI18n, translateDOM, tr } from './i18n.js';
const titles = {
  overview: '통합 관제',
  departments: '조직·부서',
  entertainment: '헌터 엔터테인먼트',
  records: '사건 기록실',
  manual: '세계관 안내서',
  community: '커뮤니티',
  unit: '부서 정보',
};
const routes = {
  portal: 'overview',
  departments: 'departments',
  entertainment: 'entertainment',
  records: 'records',
  manual: 'manual',
  community: 'community',
  origin: 'unit',
  beacon: 'unit',
  shield: 'unit',
  lucky: 'unit',
  obsidus: 'unit',
  headquarters: 'overview',
  orpe: 'records',
};
installContentTranslations();
installProfileTranslations();
installInterfaceTranslations();
installVoiceTranslations();
installFacilityTranslations();
initShell('SGIA', 'overview');
initI18n();
function route(url = location.href, push = false) {
  const u = new URL(url, location.href),
    unit = u.pathname.split('/').pop().replace('.html', ''),
    page = routes[unit];
  if (!page) return false;
  disposeRoute();
  $$('dialog[open]').forEach((d) => d.close());
  if (push) history.pushState({}, '', u);
  document.body.dataset.page = page;
  document.body.dataset.unit = unit;
  document.title = tr(titles[page]) + ' | SGIA';
  $('#main').replaceChildren();
  const nav =
    page === 'unit'
      ? ['lucky', 'obsidus'].includes(unit)
        ? 'entertainment'
        : 'departments'
      : page;
  $$('.site-nav a').forEach((a) =>
    routes[a.pathname.split('/').pop().replace('.html', '')] === nav
      ? a.setAttribute('aria-current', 'page')
      : a.removeAttribute('aria-current'),
  );
  const render = {
    overview: renderOverview,
    departments: () => renderDirectory(),
    entertainment: () => renderDirectory(true),
    records: renderRecords,
    manual: renderManual,
    community: renderCommunity,
    unit: () => renderUnit(unit),
  };
  render[page]();
  if (page === 'overview' || page === 'records') {
    const section = document.createElement('section');
    section.id = page === 'overview' ? 'headquarters' : 'threats';
    section.className = 'merged-section';
    $('#main').append(section);
    if (page === 'overview') renderHeadquarters(section);
    else renderOrpe(section);
    section.querySelectorAll('h1').forEach((h) => {
      const e = document.createElement('h2');
      e.innerHTML = h.innerHTML;
      h.replaceWith(e);
    });
    $('#main').insertAdjacentHTML(
      'afterbegin',
      `<nav class="section-jumps"><a href="#main">${page === 'overview' ? '통합 관제' : '사건 기록실'}</a><a href="#${section.id}">${page === 'overview' ? '각성관 층별 안내' : '위협 정보 · ORPÉ'}</a></nav>`,
    );
  }
  if (!$('#floating-comms'))
    document.body.insertAdjacentHTML(
      'beforeend',
      '<aside id="floating-comms" class="floating-comms"></aside>',
    );
  const channel = ['origin', 'beacon', 'shield', 'lucky', 'obsidus'].includes(unit)
    ? unit
    : 'beacon';
  $('#floating-comms').innerHTML =
    '<div class="channel-switch"><label>업무 채널 <select id="comms-channel"><option value="origin">ORIGIN</option><option value="beacon">BEACON</option><option value="shield">SHIELD</option><option value="lucky">LUCKY TRICK</option><option value="obsidus">OBSIDUS</option></select></label><button id="comms-hide" aria-label="업무 채널 최소화">−</button></div><div id="floating-messenger"></div>';
  $('#comms-channel').value = channel;
  messenger(channel, $('#floating-messenger'));
  $('#comms-channel').onchange = (e) => messenger(e.target.value, $('#floating-messenger'));
  $('#comms-hide').onclick = () => {
    const collapsed = $('#floating-comms').classList.toggle('minimized');
    $('#comms-hide').textContent = collapsed ? '+' : '−';
  };
  applyViewer();
  translateDOM(document.body);
  logActivity(titles[page], 'NAVIGATE');
  const hash =
    u.hash || (unit === 'headquarters' ? '#headquarters' : unit === 'orpe' ? '#threats' : '');
  if (hash) requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView());
  else window.scrollTo(0, 0);
  document.dispatchEvent(new Event('sgia:route'));
  return true;
}
document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
    return;
  const a = e.target.closest('a[href]');
  if (!a || a.target || a.hasAttribute('download')) return;
  const u = new URL(a.href);
  if (u.origin !== location.origin || a.getAttribute('href').startsWith('#')) return;
  if (routes[u.pathname.split('/').pop().replace('.html', '')]) {
    e.preventDefault();
    route(u.href, true);
  }
});
window.addEventListener('popstate', () => route());
document.addEventListener('sgia:language', () => {
  translateDOM(document.body);
  route();
});
route();
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
