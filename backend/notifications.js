import { buildPushPayload } from '@block65/webcrypto-web-push';
import { HTTPError, digest } from './security.js';
const json = (value,status=200) => Response.json(value,{status});
export function validEndpoint(value) {
  let u;try{u=new URL(value);}catch{throw new HTTPError(400,'알림 주소를 확인해 주세요.');}
  if (typeof value!=='string'||value.length>2048||u.protocol!=='https:'||u.username||u.password||u.port||u.hash||!(u.hostname.endsWith('.push.apple.com')||u.hostname==='fcm.googleapis.com'||u.hostname==='updates.push.services.mozilla.com'||u.hostname.endsWith('.push.services.mozilla.com')))
    throw new HTTPError(400,'지원하는 브라우저의 알림 주소가 아닙니다.');
  return u.href;
}
export async function pushTo(env, sub, data) {
  const endpoint=validEndpoint(sub.endpoint);
  const payload=await buildPushPayload({data:JSON.stringify(data),options:{ttl:3600}},JSON.parse(sub.subscription),{subject:'https://onlyunlimit.github.io',publicKey:env.VAPID_PUBLIC_KEY,privateKey:env.VAPID_PRIVATE_KEY});
  const r=await fetch(endpoint,{...payload,redirect:'error',signal:AbortSignal.timeout(10000)});
  if(r.status===404||r.status===410)await env.DB.prepare('DELETE FROM push_subscriptions WHERE id=?').bind(sub.id).run();
  else if(!r.ok)throw new Error('Push delivery failed');
  return r.ok;
}
export function notificationStatement(env,id,postId,kind) {
  return env.DB.prepare('INSERT INTO notification_events(id,post_id,kind,created_at) VALUES (?,?,?,?)').bind(id,postId,kind,Date.now());
}
export async function dispatchNotification(env,id) {
  if(!env.VAPID_PUBLIC_KEY||!env.VAPID_PRIVATE_KEY)return;
  const event=await env.DB.prepare('SELECT id,post_id,kind FROM notification_events WHERE id=?').bind(id).first();
  if(!event)return;
  const {results}=await env.DB.prepare('SELECT * FROM push_subscriptions ORDER BY created_at DESC LIMIT 10').all();
  await Promise.allSettled(results.map(sub=>pushTo(env,sub,{title:'SGIA 커뮤니티',body:event.kind==='post'?'새 게시글이 등록되었습니다.':'새 댓글·답글이 등록되었습니다.',url:'/admin?post='+event.post_id,tag:event.id})));
}
export async function notificationAPI(request,env,body) {
  const {pathname:path}=new URL(request.url),method=request.method;
  if(path==='/admin/notifications'&&method==='GET'){
    const {results}=await env.DB.prepare(`SELECT e.id,e.post_id,e.kind,e.created_at,p.board,p.title FROM notification_events e JOIN posts p ON p.id=e.post_id WHERE p.deleted_at IS NULL AND p.hidden=0 ORDER BY e.created_at DESC,e.id DESC LIMIT 50`).all();
    return json({events:results});
  }
  if(path==='/admin/push/config'&&method==='GET')return json({publicKey:env.VAPID_PUBLIC_KEY||null});
  if(path==='/admin/push/subscription'&&method==='POST'){
    if(!env.VAPID_PUBLIC_KEY||!env.VAPID_PRIVATE_KEY)throw new HTTPError(503,'알림 서버 설정을 준비 중입니다.');
    const data=await body(request),endpoint=validEndpoint(data.endpoint),keys=data.keys;
    if(!keys||!/^[-_A-Za-z0-9]{87}$/.test(keys.p256dh)||!/^[-_A-Za-z0-9]{22}$/.test(keys.auth))throw new HTTPError(400,'알림 키를 확인해 주세요.');
    try{await crypto.subtle.importKey('raw',Uint8Array.from(atob(keys.p256dh.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0)),{name:'ECDH',namedCurve:'P-256'},false,[]);}catch{throw new HTTPError(400,'알림 키가 유효하지 않습니다.');}
    const id=await digest(endpoint);
    const exists=await env.DB.prepare('SELECT id FROM push_subscriptions WHERE id=?').bind(id).first();
    const count=await env.DB.prepare('SELECT count(*) AS n FROM push_subscriptions').first();
    if(!exists&&count.n>=10)throw new HTTPError(409,'등록된 알림 기기를 해제한 뒤 다시 시도해 주세요. (최대 10개)');
    await env.DB.prepare('INSERT INTO push_subscriptions(id,endpoint,subscription,created_at) VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET subscription=excluded.subscription,created_at=excluded.created_at').bind(id,endpoint,JSON.stringify({endpoint,keys}),Date.now()).run();
    return json({ok:true});
  }
  if(path==='/admin/push/subscription'&&method==='DELETE'){
    const data=await body(request);await env.DB.prepare('DELETE FROM push_subscriptions WHERE id=?').bind(await digest(validEndpoint(data.endpoint))).run();return json({ok:true});
  }
  if(path==='/admin/push/revoke'&&method==='POST'){await env.DB.prepare('DELETE FROM push_subscriptions').run();return json({ok:true});}
  if(path==='/admin/push/test'&&method==='POST'){
    const data=await body(request),id=await digest(validEndpoint(data.endpoint));
    const sub=await env.DB.prepare('SELECT * FROM push_subscriptions WHERE id=?').bind(id).first();
    if(!sub)throw new HTTPError(404,'먼저 이 기기의 알림을 켜 주세요.');
    if(!await pushTo(env,sub,{title:'SGIA 알림 연결',body:'이 기기로 새 글·댓글 알림을 받습니다.',url:'/admin',tag:'sgia-test'}))throw new HTTPError(410,'알림 등록이 만료되었습니다. 다시 켜 주세요.');
    return json({ok:true});
  }
  return null;
}
