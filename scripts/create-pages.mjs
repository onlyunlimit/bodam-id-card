import { writeFile } from 'node:fs/promises';
const pages = {
  portal: ['overview', '통합 관제'],
  departments: ['departments', '조직·부서'],
  origin: ['unit', '오리진'],
  beacon: ['unit', '비콘'],
  shield: ['unit', '실드'],
  entertainment: ['entertainment', '헌터 엔터테인먼트'],
  lucky: ['unit', '럭키트릭'],
  obsidus: ['unit', '옵시더스'],
  orpe: ['orpe', '위협 정보'],
  records: ['records', '사건 기록실'],
  headquarters: ['headquarters', '각성관 층별 안내'],
  manual: ['manual', '세계관 안내서'],
  community: ['community', '커뮤니티'],
};
for (const [file, [page, title]] of Object.entries(pages))
  await writeFile(
    `${file}.html`,
    `<!doctype html>
<html lang="ko" data-theme="dark"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#101b2b"><meta name="description" content="SGIA 국가 각성자 통합관리청 — ${title}. onlyunlimit 창작 세계관."><title>${title} | SGIA</title><link rel="icon" href="assets/art/silver-emblem.webp" type="image/webp"><link rel="stylesheet" href="assets/vendor/leaflet.css"><link rel="stylesheet" href="assets/portal.css"><script src="assets/vendor/leaflet.js" defer></script><script type="module" src="assets/app.js"></script></head><body data-page="${page}" data-unit="${file}" data-viewer="public"><a class="skip-link" href="#main">본문 바로가기</a><div id="app"></div><noscript>SGIA 포털의 관제 기능에는 JavaScript가 필요합니다. <a href="sgia.html">각성자 등록증</a></noscript></body></html>\n`,
  );
