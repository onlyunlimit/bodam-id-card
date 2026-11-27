import { modal, esc } from './runtime.js';
import { characters } from './characters.js';

export function openAZReader(section = 0) {
  if (!document.querySelector('[data-az-reader-css]')) {
    const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'assets/az-reader.css'; css.dataset.azReaderCss = ''; document.head.append(css);
  }
  const az = characters.find(c => c.team === 'orpe');
  const pages = [
    `<div class="az-cover"><p>SGIA / COUNTERINTELLIGENCE ARCHIVE</p><span class="az-seal">CLASSIFIED</span><h2>AZ</h2><p class="az-cover-sub">인물 추적 · 제한 열람 문서</p><div class="az-cover-meta"><span>OR—001</span><span>ACTIVE PURSUIT</span></div><p>증언은 사실을 보증하지 않는다.<br>현장 기록과 통신 내용을 교차 검증할 것.</p><button data-next>봉인 해제 · 문서 열람 ↗</button></div>`,
    `<header><small>01 / SUBJECT IDENTIFICATION</small><h2>신원 기록</h2></header><div class="az-identity"><div class="az-portrait" role="img" aria-label="AZ 인물 기록" style="background-image:url('${esc(az?.portrait || '')}')"></div><div><span class="az-stamp">UNAPPREHENDED</span><h3>AZ</h3><dl><dt>본명</dt><dd><button class="az-redaction" data-reveal="확인된 본명 없음">신원 확인</button></dd><dt>소속</dt><dd>ORPÉ</dd><dt>분류</dt><dd>${esc(az?.rank || '측정 불가')}</dd><dt>상태</dt><dd>미검거 · 추적 중</dd></dl></div></div><section><h3>인물 개요</h3><p>${esc(az?.bio || '')}</p><p>${esc(az?.appearance || '')}</p></section><aside class="az-pencil">외형만으로 식별하지 말 것. 발화와 주변 반응을 함께 기록.</aside><div class="az-uv-clue">UV / 동일한 증언도 독립된 출처인지 먼저 확인한다.</div>`,
    `<header><small>02 / ORGANIZATION & CONNECTIONS</small><h2>연결망 분석</h2></header><p class="az-lead">ORPÉ — 통제 밖의 각성자 조직</p><div class="az-network"><span>등록 이탈</span><span>불법 연구</span><strong>ORPÉ</strong><span>비공식 거래</span><span>정보 침해</span></div><section><h3>조사 분류</h3><p>탈주자, 미등록 가이드, 불법 연구 관계자의 연결을 추적한다. 조직이 주장하는 자유와 실제 현장 피해는 분리하여 기록한다.</p><div class="az-evidence-list"><p><b>01</b> 가이딩 착취 및 거래 정황</p><p><b>02</b> 게이트 밀렵 · 신체 개조 · 생체 병기</p><p><b>03</b> 통신망 침입 · 약물 탈취</p></div></section><aside class="az-pencil">조직의 지시와 AZ 개인의 목적을 같은 것으로 단정하지 말 것.</aside><div class="az-uv-clue">분석 메모 / 독립 행동 가능성. 지휘 관계는 추가 검증 필요.</div>`,
    `<header><small>03 / FIELD RESPONSE PROTOCOL</small><h2>접촉 위험 평가</h2></header><div class="az-radius"><strong>≈ 2<span>km</span></strong><p>발화 동기화 추정 영향 반경</p></div><p>${esc(az?.ability || '고통과 수치심을 전환하는 능력. 현장 반응의 교차 확인이 필요하다.')}</p><div class="az-protocol"><section><b>01 / 접근 전</b><p>단독 접촉 금지. 팀별 통신 기록을 확보하고 진술의 시간 순서를 보존한다.</p></section><section><b>02 / 접촉 중</b><p>발화 직후의 인지 변화와 공황 반응을 기록한다. 서로의 기억만으로 상황을 확정하지 않는다.</p></section><section><b>03 / 이탈 후</b><p>현장 영상, 교신 시각, 개별 진술을 분리 수집한다. 증언 충돌은 삭제하지 않고 병기한다.</p></section></div><button class="az-check" data-check>현장 기록 교차 확인</button><output class="az-check-output" aria-live="polite"></output><div class="az-uv-clue">대상은 명료한 의식을 유지할 수 있다. 혼란을 무력화의 증거로 판단하지 말 것.</div>`,
    `<header><small>04 / INTERCEPT TRANSCRIPT</small><h2>감청 기록</h2></header><p class="az-lead">발화 단편 · 문맥 불완전</p><div class="az-transcript"><small>VOICE FRAGMENT / A</small><blockquote>“비켜.”</blockquote><small>VOICE FRAGMENT / B</small><blockquote>“시끄러워. 입 닫아.”</blockquote></div><section><h3>기록 취급</h3><p>단편 발화만으로 의도나 지휘 관계를 확정할 수 없다. 장소, 목격자, 전후 교신의 대조가 필요하다.</p></section><aside class="az-pencil">들린 말과 실제로 일어난 일을 별도 기록할 것.</aside><div class="az-uv-clue">미확인 추정 / 조직 활동과 별개인 개인적 목적의 가능성. 확인된 사실로 인용 금지.</div><div class="az-end-stamp">RECORD RETAINED<br><small>추적 계속</small></div>`
  ];
  const dialog = modal('OR—001 / RESTRICTED ARCHIVE', `<article class="az-reader"><div class="az-reader-tools"><span>BEACON · EVIDENCE ROOM</span><button data-uv aria-pressed="false">UV 조사등</button></div><div class="az-page" tabindex="-1"></div><nav class="az-paging" aria-label="문서 페이지"><button data-prev aria-label="이전 페이지">← 이전</button><span data-page-count></span><button data-next>다음 →</button></nav></article>`, 'az-reader');

  const annotations = [
    `<div class="az-access-strip"><span>ARCHIVE / ORPÉ</span><span>UNRESOLVED</span></div><p class="az-pencil">지워진 이름보다, 남겨진 흔적을 먼저 볼 것.</p>`,
    `<section class="az-evidence-section"><h3>신원 대조표</h3><dl class="az-ledger"><div><dt>호칭</dt><dd>에이지 · AZ</dd></div><div><dt>본명</dt><dd>미확인 / 식별에 사용하지 않음</dd></div><div><dt>소속</dt><dd>ORPÉ</dd></div><div><dt>열람 분류</dt><dd>인물 식별 · 현장 대응 참고</dd></div></dl><button class="az-clue" data-clue="identity" data-hint="이름은 신원을 증명하지 않는다. 다음 문서에서 소속과 행적을 대조할 것.">봉인된 식별 메모 펼치기 <span>01</span></button><p class="az-uv">재확인: 호칭과 본명을 동일한 정보로 취급하지 말 것.</p></section>`,
    `<section class="az-evidence-section"><h3>연관 정황 검토</h3><div class="az-analysis-grid"><div><small>01 / 조직</small><h4>ORPÉ 연관성</h4><p>조직에 관한 정보와 특정 인물의 행위를 분리해 기록한다. 조직의 범죄 목록만으로 개인의 현장 참여를 단정하지 않는다.</p></div><div><small>02 / 행적</small><h4>시간·장소 대조</h4><p>동선 기록의 시간과 목격 시점을 함께 확인한다. 위치가 겹치는 것만으로 동일 인물임을 확정하지 않는다.</p></div></div><button class="az-clue" data-clue="network" data-hint="서로 다른 기록에서 같은 시간대가 반복된다면 출처부터 확인한다. 중복 제보는 독립된 증거가 아니다.">접힌 조사관 메모 펼치기 <span>02</span></button></section>`,
    `<section class="az-evidence-section"><h3>현장 기록 체크포인트</h3><ol class="az-checklist"><li><b>접촉 전</b><span>관찰 시각·위치·대상 수를 분리하여 기록.</span></li><li><b>접촉 중</b><span>직접 확인한 현상과 목격자의 해석을 구별.</span></li><li><b>이탈 후</b><span>감각·판단의 변화를 시간순으로 다시 대조.</span></li></ol><p class="az-pencil">설명할 수 없는 공백도 기록이다. 빈칸을 추측으로 채우지 마.</p><button class="az-clue" data-clue="ability" data-hint="현상 기록은 능력의 원인까지 입증하지 않는다. 다음 녹취 문서에서도 발화와 해석을 분리한다.">여백의 연필 흔적 확인 <span>03</span></button></section>`,
    `<section class="az-evidence-section"><h3>녹취 대조 메모</h3><p>발화만으로 동기와 사건의 전후 관계를 확정할 수 없다. 기록의 공백은 미확인으로 남긴다.</p><div class="az-tape" aria-hidden="true"><i></i><span>OR—001 / VOICE LOG</span><i></i></div><button class="az-clue" data-clue="voice" data-hint="채록된 발화와 인물 식별 정보의 대조 완료. 교차 검토 메모 열람이 활성화되었습니다.">녹취 봉인 확인 <span>04</span></button><details class="az-cross-file"><summary>교차 검토 메모</summary><p>신원 · 조직 · 현상 · 발화의 네 항목을 함께 확인한다. 기록 사이의 차이는 삭제하거나 하나로 합치지 않고 별도 정황으로 보존한다.</p><p class="az-pencil">모든 기록이 일치할 때도, 누가 기록했는지는 다시 확인할 것.</p></details></section>`
  ];
  pages.forEach((_, i) => { pages[i] += annotations[i]; });
  const root = dialog.querySelector('.az-reader'), page = root.querySelector('.az-page');
  let current = Math.max(0, Math.min(4, Number(section) || 0));
  const labels = ['표지', '용의자', 'ORPÉ', '특이능력', '녹취 기록'];
  const tabs = document.createElement('nav'); tabs.className='az-folder-tabs'; tabs.setAttribute('aria-label','기밀 파일 목차');
  tabs.innerHTML=labels.map((label,i)=>`<button data-sheet="${i}"><small>0${i+1}</small>${label}</button>`).join('');
  root.insertBefore(tabs,page);
  const terminal=document.createElement('div');terminal.className='az-terminal';terminal.setAttribute('role','status');terminal.textContent='열람 세션 연결됨 · 기록의 흔적을 눌러 대조합니다.';root.append(terminal);
  const found = new Set();
  function render() { page.innerHTML = pages[current]; page.dataset.sheet=String(current); tabs.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-current',i===current?'page':'false')); page.classList.remove('az-page-enter'); void page.offsetWidth; page.classList.add('az-page-enter'); root.querySelector('[data-page-count]').textContent = `${String(current + 1).padStart(2,'0')} / 05`; root.querySelector('[data-prev]').disabled = current === 0; root.querySelector('.az-paging [data-next]').disabled = current === 4; page.scrollTop = 0; }
  root.addEventListener('click', e => { const b=e.target.closest('button'); if(!b)return;
    if(b.hasAttribute('data-sheet')) {current=Number(b.dataset.sheet);render();page.focus();}
    if(b.hasAttribute('data-clue')) { found.add(b.dataset.clue); b.classList.add('is-examined'); b.setAttribute('aria-expanded','true'); let hint=b.nextElementSibling;if(!hint?.classList.contains('az-clue-note')) {hint=document.createElement('p');hint.className='az-clue-note';b.after(hint);}hint.textContent=b.dataset.hint;terminal.textContent=`대조 기록 ${found.size} / 4 · ${found.size===4?'교차 검토 메모 열람 가능':'다른 문서의 흔적을 확인하세요.'}`;if(found.size===4)root.classList.add('all-reviewed'); }

    if(b.hasAttribute('data-next')) { current=Math.min(4,current+1);render();page.focus(); }
    if(b.hasAttribute('data-prev')) { current=Math.max(0,current-1);render();page.focus(); }
    if(b.hasAttribute('data-uv')) { const on=root.classList.toggle('uv-on');b.setAttribute('aria-pressed',String(on)); }
    if(b.dataset.reveal) { b.textContent=b.dataset.reveal;b.classList.add('revealed'); }
    if(b.hasAttribute('data-check')) { root.querySelector('.az-check-output').textContent='대조 항목: 교신 시각 / 영상 기록 / 독립 목격자 진술 — 세 출처를 확인하십시오.';b.disabled=true; }
  }); render(); return dialog;
}
