import { registerCopy } from './i18n.js';
[
  [
    "자유게시판",
    "Free board",
    "自由掲示板",
    "自由讨论区"
  ],
  [
    "혼잣말",
    "Fandom talk",
    "ひとりごと",
    "独白"
  ],
  [
    "게시판",
    "Board",
    "掲示板",
    "板块"
  ],
  [
    "모든 캐릭터·팀",
    "All characters / teams",
    "すべての人物・チーム",
    "所有角色和团队"
  ],
  [
    "관심 태그",
    "Follow a tag",
    "タグで絞り込み",
    "关注标签"
  ],
  [
    "캐릭터·팀 태그 · 최대 5개",
    "Character / team tags · up to 5",
    "人物・チームタグ・最大5個",
    "角色和团队标签 · 最多5个"
  ],
  [
    "자유게시판 · SGIA 직장 생활",
    "Free board · Working at SGIA",
    "自由掲示板・SGIAの日常",
    "自由讨论 · SGIA职场生活"
  ],
  [
    "혼잣말 · 캐릭터 덕질",
    "Fandom talk · Characters we love",
    "ひとりごと・推しの話",
    "独白 · 角色同好"
  ],
  [
    "동료들의 일상, 그리고 캐릭터를 좋아하는 마음.",
    "Life with colleagues, love for our characters.",
    "同僚との日常、そしてキャラクターへの想い。",
    "同事的日常，以及对角色的喜爱。"
  ],
  [
    "업무 · 일상 · 회사 이야기",
    "Work · Life · Office talk",
    "仕事・日常・会社の話",
    "工作 · 日常 · 公司话题"
  ],
  [
    "캐릭터 · 팀 · 덕질 이야기",
    "Characters · Teams · Fandom",
    "キャラ・チーム・推しの話",
    "角色 · 团队 · 同好交流"
  ],
  [
    "오늘도 무사 퇴근.",
    "Another day at the office.",
    "今日も無事に退勤。",
    "今天也顺利下班。"
  ],
  [
    "여기서는 세계관 밖의 이야기.",
    "A space beyond the fourth wall.",
    "ここでは世界観の外の話を。",
    "在这里聊世界观之外的事。"
  ],
  [
    "부서 동료와 나누는 직장 생활. 질문과 고민을 편하게 남겨 보세요.",
    "Talk about office life with colleagues. Share questions and concerns.",
    "同僚と語る職場の毎日。質問や悩みを気軽にどうぞ。",
    "与同事分享职场生活，轻松聊聊问题和烦恼。"
  ],
  [
    "SGIA 캐릭터를 좋아하는 독자들의 공간. 인물이나 팀 태그로 주인공을 알려주세요.",
    "For readers who love SGIA characters. Tag a character or team.",
    "SGIAキャラを愛する読者の場所。人物やチームのタグを選んでください。",
    "喜爱SGIA角色的读者空间。用角色或团队标签标明主角。"
  ]
].forEach((row) => registerCopy(...row));
import { staffTags, staffTagInfo, validStaffTag } from './staff-tags.js';
import { esc } from './runtime.js';
export const channelName = (channel) => (channel === 'soliloquy' ? '혼잣말' : '자유게시판');

const tagChip = id => `<span class="staff-hashtag">#${esc(staffTagInfo(id).label)}</span>`;
export const tagOptions = (selected, extra = []) => '<option value="">모든 캐릭터·팀</option>' + [...staffTags, ...[...new Set(extra)].filter(id => id !== selected && !staffTags.some(t => t.id === id)).map(id => ({id})), ...(selected && !staffTags.some(t => t.id === selected) ? [{id:selected}] : [])].map(t => `<option value="${esc(t.id)}" ${selected === t.id ? 'selected' : ''}>${esc(staffTagInfo(t.id).label)}</option>`).join('');
export const tagsMarkup = tags => tags?.length ? `<div class="staff-tags" data-user-content>${tags.map(tagChip).join('')}</div>` : '';

