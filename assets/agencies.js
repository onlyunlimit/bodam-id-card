import { $, $$, esc, heading, modal } from './runtime.js';
import { characters } from './characters.js';
import { detailImage, dossier } from './units.js';
import { teamLogos } from './media.js';
import { personName, registerCopy } from './i18n.js';
import { agencyGallery } from './agency-gallery.js';
[
  ['아티스트', 'Artists', 'アーティスト', '艺人'],
  ['화보 갤러리', 'Editorial gallery', 'フォトギャラリー', '写真画廊'],
  ['공식 팬 커뮤니티', 'Official fan community', '公式ファンコミュニティ', '官方粉丝社区'],
  ['엘리시안', 'Elysian', 'エリシアン', '伊利西安'],
  ['헌터윈드', 'Hunterwind', 'ハンターウィンド', '猎风'],
  ['이미지 이전', 'Previous image', '前の画像', '上一张'],
  ['이미지 다음', 'Next image', '次の画像', '下一张'],
].forEach((row) => registerCopy(...row));
export function renderAgency(agency) {
  const lucky = agency === 'elysian',
    team = lucky ? 'lucky' : 'obsidus',
    people = characters.filter((c) => c.team === team);
  $('#main').innerHTML =
    `<div class="agency-site ${team}"><nav class="agency-nav"><a href="entertainment.html">← ENTERTAINMENT</a><b>${agency.toUpperCase()}</b><a href="${lucky ? 'hunterwind' : 'elysian'}.html">${lucky ? 'HUNTERWIND' : 'ELYSIAN'} ↗</a></nav><section class="agency-hero"><div class="agency-hero-grid" aria-hidden="true"></div><span class="agency-kicker">${lucky ? 'ELYSIAN ARTIST MANAGEMENT' : 'HUNTERWIND / ARTIST DIVISION'}</span><h1>${lucky ? '엘리시안' : '헌터윈드'}</h1><img class="agency-wordmark" src="${teamLogos[team]}" alt="${lucky ? 'LUCKY TRICK' : 'OBSIDUS'}"><div class="agency-lineup">${people.map((c, i) => `<button data-artist="${c.id}" style="--artist:${i}" aria-label="${esc(personName(c))} 프로필"><img src="${detailImage(c)}" alt="${esc(personName(c))}"><span>${esc(personName(c))}<small>${c.code}</small></span></button>`).join('')}</div><div class="agency-hero-foot"><span>${lucky ? 'LIGHT / MOTION / LUCK' : 'STEEL / SHADOW / SOUND'}</span><a href="#artists">아티스트 ↓</a></div></section><section id="artists" class="artist-roster"><div class="agency-section-title"><span>01 / ARTISTS</span><h2>${lucky ? 'LUCKY TRICK' : 'OBSIDUS'}</h2><a href="community.html?board=${team}">공식 팬 커뮤니티 ↗</a></div><div class="artist-strips">${people.map((c, i) => `<button data-artist="${c.id}" class="artist-strip"><span>0${i + 1}</span><img src="${c.portrait}" alt=""><strong>${esc(personName(c))}<small>${c.code}</small></strong><span>${esc(c.role)}</span><b>↗</b></button>`).join('')}</div></section><section class="agency-gallery"><div class="agency-section-title"><span>02 / VISUAL ARCHIVE</span><h2>화보 갤러리</h2></div><div class="gallery-grid"></div></section></div>`;
  $$('[data-artist]').forEach(
    (b) => (b.onclick = () => dossier(people.find((c) => c.id === b.dataset.artist))),
  );
  const pictures = [
    ...people.map((c) => ({ url: detailImage(c), caption: c.code })),
    ...(agencyGallery[team] || []),
  ];
  $('.gallery-grid').innerHTML = pictures
    .map(
      (g, i) =>
        `<button data-gallery-index="${i}"><img src="${g.url}" alt="${esc(g.caption)}" loading="lazy"><span>${esc(g.caption)} <small>0${i + 1} ↗</small></span></button>`,
    )
    .join('');
  const show = (i) => {
    const g = pictures[(i + pictures.length) % pictures.length];
    const d = modal(
      g.caption,
      `<div class="gallery-lightbox"><img src="${g.url}" alt="${esc(g.caption)}"><div><button id="gallery-prev" aria-label="이미지 이전">←</button><span>${((i + pictures.length) % pictures.length) + 1} / ${pictures.length}</span><button id="gallery-next" aria-label="이미지 다음">→</button></div></div>`,
      'gallery',
    );
    $('#gallery-prev').onclick = () => show((i - 1 + pictures.length) % pictures.length);
    $('#gallery-next').onclick = () => show((i + 1) % pictures.length);
  };
  $$('[data-gallery-index]').forEach((b) => (b.onclick = () => show(+b.dataset.galleryIndex)));
}

export function renderAgencyDirectory() {
  $('#main').innerHTML =
    heading(
      'ENTERTAINMENT / ARTIST LABELS',
      '헌터 엔터테인먼트',
      '각성관과 기획사가 함께 운용하는 공식 헌터 크루.',
    ) +
    `<div class="label-directory">${['lucky', 'obsidus']
      .map((team, i) => {
        const people = characters.filter((c) => c.team === team);
        return `<a class="directory-card label-showcase ${team}" href="${i ? 'hunterwind' : 'elysian'}.html"><div class="label-top"><span>${i ? 'HUNTERWIND' : 'ELYSIAN'} / ARTIST MANAGEMENT</span><b>0${i + 1}</b></div><div class="label-portraits">${people.map((c, j) => `<span style="--person:${j}"><img src="${detailImage(c)}" alt="${esc(personName(c))}"></span>`).join('')}</div><img class="label-wordmark" src="${teamLogos[team]}" alt="${i ? 'OBSIDUS' : 'LUCKY TRICK'}"><div class="label-bottom"><h2>${i ? '옵시더스' : '럭키트릭'}</h2><span>${i ? 'METAL / DUST / STAGE' : 'LIGHT / LUCK / STAGE'}</span><b>↗</b></div></a>`;
      })
      .join('')}</div>`;
}
