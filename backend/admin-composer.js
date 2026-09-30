import { mediaClientSource } from './admin-media.generated.js';
export const composerJS = mediaClientSource + '\n' +
  String.raw`
let memberCache=[],adminPosts=[],composerReady=false;
const memberOptions=(group,selected)=>memberCache.filter(m=>!group||m.board===group).map(m=>'<option value="'+esc(m.id)+'" '+(m.id===selected?'selected':'')+'>'+esc(m.board+' / '+m.name)+'</option>').join('');
function closeEditor(){$('#admin-editor').close();$('#admin-editor-body').replaceChildren();}
function editor(title,html,submit){$('#editor-status').textContent='';$('#admin-editor-title').textContent=title;$('#admin-editor-body').innerHTML=html;$('#admin-editor').showModal();const form=$('#admin-editor form');form.onsubmit=async e=>{e.preventDefault();const button=form.querySelector('button[type=submit]');button.disabled=true;$('#editor-status').textContent='저장 중…';try{await submit(Object.fromEntries(new FormData(form)),form);closeEditor();message('저장했습니다.');await load();}catch(e){$('#editor-status').textContent=e.message;}finally{button.disabled=false;}};return form;}
async function initComposer(){
 memberCache=(await api('members')).members;
 if(!composerReady){composerReady=true;$('#workspace').insertAdjacentHTML('afterbegin','<section class="artist-console"><div class="bar"><h2>아티스트 스튜디오</h2><a href="https://onlyunlimit.github.io/community.html" target="_blank" rel="noopener">커뮤니티 열기 ↗</a></div><div class="studio-controls"><label>멤버 선택<select id="studio-member"></select></label><button id="artist-compose">아티스트 글 작성 ＋</button><button id="profile-edit">멤버 프로필 수정</button></div><p class="muted">공식 배지는 이 관리 채널에서 작성한 글·댓글에만 표시됩니다. 멤버 프로필은 저장 즉시 커뮤니티에 반영됩니다.</p></section>');
 $('#artist-compose').onclick=()=>{
  let images;const form=editor('아티스트 게시글 작성','<form><label>작성 멤버<select name="member_id">'+memberOptions(null,$('#studio-member').value)+'</select></label><label>제목<input name="title" maxlength="100" required></label><label>내용<textarea name="body" maxlength="5000" required></textarea></label>'+uploadMarkup+'<button type="submit">공식 게시글 등록</button></form>',async(data)=>{await api('publish','POST',{...data,images:images()});});
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
 let images;const form=editor('관리자 '+(kind==='post'?'게시글':'댓글')+' 수정','<form>'+(kind==='post'?'<label>제목<input name="title" maxlength="100" value="'+esc(item.title)+'" required></label>':'')+'<label>내용<textarea name="body" maxlength="'+(kind==='post'?5000:1000)+'" required>'+esc(item.body)+'</textarea></label>'+(kind==='post'?uploadMarkup:'')+'<button type="submit">수정 저장</button></form>',async(data)=>{const payload={title:data.title,body:data.body};if(images)payload.images=images();await api((kind==='post'?'posts/':'comments/')+item.id,'PATCH',payload);});
 if(kind==='post')images=attachmentPicker(form,item.images||[],id=>'/admin/media/'+id);
}
async function artistReply(postId){
 const p=adminPosts.find(p=>p.id===postId);if(!p||p.board==='staff')throw Error('팬 커뮤니티 게시물에서만 아티스트 답글을 작성할 수 있습니다.');
 const {comments}=await api('comments?post='+postId);
 editor('아티스트 댓글·답글','<form><label>작성 멤버<select name="member_id">'+memberOptions(p.board,$('#studio-member').value)+'</select></label><label>답글 대상<select name="parent_id"><option value="">게시물에 새 댓글</option>'+comments.filter(c=>!c.deleted_at&&!c.hidden&&!c.parent_id).map(c=>'<option value="'+esc(c.id)+'">'+esc(c.author+': '+c.body.slice(0,60))+'</option>').join('')+'</select></label><label>내용<textarea name="body" maxlength="1000" required></textarea></label><button type="submit">공식 답글 등록</button></form>',async data=>{await api('reply','POST',{...data,post_id:postId});});
}
`;
