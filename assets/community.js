import { language } from './i18n.js';
import { listen, every, delay, onDispose, routeSignal } from './lifecycle.js';
import { $, $$, state, esc, heading, login, modal, toast, read, save } from './runtime.js';
import { serviceConfig } from './service-config.js';
let turnstileLoading;
async function loadTurnstile() {
  if (window.turnstile) return window.turnstile;
  if (!turnstileLoading)
    turnstileLoading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.onload = () => resolve(window.turnstile);
      script.onerror = () => {
        turnstileLoading = null;
        reject(Error('보안 확인 도구를 불러오지 못했습니다.'));
      };
      document.head.append(script);
    });
  return turnstileLoading;
}
async function api(path, method = 'GET', data, persistent = false) {
  if (!serviceConfig.api) throw Error('공유 서버 연결을 준비 중입니다.');
  const response = await fetch(serviceConfig.api + path, {
    method,
    headers: data ? { 'Content-Type': 'application/json' } : {},
    body: data ? JSON.stringify(data) : undefined,
    signal: persistent
      ? AbortSignal.timeout(15000)
      : AbortSignal.any([routeSignal(), AbortSignal.timeout(15000)]),
    credentials: 'omit',
  });
  const result = await response.json();
  if (!response.ok) throw Error(result.error || '서버 연결을 확인해 주세요.');
  return result;
}
const date = (value) =>
  new Date(value).toLocaleString(
    { ko: 'ko-KR', en: 'en-GB', ja: 'ja-JP', zh: 'zh-CN' }[language()],
    {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },
  );
