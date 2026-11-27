// OBSIDUS crew page data. Profile facts and gallery images come from characters.js;
// hero cut-outs are the transparent images supplied for this page (2026-11-28).
import { characters } from './characters.js';

const cdn = (id) => `https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim/${id}`;
const cutouts = {
  chabin: cdn('e79d224e-c85f-4cf3-83a9-c9eaa0ebf40a?v=002432'),
  hanho: cdn('f8e8c6a9-214b-4c95-bc9c-1ffd764a5c70?v=0ea58e'),
  mohyun: cdn('97a1a49d-2962-4e17-9c84-f76152692c8c?v=4ccb78'),
  yuhwan: cdn('150ee155-5bb6-443d-9943-f5002c15cac7?v=60e42f'),
};
// Weapon line uses only what the published profile states.
const weapons = { chabin: '주변 물질을 바꾼 무기', hanho: '특수 탄환 (저격)', mohyun: '거대한 방패', yuhwan: '촉수형 기계팔' };
const palette = {
  chabin: ['#E8C36A', 'rgba(232,195,106,.42)', 'linear-gradient(145deg,#1b1b1f 0%,#3a2f17 55%,#0d0d10 100%)', 'linear-gradient(135deg,#c9a24a,#3a2f17)'],
  hanho: ['#C4A8FF', 'rgba(196,168,255,.42)', 'linear-gradient(145deg,#191624 0%,#3a2c5c 55%,#0e0c16 100%)', 'linear-gradient(135deg,#a98bff,#2d2148)'],
  mohyun: ['#C9B79C', 'rgba(201,183,156,.4)', 'linear-gradient(145deg,#1c1a17 0%,#433a2e 55%,#0f0e0c 100%)', 'linear-gradient(135deg,#b39c78,#3b3226)'],
  yuhwan: ['#9CD3FF', 'rgba(156,211,255,.42)', 'linear-gradient(145deg,#111821 0%,#1e3b57 55%,#0a0f15 100%)', 'linear-gradient(135deg,#7cc3ff,#173049)'],
};
const sticker = (color, cls, rot) => `<svg class="polco-sticker ${cls}" style="--st-rot:${rot}deg;transform:rotate(${rot}deg)" viewBox="0 0 64 64"><path d="M32 4 L38 26 L60 32 L38 38 L32 60 L26 38 L4 32 L26 26 Z" fill="${color}" stroke="#0b0d12" stroke-width="2.5" stroke-linejoin="round"/><circle cx="32" cy="32" r="4.5" fill="#0b0d12"/></svg>`;
const edition = (label = '', i) => (/메인/.test(label) ? 'MAIN PORTRAIT' : /서브/.test(label) ? 'SUB PORTRAIT' : /CONCEPT/.test(label) ? `CONCEPT EDITION ${String(i).padStart(2, '0')}` : `PORTRAIT EDITION ${String(i).padStart(2, '0')}`);

export const obsidusMembers = ['chabin', 'hanho', 'mohyun', 'yuhwan'].map((id) => {
  const c = characters.find((x) => x.id === id);
  const [accent, glow, binder, strap] = palette[id];
  const gallery = c.gallery?.length ? c.gallery : [{ url: c.portrait, label: '' }];
  const pick = (n) => gallery[n % gallery.length].url;
  return {
    id,
    nameKo: c.name,
    nameEn: c.code,
    grade: `${c.rank}급 Sentinel`,
    gradeShort: c.rank,
    age: `${c.age}세`,
    role: c.role.replace(' / ', ', '),
    appearance: c.appearance,
    ability: c.ability,
    weapon: weapons[id],
    location: 'SGIA 헌터 크루 생활 구역 · 기획사 헌터윈드 (HUNTERWIND)',
    notes: [c.bio, c.notes],
    accent,
    glowRgba: glow,
    binderBg: binder,
    binderStrapBg: strap,
    binderGlow: glow,
    stickersHtml: sticker(accent, 'w-11 h-11 top-4 left-11', -14) + sticker('#F4F6FA', 'w-9 h-9 top-6 right-6', 18) + sticker(accent, 'w-10 h-10 bottom-6 right-7', 10),
    cutoutPhoto: cutouts[id],
    heroBgPhoto: c.portrait,
    editorialPhotos: [{ url: pick(1) }, { url: pick(2) }, { url: pick(3) }],
    photocards: gallery.map((g, i) => ({ url: g.url, label: edition(g.label, i) })),
  };
});
