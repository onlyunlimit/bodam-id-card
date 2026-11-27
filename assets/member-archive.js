// Personnel file: a floating badge over the blurred page; tapping it brings out the paper
// record (front: dossier, back: guestbook paper) and the member's photocard deck.
import { esc, modal, state } from './runtime.js';
import { serviceConfig } from './service-config.js';
import { teams } from './model.js';
import { personName } from './i18n.js';
import { memberFacts, zionCards, galleryTitle } from './member-archive-data.js';
import { badgeFaces, badgeTeams, gradeLabel, heightOf, locationOf, fitBadges } from './id-badge.js';

const fonts = [
  ['hand', '손글씨 펜체'],
  ['memo', '자유 메모체'],
  ['serif', '명조체'],
  ['sans', '고딕체'],
  ['mono', '타자기체'],
];
const inks = [
  ['#1F2430', '먹색'],
  ['#1E3A8A', '파란 잉크'],
  ['#9E1B24', '빨간 잉크'],
  ['#2F5D3A', '초록 잉크'],
  ['#6B6B6B', '연필'],
];
// Notes saved while the guestbook was a chalkboard used light chalk colours; draw them in ink on paper.
const chalkToInk = { '#f4f1ea': '#1F2430', '#eee6cf': '#1F2430', '#f2a7a7': '#9E1B24', '#a9c8f0': '#1E3A8A', '#c9e4a6': '#2F5D3A', '#f5de8a': '#7A5C12' };
const inkOf = (color = '') => chalkToInk[color.toLowerCase()] || color || inks[0][0];
const SIZE = { min: 10, max: 28, base: 14 };
const clampSize = (n) => Math.round(Math.max(SIZE.min, Math.min(SIZE.max, Number(n) || SIZE.base)));
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
    ? `<figure class="ma-memo ma-sticky" style="--r:${i % 2 ? 0.7 : -0.9}deg"><p class="font-pen">“${esc(text)}”</p><figcaption>— ${esc(by)}</figcaption></figure>`
    : `<figure class="ma-memo ma-ink ma-${kind}" style="--r:${[-1.2, 0.8, -0.4, 1.1][i % 4]}deg"><p class="font-pen">${esc(text)}</p><svg class="ma-scrawl" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true"><path d="M2 8 C40 3 80 11 120 6 S180 4 198 7"/></svg><figcaption>— ${esc(by)}</figcaption></figure>`;

