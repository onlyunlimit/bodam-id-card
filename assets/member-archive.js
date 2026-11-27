// Personnel file: badge entry → clearance → desk (badge, paper dossier, chalkboard guestbook, photocards).
import { esc, modal, state } from './runtime.js';
import { serviceConfig } from './service-config.js';
import { teams } from './model.js';
import { characters } from './characters.js';
import { memberFacts, zionCards, galleryTitle } from './member-archive-data.js';
import { badgeFaces, badgeTeams, gradeLabel, heightOf, serialOf, fitBadges } from './id-badge.js';

const fonts = [
  ['hand', '손글씨 펜체 (Nanum Pen)'],
  ['memo', '자유로운 메모체 (Gaegu)'],
  ['serif', '고전 명조체 (Nanum Myeongjo)'],
  ['sans', '모던 고딕체 (Pretendard)'],
  ['mono', '타자기 모노체 (JetBrains Mono)'],
];
const chalks = [
  ['#F4F1EA', '분필 화이트'],
  ['#F2A7A7', '크림슨 분필'],
  ['#A9C8F0', '블루 분필'],
  ['#C9E4A6', '그린 분필'],
  ['#F5DE8A', '옐로 분필'],
];
const bg = (url) => `background-image:url(&quot;${esc(String(url))}&quot;)`;
function sheet() {
  if (document.querySelector('[data-archive-css]')) return;
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = new URL('./member-archive.css', import.meta.url);
  l.dataset.archiveCss = '';
  document.head.append(l);
}
function cardsFor(c) {
  if (c.id === 'jion') return zionCards;
  const list = (c.gallery?.length ? c.gallery : [{ url: c.portrait, label: c.code }]).filter((g) => !/placeholder/.test(g.url));
  return (list.length ? list : [{ url: c.portrait, label: '' }]).map((g) => ({ url: g.url, title: galleryTitle(g.label) }));
}
const memo = ([kind, text, by], i) =>
  kind === 'sticky'
    ? `<figure class="ma-memo ma-sticky" style="--r:${i % 2 ? 0.7 : -0.9}deg"><p class="font-pen text-[21px] leading-[1.28] text-zinc-900">“${esc(text)}”</p><figcaption class="block text-right font-mono text-[9px] text-zinc-500 mt-1">— ${esc(by)}</figcaption></figure>`
    : `<figure class="ma-memo ma-ink ma-${kind}" style="--r:${[-1.2, 0.8, -0.4, 1.1][i % 4]}deg"><p class="font-pen text-[22px] leading-[1.22]">${esc(text)}</p><svg class="ma-scrawl" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true"><path d="M2 8 C40 3 80 11 120 6 S180 4 198 7"/></svg><figcaption class="block font-mono text-[9px] text-zinc-500 mt-0.5">— ${esc(by)}</figcaption></figure>`;

