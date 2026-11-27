// SGIA liquid-glass personnel badge, shared by department cards and personnel files.
// Layout follows the approved badge reference at a fixed 390 × 640 design size and is
// scaled to its container, so every member keeps the same proportions on any screen.
import { esc } from './runtime.js';
import { teams } from './model.js';
import { memberFacts } from './member-archive-data.js';
import { personName, language } from './i18n.js';

export const badgeTeams = {
  shield: { letter: 'S', index: 'SH', dept: '전술대응팀', floor: '', division: 'TACTICAL RESPONSE', color: 'WHITE', prefix: 'SH' },
  origin: { letter: 'O', index: 'B4', dept: '특수목적팀', floor: 'B4', division: 'SPECIAL PURPOSE', color: 'VIOLET', prefix: 'OR' },
  beacon: { letter: 'B', index: '02', dept: '추적관리팀', floor: '02F', division: 'TRACKING & CUSTODY', color: 'GREY', prefix: 'BC' },
  blackjack: { letter: '♠', index: '21', dept: '대테러부대', floor: '', division: 'COUNTER-TERROR', color: 'OLIVE', prefix: 'BJ' },
};
const icons = {
  shield: '<path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" stroke-linejoin="round"/>',
  origin: '<circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16" stroke-linecap="round"/>',
  beacon: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke-linecap="round"/>',
  blackjack: '<path d="M12 3c3 4 7 6 7 10a4 4 0 0 1-6.5 3.1L13 21h-2l.5-4.9A4 4 0 0 1 5 13c0-4 4-6 7-10z" stroke-linejoin="round"/>',
};
const ladder = ['SSS', 'SS', 'S', 'A', 'B', 'C'];

export function memberType(c) {
  if (/비각성/.test(c.rank)) return 'NON-AWAKENED';
  if (c.rank === 'ERROR') return 'UNCLASSIFIED';
  if (/미공개/.test(c.rank)) return 'CLASSIFIED';
  return /가이드/.test(c.role) ? 'GUIDE' : 'SENTINEL';
}
export function gradeLabel(c) {
  const type = memberType(c);
  if (/^[A-Z]+\+?$/.test(c.rank) && c.rank !== 'ERROR') return `${c.rank}급 ${type === 'GUIDE' ? 'Guide' : 'Sentinel'}`;
  return c.rank;
}
export function heightOf(c) {
  const found = (c.appearance || '').match(/(\d{3})\s?cm/)?.[1];
  return memberFacts[c.id]?.height || (found ? found + 'cm' : '');
}
export function serialOf(c, i = 0) {
  const t = badgeTeams[c.team];
  const grade = /^[A-Z]+\+?$/.test(c.rank) && c.rank !== 'ERROR' ? c.rank.replace('+', 'P') : 'XX';
  return `${t.prefix}-${grade}-${String(i + 1).padStart(2, '0')}`;
}
function cell(label, value, wide = false) {
  return `<span class="idc-cell ${wide ? 'idc-cell-row flex items-center justify-between px-3 py-1.5' : 'block px-3 py-2'} rounded-xl"><span class="block font-mono text-[8.5px] font-semibold tracking-[0.14em] idc-muted uppercase whitespace-nowrap">${label}</span><span class="block ${wide ? 'font-mono text-[12px] whitespace-nowrap ml-2' : 'text-[12.5px] mt-0.5 tracking-tight truncate'} font-bold idc-ink">${value}</span></span>`;
}

