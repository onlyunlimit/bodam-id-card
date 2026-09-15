import { chirp } from './audio.js';
import { initExperiences } from './experiences.js';
import { teamLogos } from './media.js';
import { characters } from './characters.js';
import { teams, activityFor, scheduleFor, koreaTime, formatMinutes, generateIncident, isIncident, tally } from './model.js';

const $ = selector => document.querySelector(selector);
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad = n => String(n).padStart(2, '0');
const teamById = id => teams.find(t => t.id === id);
let staff = false;
let selectedTeam = 'origin';
let lastMinute = -1;
let incidentPage = 0;
const pageSize = 5;
let toastTimer;
let activeGesture = null;
let dossierCharacterId = null;
let storageWarningShown = false;
function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3600);
}
function readStorage(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } }
function saveStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { if (!storageWarningShown) { toast('브라우저 저장 공간을 사용할 수 없어 이번 접속 동안만 기록을 유지합니다.'); storageWarningShown = true; } }
}
const saved = readStorage('onlyunlimit.sgia.incidents.v1');
let incidents = Array.isArray(saved) && saved.length > 0 && saved.length <= 100 && saved.every(isIncident) && new Set(saved.map(x=>x.id)).size === saved.length
  ? saved : Array.from({ length: 15 }, (_, i) => generateIncident(i, Math.random, Date.now() - (14-i)*190000));
saveStorage('onlyunlimit.sgia.incidents.v1', incidents);
let sequence = Math.max(incidents.length, ...incidents.map(x => Number(x.id.split('-').at(-1)) || 0)) + 1;
const savedTheme = readStorage('onlyunlimit.sgia.theme');
if (['control','field','paper'].includes(savedTheme)) document.documentElement.dataset.theme = savedTheme;
$('#terminal-theme').value = document.documentElement.dataset.theme;
$('#terminal-theme').addEventListener('change', event => {
  document.documentElement.dataset.theme = event.target.value;
  saveStorage('onlyunlimit.sgia.theme', event.target.value);
});
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let motionOff = readStorage('onlyunlimit.sgia.motion') === false || reducedMotion.matches;
function applyMotion() {
  document.documentElement.dataset.motion = motionOff ? 'off' : 'on';
  $('#motion-toggle').textContent = `모션 ${motionOff ? 'OFF' : 'ON'}`;
  $('#motion-toggle').setAttribute('aria-pressed', String(motionOff));
  $('#motion-toggle').setAttribute('aria-label', motionOff ? '모션 켜기' : '모션 끄기');
}
applyMotion();
$('#motion-toggle').addEventListener('click', () => {
  if (reducedMotion.matches) { toast('기기의 동작 줄이기 설정이 적용 중입니다.'); return; }
  motionOff = !motionOff; applyMotion(); saveStorage('onlyunlimit.sgia.motion', !motionOff);
});
reducedMotion.addEventListener('change', () => { motionOff = reducedMotion.matches || readStorage('onlyunlimit.sgia.motion') === false; applyMotion(); });

