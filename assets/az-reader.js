// AZ classified case file: sealed folder, page-turning sheets, UV inspection and a small clue hunt.
// The keypad and route tracking that lead here stay in monitor.js / evidence.js.
import { modal, state } from './runtime.js';

const IMG = {
  cover: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim/77517bd6-150a-48b5-b0cf-17a1cb2e2742?v=2c4d1d',
  paper: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim/6f229be7-3f5e-47ba-9918-c464fe6a0394?v=44ab7a',
  stamp: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim/d4aa025a-f4e2-4ee5-bac7-cc56c079b13b?v=b8dceb',
  seal: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim/53175fa3-84ee-4f30-91e4-dd6defea091f?v=dedc46',
  suspect: 'https://cdn.caveduck.io/charim-standard/631d30d1-4080-47fd-b0e2-86e45192ff87?v=a11dbd',
};
const NEED = 3;
// The reverse of a turned sheet is plain paper: nothing from the front may show through.
const back = () => `<div class="az-sheet-back" aria-hidden="true"></div>`;
const trace = (id, label, cls = '') => `<button type="button" class="az-trace ${cls}" data-trace="${id}" aria-label="${label}"><span aria-hidden="true"></span></button>`;
const pen = (text, cls = '') => `<p class="az-pen ${cls}" aria-hidden="false">${text}</p>`;