/** Front and back faces. `open` shows staff-only fields. Returns two strings. */
export function badgeFaces(c, { open = true, index = 0, portrait = c.portrait, status = 'ACTIVE', caption = '' } = {}) {
  const t = badgeTeams[c.team];
  const team = teams.find((x) => x.id === c.team);
  const type = memberType(c);
  const grade = open ? esc(c.rank) : '—';
  const serial = serialOf(c, index);
  const height = heightOf(c);
  const facts = memberFacts[c.id] || {};
  const name = esc(c.name.split(' · ')[0]);
  const code = esc(c.code);
  const sub = caption || (open ? `${esc(c.rank)} ${type} · ${esc(team.name)}` : 'PUBLIC RECORD');
  const icon = `<svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">${icons[c.team]}</svg>`;
  const pic = `background-image:url(&quot;${esc(portrait)}&quot;)`;
  const front = `<span class="idc-stage tw"><span class="idc idc-front flex flex-col justify-between p-6">
    <span class="idc-noise" aria-hidden="true"></span><span class="idc-strip" aria-hidden="true"></span><span class="idc-glare" aria-hidden="true"></span>
    <span aria-hidden="true" class="pointer-events-none absolute -right-7 -top-8 font-display font-bold text-[230px] leading-none tracking-tighter idc-ghost select-none z-0">${t.letter}</span>
    ${t.index ? `<span aria-hidden="true" class="pointer-events-none absolute -left-5 bottom-12 font-display font-bold text-[150px] leading-none tracking-tighter idc-ghost2 select-none z-0">${t.index}</span>` : ''}
    <span class="relative z-10 flex flex-col items-center">
      <span class="idc-slot mb-3.5"></span>
      <span class="w-full flex items-start justify-between border-b idc-rule pb-2.5">
        <span class="block text-left">
          <span class="flex items-center gap-1.5"><span class="idc-chip px-1.5 py-0.5 rounded font-mono text-[9px] font-bold tracking-[0.16em]">SGIA</span><span class="font-mono text-[10px] font-semibold tracking-[0.14em] idc-muted uppercase">${t.dept}${t.floor ? ' · ' + t.floor : ''}</span></span>
          <span class="block font-display font-bold text-[34px] leading-[0.95] tracking-[-0.02em] idc-ink mt-1">${esc(team.en)}</span>
        </span>
        <span class="credential-grade text-right flex flex-col items-end">
          <b class="font-display font-bold ${grade.length > 3 ? 'text-[17px]' : 'text-[24px]'} leading-none idc-ink tracking-tight">${grade}</b>
          <small class="font-mono text-[9px] font-semibold tracking-[0.14em] idc-muted mt-0.5">${open ? type : 'GRADE'}</small>
          <span class="idc-status mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full font-mono text-[8.5px] font-semibold idc-ink"><i class="idc-dot w-1.5 h-1.5 rounded-full"></i> <span data-badge-status>${status}</span></span>
        </span>
      </span>
    </span>
    <span class="relative z-10 flex gap-2.5 my-3 flex-1 min-h-0">
      <span class="idc-portrait flex-1 h-full relative block rounded-2xl overflow-hidden">
        <span class="idc-photo ${open ? '' : 'idc-photo-locked'} block w-full h-full" data-badge-photo role="img" aria-label="${open ? name + ' 공식 증명사진' : '신원 비공개'}" style="${pic}"></span>
        <span class="pointer-events-none absolute top-3 left-3 w-3 h-3 border-t border-l border-white/75"></span>
        <span class="pointer-events-none absolute top-3 right-3 w-3 h-3 border-t border-r border-white/75"></span>
        ${!open ? '<span class="redaction-label">IDENTITY PROTECTED</span>' : ''}
        <span class="idc-pill absolute bottom-2.5 left-2.5 right-2.5 rounded-2xl px-3.5 py-2.5 flex items-center justify-between text-white z-20">
          <span class="block text-left min-w-0">
            <span class="flex items-center gap-1.5"><strong class="card-code text-[15px] font-bold tracking-tight text-white leading-none">${esc(personName(c))}</strong>${language() !== 'en' ? `<span class="fixed-code font-display font-bold text-[14px] tracking-[0.06em] text-white/80 leading-none" data-no-translate>${code}</span>` : ''}</span>
            <span class="block font-mono text-[9.5px] tracking-[0.12em] text-white/70 mt-1 uppercase truncate" data-badge-caption>${sub}</span>
          </span>
          <span class="w-8 h-8 rounded-full bg-white/15 border border-white/40 flex items-center justify-center shrink-0">${icon}</span>
        </span>
      </span>
      <span class="w-8 shrink-0 flex flex-col items-center justify-between py-1">
        <span class="font-mono text-[8px] font-bold tracking-[0.18em] idc-muted uppercase [writing-mode:vertical-rl]">SGIA-AUTH</span>
        <span class="idc-barcode w-4 flex-1 my-2 opacity-85 rounded-[2px]"></span>
        <span class="font-mono text-[8.5px] font-bold tracking-[0.14em] idc-ink [writing-mode:vertical-rl]">${serial}</span>
      </span>
    </span>
    <span class="relative z-10 block pt-1">
      <span class="grid grid-cols-2 gap-1.5 mb-2.5">
        ${cell('CLASS / GRADE', open ? esc(gradeLabel(c)) : 'STAFF ACCESS')}
        ${cell('ABILITY / SKILL', open ? esc(c.ability.split(' · ')[0]) : '직원 채널에서 열람')}
        ${cell('HEIGHT', open && height ? esc(height) : '—', true)}
        ${cell(facts.birthday ? 'AGE · BDAY' : 'SECTOR', open && facts.birthday ? `${esc(c.age)}세 · ${esc(facts.birthday)}` : esc(t.floor ? 'SGIA ' + t.floor : 'SGIA HQ'), true)}
      </span>
      <span class="flex items-center justify-between border-t idc-rule pt-2">
        <span class="block leading-tight text-left">
          <span class="block font-mono text-[7.5px] font-semibold tracking-[0.12em] idc-muted uppercase">SENTINEL &amp; GUIDE INTEGRATED ADMINISTRATION</span>
          <span class="block text-[9.5px] font-medium idc-ink opacity-80 mt-0.5">국가 각성자 통합관리청 · ${esc(team.name)}(${esc(team.en)}) 정식 요원증</span>
        </span>
        <span class="idc-serial shrink-0 ml-2 inline-block px-2 py-0.5 rounded-md font-mono text-[10px] font-bold tracking-[0.1em] idc-ink">${serial}</span>
      </span>
    </span>
  </span></span>`;
  const rankRow = /^[A-Z]+\+?$/.test(c.rank) && c.rank !== 'ERROR' ? c.rank.replace('+', '') : '';
  const ladderRows = ladder
    .map((g) =>
      open && g === rankRow
        ? `<li class="idc-on flex items-center justify-between font-bold px-2 py-0.5 rounded"><span>${esc(c.rank)}-CLASS</span><span>●</span></li>`
        : `<li class="idc-off px-2">${g}-CLASS</li>`,
    )
    .join('');
  const divisions = ['shield', 'origin', 'beacon', 'blackjack']
    .map((id) => {
      const x = teams.find((tm) => tm.id === id);
      const label = `${badgeTeams[id].floor || '—'} · ${x.en}`;
      return id === c.team
        ? `<li class="idc-on flex items-center justify-between font-bold px-2 py-0.5 rounded"><span>${label}</span><span>●</span></li>`
        : `<li class="idc-off px-2">${label}</li>`;
    })
    .join('');
  const back = `<span class="idc-stage tw"><span class="idc idc-back flex flex-col justify-between p-6">
    <span class="idc-noise" aria-hidden="true"></span><span class="idc-strip" aria-hidden="true"></span><span class="idc-glare" aria-hidden="true"></span>
    <span aria-hidden="true" class="pointer-events-none absolute -right-10 top-12 font-display font-bold text-[390px] leading-[0.78] tracking-tighter text-white/[0.08] select-none">${t.letter}</span>
    <span class="relative z-10 flex flex-col items-center">
      <span class="idc-slot idc-slot-dark mb-4"></span>
      <span class="w-full flex items-center justify-between border-b border-white/15 pb-3">
        <span class="block text-left"><span class="block font-mono text-[10px] tracking-[0.2em] text-white/55 uppercase">${t.division}</span><span class="block font-display font-bold text-3xl tracking-tight text-white mt-0.5">${esc(team.en)}${t.floor ? ' // ' + t.floor : ''}</span></span>
        <span class="idc-back-mark w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-lg">${t.letter}${t.index && t.index.length < 3 ? t.index.slice(-1) : ''}</span>
      </span>
    </span>
    <span class="relative z-10 block my-auto py-4 text-left">
      <span class="block text-[12px] leading-relaxed text-white/85 font-normal mb-5">“${esc(team.description)}”<br><span class="text-[11px] text-white/55">${open ? esc(c.bio) : '개인 식별 정보는 직원 채널에서 열람하십시오.'}</span></span>
      <span class="grid grid-cols-2 gap-4 bg-white/[0.05] border border-white/15 rounded-2xl p-4">
        <span class="block"><span class="block font-mono text-[9px] tracking-[0.18em] text-white/50 uppercase mb-2">CLASS INDEX</span><ul class="space-y-1 font-mono text-[11px]">${ladderRows}</ul></span>
        <span class="block"><span class="block font-mono text-[9px] tracking-[0.18em] text-white/50 uppercase mb-2">SGIA DIVISION</span><ul class="space-y-1 font-mono text-[10.5px]">${divisions}</ul></span>
      </span>
      <span class="mt-4 flex items-center justify-between rounded-xl bg-black/25 border border-white/10 px-3.5 py-2.5">
        <span class="block min-w-0"><span class="block font-mono text-[9px] text-white/50 uppercase tracking-[0.14em]">REGISTERED AGENT</span><span class="block text-[13px] font-bold text-white mt-0.5 truncate">${name} (${code})${open && height ? ' · ' + esc(height) : ''}</span></span>
        <span class="block text-right shrink-0 ml-3"><span class="block font-mono text-[9px] text-white/50 uppercase tracking-[0.14em]">SPECIALIZATION</span><span class="block text-[13px] font-semibold text-white/85 mt-0.5">${open ? esc(c.ability.split(' · ')[0]) : '—'}</span></span>
      </span>
    </span>
    <span class="relative z-10 block">
      <span class="w-full h-7 rounded-md idc-stripe border border-white/15 mb-3 flex items-center px-3 justify-between"><span class="font-mono text-[8px] tracking-[0.25em] text-white/55">SGIA // CLEARANCE ${open ? esc(c.rank) : 'PUBLIC'}</span><span class="font-mono text-[8px] text-white/75">${t.color} TEAM</span></span>
      <span class="flex items-center justify-between text-[9.5px] font-mono text-white/55"><span>ISSUER: SGIA HQ${t.floor ? ' (' + t.floor + ')' : ''}</span><span class="text-white font-semibold tracking-[0.14em]">ID // ${serial}</span></span>
    </span>
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