function renderTabs() {
  $('#team-tabs').innerHTML = teams.map(t => `<button class="team-tab ${t.id===selectedTeam?'active':''}" data-team="${t.id}" aria-pressed="${t.id===selectedTeam}">${t.name}<span class="count">${pad(characters.filter(c=>c.team===t.id).length)}</span></button>`).join('') + `<button class="team-tab ${selectedTeam==='all'?'active':''}" data-team="all" aria-pressed="${selectedTeam==='all'}">전체<span class="count">${characters.length}</span></button>`;
}
$('#team-tabs').addEventListener('click', event => {
  const button = event.target.closest('[data-team]');
  if (!button) return;
  selectedTeam = button.dataset.team;
  renderTabs(); renderCards(); updateSelectedActivity();
  $(`[data-team="${selectedTeam}"]`).focus({ preventScroll:true });
});
$('#character-search').addEventListener('input', renderCards);
function portraitMarkup(character, modal = false) {
  return `<span class="portrait-fallback" aria-hidden="true"></span><img class="portrait" src="${escape(character.portrait)}" alt="${staff ? escape(character.name)+' 인물 이미지' : ''}" ${modal ? '' : 'loading="lazy"'} draggable="false" referrerpolicy="no-referrer">`;
}
function installImageFallbacks(container) {
  container.querySelectorAll('img.portrait').forEach(img => {
    const fallback = img.previousElementSibling;
    const failed = () => {
      img.hidden = true;
      if (staff) {
        const label = document.createElement('span'); label.className = 'portrait-unavailable'; label.textContent = '인물 이미지 수신 대기'; img.parentElement.append(label);
      }
    };
    img.addEventListener('load', () => fallback.classList.add('hidden-fallback'), { once: true });
    img.addEventListener('error', failed, { once: true });
    if (img.complete && img.naturalWidth) fallback.classList.add('hidden-fallback');
  });
}
function renderCards() {
  activeGesture?.();
  const team = teamById(selectedTeam);
  $('#personnel').dataset.team = selectedTeam;
  document.dispatchEvent(new CustomEvent('sgia:team', {detail: {team: selectedTeam}}));
  $('#team-number').textContent = team ? `UNIT ${pad(teams.indexOf(team)+1)} / ${team.department}` : 'ALL UNITS / INTEGRATED ARCHIVE';
  $('#team-title').innerHTML = team ? `${teamLogos[team.id]?`<img class="team-logo" src="${teamLogos[team.id]}" alt="${team.name} 로고">`:''}${team.name} <span>${team.en}</span>` : '통합 요원 기록 <span>ALL PERSONNEL</span>';
  $('#team-description').textContent = team ? staff ? team.staff : team.description : '각 부서의 요원과 외부 감시 대상 기록을 한곳에서 확인합니다.';
  const query = $('#character-search').value.trim().toLocaleLowerCase();
  const list = characters.filter(c => (selectedTeam==='all'||c.team===selectedTeam) && `${c.code} ${staff?c.name:''}`.toLocaleLowerCase().includes(query));
  $('#character-grid').innerHTML = list.map(c => {
    const t = teamById(c.team);
    return `<article class="character-card ${staff?'staff':'public'}" style="--team-color:${t.color}" data-unit="${c.team}" data-character="${c.id}">
      <button class="card-turner" aria-label="${escape(c.code)} 카드 뒤집기. 길게 누르면 캐릭터 페이지로 이동" aria-pressed="false">
      <span class="card-rotator"><span class="card-face card-front" aria-hidden="false"><span class="card-top"><span>${c.team==='orpe'?'WANTED / ORPÉ':t.en}</span><span>${staff ? escape(c.rank)+' / CLASS' : 'RESTRICTED'}</span></span><span class="portrait-wrap">${portraitMarkup(c)}<span class="scan-lines"></span></span>${staff?'':'<span class="classified">IDENTITY CLASSIFIED</span>'}<span class="card-bottom"><span class="card-unit">SGIA ${c.team==='orpe'?'WATCHLIST':'PERSONNEL'} / ${pad(characters.indexOf(c)+1)}</span><strong class="card-code">${escape(c.code)}</strong>${staff?`<span class="card-name">${escape(c.name)}</span>`:''}<span class="card-meta"><span>${staff?escape(c.role):'PERSONAL DATA ENCRYPTED'}</span><span>↔ FLIP</span></span></span></span>
      <span class="card-face card-back" aria-hidden="true"><span class="eyebrow">${staff?'INTERNAL PERSONNEL RECORD':'PUBLIC PERSONNEL RECORD'}</span><strong>${escape(c.code)}</strong><span class="back-copy">${staff?`${escape(c.name)} · ${c.age}세<br>${escape(c.role)}`:`소속: ${t.name}. ${t.description} 개인 신상과 작전 세부사항은 직원용 단말에서 열람할 수 있습니다.`}</span>${staff?`<span class="back-fields"><span><small>ABILITY</small>${escape(c.ability)}</span><span><small>LOCATION</small>${escape(c.location)}</span></span>`:''}<span class="back-classified">${staff?'AUTHORIZED / INTERNAL VIEW':'ACCESS LEVEL / PUBLIC'}<br>HOLD TO CONNECT ↗</span></span></span><span class="hold-progress" aria-hidden="true"></span></button>
      <div class="card-actions"><button data-dossier="${c.id}">${staff?'상세 기록 ＋':'직원 열람 ◇'}</button>${c.link?`<a href="${escape(c.link)}" target="_blank" rel="noopener noreferrer" aria-label="${escape(c.code)} 캐릭터 페이지 새 탭에서 열기">캐릭터 ↗</a>`:'<span class="coming-soon">COMING SOON</span>'}</div></article>`;
  }).join('');
  $('#empty-search').hidden = list.length !== 0;
  $('#result-count').textContent = `${pad(list.length)} RECORDS`;
  installImageFallbacks($('#character-grid'));
  $('#character-grid').querySelectorAll('.character-card').forEach(card => setupCardGesture(card));
}
function setupCardGesture(card) {
  const button = card.querySelector('.card-turner');
  const character = characters.find(c=>c.id===card.dataset.character);
  let timer, start, dragged = false, held = false, suppressClick = false;
  const clearHold = () => { clearTimeout(timer); card.classList.remove('holding'); };
  const cancel = () => { clearHold(); if (start) suppressClick = true; start=null; card.style.removeProperty('--drag-angle'); if(activeGesture===cancel) activeGesture=null; };
  const flip = () => {
    const flipped = card.classList.toggle('flipped');
    button.setAttribute('aria-pressed', String(flipped));
    card.querySelector('.card-front').setAttribute('aria-hidden', String(flipped));
    card.querySelector('.card-back').setAttribute('aria-hidden', String(!flipped));
  };
  button.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    activeGesture?.(); activeGesture=cancel;
    start={ x:event.clientX, y:event.clientY, pointer:event.pointerId }; dragged=false; held=false; suppressClick=false;
    button.setPointerCapture(event.pointerId);
    card.classList.add('holding');
    timer=setTimeout(() => {
      if (!start || dragged) return;
      held=true; suppressClick=true; clearHold();
      if(character.link) window.location.assign(character.link); else toast('여명은 출시 준비 중입니다. 프로필을 먼저 만나보세요.');
    }, 800);
  });
  button.addEventListener('pointermove', event => {
    if (!start || event.pointerId !== start.pointer) return;
    const dx=event.clientX-start.x, dy=event.clientY-start.y;
    if (Math.abs(dx)>10 || Math.abs(dy)>10) { clearHold(); dragged=true; suppressClick=true; }
    if (Math.abs(dy)>Math.abs(dx) && Math.abs(dy)>15) { cancel(); return; }
    if (dragged) card.style.setProperty('--drag-angle', `${Math.max(-55,Math.min(55,dx*.6))}deg`);
  });
  button.addEventListener('pointerup', event => {
    if (!start) return;
    const dx=event.clientX-start.x, dy=event.clientY-start.y;
    clearHold(); card.style.removeProperty('--drag-angle');
    if (!held && Math.abs(dx)>35 && Math.abs(dx)>Math.abs(dy)) flip();
    start=null; if(activeGesture===cancel) activeGesture=null;
  });
  button.addEventListener('pointercancel', cancel);
  button.addEventListener('lostpointercapture', () => { if(start) cancel(); });
  button.addEventListener('contextmenu', event => event.preventDefault());
  button.addEventListener('click', event => {
    if(event.detail===0 || !suppressClick) flip();
    suppressClick=false;
  });
}
window.addEventListener('blur', () => activeGesture?.());
document.addEventListener('visibilitychange', () => { if(document.hidden) activeGesture?.(); else tick(); });
function setStaff(value) {
  if ($('#dossier').open) $('#dossier').close();
  staff=value;
  document.body.dataset.viewer = staff?'staff':'public';
  $('#viewer-toggle').setAttribute('aria-pressed', String(staff));
  $('#viewer-label').textContent=staff?'로그아웃':'직원 로그인';
  $('#terminal-mode').textContent=staff?'STAFF TERMINAL':'PUBLIC TERMINAL';
  $('#archive-access').textContent=staff?'INTERNAL ACCESS · 상세 열람':'PUBLIC ACCESS · 제한 열람';
  $('#system-message').textContent=staff?'직원용 단말에 접속했습니다. 요원 기록과 사건 처리 업무를 열람할 수 있습니다.':'외부인 접속 모드입니다. 일부 요원 정보의 열람이 제한됩니다.';
  $('#incident-locked').hidden=staff;
  $('#incident-workspace').hidden=!staff;
  $('#character-search').placeholder=staff?'이름 · 코드네임 검색':'코드네임 검색';
  if(!staff) $('#character-search').value='';
  renderCards(); renderDepartments(); renderIncidents(); updateSelectedActivity();
  document.dispatchEvent(new CustomEvent('sgia:viewer',{detail:{staff}}));
  toast(staff?'접속 승인. SGIA 직원용 단말에 오신 것을 환영합니다.':'외부인 뷰어로 전환했습니다.');
}
let pendingDossier=null, loginAttempt=0;
function requestStaff(characterId=null) {
  if(staff){if(characterId)openDossier(characterId);return;}
  pendingDossier=characterId;
  $('#login-progress').textContent='발급된 체험용 사원증으로 접속합니다.';
  $('#login-submit').disabled=false;
  $('#login-submit').textContent='사원증 태그 · 로그인';
  $('#staff-login').showModal();
}
$('#viewer-toggle').addEventListener('click',()=>staff?setStaff(false):requestStaff());
$('#enter-staff').addEventListener('click',()=>requestStaff());
document.addEventListener('sgia:request-login',()=>requestStaff());
$('#login-cancel').addEventListener('click',()=>$('#staff-login').close());
$('#staff-login').addEventListener('close',()=>{loginAttempt++;$('#staff-login').classList.remove('authenticating');});
$('#login-form').addEventListener('submit',async event=>{
  event.preventDefault();if($('#login-submit').disabled)return;
  const attempt=++loginAttempt;
  $('#login-submit').disabled=true;
  $('#staff-login').classList.add('authenticating');
  chirp(1080);
  for(const line of ['사원증 인식 중…','본부 접근 채널 확인…','직원 열람 권한 승인']){
    if(attempt!==loginAttempt||!$('#staff-login').open)return;
    $('#login-progress').textContent=line;
    await new Promise(resolve=>setTimeout(resolve,motionOff?70:380));
  }
  if(attempt!==loginAttempt||!$('#staff-login').open)return;
  const target=pendingDossier;pendingDossier=null;
  $('#staff-login').close();setStaff(true);
  if(target)openDossier(target);
});
$('#character-grid').addEventListener('click', event=>{
  const button=event.target.closest('[data-dossier]');if(!button)return;
  if(!staff)requestStaff(button.dataset.dossier);else openDossier(button.dataset.dossier);
});
function openDossier(id) {
  if(!staff)return;
  const character=characters.find(c=>c.id===id);if(!character)return;
  dossierCharacterId=character.id;
  const t=teamById(character.team);
  $('#dossier-content').innerHTML=`<div class="dossier-grid"><div class="dossier-media"><div class="dossier-photo">${portraitMarkup(character,true)}</div><div class="gallery-tabs" role="group" aria-label="기록 이미지 선택">${(character.gallery||[]).map((image,i)=>`<button data-gallery="${i}" aria-pressed="${i===0}">${escape(image.label)}</button>`).join('')}</div></div><div class="dossier-details"><div class="eyebrow">SGIA / ${t.en} / INTERNAL RECORD</div><h2 id="dossier-title">${escape(character.code)}</h2><h3>${escape(character.name)}</h3><p>${escape(character.bio)}</p><dl class="dossier-facts"><div><dt>분류 / 등급</dt><dd>${escape(character.rank)}</dd></div><div><dt>나이</dt><dd>${character.age}세</dd></div><div><dt>역할</dt><dd>${escape(character.role)}</dd></div><div><dt>배치 / 위치</dt><dd>${escape(character.location)}</dd></div></dl><h4>ABILITY / 능력 기록</h4><p>${escape(character.ability)}</p><h4>IDENTIFICATION / 외형</h4><p>${escape(character.appearance)}</p><h4>FIELD NOTES / 관찰 기록</h4><p>${escape(character.notes)}</p>${character.link?`<a class="primary-button" href="${escape(character.link)}" target="_blank" rel="noopener noreferrer">캐릭터와 만나기 <span>↗</span></a>`:'<p class="coming-soon">COMING SOON · 출시 준비 중</p>'}</div></div>`;
  installImageFallbacks($('#dossier-content'));
  $('#dossier').showModal();
}
$('#dossier-content').addEventListener('click',event=>{
  const button=event.target.closest('[data-gallery]');if(!button||!staff)return;
  const c=characters.find(c=>c.id===dossierCharacterId);const selected=c.gallery[Number(button.dataset.gallery)];if(!selected)return;
  const photo=$('#dossier .dossier-photo');photo.innerHTML=portraitMarkup({...c,portrait:selected.url},true);installImageFallbacks(photo);
  document.querySelectorAll('[data-gallery]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
});
$('.dialog-close').addEventListener('click', () => $('#dossier').close());
$('#dossier').addEventListener('close', () => {
  if (dossierCharacterId) document.querySelector(`[data-dossier="${dossierCharacterId}"]`)?.focus({preventScroll:true});
});
$('#dossier').addEventListener('click', event => { if(event.target===$('#dossier')) { const r=$('#dossier').getBoundingClientRect(); if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom) $('#dossier').close(); } });

