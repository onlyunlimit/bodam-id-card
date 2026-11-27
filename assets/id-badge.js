// SGIA liquid-glass personnel badge, shared by department cards and personnel files.
// Layout follows the approved badge reference at a fixed 390 × 640 design size and is
// scaled to its container, so every member keeps the same proportions on any screen.
import { esc } from './runtime.js';
import { teams } from './model.js';
import { memberFacts } from './member-archive-data.js';
import { personName, language, registerCopy } from './i18n.js';

[
  ['침식자', 'Corrupted', '侵食者', '侵蚀者'],
  ['귀환체', 'Returned', '帰還体', '归来体'],
  ['통과자', 'Survivor', '通過者', '通过者'],
  ['비각성', 'Non-awakened', '非覚醒', '未觉醒'],
].forEach((row) => registerCopy(...row));

// Team colour is the in-world team colour, not the page palette (Blackjack's page is olive, its colour is black).
export const badgeTeams = {
  shield: { dept: '전술대응팀', division: 'TACTICAL RESPONSE', color: 'WHITE', location: '각성관' },
  origin: { dept: '특수목적팀', division: 'SPECIAL PURPOSE', color: 'VIOLET', location: 'B4 오리진 생활 구역' },
  beacon: { dept: '추적관리팀', division: 'TRACKING & CUSTODY', color: 'GREY', location: '2F 추적관리팀 사무실' },
  blackjack: { dept: '대테러부대', division: 'COUNTER-TERROR', color: 'BLACK', location: 'B3 전술 시뮬레이션 · 5F 사무실' },
};
// Origin members are not graded on the sentinel scale; they carry an existence class.
const existence = {
  침식자: { mark: 'CR', en: 'Corrupted' },
  귀환체: { mark: 'RT', en: 'Returned' },
  통과자: { mark: 'SV', en: 'Survivor' },
};
const icons = {
  shield: '<path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" stroke-linejoin="round"/>',
  origin: '<circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16" stroke-linecap="round"/>',
  beacon: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke-linecap="round"/>',
  blackjack: '<path d="M12 3c3 4 7 6 7 10a4 4 0 0 1-6.5 3.1L13 21h-2l.5-4.9A4 4 0 0 1 5 13c0-4 4-6 7-10z" stroke-linejoin="round"/>',
};
const ladder = ['SSS', 'SS', 'S', 'A', 'B', 'C'];
const graded = (c) => /^[A-Z]+\+?$/.test(c.rank);

export function memberType(c) {
  if (existence[c.rank]) return existence[c.rank].en.toUpperCase();
  if (/비각성/.test(c.rank)) return 'NON-AWAKENED';
  if (/미공개/.test(c.rank)) return 'CLASSIFIED';
  return /가이드/.test(c.role) ? 'GUIDE' : 'SENTINEL';
}
/** The large letter on the badge: the member's grade, never the team initial. */
export function gradeMark(c) {
  if (existence[c.rank]) return existence[c.rank].mark;
  if (graded(c)) return c.rank;
  if (/비각성/.test(c.rank)) return 'N/A';
  return '?';
}
export function gradeLabel(c) {
  if (existence[c.rank]) return `${c.rank} (${existence[c.rank].en})`;
  if (graded(c)) return `${c.rank}급 ${memberType(c) === 'GUIDE' ? 'Guide' : 'Sentinel'}`;
  return c.rank;
}
export function heightOf(c) {
  const found = (c.appearance || '').match(/(\d{3})\s?cm/)?.[1];
  return memberFacts[c.id]?.height || (found ? found + 'cm' : '');
}
export function locationOf(c) {
  return memberFacts[c.id]?.location || badgeTeams[c.team]?.location || '';
}
function cell(label, value, wide = false) {
  return `<span class="idc-cell ${wide ? 'idc-cell-row flex items-center justify-between px-3 py-1.5' : 'block px-3 py-2'} rounded-xl min-w-0"><span class="block font-mono text-[8.5px] font-semibold tracking-[0.14em] idc-muted uppercase whitespace-nowrap">${label}</span><span class="block ${wide ? 'text-[11.5px] text-right ml-2 truncate' : 'text-[12.5px] mt-0.5 tracking-tight truncate'} font-bold idc-ink">${value}</span></span>`;
}

