// ELYSIAN — LUCKY TRICK introduction page (hero cut-outs, sentinel ID deck, pictorial, photocard binder).
import { $, state } from './runtime.js';
import { listen, delay } from './lifecycle.js';
import { luckyMembers } from './lucky-data.js';

// Each agency page shares this layout; the config names the crew, agency and links.
export const luckyConfig = { members: luckyMembers, title: 'LUCKY TRICK', agency: 'ELYSIAN', agencyKo: '엘리시안', board: 'lucky', tagline: 'A new era of Awakened Artists', other: { href: 'hunterwind.html', label: 'HUNTERWIND ↗' }, communityId: { ujin: 'yujin' } };
const url = (u) => String(u).replaceAll("'", '%27');

export function renderLuckyPage(cfg = luckyConfig) {
  const MEMBERS = cfg.members;
  $('#main').innerHTML = `<div class="lt-root tw" data-lucky-page data-crew="${cfg.board}">
  <div class="lt-grain" aria-hidden="true"></div>
  <header class="lt-header sticky top-3 z-50 px-4 sm:px-8 pointer-events-none">
    <nav class="max-w-7xl mx-auto lt-glass rounded-full px-4 sm:px-7 py-3 flex items-center justify-between gap-3 pointer-events-auto" aria-label="${cfg.agencyKo} 페이지">
      <a href="entertainment.html" class="flex items-center gap-3 group shrink-0"><span class="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] group-hover:scale-125 transition"></span><span class="font-display font-extrabold text-sm sm:text-base tracking-[0.22em] text-white uppercase">${cfg.agency}</span></a>
      <div class="hidden lg:flex items-center gap-2 font-mono text-[11px] tracking-[0.28em] text-white font-semibold uppercase"><span>${cfg.title}</span></div>
      <div class="flex items-center gap-3 sm:gap-7 font-mono text-[10px] sm:text-[11px] tracking-[0.16em] uppercase overflow-x-auto">
        <button type="button" data-jump="sentinel-deck-section" class="text-white/75 hover:text-white transition whitespace-nowrap">SENTINEL ID</button>
        <button type="button" data-jump="editorial-spotlight" class="text-white/75 hover:text-white transition whitespace-nowrap">PICTORIAL</button>
        <button type="button" data-jump="photocard-binder-section" class="text-white/75 hover:text-white transition whitespace-nowrap">PHOTOCARD</button>
        <a href="community.html?board=${cfg.board}" class="hidden sm:inline text-white/75 hover:text-white transition whitespace-nowrap">FAN BOARD ↗</a>
      </div>
    </nav>
  </header>

  <section id="lt-top" class="lt-hero">
    <div data-hero-bg class="absolute inset-0 grid grid-cols-2 lg:grid-cols-4 z-0"></div>
    <div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#06070A]/80 via-transparent to-[#06070A] z-10"></div>
    <div data-hero-text class="relative z-20 pt-16 sm:pt-20 px-5 sm:px-10 max-w-7xl mx-auto w-full pointer-events-none">
      <p class="font-editorial italic text-2xl sm:text-3xl text-white/85 tracking-wide">${cfg.tagline}</p>
      <h1 class="font-display font-extrabold text-5xl sm:text-7xl lg:text-[96px] leading-[0.86] tracking-[-0.03em] text-white uppercase drop-shadow-[0_14px_35px_rgba(0,0,0,0.9)] mt-1">${cfg.title}</h1>
    </div>
    <div data-hero-cutouts class="relative z-30 flex-1 w-full max-w-[1440px] mx-auto px-2 sm:px-6 flex items-end justify-center mt-4 sm:mt-0">
      <div data-cutouts class="grid grid-cols-2 lg:grid-cols-4 w-full h-[540px] sm:h-[660px] lg:h-[740px] items-end"></div>
    </div>
    <div class="relative z-40 pb-8 px-4 sm:px-8 max-w-7xl mx-auto w-full flex justify-center">
      <div data-hero-tabs class="lt-glass rounded-full p-2 flex flex-wrap items-center justify-center gap-2" role="group" aria-label="멤버 선택"></div>
    </div>
  </section>

  <section id="sentinel-deck-section" class="relative py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto overflow-visible">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
      <h2 class="font-display font-extrabold text-3xl sm:text-5xl tracking-tight text-white uppercase">SENTINEL ID</h2>
      <div data-deck-pills class="flex flex-wrap items-center gap-2" role="group" aria-label="멤버 선택"></div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <div class="lg:col-span-7 flex flex-col items-center justify-center min-w-0">
        <div class="w-full relative"><div data-id-track class="lt-id-track"></div></div>
        <div class="mt-2 lt-glass rounded-full p-1.5 flex items-center gap-2">
          <button type="button" data-id-prev aria-label="이전 카드" class="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-sm flex items-center justify-center transition">←</button>
          <button type="button" data-id-flip class="px-5 py-2 rounded-full bg-white text-black font-mono text-xs font-bold tracking-wider uppercase hover:scale-[1.03] active:scale-95 transition">FLIP CARD ↻</button>
          <button type="button" data-id-next aria-label="다음 카드" class="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-sm flex items-center justify-center transition">→</button>
        </div>
      </div>
      <div data-dossier-panel class="lg:col-span-5 rounded-[28px] bg-[#11141C] border border-white/15 p-6 sm:p-8 shadow-2xl relative overflow-hidden"></div>
    </div>
  </section>

  <section id="editorial-spotlight" class="relative py-12 sm:py-16 px-4 sm:px-8 max-w-7xl mx-auto">
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-5 border-b border-white/10">
      <h2 data-editorial-title class="font-display font-extrabold text-3xl sm:text-5xl tracking-tight text-white uppercase">JAEIN</h2>
      <div data-editorial-tabs class="flex flex-wrap items-center gap-2" role="group" aria-label="멤버 선택"></div>
    </div>
    <div data-editorial-grid class="grid grid-cols-1 md:grid-cols-12 gap-5 lt-fade"></div>
  </section>

  <section id="photocard-binder-section" class="relative py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto overflow-visible">
    <div class="flex items-center justify-between gap-4 mb-10">
      <h2 class="font-display font-extrabold text-3xl sm:text-5xl tracking-tight text-white uppercase">PHOTOCARD</h2>
      <button type="button" data-binder-close class="hidden w-10 h-10 rounded-full bg-white/10 hover:bg-white hover:text-black border border-white/20 text-white font-mono text-sm items-center justify-center transition" aria-label="포토카드 바인더 닫기">✕</button>
    </div>
    <div class="lt-binder-stage relative">
      <div data-binder-closed class="lt-book-wrap">
        <button type="button" data-binder class="lt-book" aria-label="포토카드 바인더 열기">
          <span class="lt-book-stitch"></span>
          <span class="lt-book-spine"><i></i><i></i><i></i></span>
          <span class="lt-book-window"><span class="lt-book-photo"><span data-binder-photo class="lt-protected block w-full h-full"></span><span class="lt-book-glare"></span></span></span>
          <span data-binder-stickers class="lt-stickers"></span>
          <span data-binder-strap class="lt-book-strap"><i></i></span>
        </button>
      </div>
      <div data-binder-open class="hidden relative overflow-visible"><div data-arena class="lt-arena"></div></div>
    </div>
  </section>

  <footer class="relative z-10 border-t border-white/10 mt-12 py-10 px-4 sm:px-8 max-w-7xl mx-auto">
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
      <div class="font-display font-bold text-sm tracking-[0.24em] text-white uppercase">${cfg.agency} ENTERTAINMENT</div>
      <div class="flex items-center gap-5 font-mono text-[10px] tracking-[0.18em] uppercase"><a class="text-white/60 hover:text-white" href="community.html?board=${cfg.board}">${cfg.title} FAN BOARD ↗</a><a class="text-white/60 hover:text-white" href="${cfg.other.href}">${cfg.other.label}</a><span class="text-white/40">${cfg.title} © 2026</span></div>
    </div>
  </footer>
</div>`;
  const root = $('[data-lucky-page]');
  const q = (s) => root.querySelector(s);
  let active = 0, idFlipped = false, binderOpen = false;
  listen(root, 'contextmenu', (e) => { if (e.target.closest('.lt-protected,.lt-poca,.lt-cutout,[data-binder]')) e.preventDefault(); });
  listen(root, 'dragstart', (e) => e.preventDefault());
  root.querySelectorAll('[data-jump]').forEach((b) => listen(b, 'click', () => document.getElementById(b.dataset.jump)?.scrollIntoView({ behavior: state.motion ? 'smooth' : 'auto' })));

  // Parallax
  let ticking = false;
  const bgLayer = q('[data-hero-bg]'), textLayer = q('[data-hero-text]'), cutLayer = q('[data-hero-cutouts]');
  listen(window, 'scroll', () => {
    if (ticking || !state.motion) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      if (!root.isConnected) return;
      const sy = window.scrollY;
      if (sy < innerHeight * 1.3) {
        bgLayer.style.transform = `translate3d(0,${sy * 0.28}px,0)`;
        textLayer.style.transform = `translate3d(0,${sy * 0.16}px,0)`;
        cutLayer.style.transform = `translate3d(0,${sy * -0.07}px,0)`;
      }
    });
  }, { passive: true });

  const pill = (m, i, size) => {
    const on = i === active;
    const base = size === 'hero' ? 'px-5 py-2.5 text-xs tracking-[0.16em]' : size === 'deck' ? 'px-4 py-1.5 text-[11px] tracking-[0.14em]' : 'px-4 py-2 text-xs tracking-[0.16em]';
    const look = on ? 'bg-white text-black font-bold' + (size === 'hero' ? ' shadow-[0_6px_20px_rgba(255,255,255,0.28)]' : '') : size === 'hero' ? 'bg-transparent text-white/80 hover:text-white hover:bg-white/10' : 'bg-white/[0.06] text-white/75 hover:text-white border border-white/15';
    return `<button type="button" data-member="${i}" aria-pressed="${on}" class="${base} rounded-full font-mono uppercase transition ${look}">${size === 'editorial' ? m.nameEn : `${m.nameKo} · ${m.nameEn}`}</button>`;
  };
  const bindPills = (el) => el.querySelectorAll('[data-member]').forEach((b) => listen(b, 'click', () => select(Number(b.dataset.member))));

  function renderHero() {
    bgLayer.innerHTML = MEMBERS.map((m, i) => `<div class="lt-hero-panel ${i === active ? 'is-highlighted' : ''}"><div class="lt-hero-photo lt-protected absolute inset-0" style="background-image:url('${url(m.heroBgPhoto)}')"></div><div class="absolute inset-0 bg-gradient-to-t from-[#06070A] via-transparent to-[#06070A]/60 pointer-events-none"></div></div>`).join('');
    const cut = q('[data-cutouts]');
    cut.innerHTML = MEMBERS.map((m, i) => `<button type="button" data-member="${i}" aria-label="${m.nameKo} 선택" aria-pressed="${i === active}" style="--member-glow:${m.glowRgba};z-index:${i === active ? 35 : 20 + i}" class="lt-cutout-slot ${i === active ? 'is-active' : ''} lt-float-${i} flex flex-col justify-end items-center group"><span class="lt-cutout lt-cutout-figure" style="background-image:url('${url(m.cutoutPhoto)}')"></span><span class="absolute bottom-4 px-3.5 py-1.5 rounded-full lt-glass flex items-center gap-2 transition-transform duration-300 group-hover:scale-105"><span class="w-1.5 h-1.5 rounded-full" style="background:${m.accent}"></span><span class="font-display font-bold text-xs tracking-[0.16em] text-white uppercase">${m.nameEn}</span></span></button>`).join('');
    bindPills(cut);
    const tabs = q('[data-hero-tabs]');
    tabs.innerHTML = MEMBERS.map((m, i) => pill(m, i, 'hero')).join('');
    bindPills(tabs);
  }

  const track = q('[data-id-track]');
  function setFlip(inner, flipped) {
    inner.style.setProperty('--id-flip', flipped ? '180deg' : '0deg');
    inner.classList.toggle('is-flipped', flipped);
  }
  function renderDeck() {
    const pills = q('[data-deck-pills]');
    pills.innerHTML = MEMBERS.map((m, i) => pill(m, i, 'deck')).join('');
    bindPills(pills);
    track.innerHTML = MEMBERS.map((m, i) => {
      const on = i === active, f = on && idFlipped;
      return `<div class="lt-id-card ${on ? 'is-active' : ''}" data-card="${i}" role="button" tabindex="0" aria-label="${m.nameKo} 센티넬 ID${on ? ' — 눌러서 뒤집기' : ' 선택'}">
        <div class="lt-id-inner ${f ? 'is-flipped' : ''}" style="--id-flip:${f ? '180deg' : '0deg'}">
          <div class="lt-id-face lt-id-front p-5 flex flex-col justify-between"><div class="lt-id-glare"></div>
            <div class="relative z-10"><div class="w-14 h-2.5 rounded-full bg-black mx-auto mb-3.5 border border-white/15"></div>
              <div class="flex items-start justify-between border-b border-white/[0.12] pb-2.5"><div><div class="flex items-baseline gap-2"><span class="font-display font-extrabold text-2xl tracking-tight text-white uppercase">${m.nameEn}</span><span class="text-sm font-bold text-white/75">${m.nameKo}</span></div><div class="font-mono text-[10px] font-semibold tracking-[0.22em] text-white/55 uppercase mt-0.5">${cfg.title}</div></div>
              <div class="text-right"><div class="font-display font-extrabold text-xl leading-none text-white">${m.gradeShort}</div><div class="font-mono text-[8.5px] font-semibold tracking-widest text-white/50 mt-1">SENTINEL</div></div></div></div>
            <div class="relative z-10 flex gap-2.5 my-3.5 flex-1 min-h-0"><div class="flex-1 h-full rounded-2xl overflow-hidden relative border border-white/15 bg-[#090B0F]"><div class="lt-protected w-full h-full" style="background-image:url('${url(m.heroBgPhoto)}')"></div></div>
              <div class="w-5 shrink-0 flex flex-col items-center justify-between py-1"><span class="font-mono text-[7.5px] font-bold tracking-widest text-white/45 [writing-mode:vertical-rl]">SGIA</span><div class="lt-barcode w-3 flex-1 my-2 opacity-75"></div><span class="font-mono text-[7.5px] font-bold tracking-widest text-white/65 [writing-mode:vertical-rl]">${cfg.agency}</span></div></div>
            <div class="relative z-10"><div class="grid grid-cols-2 gap-1.5 text-[11px] mb-2.5"><div class="rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 min-w-0"><div class="font-mono text-[8px] text-white/45 uppercase">ABILITY</div><div class="font-semibold text-white truncate mt-0.5">${m.ability}</div></div><div class="rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 min-w-0"><div class="font-mono text-[8px] text-white/45 uppercase">ROLE</div><div class="font-semibold text-white truncate mt-0.5">${m.role}</div></div></div>
              <div class="flex items-center justify-between font-mono text-[9px] text-white/50 border-t border-white/10 pt-2"><span>${cfg.agency}</span><span class="text-white/85 font-semibold">${m.grade}</span></div></div>
          </div>
          <div class="lt-id-face lt-id-back p-6 flex flex-col justify-between"><div class="lt-id-glare"></div>
            <div><div class="w-14 h-2.5 rounded-full bg-black mx-auto mb-4 border border-white/15"></div>
              <div class="flex items-center justify-between border-b border-white/[0.12] pb-3"><div><div class="flex items-baseline gap-2"><h3 class="font-display font-bold text-2xl text-white uppercase">${m.nameEn}</h3><span class="text-sm font-semibold text-white/75">${m.nameKo}</span></div><span class="font-mono text-[9.5px] tracking-[0.2em] text-white/50 uppercase">${cfg.title}</span></div><span class="px-2.5 py-1 rounded-lg bg-white/10 font-mono text-xs font-bold text-white">${m.grade}</span></div>
              <div class="mt-4 space-y-2 text-xs text-white/80 leading-relaxed">${m.notes.map((l) => `<p>${l}</p>`).join('')}</div>
              <div class="mt-4 space-y-2 font-mono text-[10.5px]">${[['나이', m.age], ['외형', m.appearance], ['사용 무기', m.weapon]].map(([k, v]) => `<div class="flex justify-between gap-3 py-1.5 border-b border-white/10"><span class="text-white/45 shrink-0">${k}</span><span class="text-white text-right">${v}</span></div>`).join('')}</div></div>
            <div class="pt-3 border-t border-white/[0.12] flex items-center justify-between font-mono text-[9px] text-white/50"><span>SGIA SENTINEL</span><span class="text-white/85 font-semibold">${cfg.agency}</span></div>
          </div>
        </div></div>`;
    }).join('');
    track.querySelectorAll('.lt-id-card').forEach((card) => {
      const i = Number(card.dataset.card), inner = card.querySelector('.lt-id-inner');
      let sx = null, swiped = 0;
      const act = () => { if (i !== active) select(i); else { idFlipped = !idFlipped; setFlip(inner, idFlipped); } };
      listen(card, 'click', () => { if (Date.now() - swiped > 400) act(); });
      listen(card, 'keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
      listen(card, 'pointerdown', (e) => { sx = e.clientX; });
      listen(card, 'pointerup', (e) => { if (sx !== null && i === active && Math.abs(e.clientX - sx) > 60 && e.pointerType !== 'mouse') { swiped = Date.now(); idFlipped = !idFlipped; setFlip(inner, idFlipped); } sx = null; });
      listen(card, 'mousemove', (e) => {
        if (i !== active || !state.motion) return;
        const r = card.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width, ny = (e.clientY - r.top) / r.height;
        inner.style.setProperty('--id-rx', `${((0.5 - ny) * 16).toFixed(1)}deg`);
        inner.style.setProperty('--id-ry', `${((nx - 0.5) * 16).toFixed(1)}deg`);
        card.style.setProperty('--id-mx', `${(nx * 100).toFixed(0)}%`);
        card.style.setProperty('--id-my', `${(ny * 100).toFixed(0)}%`);
      });
      listen(card, 'mouseleave', () => { inner.style.setProperty('--id-rx', '0deg'); inner.style.setProperty('--id-ry', '0deg'); });
    });
    const m = MEMBERS[active];
    q('[data-dossier-panel]').innerHTML = `<div class="flex items-center justify-between gap-3 pb-4 border-b border-white/10"><div><div class="font-mono text-[10px] tracking-[0.22em] text-white/50 uppercase">${cfg.title}</div><div class="flex items-baseline gap-3 mt-1"><h3 class="text-3xl sm:text-4xl font-bold text-white">${m.nameKo}</h3><span class="font-display font-bold text-xl text-white/60 tracking-wider">${m.nameEn}</span></div></div><span class="shrink-0 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 font-mono text-xs font-semibold text-white">${m.grade}</span></div>
      <div class="space-y-2.5 text-xs sm:text-sm text-white/80 leading-relaxed mt-5">${m.notes.map((l) => `<p>${l}</p>`).join('')}</div>
      <div class="grid grid-cols-2 gap-2.5 mt-6">
        <div class="rounded-2xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5"><div class="font-mono text-[9.5px] tracking-[0.14em] text-white/45 uppercase">나이 · 역할</div><div class="text-xs sm:text-[13px] font-semibold text-white mt-0.5">${m.age} · ${m.role}</div></div>
        <div class="rounded-2xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5"><div class="font-mono text-[9.5px] tracking-[0.14em] text-white/45 uppercase">능력</div><div class="text-xs sm:text-[13px] font-semibold text-white mt-0.5">${m.ability}</div></div>
        <div class="col-span-2 rounded-2xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5"><div class="font-mono text-[9.5px] tracking-[0.14em] text-white/45 uppercase">외형</div><div class="text-xs sm:text-[13px] font-medium text-white/90 mt-0.5">${m.appearance}</div></div>
        <div class="col-span-2 rounded-2xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5"><div class="font-mono text-[9.5px] tracking-[0.14em] text-white/45 uppercase">사용 무기 · 위치</div><div class="text-xs sm:text-[13px] font-medium text-white/90 mt-0.5">${m.weapon} · ${m.location}</div></div>
      </div>
      <a href="community.html?board=${cfg.board}&member=${cfg.communityId[m.id] || m.id}" class="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/15 font-mono text-[11px] tracking-[0.12em] text-white/80 hover:text-white hover:bg-white/10 transition uppercase">커뮤니티 프로필 · 피드 ↗</a>`;
  }
  function centerCard(i) {
    const card = track.querySelector(`[data-card="${i}"]`);
    if (!card) return;
    track.scrollTo({ left: card.offsetLeft - (track.clientWidth - card.clientWidth) / 2, behavior: state.motion ? 'smooth' : 'auto' });
  }

  function renderEditorial() {
    const m = MEMBERS[active];
    q('[data-editorial-title]').textContent = m.nameEn;
    const tabs = q('[data-editorial-tabs]');
    tabs.innerHTML = MEMBERS.map((mm, i) => pill(mm, i, 'editorial')).join('');
    bindPills(tabs);
    const grid = q('[data-editorial-grid]');
    grid.classList.remove('lt-fade');
    void grid.offsetWidth;
    grid.classList.add('lt-fade');
    const p = m.editorialPhotos;
    grid.innerHTML = `<div class="md:col-span-6 lt-editorial h-[440px] sm:h-[520px] bg-[#0F1218]"><div class="lt-protected w-full h-full" style="background-image:url('${url(p[0].url)}')"></div><div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent"></div><div class="pointer-events-none absolute bottom-5 left-5"><div class="font-display font-extrabold text-3xl text-white uppercase">${m.nameEn}</div></div></div>
      <div class="md:col-span-3 lt-editorial h-[360px] md:h-[520px] bg-[#0F1218]"><div class="lt-protected w-full h-full" style="background-image:url('${url(p[1].url)}')"></div></div>
      <div class="md:col-span-3 lt-editorial h-[360px] md:h-[520px] bg-[#0F1218]"><div class="lt-protected w-full h-full" style="background-image:url('${url(p[2].url)}')"></div></div>`;
  }

  const book = q('[data-binder]');
  function updateBinder() {
    const m = MEMBERS[active];
    book.style.background = m.binderBg;
    book.style.setProperty('--binder-glow', m.binderGlow);
    q('[data-binder-strap]').style.background = m.binderStrapBg;
    q('[data-binder-photo]').style.backgroundImage = `url('${url(m.photocards[0].url)}')`;
    q('[data-binder-stickers]').innerHTML = m.stickersHtml;
  }
  function renderPhotocards() {
    const m = MEMBERS[active], arena = q('[data-arena]');
    const mid = (m.photocards.length - 1) / 2;
    arena.innerHTML = m.photocards.map((card, i) => {
      const o = i - mid;
      return `<button type="button" class="lt-poca-slot" data-poca="${i}" aria-label="포토카드 ${i + 1} 뒤집기" aria-pressed="false" style="--ty:${Math.abs(o) * 4.5}px;--rot:${Math.max(-18, Math.min(18, o * 3.4))}deg;z-index:${10 + i}"><span class="lt-poca-body"><span class="lt-poca-face lt-poca lt-poca-front" style="background-image:url('${url(card.url)}')"><span class="lt-poca-sheen"></span></span><span class="lt-poca-face lt-poca-back"><span class="font-editorial italic text-base sm:text-lg tracking-[0.14em] text-white/95 uppercase leading-snug">${card.label}</span></span></span></button>`;
    }).join('');
    arena.querySelectorAll('.lt-poca-slot').forEach((slot, i) => {
      delay(() => slot.classList.add('is-dealt'), state.motion ? 45 * i : 0);
      const body = slot.querySelector('.lt-poca-body');
      let flipped = false;
      listen(slot, 'click', () => { flipped = !flipped; body.style.setProperty('--flip', flipped ? '180deg' : '0deg'); body.classList.toggle('is-flipped', flipped); slot.setAttribute('aria-pressed', String(flipped)); });
      listen(slot, 'mousemove', (e) => {
        if (!state.motion) return;
        const r = slot.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width, ny = (e.clientY - r.top) / r.height;
        body.style.setProperty('--tilt-x', `${((0.5 - ny) * 18).toFixed(1)}deg`);
        body.style.setProperty('--tilt-y', `${((nx - 0.5) * 18).toFixed(1)}deg`);
        slot.style.setProperty('--glare-x', `${(nx * 100).toFixed(0)}%`);
        slot.style.setProperty('--glare-y', `${(ny * 100).toFixed(0)}%`);
      });
      listen(slot, 'mouseleave', () => { body.style.setProperty('--tilt-x', '0deg'); body.style.setProperty('--tilt-y', '0deg'); });
    });
  }
  const closeBtn = q('[data-binder-close]');
  function openBinder() {
    binderOpen = true;
    q('[data-binder-closed]').classList.add('hidden');
    q('[data-binder-open]').classList.remove('hidden');
    closeBtn.classList.remove('hidden');
    closeBtn.classList.add('flex');
    renderPhotocards();
    closeBtn.focus({ preventScroll: true });
  }
  function closeBinder() {
    binderOpen = false;
    q('[data-binder-open]').classList.add('hidden');
    closeBtn.classList.add('hidden');
    closeBtn.classList.remove('flex');
    q('[data-binder-closed]').classList.remove('hidden');
    book.focus({ preventScroll: true });
  }
  listen(book, 'click', openBinder);
  listen(closeBtn, 'click', closeBinder);

  function select(i) {
    active = (i + MEMBERS.length) % MEMBERS.length;
    idFlipped = false;
    renderHero();
    renderDeck();
    renderEditorial();
    updateBinder();
    centerCard(active);
    if (binderOpen) renderPhotocards();
  }
  listen(q('[data-id-flip]'), 'click', () => { idFlipped = !idFlipped; const inner = track.querySelector('.lt-id-card.is-active .lt-id-inner'); if (inner) setFlip(inner, idFlipped); });
  listen(q('[data-id-prev]'), 'click', () => select(active - 1));
  listen(q('[data-id-next]'), 'click', () => select(active + 1));
  select(0);
}
