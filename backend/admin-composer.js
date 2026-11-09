import { mediaClientSource } from './admin-media.generated.js';
export const composerJS = mediaClientSource + '\n' +
  String.raw`
const timeField=(value)=>'<label>작성 시각 · 한국 시간<input name="created_at" type="datetime-local" step="1" min="1970-01-01T09:00" max="9999-12-31T23:59:59" value="'+(value===undefined?'':new Date(value+9*3600000).toISOString().slice(0,19))+'"></label><small>비우면 '+(value===undefined?'현재 시각으로 등록':'기존 시각 유지')+'됩니다.</small>';
function selectedTime(value){if(!value)return undefined;const time=Date.parse(value+'+09:00');if(!Number.isFinite(time))throw Error('작성 시각을 확인해 주세요.');return time;}
let memberCache=[],adminPosts=[],composerReady=false;
const memberOptions=(group,selected)=>memberCache.filter(m=>!group||m.board===group).map(m=>'<option value="'+esc(m.id)+'" '+(m.id===selected?'selected':'')+'>'+esc((m.team||m.board)+' / '+m.name)+'</option>').join('');
function closeEditor(){$('#admin-editor').close();$('#admin-editor-body').replaceChildren();}
function editor(title,html,submit){$('#editor-status').textContent='';$('#admin-editor-title').textContent=title;$('#admin-editor-body').innerHTML=html;$('#admin-editor').showModal();const form=$('#admin-editor form');form.onsubmit=async e=>{e.preventDefault();const button=form.querySelector('button[type=submit]');button.disabled=true;$('#editor-status').textContent='저장 중…';try{await submit(Object.fromEntries(new FormData(form)),form);closeEditor();message('저장했습니다.');await load();}catch(e){$('#editor-status').textContent=e.message;}finally{button.disabled=false;}};return form;}
async function initComposer(){
 memberCache=(await api('members')).members;
 if(!composerReady){composerReady=true;$('#workspace').insertAdjacentHTML('afterbegin','<section class="artist-console"><div class="bar"><h2>멤버 스튜디오</h2><a href="https://onlyunlimit.github.io/community.html" target="_blank" rel="noopener">커뮤니티 열기 ↗</a></div><div class="studio-controls"><label>멤버 선택<select id="studio-member"></select></label><button id="artist-compose">멤버 글 작성 ＋</button><button id="profile-edit">멤버 프로필 수정</button></div><p class="muted">공식 배지는 이 관리 채널에서 작성한 글·댓글에만 표시됩니다. 멤버 프로필은 저장 즉시 커뮤니티에 반영됩니다.</p></section>');
 $('#artist-compose').onclick=()=>{
  let images;const form=editor('멤버 게시글 작성','<form><label>작성 멤버<select name="member_id">'+memberOptions(null,$('#studio-member').value)+'</select></label>'+timeField()+'<label>제목<input name="title" maxlength="100" required></label><label>내용<textarea name="body" maxlength="5000" required></textarea></label>'+uploadMarkup+'<button type="submit">공식 게시글 등록</button></form>',async(data)=>{await api('publish','POST',{...data,created_at:selectedTime(data.created_at),images:images()});});
  images=attachmentPicker(form,[],id=>'/admin/media/'+id);
 };
 $('#profile-edit').onclick=()=>{
  const m=memberCache.find(m=>m.id===$('#studio-member').value);let images;
  const form=editor('멤버 프로필 수정 · '+m.name,'<form><label>이름<input name="name" maxlength="24" value="'+esc(m.name)+'" required></label><label>소개<textarea name="bio" maxlength="500">'+esc(m.bio)+'</textarea></label>'+uploadMarkup.replace('최대 2장','최대 1장')+'<button type="submit">프로필 저장</button></form>',async(data)=>{const image=images()[0];await api('members/'+m.id,'PATCH',{...data,avatar_url:typeof image==='object'?image.url:'',image:typeof image==='string'?image:undefined});});
  images=attachmentPicker(form,m.avatar_url?[{url:m.avatar_url}]:[],id=>'/admin/media/'+id,1);
 };
 }
 const current=$('#studio-member').value,params=new URLSearchParams(location.search);$('#studio-member').innerHTML=memberOptions(null,current||params.get('member'));if(!current&&!params.get('member')&&params.get('board')){const first=memberCache.find(m=>m.board===params.get('board'));if(first)$('#studio-member').value=first.id;}
}
function managedEditor(kind,item){
 let images;const form=editor('관리자 '+(kind==='post'?'게시글':'댓글')+' 수정','<form>'+timeField(item.created_at)+'<label>작성자 멤버<select name="member_id"><option value="">일반 작성자 · 닉네임 입력</option>'+memberOptions(item.board||adminPosts.find(p=>p.id===item.post_id)?.board,item.member_id)+'</select></label><label>작성자 닉네임<input name="author" maxlength="24" value="'+esc(item.author)+'" required></label><small>멤버를 선택하면 해당 멤버의 이름과 공식 배지가 표시됩니다.</small>'+(kind==='post'?'<label>제목<input name="title" maxlength="100" value="'+esc(item.title)+'" required></label>':'')+'<label>내용<textarea name="body" maxlength="'+(kind==='post'?5000:1000)+'" required>'+esc(item.body)+'</textarea></label>'+(kind==='post'?uploadMarkup:'')+'<button type="submit">수정 저장</button></form>',async(data)=>{const payload={title:data.title,body:data.body,author:data.author,member_id:data.member_id||null,created_at:selectedTime(data.created_at)};if(images)payload.images=images();await api((kind==='post'?'posts/':'comments/')+item.id,'PATCH',payload);});
 if(kind==='post')images=attachmentPicker(form,item.images||[],id=>'/admin/media/'+id);
}
async function artistReply(postId){
 const p=adminPosts.find(p=>p.id===postId);if(!p)throw Error('게시물을 찾을 수 없습니다.');
 const {comments}=await api('comments?post='+postId);
 editor('멤버 댓글·답글','<form><label>작성 멤버<select name="member_id">'+memberOptions(p.board,$('#studio-member').value)+'</select></label><label>답글 대상<select name="parent_id"><option value="">게시물에 새 댓글</option>'+comments.filter(c=>!c.deleted_at&&!c.hidden&&!c.parent_id).map(c=>'<option value="'+esc(c.id)+'">'+esc(c.author+': '+c.body.slice(0,60))+'</option>').join('')+'</select></label><label>내용<textarea name="body" maxlength="1000" required></textarea></label><button type="submit">공식 답글 등록</button></form>',async data=>{await api('reply','POST',{...data,post_id:postId});});
}
`;

export const likeEditorJS = String.raw`
function editLikes(kind,id){
 editor('좋아요 수 설정','<form><label>표시할 좋아요 수<input name="likes" type="number" min="0" max="10000000" step="1" required></label><p class="muted">표시 수를 설정합니다. 이후 이용자의 좋아요·취소는 이 수에 반영됩니다.</p><button type="submit">저장</button></form>',async data=>api((kind==='post'?'posts/':'comments/')+id+'/likes','PATCH',{likes:Number(data.likes)}));
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-like-edit]');if(b)editLikes(b.dataset.kind,b.dataset.likeEdit);});
`;
