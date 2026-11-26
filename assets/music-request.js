import {tr,registerCopy} from './i18n.js';
import {serviceConfig} from './service-config.js';
[
 ['추천곡 신청','Suggest a song','楽曲をリクエスト','推荐歌曲'],
 ['캐릭터 추천 노래 신청','Suggest a character song','キャラクターへの楽曲リクエスト','角色歌曲推荐'],
 ['only_unlimit의 모든 캐릭터에게 신청할 수 있어요. 아직 없는 캐릭터는 추후 차차 추가될 수 있습니다.','Suggestions are welcome for any only_unlimit character. Characters not listed yet may be added over time.','only_unlimitのすべてのキャラクターにリクエストできます。未掲載のキャラクターも順次追加される場合があります。','可为only_unlimit的所有角色推荐歌曲。尚未收录的角色可能会陆续添加。'],
 ['신청 내용은 관리자에게만 전달됩니다.','Only the administrator can see your suggestion.','内容は管理者だけに届きます。','推荐内容仅管理员可见。'],
 ['추천 캐릭터','Character','キャラクター','推荐角色'],['노래 제목','Song title','曲名','歌曲名称'],['가수','Artist','アーティスト','歌手'],['유튜브 링크 (선택)','YouTube link (optional)','YouTubeリンク（任意）','YouTube链接（选填）'],
 ['신청 보내기','Send suggestion','リクエストを送信','发送推荐'],['보내는 중…','Sending…','送信中…','发送中…'],
 ['추천곡을 보냈습니다. 감사합니다.','Suggestion sent. Thank you.','送信しました。ありがとうございます。','推荐已发送，谢谢。'],
 ['전송하지 못했습니다. 입력한 내용을 유지했으니 다시 시도해 주세요.','Unable to send. Your entries are saved here; please try again.','送信できませんでした。入力内容は残っています。もう一度お試しください。','发送失败，输入内容已保留，请重试。'],
 ['HTTPS 유튜브 동영상 링크를 입력해 주세요.','Enter an HTTPS YouTube video link.','HTTPSのYouTube動画リンクを入力してください。','请输入HTTPS YouTube视频链接。']
].forEach(row=>registerCopy(...row));
export function mountMusicRequest(root,signal){
 const section=document.createElement('section');section.className='song-suggestion glass';
 section.innerHTML=`<header><span class="suggestion-eyebrow">YOUR NEXT TRACK</span><h2>${tr('캐릭터 추천 노래 신청')}</h2><p>${tr('only_unlimit의 모든 캐릭터에게 신청할 수 있어요. 아직 없는 캐릭터는 추후 차차 추가될 수 있습니다.')}</p><p>${tr('신청 내용은 관리자에게만 전달됩니다.')}</p></header><form aria-label="${tr('추천곡 신청')}"><label>${tr('추천 캐릭터')}<input name="character" maxlength="80" required autocomplete="off"></label><label>${tr('노래 제목')}<input name="title" maxlength="120" required autocomplete="off"></label><label>${tr('가수')}<input name="artist" maxlength="100" required autocomplete="off"></label><label class="suggestion-link">${tr('유튜브 링크 (선택)')}<input name="url" type="url" maxlength="2048" placeholder="https://youtu.be/…" inputmode="url" autocomplete="off"></label><footer><p role="status" aria-live="polite"></p><button type="submit">${tr('신청 보내기')} <span aria-hidden="true">↗</span></button></footer></form>`;
 root.append(section);const form=section.querySelector('form'),button=form.querySelector('button'),status=form.querySelector('[role=status]');let id=crypto.randomUUID();
 form.elements.url.oninput=()=>form.elements.url.setCustomValidity('');
 form.onsubmit=async e=>{
  e.preventDefault();if(button.disabled)return;
  const data=Object.fromEntries(new FormData(form));
  if(data.url){try{const u=new URL(data.url);if(u.protocol!=='https:'||!['youtube.com','www.youtube.com','m.youtube.com','youtu.be','www.youtube-nocookie.com'].includes(u.hostname))throw Error();}catch{form.elements.url.setCustomValidity(tr('HTTPS 유튜브 동영상 링크를 입력해 주세요.'));form.elements.url.reportValidity();return;}}
  button.disabled=true;form.setAttribute('aria-busy','true');status.textContent=tr('보내는 중…');
  try{const response=await fetch(serviceConfig.api+'/music-requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,id}),signal:AbortSignal.any([signal,AbortSignal.timeout(15000)])});const result=await response.json();if(!response.ok)throw Error(result.error||tr('전송하지 못했습니다. 입력한 내용을 유지했으니 다시 시도해 주세요.'));
   form.reset();id=crypto.randomUUID();status.textContent=tr('추천곡을 보냈습니다. 감사합니다.');section.classList.add('is-sent');
  }catch(error){if(!signal.aborted)status.textContent=error.name==='TimeoutError'?tr('전송하지 못했습니다. 입력한 내용을 유지했으니 다시 시도해 주세요.'):error.message;}
  finally{button.disabled=false;form.removeAttribute('aria-busy');}
 };
}
