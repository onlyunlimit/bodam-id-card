import {esc,$} from './runtime.js';
import {serviceConfig} from './service-config.js';
import {tr,registerCopy} from './i18n.js';
import {playlistThemes} from './playlist-themes.js';
const copy=[
 ['플레이리스트','Playlists','プレイリスト','播放列表'],['제작자가 고른, 그 사람의 음악.','Music chosen for each character.','キャラクターに寄り添う選曲。','为角色挑选的音乐。'],
 ['아직 공개된 플레이리스트가 없습니다.','No playlists yet.','公開プレイリストはまだありません。','暂无公开播放列表。'],['곡을 준비하고 있어요.','Tracks are coming soon.','楽曲を準備中です。','歌曲准备中。'],
 ['재생 목록','Queue','再生待ち','待播列表'],['재생 / 일시정지','Play / pause','再生 / 一時停止','播放 / 暂停'],['이전 곡','Previous track','前の曲','上一首'],['다음 곡','Next track','次の曲','下一首'],['정지하고 닫기','Stop and close','停止して閉じる','停止并关闭'],
 ['재생하려면 영상의 재생 버튼을 눌러 주세요.','Press play on the video to start.','動画の再生ボタンを押してください。','请点击视频播放按钮。'],['이 곡은 재생할 수 없습니다. 다른 곡을 선택해 주세요.','This track is unavailable. Choose another track.','この曲は再生できません。他の曲を選んでください。','此歌曲无法播放，请选择其他歌曲。'],
 ['음악을 불러오는 중…','Loading music…','音楽を読み込み中…','正在载入音乐…'],['음악을 불러오지 못했습니다.','Unable to load music.','音楽を読み込めませんでした。','无法载入音乐。'],['다시 시도','Try again','再試行','重试'],['전체','All','すべて','全部'],['곡','tracks','曲','首'],['닫기','Close','閉じる','关闭'],
];
copy.forEach(row=>registerCopy(...row));
export const music = {};
let youtubePromise;
function youtube(){
 if(window.YT?.Player)return Promise.resolve(window.YT);
 if(youtubePromise)return youtubePromise;
 youtubePromise=new Promise((resolve,reject)=>{
  const previous=window.onYouTubeIframeAPIReady;
  const timer=setTimeout(()=>{youtubePromise=null;reject(Error(tr('다시 시도')));},15000);
  window.onYouTubeIframeAPIReady=()=>{clearTimeout(timer);previous?.();resolve(window.YT);};
  const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';
  script.onerror=()=>{clearTimeout(timer);youtubePromise=null;script.remove();reject(Error(tr('다시 시도')));};document.head.append(script);
 });return youtubePromise;
}
export function initPlaylists(){
 if($('#music-library'))return;
 const css=document.createElement('link');css.rel='stylesheet';css.href='assets/playlists.css';document.head.append(css);
 const launch=document.createElement('a');launch.href='playlists.html';launch.id='music-library-open';launch.innerHTML='♫ <span>'+tr('플레이리스트')+'</span>';launch.setAttribute('aria-label',tr('플레이리스트'));
 $('.header-controls').insertBefore(launch,$('#sound-toggle'));
 const library=document.createElement('dialog');library.id='music-library';library.setAttribute('aria-labelledby','music-library-title');
 library.innerHTML='<button class="music-close" aria-label="'+tr('닫기')+'">×</button><p class="music-eyebrow">CHARACTER MIXES</p><h2 id="music-library-title">'+tr('플레이리스트')+'</h2><p class="music-intro">'+tr('제작자가 고른, 그 사람의 음악.')+'</p><div class="music-library-content"></div>';
 document.body.append(library);library.querySelector('.music-close').onclick=()=>library.close();
 const dock=document.createElement('aside');dock.id='music-player';dock.hidden=true;dock.setAttribute('aria-label',tr('재생 목록'));
 dock.innerHTML='<div class="music-now"><span class="music-note" aria-hidden="true">♫</span><div><strong data-music-title></strong><small data-music-artist></small></div><button data-music-close aria-label="'+tr('정지하고 닫기')+'">×</button></div><div class="music-video"><div id="music-youtube"></div></div><div class="music-controls"><button data-music-prev aria-label="'+tr('이전 곡')+'">⏮</button><button data-music-play aria-label="'+tr('재생 / 일시정지')+'">▶</button><button data-music-next aria-label="'+tr('다음 곡')+'">⏭</button><button data-music-queue>'+tr('재생 목록')+'</button></div><p data-music-status role="status"></p>';
 document.body.append(dock);
 const subscribers=new Set();let playing=false;
 let playlists=[],members=[],queue=[],index=-1,selected=null,activePlaylist=null,player,playerReady=false,request=0,filter='',loadRequest=0;
 const emit=()=>subscribers.forEach(fn=>fn(music.state()));
 const status=t=>{dock.querySelector('[data-music-status]').textContent=t;};
 function pauseBGM(){const audio=$('#ambient-audio');audio?.pause();$('#sound-toggle').setAttribute('aria-pressed','false');$('#sound-toggle span').textContent='BGM OFF';$('#sound-toggle').setAttribute('aria-label',tr('BGM 켜기'));}
 $('#ambient-audio')?.addEventListener('play',()=>player?.pauseVideo?.());
 function update(){const t=queue[index];if(!t)return;dock.querySelector('[data-music-title]').textContent=t.title;dock.querySelector('[data-music-artist]').textContent=t.artist;dock.querySelector('[data-music-prev]').disabled=index===0;dock.querySelector('[data-music-next]').disabled=index>=queue.length-1;}
 async function play(i){
  if(i<0||i>=queue.length)return;index=i;const ticket=++request;dock.hidden=false;update();status(tr('음악을 불러오는 중…'));pauseBGM();playing=false;emit();
  try{const YT=await youtube();if(ticket!==request||dock.hidden)return;
   if(playerReady){player.loadVideoById(queue[index].video_id);return;}
   if(player)return;
   player=new YT.Player('music-youtube',{host:'https://www.youtube-nocookie.com',width:'100%',height:'200',videoId:queue[index].video_id,playerVars:{playsinline:1,origin:location.origin,autoplay:1},events:{
    onReady:e=>{playerReady=true;if(dock.hidden){e.target.stopVideo();return;}e.target.loadVideoById(queue[index].video_id);status(tr('재생하려면 영상의 재생 버튼을 눌러 주세요.'));},
    onStateChange:e=>{if(dock.hidden)return;playing=e.data===1;emit();dock.querySelector('[data-music-play]').textContent=e.data===1?'Ⅱ':'▶';if(e.data===1){pauseBGM();status('');}if(e.data===3)status(tr('음악을 불러오는 중…'));if(e.data===0&&index<queue.length-1)play(index+1);},
    onAutoplayBlocked:()=>status(tr('재생하려면 영상의 재생 버튼을 눌러 주세요.')),
    onError:()=>{playing=false;emit();status(tr('이 곡은 재생할 수 없습니다. 다른 곡을 선택해 주세요.'));},
   }});
  }catch{if(ticket===request)status(tr('이 곡은 재생할 수 없습니다. 다른 곡을 선택해 주세요.'));}
 }
 dock.querySelector('[data-music-close]').onclick=()=>{++request;player?.stopVideo?.();dock.hidden=true;playing=false;emit();};
 dock.querySelector('[data-music-play]').onclick=()=>{if(!playerReady){play(index);return;}if(player.getPlayerState()===1)player.pauseVideo();else{pauseBGM();player.playVideo();}};
 dock.querySelector('[data-music-prev]').onclick=()=>play(index-1);dock.querySelector('[data-music-next]').onclick=()=>play(index+1);
 dock.querySelector('[data-music-queue]').onclick=()=>{++loadRequest;selected=activePlaylist||{title:tr('재생 목록'),description:'',member_id:'',tracks:queue};if(!library.open)library.showModal();render();};
 function render(){
  const content=library.querySelector('.music-library-content');
  const member=members.find(m=>m.id===selected?.member_id);
  if(selected){
   content.innerHTML='<button class="music-back">← '+tr('전체')+'</button><header class="music-playlist-heading"><span class="music-cover" aria-hidden="true">♫</span><div><small data-user-content>'+esc(member?.name||'CREATOR MIX')+'</small><h3 data-user-content>'+esc(selected.title)+'</h3><p data-user-content>'+esc(selected.description)+'</p><small>'+selected.tracks.length+' '+tr('곡')+'</small></div></header><div class="music-tracks">'+selected.tracks.map((t,i)=>'<button data-track="'+i+'" '+(queue===selected.tracks&&i===index?'aria-current="true"':'')+'><span>'+String(i+1).padStart(2,'0')+'</span><div data-user-content><b>'+esc(t.title)+'</b><small>'+esc(t.artist)+'</small></div><em>▶</em></button>').join('')+'</div>'+(selected.tracks.length?'':'<p>'+tr('곡을 준비하고 있어요.')+'</p>');
   content.querySelector('.music-back').onclick=()=>{selected=null;render();};content.querySelectorAll('[data-track]').forEach(b=>b.onclick=()=>{activePlaylist=selected;queue=selected.tracks;play(Number(b.dataset.track));library.close();});return;
  }
  const ids=[...new Set(playlists.map(p=>p.member_id).filter(Boolean))];
  content.innerHTML='<nav class="music-filters" aria-label="'+tr('플레이리스트')+'"><button data-music-filter="" aria-pressed="'+!filter+'">'+tr('전체')+'</button>'+ids.map(id=>'<button data-music-filter="'+esc(id)+'" aria-pressed="'+(filter===id)+'">'+esc(members.find(m=>m.id===id)?.name||id)+'</button>').join('')+'</nav><div class="music-grid">'+playlists.filter(p=>!filter||p.member_id===filter).map((p,i)=>'<button class="music-card" data-playlist="'+esc(p.id)+'"><span class="music-cover tone-'+i%4+'" aria-hidden="true"><i>♫</i><b>'+esc((members.find(m=>m.id===p.member_id)?.name||'MIX').slice(0,8))+'</b></span><strong data-user-content>'+esc(p.title)+'</strong><small>'+p.tracks.length+' '+tr('곡')+'</small></button>').join('')+'</div>'+(playlists.length?'':'<p class="music-empty">'+tr('아직 공개된 플레이리스트가 없습니다.')+'</p>');
  content.querySelectorAll('[data-playlist]').forEach(b=>b.onclick=()=>{selected=playlists.find(p=>p.id===b.dataset.playlist);render();});content.querySelectorAll('[data-music-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.musicFilter;render();});
 }
 async function open(){if(!library.open)library.showModal();const ticket=++loadRequest;const content=library.querySelector('.music-library-content');content.textContent=tr('음악을 불러오는 중…');try{
  const response=await fetch(serviceConfig.api+'/playlists',{signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error();const data=await response.json();
  if(!members.length){try{const r=await fetch(serviceConfig.api+'/members?board=staff',{signal:AbortSignal.timeout(5000)});if(r.ok)members=(await r.json()).members||[];}catch{}}
  if(ticket!==loadRequest)return;playlists=(data.playlists||[]).map(p=>{const m=playlistThemes.find(m=>m.playlist_id===p.id)||playlistThemes.find(m=>m.id===p.member_id);return {...p,tracks:p.tracks.map((t,i)=>({...t,key:p.id+':'+i,team:m?.team||'mixes',character:m?.label||p.title,cover:m?.cover||'',color:m?.color||'#a9a2c9'}))};});selected=null;filter='';render();
 }catch{if(ticket!==loadRequest)return;content.innerHTML='<p>'+tr('음악을 불러오지 못했습니다.')+'</p><button class="music-retry">'+tr('다시 시도')+'</button>';content.querySelector('button').onclick=open;}}
 Object.assign(music,{
  state:()=>({track:dock.hidden?null:queue[index],queue,index,playing,playlist:activePlaylist}),
  subscribe(fn){subscribers.add(fn);return()=>subscribers.delete(fn);},
  start(tracks,i=0,playlist=null){queue=tracks;activePlaylist=playlist;play(i);},
  toggle:()=>dock.querySelector('[data-music-play]').click(),
  previous:()=>play(index-1),next:()=>play(index+1),
  stop:()=>dock.querySelector('[data-music-close]').click(),
  progress:()=>({time:player?.getCurrentTime?.()||0,duration:player?.getDuration?.()||0}),
  seek(seconds){if(playerReady&&Number.isFinite(seconds))player.seekTo?.(seconds,true);},
  library:open
 });
}