const sheets = [
  // 01 — subject identification
  `<article class="az-sheet" data-page="1"><div class="az-sheet-front az-page"><div>
    <div class="az-doc-head"><div><div class="az-meta">SUBJECT IDENTIFICATION // 01</div><h2 class="az-doc-title">수배 기록: 에이지 (AZ)</h2></div><span class="az-code">WANTED // AT LARGE</span></div>
    <div class="az-profile"><div class="az-photo"><div class="az-photo-in" role="img" aria-label="에이지(AZ) 관측 이미지" style="background-image:url('${IMG.suspect}')"><span class="az-photo-cap">CCTV / WITNESS RECON</span></div>${trace('print', '사진 모서리의 얼룩 확인', 'az-trace-print')}</div>
     <div class="az-specs">${[['코드명', '에이지 / AZ (본명 미상)'], ['신원 추정', '미상'], ['소속', 'ORPÉ (단, 철저한 개인 행동)'], ['등급/역할', '측정 불가 센티넬 (가이딩 겸용)'], ['검거 현황', '<b class="az-red">추적 실패 (상습 도주)</b>']].map(([k, v]) => `<div class="az-spec"><span>${k}</span><span>${v}</span></div>`).join('')}</div></div>
    <div class="az-section"><div class="az-label">WITNESS RECORD (목격자 진술)</div><p class="az-body">공식 생체 데이터가 없습니다. 목격자 진술이 서로 맞지 않아 인상착의는 확정하지 않았습니다. <button type="button" class="az-redacted" aria-label="검열선 해제">진술서 원본 14건 중 9건 폐기</button></p>
     <div class="az-witness">"말수가 극단적으로 적었다. 내가 내 입으로 '그는 여기 없다'고 말할 때까지 아무 제지도 하지 않았다."<span>— [증언 #07] 제2관할 순찰 요원 진술서 발췌 (검은 검열선을 눌러 해제)</span></div></div>
    ${pen('얼굴은 다들 기억하는데<br>목소리는 아무도 기억 못 함. 왜?', 'az-pen-1')}
    <div class="az-uv">[UV 감식 메모] 목격 시각 14건 중 9건이 서로 겹침. 같은 시각, 다른 장소. 진술 자체가 조작됐을 가능성.</div>
   </div><div class="az-doc-foot"><span>SGIA TRACKING TEAM 'BEACON' ARCHIVE</span><span>PAGE 01 / 04</span></div></div>${back('01-B', 'PROPERTY OF SGIA — DO NOT COPY')}</article>`,
  // 02 — ORPÉ
  `<article class="az-sheet" data-page="2"><div class="az-sheet-front az-page"><div>
    <div class="az-doc-head"><div><div class="az-meta">SYNDICATE DOSSIER // 02</div><h2 class="az-doc-title">극단주의 범죄 카르텔: ORPÉ</h2></div><span class="az-code">THREAT: CRITICAL</span></div>
    <div class="az-section"><div class="az-label">ORIGIN &amp; STRUCTURE</div><p class="az-body">SGIA(국가 각성자 통합관리청) 출범 및 등록제·등급제 강제 이후, 체제에 반발한 <strong>탈영 센티넬, 미등록 가이드, 불법 연구자</strong>들이 규합해 설립한 거대 범죄 조직.</p></div>
    <div class="az-contrast"><div class="az-label-s">SURFACE IDEOLOGY (표면적 명분)</div><p>"각성자의 절대적 자유와 관리청 체제로부터의 해방"</p></div>
    <div class="az-section"><div class="az-label">CONFIRMED ATROCITIES (실상 및 6대 범죄)</div><div class="az-crimes">${['비인가 가이딩 착취', '불법 가이딩 유통', '게이트 무단 밀렵·토벌', '불법 인체 개조 실험', '고위험 생체 병기 제조', '각성관 해킹·약물 갈취'].map((x) => `<div>${x}</div>`).join('')}</div></div>
    ${trace('receipt', '찢어진 송금 전표 확인', 'az-trace-receipt')}
    ${pen('조직도에 AZ 자리 없음.<br>간부? 외주? 아무도 모름', 'az-pen-2')}
    <div class="az-uv">[UV 감식 메모] ORPÉ 내부 자금 흐름 추적 결과, 에이지(AZ)는 상부 명령 계통을 무시하고 단독 작전만 수행 중.</div>
   </div><img class="az-stamp-img" src="${IMG.stamp}" alt="UNVERIFIED 도장" draggable="false"><div class="az-doc-foot"><span>STATE AWAKENED INTEGRATED ADMINISTRATION</span><span>PAGE 02 / 04</span></div></div>${back('02-B', 'EYES ONLY — LEVEL 1 CLEARANCE')}</article>`,
  // 03 — ability
  `<article class="az-sheet" data-page="3"><div class="az-sheet-front az-page"><div>
    <div class="az-doc-head"><div><div class="az-meta">ANOMALY ANALYSIS // 03</div><h2 class="az-doc-title">능력 분석: 거짓 증언 &amp; 수치심 환산</h2></div><span class="az-code">CLASS: UNMEASURED</span></div>
    <div class="az-specs az-specs-wide">${[['포지션', '측정 불가 등급 센티넬 (동시에 가이딩 파장 방출 관측)'], ['유효 반경', '직경 4km (반경 <strong>2km</strong> 내 대상 구강 강제 동기화)'], ['부수 권능', '수치심 환산 (상대의 심리적 굴욕감을 에너지로 전환 추정)']].map(([k, v]) => `<div class="az-spec"><span>${k}</span><span>${v}</span></div>`).join('')}</div>
    <div class="az-section"><div class="az-label">MECHANISM OF 'FALSE TESTIMONY'</div><p class="az-body">능력 발동 시 대상의 <strong>의식과 사고는 완전히 또렷한 상태</strong>로 유지되나, 성대와 입술 근육만 에이지의 발화와 실시간 동기화됨. 대상은 자신이 허위 증언을 내뱉는 것을 인지하면서도 통제하지 못해 극심한 패닉과 답답함을 호소함.</p></div>
    <div class="az-sim"><div class="az-sim-head"><span>[2KM 동기화 증언 시뮬레이션]</span><button type="button" class="az-sim-btn" data-sync aria-pressed="false">동기화 발동</button></div><div class="az-sim-out" data-sim><small>피해 요원 의식 상태: 명료함 (통제권 정상)</small><p>"용의자 AZ가 북쪽 환기구로 도주했습니다! 즉시 지원 바랍니다!"</p></div></div>
    ${trace('dent', '연필 눌린 자국 확인 (UV에서 잘 보임)', 'az-trace-dent az-uv-only')}
    ${pen('2km 밖에서 무전 받을 것!!', 'az-pen-3')}
    <div class="az-uv">[UV 감식 메모] 피해자 증언: "내 입이 내 말을 안 들었다." 동일 문장 6건. 서로 모르는 사람들.</div>
   </div><div class="az-doc-foot"><span>CAUTION: VERBAL REPORTS WITHIN 2KM UNRELIABLE</span><span>PAGE 03 / 04</span></div></div>${back('03-B', 'SGIA COUNTERINTELLIGENCE DIVISION')}</article>`,
  // 04 — transcripts
  `<article class="az-sheet" data-page="4"><div class="az-sheet-front az-page"><div>
    <div class="az-doc-head"><div><div class="az-meta">SGIA FIELD INTERCEPT LOG // 04</div><h2 class="az-doc-title">목격자 진술 및 단답 발화 채록</h2></div><span class="az-code">LOG-AZ-09</span></div>
    <div class="az-section"><div class="az-label">BEHAVIORAL OBSERVATION</div><p class="az-body">용의자 <strong>에이지(AZ)</strong>는 장황한 대화나 설득을 극도로 기피하며, 모든 현장 접촉에서 <strong>3어절 이하의 단답</strong>만 남긴 채 이탈함.</p></div>
    <div class="az-tr"><div class="az-tr-time">[CASE #26-0412] 제3외곽 검문소 습격 당시 무전 채록</div><div>요원 A: "투항해라. 이미 반경 500m가 포위됐다—"</div><div class="az-speech">AZ: "비켜."</div><small>* 직후 검문소 분대장 입이 동기화되며 전원 철수 명령을 하달함.</small></div>
    <div class="az-tr"><div class="az-tr-time">[CASE #26-0819] 비인가 연구소 급습 현장 생존자 진술</div><div>연구원: "ORPÉ 본부의 지시입니까? 샘플은 금고에..."</div><div class="az-speech">AZ: "시끄러워. 입 닫아."</div></div>
    <div class="az-tape">${trace('tape', '녹음 테이프 노이즈 구간 재생', 'az-trace-tape')}<span>TAPE 09 · 03:12 — 노이즈 구간</span><output data-tape></output></div>
    ${pen('단답만 함 = 말이 길면 들킨다?', 'az-pen-4')}
    <div class="az-uv">[UV 감식 메모] 추적팀 내부 보고: 에이지는 ORPÉ 조직원들과도 동행하지 않고 단독 행동함. 조직의 이념보다 개인적 목적에 따라 움직이는 정황 포착.</div>
   </div><div class="az-doc-foot"><span>Compiled from 14 Witness Statements</span><span>PAGE 04 / 04</span></div></div>${back('04-B', 'DO NOT DETACH FROM CASE FILE')}</article>`,
  // 05 — rumours (unlocked by clearance)
  `<article class="az-sheet az-sheet-rumor" data-page="5"><div class="az-sheet-front az-page"><div>
    <div class="az-doc-head"><div><div class="az-meta">UNVERIFIED INTEL // 05 — LEVEL 2</div><h2 class="az-doc-title">카더라 · 지라시 · 소문 모음</h2></div><span class="az-code">RELIABILITY: LOW</span></div>
    <div class="az-ascii-wrap"><canvas class="az-ascii" width="300" height="170" aria-label="저해상도 재구성 모델"></canvas><span>RECONSTRUCTION // LOW-POLY · SOURCE: 14 WITNESSES</span></div>
    <ul class="az-rumors">${[
      ['지라시', '"AZ가 ORPÉ 간부라더라." — 조직도에 이름 없음. 확인 불가.'],
      ['커뮤니티', '"웃는 걸 본 사람은 없대." — 출처 불명. 게시글 삭제됨.'],
      ['카더라', '"2km 안에서는 거짓말 탐지기도 같이 거짓말한다." — 과장 추정.'],
      ['목격담', '"검문소 근처 편의점에서 우산만 사 갔다." — CCTV 해당 시각 공백.'],
      ['내부 소문', '"비콘 누가 한 번 마주쳤는데 기억이 반쯤 비었다." — 당사자 진술 거부.'],
    ].map(([k, v], i) => `<li style="--r:${[-1.4, 0.9, -0.6, 1.2, -1][i]}deg"><b>${k}</b>${v}</li>`).join('')}</ul>
    ${pen('전부 믿지 말 것.<br>근데 전부 무시하지도 말 것.', 'az-pen-5')}
   </div><div class="az-doc-foot"><span>ASSEMBLED BY 형사과 FIELD DESK</span><span>APPENDIX 05</span></div></div>${back('05-B', 'LEVEL 2 — DO NOT CIRCULATE')}</article>`,
];
const clueText = {
  print: ['사진 모서리 얼룩 = 지문 반쪽.', '등록 각성자 DB 대조 결과: 일치 없음.'],
  receipt: ['찢긴 송금 전표. 수취인 칸이 비어 있다.', 'AZ 몫으로 잡힌 돈이 없다 → 조직 돈으로 움직이지 않음.'],
  dent: ['종이에 눌린 연필 자국: "2.0"', '반경 2km. 무전은 그 밖에서.'],
  tape: ['노이즈 사이 0.4초: "…아니야."', '세 어절 이하. 이번에도.'],
};

