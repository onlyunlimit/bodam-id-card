import { HTTPError, text } from './security.js';
import { videoID } from './playlists.js';
const json = (data, status=200) => Response.json(data, {status, headers:{'Cache-Control':'no-store'}});
export async function musicRequests(request, env, helpers, admin=false) {
 const url=new URL(request.url),base=admin?'/admin/music-requests':'/music-requests';
 if(url.pathname!==base&&!url.pathname.startsWith(base+'/'))return null;
 const id=url.pathname.slice(base.length+1);
 if(admin){
  if(request.method==='GET'&&!id){
   const offset=Math.max(0,Math.min(100000,Number.parseInt(url.searchParams.get('offset'),10)||0));
   const unread=url.searchParams.get('filter')!=='all';
   const rows=await env.DB.prepare(`SELECT * FROM music_requests ${unread?'WHERE read_at IS NULL':''} ORDER BY created_at DESC,id LIMIT 51 OFFSET ?`).bind(offset).all();
   return json({requests:rows.results.slice(0,50),more:rows.results.length>50});
  }
  if(request.method==='PATCH'&&/^[a-f0-9-]{36}$/.test(id)){
   const result=await env.DB.prepare('UPDATE music_requests SET read_at=COALESCE(read_at,?) WHERE id=?').bind(Date.now(),id).run();
   if(!result.meta.changes)throw new HTTPError(404,'신청을 찾을 수 없습니다.');
   return json({ok:true});
  }
 }else if(request.method==='POST'&&!id){
  const {hash}=await helpers.identity(request,env);
  await helpers.blocked(env,hash);
  const data=await helpers.body(request);
  const requestID=text(data.id,36,36,'신청 번호');
  if(!/^[a-f0-9-]{36}$/.test(requestID))throw new HTTPError(400,'신청 번호를 확인해 주세요.');
  const character=text(data.character,1,80,'추천 캐릭터'),title=text(data.title,1,120,'노래 제목'),artist=text(data.artist,1,100,'가수');
  const link=text(data.url||'',0,2048,'유튜브 링크');
  const youtube=link?'https://www.youtube.com/watch?v='+videoID(link):'';
  // A retried submission must not create a second entry.
  if(await env.DB.prepare('SELECT id FROM music_requests WHERE id=?').bind(requestID).first())return json({ok:true});
  await helpers.rate(env,'music-request:'+hash,6,3600);
  await env.DB.prepare('INSERT OR IGNORE INTO music_requests(id,character,title,artist,youtube_url,created_at) VALUES(?,?,?,?,?,?)').bind(requestID,character,title,artist,youtube,Date.now()).run();
  return json({ok:true},201);
 }
 // There is deliberately no public read endpoint, even for a known request ID.
 throw new HTTPError(405,'지원하지 않는 요청입니다.');
}
