import { attachmentPicker, uploadMarkup } from './community-media.js';
import { characters } from './characters.js';
import { teamLogos } from './media.js';
import { language, registerCopy } from './i18n.js';
import { listen, every, delay, onDispose, routeSignal } from './lifecycle.js';
import { $, $$, state, esc, heading, login, modal, toast, read, save } from './runtime.js';
import { serviceConfig } from './service-config.js';
[
  ['관리자 로그인 ↗', 'Admin sign in ↗', '管理者ログイン ↗', '管理员登录 ↗'],
  [
    '관리자 프로필 편집 ↗',
    'Edit artist profile ↗',
    '管理者プロフィール編集 ↗',
    '管理员编辑资料 ↗',
  ],
  ['관리자 관리 ↗', 'Manage post ↗', '管理者メニュー ↗', '管理帖子 ↗'],
  ['아티스트 페이지 ↗', 'Artist page ↗', 'アーティストページ ↗', '艺人主页 ↗'],
  ['팬들의 이야기', 'Fan stories', 'ファンのストーリー', '粉丝动态'],
  ['지금, 우리가 좋아하는 이야기', 'Stories we love', 'みんなが好きなストーリー', '大家喜欢的动态'],
  ['글쓰기 ＋', 'Write ＋', '投稿 ＋', '发帖 ＋'],
  ['팬 글쓰기 ＋', 'Write as a fan ＋', 'ファンとして投稿 ＋', '发布粉丝帖 ＋'],
  ['답글', 'Reply', '返信', '回复'],
  ['사진 첨부 · 최대 2장', 'Attach up to 2 photos', '写真を添付・最大2枚', '添加照片 · 最多2张'],
  ['사진 준비 완료', 'Photos ready', '写真の準備完了', '照片已就绪'],
  ['사진을 준비하고 있습니다…', 'Preparing photos…', '写真を準備中…', '正在处理照片…'],
  ['삭제 ×', 'Remove ×', '削除 ×', '移除 ×'],
  ['취소 ×', 'Cancel ×', 'キャンセル ×', '取消 ×'],
  [
    '작성 비밀번호 · 숫자 6자리',
    'Post PIN · 6 digits',
    '投稿パスワード・数字6桁',
    '帖子密码 · 6位数字',
  ],
  [
    '기존 작성 비밀번호 · 숫자 4자리',
    'Previous PIN · 4 digits',
    '以前のパスワード・数字4桁',
    '原密码 · 4位数字',
  ],
  [
    '새 비밀번호 · 숫자 6자리',
    'New PIN · 6 digits',
    '新しいパスワード・数字6桁',
    '新密码 · 6位数字',
  ],
  ['아직 등록된 이야기가 없어요.', 'No stories yet.', 'まだ投稿がありません。', '还没有动态。'],
  [
    '첫 이야기를 남겨 보세요.',
    'Share the first story.',
    '最初のストーリーを投稿しましょう。',
    '发布第一条动态吧。',
  ],
  [
    '아티스트의 소식을 기다리고 있어요.',
    'Waiting for artist updates.',
    'アーティストの更新を待っています。',
    '期待艺人的新动态。',
  ],
  [
    '새로운 소식이 도착하면 이곳에 표시됩니다.',
    'New updates will appear here.',
    '新しい投稿がここに表示されます。',
    '新动态会显示在这里。',
  ],
  ['궁금한 이야기를 찾아보세요', 'Search stories', 'ストーリーを検索', '搜索动态'],
  ['이야기 보기 ↗', 'Read story ↗', '投稿を読む ↗', '查看动态 ↗'],
  [
    'JPG·PNG·WebP · 사진은 자동 압축됩니다.',
    'JPG · PNG · WebP · Photos are compressed automatically.',
    'JPG・PNG・WebP・写真は自動圧縮されます。',
    'JPG · PNG · WebP · 照片会自动压缩。',
  ],
].forEach((row) => registerCopy(...row));
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
  const button = $('button[type=submit]', form),
    error = $('.form-error', form);
  let token = '',
    widget,
    disposed = false;
  button.disabled = true;
  const dialog = form.closest('dialog');
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    observer.disconnect();
    dialog?.removeEventListener('close', onClose);
    unregister();
    if (widget !== undefined) window.turnstile?.remove(widget);
  };
  const observer = new MutationObserver(() => {
    if (!form.isConnected) cleanup();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  const unregister = onDispose(cleanup);
  const onClose = () => {
    if (!dialog.open || !form.isConnected) cleanup();
  };
  dialog?.addEventListener('close', onClose);
  form.onsubmit = async (e) => {
    e.preventDefault();
    if (!token || disposed) return;
    button.disabled = true;
    error.textContent = '';
    try {
      await submit(Object.fromEntries(new FormData(form)), token);
    } catch (e) {
      if (form.isConnected) error.textContent = e.message;
    } finally {
      token = '';
      if (!disposed && form.isConnected) {
        button.disabled = true;
        if (widget !== undefined) window.turnstile?.reset(widget);
      }
    }
  };
  try {
    if (!serviceConfig.turnstileSiteKey) throw Error('작성 보안 설정을 준비 중입니다.');
    const ts = await loadTurnstile();
    if (disposed || !form.isConnected) return;
    widget = ts.render($('.captcha-widget', form), {
      sitekey: serviceConfig.turnstileSiteKey,
      action: 'community',
      size: 'compact',
      theme: document.documentElement.dataset.theme,
      callback: (value) => {
        if (!disposed) {
          token = value;
          button.disabled = false;
        }
      },
      'expired-callback': () => {
        token = '';
        button.disabled = true;
      },
      'error-callback': () => {
        token = '';
        button.disabled = true;
        error.textContent = '보안 확인을 다시 완료해 주세요.';
      },
    });
  } catch (e) {
    if (!disposed) error.textContent = e.message;
  }
}
const mediaURL = (id) => serviceConfig.api + '/media/' + encodeURIComponent(id);
const avatarURL = (url) =>
  url?.startsWith('/media/')
    ? serviceConfig.api + url
    : (url || '').startsWith('https://')
      ? url
      : '';
const avatar = (url, name) =>
  url
    ? `<img class="fan-avatar" src="${esc(avatarURL(url))}" alt="${esc(name)}">`
    : `<span class="fan-avatar initials" aria-hidden="true">${esc((name || 'F').slice(0, 1))}</span>`;
const photos = (images) =>
  (images || []).length
    ? `<div class="post-photos">${images.map((i) => `<img src="${esc(mediaURL(i.id))}" alt="첨부 사진" loading="lazy">`).join('')}</div>`
    : '';
const pinInput = (n = 6, label = '작성 비밀번호', name = 'password') =>
  `<label>${label} · 숫자 ${n}자리<input name="${name}" type="password" inputmode="numeric" pattern="[0-9]{${n}}" minlength="${n}" maxlength="${n}" autocomplete="${name === 'newPassword' ? 'new-password' : 'off'}" required></label>`;
export function renderCommunity() {
  const signal = routeSignal();
  let requestId = 0,
    offset = 0,
    query = '',
    detailRequest = 0;
  onDispose(() => {
    requestId++;
    detailRequest++;
  });
  const params = new URLSearchParams(location.search);
  let board = params.get('board') || 'lucky';
  if (!['lucky', 'obsidus', 'staff'].includes(board)) board = 'lucky';
  const fan = board !== 'staff',
    group = board === 'obsidus' ? 'Obsidus' : 'LuckyTrick',
    name = board === 'obsidus' ? '옵시더스' : board === 'staff' ? 'SGIA 사내 게시판' : '럭키트릭';
  let feed = ['highlight', 'fan', 'artist', 'comments'].includes(params.get('feed'))
    ? params.get('feed')
    : 'highlight';
  if (!fan) feed = 'fan';
  let members = characters
    .filter((c) => c.team === board)
    .map((c) => ({ id: c.id, name: c.name, bio: c.role, avatar_url: c.portrait }));
  // Route-local palette: never replace the visitor's saved global theme.
  if (fan) {
    document.documentElement.dataset.communityTheme = board;
    onDispose(() => {
      delete document.documentElement.dataset.communityTheme;
    });
  }
  const adminLink = serviceConfig.api + '/admin?board=' + board;
  const communityModal = (title, html, kind) => {
    const d = modal(title, html, kind);
    d.dataset.community = board;
    return d;
  };
  $('#main').innerHTML =
    `<div class="fan-community ${board}" data-community="${board}"><nav class="community-switch"><a href="community.html?board=lucky" ${board === 'lucky' ? 'aria-current="page"' : ''}>ELYSIAN / 럭키트릭</a><a href="community.html?board=obsidus" ${board === 'obsidus' ? 'aria-current="page"' : ''}>OBSIDUS</a><a href="community.html?board=staff" ${!fan ? 'aria-current="page"' : ''}>SGIA 사내</a></nav>${fan ? `<header class="fan-hero"><div class="fan-system"><span>✦ COMMUNITY / ${board === 'lucky' ? 'ELYSIAN' : 'HUNTERWIND'}</span><span>♡ ♡ ♡ / ALWAYS CONNECTED</span></div><div class="fan-hero-title"><div><p>HELLO, OUR PEOPLE.</p><h1>${board === 'lucky' ? 'LUCKY<br>TOGETHER.' : 'IN OUR<br>ORBIT.'}</h1><span>${name}와 나누는, 가장 가까운 순간.</span></div><div class="fan-hero-art"><img src="${teamLogos[board]}" alt="${group}"><span class="fan-sticker">${board === 'lucky' ? 'YOU + US<br>♡ FOREVER' : 'BLACK / SILVER<br>GOLDEN MOMENTS'}</span></div></div><div class="fan-hero-foot"><b>${group.toUpperCase()} / FAN COMMUNITY</b><span>MEMBERS ONLINE IN OUR HEARTS ✧</span></div></header>` : heading('SGIA / INTERNAL VOICES', '사내 게시판', '동료들과 일상을 나누는 공간.')}<div class="fan-layout"><aside class="fan-sidebar"><section class="member-panel"><div class="fan-panel-bar"><b>${fan ? 'ARTISTS' : 'SGIA'}</b><span>− □ ×</span></div><div id="community-members"></div>${fan ? `<a class="agency-return" href="${board === 'lucky' ? 'elysian' : 'hunterwind'}.html">아티스트 페이지 ↗</a>` : ''}</section><section class="fan-welcome"><span>DEAR ${board === 'lucky' ? 'LUCKY HEARTS' : board === 'obsidus' ? 'OUR ORBIT' : 'COLLEAGUES'}</span><h2>오늘의 이야기를<br>들려주세요.</h2><p>마음에 드는 글에는 하트를,<br>함께하고 싶은 순간에는 답글을.</p><a class="community-admin" href="${adminLink}" target="_blank" rel="noopener">관리자 로그인 ↗</a></section></aside><section class="fan-feed"><div id="board-connection" class="board-connection" role="status">채널 연결 중…</div>${fan ? `<nav class="fan-feed-tabs" aria-label="피드 선택"><button data-feed="highlight">Highlight</button><button data-feed="fan">Fan</button><button data-feed="artist">From ${group}</button><button data-feed="comments">Comments by ${group}</button></nav>` : ''}<div id="staff-board-lock" class="access-lock" hidden><h2>SGIA 직원 채널</h2><p>사내 게시판을 열려면 직원 채널에 접속하세요.</p><button id="board-login" class="primary">직원 로그인</button></div><div id="board-workspace"><div class="fan-feed-heading"><div><span id="feed-kicker">OUR COMMUNITY</span><h2 id="feed-title"></h2></div><button id="write-post" class="primary">글쓰기 ＋</button></div><form class="board-search"><input id="board-search" aria-label="게시물 검색" placeholder="궁금한 이야기를 찾아보세요" maxlength="60"><button>검색</button></form><div id="board-list" class="fan-post-list"></div><div class="pagination"><button id="board-prev">← 이전</button><span id="board-page"></span><button id="board-next">다음 →</button></div></div></section></div></div>`;
  function drawMembers() {
    $('#community-members').innerHTML =
      members
        .map(
          (m) =>
            `<button class="member-button" data-member="${esc(m.id)}">${avatar(m.avatar_url, m.name)}<span data-user-content><b>${esc(m.name)}</b><small>ARTIST <i>✓</i></small></span><em>↗</em></button>`,
        )
        .join('') || '<p class="muted">INTERNAL / STAFF CHANNEL</p>';
    $$('[data-member]').forEach(
      (b) =>
        (b.onclick = () => {
          const m = members.find((m) => m.id === b.dataset.member);
          communityModal(
            m.name,
            `<article class="community-profile">${avatar(m.avatar_url, m.name)}<span class="artist-badge">ARTIST ✓</span><h3 data-user-content>${esc(m.name)}</h3><p data-user-content>${esc(m.bio)}</p><a href="${adminLink}&member=${encodeURIComponent(m.id)}" target="_blank" rel="noopener">관리자 프로필 편집 ↗</a></article>`,
            'community-post',
          );
        }),
    );
  }
  drawMembers();
  if (fan)
    api('/members?board=' + board)
      .then((r) => {
        if (!signal.aborted && Array.isArray(r.members)) {
          members = r.members;
          drawMembers();
        }
      })
      .catch(() => {});
  function setFeed(next) {
    feed = next;
    offset = 0;
    query = '';
    $('#board-search').value = '';
    const u = new URL(location.href);
    u.searchParams.set('feed', feed);
    history.replaceState({}, '', u);
    load();
  }
  $$('[data-feed]').forEach((b) => (b.onclick = () => setFeed(b.dataset.feed)));
  $('#board-login').onclick = () => login();
  async function load() {
    const ticket = ++requestId,
      locked = !fan && !state.staff;
    $('#staff-board-lock').hidden = locked === false;
    $('#board-workspace').hidden = locked;
    if (locked) {
      $('#board-list').replaceChildren();
      return;
    }
    $$('[data-feed]').forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.feed === feed)),
    );
    $('#feed-title').textContent = !fan
      ? name
      : {
          highlight: '지금, 우리가 좋아하는 이야기',
          fan: '팬들의 이야기',
          artist: group + '가 전하는 이야기',
          comments: group + '의 답장',
        }[feed];
    $('#feed-kicker').textContent = {
      highlight: 'HIGHLIGHT / MOST LOVED',
      fan: 'FAN / LATEST STORIES',
      artist: 'FROM / VERIFIED ARTISTS',
      comments: 'COMMENTS / ARTIST REPLIES',
    }[feed];
    $('.board-search').hidden = feed === 'comments';
    $('#write-post').textContent = feed === 'artist' ? '팬 글쓰기 ＋' : '글쓰기 ＋';
    $('#board-list').innerHTML = '<p class="empty-state">이야기를 불러오는 중…</p>';
    try {
      const r = await api(
        feed === 'comments'
          ? `/artist-comments?board=${board}&offset=${offset}`
          : `/posts?board=${board}&feed=${feed}&offset=${offset}&q=${encodeURIComponent(query)}`,
      );
      if (signal.aborted || ticket !== requestId) return;
      $('#board-connection').textContent = '● ' + name + ' · 채널 연결됨';
      const rows = feed === 'comments' ? r.comments || [] : r.posts || [];
      $('#board-list').innerHTML =
        rows
          .map((p) =>
            feed === 'comments'
              ? `<button class="post-row artist-comment-card" data-post="${esc(p.post_id)}"><div class="fan-author">${avatar(p.avatar_url, p.name)}<span><b data-user-content>${esc(p.name)}</b><i class="artist-badge">ARTIST ✓</i><time>${date(p.created_at)}</time></span></div><p class="feed-body" data-user-content>${esc(p.body)}</p><div class="reply-context" data-user-content>↳ ${esc(p.title)}</div><span class="feed-counts">♡ ${p.likes || 0} · 대화 보기 ↗</span></button>`
              : `<button class="post-row fan-post-card ${p.member_id ? 'official-post' : ''}" data-post="${esc(p.id)}"><div class="fan-author">${avatar(p.member?.avatar_url, p.member?.name || p.author)}<span><b data-user-content>${esc(p.member?.name || p.author)}</b>${p.member_id ? '<i class="artist-badge">ARTIST ✓</i>' : '<small>FAN</small>'}<time>${date(p.created_at)}${p.updated_at ? ' · 수정됨' : ''}</time></span></div><h3 data-user-content>${esc(p.title)}</h3><p class="feed-body" data-user-content>${esc((p.body || '').slice(0, 280))}</p>${photos(p.images)}<div class="feed-counts"><span>♡ ${p.likes || 0}</span><span>↳ ${p.comments || 0}</span>${p.department ? `<small data-user-content>${esc(p.department)}</small>` : ''}<b>이야기 보기 ↗</b></div></button>`,
          )
          .join('') ||
        `<div class="fan-empty"><span>✧</span><h3>${feed === 'artist' || feed === 'comments' ? '아티스트의 소식을 기다리고 있어요.' : '아직 등록된 이야기가 없어요.'}</h3><p>${feed === 'fan' || feed === 'highlight' ? '첫 이야기를 남겨 보세요.' : '새로운 소식이 도착하면 이곳에 표시됩니다.'}</p></div>`;
      $('#board-page').textContent = String(offset / 20 + 1);
      $('#board-prev').disabled = offset === 0;
      $('#board-next').disabled = !r.more;
    } catch (e) {
      if (signal.aborted || ticket !== requestId) return;
      $('#board-list').innerHTML = '<p class="empty-state">' + esc(e.message) + '</p>';
      $('#board-connection').textContent = '채널 연결 대기';
      $('#board-next').disabled = true;
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
    if (!fan && !state.staff) return login();
    communityModal(
      '팬 글쓰기 · ' + name,
      `<form id="post-form" class="board-form"><label>제목<input name="title" maxlength="100" required></label><div class="form-row"><label>닉네임<input name="author" maxlength="24" required></label>${pinInput()}</div>${!fan ? '<div class="form-row"><label>소속<select name="department" id="department-choice"><option>오리진</option><option>비콘</option><option>실드</option><option>가이드 관리국</option><option>센티넬 관리국</option><option>일반 행정</option><option>괴물</option><option>익명</option><option value="custom">직접 입력</option></select></label><label id="department-custom-label" hidden>직접 입력<input name="customDepartment" maxlength="40"></label></div>' : ''}<label>내용<textarea name="body" maxlength="5000" required></textarea></label>${uploadMarkup}${consent()}${captchaMarkup()}<button class="primary" type="submit">등록</button><small>작성 비밀번호를 기억해 주세요. 수정·삭제에 사용합니다.</small></form>`,
      'community-post',
    );
    const f = $('#post-form'),
      images = attachmentPicker(f, [], mediaURL);
    $('#department-choice')?.addEventListener('change', (e) => {
      $('#department-custom-label').hidden = e.target.value !== 'custom';
      $('input', $('#department-custom-label')).required = e.target.value === 'custom';
    });
    secureForm(f, async (data, captcha) => {
      if (!fan && !state.staff) throw Error('직원 채널에 다시 접속해 주세요.');
      await api('/posts', 'POST', {
        ...data,
        images: images(),
        board,
        department: data.department === 'custom' ? data.customDepartment : data.department || '',
        captcha,
        consent: data.consent === 'on',
      });
      $('#document-dialog').close();
      setFeed('fan');
      toast('게시물이 저장되었습니다.');
    });
  };
  async function openPost(id) {
    if (!fan && !state.staff) return login(() => openPost(id));
    const ticket = ++detailRequest;
    try {
      const data = await api('/posts/' + id);
      if (signal.aborted || ticket !== detailRequest || (!fan && !state.staff)) return;
      const p = data.post;
      let replyTo = null;
      const commentMarkup = (c) =>
        `<article class="comment-row ${c.parent_id ? 'is-reply' : ''}" id="comment-${esc(c.id)}"><div class="fan-author">${avatar(c.avatar_url, c.member_name || c.author)}<span><b data-user-content>${esc(c.member_name || c.author)}</b>${c.member_id ? '<i class="artist-badge">ARTIST ✓</i>' : ''}<time>${date(c.created_at)}${c.updated_at ? ' · 수정됨' : ''}</time></span></div><p data-user-content>${esc(c.body)}</p><div class="comment-tools"><button data-comment-like="${esc(c.id)}" aria-pressed="${!!c.liked}">♡ ${c.likes || 0}</button><button data-reply="${esc(c.id)}">답글</button>${!c.member_id ? `<button data-comment-edit="${esc(c.id)}">수정</button><button data-comment-delete="${esc(c.id)}">삭제</button>` : ''}</div></article>`;
      const ordered = data.comments
        .filter((c) => !c.parent_id)
        .flatMap((c) => [c, ...data.comments.filter((r) => r.parent_id === c.id)]);
      communityModal(
        p.title,
        `<div class="fan-post-detail" data-community="${board}"><div class="fan-author">${avatar(p.member?.avatar_url, p.member?.name || p.author)}<span data-user-content><b>${esc(p.member?.name || p.author)}</b>${p.member_id ? '<i class="artist-badge">ARTIST ✓</i>' : ''}<time>${date(p.created_at)}${p.updated_at ? ' · 수정됨' : ''}</time></span></div><div class="post-body" data-user-content>${esc(p.body)}</div>${photos(p.images)}<div class="post-controls"><button id="post-like" aria-pressed="${!!p.liked}">♡ <span>좋아요</span> <b>${p.likes || 0}</b></button>${!p.member_id ? '<button id="post-edit">수정</button><button id="post-delete">삭제</button>' : ''}<a href="${adminLink}&post=${encodeURIComponent(id)}" target="_blank" rel="noopener">관리자 관리 ↗</a></div><h3>댓글 ${data.comments.length}</h3><div class="comments">${ordered.map(commentMarkup).join('')}</div><form id="comment-form" class="board-form comment-form"><div id="reply-target" hidden><span></span><button id="reply-cancel" type="button">취소 ×</button></div><div class="form-row"><label>닉네임<input name="author" maxlength="24" required></label>${pinInput()}</div><label>댓글<textarea name="body" maxlength="1000" required></textarea></label>${consent()}${captchaMarkup()}<button type="submit" class="primary">댓글 등록</button></form></div>`,
        'community-post',
      );
      $('#post-like').onclick = (e) => like(e.currentTarget, '/posts/' + id + '/like');
      if ($('#post-edit')) $('#post-edit').onclick = () => edit('posts', p, id, false);
      if ($('#post-delete')) $('#post-delete').onclick = () => edit('posts', p, id, true);
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
      $$('[data-comment-like]').forEach(
        (b) => (b.onclick = () => like(b, '/comments/' + b.dataset.commentLike + '/like')),
      );
      $$('[data-reply]').forEach(
        (b) =>
          (b.onclick = () => {
            const c = data.comments.find((c) => c.id === b.dataset.reply);
            replyTo = c.parent_id || c.id;
            $('#reply-target').hidden = false;
            $('#reply-target span').textContent = (c.member_name || c.author) + '에게 답글';
            $('#comment-form textarea').focus();
          }),
      );
      $('#reply-cancel').onclick = () => {
        replyTo = null;
        $('#reply-target').hidden = true;
      };
      secureForm($('#comment-form'), async (form, captcha) => {
        if (!fan && !state.staff) throw Error('직원 채널에 다시 접속해 주세요.');
        await api('/posts/' + id + '/comments', 'POST', {
          ...form,
          parent_id: replyTo,
          captcha,
          consent: form.consent === 'on',
        });
        await openPost(id);
        load();
        toast('댓글을 저장했습니다.');
      });
    } catch (e) {
      if (!signal.aborted) toast(e.message);
    }
  }
  async function like(button, path) {
    button.disabled = true;
    try {
      const r = await api(path, 'POST', { liked: button.getAttribute('aria-pressed') !== 'true' });
      button.setAttribute('aria-pressed', String(r.liked));
      button.textContent = (r.liked ? '♥ ' : '♡ ') + r.likes;
      load();
    } catch (e) {
      toast(e.message);
    } finally {
      button.disabled = false;
    }
  }
  function edit(kind, item, parent, deleting) {
    const legacy = item.pin_length === 4;
    // Replace the form in the open dialog. Closing/reopening here dispatches a delayed close event that destroys the new captcha widget.
    communityModal(
      deleting ? '작성 기록 삭제' : '작성 기록 수정',
      `<form class="board-form" id="edit-form">${deleting ? '<p>삭제하면 본문을 복구할 수 없습니다. 게시글을 삭제하면 댓글도 함께 삭제됩니다.</p>' : `${kind === 'posts' ? `<label>제목<input name="title" maxlength="100" value="${esc(item.title)}" required></label>` : ''}<label>내용<textarea name="body" maxlength="${kind === 'posts' ? 5000 : 1000}" required>${esc(item.body)}</textarea></label>${kind === 'posts' ? uploadMarkup : ''}`}${pinInput(legacy ? 4 : 6, legacy ? '기존 작성 비밀번호' : '작성 비밀번호')}${legacy && !deleting ? pinInput(6, '새 비밀번호', 'newPassword') + '<small>기존 글은 이번 수정부터 6자리 비밀번호로 보호됩니다.</small>' : ''}${captchaMarkup()}<button class="primary" type="submit">${deleting ? '삭제 확인' : '수정 저장'}</button></form>`,
      'community-post',
    );
    const f = $('#edit-form'),
      images =
        !deleting && kind === 'posts' ? attachmentPicker(f, item.images || [], mediaURL) : null;
    secureForm(f, async (data, captcha) => {
      if (!fan && !state.staff) throw Error('직원 채널에 다시 접속해 주세요.');
      await api('/' + kind + '/' + item.id, deleting ? 'DELETE' : 'PATCH', {
        ...data,
        ...(images ? { images: images() } : {}),
        captcha,
      });
      if (kind === 'posts' && deleting) $('#document-dialog').close();
      else await openPost(parent);
      load();
      toast(deleting ? '삭제했습니다.' : '수정했습니다.');
    });
  }
  listen(document, 'sgia:viewer', () => {
    if (!fan) {
      if (!state.staff && $('#document-dialog').open) $('#document-dialog').close();
      load();
    }
  });
  load();
}
