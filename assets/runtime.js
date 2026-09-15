import { chirp } from './audio.js';
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
  $('#document-title').textContent = title;
  $('#document-body').innerHTML = html;
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
  $('#login-progress').textContent = 'STAFF-001 / 발급된 체험 사원증';
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
    ['headquarters', '각성관 안내', 'headquarters'],
    ['entertainment', '엔터테인먼트', 'entertainment'],
    ['records', '사건 기록실', 'records'],
    ['orpe', '위협 정보', 'orpe'],
    ['manual', '세계관 안내서', 'manual'],
    ['community', '커뮤니티', 'community'],
  ];
  $('#app').innerHTML =
    `<div class="agency-strip"><span>SGIA · 국가 각성자 통합관리청</span><span id="access-label"></span><span class="mono" id="shell-clock"></span></div><header class="site-header"><a class="brand" href="portal.html"><img src="assets/emblem.svg" width="46" height="46" alt="SGIA 문장"><span><b>SGIA</b><small>국가 각성자 통합관리청</small></span></a><div class="header-controls"><button id="sound-toggle" aria-pressed="false" aria-label="BGM 켜기">♫ <span>BGM OFF</span></button><button id="viewer-toggle" aria-pressed="false"><span id="viewer-label"></span></button><button id="theme-toggle" aria-label="라이트모드로 전환">◐</button><button id="motion-toggle" aria-pressed="false">모션 ON</button></div></header><nav class="site-nav" aria-label="주요 메뉴">${links.map(([href, label, id]) => `<a href="${href}.html" ${page === id ? 'aria-current="page"' : ''}>${label}</a>`).join('')}</nav><div class="staff-ribbon" data-staff-only><span><i class="status-dot"></i> 사내 통합망 연결</span><span>STAFF-001 · SEOUL HQ</span><button id="network-log">접속 로그 ↗</button></div><main id="main"></main><footer class="site-footer"><div class="footer-top"><a class="brand" href="portal.html"><img src="assets/emblem.svg" width="36" height="36" alt=""><b>SGIA</b></a><div class="footer-links"><a href="manual.html">세계관 안내</a><a href="community.html#privacy">개인정보·운영 안내</a><a href="index.html">접속 대기실</a></div><div id="visitor-count" class="visitor-count" aria-live="polite"><span>VISITORS</span><b>—</b><small>집계 연결 대기</small></div></div><p>onlyunlimit 창작 세계관 · 실제 국가기관이 아닙니다. 직원 채널은 체험용이며 관리자 인증과 별개입니다.<br>사건·게이트·메신저·브리핑은 가상 연출입니다. 지도·서울 날씨·시각은 현실 자료를 사용합니다.</p></footer><div id="cursor-radar" aria-hidden="true"><i></i><span></span></div><div id="toast" role="status" aria-live="polite"></div><dialog id="staff-login" aria-labelledby="login-title"><button data-close class="close-button" aria-label="로그인 취소">×</button><p class="eyebrow">INTERNAL ACCESS / SGIA</p><h2 id="login-title">직원 채널 접속</h2><p>사원증을 태그하여 내부 업무 화면으로 전환합니다.</p><div class="login-badge"><img src="assets/emblem.svg" width="60" alt=""><strong>SGIA STAFF<small>본부 체험 사원증 / 001</small></strong><span class="barcode"></span></div><p id="login-progress" role="status"></p><button id="login-submit" class="primary">사원증 태그 · 접속</button><small class="muted">실제 인증이 없는 세계관 체험입니다.</small></dialog><dialog id="document-dialog" aria-labelledby="document-title"><button data-close class="close-button" aria-label="문서 닫기">×</button><h2 id="document-title"></h2><div id="document-body"></div></dialog>`;
  document.title = title + ' | SGIA';
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
  $('#network-log').onclick = () =>
    modal(
      '네트워크 접속 로그',
      `<pre class="terminal-log">${koreaTime().clock} KST\nCHANNEL / STAFF-001\nREAD PERMISSION / GRANTED\nINTEGRITY / VERIFIED\n\n가상 단말 세션 · 관리자 권한 없음</pre>`,
    );
  const audio = new Audio('bgm/main.mp3');
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
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      audio.pause();
      $('#sound-toggle').setAttribute('aria-pressed', 'false');
      $('#sound-toggle span').textContent = 'BGM OFF';
    }
  });
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
