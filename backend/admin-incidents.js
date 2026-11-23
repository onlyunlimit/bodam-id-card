export const incidentAdminClient = String.raw`
let incidentRows=[],incidentCursor=null;
const incidentSelection=new Set();
const duplicateKey=r=>[r.type,r.zone||r.location,r.location].map(s=>String(s||'').replace(/\s+/g,'').toLowerCase()).join('|');
function duplicateCases(r){return incidentRows.filter(x=>x.id!==r.id&&duplicateKey(x)===duplicateKey(r));}
function updateIncidentSelection(){const label=$('#incident-selected');if(label)label.textContent=incidentSelection.size+'건 선택';}

async function loadIncidents(append=false){
 const r=await api('incidents'+(append&&incidentCursor?'?after='+incidentCursor:''));
 incidentRows=append?[...incidentRows,...r.incidents]:r.incidents;incidentCursor=r.next;
 incidentSelection.clear();updateIncidentSelection();if($('#incident-select-all'))$('#incident-select-all').checked=false;
 $('#incident-admin-list').innerHTML=incidentRows.map(r=>'<article data-case="'+esc(r.id)+'"><label class="case-select"><input type="checkbox" data-case-select="'+esc(r.id)+'"> 선택</label><small>'+esc(r.type)+' · '+esc(r.grade)+' · '+new Date(r.created).toLocaleString('ko-KR')+' · '+(r.resolvedAt?'종결':'처리 대기')+'</small><h3>'+esc(r.zone||r.location)+'</h3><small>'+esc(r.location)+' · '+esc(r.reporter||'자동 관측')+'</small><p>'+esc(r.detail)+'</p><div class="tools">'+(duplicateCases(r).length?'<button data-case-compare="'+esc(r.id)+'">유사 사건 '+duplicateCases(r).length+'건 대조</button>':'')+'<button data-case-edit="'+esc(r.id)+'">수정</button><button data-case-close="'+esc(r.id)+'">'+(r.resolvedAt?'재개':'종결')+'</button><button data-case-delete="'+esc(r.id)+'">삭제</button></div></article>').join('')||'<p>사건 기록이 없습니다.</p>';
 $('#incident-more').hidden=!incidentCursor;
}
function initIncidentAdmin(){
 if($('#incident-admin'))return;
 const section=document.createElement('section');section.id='incident-admin';
 section.innerHTML='<div class="bar"><h2>사건 기록 관리</h2><button id="incident-load">목록 열기 / 새로고침</button></div><div class="tools incident-bulk-tools"><label><input id="incident-select-all" type="checkbox"> 현재 목록 선택</label><span id="incident-selected">0건 선택</span><button data-case-bulk="resolve">선택 종결</button><button data-case-bulk="reopen">선택 재개</button><button data-case-bulk="delete">선택 삭제</button><button id="incident-load-all">전체 불러와 중복 대조</button></div><p>유형·구역·발생 위치가 같은 기록을 대조 후보로 표시합니다. 본문과 시각을 확인한 뒤 처리해 주세요.</p><div id="incident-admin-list"></div><button id="incident-more" hidden>더 보기</button>';
 $('#workspace').append(section);
 $('#incident-load').onclick=()=>loadIncidents().catch(message);
 $('#incident-more').onclick=()=>loadIncidents(true).catch(message);
 $('#incident-select-all').onchange=e=>{incidentSelection.clear();document.querySelectorAll('[data-case-select]').forEach((box,i)=>{box.checked=e.target.checked&&i<100;if(box.checked)incidentSelection.add(box.dataset.caseSelect);});updateIncidentSelection();};
 $('#incident-load-all').onclick=async e=>{const b=e.currentTarget;b.disabled=true;try{await loadIncidents();while(incidentCursor)await loadIncidents(true);message('전체 사건 대조 준비 완료');}catch(err){message(err);}finally{b.disabled=false;}};
 section.onchange=e=>{const box=e.target.closest('[data-case-select]');if(!box)return;if(box.checked&&incidentSelection.size>=100){box.checked=false;message('한 번에 100건까지 선택할 수 있습니다.');return;}if(box.checked)incidentSelection.add(box.dataset.caseSelect);else incidentSelection.delete(box.dataset.caseSelect);updateIncidentSelection();};
 section.onclick=async e=>{
  const bulk=e.target.closest('[data-case-bulk]');
  if(bulk){
   if(!incidentSelection.size){message('처리할 사건을 먼저 선택해 주세요.');return;}
   const action=bulk.dataset.caseBulk,label=action==='delete'?'삭제':action==='resolve'?'종결':'재개';
   if(!confirm(incidentSelection.size+'건을 '+label+'할까요?'+(action==='delete'?' 삭제한 본문은 복구할 수 없습니다.':'')))return;
   bulk.disabled=true;try{const r=await api('incidents/bulk','POST',{ids:[...incidentSelection],action});await loadIncidents();message(r.count+'건 '+label+' 완료');}catch(err){message(err);}finally{bulk.disabled=false;}return;
  }
  const compare=e.target.closest('[data-case-compare]');
  if(compare){const row=incidentRows.find(r=>r.id===compare.dataset.caseCompare);$('#admin-editor-title').textContent='유사 사건 대조';$('#editor-status').textContent='같은 장소에서 발생한 별개의 사건일 수 있습니다.';$('#admin-editor-body').innerHTML='<div class="case-comparison">'+[row,...duplicateCases(row)].map(r=>'<article><h3>'+esc(r.zone||r.location)+'</h3><small>'+new Date(r.created).toLocaleString('ko-KR')+' · '+esc(r.reporter||'자동 관측')+'</small><p>'+esc(r.location)+'</p><p>'+esc(r.detail)+'</p><small>'+esc((r.coordinates||[]).join(', '))+' · '+(r.resolvedAt?'종결':'처리 대기')+'</small></article>').join('')+'</div>';$('#admin-editor').showModal();return;}

  const b=e.target.closest('[data-case-edit],[data-case-close],[data-case-delete]');if(!b)return;
  const id=b.dataset.caseEdit||b.dataset.caseClose||b.dataset.caseDelete,r=incidentRows.find(x=>x.id===id);b.disabled=true;
  try{
   if(b.dataset.caseEdit){
    $('#admin-editor-title').textContent='사건 기록 수정';$('#editor-status').textContent='';
    $('#admin-editor-body').innerHTML='<form id="case-edit-form">'+[['zone','구역',80],['location','발생 위치',140],['reporter','신고자',40]].map(([key,label,max])=>'<label>'+label+'<input name="'+key+'" value="'+esc(r[key]||(key==='zone'?r.location:''))+'" maxlength="'+max+'" '+(key==='reporter'?'':'required')+'></label>').join('')+'<label>상황 설명<textarea name="detail" minlength="5" maxlength="1500" required>'+esc(r.detail)+'</textarea></label><label>등급<select name="grade">'+['A','B','C','D'].map(g=>'<option '+(g===r.grade?'selected':'')+'>'+g+'</option>').join('')+'</select></label><button type="submit">저장</button></form>';
    $('#admin-editor').showModal();
    $('#case-edit-form').onsubmit=async ev=>{ev.preventDefault();const f=ev.currentTarget,submit=f.querySelector('[type=submit]');submit.disabled=true;try{await api('incidents/'+id,'PATCH',Object.fromEntries(new FormData(f)));closeEditor();await loadIncidents();message('사건 기록 수정 완료');}catch(err){$('#editor-status').textContent=err.message;}finally{submit.disabled=false;}};
   }else if(b.dataset.caseDelete){
    if(!confirm('이 사건 기록을 삭제할까요? 본문이 제거되며 자동 이전으로 다시 등록되지 않습니다.'))return;
    await api('incidents/'+id,'DELETE');await loadIncidents();message('사건 기록 삭제 완료');
   }else{await api('incidents/'+id,'PATCH',{resolved:!r.resolvedAt});await loadIncidents();message('사건 처리 상태 변경 완료');}
  }catch(err){message(err);}finally{b.disabled=false;}
 };
 if(new URLSearchParams(location.search).has('incident'))loadIncidents().then(()=>section.scrollIntoView({block:'start'})).catch(message);
}
`;
