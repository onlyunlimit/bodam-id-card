// Owner console layout: one section at a time behind a sticky tab bar, long lists paged
// five at a time (buttons or sideways swipe), a back-to-top button and a slimmer look.
export const adminLayoutCSS = String.raw`
body{font-size:13px;line-height:1.6}
main{max-width:820px;margin:0 auto;padding:14px 14px 90px}
h1{font-size:20px;margin:6px 0 2px}
h2{font-size:16px;margin:0}
h3{font-size:14px;margin:4px 0}h4{font-size:13px;margin:4px 0}
button,input,select,textarea{padding:7px 11px;border-radius:9px}
textarea{min-height:110px}
.bar{margin:10px 0;gap:6px}
article{padding:12px 14px;margin:8px 0;border-radius:12px}
article p{margin:6px 0}
.artist-console{padding:14px;margin:0 0 12px;border-radius:14px}
.tools{gap:5px}.tools button{font-size:11px;padding:5px 8px}
.comment{padding-top:8px;margin-top:8px}
.admin-images img,.admin-photo{max-width:120px;min-height:0}
.admin-tabs{position:sticky;top:0;z-index:30;display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;margin:8px -14px 10px;padding:8px 14px;background:#111b29e8;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-bottom:1px solid #7996b333}
.admin-tabs::-webkit-scrollbar{display:none}
.admin-tabs button{flex:none;padding:6px 12px;border-radius:999px;font-size:12px;background:transparent;border-color:#7996b344}
.admin-tabs button[aria-selected=true]{background:#dce5ef;color:#111b29;border-color:#dce5ef;font-weight:700}
.admin-tabs b{display:inline-block;min-width:16px;margin-left:4px;padding:0 5px;border-radius:999px;background:#e0605c;color:#fff;font-size:10px;line-height:16px;text-align:center}
.admin-tabs b:empty{display:none}
[data-admin-panel][hidden]{display:none!important}
.admin-pager{display:flex;align-items:center;justify-content:center;gap:8px;margin:8px 0 4px}
.admin-pager button{min-width:38px;padding:5px 10px}
.admin-pager span{font:12px monospace;color:#99abc1}
.admin-pager[hidden]{display:none}
.admin-top{position:fixed;right:16px;bottom:calc(18px + env(safe-area-inset-bottom));z-index:40;width:44px;height:44px;padding:0;border-radius:50%;font-size:18px;background:#dce5ef;color:#111b29;box-shadow:0 6px 18px #0006;opacity:0;pointer-events:none;transition:opacity .2s}
.admin-top.show{opacity:1;pointer-events:auto}
@media(prefers-color-scheme:light){.admin-tabs{background:#f3f2f5e8;border-color:#d7d1dc}.admin-tabs button[aria-selected=true]{background:#28262d;color:#fff;border-color:#28262d}.admin-top{background:#28262d;color:#fff}}
@media(max-width:600px){main{padding:10px 10px 90px}.admin-tabs{margin:6px -10px 8px;padding:7px 10px}article{padding:10px 12px}}
`;
export const adminLayoutJS = String.raw`
const PAGE_SIZE=5;
function pageList(list,itemSelector){
 if(!list||list.dataset.paged)return;list.dataset.paged='1';
 const pager=document.createElement('div');pager.className='admin-pager';pager.innerHTML='<button type="button" data-p="-1" aria-label="이전 5개">‹</button><span></span><button type="button" data-p="1" aria-label="다음 5개">›</button>';
 list.after(pager);let page=0,busy=false;
 const items=()=>[...list.children].filter(el=>el.matches(itemSelector));
 function render(){busy=true;const all=items(),pages=Math.max(1,Math.ceil(all.length/PAGE_SIZE));page=Math.min(page,pages-1);
  all.forEach((el,i)=>{el.hidden=Math.floor(i/PAGE_SIZE)!==page;});
  pager.hidden=pages<2;pager.querySelector('span').textContent=(page+1)+' / '+pages;
  pager.querySelector('[data-p="-1"]').disabled=page===0;pager.querySelector('[data-p="1"]').disabled=page>=pages-1;
  queueMicrotask(()=>{busy=false;});}
 function go(step){const pages=Math.ceil(items().length/PAGE_SIZE);const next=Math.max(0,Math.min(pages-1,page+step));if(next===page)return;page=next;render();list.scrollIntoView({block:'start',behavior:'smooth'});}
 pager.onclick=e=>{const b=e.target.closest('[data-p]');if(b)go(Number(b.dataset.p));};
 // Sideways swipe turns the page; vertical scrolling is untouched.
 let start=null;
 list.addEventListener('touchstart',e=>{if(e.touches.length===1&&!e.target.closest('input,textarea,select'))start={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
 list.addEventListener('touchend',e=>{if(!start)return;const t=e.changedTouches[0],dx=t.clientX-start.x,dy=t.clientY-start.y;start=null;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)go(dx<0?1:-1);},{passive:true});
 new MutationObserver(()=>{if(!busy){page=0;render();}}).observe(list,{childList:true});
 render();
}
function initAdminLayout(){
 const ws=$('#workspace');if(!ws||ws.dataset.layout)return;ws.dataset.layout='1';
 const panel=(el,id)=>{if(el){el.dataset.adminPanel=id;}return el;};
 panel(ws.querySelector('.notification-center'),'inbox');
 panel(ws.querySelector('#posts-panel'),'posts');
 panel([...ws.querySelectorAll(':scope>.artist-console')].find(el=>el.querySelector('#artist-compose')),'compose');
 panel(ws.querySelector('#guestbook-console'),'guestbook');
 panel(ws.querySelector('#playlist-console'),'music');
 panel(ws.querySelector('#incident-admin'),'incidents');
 const tabs=[['inbox','새 소식'],['posts','게시물'],['guestbook','방명록'],['music','플레이리스트'],['incidents','사건'],['compose','멤버 글쓰기']].filter(([id])=>ws.querySelector('[data-admin-panel="'+id+'"]'));
 const bar=document.createElement('nav');bar.className='admin-tabs';bar.setAttribute('role','tablist');bar.setAttribute('aria-label','관리 구역');
 bar.innerHTML=tabs.map(([id,label])=>'<button type="button" role="tab" data-tab="'+id+'">'+label+(id==='inbox'?'<b data-tab-count></b>':'')+'</button>').join('');
 ws.prepend(bar);
 function show(id){bar.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===id)));ws.querySelectorAll('[data-admin-panel]').forEach(p=>{p.hidden=p.dataset.adminPanel!==id;});}
 bar.onclick=e=>{const b=e.target.closest('[data-tab]');if(!b)return;show(b.dataset.tab);try{localStorage.setItem('sgia-admin-tab',b.dataset.tab);}catch{}scrollTo({top:0,behavior:'smooth'});};
 const q=new URLSearchParams(location.search);
 let start=q.has('incident')?'incidents':q.has('post')?'posts':q.has('guestbook')?'guestbook':q.has('musicRequest')?'music':(()=>{try{return localStorage.getItem('sgia-admin-tab');}catch{return null;}})();
 if(!tabs.some(([id])=>id===start))start='inbox';
 show(start);
 // Mirror the unread count on the tab.
 const count=$('#notification-count');if(count){const sync=()=>{bar.querySelector('[data-tab-count]').textContent=Number(count.textContent)>0?count.textContent:'';};new MutationObserver(sync).observe(count,{childList:true,characterData:true,subtree:true});sync();}
 pageList($('#posts'),'article');
 pageList($('#notification-events'),'.inbox-item');
 pageList(ws.querySelector('[data-gb-list]'),'article');
 pageList(ws.querySelector('[data-requests]'),'article');
 pageList($('#playlist-admin-list'),'article');
 pageList($('#incident-admin-list'),'article');
 const top=document.createElement('button');top.type='button';top.className='admin-top';top.setAttribute('aria-label','맨 위로');top.textContent='↑';document.body.append(top);
 top.onclick=()=>scrollTo({top:0,behavior:'smooth'});
 addEventListener('scroll',()=>top.classList.toggle('show',scrollY>500),{passive:true});
}
`;