function tick() {
  const time=koreaTime();
  $('#clock').textContent=time.clock; $('#date').textContent=time.date; $('#year').textContent=time.date.slice(0,4);
  if(time.minutes!==lastMinute) { lastMinute=time.minutes; renderDepartments(); updateSelectedActivity(); }
}
function updateSelectedActivity() {
  const element=$('#selected-team-status');
  if(selectedTeam==='all') { element.textContent='전체 부서 통합 조회'; element.classList.remove('on'); return; }
  const activity=activityFor(selectedTeam,koreaTime().minutes);
  element.textContent=`${selectedTeam==='orpe'?'관측':'일정'} · ${activity.label}`;
  element.classList.toggle('on',activity.active);
}
function renderDepartments() {
  const minutes=koreaTime().minutes;
  const departments=teams.filter(t=>t.id!=='orpe');
  $('#stat-teams').textContent=pad(departments.filter(t=>activityFor(t.id,minutes).active).length);
  $('#department-list').innerHTML=departments.map((t,i)=>{
    const a=activityFor(t.id,minutes);
    return `<div class="department-row"><span class="department-icon" style="--unit-color:${t.color}">${pad(i+1)}</span><span class="department-name">${t.name}<small>${t.en}</small></span><span class="department-activity ${a.active?'active':''}">${escape(a.label)}</span></div>`;
  }).join('');
  $('#schedule-list').innerHTML=departments.map(t=>`<div class="schedule-team"><h4>${t.name} <span class="muted">/ ${t.department}</span></h4>${scheduleFor(t.id).map(([start,end,label])=>`<div class="schedule-slot ${minutes>=start&&minutes<end?'current':''}"><span>${formatMinutes(start)}–${formatMinutes(end)}</span><span>${label}</span></div>`).join('')}</div>`).join('');
}

