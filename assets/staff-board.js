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
import { staffTags } from './staff-tags.js';
import { esc } from './runtime.js';
export const channelName = (channel) => (channel === 'soliloquy' ? '혼잣말' : '자유게시판');
export const tagOptions = (selected) =>
  '<option value="">모든 캐릭터·팀</option>' +
  staffTags
    .map(
      (t) =>
        `<option value="${t.id}" ${selected === t.id ? 'selected' : ''}>${esc(t.label)}</option>`,
    )
    .join('');
export const tagsMarkup = (tags) =>
  tags?.length
    ? `<div class="staff-tags" data-user-content>${tags.map((id) => `<span>#${esc(staffTags.find((t) => t.id === id)?.label || id)}</span>`).join('')}</div>`
    : '';
export function staffFields(channel = 'free', tags = []) {
  return `<div class="staff-fields"><label>게시판<select name="channel"><option value="free" ${channel === 'free' ? 'selected' : ''}>자유게시판 · SGIA 직장 생활</option><option value="soliloquy" ${channel === 'soliloquy' ? 'selected' : ''}>혼잣말 · 캐릭터 덕질</option></select></label><fieldset class="staff-tag-picker" ${channel === 'soliloquy' ? '' : 'hidden'}><legend>캐릭터·팀 태그 · 최대 5개</legend><div>${staffTags.map((t) => `<label><input type="checkbox" name="tags" value="${t.id}" ${tags.includes(t.id) ? 'checked' : ''}><span>${esc(t.label)}</span></label>`).join('')}</div></fieldset></div>`;
}
export function connectStaffFields(form) {
  const select = form.elements.channel;
  if (!select) return;
  select.onchange = () => {
    form.querySelector('.staff-tag-picker').hidden = select.value !== 'soliloquy';
  };
}
export const readStaffFields = (form) => ({
  channel: form.elements.channel.value,
  tags: form.elements.channel.value === 'soliloquy' ? new FormData(form).getAll('tags') : [],
});
