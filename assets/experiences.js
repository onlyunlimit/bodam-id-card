import { characters } from './characters.js';
import { teams, koreaTime } from './model.js';
import { teamLogos } from './media.js';
import { chirp, soundContext } from './audio.js';
const $=selector=>document.querySelector(selector);
const safe=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pick=list=>list[Math.floor(Math.random()*list.length)];
const time=()=>koreaTime().clock.slice(0,5);

const sightings=[
  {place:'성수동 · 폐공장',event:'출입 기록과 목격 진술 불일치. 검은 특수복 인물 이탈.',x:378,y:82},
  {place:'용산 · 철도 경계',event:'감시 카메라 영상 소실. 선로 옆에서 잔류 파장 검출.',x:220,y:170},
  {place:'마포 · 지하 연결로',event:'동일한 문장을 말하는 목격자 3명. 진술 교차 검증 중.',x:92,y:98},
  {place:'서초 · 연구 시설 외곽',event:'신원 불명 인물의 장비 접촉 흔적. 순찰 경로 변경.',x:325,y:218},
  {place:'종로 · 골목길',event:'추정 대상이 군중 속으로 이동. 비콘에 관찰 기록 전달.',x:245,y:54},
  {place:'송파 · 물류 통로',event:'미등록 파장 순간 포착. 감지 범위 밖으로 신호 이동.',x:427,y:191},
];
const history=[
  {id:'origin',era:'기원기',code:'ARCHIVE 001 / THE FIRST RIFT',title:'처음에는, 문이라고 불렀다.',summary:'세계 각지의 미확인 공간 균열과 최초 각성이 함께 관측되다.',body:['수십 년 전, 서로 연락할 수 없었던 여러 지역에서 같은 종류의 보고가 도착했다. 있어서는 안 될 곳에 문이 나타났다는 내용이었다.','문 안쪽의 공간은 관측 위치와 일치하지 않았다. 일부에서는 괴물이 발생했고, 일부에서는 환경 자체가 살아 있는 것처럼 반응했다.','최초의 센티넬 각성은 이 시기의 게이트 관측과 거의 동시에 기록되었다. 선후 관계는 아직 확정되지 않았다.'],rule:'문 너머에서 자신의 이름이 들리더라도 응답하지 말 것. 이 문장은 복원 담당자의 부기다.'},
  {id:'administration',era:'설립기',code:'ARCHIVE 002 / THE ADMINISTRATION',title:'국가는 그들을 등록하기로 했다.',summary:'센티넬과 가이드의 분류, 그리고 국가 각성자 통합관리청의 설립.',body:['힘을 얻은 이들에게서 감각 과부하와 정신 붕괴가 보고되었다. 그 힘을 안정시키는 또 다른 각성자, 가이드의 존재가 확인되었다.','폭주 사고 예방, 가이드의 배치와 보호, 불법 각성 행위 통제를 위해 국가 각성자 통합관리청이 설립되었다.','기록은 그들을 국민이라고 부른다. 작전 명령서는 같은 사람을 전력이라고 부른다. 두 문서 모두 정식 양식이다.'],rule:'매년 6월, 미각성자 정기 검사를 실시한다. 외형만으로 각성 여부를 판단하지 않는다.'},
  {id:'returned',era:'봉쇄 이후',code:'ARCHIVE 003 / RETURNED WITHOUT PERMISSION',title:'생존자 명단에 없는 사람이 돌아왔다.',summary:'붕괴한 오리진 게이트, 그리고 분류할 수 없었던 귀환 기록.',body:['초기의 게이트 대부분은 단기간 안에 붕괴되었다. 일부 현장에는 무엇인가 빠져나온 흔적이 남았다.','통과자, 침식자, 귀환체. 기록 담당자들은 센티넬도 가이드도 아닌 존재들에게 임시 분류를 붙였다.','오리진은 이 게이트 사건에서 생환한 네 명으로 구성되었다. 불가능한 임무에 투입되는 마지막 선택이자, 관리청 스스로도 통제하지 못하는 변수다.'],rule:'사망 통보가 끝난 사람이 돌아왔다면, 먼저 이름을 묻지 말고 신원 확인 절차를 요청할 것.',classified:true},
  {id:'today',era:'현재',code:'ARCHIVE 004 / AN ORDINARY DAY',title:'그날 이후에도 출근은 계속되었다.',summary:'추적관리팀의 하루, 갱생 프로젝트, 그리고 대중 앞에 선 헌터들.',body:['비콘은 미등록 각성자의 흔적을 쫓는다. 실드는 재앙을 막는 한편, 관리 대상에게 사회의 규칙을 가르친다.','럭키트릭과 옵시더스의 전투는 대중의 응원을 받는다. 무대처럼 보이는 순간에도 담당 연구원은 마력 수치를 확인한다.','게이트는 여전히 열린다. 오늘의 보고서도 어제와 같은 양식이다. 이상 없음이라는 문구를 적기 전에, 보고서 뒷면을 한 번 더 확인할 것.'],rule:'모든 사건은 처리 여부와 무관하게 기록으로 남긴다. 해결 도장이 찍힌 문서를 임의로 파기하지 말 것.'},
];
const seeds={
  lucky:[['현장 1열','재인 표창 돌아오는 궤도 봤어요? 오늘도 무사 귀환해서 다행 ♡'],['건틀렛 응원단','운새에게 오늘도 조용하고 큰 응원을 보냅니다.'],['트릭 메모장','단조랑 유진 현장 브리핑 다시 보는 중. 다치지 말기!']],
  obsidus:[['검은 방패','모현이 방패 들어주는 순간이 제일 안심돼요.'],['오후의 팬','한호 브리핑 말투는 여유로운데 현장에선 정말 정확하다.'],['정비실 옆자리','차빈, 유환 오늘도 무사 귀환! 다음 소통 기다릴게요.']],
};
const conversations={
  origin:[['bug','연구소 와이파이 누가 껐어요.'],['ibex','네가 점검한다고 했다.'],['jaeshin','천장 선은 내가 안 건드렸는데.'],['slun','그럼 오늘 검사는 안 해도 되나?']],
  beacon:[['binjo','회의는 10분. 필요한 내용만 보고해.'],['shepherd','현장 나갑니다. 또 전화 안 받네요.'],['seowon','제가 먼저 연락해 볼게요.'],['levit','따분한 건 네가 해.'],['yeomyeong','기록실에 남은 진술도 확인할게요.']],
  shield:[['wonhyeol','전원 상태 보고.'],['dain','다들 식사는 했어요?'],['jion','밥보다 장비 먼저 챙겨.'],['sando','둘 다 챙기면 된다.'],['baekjin','전 준비됐습니다! 아마도요.']],
  lucky:[['jaein','오늘도 안전하게. 장비 확인부터 하자.'],['danjo','네.'],['unsae','제 건틀렛… 어디 뒀더라.'],['yujin','충전실. 어제 내가 옮겼어.']],
  obsidus:[['chabin','출동 전에 장비 점검.'],['hanho','팬 메시지 하나만 더 보고요.'],['mohyun','방패 이상 없음.'],['yuhwan','내 팔도 이상 없음. 아마.']],
};