function renderSignals() {
  const totals=tally(incidents);
  $('#stat-gates').textContent=pad(totals.gates);
  const signals=incidents.filter(i=>!i.resolvedAt && ['게이트','괴물'].includes(i.type));
  $('#radar-count').textContent=pad(signals.length);
  $('#radar-blips').innerHTML=signals.map((i,n)=>`<span class="blip ${i.grade==='A'?'high':''}" style="left:${i.x}%;top:${i.y}%;animation-delay:-${n*.7}s" data-label="${i.grade}-${pad(n+1)}"></span>`).join('');
  $('#radar').setAttribute('aria-label',`서울 구역 가상 레이더: 게이트 ${totals.gates}건, 괴물 ${totals.monsters}건 관측 중`);
}
function renderIncidents() {
  if (!staff) { $('#incident-list').replaceChildren(); return; }
  const totals=tally(incidents);
  $('#incident-stats').innerHTML=[['전체 신고',totals.total],['처리 대기',totals.open],['해결 완료',totals.resolved],['관측 괴물',totals.monsters]].map(([label,value])=>`<div><span>${label}</span><strong>${pad(value)}</strong></div>`).join('');
  const type=$('#incident-type').value, status=$('#incident-status').value;
  const filtered=incidents.filter(i=>(type==='all'||i.type===type)&&(status==='all'||(status==='resolved'?i.resolvedAt:!i.resolvedAt))).toReversed();
  incidentPage=Math.min(incidentPage,Math.max(0,Math.ceil(filtered.length/pageSize)-1));
  $('#incident-page-info').textContent=`${filtered.length}건 · ${incidentPage+1} / ${Math.max(1,Math.ceil(filtered.length/pageSize))} 페이지`;
  $('#incident-prev').disabled=incidentPage===0;
  $('#incident-next').disabled=(incidentPage+1)*pageSize>=filtered.length;
  $('#incident-list').innerHTML=filtered.length?filtered.slice(incidentPage*pageSize,(incidentPage+1)*pageSize).map(i=>`<article class="incident-row ${i.resolvedAt?'resolved':''}" data-incident="${escape(i.id)}"><span class="incident-grade">${i.grade}</span><div><span class="incident-id">${escape(i.id)}</span><h3>[${i.type}] ${i.location}</h3><p>${escape(i.detail)}</p><p class="incident-timestamp">접수 ${koreaTime(new Date(i.created)).date} ${koreaTime(new Date(i.created)).clock}${i.resolvedAt?` · 해결 ${koreaTime(new Date(i.resolvedAt)).date} ${koreaTime(new Date(i.resolvedAt)).clock}`:''} KST</p></div><div class="incident-action">${i.resolvedAt?`<div class="stamp">해결 완료<small>SGIA · CASE CLOSED</small></div><button class="reopen-button" data-reopen="${escape(i.id)}">처리 취소 · 다시 열기</button>`:`<button class="resolve-button" data-resolve="${escape(i.id)}">해결 도장 찍기 ↙</button>`}</div></article>`).join(''):'<p class="empty-state">현재 조건에 해당하는 사건이 없습니다.</p>';
}
$('#incident-type').addEventListener('change',()=>{incidentPage=0;renderIncidents();});
$('#incident-status').addEventListener('change',()=>{incidentPage=0;renderIncidents();});
$('#incident-prev').addEventListener('click',()=>{incidentPage=Math.max(0,incidentPage-1);renderIncidents();});
$('#incident-next').addEventListener('click',()=>{incidentPage++;renderIncidents();});
$('#new-incident').addEventListener('click',()=>{
  if(!staff) return;
  if(incidents.length>=100) { toast('기록함이 가득 찼습니다. 현재 100건의 기록을 보관 중입니다.'); return; }
  const incident=generateIncident(sequence++); incidents.push(incident);
  incidentPage=0;
  saveStorage('onlyunlimit.sgia.incidents.v1',incidents);
  $('#incident-type').value='all';$('#incident-status').value='all';
  renderIncidents();renderSignals();toast(`${incident.location} · ${incident.type} 모의 신고를 접수했습니다.`);
});
$('#incident-list').addEventListener('click', event=>{
  if(!staff) return;
  const button=event.target.closest('[data-resolve],[data-reopen]'); if(!button) return;
  const id=button.dataset.resolve||button.dataset.reopen;
  const incident=incidents.find(i=>i.id===id); if(!incident) return;
  incident.resolvedAt=button.dataset.resolve?Date.now():null;
  saveStorage('onlyunlimit.sgia.incidents.v1',incidents);renderIncidents();renderSignals();
  const next=$('#incident-list').querySelector(`[data-incident="${CSS.escape(id)}"] button`);
  (next || $('#incident-status')).focus({preventScroll:true});
  toast(incident.resolvedAt?'처리 승인. 해결 완료 도장이 기록되었습니다.':'해당 사건을 다시 열었습니다.');
});