export async function initVisitors() {
  const target = $('#visitor-count');
  if (!target || !serviceConfig.api) return;
  try {
    const last = read('visit.check', {}, true),
      day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date()),
      record = last.day !== day || Date.now() - (last.at || 0) > 1800000;
    const data = await api('/visitors', record ? 'POST' : 'GET', record ? {} : undefined, true);
    if (record) save('visit.check', { day, at: Date.now() }, true);
    target.innerHTML = `<span>VISITORS</span><b>${data.total.toLocaleString()}</b><small>오늘 ${data.today.toLocaleString()} · KST 일별 중복 제외</small>`;
    target.title =
      '같은 네트워크 IP는 하루 한 번 집계합니다. 누적은 일별 방문 합계이며 실제 사람 수와 다를 수 있습니다.';
  } catch {
    $('small', target).textContent = '집계 연결 대기';
  }
}
function consent() {
  return '<label class="consent"><input type="checkbox" name="consent" required><span>게시물 운영과 악성 작성 대응을 위한 IP 암호화 보관(30일), 관리자 열람에 동의합니다.</span></label>';
}
function captchaMarkup() {
  return '<div class="captcha-widget"></div><p class="form-error" role="alert"></p>';
}
async function secureForm(form, submit) {
  const button = $('button[type=submit]', form);
  let token = '',
    widget;
  button.disabled = true;
  form.onsubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    button.disabled = true;
    $('.form-error', form).textContent = '';
    try {
      await submit(Object.fromEntries(new FormData(form)), token);
    } catch (error) {
      $('.form-error', form).textContent = error.message;
    } finally {
      token = '';
      if (widget !== undefined && form.isConnected) window.turnstile?.reset(widget);
      button.disabled = true;
    }
  };
  try {
    if (!serviceConfig.turnstileSiteKey) throw Error('작성 보안 설정을 준비 중입니다.');
    const ts = await loadTurnstile();
    if (!form.isConnected) return;
    widget = ts.render($('.captcha-widget', form), {
      sitekey: serviceConfig.turnstileSiteKey,
      action: 'community',
      size: 'compact',
      theme: document.documentElement.dataset.theme,
      callback: (value) => {
        token = value;
        button.disabled = false;
      },
      'expired-callback': () => {
        token = '';
        button.disabled = true;
      },
      'error-callback': () => {
        token = '';
        button.disabled = true;
        $('.form-error', form).textContent = '보안 확인이 만료되었습니다. 다시 시도해 주세요.';
      },
    });
    const dialog = form.closest('dialog');
    dialog?.addEventListener(
      'close',
      () => {
        if (widget !== undefined) ts.remove(widget);
      },
      { once: true },
    );
  } catch (e) {
    $('.form-error', form).textContent = e.message;
  }
}
export function renderCommunity() {
  const signal = routeSignal();
  onDispose(() => requestId++);
  let board = new URLSearchParams(location.search).get('board') || 'lucky';
  if (!['lucky', 'obsidus', 'staff'].includes(board)) board = 'lucky';
  let offset = 0,
    query = '',
    requestId = 0;
  const names = {
    lucky: '럭키트릭 팬 커뮤니티',
    obsidus: '옵시더스 팬 커뮤니티',
    staff: 'SGIA 익명 게시판',
  };
  $('#main').innerHTML =
    heading(
      'COMMUNITY / VOICES OF SGIA',
      '커뮤니티',
      '응원과 일상을 나누는 공간. 닉네임으로 글을 남기고 작성 비밀번호로 관리하세요.',
    ) +
    `<nav class="board-tabs" aria-label="게시판"><a href="community.html?board=lucky" class="${board === 'lucky' ? 'active' : ''}">럭키트릭</a><a href="community.html?board=obsidus" class="${board === 'obsidus' ? 'active' : ''}">옵시더스</a><a href="community.html?board=staff" class="${board === 'staff' ? 'active' : ''}">SGIA 사내 게시판 ◇</a></nav><div class="board-connection" id="board-connection">${serviceConfig.api ? '공유 데이터베이스 연결 중…' : '공유 서버 연결을 준비 중입니다. 등록 기능은 연결 후 활성화됩니다.'}</div><div id="staff-board-lock" class="access-lock" hidden><h2>SGIA 직원 채널</h2><p>사내 게시판을 열려면 직원 채널에 접속하세요.</p><button class="primary" id="board-login">직원 로그인</button></div><div class="board-layout" id="board-workspace"><section><div class="board-heading"><h2>${names[board]}</h2><button class="primary" id="write-post">글쓰기 ＋</button></div><form class="board-search"><input id="board-search" aria-label="게시물 검색" placeholder="제목·내용 검색" maxlength="60"><button>검색</button></form><div id="board-list" class="board-list"></div><div class="pagination"><button id="board-prev">← 이전</button><span id="board-page"></span><button id="board-next">다음 →</button></div></section></div>`;
  $('#board-login').onclick = () => login();
  async function load() {
    const ticket = ++requestId;
    const locked = board === 'staff' && !state.staff;
    $('#staff-board-lock').hidden = !locked;
    $('#board-workspace').hidden = locked;
    if (locked) {
      $('#board-list').replaceChildren();
      return;
    }
    $('#board-list').innerHTML = '<p class="empty-state">기록을 불러오는 중…</p>';
    try {
      const result = await api(
        `/posts?board=${board}&offset=${offset}&q=${encodeURIComponent(query)}`,
      );
      if (signal.aborted || ticket !== requestId) return;
      $('#board-connection').textContent = '채널 연결됨 · 실시간 게시판';
      $('#board-list').innerHTML =
        result.posts
          .map(
            (p) =>
              `<button class="post-row" data-post="${esc(p.id)}"><span data-user-content><b>${esc(p.title)}</b><small>${esc(p.author)}${p.department ? ' · ' + esc(p.department) : ''}<time>${date(p.created_at)}</time>${p.updated_at ? ' · 수정됨' : ''}</small></span><span class="post-count">${p.comments}<small>COMMENTS</small><small>♡ ${p.likes || 0}</small></span></button>`,
          )
          .join('') ||
        '<p class="empty-state">아직 등록된 글이 없습니다. 첫 이야기를 남겨 보세요.</p>';
      $('#board-page').textContent = String(offset / 20 + 1);
      $('#board-prev').disabled = offset === 0;
      $('#board-next').disabled = !result.more;
    } catch (e) {
      if (signal.aborted || ticket !== requestId) return;
      $('#board-list').innerHTML = '<p class="empty-state">' + esc(e.message) + '</p>';
      $('#board-connection').textContent = '공유 서버 연결 대기 · 잠시 후 새로고침해 주세요.';
      $('#board-next').disabled = true;
      $('#board-prev').disabled = offset === 0;
    }
  }
  $('#board-prev').onclick = () => {
    offset = Math.max(0, offset - 20);
    load();
  };
  $('#board-next').onclick = () => {
    offset += 20;
    load();
  };
  $('.board-search').onsubmit = (e) => {
    e.preventDefault();
    query = $('#board-search').value;
    offset = 0;
    load();
  };
  $('#board-list').onclick = (e) => {
    const b = e.target.closest('[data-post]');
    if (b) openPost(b.dataset.post);
  };
  $('#write-post').onclick = () => {
    if (board === 'staff' && !state.staff) return login();
    modal(
      '글쓰기 · ' + names[board],
      `<form id="post-form" class="board-form"><label>제목<input name="title" maxlength="100" required></label><div class="form-row"><label>닉네임<input name="author" maxlength="24" autocomplete="nickname" required></label><label>비밀번호 · 숫자 4자리<input name="password" type="password" inputmode="numeric" pattern="[0-9]{4}" minlength="4" maxlength="4" autocomplete="new-password" required></label></div>${board === 'staff' ? '<div class="form-row"><label>소속<select name="department" id="department-choice"><option>오리진</option><option>비콘</option><option>실드</option><option>가이드 관리국</option><option>센티넬 관리국</option><option>일반 행정</option><option>괴물</option><option>익명</option><option value="custom">직접 입력</option></select></label><label id="department-custom-label" hidden>직접 입력<input name="customDepartment" maxlength="40"></label></div>' : ''}<label>내용<textarea name="body" maxlength="5000" required></textarea></label>${consent()}${captchaMarkup()}<button class="primary" type="submit">등록</button><small>비밀번호는 분실 시 복구할 수 없습니다.</small></form>`,
    );
    const f = $('#post-form');
    $('#department-choice')?.addEventListener('change', (e) => {
      $('#department-custom-label').hidden = e.target.value !== 'custom';
      $('input', $('#department-custom-label')).required = e.target.value === 'custom';
    });
    secureForm(f, async (data, captcha) => {
      if (board === 'staff' && !state.staff) throw Error('직원 채널에 다시 접속해 주세요.');
      await api('/posts', 'POST', {
        ...data,
        board,
        department: data.department === 'custom' ? data.customDepartment : data.department || '',
        captcha,
        consent: data.consent === 'on',
      });
      $('#document-dialog').close();
      offset = 0;
      query = '';
      $('#board-search').value = '';
      await load();
      toast('게시물이 저장되었습니다.');
    });
  };
  async function openPost(id) {
    if (board === 'staff' && !state.staff) return login(() => openPost(id));
    try {
      const data = await api('/posts/' + id);
      if (signal.aborted) return;
      if (board === 'staff' && !state.staff) return;
      const p = data.post;
      modal(
        p.title,
        `<div class="post-meta" data-user-content><b>${esc(p.author)}</b><span>${esc(p.department)}</span><time>${date(p.created_at)}${p.updated_at ? ' · 수정 ' + date(p.updated_at) : ''}</time></div><div class="post-body" data-user-content>${esc(p.body)}</div><div class="post-controls"><button id="post-like" aria-pressed="${!!p.liked}"><span>${p.liked ? '좋아요 취소' : '좋아요'}</span> ♡ <b>${p.likes || 0}</b></button><button id="post-edit">수정</button><button id="post-delete">삭제</button></div><h3>댓글 ${data.comments.length}</h3><div class="comments">${data.comments.map((c) => `<article class="comment-row"><small data-user-content><b>${esc(c.author)}</b> · ${date(c.created_at)}${c.updated_at ? ' · 수정됨' : ''}</small><p data-user-content>${esc(c.body)}</p><button data-comment-edit="${c.id}">수정</button><button data-comment-delete="${c.id}">삭제</button></article>`).join('')}</div><form id="comment-form" class="board-form comment-form"><div class="form-row"><label>닉네임<input name="author" maxlength="24" required></label><label>비밀번호 · 4자리<input name="password" type="password" inputmode="numeric" pattern="[0-9]{4}" minlength="4" maxlength="4" autocomplete="new-password" required></label></div><label>댓글<textarea name="body" maxlength="1000" required></textarea></label>${consent()}${captchaMarkup()}<button type="submit" class="primary">댓글 등록</button></form>`,
      );
      $('#document-title').setAttribute('data-user-content', '');
      $('#document-title').textContent = p.title;
      $('#post-like').onclick = async (e) => {
        const button = e.currentTarget;
        button.disabled = true;
        try {
          const result = await api('/posts/' + id + '/like', 'POST', {
            liked: button.getAttribute('aria-pressed') !== 'true',
          });
          button.setAttribute('aria-pressed', String(result.liked));
          button.innerHTML =
            '<span>' +
            (result.liked ? '좋아요 취소' : '좋아요') +
            '</span> ♡ <b>' +
            result.likes +
            '</b>';
          load();
        } catch (error) {
          toast(error.message);
        } finally {
          button.disabled = false;
        }
      };
      $('#post-edit').onclick = () => edit('posts', p, id, false);
      $('#post-delete').onclick = () => edit('posts', p, id, true);
      $$('[data-comment-edit]').forEach(
        (b) =>
          (b.onclick = () =>
            edit(
              'comments',
              data.comments.find((c) => c.id === b.dataset.commentEdit),
              id,
              false,
            )),
      );
      $$('[data-comment-delete]').forEach(
        (b) =>
          (b.onclick = () =>
            edit(
              'comments',
              data.comments.find((c) => c.id === b.dataset.commentDelete),
              id,
              true,
            )),
      );
      secureForm($('#comment-form'), async (form, captcha) => {
        if (board === 'staff' && !state.staff) throw Error('직원 채널에 다시 접속해 주세요.');
        await api('/posts/' + id + '/comments', 'POST', {
          ...form,
          captcha,
          consent: form.consent === 'on',
        });
        $('#document-dialog').close();
        await openPost(id);
        load();
        toast('댓글을 저장했습니다.');
      });
    } catch (e) {
      toast(e.message);
    }
  }
  function edit(kind, item, parent, deleting) {
    $('#document-dialog').close();
    modal(
      deleting ? '작성 기록 삭제' : '작성 기록 수정',
      `<form class="board-form" id="edit-form">${deleting ? '<p>삭제하면 본문을 복구할 수 없습니다. 글 삭제 시 댓글도 함께 삭제됩니다.</p>' : `${kind === 'posts' ? `<label>제목<input name="title" maxlength="100" value="${esc(item.title)}" required></label>` : ''}<label>내용<textarea name="body" maxlength="${kind === 'posts' ? 5000 : 1000}" required>${esc(item.body)}</textarea></label>`}<label>작성 비밀번호<input name="password" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="off" required></label><small>기록별 15분에 최대 5회 확인합니다.</small>${captchaMarkup()}<button class="primary" type="submit">${deleting ? '삭제 확인' : '수정 저장'}</button></form>`,
    );
    secureForm($('#edit-form'), async (data, captcha) => {
      if (board === 'staff' && !state.staff) throw Error('직원 채널에 다시 접속해 주세요.');
      await api('/' + kind + '/' + item.id, deleting ? 'DELETE' : 'PATCH', { ...data, captcha });
      $('#document-dialog').close();
      await load();
      if (!(kind === 'posts' && deleting)) await openPost(parent);
      toast(deleting ? '삭제했습니다.' : '수정했습니다.');
    });
  }
  listen(document, 'sgia:viewer', () => {
    if (board === 'staff') {
      if (!state.staff && $('#document-dialog').open) $('#document-dialog').close();
      load();
    }
  });
  load();
}