/** Front and back faces. `open` shows staff-only fields. Returns two strings. */
export function badgeFaces(c, { open = true, portrait = c.portrait, status = 'ACTIVE' } = {}) {
  const t = badgeTeams[c.team];
  const team = teams.find((x) => x.id === c.team);
  const type = memberType(c);
  const mark = open ? gradeMark(c) : '—';
  const height = heightOf(c);
  const code = esc(c.code);
  const local = esc(personName(c));
  const nameSize = c.code.length > 8 ? 'text-[27px]' : c.code.length > 6 ? 'text-[31px]' : 'text-[36px]';
  const icon = `<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">${icons[c.team]}</svg>`;
  const pic = `background-image:url(&quot;${esc(portrait)}&quot;)`;
  const front = `<span class="idc-stage tw"><span class="idc idc-front flex flex-col justify-between p-6">
    <span class="idc-noise" aria-hidden="true"></span><span class="idc-strip" aria-hidden="true"></span><span class="idc-glare" aria-hidden="true"></span>
    <span aria-hidden="true" class="idc-mark pointer-events-none absolute -right-4 -top-6 font-display font-bold ${mark.length > 2 ? 'text-[150px]' : mark.length > 1 ? 'text-[190px]' : 'text-[230px]'} leading-none tracking-tighter idc-ghost select-none z-0">${esc(mark)}</span>
    <span class="relative z-10 flex flex-col items-center">
      <span class="idc-slot mb-3.5"></span>
      <span class="w-full flex items-start justify-between border-b idc-rule pb-2.5 gap-3">
        <span class="block text-left min-w-0">
          <span class="flex items-center gap-1.5"><span class="idc-chip px-1.5 py-0.5 rounded font-mono text-[9px] font-bold tracking-[0.16em]">SGIA</span>${language() !== 'en' ? `<strong class="card-code text-[11px] font-semibold idc-muted">${local}</strong>` : ''}</span>
          <span class="fixed-code block font-display font-bold ${nameSize} leading-[0.95] tracking-[-0.01em] idc-ink mt-1 truncate" data-no-translate>${code}</span>
        </span>
        <span class="credential-grade text-right flex flex-col items-end shrink-0">
          <b class="font-display font-bold ${mark.length > 2 ? 'text-[19px]' : 'text-[24px]'} leading-none idc-ink tracking-tight">${esc(mark)}</b>
          <small class="font-mono text-[9px] font-semibold tracking-[0.14em] idc-muted mt-0.5">${open ? type : 'GRADE'}</small>
          <span class="idc-status mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full font-mono text-[8.5px] font-semibold idc-ink"><i class="idc-dot w-1.5 h-1.5 rounded-full"></i> <span data-badge-status>${status}</span></span>
        </span>
      </span>
    </span>
    <span class="relative z-10 flex gap-2.5 my-3 flex-1 min-h-0">
      <span class="idc-portrait flex-1 h-full relative block rounded-2xl overflow-hidden">
        <span class="idc-photo ${open ? '' : 'idc-photo-locked'} block w-full h-full" data-badge-photo role="img" aria-label="${open ? local + ' 공식 증명사진' : '신원 비공개'}" style="${pic}"></span>
        <span class="pointer-events-none absolute top-3 left-3 w-3 h-3 border-t border-l border-white/75"></span>
        <span class="pointer-events-none absolute top-3 right-3 w-3 h-3 border-t border-r border-white/75"></span>
      </span>
      <span class="w-8 shrink-0 flex flex-col items-center justify-between py-1">
        <span class="flex items-center gap-1.5 font-mono text-[9px] font-bold tracking-[0.2em] idc-ink uppercase [writing-mode:vertical-rl]">${esc(team.en)}</span>
        <span class="idc-barcode w-4 flex-1 my-2 opacity-85 rounded-[2px]"></span>
        <span class="idc-team-icon idc-ink">${icon}</span>
        <span class="mt-2 font-semibold text-[9.5px] tracking-[0.12em] idc-muted [writing-mode:vertical-rl]">${esc(t.dept)}</span>
      </span>
    </span>
    <span class="relative z-10 block pt-1">
      <span class="grid grid-cols-2 gap-1.5 mb-2.5">
        ${cell('CLASS', open ? esc(gradeLabel(c)) : 'STAFF ACCESS')}
        ${cell('ABILITY', open ? esc(c.ability.split(' · ')[0]) : '직원 채널에서 열람')}
        ${cell('HEIGHT', open && height ? esc(height) : '—', true)}
        ${cell('LOCATION', open ? esc(locationOf(c).split(' · ').map((x) => x.split(' ')[0]).join(' · ')) : '—', true)}
      </span>
      <span class="flex items-center justify-between border-t idc-rule pt-2">
        <span class="block font-mono text-[7.5px] font-semibold tracking-[0.12em] idc-muted uppercase">SENTINEL &amp; GUIDE INTEGRATED ADMINISTRATION</span>
        <span class="block text-[9.5px] font-medium idc-ink opacity-80">국가 각성자 통합관리청</span>
      </span>
    </span>
  </span></span>`;
  const origin = c.team === 'origin';
  const scale = origin ? Object.keys(existence) : ladder;
  const current = origin ? c.rank : graded(c) ? c.rank.replace('+', '') : '';
  const ladderRows = scale
    .map((g) => {
      const label = origin ? `${existence[g].mark} · ${g}` : `${g}-CLASS`;
      return open && g === current
        ? `<li class="idc-on flex items-center justify-between font-bold px-2 py-0.5 rounded"><span>${origin ? label : esc(c.rank) + '-CLASS'}</span><span>●</span></li>`
        : `<li class="idc-off px-2">${label}</li>`;
    })
    .join('');
  const divisions = ['shield', 'origin', 'beacon', 'blackjack']
    .map((id) => {
      const x = teams.find((tm) => tm.id === id);
      return id === c.team
        ? `<li class="idc-on flex items-center justify-between font-bold px-2 py-0.5 rounded"><span>${x.en}</span><span>●</span></li>`
        : `<li class="idc-off px-2">${x.en}</li>`;
    })
    .join('');
  const back = `<span class="idc-stage tw"><span class="idc idc-back flex flex-col justify-between p-6">
    <span class="idc-noise" aria-hidden="true"></span>
    <span aria-hidden="true" class="pointer-events-none absolute -right-8 top-16 font-display font-bold ${mark.length > 2 ? 'text-[190px]' : mark.length > 1 ? 'text-[260px]' : 'text-[390px]'} leading-[0.78] tracking-tighter text-white/[0.07] select-none">${esc(mark)}</span>
    <span class="relative z-10 flex flex-col items-center">
      <span class="idc-slot idc-slot-dark mb-4"></span>
      <span class="w-full block border-b border-white/15 pb-3 text-left"><span class="block font-mono text-[10px] tracking-[0.2em] text-white/55 uppercase">${t.division}</span><span class="block font-display font-bold text-3xl tracking-tight text-white mt-0.5">${esc(team.en)}</span></span>
    </span>
    <span class="relative z-10 block my-auto py-4 text-left">
      <span class="block text-[12px] leading-relaxed text-white/85 font-normal mb-5">“${esc(team.description)}”<br><span class="text-[11px] text-white/55">${open ? esc(c.bio) : '개인 식별 정보는 직원 채널에서 열람하십시오.'}</span></span>
      <span class="grid grid-cols-2 gap-4 bg-white/[0.05] border border-white/15 rounded-2xl p-4">
        <span class="block"><span class="block font-mono text-[9px] tracking-[0.18em] text-white/50 uppercase mb-2">${origin ? 'EXISTENCE CLASS' : 'CLASS INDEX'}</span><ul class="space-y-1 font-mono text-[11px]">${ladderRows}</ul></span>
        <span class="block"><span class="block font-mono text-[9px] tracking-[0.18em] text-white/50 uppercase mb-2">SGIA DIVISION</span><ul class="space-y-1 font-mono text-[10.5px]">${divisions}</ul></span>
      </span>
      <span class="mt-4 flex items-center justify-between rounded-xl bg-black/25 border border-white/10 px-3.5 py-2.5">
        <span class="block min-w-0"><span class="block font-mono text-[9px] text-white/50 uppercase tracking-[0.14em]">REGISTERED AGENT</span><span class="block text-[13px] font-bold text-white mt-0.5 truncate">${local} (${code})${open && height ? ' · ' + esc(height) : ''}</span></span>
        <span class="block text-right shrink-0 ml-3 max-w-[45%]"><span class="block font-mono text-[9px] text-white/50 uppercase tracking-[0.14em]">SPECIALIZATION</span><span class="block text-[12.5px] font-semibold text-white/85 mt-0.5 truncate">${open ? esc(c.ability.split(' · ')[0]) : '—'}</span></span>
      </span>
    </span>
    <span class="relative z-10 flex items-center justify-between text-[9.5px] font-mono text-white/55"><span>ISSUED BY SGIA HQ</span><span>${esc(t.dept)}</span></span>
  </span></span>`;
  return [front, back];
}

/** Scales every 390 × 640 badge inside `root` to the width of its face. */
export function fitBadges(root) {
  const apply = (face) => {
    const w = face.clientWidth;
    if (w) face.style.setProperty('--idc-s', String(w / 390));
  };
  const faces = [...root.querySelectorAll('.idc-host')];
  faces.forEach(apply);
  if (!('ResizeObserver' in window)) return () => {};
  const ro = new ResizeObserver((entries) => entries.forEach((e) => apply(e.target)));
  faces.forEach((f) => ro.observe(f));
  return () => ro.disconnect();
}