const bulletins=[
  ['GATE','한강변 미세 균열, 관측 단계 유지','중앙 통제 본부는 한강변 마력 파장을 감시하고 있습니다. 봉쇄선 안쪽으로의 접근을 삼가 주십시오.'],
  ['NOTICE','6월 정기 각성 검사 안내','미각성자 대상 정기 검사는 매년 6월 진행됩니다. 검사 대상자는 각성관의 별도 안내를 확인해 주세요.'],
  ['SHIELD','실드, 사회 적응 교육 프로그램 진행','전술대응팀 실드가 관리 대상의 언어와 감정 표현, 사회 규칙 교육을 진행합니다. 작은 변화도 기록합니다.'],
  ['BEACON','비콘, 미등록 각성자 연락 창구 정비','추적관리팀이 대상자의 안전한 등록을 위한 상담 절차를 점검했습니다. 요원의 연락을 받으면 안내에 따라 주세요.'],
  ['RESEARCH','게이트 연구소, 잔류 파장 분석 착수','게이트 붕괴 이후의 잔류 파장을 조사합니다. 주변 전자기기에 이상이 생겼다면 접근하지 말고 기록을 남겨 주세요.'],
  ['CULTURE','럭키트릭 · 옵시더스, 오늘의 헌터 브리핑','오후 소통 일정에 각 크루의 활동 소식이 전해집니다. 훈련과 출동 상황에 따라 일정이 변경될 수 있습니다.'],
  ['HQ','본부 내 출입 구역을 확인해 주세요','업무와 관계없는 연구 및 격리 구역의 출입은 제한됩니다. 배정된 단말과 동선을 이용해 주십시오.'],
  ['ALERT','ORPÉ 관련 동향, 제보 기록 검토 중','외부 단체의 움직임은 별도 감시 기록으로 관리됩니다. 수상한 장비나 신원 불명 인물을 발견하면 거리를 유지해 주세요.'],
];
let newsIndex=-1;
function renderNews() {
  const options=bulletins.map((_,i)=>i).filter(i=>i!==newsIndex);
  newsIndex=options[Math.floor(Math.random()*options.length)];
  const [tag,title,detail]=bulletins[newsIndex];
  $('.news-tag').textContent=`SGIA NEWSROOM / ${tag}`;
  $('#news-headline').textContent=title;$('#news-detail').textContent=detail;
  $('#news-time').textContent=`${koreaTime().date} ${koreaTime().clock.slice(0,5)} KST · 가상 브리핑`;
  $('#news-list').innerHTML=[1,3].map(offset=>bulletins[(newsIndex+offset)%bulletins.length]).map(([tag,title])=>`<div class="news-item"><span>${tag}</span><p>${title}</p></div>`).join('');
  $('.news-feature').classList.remove('news-changing');requestAnimationFrame(()=>$('.news-feature').classList.add('news-changing'));
}
$('#refresh-news').addEventListener('click',renderNews);
setInterval(()=>{if(!document.hidden&&!motionOff)renderNews();},45000);

