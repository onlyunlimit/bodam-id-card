export const playlistAdminClient=String.raw`
function initPlaylistAdmin(){
 if(document.querySelector('#playlist-console'))return;
 const box=document.createElement('section');box.id='playlist-console';box.className='artist-console';
 box.innerHTML='<div class="bar"><h2>음악 플레이리스트</h2><button id="playlist-manage">목록 관리</button></div><p class="muted">캐릭터와 어울리는 곡을 직접 큐레이션합니다. 저장한 목록은 홈페이지에 공개됩니다.</p><div id="playlist-admin-list"></div>';
 document.querySelector('#workspace').append(box);
 box.querySelector('#playlist-manage').onclick=async()=>{try{
  const result=await api('playlists'),list=box.querySelector('#playlist-admin-list');
  list.innerHTML='<button id="playlist-new">새 플레이리스트</button>'+result.playlists.map(p=>'<article><b>'+esc(p.title)+'</b><small> · '+p.tracks.length+'곡</small><div class="tools"><button data-playlist-edit="'+esc(p.id)+'">편집</button><button data-playlist-delete="'+esc(p.id)+'">삭제</button></div></article>').join('');
  list.querySelector('#playlist-new').onclick=()=>editPlaylist({title:'',description:'',member_id:'',tracks:[]});
  list.querySelectorAll('[data-playlist-edit]').forEach(b=>b.onclick=()=>editPlaylist(result.playlists.find(p=>p.id===b.dataset.playlistEdit)));
  list.querySelectorAll('[data-playlist-delete]').forEach(b=>b.onclick=async()=>{if(!confirm('이 플레이리스트를 삭제할까요?'))return;try{await api('playlists/'+b.dataset.playlistDelete,'DELETE');box.querySelector('#playlist-manage').click();}catch(e){message(e);}});
 }catch(e){message(e);}};
}
async function editPlaylist(p){try{
 const members=(await api('members')).members||[];
 const d=document.querySelector('#admin-editor');document.querySelector('#admin-editor-title').textContent='플레이리스트 편집';document.querySelector('#editor-status').textContent='';
 document.querySelector('#admin-editor-body').innerHTML='<form id="playlist-edit-form"><label>이름<input name="title" maxlength="100" required value="'+esc(p.title)+'"></label><label>멤버<select name="member_id"><option value="">전체 / 제작자 선곡</option>'+members.map(m=>'<option value="'+esc(m.id)+'" '+(p.member_id===m.id?'selected':'')+'>'+esc(m.name)+'</option>').join('')+'</select></label><label>소개<textarea name="description" maxlength="500">'+esc(p.description)+'</textarea></label><div id="playlist-track-fields"></div><button type="button" id="playlist-add-track">곡 추가 ＋</button><p class="muted">재생 순서는 위에서 아래입니다. 유튜브 동영상 링크를 사용하며 광고·지역 제한은 유튜브 정책을 따릅니다.</p><button type="submit">저장</button></form>';
 const f=document.querySelector('#playlist-edit-form'),rows=f.querySelector('#playlist-track-fields');
 function add(t={}){if(rows.children.length>=100)return;const el=document.createElement('fieldset');el.style.cssText='border:1px solid #8885;border-radius:12px;margin:12px 0;padding:12px;display:grid;gap:8px';el.innerHTML='<label>곡명<input data-track-title required maxlength="120" value="'+esc(t.title||'')+'"></label><label>가수<input data-track-artist maxlength="100" value="'+esc(t.artist||'')+'"></label><label>유튜브 링크<input data-track-url type="url" required value="'+esc(t.video_id?'https://www.youtube.com/watch?v='+t.video_id:'')+'"></label><div class="tools"><button type="button" data-up>위로</button><button type="button" data-down>아래로</button><button type="button" data-remove>곡 삭제 ×</button></div>';el.querySelector('[data-remove]').onclick=()=>el.remove();el.querySelector('[data-up]').onclick=()=>{if(el.previousElementSibling)rows.insertBefore(el,el.previousElementSibling);};el.querySelector('[data-down]').onclick=()=>{if(el.nextElementSibling)rows.insertBefore(el.nextElementSibling,el);};rows.append(el);}
 p.tracks.forEach(add);f.querySelector('#playlist-add-track').onclick=()=>add();
 f.onsubmit=async e=>{e.preventDefault();const button=f.querySelector('[type=submit]');button.disabled=true;try{await api('playlists'+(p.id?'/'+p.id:''),p.id?'PATCH':'POST',{title:f.elements.title.value,description:f.elements.description.value,member_id:f.elements.member_id.value,tracks:[...rows.children].map(el=>({title:el.querySelector('[data-track-title]').value,artist:el.querySelector('[data-track-artist]').value,url:el.querySelector('[data-track-url]').value}))});d.close();document.querySelector('#playlist-manage').click();message('플레이리스트를 저장했습니다.');}catch(e){document.querySelector('#editor-status').textContent=e.message;}finally{button.disabled=false;}};
 if(!d.open)d.showModal();
}catch(e){message(e);}}
`;