export function memberArchive(c) {
  sheet();
  const team = teams.find((t) => t.id === c.team);
  const bt = badgeTeams[c.team];
  const facts = memberFacts[c.id] || {};
  const cards = cardsFor(c);
  const berserk = c.gallery?.find((g) => /역안/.test(g.label))?.url;
  const name = esc(c.name.split(' · ')[0]);
  const code = esc(c.code);
  const serial = serialOf(c, characterIndex(c));
  const height = heightOf(c);
  const index = characterIndex(c);
  const [entryFront, entryBack] = badgeFaces(c, { open: true, index, status: 'ACTIVE' });
  const [deskFront, deskBack] = badgeFaces(c, { open: true, index, status: 'STABLE' });
  const observation = facts.observation || [
    `${c.appearance}. ${c.bio} 주요 능력은 `,
    facts.highlight || c.ability,
    `. ${c.notes || ''}`,
  ];
  const html = `<article class="member-archive ma-root tw" data-team="${c.team}" data-member="${esc(c.id)}">
  <div class="ma-noise" aria-hidden="true"></div>
  <header class="ma-topbar"><div class="flex items-center gap-3 min-w-0"><span class="px-2 py-0.5 rounded bg-white text-black font-mono text-[10px] font-bold tracking-[0.2em]">SGIA</span><span class="font-mono text-[11px] tracking-[0.18em] text-zinc-300 uppercase truncate hidden sm:inline">SENTINEL &amp; GUIDE INTEGRATED ADMINISTRATION</span><span class="font-mono text-[11px] tracking-[0.16em] text-zinc-400 sm:hidden">${esc(team.en)}</span></div>
   <nav class="ma-nav flex items-center gap-1.5 bg-white/[0.06] border border-white/10 rounded-full p-1" aria-label="인사기록 열람 단계"><button type="button" data-go="badge" aria-pressed="true">01. ID BADGE</button><button type="button" data-go="dossier" aria-pressed="false">02. DOSSIER</button><button type="button" data-go="deck" aria-pressed="false">03. PHOTOCARDS <span class="px-1.5 rounded-full bg-white/15 text-[9px]">${cards.length}</span></button></nav></header>

  <section class="ma-entry" data-stage="badge">
   <div class="mb-4 text-center"><span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/15"><span class="ma-ping w-1.5 h-1.5 rounded-full bg-white"></span><span class="font-mono text-[10px] tracking-[0.2em] text-zinc-300 uppercase">TAP ID CARD TO REQUEST LEVEL ${esc(c.rank)} CLEARANCE</span></span></div>
   <div class="ma-card-stage"><button type="button" class="ma-card idc-host" data-team="${c.team}" data-card="entry" aria-label="${name} 사원증. 누르면 기밀 인사기록 열람, 좌우로 밀면 회전" aria-pressed="false"><span class="ma-card-pivot"><span class="ma-face ma-face-front">${entryFront}</span><span class="ma-face ma-face-back">${entryBack}</span></span></button></div>
   <div class="mt-6 flex flex-wrap items-center justify-center gap-3"><button type="button" class="ma-primary" data-open-file>기밀 인사기록물 열람 (OPEN PERSONNEL FILE) <span aria-hidden="true">→</span></button><button type="button" class="ma-ghost-btn" data-flip-card="entry">↻ 사원증 회전</button></div>
   <p class="ma-hint">카드를 좌우로 밀어 회전 · 탭하면 열람 요청</p>
  </section>

  <div class="ma-clearance" hidden role="status" aria-live="polite"><div class="ma-terminal"><div class="ma-beam" aria-hidden="true"></div>
   <div class="flex items-center justify-between border-b border-white/10 pb-3 mb-5"><span class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-red-500 ma-blink"></span><span class="font-mono text-[10px] tracking-[0.22em] text-zinc-400 uppercase">SGIA SECURITY TERMINAL</span></span><span class="font-mono text-[10px] text-zinc-500">NODE // ${esc(bt.prefix)}-${esc(team.en)}</span></div>
   <div class="flex items-center gap-4 mb-5"><span class="relative w-16 h-16 rounded-xl border border-white/25 bg-white/[0.03] flex items-center justify-center shrink-0"><svg class="w-9 h-9 text-white ma-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="12" r="9" stroke-dasharray="4 3"/><circle cx="12" cy="12" r="4"/><path d="M12 1v3M12 20v3M1 12h3M20 12h3"/></svg></span><span class="block"><b class="ma-v-head block font-mono text-xs sm:text-sm font-bold tracking-[0.14em] text-white uppercase">REQUESTING CLEARANCE // LEVEL ${esc(c.rank)}</b><span class="ma-v-sub block font-mono text-[11px] text-zinc-400 mt-1">VERIFYING BIOMETRICS &amp; ${esc(team.en)} ARCHIVE...</span></span></div>
   <div class="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mb-4"><div class="ma-v-bar h-full w-0 bg-gradient-to-r from-zinc-400 via-white to-red-500"></div></div>
   <div class="ma-v-log space-y-1 font-mono text-[10.5px] text-zinc-400 bg-black/50 rounded-xl p-3 border border-white/5 min-h-[82px]"></div>
   <div class="ma-v-ok hidden mt-5 pt-4 border-t border-white/10 flex items-center justify-between"><span class="block"><span class="font-mono text-[10px] tracking-[0.2em] text-emerald-400 uppercase block">AUTHENTICATION COMPLETE</span><span class="text-sm font-bold text-white">기밀 인사기록물 열람이 승인되었습니다.</span></span><span class="ma-stamp px-3 py-1 border-2 border-emerald-400 text-emerald-400 font-display font-bold text-sm tracking-[0.18em] rounded">SUCCESS</span></div>
  </div></div>

  <section class="ma-workspace" data-stage="dossier" hidden>
   <div class="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
    <div class="flex items-center gap-3 min-w-0"><button type="button" class="ma-ghost-btn" data-go="badge">← ID BADGE</button><div class="min-w-0"><div class="flex items-center gap-2"><span class="font-mono text-[10px] tracking-[0.2em] text-zinc-400 uppercase">CLASSIFIED DOSSIER // FILE NO. ${esc(serial)}</span><span class="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 font-mono text-[9px] text-emerald-300">UNLOCKED</span></div><h3 class="font-display font-bold text-xl sm:text-2xl tracking-tight text-white truncate">SGIA ${esc(team.en)} DIVISION — ${code} (${name})</h3></div></div>
    <div class="flex flex-wrap items-center gap-2"><button type="button" class="ma-paper-btn" data-paper-flip aria-pressed="false">기록물 뒷면 · 방명록 열기</button><button type="button" class="ma-ghost-btn" data-go="deck">ARCHIVE PHOTOCARDS [${cards.length}]</button></div>
   </div>
   <div class="ma-desk">
    <div class="ma-desk-left">
     ${berserk ? `<div class="ma-mode" role="group" aria-label="사진 상태"><button type="button" data-mode="normal" aria-pressed="true">기본 상태 (NORMAL)</button><button type="button" data-mode="berserk" aria-pressed="false"><i aria-hidden="true"></i>역안 발동 (BERSERK)</button></div>` : ''}
     <div class="ma-card-stage"><button type="button" class="ma-card idc-host" data-team="${c.team}" data-card="desk" aria-label="${name} 사원증 앞뒤 회전. 좌우로 밀어도 회전" aria-pressed="false"><span class="ma-card-pivot"><span class="ma-face ma-face-front">${deskFront}</span><span class="ma-face ma-face-back">${deskBack}</span></span></button></div>
     <button type="button" class="ma-ghost-btn mt-4" data-flip-card="desk">↻ 사원증 앞/뒷면 회전 (터치·스와이프)</button>
    </div>
    <div class="ma-desk-right">
     <div class="ma-folder" aria-hidden="true"><span>FILE // ${esc(bt.prefix)}-${code}</span></div>
     <div class="ma-dossier-stage"><div class="ma-dossier" data-dossier><div class="ma-turn-shade" aria-hidden="true"></div>
      <article class="ma-paper ma-paper-front paper-front" aria-hidden="false">
       <div class="flex flex-wrap items-start justify-between gap-4 border-b-2 border-[#17191C] pb-4">
        <div><div class="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-zinc-600 uppercase"><span>SGIA PERSONNEL ARCHIVE</span><span>//</span><span>${esc(team.en)} [${bt.color}]</span></div><h4 class="font-display font-bold text-3xl sm:text-4xl tracking-tight text-[#17191C] mt-1">PERSONNEL RECORD</h4></div>
        <span class="ma-classified text-xs sm:text-sm">TOP SECRET // CLASSIFIED</span>
       </div>
       <div class="ma-paper-grid mt-6">
        <div class="min-w-0">
         <div class="bg-[#17191C] text-[#F4F1EA] px-4 py-3 rounded-sm mb-5"><div class="font-mono text-[9px] tracking-[0.2em] text-zinc-400 uppercase mb-1">FIELD DIRECTIVE</div><p class="text-xs sm:text-[13.5px] font-semibold leading-snug">“${esc(facts.directive || team.description)}”</p></div>
         <dl class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm border-b border-black/15 pb-5">
          ${[
            ['NAME / CODENAME', `${name} (${code})`, 'font-bold text-base'],
            ['TEAM / COLOR', `${esc(team.en)} (${esc(team.name)} · ${bt.color})`, 'font-bold text-base'],
            ['RANK / CLASS', esc(gradeLabel(c)), 'font-bold'],
            ['AGE / BIRTHDATE', `${c.age ? esc(c.age) + '세' : '미공개'}${facts.birthday ? ` (${esc(facts.birthday.replace('/', ' / '))})` : ''}`, 'font-mono font-bold'],
            ['HEIGHT / BUILD', `${height ? esc(height) : '미공개'}${facts.build ? ' · ' + esc(facts.build) : ''}`, 'font-mono font-bold'],
            ['PRIMARY ABILITY', esc(c.ability), 'font-bold'],
          ].map(([k, v, cls]) => `<div><dt class="font-mono text-[9.5px] tracking-[0.16em] text-zinc-600 uppercase">${k}</dt><dd class="${cls} text-[#17191C] mt-0.5">${v}</dd></div>`).join('')}
         </dl>
         <div class="mt-4 relative"><h5 class="font-mono text-[10px] font-bold tracking-[0.18em] text-zinc-600 uppercase mb-1.5">01 // PHYSICAL &amp; FIELD OBSERVATION</h5><p class="text-[13px] leading-relaxed text-zinc-800">${esc(observation[0])}<mark class="ma-hl">${esc(observation[1])}</mark>${esc(observation[2])}</p><span class="ma-margin font-pen" aria-hidden="true">↖ 확인됨!</span></div>
        </div>
        <div class="ma-clip-col"><div class="relative w-44 sm:w-full max-w-[190px]"><svg class="w-8 h-12 text-zinc-600 absolute -top-5 right-3 z-20" viewBox="0 0 32 52" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M10 14v24a6 6 0 0 0 12 0V10a4 4 0 0 0-8 0v26a2 2 0 0 0 4 0V15" stroke-linecap="round"/></svg>
         <div class="ma-polaroid"><div class="ma-polaroid-photo" data-clip-photo role="img" aria-label="첨부 증명사진" style="${bg(c.portrait)}"></div><div class="mt-2 flex items-center justify-between font-mono text-[8.5px] text-zinc-600 px-0.5"><span>FIG.${esc(bt.prefix)}-A</span><span>SGIA-ID</span></div></div></div></div>
       </div>
       <div class="mt-6 pt-5 border-t border-dashed border-black/25">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3"><span class="font-mono text-[10px] font-bold tracking-[0.18em] text-zinc-600 uppercase">02 // FIELD OBSERVER HANDWRITTEN NOTES (비공식 관찰 메모)</span><span class="font-pen text-lg text-[#9E1B24] -rotate-2">${esc(facts.warning || '※ 외부 반출 금지')}</span></div>
        <div class="ma-memos">${(facts.notes || [['pencil', c.notes || c.bio, '기록관']]).map(memo).join('')}</div>
       </div>
       <div class="mt-6 pt-3 border-t border-black/15 flex flex-wrap items-center justify-between gap-2"><span class="font-mono text-[9.5px] text-zinc-500">DOCUMENT PAGE 01 / 02 — TURN OVER FOR VISITOR LOG</span><button type="button" class="ma-ink-btn" data-paper-flip>뒷면 방명록 넘기기 ↻</button></div>
      </article>
      <article class="ma-paper ma-paper-back paper-back" aria-hidden="true">
       <div class="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#17191C] pb-4"><div><span class="font-mono text-[10px] tracking-[0.2em] text-zinc-600 uppercase">SGIA ${esc(team.en)} // ARCHIVE ACCESS LOG</span><h4 class="font-display font-bold text-3xl tracking-tight text-[#17191C] mt-0.5">VISITOR LOG &amp; FIELD MEMO</h4></div><button type="button" class="ma-outline-btn" data-paper-flip>↺ 앞면 인물 기록서로</button></div>
       <form class="guest-form mt-5 bg-white/75 border border-black/15 rounded-md p-4">
        <div class="ma-form-grid mb-3">
         <label class="block"><span class="ma-label">AGENT / VISITOR NAME</span><input name="author" maxlength="24" placeholder="예: 요원 A / 가이드" class="ma-input"></label>
         <label class="block"><span class="ma-label">FONT STYLE (서체 선택)</span><select name="font" class="ma-input">${fonts.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select></label>
         <fieldset class="block"><legend class="ma-label">CHALK COLOR</legend><div class="flex items-center gap-2 h-[34px]">${chalks.map(([v, l], i) => `<button type="button" class="ma-swatch" data-ink="${v}" style="--ink:${v}" aria-label="${l}" aria-pressed="${i === 0}"></button>`).join('')}</div></fieldset>
        </div>
        <div class="flex flex-col sm:flex-row gap-2.5"><input name="message" maxlength="100" required placeholder="${name}(${code})의 칠판에 남길 메모나 방명록을 입력하세요..." class="ma-input flex-1"><button type="submit" class="ma-save">기록 남기기 · 저장</button></div>
        <p class="ma-form-hint">글자를 입력하면 칠판에 나타납니다. 손가락이나 마우스로 끌어 위치를 정한 뒤 저장하세요. (방향키로도 이동)</p>
        <output class="ma-output" aria-live="polite"></output>
       </form>
       <div class="mt-5"><div class="flex items-center justify-between mb-2.5"><span class="font-mono text-[10px] font-bold tracking-[0.16em] text-zinc-600 uppercase">SHARED CHALKBOARD (<span data-count>0</span>)</span><span class="font-mono text-[9.5px] text-zinc-500">SAVED TO ARCHIVE SERVER</span></div>
        <div class="guest-board ma-board" aria-label="공유 방명록 칠판"></div></div>
       <div class="mt-4 pt-3 border-t border-black/15 flex items-center justify-between"><span class="font-mono text-[9.5px] text-zinc-500">DOCUMENT PAGE 02 / 02 — ARCHIVE VISITOR LOG</span><span class="font-mono text-[9.5px] font-bold text-zinc-700">SGIA // ${esc(team.en)}</span></div>
      </article>
     </div></div>
     <p class="ma-hint ma-hint-dark">종이를 좌우로 밀면 뒷면으로 넘어갑니다</p>
    </div>
   </div>
   <section class="ma-deck-section" data-stage="deck">
    <div class="flex flex-wrap items-end justify-between gap-4 mb-2"><div><div class="flex items-center gap-2"><span class="px-2 py-0.5 rounded bg-white/10 border border-white/15 font-mono text-[9.5px] tracking-[0.18em] text-zinc-300 uppercase">SPECIAL EDITION DECK</span><span class="font-mono text-[10px] text-zinc-400">${cards.length} COMMEMORATIVE CARDS</span></div><h3 class="font-display font-bold text-2xl sm:text-3xl tracking-tight text-white mt-1">${code} ARCHIVE PHOTOCARD COLLECTION</h3></div><p class="font-mono text-[11px] text-zinc-400">카드를 골라 꺼내 보세요 · 뒤집으면 기념 각인 (좌우 방향키 지원)</p></div>
    <div class="ma-fan" data-fan>${cards.map((g, i) => `<button type="button" class="ma-fan-card" data-photo="${i}" aria-label="포토카드 ${i + 1} 꺼내 보기"><span class="ma-poca-img" style="${bg(g.url)}"></span><span class="ma-holo" aria-hidden="true"></span></button>`).join('')}</div>
   </section>
  </section>

  <div class="ma-poca photo-view" hidden role="dialog" aria-label="포토카드 확대">
   <div class="relative flex flex-col items-center max-w-lg w-full">
    <div class="w-full flex items-center justify-between mb-4 px-2"><span class="font-mono text-xs tracking-[0.2em] text-zinc-300" data-poca-count></span><button type="button" class="ma-ghost-btn photo-close">CLOSE [ESC]</button></div>
    <div class="flex items-center justify-center gap-4 sm:gap-7 w-full"><button type="button" class="ma-round" data-prev aria-label="이전 포토카드">‹</button>
     <button type="button" class="ma-poca-card" aria-label="포토카드 뒤집기. 좌우로 밀어도 뒤집힙니다" aria-pressed="false"><span class="ma-poca-pivot"><span class="ma-poca-face ma-poca-front"><span class="ma-poca-img" data-poca-img></span><span class="ma-holo" aria-hidden="true"></span></span><span class="ma-poca-face ma-poca-back"><span class="ma-poca-title" data-poca-title></span></span></span></button>
     <button type="button" class="ma-round" data-next aria-label="다음 포토카드">›</button></div>
    <button type="button" class="ma-primary mt-5" data-poca-flip>포토카드 앞/뒷면 뒤집기 ↻</button>
   </div>
  </div>
 </article>`;
  const d = modal(c.code, html, 'member-archive');
  const root = d.querySelector('.member-archive');
  const q = (s) => root.querySelector(s);
  const qa = (s) => [...root.querySelectorAll(s)];
  const abort = new AbortController();
  const on = (el, type, fn, opts = {}) => el.addEventListener(type, fn, { ...opts, signal: abort.signal });
  const timers = new Set();
  const later = (fn, ms) => {
    const id = setTimeout(() => {
      timers.delete(id);
      if (root.isConnected) fn();
    }, state.motion ? ms : 0);
    timers.add(id);
  };
  const unfit = fitBadges(root);
  on(d, 'close', () => { abort.abort(); unfit(); timers.forEach(clearTimeout); }, { once: true });
  on(root, 'contextmenu', (e) => { if (e.target.closest('.ma-poca-img,.idc-photo,.ma-polaroid-photo')) e.preventDefault(); });
  on(root, 'dragstart', (e) => e.preventDefault());

  // ----- Stages -----
  const nav = qa('.ma-nav [data-go]');
  let unlocked = false;
  function setStage(stage, scroll = false) {
    nav.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.go === stage)));
    q('.ma-entry').hidden = stage !== 'badge';
    q('.ma-workspace').hidden = stage === 'badge';
    if (stage !== 'badge') requestAnimationFrame(() => { layoutFan(); root.querySelectorAll('.idc-host').forEach((f) => f.clientWidth && f.style.setProperty('--idc-s', String(f.clientWidth / 390))); });
    if (scroll) later(() => q(stage === 'deck' ? '.ma-deck-section' : '.ma-workspace').scrollIntoView({ behavior: state.motion ? 'smooth' : 'auto', block: 'start' }), 120);
  }
  let verifying = false;
  function clearance(target = 'dossier') {
    if (unlocked) return setStage(target, true);
    if (verifying) return;
    verifying = true;
    const box = q('.ma-clearance'), bar = q('.ma-v-bar'), log = q('.ma-v-log');
    const line = (t, ok = false) => { const el = document.createElement('div'); el.textContent = t; if (ok) el.className = 'text-emerald-400 font-bold'; log.append(el); };
    box.hidden = false;
    log.replaceChildren();
    q('.ma-v-ok').classList.add('hidden');
    bar.style.width = '12%';
    line(`> [00.14s] CREDENTIAL DETECTED: ${serial} (${c.code})`);
    later(() => { bar.style.width = '54%'; line(`> [00.58s] BIOMETRIC SIGNATURE MATCHED // ${team.en}`); }, 420);
    later(() => { bar.style.width = '88%'; line('> [01.02s] DECRYPTING CLASSIFIED PERSONNEL DOSSIER...'); }, 880);
    later(() => { bar.style.width = '100%'; q('.ma-v-head').textContent = 'ACCESS GRANTED — SUCCESS'; q('.ma-v-sub').textContent = 'CLEARANCE CONFIRMED. OPENING ARCHIVE FILE...'; line('> [01.35s] STATUS: SUCCESS // UNLOCKED', true); q('.ma-v-ok').classList.remove('hidden'); }, 1250);
    later(() => { box.hidden = true; verifying = false; unlocked = true; setStage(target, target === 'deck'); q('[data-card=desk]')?.focus({ preventScroll: true }); }, 1950);
  }
  nav.forEach((b) => on(b, 'click', () => (b.dataset.go === 'badge' ? setStage('badge') : clearance(b.dataset.go))));
  qa('.ma-workspace [data-go]').forEach((b) => on(b, 'click', () => (b.dataset.go === 'badge' ? setStage('badge') : setStage('deck', true))));
  on(q('[data-open-file]'), 'click', () => clearance('dossier'));

  // ----- Shared 3D turn with drag-follow (cards, paper, photocards) -----
  function turnable(el, pivot, { onTap, onFlip, axis = 1, ignore = '' } = {}) {
    let flipped = false, start = null, angle = 0, moved = false;
    const width = () => el.getBoundingClientRect().width || 300;
    const set = (deg, animate) => {
      pivot.style.transition = animate ? '' : 'none';
      pivot.style.transform = `rotateY(${deg}deg)`;
    };
    const apply = (value, animate = true) => {
      flipped = value;
      el.classList.toggle('is-flipped', flipped);
      if (el.tagName === 'BUTTON') el.setAttribute('aria-pressed', String(flipped));
      set(flipped ? -180 * axis : 0, animate);
      onFlip?.(flipped);
    };
    on(el, 'pointerdown', (e) => {
      if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0) || (ignore && e.target.closest(ignore))) return;
      start = { x: e.clientX, y: e.clientY, id: e.pointerId };
      moved = false;
    });
    on(el, 'pointermove', (e) => {
      if (e.pointerType === 'mouse' && !start) {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--shine-x', `${((e.clientX - r.left) / r.width) * 100}%`);
        el.style.setProperty('--shine-y', `${((e.clientY - r.top) / r.height) * 100}%`);
      }
      if (!start || start.id !== e.pointerId) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (!moved && Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        moved = true;
        el.setPointerCapture?.(e.pointerId);
        el.classList.add('is-dragging');
      }
      if (!moved) return;
      const base = flipped ? -180 * axis : 0;
      angle = Math.max(-200, Math.min(200, base + (dx / width()) * 180));
      set(angle, false);
    });
    const end = (e) => {
      if (!start || start.id !== e.pointerId) return;
      const wasMoved = moved;
      start = null;
      el.classList.remove('is-dragging');
      if (!wasMoved) return;
      el.dataset.swiped = String(Date.now());
      const base = flipped ? -180 * axis : 0;
      apply(Math.abs(angle - base) > 55 ? !flipped : flipped);
    };
    on(el, 'pointerup', end);
    on(el, 'pointercancel', end);
    on(el, 'click', (e) => {
      if (Date.now() - Number(el.dataset.swiped || 0) < 450) return;
      if (ignore && e.target.closest(ignore)) return;
      onTap ? onTap() : apply(!flipped);
    });
    on(el, 'keydown', (e) => {
      if (['ArrowLeft', 'ArrowRight'].includes(e.key) && e.target === el) { e.preventDefault(); apply(!flipped); }
    });
    return { flip: () => apply(!flipped), reset: () => apply(false, false), get flipped() { return flipped; } };
  }
  const entry = turnable(q('[data-card=entry]'), q('[data-card=entry] .ma-card-pivot'), { onTap: () => clearance('dossier') });
  const desk = turnable(q('[data-card=desk]'), q('[data-card=desk] .ma-card-pivot'));
  on(q('[data-flip-card=entry]'), 'click', () => entry.flip());
  on(q('[data-flip-card=desk]'), 'click', () => desk.flip());

  // Paper dossier: drag the sheet itself, or use the buttons.
  const dossier = q('[data-dossier]');
  const paperBtns = qa('[data-paper-flip]');
  const paper = turnable(dossier, dossier, {
    ignore: 'button,input,select,textarea,label,.ma-board,form',
    onTap: () => {},
    onFlip: (f) => {
      q('.paper-front').setAttribute('aria-hidden', String(f));
      q('.paper-back').setAttribute('aria-hidden', String(!f));
      paperBtns[0].textContent = f ? '기록물 앞면 · 인물 소개서 보기' : '기록물 뒷면 · 방명록 열기';
      paperBtns[0].setAttribute('aria-pressed', String(f));
    },
  });
  paperBtns.forEach((b) => on(b, 'click', (e) => { e.stopPropagation(); paper.flip(); }));

  // Berserk (역안) mode
  if (berserk) {
    const modes = qa('[data-mode]');
    modes.forEach((b) => on(b, 'click', () => {
      const on_ = b.dataset.mode === 'berserk';
      root.classList.toggle('berserk-mode', on_);
      modes.forEach((m) => m.setAttribute('aria-pressed', String(m === b)));
      const url = on_ ? berserk : c.portrait;
      q('[data-card=desk] .ma-face-front [data-badge-photo]').style.backgroundImage = `url("${url.replaceAll('"', '%22')}")`;
      q('[data-clip-photo]').style.backgroundImage = `url("${url.replaceAll('"', '%22')}")`;
      q('[data-card=desk] .ma-face-front [data-badge-status]').textContent = on_ ? 'BERSERK' : 'STABLE';
      q('[data-card=desk] .ma-face-front [data-badge-caption]').textContent = on_ ? 'WARNING // 역안 발동 상태' : `${c.rank} ${team.en}`;
    }));
  }

  // ----- Chalkboard guestbook -----
  const board = q('.ma-board'), form = q('.guest-form'), out = q('.ma-output');
  let ink = chalks[0][0], pending = null, pos = { x: 0.32, y: 0.42 };
  const place = (el, p) => { el.style.left = `${p.x * 78 + 2}%`; el.style.top = `${p.y * 80 + 4}%`; };
  function note(n, mine = false) {
    const el = document.createElement('span');
    el.className = 'ma-chalk' + (mine ? ' pending' : '');
    el.dataset.font = n.font;
    el.dataset.userContent = '';
    el.style.color = n.color;
    place(el, n);
    const msg = document.createElement('span');
    msg.textContent = n.message;
    const by = document.createElement('small');
    by.textContent = `— ${n.author}`;
    el.append(msg, by);
    board.append(el);
    return el;
  }
  const seeds = (facts.seed || []).map(([author, message, font, color, x, y]) => ({ author, message, font, color, x, y }));
  async function load() {
    let notes = [];
    try {
      const r = await fetch(`${serviceConfig.api}/guestbook?character=${encodeURIComponent(c.id)}`, { signal: abort.signal });
      if (!r.ok) throw Error();
      notes = (await r.json()).notes || [];
    } catch (e) {
      if (e.name === 'AbortError') return;
      if (root.isConnected) out.textContent = '방명록을 불러오지 못했습니다. 잠시 후 다시 열어 주세요.';
    }
    if (!root.isConnected) return;
    board.replaceChildren();
    [...seeds, ...notes].forEach((n) => note(n));
    q('[data-count]').textContent = String(seeds.length + notes.length);
    if (pending) board.append(pending);
  }
  load();
  function refreshPending() {
    const message = form.message.value.trim();
    if (!message) { pending?.remove(); pending = null; return; }
    const data = { author: form.author.value.trim() || '익명', message, font: form.font.value, color: ink, ...pos };
    if (!pending) {
      pending = note(data, true);
      pending.tabIndex = 0;
      pending.setAttribute('role', 'button');
      pending.setAttribute('aria-label', '내 메모 위치. 끌거나 방향키로 이동');
      bindDrag(pending);
    } else {
      pending.dataset.font = data.font;
      pending.style.color = data.color;
      pending.firstChild.textContent = data.message;
      pending.lastChild.textContent = `— ${data.author}`;
    }
  }
  function bindDrag(el) {
    let grab = null;
    const move = (x, y) => { pos = { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) }; place(el, pos); };
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault(); e.stopPropagation();
      el.setPointerCapture(e.pointerId);
      const r = el.getBoundingClientRect();
      grab = { dx: e.clientX - r.left, dy: e.clientY - r.top };
      el.classList.add('grabbing');
    });
    el.addEventListener('pointermove', (e) => {
      if (!grab || !el.hasPointerCapture(e.pointerId)) return;
      const b = board.getBoundingClientRect();
      move((e.clientX - grab.dx - b.left - b.width * 0.02) / (b.width * 0.78), (e.clientY - grab.dy - b.top - b.height * 0.04) / (b.height * 0.8));
    });
    const stop = () => { grab = null; el.classList.remove('grabbing'); };
    el.addEventListener('pointerup', stop);
    el.addEventListener('pointercancel', stop);
    el.addEventListener('keydown', (e) => {
      const k = { ArrowLeft: [-0.025, 0], ArrowRight: [0.025, 0], ArrowUp: [0, -0.03], ArrowDown: [0, 0.03] }[e.key];
      if (k) { e.preventDefault(); move(pos.x + k[0], pos.y + k[1]); }
    });
  }
  on(board, 'pointerdown', (e) => {
    if (!pending || e.target.closest('.ma-chalk')) return;
    const b = board.getBoundingClientRect();
    pos = { x: Math.max(0, Math.min(1, (e.clientX - b.left) / b.width / 0.78 - 0.04)), y: Math.max(0, Math.min(1, (e.clientY - b.top) / b.height / 0.8 - 0.06)) };
    place(pending, pos);
  });
  ['input', 'change'].forEach((t) => on(form, t, (e) => { if (e.target.name) refreshPending(); }));
  qa('.ma-swatch').forEach((s) => on(s, 'click', () => {
    ink = s.dataset.ink;
    qa('.ma-swatch').forEach((x) => x.setAttribute('aria-pressed', String(x === s)));
    refreshPending();
  }));
  on(form, 'submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    refreshPending();
    const button = form.querySelector('[type=submit]');
    button.disabled = true;
    out.textContent = '저장 중…';
    try {
      const r = await fetch(`${serviceConfig.api}/guestbook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character: c.id, author: form.author.value.trim() || '익명', message: form.message.value.trim(), font: form.font.value, color: ink, ...pos }),
        signal: abort.signal,
      });
      if (!r.ok) throw Error();
      if (!root.isConnected) return;
      pending?.remove();
      pending = null;
      form.message.value = '';
      out.textContent = '칠판에 남겼습니다.';
      await load();
    } catch (err) {
      if (err.name !== 'AbortError' && root.isConnected) out.textContent = '저장하지 못했습니다. 잠시 후 다시 시도해 주세요.';
    } finally {
      button.disabled = false;
    }
  });

  // ----- Photocard fan deck -----
  const fan = q('[data-fan]');
  const fanCards = qa('.ma-fan-card');
  function layoutFan() {
    const w = fan.clientWidth;
    if (!w) return;
    const mobile = w < 560;
    fan.classList.toggle('is-strip', mobile);
    if (mobile) { fanCards.forEach((el) => { el.style.removeProperty('--x'); el.style.removeProperty('--y'); el.style.removeProperty('--a'); el.style.zIndex = ''; }); return; }
    const n = fanCards.length, cw = 150;
    const gap = n > 1 ? Math.min(78, (w - cw - 48) / (n - 1)) : 0;
    const mid = (n - 1) / 2;
    fanCards.forEach((el, i) => {
      const o = i - mid;
      el.style.setProperty('--x', `${o * gap}px`);
      el.style.setProperty('--y', `${Math.pow(Math.abs(o), 1.6) * 1.4}px`);
      el.style.setProperty('--a', `${o * Math.min(3.2, 34 / n)}deg`);
      el.style.zIndex = String(i + 1);
    });
  }
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(layoutFan);
    ro.observe(fan);
    on(d, 'close', () => ro.disconnect(), { once: true });
  }
  layoutFan();

  // ----- Photocard inspector -----
  const view = q('.ma-poca');
  const pocaCard = q('.ma-poca-card');
  const poca = turnable(pocaCard, q('.ma-poca-pivot'));
  let current = 0, opener = null;
  function show(i) {
    current = (i + cards.length) % cards.length;
    const g = cards[current];
    poca.reset();
    q('[data-poca-img]').style.backgroundImage = `url("${g.url.replaceAll('"', '%22')}")`;
    q('[data-poca-title]').textContent = g.title;
    q('[data-poca-count]').textContent = `EDITION ${String(current + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
  }
  function openPoca(i, from) {
    opener = from;
    show(i);
    view.hidden = false;
    q('.photo-close').focus();
  }
  function closePoca() { view.hidden = true; opener?.focus(); }
  fanCards.forEach((b) => on(b, 'click', () => openPoca(Number(b.dataset.photo), b)));
  on(q('.photo-close'), 'click', closePoca);
  on(q('[data-prev]'), 'click', () => show(current - 1));
  on(q('[data-next]'), 'click', () => show(current + 1));
  on(q('[data-poca-flip]'), 'click', () => poca.flip());
  on(view, 'click', (e) => { if (e.target === view) closePoca(); });
  on(d, 'keydown', (e) => {
    if (view.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closePoca(); }
    if (e.key === 'ArrowLeft' && e.target !== pocaCard) show(current - 1);
    if (e.key === 'ArrowRight' && e.target !== pocaCard) show(current + 1);
  }, { capture: true });
  on(d, 'cancel', (e) => { if (!view.hidden) { e.preventDefault(); closePoca(); } });
}

function characterIndex(c) {
  return Math.max(0, characters.filter((x) => x.team === c.team && !x.affiliation).findIndex((x) => x.id === c.id));
}