async function fetchWeather() {
  try {
    const response=await fetch('https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m,weather_code&timezone=Asia%2FSeoul', {signal:AbortSignal.timeout(8000)});
    if(!response.ok) throw new Error('weather unavailable');
    const {current}=await response.json();
    if(!Number.isFinite(current?.temperature_2m)||!Number.isFinite(current?.weather_code)||!current?.time) throw new Error('invalid weather');
    const timestamp=new Date(`${current.time}+09:00`).getTime();
    if(!Number.isFinite(timestamp)||Math.abs(Date.now()-timestamp)>2*60*60*1000) throw new Error('stale weather');
    const code=current.weather_code;
    const [label,icon]=code===0?['맑음','☀']:code<=3?['구름','☁']:code<=48?['안개','≋']:code>=95?['뇌우','ϟ']:(code>=71&&code<=77)||code===85||code===86?['눈','❄']:['비','☂'];
    $('#weather-temp').textContent=Math.round(current.temperature_2m);
    $('#weather-icon').textContent=icon;
    $('#weather-status').textContent=`${label} · ${current.time.slice(11,16)} KST 기준`;
  } catch {
    $('#weather-temp').textContent='—';$('#weather-icon').textContent='☁';$('#weather-status').textContent='기상 연결 대기 · 서울';
  }
}
let audioContext, masterGain, musicOn=false, soundBusy=false, noteTimer;
const notes=[130.81,164.81,196,246.94,261.63,196,164.81,146.83];
let noteIndex=0;
function playNote() {
  if(!musicOn||audioContext.state!=='running') return;
  const now=audioContext.currentTime;
  const osc=audioContext.createOscillator();const gain=audioContext.createGain();
  osc.type='sine';osc.frequency.value=notes[noteIndex++%notes.length];
  gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.16,now+.7);gain.gain.exponentialRampToValueAtTime(.001,now+3.8);
  osc.connect(gain);gain.connect(masterGain);osc.start(now);osc.stop(now+4);
  osc.onended=()=>{osc.disconnect();gain.disconnect();};
}
function updateSound() {
  $('#sound-toggle').setAttribute('aria-pressed',String(musicOn));$('#sound-label').textContent=`BGM ${musicOn?'ON':'OFF'}`;$('#sound-toggle').setAttribute('aria-label',`관제실 BGM ${musicOn?'끄기':'켜기'}`);
}
$('#sound-toggle').addEventListener('click',async()=>{
  if(soundBusy)return; soundBusy=true;
  try {
    if(!audioContext){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw new Error('Audio unavailable');audioContext=new Audio();masterGain=audioContext.createGain();masterGain.gain.value=.18;masterGain.connect(audioContext.destination);}
    if(musicOn){musicOn=false;clearInterval(noteTimer);await audioContext.suspend();}
    else{await audioContext.resume();if(audioContext.state!=='running')throw new Error('Audio suspended');musicOn=true;playNote();noteTimer=setInterval(playNote,2300);}
    updateSound();
  }catch{musicOn=false;clearInterval(noteTimer);updateSound();toast('이 단말에서는 소리를 재생할 수 없습니다. 브라우저의 소리 설정을 확인해 주세요.');}
  finally{soundBusy=false;}
});
window.addEventListener('pagehide',()=>{activeGesture?.();clearInterval(noteTimer);musicOn=false;audioContext?.suspend().catch(()=>{});updateSound();});
const halo=$('.cursor-halo');
let pointerFrame;
document.addEventListener('pointermove',event=>{
  if(event.pointerType!=='mouse'||motionOff)return;
  cancelAnimationFrame(pointerFrame);
  pointerFrame=requestAnimationFrame(()=>{halo.style.transform=`translate(${event.clientX-12}px,${event.clientY-12}px)`;halo.style.opacity='1';halo.classList.toggle('over-control',Boolean(event.target.closest('button,a,summary,select')));});
});
document.documentElement.addEventListener('pointerleave',()=>{halo.style.opacity='0';});
if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){document.querySelectorAll('.main-nav a').forEach(a=>a.classList.toggle('active',a.hash===`#${e.target.id}`));}}, {rootMargin:'-15% 0px -60% 0px',threshold:0});
  ['overview','personnel','operations','incidents','community','history','resources'].forEach(id=>observer.observe(document.getElementById(id)));
}
initExperiences({isStaff:()=>staff, toast, readStorage, saveStorage, motionOff:()=>motionOff});
renderTabs();renderCards();renderSignals();tick();renderNews();fetchWeather();
setInterval(tick,1000);
setInterval(()=>{if(!document.hidden)fetchWeather();},15*60*1000);