function css() {
  if (document.querySelector('[data-az-reader-css]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'assets/az-reader.css';
  link.dataset.azReaderCss = '';
  document.head.append(link);
}
function markup(inline) {
  return `<div class="az-reader ${inline ? 'az-inline' : ''}" data-open="false" data-sealed="true">
   <div class="az-desk" aria-hidden="true"></div><div class="az-scan" aria-hidden="true"></div><canvas class="az-noise" aria-hidden="true"></canvas>
   <header class="az-hud"><div><i class="az-dot"></i><span>SGIA COUNTERINTELLIGENCE ARCHIVE</span><span class="az-hud-tag">WANTED · UNVERIFIED INTEL</span></div><div><span>TARGET: AZ (ORPÉ)</span><span data-clock>00:00:00</span></div></header>
   <main class="az-stage"><div class="az-rig" data-rig>
    <div class="az-board" aria-hidden="true"></div>
    <nav class="az-folder-tabs" aria-label="기록철 섹션 탭">${['01·용의자', '02·ORPÉ', '03·특이능력', '04·녹취기록', '05·소문'].map((t, i) => `<button type="button" data-sheet="${i + 1}" ${i === 4 ? 'disabled aria-disabled="true" title="LEVEL 2 권한 필요"' : ''}>${t}${i === 4 ? ' 🔒' : ''}</button>`).join('')}</nav>
    <div class="az-stack">${sheets.slice().reverse().join('')}</div>
    <div class="az-cover" data-cover>
     <div class="az-cover-front" style="background-image:url('${IMG.cover}')"></div>
     <div class="az-cover-inside"><div class="az-pocket"><h4>RESTRICTED ARCHIVE PROTOCOL</h4><p>본 사건 기록철은 국가 각성자 통합관리청(SGIA) 추적관리팀 <strong>BEACON</strong>의 기밀 자산입니다.<br><br>용의자 <strong>AZ</strong>의 '거짓 증언' 권능 특성상, 현장 요원의 구두 보고는 신뢰할 수 없으며 오직 교차 검증된 물적 채록만 수록되었습니다.</p></div>${pen('이 파일 넘기는 사람에게.<br>흔적을 먼저 찾아라. 말은 나중에.', 'az-pen-cover')}<div class="az-serial">STATUS: ACTIVE PURSUIT</div></div>
     <button type="button" class="az-seal" data-seal aria-label="실링 왁스 봉인 해제"><img src="${IMG.seal}" alt="" draggable="false"><span>CLICK TO UNSEAL</span></button>
    </div>
   </div></main>
   <aside class="az-terminal" data-terminal aria-live="polite"><div class="az-term-head"><i></i>FIELD TERMINAL · 수사 보조</div><p data-term-text>봉인된 기록철입니다. 왁스 봉인을 눌러 열람을 시작하십시오.</p><div class="az-term-meter"><span data-term-count>단서 0 / ${NEED}</span><em><b data-term-bar></b></em></div></aside>
   <div class="az-clue" data-clue hidden role="status"><p class="az-pen" data-clue-text></p><button type="button" data-clue-close>메모 닫기</button></div>
   <footer class="az-dock"><button type="button" class="az-btn az-close-btn" data-toggle aria-label="파일 덮기">덮기</button><button type="button" class="az-btn az-arrow" data-prev disabled aria-label="이전 장">◀</button><span class="az-indicator" data-indicator>SEALED</span><button type="button" class="az-btn az-arrow" data-next disabled aria-label="다음 장">▶</button><button type="button" class="az-btn" data-stamp disabled>도장</button><button type="button" class="az-btn" data-uv aria-pressed="false">UV</button></footer>
  </div>`;
}

/**
 * Mounts the case file into `host`.
 * sealed: the cover stays shut and the wax seal calls `onSeal` (the keypad) instead of opening.
 * autoOpen: swing the cover open once mounted (after the keypad accepted the code).
 * Returns a cleanup function.
 */
export function mountAZFile(host, { inline = true, sealed = false, onSeal = null, autoOpen = false, section = 0 } = {}) {
  css();
  host.innerHTML = markup(inline);
  const root = host.querySelector('.az-reader');
  const q = (s) => root.querySelector(s);
  const qa = (s) => [...root.querySelectorAll(s)];
  const abort = new AbortController();
  const on = (el, t, fn, o = {}) => el.addEventListener(t, fn, { ...o, signal: abort.signal });
  const intervals = [];
  const timeouts = new Set();
  const later = (fn, ms) => { const id = setTimeout(() => { timeouts.delete(id); if (root.isConnected) fn(); }, ms); timeouts.add(id); };
  let ro = null;
  const dispose = () => { abort.abort(); intervals.forEach(clearInterval); timeouts.forEach(clearTimeout); ro?.disconnect(); };
  on(root, 'contextmenu', (e) => { if (e.target.closest('img,.az-photo-in,.az-cover-front')) e.preventDefault(); });
  root.dataset.sealed = String(sealed);

  const clock = q('[data-clock]');
  const tick = () => { if (!root.isConnected) return dispose(); clock.textContent = new Date().toTimeString().slice(0, 8); };
  tick();
  intervals.push(setInterval(tick, 1000));
  const noise = q('.az-noise'), nctx = noise.getContext('2d');
  const chars = ['.', ':', '+', '*', '#', '0', '1', '·'];
  const paintNoise = () => {
    if (!noise.width) return;
    nctx.clearRect(0, 0, noise.width, noise.height);
    nctx.fillStyle = 'rgba(220,225,235,.38)';
    nctx.font = '10px monospace';
    for (let i = 0; i < 70; i++) nctx.fillText(chars[(Math.random() * chars.length) | 0], Math.random() * noise.width, Math.random() * noise.height);
  };
  if (state.motion) intervals.push(setInterval(paintNoise, 160));

  const rig = q('[data-rig]');
  const stage = q('.az-stage');
  const pages = qa('.az-sheet');
  pages.sort((a, b) => a.dataset.page - b.dataset.page);
  const tabs = qa('[data-sheet]');
  let open = false, page = 0, unlocked = false;
  const found = new Set();
  const visible = () => (unlocked ? 5 : 4);
  // Design sizes: desktop spread 980 × 660 (cover + sheet), phone single sheet 390 × 760.
  function fit() {
    const w = (inline ? stage.clientWidth : root.clientWidth) - 16;
    if (w <= 0) return;
    const compact = w < 820;
    rig.classList.toggle('compact', compact);
    root.classList.toggle('az-compact', compact);
    const needW = compact ? 400 : 980, needH = compact ? (open ? 780 : 640) : 680;
    const maxH = inline ? Infinity : root.clientHeight - (compact ? 150 : 140);
    const s = Math.min(compact ? 1.12 : 1, w / needW, maxH / needH);
    rig.style.setProperty('--az-s', String(s));
    if (inline) stage.style.height = `${Math.ceil(needH * s) + 24}px`;
    noise.width = root.clientWidth;
    noise.height = root.clientHeight;
  }
  function update() {
    const wasOpen = root.dataset.open === 'true';
    root.dataset.open = String(open);
    rig.classList.toggle('is-open', open);
    q('[data-prev]').disabled = !open || page === 0;
    q('[data-next]').disabled = !open || page >= visible() - 1;
    q('[data-stamp]').disabled = !open;
    q('[data-toggle]').disabled = !open;
    q('[data-indicator]').textContent = open ? `${String(page + 1).padStart(2, '0')} / ${String(visible()).padStart(2, '0')}` : 'SEALED';
    pages.forEach((sh, i) => {
      const flipped = open && i < page;
      sh.classList.toggle('flipped', flipped);
      sh.style.zIndex = String(flipped ? 10 + i : 30 - i);
      sh.hidden = i >= visible();
      sh.setAttribute('aria-hidden', String(!open || i !== page));
      sh.inert = !open || i !== page;
    });
    tabs.forEach((t, i) => t.classList.toggle('active', open && i === page));
    if (open && page === 4) startAscii();
    if (wasOpen !== open) fit();
  }
  function go(i) { if (sealed) return; if (!open) open = true; page = Math.max(0, Math.min(visible() - 1, i)); update(); }
  function say(text) { q('[data-term-text]').textContent = text; q('[data-terminal]').classList.remove('ping'); void q('[data-terminal]').offsetWidth; q('[data-terminal]').classList.add('ping'); }
  function unseal() {
    if (sealed) { onSeal?.(); return; }
    if (!open) { go(0); say('기록철 개봉. 각 장에 남은 흔적을 눌러 보십시오. 일부는 UV 감식등으로만 보입니다.'); }
  }
  on(q('[data-seal]'), 'click', (e) => { e.stopPropagation(); unseal(); });
  on(q('[data-cover]'), 'click', () => { if (!open) unseal(); });
  on(q('[data-toggle]'), 'click', () => { open = false; page = 0; update(); });
  on(q('[data-prev]'), 'click', () => go(page - 1));
  on(q('[data-next]'), 'click', () => go(page + 1));
  tabs.forEach((t) => on(t, 'click', () => go(Number(t.dataset.sheet) - 1)));
  on(root, 'keydown', (e) => { if (!open || e.target.closest('input')) return; if (e.key === 'ArrowRight') go(page + 1); if (e.key === 'ArrowLeft') go(page - 1); });
  let sx = null;
  on(q('.az-stack'), 'pointerdown', (e) => { if (e.target.closest('button')) return; sx = { x: e.clientX, y: e.clientY }; });
  on(q('.az-stack'), 'pointerup', (e) => { if (!sx) return; const dx = e.clientX - sx.x, dy = e.clientY - sx.y; sx = null; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(page + (dx < 0 ? 1 : -1)); });

  const stamp = q('.az-stamp-img');
  on(q('[data-stamp]'), 'click', () => { go(1); stamp.classList.remove('stamped'); void stamp.offsetWidth; later(() => stamp.classList.add('stamped'), state.motion ? 280 : 0); });
  on(q('[data-uv]'), 'click', (e) => {
    const onUV = root.classList.toggle('uv-active');
    e.currentTarget.setAttribute('aria-pressed', String(onUV));
    e.currentTarget.classList.toggle('uv-on', onUV);
    if (onUV && open) say('UV 감식등 점등. 숨은 필기와 눌린 자국을 확인하십시오.');
  });
  qa('.az-redacted').forEach((el) => on(el, 'click', () => el.classList.toggle('revealed')));
  const sync = q('[data-sync]'), sim = q('[data-sim]');
  on(sync, 'click', () => {
    const synced = sim.classList.toggle('synced');
    sync.setAttribute('aria-pressed', String(synced));
    sync.textContent = synced ? '동기화 해제' : '동기화 발동';
    sim.querySelector('small').textContent = synced ? '⚠ 경고: 반경 2km 내 구강 동기화 감지 (의식 명료 · 발화 강제 변조)' : '피해 요원 의식 상태: 명료함 (통제권 정상)';
    sim.querySelector('p').textContent = synced ? '"이상 무. 해당 구역에 에이지의 흔적은 전혀 없다. 철수한다."' : '"용의자 AZ가 북쪽 환기구로 도주했습니다! 즉시 지원 바랍니다!"';
  });

  const clue = q('[data-clue]');
  qa('[data-trace]').forEach((el) => on(el, 'click', (e) => {
    e.stopPropagation();
    const id = el.dataset.trace;
    if (el.classList.contains('az-uv-only') && !root.classList.contains('uv-active')) { say('희미한 자국이 있습니다. 육안으로는 읽을 수 없습니다 — UV 감식등을 켜십시오.'); return; }
    el.classList.add('found');
    found.add(id);
    if (id === 'tape') q('[data-tape]').textContent = '▶ "…아니야."';
    q('[data-clue-text]').innerHTML = clueText[id].join('<br>');
    clue.hidden = false;
    q('[data-clue-close]').focus({ preventScroll: true });
    const n = Math.min(found.size, NEED);
    q('[data-term-count]').textContent = `단서 ${n} / ${NEED}`;
    q('[data-term-bar]').style.width = `${(n / NEED) * 100}%`;
    if (found.size >= NEED && !unlocked) {
      unlocked = true;
      const tab = tabs[4];
      tab.disabled = false;
      tab.removeAttribute('aria-disabled');
      tab.textContent = '05·소문';
      tab.title = '';
      root.classList.add('granted');
      say('교차 검증 완료. LEVEL 2 열람 권한이 부여되었습니다 — 부록 05 “소문 모음”이 해제됩니다.');
      update();
    } else if (!unlocked) {
      say(found.size === 1 ? '단서 확보. 다른 장에도 흔적이 남아 있습니다.' : `단서 ${found.size}개 확보. 조금만 더.`);
    }
  }));
  on(q('[data-clue-close]'), 'click', () => { clue.hidden = true; });

  // Low-poly ASCII reconstruction (canvas, not text art)
  let asciiStarted = false;
  function startAscii() {
    if (asciiStarted) return;
    asciiStarted = true;
    const cv = q('.az-ascii'), cx = cv.getContext('2d');
    const t = (1 + Math.sqrt(5)) / 2;
    const V = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]].map(([x, y, z]) => [x * 0.8, y * 1.05, z * 0.75]);
    const F = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
    const shade = ' .:-=+*#%@';
    const cols = 60, rows = 26, cw = cv.width / cols, ch = cv.height / rows;
    let a = 0.6;
    const draw = () => {
      const buf = Array.from({ length: rows }, () => Array(cols).fill(' '));
      const zb = Array.from({ length: rows }, () => Array(cols).fill(-1e9));
      const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(a * 0.37), sb = Math.sin(a * 0.37);
      const P = V.map(([x, y, z]) => { const x1 = x * ca + z * sa, z1 = -x * sa + z * ca; const y1 = y * cb - z1 * sb, z2 = y * sb + z1 * cb; return [x1, y1, z2]; });
      for (const [i, j, k] of F) {
        const A = P[i], B = P[j], C = P[k];
        const u = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], v = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
        const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
        const len = Math.hypot(...n) || 1;
        if (n[2] / len < 0) continue;
        const light = Math.max(0, (n[0] * -0.4 + n[1] * 0.5 + n[2] * 0.75) / len);
        const s = shade[Math.min(shade.length - 1, 1 + Math.floor(light * (shade.length - 1)))];
        const pts = [A, B, C].map((p) => [cols / 2 + p[0] * 9.5, rows / 2 - p[1] * 9.5 * 0.52, p[2]]);
        const minx = Math.max(0, Math.floor(Math.min(...pts.map((p) => p[0])))), maxx = Math.min(cols - 1, Math.ceil(Math.max(...pts.map((p) => p[0]))));
        const miny = Math.max(0, Math.floor(Math.min(...pts.map((p) => p[1])))), maxy = Math.min(rows - 1, Math.ceil(Math.max(...pts.map((p) => p[1]))));
        const area = (p, q2, r) => (q2[0] - p[0]) * (r[1] - p[1]) - (q2[1] - p[1]) * (r[0] - p[0]);
        const total = area(...pts);
        if (!total) continue;
        for (let y = miny; y <= maxy; y++) for (let x = minx; x <= maxx; x++) {
          const pt = [x + 0.5, y + 0.5];
          const w0 = area(pts[1], pts[2], pt) / total, w1 = area(pts[2], pts[0], pt) / total, w2 = 1 - w0 - w1;
          if (w0 < 0 || w1 < 0 || w2 < 0) continue;
          const z = w0 * pts[0][2] + w1 * pts[1][2] + w2 * pts[2][2];
          if (z > zb[y][x]) { zb[y][x] = z; buf[y][x] = s; }
        }
      }
      cx.fillStyle = '#0d0e10';
      cx.fillRect(0, 0, cv.width, cv.height);
      cx.font = `${Math.round(ch * 1.05)}px monospace`;
      cx.textBaseline = 'top';
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const c = buf[y][x];
        if (c === ' ') { if (Math.random() < 0.012) { cx.fillStyle = '#3a3f46'; cx.fillText('·', x * cw, y * ch); } continue; }
        cx.fillStyle = Math.random() < 0.02 ? '#d93838' : '#c9d1d9';
        cx.fillText(c, x * cw, y * ch);
      }
      // scan glitch
      const gy = (Date.now() / 18) % cv.height;
      cx.fillStyle = 'rgba(217,56,56,.16)';
      cx.fillRect(0, gy, cv.width, 3);
      a += 0.035;
    };
    draw();
    if (state.motion) intervals.push(setInterval(draw, 70));
  }


  if ('ResizeObserver' in window) { ro = new ResizeObserver(fit); ro.observe(inline ? stage : root); }
  else on(window, 'resize', fit);
  fit();
  update();
  if (!sealed && section > 0) { go(Math.min(4, section) - 1); say('지정 문서로 이동했습니다. 흔적을 눌러 단서를 확보하십시오.'); }
  else if (!sealed && autoOpen) later(() => { if (!open) unseal(); }, state.motion ? 420 : 0);
  return dispose;
}

/** Full-screen reader (used when the file is opened from another screen). */
export function openAZReader(section = 0) {
  const d = modal('AZ — CLASSIFIED CASE FILE', '<div class="az-modal-host"></div>', 'az-reader');
  const dispose = mountAZFile(d.querySelector('.az-modal-host'), { inline: false, section, autoOpen: section === 0 });
  d.addEventListener('close', dispose, { once: true });
  return d;
}