export function initExperiences({isStaff,toast,readStorage,saveStorage,motionOff}){
  const sessionLogs=[`${time()} · 외부인 열람 채널 연결`];
  let trackingPaused=false, trail=[],lastSighting=-1;
  const recordDialog=$('#record-dialog');
  function openRecord(title,html,variant='paper'){
    recordDialog.dataset.variant=variant;
    $('#record-content').innerHTML=`<span class="record-eyebrow">SGIA / 기록 열람 단말</span><h2 id="record-title">${safe(title)}</h2>${html}`;
    recordDialog.showModal();
  }
  $('#record-close').onclick=()=>recordDialog.close();
  recordDialog.addEventListener('click',event=>{
    const r=recordDialog.getBoundingClientRect();if(event.target===recordDialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))recordDialog.close();
  });
  function requestLogin(){document.dispatchEvent(new CustomEvent('sgia:request-login'));}
  function addSessionLog(line){sessionLogs.unshift(`${time()} · ${line}`);sessionLogs.splice(40);}
  $('#network-log').onclick=()=>openRecord('단말 접속 기록',`<ol class="record-lines">${sessionLogs.map(l=>`<li>${safe(l)}</li>`).join('')}</ol><p>현재 접속 세션에 한해 보관되는 로컬 단말 기록입니다.</p>`,'terminal');
  $('#emergency-alert').onclick=()=>{
    chirp(620);addSessionLog('모의 비상 경보 확인');
    openRecord('비상 대응 훈련 / CODE AMBER','<span class="alert-heading">모의 상황 · 실제 경보가 아닙니다.</span><p>구역 내 미확인 마력 반응을 감지했습니다. 현장 요원은 통제선과 대피 동선을 확인하십시오.</p><ol><li>개체와의 거리를 유지하십시오.</li><li>신원 확인 전 임의로 문을 열지 마십시오.</li><li>직원 단말의 사건 기록실에서 모의 신고를 접수할 수 있습니다.</li></ol><button id="alert-ack" class="paper-button">지침 확인 · 수신 완료</button>','alert');
    $('#alert-ack').onclick=()=>{addSessionLog('비상 지침 수신 완료');recordDialog.close();toast('비상 대응 지침을 확인했습니다.');};
  };
  // The warrant uses curated character facts; sightings below are generated story events.
  function nextSighting(){
    const choices=sightings.map((_,i)=>i).filter(i=>i!==lastSighting);lastSighting=pick(choices);
    trail.push({...sightings[lastSighting],time:time()});trail=trail.slice(-5);
    const last=trail.at(-1);
    $('#tracking-status').textContent=pick(['SIGNAL ACQUIRED','VISUAL UNCONFIRMED','PURSUIT ACTIVE']);
    $('#last-sighting').textContent=last.place;
    $('#tracking-trail').innerHTML=`<polyline points="${trail.map(p=>`${p.x},${p.y}`).join(' ')}" fill="none" stroke="#dc8072" stroke-width="1" stroke-dasharray="4 7"/>`+trail.map((p,i)=>`<g class="track-footprint ${i===trail.length-1?'latest':''}" style="animation-delay:${i*.1}s" transform="translate(${p.x} ${p.y}) rotate(${i*37})"><ellipse cx="-4" cy="-3" rx="2" ry="5" fill="#f7b0a0"/><ellipse cx="4" cy="5" rx="2" ry="5" fill="#f7b0a0"/>${i===trail.length-1?'<circle r="17" fill="none" stroke="#dc8072" stroke-dasharray="3 4"/>':''}</g>`).join('');
    $('#sighting-log').innerHTML=trail.toReversed().map(p=>`<li><time>${p.time}</time><div><strong>${p.place}</strong><span>${p.event}</span></div></li>`).join('');
    addSessionLog(`가상 수색 신호 · ${last.place}`);
  }
  $('#track-az').onclick=()=>{nextSighting();chirp(480);};
  $('#tracking-pause').onclick=()=>{trackingPaused=!trackingPaused;$('#tracking-pause').setAttribute('aria-pressed',String(trackingPaused));$('#tracking-pause').textContent=trackingPaused?'자동 추적 재개':'자동 추적 일시정지';};
  $('#wanted-file').onclick=()=>{
    if(!isStaff()){requestLogin();return;}
    const az=characters.find(c=>c.id==='az');
    openRecord('ORPÉ / AZ · 수배 원본',`<div class="warrant-detail"><img src="${safe(az.gallery[1].url)}" alt="에이지 수배 참고 이미지"><div><span class="wanted-seal">일급<br>수배</span><p><b>위험도: 측정 불가</b><br>소속: 불법 사설 단체 ORPÉ</p><p>${safe(az.ability)}</p><p>반경 2km 내 대상의 발화를 동기화할 수 있습니다. 대상의 정신은 또렷한 상태로 남을 수 있으므로 진술만으로 안전을 판정하지 마십시오.</p><p>${safe(az.notes)}</p><a href="${safe(az.link)}" target="_blank" rel="noopener noreferrer">에이지 캐릭터 기록으로 ↗</a></div></div>`);
  };
  nextSighting();setInterval(()=>{if(!document.hidden&&!trackingPaused&&!motionOff()&&!$('#wanted-panel').hidden)nextSighting();},18000);
  document.addEventListener('sgia:team',event=>{
    const id=event.detail.team;$('#wanted-panel').hidden=id!=='orpe';
    const idol=['lucky','obsidus'].includes(id);$('#idol-banner').hidden=!idol;
    if(idol){$('#idol-banner-title').textContent=teams.find(t=>t.id===id).en;$('#idol-banner').dataset.crew=id;$('#open-fan-channel').dataset.crew=id;}
  });
  $('#open-fan-channel').onclick=event=>{$('#fan-team').value=event.currentTarget.dataset.crew;renderFan();$('#community').scrollIntoView({behavior:motionOff()?'instant':'smooth'});};
  // Receiver tuning alters signal clarity and the optional audible tone.
  let radioOn=false,radioOsc,radioGain,radioBusy=false;
  function tune(){
    const hz=Number($('#frequency').value),quality=Math.max(8,100-Math.abs(hz-98.6)*5);
    $('#frequency-label').value=`${hz.toFixed(1)} Hz`;
    $('#signal-quality').textContent=quality>85?'수신 양호':quality>50?'신호 탐색 중':'간섭 · 수신 불안정';
    $('#signal-strength').style.width=`${quality}%`;
    $('#incidents').style.setProperty('--radio-noise',String((100-quality)/450));
    $('#incidents').style.setProperty('--radio-speed',`${Math.max(.8,quality/25)}s`);
    if(radioOsc)radioOsc.frequency.setTargetAtTime(hz*2,soundContext().currentTime,.06);
  }
  function stopRadio(){radioOn=false;if(radioOsc){try{radioOsc.stop();}catch{}radioOsc.disconnect();radioGain.disconnect();radioOsc=null;}$('#radio-sound').setAttribute('aria-pressed','false');$('#radio-sound').textContent='수신음 OFF';}
  $('#frequency').addEventListener('input',tune);tune();
  $('#radio-sound').onclick=async()=>{
    if(radioBusy)return;if(radioOn){stopRadio();return;}radioBusy=true;
    try{const ctx=soundContext();if(!ctx)throw Error();await ctx.resume();if(!isStaff())return;if(ctx.state!=='running')throw Error();radioOsc=ctx.createOscillator();radioGain=ctx.createGain();radioGain.gain.value=.018;radioOsc.type='triangle';radioOsc.frequency.value=Number($('#frequency').value)*2;radioOsc.connect(radioGain);radioGain.connect(ctx.destination);radioOsc.start();radioOn=true;$('#radio-sound').setAttribute('aria-pressed','true');$('#radio-sound').textContent='수신음 ON';}catch{toast('수신음을 재생할 수 없습니다.');}finally{radioBusy=false;}
  };
  window.addEventListener('pagehide',stopRadio);
  // Local fan board. Stored text is validated and escaped before rendering.
  const storedPosts=readStorage('onlyunlimit.sgia.fan.v1');
  let posts=Array.isArray(storedPosts)?storedPosts.filter(p=>p&&['lucky','obsidus'].includes(p.team)&&typeof p.text==='string'&&p.text.length<=280&&typeof p.id==='string'&&p.id.length<80&&typeof p.liked==='boolean').slice(-40):[];
  let cheering={lucky:false,obsidus:false};
  function renderFan(){
    const id=$('#fan-team').value,t=teams.find(t=>t.id===id);
    $('.fan-lounge').dataset.crew=id;$('.fan-stage').classList.toggle('cheering',cheering[id]);
    $('#fan-logo').src=teamLogos[id];$('#fan-title').textContent=t.en;
    $('#lightstick').textContent=cheering[id]?'✦ 응원봉 끄기':'✧ 응원봉 켜기';$('#lightstick').setAttribute('aria-pressed',String(cheering[id]));
    $('#fan-cheer').textContent=cheering[id]?'당신의 빛이 켜졌습니다. 무사 귀환을 응원해요.':'오늘도 무사히 돌아와 줘.';
    const personal=posts.filter(p=>p.team===id).slice(-4).toReversed();
    $('#fan-posts').innerHTML=personal.map(p=>`<article class="fan-post"><small>나의 응원 / LOCAL FAN</small><p>${safe(p.text)}</p><button data-like="${safe(p.id)}" aria-pressed="${p.liked}">${p.liked?'♥ 1':'♡ 0'}</button></article>`).join('')+seeds[id].slice(0,personal.length?1:3).map(([author,text])=>`<article class="fan-post"><small>${author} · 팬보드 기록</small><p>${text}</p></article>`).join('');
  }
  $('#fan-team').onchange=renderFan;
  $('#lightstick').onclick=()=>{const id=$('#fan-team').value;cheering[id]=!cheering[id];renderFan();if(cheering[id])chirp(1300);};
  $('#fan-form').onsubmit=event=>{event.preventDefault();const text=$('#fan-message').value.trim();if(!text)return;posts.push({id:crypto.randomUUID(),team:$('#fan-team').value,text:text.slice(0,280),liked:false});posts=posts.slice(-40);saveStorage('onlyunlimit.sgia.fan.v1',posts);$('#fan-message').value='';renderFan();toast('팬보드에 응원을 남겼습니다.');};
  $('#fan-posts').onclick=event=>{const button=event.target.closest('[data-like]');if(!button)return;const post=posts.find(p=>p.id===button.dataset.like);if(!post)return;post.liked=!post.liked;saveStorage('onlyunlimit.sgia.fan.v1',posts);renderFan();};
  renderFan();
  // Scripted team chat; there is no external message delivery or AI service.
  const storedChats=readStorage('onlyunlimit.sgia.chats.v1');
  const chats={};
  for(const t of teams.filter(t=>t.id!=='orpe')){
    const saved=storedChats?.[t.id];
    chats[t.id]=Array.isArray(saved)?saved.filter(m=>m&&typeof m.text==='string'&&m.text.length<=220&&typeof m.name==='string'&&m.name.length<35&&typeof m.self==='boolean').slice(-40):[];
  }
  $('#chat-team').innerHTML=teams.filter(t=>t.id!=='orpe').map(t=>`<option value="${t.id}">${t.name} 단톡</option>`).join('');
  function renderChat(){
    $('#chat-locked').hidden=isStaff();$('#chat-workspace').hidden=!isStaff();
    if(!isStaff()){$('#chat-messages').replaceChildren();return;}
    const id=$('#chat-team').value;
    $('#chat-members').textContent=characters.filter(c=>c.team===id).map(c=>c.name.split(' · ')[0]).join(' · ');
    const lines=[...conversations[id].map(([id,text])=>({name:characters.find(c=>c.id===id).name.split(' · ')[0],text,self:false})),...chats[id]];
    $('#chat-messages').innerHTML=lines.map(m=>`<div class="chat-bubble ${m.self?'self':''}"><small>${safe(m.name)}</small><p>${safe(m.text)}</p></div>`).join('');
    $('#chat-messages').scrollTop=$('#chat-messages').scrollHeight;
  }
  $('#chat-login').onclick=requestLogin;$('#chat-team').onchange=renderChat;
  $('#chat-form').onsubmit=event=>{
    event.preventDefault();if(!isStaff())return;const text=$('#chat-message').value.trim();if(!text)return;
    const id=$('#chat-team').value;
    chats[id].push({name:'나 · STAFF-001',text:text.slice(0,200),self:true});
    const respondent=pick(conversations[id]);
    const replies={origin:['읽었어요. 연구소로 보내 주세요.','검사 시간이면 기록 남기고 오십시오.','일단 커피부터.'],beacon:['확인했습니다. 담당 기록에 남길게요.','현장 도착하면 다시 보고해.','네, 연락처부터 확인할게요.'],shield:['확인. 상태 보고 잊지 마.','무리하지 말고 천천히 해요.','기록에 반영하겠습니다.'],lucky:['고마워요! 오늘도 무사히 돌아올게요.','응원 확인했어. 다들 힘내자.','장비 확인하고 바로 갈게.'],obsidus:['좋아. 출동 준비해.','팬 메시지도 잘 읽고 있어요.','확인. 무사 귀환으로 답하겠습니다.']};
    chats[id].push({name:characters.find(c=>c.id===respondent[0]).name.split(' · ')[0],text:pick(replies[id]),self:false});
    chats[id]=chats[id].slice(-40);saveStorage('onlyunlimit.sgia.chats.v1',chats);$('#chat-message').value='';renderChat();
  };
  renderChat();
  const storedRead=readStorage('onlyunlimit.sgia.history.v1');
  const read=new Set(Array.isArray(storedRead)?storedRead.filter(id=>history.some(h=>h.id===id)):[]);
  function renderHistory(){
    $('#history-records').innerHTML=history.map((h,i)=>`<button class="history-file" data-history="${h.id}"><span class="history-index">0${i+1}</span><span><small>${h.era} / ${h.code}</small><strong>${h.title}</strong><span>${h.summary}</span></span><em>${h.classified&&!isStaff()?'직원 열람 ◇':read.has(h.id)?'열람 완료 ↗':'기록 개봉 ↗'}</em></button>`).join('');
  }
  $('#history-records').onclick=event=>{
    const button=event.target.closest('[data-history]');if(!button)return;const h=history.find(h=>h.id===button.dataset.history);
    if(h.classified&&!isStaff()){requestLogin();return;}
    read.add(h.id);saveStorage('onlyunlimit.sgia.history.v1',[...read]);renderHistory();addSessionLog(`문서 열람 · ${h.code}`);
    openRecord(h.title,`<span class="archive-file-code">${h.code} / ${h.era}</span>${h.body.map((p,i)=>`<p class="history-paragraph"><small>0${i+1}</small>${p}</p>`).join('')}<blockquote>${h.rule}</blockquote><small>세계관 가상 문서 · 복원 담당자의 주석 포함</small>`);
  };
  $('#history-protocol').onclick=()=>openRecord('보존 기록 열람 수칙','<ol class="protocol-list"><li>기록에서 빠진 날짜를 추정해 채워 넣지 마십시오.</li><li>다른 열람자가 보이지 않더라도 좌석을 양보하라는 방송에는 응답하지 마십시오.</li><li>직원의 이름이 자신의 이름으로 바뀌어 보인다면 문서를 닫으십시오.</li><li>해결 완료 도장이 두 번 찍혀 있다면, 두 번째 도장의 날짜를 확인하지 마십시오.</li></ol><p>이 수칙은 SGIA 세계관 체험을 위한 창작 문서입니다.</p>');
  renderHistory();
  document.addEventListener('sgia:viewer',()=>{if(recordDialog.open)recordDialog.close();if(!isStaff())stopRadio();renderChat();renderHistory();addSessionLog(isStaff()?'직원 로그인 · STAFF-001':'직원 로그아웃 · 외부인 채널 전환');});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopRadio();});
}
