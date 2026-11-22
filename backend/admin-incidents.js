export const incidentAdminClient = String.raw`
let incidentRows=[],incidentCursor=null;
async function loadIncidents(append=false){
 const r=await api('incidents'+(append&&incidentCursor?'?after='+incidentCursor:''));
 incidentRows=append?[...incidentRows,...r.incidents]:r.incidents;incidentCursor=r.next;
 $('#incident-admin-list').innerHTML=incidentRows.map(r=>'<article data-case="'+esc(r.id)+'"><small>'+esc(r.type)+' · '+esc(r.grade)+' · '+new Date(r.created).toLocaleString('ko-KR')+' · '+(r.resolvedAt?'종결':'처리 대기')+'</small><h3>'+esc(r.zone||r.location)+'</h3><small>'+esc(r.location)+' · '+esc(r.reporter||'자동 관측')+'</small><p>'+esc(r.detail)+'</p><div class="tools"><button data-case-edit="'+esc(r.id)+'">수정</button><button data-case-close="'+esc(r.id)+'">'+(r.resolvedAt?'재개':'종결')+'</button><button data-case-delete="'+esc(r.id)+'">삭제</button></div></article>').join('')||'<p>사건 기록이 없습니다.</p>';
 $('#incident-more').hidden=!incidentCursor;
}
function initIncidentAdmin(){
 if($('#incident-admin'))return;
 const section=document.createElement('section');section.id='incident-admin';
 section.innerHTML='<div class="bar"><h2>사건 기록 관리</h2><button id="incident-load">목록 열기 / 새로고침</button></div><div id="incident-admin-list"></div><button id="incident-more" hidden>더 보기</button>';
 $('#workspace').append(section);
 $('#incident-load').onclick=()=>loadIncidents().catch(message);
 $('#incident-more').onclick=()=>loadIncidents(true).catch(message);
 section.onclick=async e=>{
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
