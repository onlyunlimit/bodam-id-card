export const adminManifest = {id:'/admin',name:'SGIA 관리자',short_name:'SGIA 관리',start_url:'/admin',scope:'/admin',display:'standalone',background_color:'#111b29',theme_color:'#111b29',icons:[{src:'/admin/icon.png',sizes:'192x192',type:'image/png'},{src:'/admin/icon-large.png',sizes:'512x512',type:'image/png'}]};
export const adminSW = String.raw`
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
// Never cache authenticated HTML, posts, IP records, or credentials.
self.addEventListener('push',event=>{let p={};try{p=event.data?.json()||{};}catch{};event.waitUntil(self.registration.showNotification('SGIA 커뮤니티',{body:p.body||'새 활동이 있습니다.',icon:'/admin/icon.png',tag:p.tag||'sgia',data:{url:/^\/admin(?:\?post=[a-f0-9-]{36})?$/.test(p.url||'')?p.url:'/admin'}}));});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil((async()=>{const url=new URL(event.notification.data?.url||'/admin',self.location.origin).href;const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});const current=windows.find(w=>new URL(w.url).origin===self.location.origin&&new URL(w.url).pathname==='/admin');if(current){await current.navigate(url);return current.focus();}return self.clients.openWindow(url);})());});
`;
export const notificationClient = String.raw`
let pushRegistration, pushConfig, notificationsReady=false;
async function initNotifications(){
 if(notificationsReady)return;notificationsReady=true;
 const section=document.createElement('section');section.className='artist-console';section.innerHTML='<h2>알림</h2><p>아이폰은 Safari 공유 → 홈 화면에 추가 후, 홈 화면의 SGIA 관리 앱에서 로그인하고 알림을 켜 주세요. iOS 16.4 이상이 필요합니다.</p><div class="tools"><button id="push-enable">이 기기 알림 켜기</button><button id="push-disable">이 기기 알림 끄기</button><button id="push-test">테스트 알림</button><button id="push-revoke">모든 기기 알림 해제</button></div><p id="push-status" role="status"></p><small>세션이 만료되어도 알림은 계속됩니다. 본문·작성자·IP는 잠금 화면에 보내지 않습니다. 로그아웃하면 이 기기의 알림을 해제합니다.</small><details><summary>최근 새 글·댓글</summary><button id="events-refresh">목록 새로고침</button><div id="notification-events"></div></details>';
 $('#workspace').prepend(section);
 const status=t=>$('#push-status').textContent=t;
 const safe=fn=>async()=>{try{await fn();}catch(e){status(e.message);}};
 async function refreshEvents(){const r=await api('notifications');$('#notification-events').innerHTML=(r.events||[]).map(e=>'<p><a href="/admin?post='+encodeURIComponent(e.post_id)+'">'+esc(e.kind==='post'?'새 글':'새 댓글')+' · '+esc(e.title)+'</a> <small>'+new Date(e.created_at).toLocaleString('ko-KR')+'</small></p>').join('')||'<p>새 알림이 없습니다.</p>';}
 $('#events-refresh').onclick=safe(refreshEvents);refreshEvents().catch(()=>{});
 $('#push-revoke').onclick=safe(async()=>{if(!confirm('모든 기기의 새 글·댓글 알림을 해제할까요?'))return;await api('push/revoke','POST',{});await (await pushRegistration?.pushManager.getSubscription())?.unsubscribe();status('모든 기기 알림을 해제했습니다.');});
 $('#push-disable').onclick=safe(async()=>{await disablePush();status('이 기기 알림을 껐습니다.');});
 $('#push-test').onclick=safe(async()=>{const sub=await pushRegistration?.pushManager.getSubscription();if(!sub)throw Error('먼저 알림을 켜 주세요.');await api('push/test','POST',{endpoint:sub.endpoint});status('알림 서비스에 전송했습니다. 기기에서 수신을 확인해 주세요.');});
 $('#push-enable').disabled=true;
 $('#push-enable').onclick=safe(async()=>{
  if(!pushRegistration||!pushConfig?.publicKey)throw Error('알림 준비가 끝난 뒤 다시 시도해 주세요.');
  // Permission is requested synchronously inside the user's tap, required on iOS.
  const permission=await Notification.requestPermission();if(permission!=='granted')throw Error('기기 설정에서 SGIA 관리의 알림을 허용해 주세요.');
  const key=Uint8Array.from(atob(pushConfig.publicKey.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
  const existing=await pushRegistration.pushManager.getSubscription();
  const sub=existing||await pushRegistration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:key});
  try{await api('push/subscription','POST',sub.toJSON());}catch(e){if(!existing)await sub.unsubscribe();throw e;}
  status('이 기기 알림을 켰습니다. 테스트 알림으로 수신을 확인하세요.');
 });
 if(!('serviceWorker' in navigator)||!('PushManager' in window)||!('Notification' in window)){status('아이폰에서는 홈 화면에 추가한 앱으로 열어 주세요.');return;}
 try{pushConfig=await api('push/config');if(!pushConfig.publicKey){status('알림 서버 설정을 준비 중입니다.');return;}pushRegistration=await navigator.serviceWorker.register('/admin/sw.js',{scope:'/admin'});await navigator.serviceWorker.ready;$('#push-enable').disabled=false;status((await pushRegistration.pushManager.getSubscription())?'이 기기에 알림 구독이 있습니다. 수신이 안 되면 알림 켜기를 다시 누르세요.':'알림을 켜면 앱을 닫아도 새 활동을 확인할 수 있습니다.');}catch(e){status(e.message);}
}
async function disablePush(){const registration=pushRegistration||await navigator.serviceWorker?.getRegistration('/admin');const sub=await registration?.pushManager.getSubscription();if(sub){try{await api('push/subscription','DELETE',{endpoint:sub.endpoint});}finally{await sub.unsubscribe();}}}
`;
