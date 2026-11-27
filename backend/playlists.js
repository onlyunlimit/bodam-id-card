import {HTTPError, text} from './security.js';
import {audioPath} from './music-audio.js';
const json=data=>Response.json(data);
export function videoID(value) {
  if(typeof value!=='string')throw new HTTPError(400,'유튜브 링크를 확인해 주세요.');
  if(/^[\w-]{11}$/.test(value))return value;
  try {
    const u=new URL(value);
    if(u.protocol!=='https:')throw Error();
    let id;
    if(u.hostname==='youtu.be')id=u.pathname.slice(1);
    else if(['youtube.com','www.youtube.com','m.youtube.com','www.youtube-nocookie.com'].includes(u.hostname))id=u.searchParams.get('v') || u.pathname.match(/^\/(?:shorts|embed)\/([\w-]{11})$/)?.[1];
    if(/^[\w-]{11}$/.test(id||''))return id;
  }catch{}
  throw new HTTPError(400,'HTTPS 유튜브 동영상 링크를 입력해 주세요.');
}
// Team tab: known departments map to their ids; any other name becomes a new tab with that name.
export function teamID(value){
  const raw=text(value||'',0,40,'팀').trim();
  if(!raw)return '';
  const known={'비콘':'beacon','블랙잭':'blackjack','실드':'shield','오리진':'origin','럭키트릭':'lucky','옵시더스':'obsidus'};
  return known[raw]||raw;
}
export function coverURL(value){
  const v=text(value,1,2048,'커버 이미지 링크');
  try{const u=new URL(v);if(u.protocol==='https:'&&!u.username&&!u.password)return u.href;}catch{}
  throw new HTTPError(400,'커버 이미지는 https 링크로 입력해 주세요.');
}
export async function playlistAPI(request,env,{body},admin=false) {
  const path=new URL(request.url).pathname, base=admin?'/admin/playlists':'/playlists';
  if(path!==base&&!path.startsWith(base+'/'))return null;
  const id=path.slice(base.length+1), method=request.method;
  if(method==='GET'&&!id) {
    // Public order is creation order (later additions at the end); hidden lists and tracks stay private.
    const rows=await env.DB.prepare(`SELECT * FROM music_playlists ${admin?'':'WHERE hidden=0'} ORDER BY created_at,id`).all();
    return json({playlists:rows.results.map(p=>({...p,tracks:JSON.parse(p.tracks).filter(t=>admin||!t.hidden).map(t=>({...t,...(env.MUSIC_ASSETS&&audioPath(t.video_id)?{audio_url:new URL(audioPath(t.video_id),request.url).href}:{})}))}))});
  }
  if(!admin)throw new HTTPError(405,'읽기 전용입니다.');
  if(id&&!/^[a-f0-9-]{36}$/.test(id))throw new HTTPError(400,'목록을 확인해 주세요.');
  if((method==='POST'&&!id)||(method==='PATCH'&&id)) {
    const data=await body(request), title=text(data.title,1,100,'플레이리스트 이름'), description=text(data.description||'',0,500,'소개'), member_id=text(data.member_id||'',0,50,'멤버');
    if(member_id && !await env.DB.prepare('SELECT id FROM members WHERE id=?').bind(member_id).first())throw new HTTPError(400,'등록된 멤버를 선택해 주세요.');
    if(!Array.isArray(data.tracks)||data.tracks.length>100)throw new HTTPError(400,'한 목록에 최대 100곡까지 저장할 수 있습니다.');
    if(data.tracks.some(t=>!t||typeof t!=='object'||Array.isArray(t)))throw new HTTPError(400,'곡 정보를 확인해 주세요.');
    const universe=data.universe==='hku'?'hku':'sgia';
    const team=universe==='hku'?'hankuk':teamID(data.team);
    const character=text(data.character||'',0,60,'인물 이름');
    if(universe==='hku'&&!character&&!member_id)throw new HTTPError(400,'HKU 인물 이름을 입력해 주세요.');
    const hidden=data.hidden===true?1:0;
    const tracks=data.tracks.map(t=>({title:text(t.title,1,120,'곡명'),artist:text(t.artist||'',0,100,'가수'),video_id:videoID(t.url||t.video_id),...(t.cover?{cover:coverURL(t.cover)}:{}),...(t.hidden===true?{hidden:true}:{})}));
    const current=Date.now(), key=id||crypto.randomUUID();
    if(id) {
      const result=await env.DB.prepare('UPDATE music_playlists SET title=?,description=?,member_id=?,tracks=?,team=?,universe=?,character=?,hidden=?,updated_at=? WHERE id=?').bind(title,description,member_id,JSON.stringify(tracks),team,universe,character,hidden,current,id).run();
      if(!result.meta.changes)throw new HTTPError(404,'목록이 없습니다.');
    }else await env.DB.prepare('INSERT INTO music_playlists(id,title,description,member_id,tracks,team,universe,character,hidden,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)').bind(key,title,description,member_id,JSON.stringify(tracks),team,universe,character,hidden,current,current).run();
    return json({ok:true,id:key});
  }
  if(method==='DELETE'&&id){await env.DB.prepare('DELETE FROM music_playlists WHERE id=?').bind(id).run();return json({ok:true});}
  throw new HTTPError(405,'지원하지 않는 요청입니다.');
}
