// Owner console: member guestbook inbox with read, edit, hide/restore, delete, IP view and IP block.
export const guestbookAdminClient = String.raw`
function initGuestbookAdmin(){
 if(document.querySelector('#guestbook-console'))return;
 const box=document.createElement('section');box.id='guestbook-console';box.className='artist-console';
 box.innerHTML='<div class="bar"><h2>요원 방명록</h2><select aria-label="방명록 필터" data-gb-filter><option value="new">새 글</option><option value="all">전체</option></select><button data-gb-refresh>새로고침</button></div><p class="muted">요원 기록물 뒷면에 남겨진 글입니다. 숨김은 되돌릴 수 있고 삭제는 복구할 수 없습니다. IP는 작성일로부터 30일 동안만 확인할 수 있습니다.</p><div data-gb-list></div><button data-gb-more hidden>더 보기</button><p data-gb-status role="status"></p>';
 document.querySelector('#workspace').append(box);
 const list=box.querySelector('[data-gb-list]'),status=box.querySelector('[data-gb-status]'),filter=box.querySelector('[data-gb-filter]'),more=box.querySelector('[data-gb-more]');
 let offset=0,busy=false,target=new URLSearchParams(location.search).get('guestbook');if(!/^[a-f0-9-]{36}$/.test(target||''))target=null;
 async function read(id){await api('guestbook/'+id,'PATCH',{read:true});if(notificationsReady)await refreshNotifications();const registration=await navigator.serviceWorker?.getRegistration?.();for(const n of await registration?.getNotifications?.()||[])if(n.data?.url==='/admin?guestbook='+id)n.close();}
 function row(n){
  const el=document.createElement('article');el.className=n.hidden?'hidden':'';el.dataset.note=n.id;
  el.innerHTML='<small>'+esc(n.character)+' · '+esc(new Date(n.created_at).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'}))+(n.hidden?' · 숨김':'')+(n.updated_at?' · 수정됨':'')+(n.read_at?'':' · 새 글')+'</small><h4>'+esc(n.author)+'</h4><p>'+esc(n.message)+'</p><div class="tools">'+(n.read_at?'':'<button data-gb="read">확인</button>')+'<button data-gb="edit">수정</button><button data-gb="'+(n.hidden?'restore':'hide')+'">'+(n.hidden?'복원':'숨김')+'</button><button data-gb="delete">삭제</button><button data-gb="ip">작성 IP 열람</button><button data-gb="block">해당 IP 30일 차단</button></div><p class="ip"></p>';
  return el;
 }
 async function load(reset=true){if(busy)return;busy=true;status.textContent='불러오는 중…';
  try{const start=reset?0:offset,opened=target;target=null;const data=await api(opened?'guestbook?note='+opened:'guestbook?filter='+filter.value+'&offset='+start);if(reset)list.replaceChildren();
   data.notes.forEach(n=>list.append(row(n)));offset=start+data.notes.length;more.hidden=!data.more;status.textContent=list.children.length?'':'방명록이 없습니다.';
   if(opened){box.scrollIntoView({block:'start'});await read(opened);}
  }catch(e){status.textContent=e.message;}finally{busy=false;}}
 list.onclick=async e=>{const b=e.target.closest('[data-gb]');if(!b)return;const el=b.closest('[data-note]'),id=el.dataset.note,action=b.dataset.gb;b.disabled=true;
  try{
   if(action==='read'){await read(id);b.remove();}
   else if(action==='edit'){const author=prompt('이름',el.querySelector('h4').textContent);if(author===null)return;const message=prompt('내용 (100자 이내)',el.querySelector('p').textContent);if(message===null)return;await api('guestbook/'+id,'PATCH',{author,message});await load();}
   else if(action==='hide'||action==='restore'){await api('guestbook/'+id,'PATCH',{hidden:action==='hide'});await load();}
   else if(action==='delete'){if(!confirm('이 방명록을 삭제할까요? 복구할 수 없습니다.'))return;await api('guestbook/'+id,'DELETE');el.remove();}
   else if(action==='ip'){const r=await api('ip','POST',{id});el.querySelector('.ip').textContent=r.ip||'보관 기간 만료 또는 IP 없음';}
   else if(action==='block'){if(!confirm('이 IP의 작성을 30일 차단할까요?'))return;await api('moderate','POST',{kind:'guestbook',id,action:'block'});status.textContent='차단했습니다.';}
  }catch(err){status.textContent=err.message;}finally{b.disabled=false;}};
 filter.onchange=()=>load();box.querySelector('[data-gb-refresh]').onclick=()=>load();more.onclick=()=>load(false);load();
}
`;
