import { $, $$, esc, modal, state, login } from './runtime.js';
import { registerCopy } from './i18n.js';
[
  ['증거 색인', 'Evidence index', '証拠索引', '证据索引'],
  ['발화 대조 기록', 'Voice comparison', '発話照合記録', '语音比对记录'],
  ['신원 식별 기록', 'Identity analysis', '身元識別記録', '身份识别记录'],
  ['현장 대응 지침', 'Field protocol', '現場対応指針', '现场应对指南'],
  ['열람 요청 ↗', 'Request access ↗', '閲覧を申請 ↗', '申请查阅 ↗'],
].forEach((row) => registerCopy(...row));
const files = [
  {
    id: '01',
    title: '발화 대조 기록',
    kind: 'VOICEPRINT / CROSS-CHECK',
    status: 'INCONSISTENT',
    body: '감청 채널에서 동일 발화가 중복 수신됨. 증언의 일치가 정보의 진실성을 보증하지 않습니다.',
    note: '거짓 증언 · 수치심 환산',
    lines: ['SOURCE A  ▂▃▆▇▅▂▁▆▂▁', 'SOURCE B  ▂▃▆▇▅▂▁▆▂▁', 'MATCH ......... UNVERIFIED'],
  },
  {
    id: '02',
    title: '신원 식별 기록',
    kind: 'SUBJECT / IDENTITY',
    status: 'UNREGISTERED',
    body: '극단주의 범죄 집단 ORPÉ 소속 미등록 각성자. 에이지 / AZ. 관측 자료를 교차 검증하십시오.',
    note: '위험도 측정 불가',
    lines: ['SUBJECT ....... AZ', 'AFFILIATION ... ORPÉ', 'IDENTITY ...... UNREGISTERED'],
  },
  {
    id: '03',
    title: '현장 대응 지침',
    kind: 'FIELD / CONTAINMENT',
    status: 'RESTRICTED',
    body: '발화 동기화의 추정 영향 반경은 약 2km. 단독 접촉을 금지하고 현장 접근 전 기록을 교차 검증하십시오.',
    note: '단독 접촉 금지 · 교차 검증',
    lines: [
      'RADIUS ........ ~2 KM',
      'CONTACT ....... RESTRICTED',
      'VERIFY ........ MULTIPLE SOURCES',
    ],
  },
];
export function evidenceIndex() {
  return `<section class="evidence-index"><header><span>ATTACHMENTS / 03</span><h2>증거 색인</h2><small>OR—001 / CHAIN OF CUSTODY</small></header><div class="evidence-files">${files.map((f) => `<button class="evidence-file" data-evidence="${f.id}"><span class="evidence-file-tab">EXHIBIT ${f.id}</span><small>${f.kind}</small><pre aria-hidden="true">${esc(f.lines.join('\n'))}</pre><strong>${f.title}</strong><span class="evidence-file-state">${f.status}<b>↗</b></span></button>`).join('')}</div></section>`;
}
export function mountEvidenceIndex() {
  $$('[data-evidence]').forEach(
    (button) =>
      (button.onclick = () => {
        if (!state.staff) return login(() => button.click());
        const f = files.find((f) => f.id === button.dataset.evidence);
        modal(
          'EXHIBIT ' + f.id + ' / OR—001',
          `<article class="evidence-reader"><header><span>COUNTERINTELLIGENCE BUREAU</span><b>CLASSIFIED</b></header><div class="evidence-reader-title"><small>${f.kind}</small><h3>${f.title}</h3><span>${f.status}</span></div><pre>${esc(f.lines.join('\n'))}</pre><p>${esc(f.body)}</p><aside>${esc(f.note)}</aside><footer><i class="barcode"></i><span>OR—001 / ${f.id}<br>RECORD RETAINED</span></footer></article>`,
          'evidence',
        );
      }),
  );
}