const editors = new WeakMap();
export function staffFields(channel = 'free', tags = []) {
  return `<div class="staff-fields"><label>게시판<select name="channel"><option value="free" ${channel === 'free' ? 'selected' : ''}>자유게시판 · SGIA 직장 생활</option><option value="soliloquy" ${channel === 'soliloquy' ? 'selected' : ''}>혼잣말 · 캐릭터 덕질</option></select></label><div class="hashtag-editor"><label for="staff-hashtags">태그<input id="staff-hashtags" name="hashtagText" value="" placeholder="#태그 입력" maxlength="220" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="hashtag-suggestions" aria-describedby="hashtag-help"></label><div class="selected-hashtags" role="list" aria-label="선택한 태그" data-user-content></div><button type="button" class="hashtag-add">태그 추가</button><small id="hashtag-help">#으로 검색한 뒤 선택하거나 Enter로 추가하세요. 최대 5개.</small><div id="hashtag-suggestions" class="hashtag-suggestions" role="listbox" aria-label="태그 추천" hidden data-user-content></div><small class="hashtag-status" role="status"></small><input type="hidden" name="originalTags" value="${esc(JSON.stringify(tags))}"></div></div>`;
}
export function connectStaffFields(form, request) {
  const input = form.elements.hashtagText;
  if (!input) return;
  const list = form.querySelector('.hashtag-suggestions');
  const status = form.querySelector('.hashtag-status');
  const catalog = new Map(staffTags.map(t => [staffTagInfo(t.id).label, t.id]));
  for (const id of JSON.parse(form.elements.originalTags.value)) catalog.set(staffTagInfo(id).label, id);
  const selected = [...JSON.parse(form.elements.originalTags.value)];
  const chips = form.querySelector('.selected-hashtags');
  const renderSelected = () => {
    chips.innerHTML = selected.map((id, i) => `<span role="listitem" class="selected-hashtag">#${esc(staffTagInfo(id).label)}<button type="button" data-remove-tag="${i}" aria-label="${esc(staffTagInfo(id).label)} 태그 삭제">×</button></span>`).join('');
  };
  renderSelected();
  let ticket = 0, timer, options = [], active = -1;
  const close = () => { list.hidden = true; list.replaceChildren(); options = []; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); active = -1; };
  const segment = () => {
    const caret = input.selectionStart ?? input.value.length;
    const start = input.value.lastIndexOf('#', caret - 1);
    if (start < 0) return null;
    const next = input.value.indexOf('#', caret);
    return { start, end: next < 0 ? input.value.length : next, query: input.value.slice(start + 1, caret).trim() };
  };
  const draw = rows => {
    rows = rows.filter(t => !selected.some(id => staffTagInfo(id).label.toLocaleLowerCase() === t.label.toLocaleLowerCase()));
    options = rows; active = -1; input.removeAttribute('aria-activedescendant');
    list.innerHTML = rows.map((t, i) => `<button type="button" role="option" aria-selected="false" id="hashtag-option-${i}" data-option="${i}">#${esc(t.label)}</button>`).join('');
    list.hidden = !rows.length; input.setAttribute('aria-expanded', String(!!rows.length));
  };
  const update = () => {
    const current = ++ticket; clearTimeout(timer);
    const part = segment(); if (!part) { close(); status.textContent = ''; return; }
    const query = part.query.toLocaleLowerCase();
    draw([...catalog].filter(([label]) => label.toLocaleLowerCase().includes(query)).slice(0,20).map(([label,id]) => ({label,id})));
    status.textContent = '';
    timer = setTimeout(async () => {
      if (!request || !form.isConnected || document.activeElement !== input) return;
      try {
        const r = await request('/staff-tags?q=' + encodeURIComponent(part.query));
        if (current !== ticket || !form.isConnected || document.activeElement !== input) return;
        const rows = (r.tags || []).filter(t => typeof t.label === 'string' && validStaffTag(t.id));
        rows.forEach(t => catalog.set(t.label,t.id));
        draw(rows);
        status.textContent = rows.length ? '' : '새 태그로 저장할 수 있어요.';
      } catch { if(current === ticket && form.isConnected) status.textContent = '추천을 불러오지 못했어요. 직접 입력해 저장할 수 있어요.'; }
    }, 180);
  };
  const add = (chosen) => {
    const raw = input.value.trim();
    if (!chosen && !raw) return true;
    if (!chosen && !raw.startsWith('#')) {status.textContent = '태그 앞에 #을 붙여 주세요.'; return false;}
    const labels = chosen ? [chosen.label] : [...new Set(raw.split('#').map(t => t.trim()).filter(Boolean))];
    if (!labels.length) {status.textContent = '태그 이름을 입력해 주세요.'; return false;}
    const additions = labels.filter(label => !selected.some(id => staffTagInfo(id).label.toLocaleLowerCase() === label.toLocaleLowerCase())).map(label => chosen?.id || catalog.get(label) || 'custom:' + label);
    if (!additions.length) {status.textContent = '이미 추가한 태그입니다.'; return false;}
    if (selected.length + additions.length > 5) {status.textContent = '태그는 최대 5개까지 추가할 수 있어요.'; return false;}
    if (additions.some(id => !validStaffTag(id))) {status.textContent = '태그 이름은 1~40자로 입력해 주세요.'; return false;}
    selected.push(...additions);
    additions.forEach(id => catalog.set(staffTagInfo(id).label,id));
    ticket++; clearTimeout(timer); close(); input.value = ''; status.textContent = '';
    renderSelected(); return true;
  };
  const choose = index => {
    const option = options[index]; if (!option) return;
    if (add(option)) input.focus();
  };
  editors.set(form, {selected, add, status});
  form.querySelector('.hashtag-add').addEventListener('click', () => {if(add())input.focus();});
  chips.addEventListener('click', e => {
    const button = e.target.closest('[data-remove-tag]'); if(!button)return;
    selected.splice(Number(button.dataset.removeTag),1);renderSelected();status.textContent = '';input.focus();update();
  });
  input.addEventListener('input', update);
  input.addEventListener('focus', update);
  input.addEventListener('click', update);
  input.addEventListener('blur', () => {ticket++; clearTimeout(timer); close();});
  list.addEventListener('pointerdown', e => { const button = e.target.closest('[data-option]'); if(button)e.preventDefault(); });
  list.addEventListener('click', e => {const button = e.target.closest('[data-option]');if(button)choose(Number(button.dataset.option));});
  input.addEventListener('keydown', e => {
    if (e.isComposing) return;
    if(e.key === 'Escape'){e.preventDefault();e.stopPropagation();ticket++;clearTimeout(timer);close();}
    if(e.key === 'Enter'){e.preventDefault();if(active >= 0)choose(active);else add();}
    if(!list.hidden && ['ArrowDown','ArrowUp'].includes(e.key)){
      e.preventDefault();active = (active + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
      [...list.children].forEach((el,i) => el.setAttribute('aria-selected',String(i === active)));
      input.setAttribute('aria-activedescendant',list.children[active].id);list.children[active].scrollIntoView({block:'nearest'});
    }
  });
}
export function readStaffFields(form) {
  const editor = editors.get(form);
  if (!editor) throw Error('태그 입력을 다시 열어 주세요.');
  if (!editor.add()) throw Error(editor.status.textContent);
  return {channel:form.elements.channel.value, tags:[...editor.selected]};
}
