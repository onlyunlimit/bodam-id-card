import { chirp } from './audio.js';
import { translateDOM, language, setLanguage, tr } from './i18n.js';
import { serviceConfig } from './service-config.js';
import { koreaTime } from './model.js';
export const $ = (s, root = document) => root.querySelector(s);
export const $$ = (s, root = document) => [...root.querySelectorAll(s)];
export const esc = (v) =>
  String(v ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
export function read(key, fallback = null, session = false) {
  try {
    return JSON.parse((session ? sessionStorage : localStorage).getItem('sgia.' + key)) ?? fallback;
  } catch {
    return fallback;
  }
}
export function save(key, value, session = false) {
  try {
    (session ? sessionStorage : localStorage).setItem('sgia.' + key, JSON.stringify(value));
    return true;
  } catch {
    toast('저장 공간에 접근할 수 없습니다. 이번 접속 동안만 유지됩니다.');
    return false;
  }
}
export const state = {
  staff: read('staff', false, true) === true,
  motion: read('motion', true) && !matchMedia('(prefers-reduced-motion:reduce)').matches,
};
export function toast(message) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('visible');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('visible'), 3500);
}
export function modal(title, html, kind = '') {
  const d = $('#document-dialog');
  d.dataset.kind = kind;
  logActivity(title, 'OPEN');
  $('#document-title').toggleAttribute('data-user-content', kind === 'community-post');
  $('#document-title').textContent = title;
  $('#document-body').innerHTML = html;
  translateDOM(d);
  if (!d.open) d.showModal();
  return d;
}
let afterLogin = null,
  attempt = 0;
export function login(callback = null) {
  if (state.staff) {
    callback?.();
    return;
  }
  afterLogin = callback;
  $('#login-submit').disabled = false;
  $('#login-progress').textContent = 'STAFF-001 / 발급된 사원증';
  $('#staff-login').showModal();
}
export function applyViewer() {
  if (!read('theme')) {
    document.documentElement.dataset.theme = state.staff ? 'dark' : 'light';
    $('#theme-toggle')?.setAttribute(
      'aria-label',
      state.staff ? '라이트모드로 전환' : '다크모드로 전환',
    );
  }
  document.body.dataset.viewer = state.staff ? 'staff' : 'public';
  $('#viewer-label').textContent = state.staff ? '직원 채널 · 로그아웃' : '직원 로그인';
  $('#viewer-toggle').setAttribute('aria-pressed', String(state.staff));
  $('#access-label').textContent = state.staff ? 'INTERNAL OPERATIONS' : 'PUBLIC INFORMATION';
  $$('.access-pill span').forEach(
    (e) => (e.textContent = state.staff ? 'INTERNAL / 직원 열람' : 'PUBLIC / 공개 열람'),
  );
  $$('[data-staff-only]').forEach((e) => (e.hidden = !state.staff));
  $$('[data-public-only]').forEach((e) => (e.hidden = state.staff));
}
export const heading = (eyebrow, title, description = '') =>
  `<header class="page-heading"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1>${description ? `<p class="description">${description}</p>` : ''}</div><span class="access-pill"><i></i><span>${state.staff ? 'INTERNAL / 직원 열람' : 'PUBLIC / 공개 열람'}</span></span></header>`;