export function memberArchive(c) {
  sheet();
  const team = teams.find((t) => t.id === c.team);
  const bt = badgeTeams[c.team];
  const facts = memberFacts[c.id] || {};
  const cards = cardsFor(c);
  const berserk = c.gallery?.find((g) => /역안/.test(g.label))?.url;
  const local = esc(personName(c));
  const code = esc(c.code);
  const height = heightOf(c);
  const [front, back] = badgeFaces(c, { open: true, status: 'ACTIVE' });
  const observation = facts.observation || [`${c.appearance}. ${c.bio} 주요 능력은 `, facts.highlight || c.ability, `. ${c.notes || ''}`];
  const fields = [
    ['NAME', `${local} · ${code}`],
    ['TEAM', `${esc(team.name)} (${esc(team.en)}) · ${bt.color}`],
    ['CLASS', esc(gradeLabel(c))],
    ['AGE · BIRTHDAY', `${c.age ? esc(c.age) + '세' : '미공개'}${facts.birthday ? ' · ' + esc(facts.birthday) : ''}`],
    ['HEIGHT', height ? esc(height) + (facts.build ? ' · ' + esc(facts.build) : '') : '미공개'],
    ['LOCATION', esc(locationOf(c))],
    ['ABILITY', esc(c.ability)],
  ];
  const html = `<article class="member-archive ma-root tw" data-team="${c.team}" data-member="${esc(c.id)}" data-stage="badge">
  <div class="ma-desk">
   <div class="ma-card-col">
    <div class="ma-card-stage"><button type="button" class="ma-card idc-host" data-team="${c.team}" data-card="badge" aria-label="${local} 사원증. 누르면 인사기록 열람, 좌우로 밀면 회전" aria-pressed="false"><span class="ma-card-pivot"><span class="ma-face ma-face-front">${front}</span><span class="ma-face ma-face-back">${back}</span></span></button></div>
    ${berserk ? `<button type="button" class="ma-mode" data-mode aria-pressed="false"><i aria-hidden="true"></i>역안</button>` : ''}
   </div>
   <div class="ma-file" hidden>
    <div class="ma-dossier-stage"><div class="ma-dossier" data-dossier tabindex="0" aria-label="${local} 인사기록. 좌우로 밀거나 방향키로 뒷면 방명록 보기">
     <article class="ma-paper ma-paper-front paper-front" aria-hidden="false">
      <header class="ma-paper-head"><div><span class="ma-eyebrow">SGIA PERSONNEL ARCHIVE · ${esc(team.en)}</span><h4>PERSONNEL RECORD</h4></div><span class="ma-classified">TOP SECRET</span></header>
      <p class="ma-directive">“${esc(facts.directive || team.description)}”</p>
      <div class="ma-paper-grid">
       <dl class="ma-fields">${fields.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
       <div class="ma-clip-col"><svg class="ma-clip" viewBox="0 0 32 52" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M10 14v24a6 6 0 0 0 12 0V10a4 4 0 0 0-8 0v26a2 2 0 0 0 4 0V15" stroke-linecap="round"/></svg><div class="ma-polaroid"><div class="ma-polaroid-photo" data-clip-photo role="img" aria-label="첨부 증명사진" style="${bg(c.portrait)}"></div></div></div>
      </div>
      <section class="ma-observe"><h5>PHYSICAL &amp; FIELD OBSERVATION</h5><p>${esc(observation[0])}<mark class="ma-hl">${esc(observation[1])}</mark>${esc(observation[2])}</p></section>
      <section class="ma-notes"><div class="ma-notes-head"><h5>FIELD NOTES · 비공식 관찰 메모</h5><span class="font-pen">${esc(facts.warning || '※ 외부 반출 금지')}</span></div><div class="ma-memos">${(facts.notes || [['pencil', c.notes || c.bio, '기록관']]).map(memo).join('')}</div></section>
      <button type="button" class="ma-corner" data-paper-flip aria-label="뒷면 방명록으로 넘기기"></button>
     </article>
     <article class="ma-paper ma-paper-back paper-back" aria-hidden="true">
      <header class="ma-back-head"><span class="ma-eyebrow">VISITOR LOG · ${code}</span><span class="ma-eyebrow"><span data-count>0</span> NOTES</span></header>
      <div class="guest-board ma-sheet" aria-label="방명록 종이"></div>
      <form class="guest-form">
       <div class="ma-form-grid">
        <label><span class="ma-label">NAME</span><input name="author" maxlength="24" placeholder="익명" class="ma-input"></label>
        <label><span class="ma-label">FONT</span><select name="font" class="ma-input">${fonts.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select></label>
        <fieldset><legend class="ma-label">INK</legend><div class="ma-swatches">${inks.map(([v, l], i) => `<button type="button" class="ma-swatch" data-ink="${v}" style="--ink:${v}" aria-label="${l}" aria-pressed="${i === 0}"></button>`).join('')}</div></fieldset>
        <label class="ma-size"><span class="ma-label">SIZE <output data-size-out>${SIZE.base}</output></span><span class="ma-size-row"><button type="button" data-size-step="-1" aria-label="글자 작게">−</button><input type="range" name="size" min="${SIZE.min}" max="${SIZE.max}" step="1" value="${SIZE.base}" aria-label="글자 크기"><button type="button" data-size-step="1" aria-label="글자 크게">+</button></span></label>
       </div>
       <div class="ma-write"><input name="message" maxlength="100" required placeholder="${local}에게 남길 한마디" class="ma-input"><button type="submit" class="ma-save">남기기</button></div>
       <p class="ma-form-hint">입력하면 종이에 나타납니다. 끌어서 위치를, 두 손가락이나 SIZE로 크기를 정한 뒤 남기세요.</p>
       <output class="ma-output" aria-live="polite"></output>
      </form>
      <button type="button" class="ma-corner" data-paper-flip aria-label="앞면 인사기록으로 넘기기"></button>
     </article>
    </div></div>
   </div>
  </div>
  <section class="ma-deck" hidden aria-label="포토카드 ${cards.length}장"><div class="ma-arena" data-fan>${cards.map((g, i) => `<button type="button" class="ma-fan-card ma-poca-slot" data-photo="${i}" aria-label="포토카드 ${i + 1} 뒤집기" aria-pressed="false"><span class="ma-poca-body"><span class="ma-poca-face ma-poca-front"><span class="ma-poca-img" style="${bg(g.url)}"></span><span class="ma-holo" aria-hidden="true"></span></span><span class="ma-poca-face ma-poca-back"><span class="ma-poca-title">${esc(g.title)}</span></span></span></button>`).join('')}</div></section>
 </article>`;
  const d = modal(c.code, html, 'member-archive');
  const root = d.querySelector('.member-archive');
  const q = (s) => root.querySelector(s);
  const qa = (s) => [...root.querySelectorAll(s)];
  const abort = new AbortController();
  const on = (el, type, fn, opts = {}) => el.addEventListener(type, fn, { ...opts, signal: abort.signal });
  const timers = new Set();
  const later = (fn, ms) => {
    const id = setTimeout(() => { timers.delete(id); if (root.isConnected) fn(); }, state.motion ? ms : 0);
    timers.add(id);
  };
  const unfit = fitBadges(root);
  on(d, 'close', () => { abort.abort(); unfit(); timers.forEach(clearTimeout); }, { once: true });
  on(root, 'contextmenu', (e) => { if (e.target.closest('.ma-poca-img,.idc-photo,.ma-polaroid-photo')) e.preventDefault(); });
  on(root, 'dragstart', (e) => e.preventDefault());
  // Empty space around the floating pieces closes the file, like any popup.
  on(root, 'click', (e) => { if (e.target === root || e.target.classList.contains('ma-desk') || e.target.classList.contains('ma-deck')) d.close(); });
  const refit = () => requestAnimationFrame(() => qa('.idc-host').forEach((f) => f.clientWidth && f.style.setProperty('--idc-s', String(f.clientWidth / 390))));

  function openFile() {
    if (root.dataset.stage === 'file') return;
    root.dataset.stage = 'file';
    q('.ma-file').hidden = false;
    q('.ma-deck').hidden = false;
    refit();
    layoutDeck();
    later(deal, 380);
  }

  // ----- Shared 3D turn with drag-follow (badge, paper, photocards) -----
  function turnable(el, pivot, { onTap, onFlip, ignore = '' } = {}) {
    let flipped = false, start = null, angle = 0, moved = false;
    const width = () => el.getBoundingClientRect().width || 300;
    const set = (deg, animate) => {
      pivot.style.transition = animate ? '' : 'none';
      pivot.style.transform = `rotateY(${deg}deg)`;
      const a = ((Math.abs(deg) % 360) + 360) % 360;
      if (!animate) el.classList.toggle('is-back', a > 90 && a < 270);
    };
    const apply = (value, animate = true) => {
      flipped = value;
      el.classList.toggle('is-flipped', flipped);
      el.classList.toggle('is-back', flipped);
      if (el.tagName === 'BUTTON') el.setAttribute('aria-pressed', String(flipped));
      set(flipped ? -180 : 0, animate);
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
      angle = Math.max(-200, Math.min(200, (flipped ? -180 : 0) + (dx / width()) * 180));
      set(angle, false);
    });
    const end = (e) => {
      if (!start || start.id !== e.pointerId) return;
      const wasMoved = moved;
      start = null;
      el.classList.remove('is-dragging');
      if (!wasMoved) return;
      el.dataset.swiped = String(Date.now());
      apply(Math.abs(angle - (flipped ? -180 : 0)) > 55 ? !flipped : flipped);
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
  const badge = turnable(q('[data-card=badge]'), q('[data-card=badge] .ma-card-pivot'), {
    onTap: () => (root.dataset.stage === 'file' ? badge.flip() : openFile()),
  });

  const dossier = q('[data-dossier]');
  const paper = turnable(dossier, dossier, {
    ignore: 'button,input,select,textarea,label,form,.ma-sheet',
    onTap: () => {},
    onFlip: (f) => {
      q('.paper-front').setAttribute('aria-hidden', String(f));
      q('.paper-back').setAttribute('aria-hidden', String(!f));
      q('.paper-front').inert = f;
      q('.paper-back').inert = !f;
    },
  });
  q('.paper-back').inert = true;
  qa('[data-paper-flip]').forEach((b) => on(b, 'click', (e) => { e.stopPropagation(); paper.flip(); }));

  if (berserk) {
    const toggle = q('[data-mode]');
    on(toggle, 'click', () => {
      const active = toggle.getAttribute('aria-pressed') !== 'true';
      toggle.setAttribute('aria-pressed', String(active));
      root.classList.toggle('berserk-mode', active);
      const url = (active ? berserk : c.portrait).replaceAll('"', '%22');
      q('[data-card=badge] .ma-face-front [data-badge-photo]').style.backgroundImage = `url("${url}")`;
      q('[data-clip-photo]').style.backgroundImage = `url("${url}")`;
      q('[data-card=badge] .ma-face-front [data-badge-status]').textContent = active ? 'BERSERK' : 'ACTIVE';
    });
  }

  // ----- Guestbook written on the back of the paper -----
  const board = q('.ma-sheet'), form = q('.guest-form'), out = q('.ma-output');
  const sizeInput = form.elements.size, sizeOut = q('[data-size-out]');
  let ink = inks[0][0], pending = null, pos = { x: 0.3, y: 0.4 };
  const scaleSheet = () => board.style.setProperty('--gb-s', String((board.clientWidth || 600) / 600));
  const place = (el, p) => { el.style.left = `${p.x * 82}%`; el.style.top = `${p.y * 88}%`; };
  function note(n, mine = false) {
    const el = document.createElement('span');
    el.className = 'ma-ink-note' + (mine ? ' pending' : '');
    el.dataset.font = n.font;
    el.dataset.userContent = '';
    el.style.color = inkOf(n.color);
    el.style.setProperty('--size', String(clampSize(n.size)));
    place(el, n);
    const msg = document.createElement('span');
    msg.textContent = n.message;
    const by = document.createElement('small');
    by.textContent = `— ${n.author}`;
    el.append(msg, by);
    board.append(el);
    return el;
  }
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
    notes.forEach((n) => note(n));
    q('[data-count]').textContent = String(notes.length);
    if (pending) board.append(pending);
  }
  load();
  const setSize = (n) => {
    const v = clampSize(n);
    sizeInput.value = String(v);
    sizeOut.textContent = String(v);
    pending?.style.setProperty('--size', String(v));
  };
  function refreshPending() {
    const message = form.message.value.trim();
    if (!message) { pending?.remove(); pending = null; return; }
    const data = { author: form.author.value.trim() || '익명', message, font: form.font.value, color: ink, size: sizeInput.value, ...pos };
    if (!pending) {
      pending = note(data, true);
      pending.tabIndex = 0;
      pending.setAttribute('role', 'button');
      pending.setAttribute('aria-label', '내 메모. 끌거나 방향키로 이동, +/- 키로 크기 조절');
      bindNote(pending);
    } else {
      pending.dataset.font = data.font;
      pending.style.color = data.color;
      pending.style.setProperty('--size', String(clampSize(data.size)));
      pending.firstChild.textContent = data.message;
      pending.lastChild.textContent = `— ${data.author}`;
    }
  }
  // One finger drags the note, two fingers pinch its size (trackpad pinch arrives as ctrl + wheel).
  const touches = new Map();
  let pinch = null, grab = null;
  const move = (x, y) => { pos = { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) }; place(pending, pos); };
  const gap = () => { const [a, b] = [...touches.values()]; return Math.hypot(a.x - b.x, a.y - b.y) || 1; };
  function bindNote(el) {
    el.addEventListener('keydown', (e) => {
      const k = { ArrowLeft: [-0.025, 0], ArrowRight: [0.025, 0], ArrowUp: [0, -0.03], ArrowDown: [0, 0.03] }[e.key];
      if (k) { e.preventDefault(); move(pos.x + k[0], pos.y + k[1]); }
      if (['+', '='].includes(e.key)) { e.preventDefault(); setSize(Number(sizeInput.value) + 1); }
      if (['-', '_'].includes(e.key)) { e.preventDefault(); setSize(Number(sizeInput.value) - 1); }
    });
  }
  on(board, 'pointerdown', (e) => {
    if (!pending) return;
    touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    board.setPointerCapture?.(e.pointerId);
    if (touches.size === 2) { pinch = { d: gap(), size: Number(sizeInput.value) }; grab = null; return; }
    const b = board.getBoundingClientRect();
    if (e.target.closest('.ma-ink-note.pending')) {
      const r = pending.getBoundingClientRect();
      grab = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    } else {
      grab = { dx: 0, dy: 0 };
      move((e.clientX - b.left) / (b.width * 0.82), (e.clientY - b.top) / (b.height * 0.88));
    }
    pending.classList.add('grabbing');
  });
  on(board, 'pointermove', (e) => {
    if (!pending || !touches.has(e.pointerId)) return;
    touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && touches.size >= 2) { setSize(pinch.size * (gap() / pinch.d)); return; }
    if (!grab) return;
    const b = board.getBoundingClientRect();
    move((e.clientX - grab.dx - b.left) / (b.width * 0.82), (e.clientY - grab.dy - b.top) / (b.height * 0.88));
  });
  const lift = (e) => {
    touches.delete(e.pointerId);
    if (touches.size < 2) pinch = null;
    if (!touches.size) { grab = null; pending?.classList.remove('grabbing'); }
  };
  on(board, 'pointerup', lift);
  on(board, 'pointercancel', lift);
  on(board, 'wheel', (e) => {
    if (!pending || !e.ctrlKey) return;
    e.preventDefault();
    setSize(Number(sizeInput.value) * (1 - e.deltaY / 120));
  }, { passive: false });
  on(sizeInput, 'input', () => setSize(sizeInput.value));
  qa('[data-size-step]').forEach((b) => on(b, 'click', () => setSize(Number(sizeInput.value) + Number(b.dataset.sizeStep))));
  ['input', 'change'].forEach((t) => on(form, t, (e) => { if (e.target.name && e.target.name !== 'size') refreshPending(); }));
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
        body: JSON.stringify({ character: c.id, author: form.author.value.trim() || '익명', message: form.message.value.trim(), font: form.font.value, color: ink, size: clampSize(sizeInput.value), ...pos }),
        signal: abort.signal,
      });
      if (!r.ok) throw Error();
      if (!root.isConnected) return;
      pending?.remove();
      pending = null;
      form.message.value = '';
      out.textContent = '종이에 남겼습니다.';
      await load();
    } catch (err) {
      if (err.name !== 'AbortError' && root.isConnected) out.textContent = '저장하지 못했습니다. 잠시 후 다시 시도해 주세요.';
    } finally {
      button.disabled = false;
    }
  });

  // ----- Photocards: dealt into an overlapping fan, flipped in place -----
  const arena = q('[data-fan]');
  const slots = qa('.ma-poca-slot');
  function layoutDeck() {
    if (!arena.clientWidth) return;
    slots.forEach((el) => { el.style.removeProperty('--rot'); el.style.removeProperty('--ty'); });
    const rows = [];
    slots.forEach((el) => {
      const top = el.offsetTop;
      const row = rows.find((r) => Math.abs(r.top - top) < 20);
      row ? row.items.push(el) : rows.push({ top, items: [el] });
    });
    rows.forEach(({ items }) => {
      const mid = (items.length - 1) / 2;
      items.forEach((el, i) => {
        const o = i - mid;
        el.style.setProperty('--rot', `${Math.max(-14, Math.min(14, o * 3.2))}deg`);
        el.style.setProperty('--ty', `${Math.abs(o) * 4}px`);
      });
    });
    slots.forEach((el, i) => { el.style.zIndex = String(10 + i); });
  }
  function deal() { slots.forEach((el, i) => later(() => el.classList.add('is-dealt'), i * 45)); }
  // Touch screens have no hover: a tap brings the card to the centre, large; a sideways
  // swipe turns it over (same curve as the Lucky Trick cards). Mouse users flip in place.
  const touchMode = () => matchMedia('(hover: none), (max-width: 899px)').matches;
  // Its own modal dialog: the top layer escapes the personnel dialog's containing block.
  const zoom = document.createElement('dialog');
  zoom.className = 'ma-poca-zoom tw';
  zoom.setAttribute('aria-label', '포토카드 크게 보기');
  zoom.innerHTML = '<button type="button" class="ma-poca-zoom-card" aria-label="포토카드 크게 보기. 옆으로 밀면 뒤집힙니다" aria-pressed="false"><span class="ma-poca-body ma-zoom-pivot"><span class="ma-poca-face ma-poca-front"><span class="ma-poca-img" data-zoom-img></span><span class="ma-holo" aria-hidden="true"></span></span><span class="ma-poca-face ma-poca-back"><span class="ma-poca-title" data-zoom-title></span></span></span></button>';
  root.append(zoom);
  const zoomCard = zoom.querySelector('.ma-poca-zoom-card');
  const zoomTurn = turnable(zoomCard, zoomCard.querySelector('.ma-zoom-pivot'));
  let zoomFrom = null;
  const closeZoom = () => { if (zoom.open) zoom.close(); };
  on(zoom, 'close', () => zoomFrom?.focus({ preventScroll: true }));
  on(d, 'close', closeZoom, { once: true });
  on(zoom, 'click', (e) => { if (e.target === zoom) closeZoom(); });
  slots.forEach((el, i) => on(el, 'click', () => {
    if (touchMode()) {
      zoomFrom = el;
      zoom.querySelector('[data-zoom-img]').setAttribute('style', bg(cards[i].url).replaceAll('&quot;', '"'));
      zoom.querySelector('[data-zoom-title]').textContent = cards[i].title;
      zoomTurn.reset();
      zoom.showModal();
      zoomCard.focus({ preventScroll: true });
      return;
    }
    const body = el.querySelector('.ma-poca-body');
    const flipped = !body.classList.contains('is-flipped');
    body.classList.toggle('is-flipped', flipped);
    el.setAttribute('aria-pressed', String(flipped));
  }));
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => { layoutDeck(); scaleSheet(); });
    ro.observe(arena);
    ro.observe(board);
    on(d, 'close', () => ro.disconnect(), { once: true });
  }
  scaleSheet();
  q('[data-card=badge]').focus({ preventScroll: true });
}
