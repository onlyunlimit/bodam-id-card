import { $, $$ } from './runtime.js';
import { registerCopy, tr } from './i18n.js';
const topics = [
  ['gate', '게이트', '01 / PHENOMENON'],
  ['awakened', '각성자', '02 / AWAKENING'],
  ['sentinel', '센티넬', '03 / SENTINEL'],
  ['guide', '가이드·가이딩', '04 / GUIDING'],
  ['matching', '매칭', '05 / COMPATIBILITY'],
  ['pair', '페어', '06 / PAIR'],
];
[
  ['개념 연결도', 'Concept map', '概念マップ', '概念关系图'],
  ['해설 펼치기', 'Read explanation', '解説を開く', '展开说明'],
  ['매칭률 조정', 'Adjust compatibility', 'マッチング率を調整', '调整匹配率'],
  ['안정적 파트너', 'Stable partners', '安定したパートナー', '稳定搭档'],
  ['희귀 고적합', 'Rare high compatibility', '希少な高適合', '罕见高适配'],
  ['낮은 적합도', 'Low compatibility', '低い適合度', '低适配度'],
  ['이론상 존재 불명', 'Unconfirmed in theory', '理論上、存在未確認', '理论上尚未确认'],
].forEach((r) => registerCopy(...r));
const icons = {
  gate: '<ellipse cx="80" cy="60" rx="28" ry="46"/><ellipse cx="80" cy="60" rx="40" ry="52"/><path d="M25 60H55M105 60H135M80 5V23M80 97V115"/>',
  world:
    '<path d="M15 85L48 55L78 75L115 25L145 40"/><circle cx="48" cy="55" r="8"/><circle cx="115" cy="25" r="8"/><path d="M15 100H145"/>',
  sgia: '<path d="M45 110V15H115V110M30 110H130M58 30H72M88 30H102M58 50H72M88 50H102M58 70H72M88 70H102M72 110V90H88V110"/>',
  sentinel: '<path d="M12 62H40L52 20L66 102L80 42L94 76L108 58H148"/>',
  guide:
    '<circle cx="80" cy="60" r="38"/><circle cx="80" cy="60" r="22"/><path d="M69 60H91M80 49V71M20 60H35M125 60H140"/>',
  matching:
    '<circle cx="59" cy="60" r="31"/><circle cx="101" cy="60" r="31"/><path d="M73 60H87"/>',
  pair: '<rect x="26" y="30" width="38" height="60" rx="15"/><rect x="96" y="30" width="38" height="60" rx="15"/><path d="M64 60H96M45 15V30M115 90V105"/>',
  imprint:
    '<path d="M80 20L120 37V70L80 105L40 70V37Z"/><circle cx="80" cy="57" r="13"/><path d="M80 70V85"/>',
  third: '<path d="M80 15L135 100H25Z"/><path d="M80 42V72M80 82V87M49 60L65 70M111 60L95 70"/>',
  teams:
    '<rect x="60" y="12" width="40" height="26"/><path d="M80 38V65M30 65H130M30 65V80M80 65V80M130 65V80"/><rect x="15" y="80" width="30" height="25"/><rect x="65" y="80" width="30" height="25"/><rect x="115" y="80" width="30" height="25"/>',
};
export function enhanceManual(entries) {
  const layout = $('.manual-layout');
  layout.insertAdjacentHTML(
    'beforebegin',
    `<section class="lore-explorer"><div class="lore-visual" aria-hidden="true"><div class="lore-orbit"></div><div class="lore-orbit inner"></div><span>SGIA<br><small>FIELD COMPENDIUM</small></span></div><div class="lore-navigation"><span class="eyebrow">INTERACTIVE REFERENCE / 01</span><h2>개념 연결도</h2><div class="lore-nodes">${topics.map(([id, label, num]) => `<a href="#${id}" data-topic="${id}"><small>${num}</small><b>${label}</b><span>↗</span></a>`).join('')}</div><p id="lore-preview">${entries[0][3]}</p></div></section>`,
  );
  $$('[data-topic]').forEach((a) =>
    a.addEventListener('click', () => {
      const e = entries.find((x) => x[0] === a.dataset.topic);
      $('#lore-preview').textContent = tr(e[3]);
      $$('[data-topic]').forEach((n) => n.classList.toggle('selected', n === a));
    }),
  );
  entries.forEach(([id, title, en, summary, body], i) => {
    const el = document.getElementById(id);
    if (!el) return;
    const content = el.querySelector('div'),
      bodyP = content.querySelector('.guide-lead').nextElementSibling;
    const detail = document.createElement('details');
    detail.className = 'lore-explanation';
    detail.innerHTML = '<summary>해설 펼치기</summary>';
    bodyP.replaceWith(detail);
    detail.append(bodyP);
    el.insertAdjacentHTML(
      'afterbegin',
      `<div class="lore-diagram" aria-hidden="true"><svg viewBox="0 0 160 120" fill="none" stroke="currentColor" stroke-width="1.3">${icons[id] || `<circle cx="80" cy="60" r="39"/><path d="M35 60H125M80 15V105"/><circle cx="80" cy="60" r="${15 + i}"/>`}</svg><small>${en}</small></div>`,
    );
  });
  const matching = $('#matching>div:last-child');
  matching.insertAdjacentHTML(
    'beforeend',
    '<div class="compatibility-lab"><label for="compatibility-range">매칭률 조정 <output id="compatibility-value">70%</output></label><input id="compatibility-range" type="range" min="0" max="100" value="70"><div class="compatibility-waves" aria-hidden="true"><i></i><i></i></div><span id="compatibility-status">안정적 파트너</span></div>',
  );
  $('#compatibility-range').oninput = (e) => {
    const v = +e.target.value;
    $('#compatibility-value').textContent = v + '%';
    $('#compatibility-status').textContent = tr(
      v === 100
        ? '이론상 존재 불명'
        : v >= 90
          ? '희귀 고적합'
          : v >= 70
            ? '안정적 파트너'
            : '낮은 적합도',
    );
    $('.compatibility-lab').style.setProperty('--match', v / 100);
  };
}