export function initShell(title, page) {
  const theme = read('theme', 'dark');
  document.documentElement.dataset.theme = theme === 'light' ? 'light' : 'dark';
  const links = [
    ['portal', '통합 관제', 'overview'],
    ['departments', '조직·부서', 'departments'],
    ['entertainment', '엔터테인먼트', 'entertainment'],
    ['records', '사건 기록실', 'records'],
    ['manual', '세계관 안내서', 'manual'],
    ['community', '커뮤니티', 'community'],
  ];
  $('#app').innerHTML =
    `<div class="agency-strip"><span>SGIA · 국가 각성자 통합관리청</span><span id="access-label"></span><span class="mono" id="shell-clock"></span></div><header class="site-header"><a class="brand" href="portal.html"><img src="assets/art/silver-emblem.webp" width="46" height="46" alt="SGIA 문장"><span><b>SGIA</b><small>국가 각성자 통합관리청</small></span></a><div class="header-controls"><div class="language-controls" role="group" aria-label="Language"><button data-lang="ko" aria-pressed="false">한국어</button><button data-lang="en" aria-pressed="false">EN</button><button data-lang="ja" aria-pressed="false">日本語</button><button data-lang="zh" aria-pressed="false">中文</button></div><button id="sound-toggle" aria-pressed="false" aria-label="BGM 켜기">♫ <span>BGM OFF</span></button><button id="viewer-toggle" aria-pressed="false"><span id="viewer-label"></span></button><button id="theme-toggle" aria-label="라이트모드로 전환">◐</button><button id="motion-toggle" aria-pressed="false">모션 ON</button></div></header><nav class="site-nav" aria-label="주요 메뉴">${links.map(([href, label, id]) => `<a href="${href}.html" ${page === id ? 'aria-current="page"' : ''}>${label}</a>`).join('')}</nav><div class="staff-ribbon" data-staff-only><span><i class="status-dot"></i> 사내 통합망 연결</span><span>STAFF-001 · SEOUL HQ</span><button id="network-log">접속 로그 ↗</button></div><main id="main"></main><footer class="site-footer"><div class="footer-top"><a class="brand" href="portal.html"><img src="assets/art/silver-emblem.webp" width="36" height="36" alt=""><b>SGIA</b></a><div class="footer-links"><a href="manual.html">세계관 안내</a><button id="activity-open">접속 로그 ↗</button><button id="privacy-note">개인정보</button><a href="index.html">접속 대기실</a></div><div id="visitor-count" class="visitor-count" aria-live="polite"><span>VISITORS</span><b>—</b><small>집계 연결 대기</small></div></div><p>© onlyunlimit · SGIA는 창작 세계관을 기반으로 한 가상의 서비스입니다.</p></footer><div id="cursor-radar" aria-hidden="true"><i></i><span></span></div><div id="toast" role="status" aria-live="polite"></div><dialog id="staff-login" aria-labelledby="login-title"><button data-close class="close-button" aria-label="로그인 취소">×</button><p class="eyebrow">INTERNAL ACCESS / SGIA</p><h2 id="login-title">직원 채널 접속</h2><p>사원증을 태그하여 내부 업무 화면으로 전환합니다.</p><div class="login-badge"><img src="assets/art/silver-emblem.webp" width="60" alt=""><strong>SGIA STAFF<small>본부 사원증 / 001</small></strong><span class="barcode"></span></div><p id="login-progress" role="status"></p><button id="login-submit" class="primary">사원증 태그 · 접속</button></dialog><dialog id="document-dialog" aria-labelledby="document-title"><button data-close class="close-button" aria-label="문서 닫기">×</button><h2 id="document-title"></h2><div id="document-body"></div></dialog>`;
  document.title = title + ' | SGIA';
  $$('[data-lang]').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.lang === language()));
    b.onclick = () => {
      setLanguage(b.dataset.lang);
      document.dispatchEvent(new Event('sgia:language'));
    };
  });
  $('#privacy-note').onclick = () =>
    modal(
      '개인정보',
      '<p>작성 IP는 악성 게시물 대응을 위해 암호화하여 30일간 보관합니다. 인증된 관리자만 확인할 수 있습니다. 비밀번호는 검증값만 저장합니다. 방문 통계는 날짜별 비식별 값으로 집계합니다.</p><a href="https://github.com/onlyunlimit/bodam-id-card/issues" target="_blank" rel="noopener">운영 문의 ↗</a>',
    );
  document.addEventListener('click', (e) => {
    const b = e.target.closest('button,a,summary');
    if (b && b.id !== 'network-log' && !b.closest('#document-dialog input'))
      logActivity((b.getAttribute('aria-label') || b.textContent).trim().slice(0, 100));
  });
  let taps = [];
  $('.site-footer .brand').addEventListener('click', (e) => {
    e.preventDefault();
    taps = taps.filter((t) => Date.now() - t < 3000);
    taps.push(Date.now());
    if (taps.length === 5) {
      taps = [];
      modal(
        'SECURE OPERATIONS',
        '<p>OWNER ACCESS / 키 인증 후 관리 콘솔이 열립니다.</p><a class="primary" href="' +
          serviceConfig.api +
          '/admin" target="_blank" rel="noopener noreferrer">인증 콘솔 열기 ↗</a>',
      );
    }
  });
  logActivity(title, 'CONNECT');
  applyViewer();
  $('#viewer-toggle').onclick = () => {
    if (state.staff) {
      state.staff = false;
      save('staff', false, true);
      applyViewer();
      document.dispatchEvent(new Event('sgia:viewer'));
    } else login();
  };
  $$('[data-close]').forEach((b) => (b.onclick = () => b.closest('dialog').close()));
  $('#staff-login').addEventListener('close', () => {
    attempt++;
  });
  $('#login-submit').onclick = async () => {
    const id = ++attempt;
    $('#login-submit').disabled = true;
    chirp();
    for (const line of ['사원증 파장 확인…', '직원 채널 연결…', '열람 권한 승인']) {
      if (id !== attempt || !$('#staff-login').open) return;
      $('#login-progress').textContent = line;
      await new Promise((r) => setTimeout(r, state.motion ? 300 : 30));
    }
    if (id !== attempt || !$('#staff-login').open) return;
    $('#staff-login').close();
    state.staff = true;
    save('staff', true, true);
    applyViewer();
    document.dispatchEvent(new Event('sgia:viewer'));
    const next = afterLogin;
    afterLogin = null;
    next?.();
    toast('직원 채널에 접속했습니다.');
  };
  const applyTheme = () =>
    $('#theme-toggle').setAttribute(
      'aria-label',
      document.documentElement.dataset.theme === 'dark' ? '라이트모드로 전환' : '다크모드로 전환',
    );
  applyTheme();
  $('#theme-toggle').onclick = () => {
    const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = t;
    save('theme', t);
    applyTheme();
  };
  const motion = () => {
    document.documentElement.dataset.motion = state.motion ? 'on' : 'off';
    $('#motion-toggle').textContent = `모션 ${state.motion ? 'ON' : 'OFF'}`;
    $('#motion-toggle').setAttribute('aria-pressed', String(!state.motion));
  };
  motion();
  $('#motion-toggle').onclick = () => {
    state.motion = !state.motion && !matchMedia('(prefers-reduced-motion:reduce)').matches;
    save('motion', state.motion);
    motion();
  };
  matchMedia('(prefers-reduced-motion:reduce)').addEventListener('change', (e) => {
    state.motion = !e.matches && read('motion', true);
    motion();
  });
  const tick = () => {
    $('#shell-clock').textContent = koreaTime().clock + ' KST';
    document.dispatchEvent(new CustomEvent('sgia:clock', { detail: koreaTime() }));
  };
  setInterval(tick, 1000);
  tick();
  $('#network-log').onclick = showActivityLog;
  $('#activity-open').onclick = showActivityLog;
  const audio = new Audio('bgm/main.mp3');
  audio.id = 'ambient-audio';
  document.body.append(audio);
  audio.loop = true;
  audio.volume = 0.18;
  $('#sound-toggle').onclick = async () => {
    try {
      if (audio.paused) await audio.play();
      else audio.pause();
      $('#sound-toggle').setAttribute('aria-pressed', String(!audio.paused));
      $('#sound-toggle span').textContent = audio.paused ? 'BGM OFF' : 'BGM ON';
      $('#sound-toggle').setAttribute('aria-label', audio.paused ? 'BGM 켜기' : 'BGM 끄기');
    } catch {
      toast('브라우저에서 소리 재생을 허용해 주세요.');
    }
  };
  let frame;
  document.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || !state.motion) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const c = $('#cursor-radar');
      c.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
      c.style.opacity = 1;
      $('span', c).textContent = `${Math.round(e.clientX)}:${Math.round(e.clientY)}`;
      document.dispatchEvent(
        new CustomEvent('sgia:cursor', {
          detail: { x: e.clientX / innerWidth, y: e.clientY / innerHeight },
        }),
      );
    });
  });
  document.documentElement.addEventListener(
    'pointerleave',
    () => ($('#cursor-radar').style.opacity = 0),
  );
}

export function logActivity(label, kind = 'ACTION') {
  const old = read('activity', [], true);
  const rows = Array.isArray(old) ? old.slice(-149) : [];
  rows.push({ time: koreaTime().clock, label: String(label).slice(0, 160), kind });
  save('activity', rows, true);
}
export function showActivityLog() {
  const rows = read('activity', [], true);
  modal(
    '접속·활동 로그',
    '<div class="log-terminal"><div class="terminal-toolbar"><span>SESSION RECORDER / LIVE</span><button id="log-export">기록 내보내기 ↓</button></div><ol class="activity-lines">' +
      rows
        .toReversed()
        .map(
          (x) =>
            '<li><time>' +
            esc(x.time) +
            '</time><b>' +
            esc(x.kind) +
            '</b><span>' +
            esc(x.label) +
            '</span></li>',
        )
        .join('') +
      '</ol></div>',
  );
  $('#log-export').onclick = () => {
    const a = document.createElement('a');
    const u = URL.createObjectURL(
      new Blob([rows.map((x) => x.time + ' ' + x.kind + ' ' + x.label).join('\n')], {
        type: 'text/plain',
      }),
    );
    a.href = u;
    a.download = 'sgia-session.txt';
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
  };
}
