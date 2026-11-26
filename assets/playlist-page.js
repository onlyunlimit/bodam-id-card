import { $, esc } from './runtime.js';
import { tr, registerCopy } from './i18n.js';
import { onDispose, every } from './lifecycle.js';
import { serviceConfig } from './service-config.js';
import { music } from './playlists.js';
import { musicTeams, playlistThemes } from './playlist-themes.js';
[
 ['선택','Select','選択','选择'],['선택 해제','Clear selection','選択を解除','清除选择'],['선택 재생','Play selected','選択した曲を再生','播放所选'],['셔플','Shuffle','シャッフル','随机播放'],
 ['모든 목록','All mixes','すべてのミックス','全部歌单'],['곡 검색','Search tracks','楽曲を検索','搜索歌曲'],['이전 테마','Previous theme','前のテーマ','上一个主题'],['다음 테마','Next theme','次のテーマ','下一个主题'],['재생 위치','Playback position','再生位置','播放进度'],['곡을 선택해 주세요.','Choose a track.','楽曲を選んでください。','请选择歌曲。'],['선택한 테마에 곡이 없습니다.','No tracks in this theme.','このテーマには楽曲がありません。','此主题暂无歌曲。'],['검색 결과가 없습니다.','No matching tracks.','該当する楽曲がありません。','没有匹配的歌曲。'],['테마 둘러보기','Browse themes','テーマを探す','浏览主题'],['전체 재생','Play all','すべて再生','播放全部'],['곡을 불러오지 못했습니다.','Unable to load tracks.','楽曲を読み込めませんでした。','无法载入歌曲。']
].forEach(row=>registerCopy(...row));
const icon = (name) => {
 const paths={play:'M9 5v14l11-7z',pause:'M8 5v14M16 5v14',next:'M5 5v14l10-7zM19 5v14',prev:'M19 5v14L9 12zM5 5v14',shuffle:'M3 6h3c5 0 7 12 12 12h3m-4-4 4 4-4 4M3 18h3c2 0 4-3 6-6s4-6 6-6h3m-4-4 4 4-4 4',left:'m15 5-7 7 7 7',right:'m9 5 7 7-7 7',search:'M20 20l-5-5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0'};
 return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]}" fill="${['play','next','prev'].includes(name)?'currentColor':'none'}" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
};
const clock=n=>`${Math.floor(n/60)}:${String(Math.floor(n%60)).padStart(2,'0')}`;
function shuffle(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function renderPlaylists(){
 const root=document.createElement('section');root.className='listening-room';root.setAttribute('aria-label',tr('플레이리스트'));$('#main').append(root);
 let all=[],teams=[...musicTeams],teamIndex=0,selected=new Set(),selecting=false,shuffled=false,query='',disposed=false;
 const abort=new AbortController();onDispose(()=>{disposed=true;abort.abort();});
 root.innerHTML=`<div class="room-aura" aria-hidden="true"></div><header class="room-heading"><div><p>THE LISTENING ROOM</p><h1>${tr('플레이리스트')}</h1></div><button class="room-library">${tr('모든 목록')} ↗</button></header>
 <div class="room-layout"><section class="deck-column"><div class="deck-stage" tabindex="0" role="group" aria-label="${tr('테마 둘러보기')}">
 <div class="deck-body"><i class="deck-screw screw-a"></i><i class="deck-screw screw-b"></i><div class="deck-well"><div class="disc"><div class="disc-print"><div class="disc-brand"><span>SGIA · SOUND COLLECTION</span><strong data-disc-team></strong><small data-disc-caption></small></div></div></div><span class="disc-hub"></span><span class="deck-glaze"></span></div><div class="deck-footer"><span>STEREO / 01</span><span class="deck-led"></span><span>COMPACT DISC</span></div></div><div class="deck-cord"></div></div>
 <div class="deck-navigation"><button data-theme-prev aria-label="${tr('이전 테마')}">${icon('left')}</button><div class="theme-dots"></div><button data-theme-next aria-label="${tr('다음 테마')}">${icon('right')}</button></div>
 <div class="room-transport glass"><p class="transport-character" data-no-translate></p><h2 class="transport-title" data-no-translate>${tr('곡을 선택해 주세요.')}</h2><p class="transport-artist" data-no-translate></p><div class="room-progress"><span data-elapsed>0:00</span><input type="range" min="0" max="100" value="0" step="1" disabled aria-label="${tr('재생 위치')}"><span data-duration>0:00</span></div><div class="transport-buttons"><button data-room-shuffle aria-pressed="false" aria-label="${tr('셔플')}">${icon('shuffle')}</button><button data-room-prev aria-label="${tr('이전 곡')}">${icon('prev')}</button><button data-room-play aria-label="${tr('재생 / 일시정지')}">${icon('play')}</button><button data-room-next aria-label="${tr('다음 곡')}">${icon('next')}</button><button data-room-select aria-pressed="false">${tr('선택')}</button></div></div></section>
 <section class="track-column"><header class="track-heading"><div><p class="theme-caption"></p><h2 class="theme-title" data-no-translate></h2><span class="theme-count"></span></div><button class="glass play-all" aria-label="${tr('전체 재생')}">${icon('play')}</button></header><label class="track-search glass">${icon('search')}<input type="search" placeholder="${tr('곡 검색')}" aria-label="${tr('곡 검색')}"></label><div class="track-selection" hidden><span data-selection-count aria-live="polite"></span><button data-clear-selection>${tr('선택 해제')}</button><button data-play-selection>${tr('선택 재생')}</button></div><div class="room-tracks" aria-busy="true"><p role="status">${tr('음악을 불러오는 중…')}</p></div></section></div>`;
 root.querySelector('.track-column').prepend(root.querySelector('.room-transport'));
 root.querySelector('.room-library').onclick=()=>music.library();
 const team=()=>teams[teamIndex];
 const tracks=()=>all.filter(t=>t.team===team().id);
 const visible=()=>tracks().filter(t=>`${t.title} ${t.artist} ${t.character}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
 function begin(rows){if(!rows.length)return;music.start(shuffled?shuffle(rows):rows);}
 function selectionUI(){root.querySelector('.track-selection').hidden=!selecting;root.querySelector('[data-selection-count]').textContent=`${selected.size} / ${tracks().length}`;root.querySelector('[data-play-selection]').disabled=!selected.size;root.querySelector('[data-room-select]').setAttribute('aria-pressed',String(selecting));}
 function rows(){
  const list=root.querySelector('.room-tracks');list.setAttribute('aria-busy','false');
  list.innerHTML=visible().map((t,i)=>`<article class="glass room-track" data-key="${esc(t.key)}" style="--track-tint:${t.color}"><label class="track-check" ${selecting?'':'hidden'}><input type="checkbox" data-track-check="${esc(t.key)}" ${selected.has(t.key)?'checked':''} aria-label="${esc(t.title)} ${tr('선택')}"></label><button class="track-hit" data-room-track="${esc(t.key)}"><span class="track-art" aria-hidden="true"></span><span class="track-copy" data-no-translate><small>${esc(t.character)}</small><strong>${esc(t.title)}</strong><span>${esc(t.artist)}</span></span><span class="track-index" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><span class="track-equalizer" aria-hidden="true"><i></i><i></i><i></i></span></button></article>`).join('')||`<p class="room-empty">${tr(query?'검색 결과가 없습니다.':'선택한 테마에 곡이 없습니다.')}</p>`;
  list.querySelectorAll('[data-key]').forEach(el=>{const t=all.find(t=>t.key===el.dataset.key);if(t.cover)el.querySelector('.track-art').style.backgroundImage=`url(${JSON.stringify(t.cover)})`;else el.querySelector('.track-art').textContent=t.character.slice(0,1);});
  selectionUI();sync();
 }
 function themeUI(){
  root.dataset.musicTeam=team().id;root.style.setProperty('--theme-tint',team().color);
  root.querySelector('.theme-title').textContent=team().label;root.querySelector('.theme-caption').textContent=team().caption;root.querySelector('.theme-count').textContent=`${tracks().length} ${tr('곡')}`;
  root.querySelector('[data-disc-team]').textContent=team().label;root.querySelector('[data-disc-caption]').textContent=team().caption;
  root.querySelector('.theme-dots').innerHTML=teams.map((t,i)=>`<button data-theme="${i}" aria-label="${esc(t.label)}" aria-pressed="${i===teamIndex}"></button>`).join('');rows();
 }
 function changeTheme(i){teamIndex=(i+teams.length)%teams.length;selected.clear();query='';root.querySelector('[type=search]').value='';themeUI();const d=root.querySelector('.disc-print');d.classList.remove('disc-change');requestAnimationFrame(()=>{if(!disposed)d.classList.add('disc-change');});}
 function sync(){
  if(disposed)return;const s=music.state(),t=s.track,here=t?.team===team().id,playing=!!(here&&s.playing);
  root.classList.toggle('is-playing',playing);root.classList.toggle('has-current-track',!!here);
  const image=here?t.cover:'';root.querySelector('.disc-print').style.backgroundImage=image?`url(${JSON.stringify(image)})`:'';root.querySelector('.disc-brand').hidden=!!image;
  root.querySelector('.room-aura').style.backgroundImage=image?`url(${JSON.stringify(image)})`:'';root.style.setProperty('--active-tint',here?t.color:team().color);
  root.querySelector('.transport-character').textContent=here?t.character:team().label;root.querySelector('.transport-title').textContent=here?t.title:tr('곡을 선택해 주세요.');root.querySelector('.transport-artist').textContent=here?t.artist:'';
  root.querySelector('[data-room-play]').innerHTML=icon(playing?'pause':'play');root.querySelector('[data-room-prev]').disabled=!here||s.index<=0;root.querySelector('[data-room-next]').disabled=!here||s.index>=s.queue.length-1;
  root.querySelectorAll('[data-room-track]').forEach(b=>{const current=b.dataset.roomTrack===t?.key;b.setAttribute('aria-current',String(current));b.closest('.room-track').classList.toggle('track-current',current);b.closest('.room-track').classList.toggle('track-playing',current&&s.playing);});progress();
 }
 function progress(){const p=music.progress(),here=music.state().track?.team===team().id,range=root.querySelector('[type=range]');range.disabled=!here||!p.duration;if(document.activeElement!==range){range.max=p.duration||100;range.value=here?p.time:0;}root.querySelector('[data-elapsed]').textContent=clock(here?p.time:0);root.querySelector('[data-duration]').textContent=clock(here?p.duration:0);}
 root.querySelector('[type=range]').oninput=e=>{root.querySelector('[data-elapsed]').textContent=clock(Number(e.target.value));};root.querySelector('[type=range]').onchange=e=>music.seek(Number(e.target.value));
 root.querySelector('[type=search]').oninput=e=>{query=e.target.value;rows();};
 root.querySelector('[data-room-play]').onclick=()=>music.state().track?.team===team().id?music.toggle():begin(tracks());
 root.querySelector('[data-room-prev]').onclick=()=>music.previous();root.querySelector('[data-room-next]').onclick=()=>music.next();root.querySelector('.play-all').onclick=()=>begin(tracks());
 root.querySelector('[data-room-shuffle]').onclick=e=>{shuffled=!shuffled;e.currentTarget.setAttribute('aria-pressed',String(shuffled));if(shuffled)begin(tracks());};
 root.querySelector('[data-room-select]').onclick=()=>{selecting=!selecting;if(!selecting)selected.clear();rows();};root.querySelector('[data-clear-selection]').onclick=()=>{selected.clear();rows();};root.querySelector('[data-play-selection]').onclick=()=>begin(tracks().filter(t=>selected.has(t.key)));
 root.querySelector('[data-theme-prev]').onclick=()=>changeTheme(teamIndex-1);root.querySelector('[data-theme-next]').onclick=()=>changeTheme(teamIndex+1);
 root.querySelector('.theme-dots').onclick=e=>{const b=e.target.closest('[data-theme]');if(b)changeTheme(Number(b.dataset.theme));};
 root.querySelector('.room-tracks').onclick=e=>{const b=e.target.closest('[data-room-track]');if(!b)return;const t=all.find(t=>t.key===b.dataset.roomTrack);if(music.state().track?.key===t.key)music.toggle();else{const ordered=shuffled?[t,...shuffle(tracks().filter(x=>x!==t))]:tracks();music.start(ordered,ordered.indexOf(t));}b.closest('.room-track').classList.remove('track-ripple');requestAnimationFrame(()=>{if(b.isConnected)b.closest('.room-track').classList.add('track-ripple');});};
 root.querySelector('.room-tracks').onchange=e=>{const key=e.target.dataset.trackCheck;if(!key)return;e.target.checked?selected.add(key):selected.delete(key);selectionUI();};
 const stage=root.querySelector('.deck-stage');let pointer;
 stage.onpointerdown=e=>{if(e.button===0)pointer={x:e.clientX,y:e.clientY};};stage.onpointercancel=()=>{pointer=null;};stage.onpointerup=e=>{if(!pointer)return;const x=e.clientX-pointer.x,y=e.clientY-pointer.y;pointer=null;if(Math.abs(x)>50&&Math.abs(x)>Math.abs(y))changeTheme(teamIndex+(x<0?1:-1));};stage.onkeydown=e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();changeTheme(teamIndex+(e.key==='ArrowRight'?1:-1));}};
 onDispose(music.subscribe(sync));every(progress,1000);
 async function load(){
  const list=root.querySelector('.room-tracks');list.setAttribute('aria-busy','true');
  try{const r=await fetch(serviceConfig.api+'/playlists',{signal:AbortSignal.any([abort.signal,AbortSignal.timeout(12000)])});if(!r.ok)throw Error();const data=await r.json();if(disposed)return;
   all=(data.playlists||[]).flatMap(p=>{const meta=playlistThemes.find(m=>m.playlist_id===p.id)||playlistThemes.find(m=>m.id===p.member_id);return p.tracks.map((t,i)=>({...t,key:p.id+':'+i,team:meta?.team||'mixes',character:meta?.label||p.title,cover:meta?.cover||'',color:meta?.color||'#a9a2c9'}));});
   all.sort((a,b)=>playlistThemes.findIndex(m=>m.label===a.character)-playlistThemes.findIndex(m=>m.label===b.character));
   if(all.some(t=>t.team==='mixes'))teams.push({id:'mixes',label:'MIXTAPES',caption:'PERSONAL SELECTION',color:'#a9a2c9'});
   const active=music.state().track;if(active){const i=teams.findIndex(t=>t.id===active.team);if(i>=0)teamIndex=i;}themeUI();
  }catch{if(disposed)return;list.setAttribute('aria-busy','false');list.innerHTML=`<p>${tr('곡을 불러오지 못했습니다.')}</p><button class="room-retry glass">${tr('다시 시도')}</button>`;list.querySelector('button').onclick=load;}
 }
 // Show the physical player immediately while the catalogue arrives.
 root.querySelector('.theme-title').textContent=team().label;root.querySelector('[data-disc-team]').textContent=team().label;root.querySelector('[data-disc-caption]').textContent=team().caption;load();
}
