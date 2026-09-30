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

const tagChip = id => { const t = staffTagInfo(id); return `<span class="staff-tag tag-${t.kind}" title="${t.kind === 'team' ? '팀 주제' : t.kind === 'member' ? '인물' : '직접 입력'}">#${esc(t.label)}</span>`; };
export const tagOptions = (selected, extra = []) => '<option value="">모든 캐릭터·팀</option>' + [...staffTags, ...[...new Set(extra)].filter(id => id !== selected && !staffTags.some(t => t.id === id)).map(id => ({id})), ...(selected && !staffTags.some(t => t.id === selected) ? [{id:selected}] : [])].map(t => `<option value="${esc(t.id)}" ${selected === t.id ? 'selected' : ''}>${esc(staffTagInfo(t.id).label)}</option>`).join('');
export const tagsMarkup = tags => tags?.length ? `<div class="staff-tags" data-user-content>${tags.map(tagChip).join('')}</div>` : '';
const customChip = id => `<label class="custom-tag" data-user-content><input type="hidden" name="tags" value="${esc(id)}">${tagChip(id)}<button type="button" class="remove-tag" aria-label="${esc(staffTagInfo(id).label)} 태그 삭제">×</button></label>`;
export function staffFields(channel = 'free', tags = []) {
 return `<div class="staff-fields"><label>게시판<select name="channel"><option value="free" ${channel === 'free' ? 'selected' : ''}>자유게시판 · SGIA 직장 생활</option><option value="soliloquy" ${channel === 'soliloquy' ? 'selected' : ''}>혼잣말 · 캐릭터 덕질</option></select></label><fieldset class="staff-tag-picker"><legend>관심 태그 · 최대 5개</legend><p class="tag-legend"><span class="tag-team">◆ 팀</span> <span class="tag-member">● 인물</span></p><div>${staffTags.map(t => `<label><input type="checkbox" name="tags" value="${t.id}" ${tags.includes(t.id) ? 'checked' : ''}>${tagChip(t.id)}</label>`).join('')}</div><div class="custom-tags">${tags.filter(t => !staffTags.some(x => x.id === t)).map(customChip).join('')}</div><div class="custom-tag-entry"><label>종류<select class="tag-kind"><option value="custom">일반 태그</option><option value="custom-team">팀 주제</option></select></label><label>직접 입력<input class="tag-text" maxlength="40" placeholder="태그 또는 팀 주제"></label><button type="button" class="add-tag">추가</button></div><small class="tag-error" role="status"></small></fieldset></div>`;
}
export function connectStaffFields(form) {
 const picker = form.querySelector('.staff-tag-picker'); if (!picker) return;
 const error = picker.querySelector('.tag-error');
 const add = () => {
  const input = picker.querySelector('.tag-text');
  const id = picker.querySelector('.tag-kind').value + ':' + input.value.trim();
  const tags = new FormData(form).getAll('tags');
  if (!validStaffTag(id)) {error.textContent = '태그를 1~40자로 입력해 주세요.'; return;}
  if (tags.includes(id)) {error.textContent = '이미 선택한 태그입니다.'; return;}
  if (tags.length >= 5) {error.textContent = '태그는 5개까지 선택할 수 있습니다.'; return;}
  picker.querySelector('.custom-tags').insertAdjacentHTML('beforeend', customChip(id)); input.value = ''; error.textContent = ''; input.focus();
 };
 picker.querySelector('.add-tag').addEventListener('click', add);
 picker.querySelector('.tag-text').addEventListener('keydown', e => {if(e.key === 'Enter'){e.preventDefault();add();}});
 picker.addEventListener('click', e => {const button = e.target.closest('.remove-tag'); if(button){button.closest('.custom-tag').remove();error.textContent = '';}});
 picker.addEventListener('change', e => {if(e.target.type === 'checkbox' && new FormData(form).getAll('tags').length > 5){e.target.checked = false;error.textContent = '태그는 5개까지 선택할 수 있습니다.';}});
}
export const readStaffFields = form => ({channel: form.elements.channel.value, tags: new FormData(form).getAll('tags')});
