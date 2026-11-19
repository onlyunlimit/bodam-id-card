export const adminManifest = {id:'/admin',name:'SGIA 관리자',short_name:'SGIA 관리',start_url:'/admin',scope:'/admin',display:'standalone',background_color:'#111b29',theme_color:'#111b29',icons:[{src:'/admin/icon.png',sizes:'192x192',type:'image/png'},{src:'/admin/icon-large.png',sizes:'512x512',type:'image/png'}]};
export const adminSW = String.raw`
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
// Never cache authenticated HTML, posts, IP records, or credentials.
self.addEventListener('push',event=>{let p={};try{p=event.data?.json()||{};}catch{};event.waitUntil(self.registration.showNotification('SGIA 커뮤니티',{body:p.body||'새 활동이 있습니다.',icon:'/admin/icon.png',tag:p.tag||'sgia',data:{url:/^\/admin(?:\?post=[a-f0-9-]{36})?$/.test(p.url||'')?p.url:'/admin'}}));});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil((async()=>{const url=new URL(event.notification.data?.url||'/admin',self.location.origin).href;const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});const current=windows.find(w=>new URL(w.url).origin===self.location.origin&&new URL(w.url).pathname==='/admin');if(current){await current.navigate(url);return current.focus();}return self.clients.openWindow(url);})());});
`;
export const notificationClient = String.raw`
let pushRegistration, pushConfig, notificationsReady=false, inboxThrough=0, inboxBusy=false;
const pushStatus=t=>{const el=$('#push-status');if(el)el.textContent=t;};
async function refreshNotifications(){
 if(inboxBusy||$('#workspace').hidden)return;inboxBusy=true;
 try{const r=await api('notifications');inboxThrough=r.asOf||Date.now();
 $('#notification-count').textContent=r.unread??(r.events||[]).length;
 $('#notification-events').innerHTML=(r.events||[]).map(e=>'<a class="inbox-item" href="/admin?post='+encodeURIComponent(e.post_id)+'"><span class="inbox-dot"></span><span><small>'+esc(e.kind==='post'?'새 글':'새 댓글·답글')+'</small><strong>'+esc(e.title)+'</strong><time>'+new Date(e.created_at).toLocaleString('ko-KR')+'</time></span><span aria-hidden="true">›</span></a>').join('')||'<div class="inbox-empty">모든 소식을 확인했어요.</div>';
 $('#events-read-all').disabled=!(r.unread??(r.events||[]).length);
 if(navigator.setAppBadge){if(r.unread)await navigator.setAppBadge(r.unread).catch(()=>{});else await navigator.clearAppBadge?.().catch(()=>{});}
 }finally{inboxBusy=false;}
}
async function readNotifications(postId,through){
 await api('notifications/read','POST',{postId,through});
 const registration=pushRegistration||await navigator.serviceWorker?.getRegistration('/admin');
 const notices=await registration?.getNotifications?.();for(const n of notices||[]){if(n.data?.url==='/admin?post='+postId)n.close();}
 if(notificationsReady)await refreshNotifications();
}
async function checkPushStatus(){
 if(!pushRegistration)return;
 const sub=await pushRegistration.pushManager.getSubscription();
 if(Notification.permission!=='granted'||!sub){pushStatus('알림이 꺼져 있습니다. 아래에서 연결해 주세요.');return;}
 const r=await api('push/status','POST',{endpoint:sub.endpoint});
 if(!r.registered){pushStatus('기기와 서버의 연결이 끊겼습니다. 알림 연결 복구를 눌러 주세요.');return;}
 pushStatus(r.last_error?'마지막 전송 실패 ('+r.last_error+'). 알림 연결 복구 후 테스트해 주세요.':r.last_status?'알림 연결됨 · 최근 전송을 알림 서비스가 접수했습니다.':'알림 연결됨 · 테스트 알림으로 수신을 확인하세요.');
}
async function initNotifications(){
 if(notificationsReady){await refreshNotifications();return;}notificationsReady=true;
 const section=document.createElement('section');section.className='notification-center';section.innerHTML='<div class="inbox-heading"><h2>새 소식 <span id="notification-count">0</span></h2><div><button id="events-refresh">새로고침</button><button id="events-read-all">모두 읽음</button></div></div><div id="notification-events" aria-live="polite"></div><details class="push-settings"><summary>알림 설정 · 연결 상태</summary><p id="push-status" role="status">알림 연결을 확인하고 있습니다.</p><div class="tools"><button id="push-enable" disabled>알림 켜기</button><button id="push-test" disabled>테스트 알림</button><button id="push-repair" disabled>알림 연결 복구</button><button id="push-disable">알림 끄기</button></div><p class="muted">아이폰: Safari 공유 → 홈 화면에 추가 후 설치한 앱에서 알림을 켜 주세요. 앱이 닫혀 있어도 알림을 받습니다. 로그아웃하면 이 기기의 알림은 해제됩니다.</p><button id="push-revoke" class="text-control">모든 기기 연결 해제</button></details>';
 $('#workspace').prepend(section);
 const safe=fn=>async()=>{try{await fn();}catch(e){pushStatus(e.message);}};
 $('#events-refresh').onclick=safe(refreshNotifications);
 $('#events-read-all').onclick=safe(async()=>{await api('notifications/read','POST',{all:true,through:inboxThrough});await refreshNotifications();const notices=await pushRegistration?.getNotifications?.();for(const n of notices||[])if(n.timestamp<=inboxThrough)n.close();});
 $('#push-revoke').onclick=safe(async()=>{if(!confirm('모든 기기의 알림 연결을 해제할까요?'))return;await api('push/revoke','POST',{});await (await pushRegistration?.pushManager.getSubscription())?.unsubscribe();pushStatus('모든 기기 연결을 해제했습니다.');});
 $('#push-disable').onclick=safe(async()=>{await disablePush();pushStatus('이 기기 알림을 껐습니다.');});
 $('#push-test').onclick=safe(async()=>{const sub=await pushRegistration?.pushManager.getSubscription();if(!sub)throw Error('먼저 알림을 켜 주세요.');pushStatus('테스트 알림을 전송하고 있습니다…');await api('push/test','POST',{endpoint:sub.endpoint});pushStatus('알림 서비스가 접수했습니다. 앱을 잠시 내려 기기의 알림을 확인하세요.');});
 function connect(repair){return safe(async()=>{
  if(!pushRegistration||!pushConfig?.publicKey)throw Error('알림 준비가 끝난 뒤 다시 시도해 주세요.');
  const permission=await Notification.requestPermission();if(permission!=='granted')throw Error('아이폰 설정 → 알림 → SGIA 관리에서 알림을 허용해 주세요.');
  const key=Uint8Array.from(atob(pushConfig.publicKey.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
  let sub=await pushRegistration.pushManager.getSubscription();
  if(repair&&sub){await api('push/subscription','DELETE',{endpoint:sub.endpoint});await sub.unsubscribe();sub=null;}
  sub=sub||await pushRegistration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:key});
  await api('push/subscription','POST',sub.toJSON());pushStatus('알림 연결 완료. 테스트 알림으로 수신을 확인하세요.');
 });}
 $('#push-enable').onclick=connect(false);$('#push-repair').onclick=connect(true);
 await refreshNotifications();
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!$('#workspace').hidden){refreshNotifications().catch(()=>{});checkPushStatus().catch(()=>{});}});
 setInterval(()=>{if(!document.hidden&&!$('#workspace').hidden)refreshNotifications().catch(()=>{});},20000);
 if(!('serviceWorker' in navigator)||!('PushManager' in window)||!('Notification' in window)){pushStatus('아이폰에서는 홈 화면에 추가한 앱으로 열어 주세요.');return;}
 try{pushConfig=await api('push/config');if(!pushConfig.publicKey){pushStatus('알림 서버 설정을 준비 중입니다.');return;}
 pushRegistration=await navigator.serviceWorker.register('/admin/sw.js',{scope:'/admin',updateViaCache:'none'});await navigator.serviceWorker.ready;await pushRegistration.update();
 for(const id of ['push-enable','push-test','push-repair'])$('#'+id).disabled=false;
 await checkPushStatus();}catch(e){pushStatus(e.message);}
}
async function disablePush(){const registration=pushRegistration||await navigator.serviceWorker?.getRegistration('/admin');const sub=await registration?.pushManager.getSubscription();if(sub){try{await api('push/subscription','DELETE',{endpoint:sub.endpoint});}finally{await sub.unsubscribe();}}}
`;
export const notificationCSS = `.notification-center{margin-bottom:24px;padding:20px;border-radius:18px;background:#182638;border:1px solid #52677e55}.inbox-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.inbox-heading h2{margin:0;font-size:20px}.inbox-heading h2 span{font-size:12px;background:#c9ab70;color:#111b29;padding:3px 8px;border-radius:20px;vertical-align:middle}.inbox-heading button,.text-control{padding:4px 7px;border:0;background:transparent;color:#b9c9db;font-size:12px}.inbox-item{display:flex;align-items:center;gap:12px;padding:16px 0;color:#e9eff6;text-decoration:none;border-bottom:1px solid #71849a33}.inbox-item>span:nth-child(2){flex:1;min-width:0}.inbox-item small,.inbox-item strong,.inbox-item time{display:block}.inbox-item strong{overflow-wrap:anywhere;font-size:15px}.inbox-item small,.inbox-item time{color:#afc0d3;font-size:12px}.inbox-dot{width:7px;height:7px;flex-shrink:0;border-radius:50%;background:#e3bc78}.inbox-empty{padding:28px 0;text-align:center;color:#b8c6d7}.push-settings{border-top:1px solid #71849a33;padding-top:14px;margin-top:10px}.push-settings summary{cursor:pointer;font-size:13px;color:#c6d2e1}.push-settings .tools{display:flex;flex-wrap:wrap;gap:8px}.push-settings button{font-size:13px}.push-settings .muted{font-size:12px}@media(max-width:480px){main{margin:16px auto;padding:14px}.notification-center{padding:16px}.inbox-heading{align-items:flex-start}}`;
