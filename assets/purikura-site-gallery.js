import {studioPhotos} from './purikura-gallery.js';
import {serviceConfig} from './service-config.js';
export function initSiteGallery(importImage){
const $=id=>document.getElementById(id);
let gallery=[...new Map(studioPhotos.map(p=>[p.url,p])).values()];
function renderGallery(){const previous=$('gallery-select').value;$('gallery-select').replaceChildren(...gallery.map((p,i)=>new Option(p.name||'사이트 사진',i)));if(previous)$('gallery-select').value=previous;$('gallery-add').disabled=!gallery.length;$('gallery-random').disabled=!gallery.length;}
renderGallery();$('gallery-add').onclick=()=>{const p=gallery[Number($('gallery-select').value)];if(p)importImage(p.url,'photo',p.name);};let lastRandom=-1;$('gallery-random').onclick=()=>{let n=Math.floor(Math.random()*gallery.length);if(n===lastRandom&&gallery.length>1)n=(n+1)%gallery.length;lastRandom=n;$('gallery-select').value=n;const p=gallery[n];if(p)importImage(p.url,'photo',p.name);};
Promise.allSettled(['lucky','obsidus'].map(async board=>{const r=await fetch(serviceConfig.api+'/members?board='+board,{signal:AbortSignal.timeout(8000)});if(!r.ok)return [];return ((await r.json()).members||[]).filter(m=>m.avatar_url).map(m=>({name:m.name+' · 커뮤니티',url:m.avatar_url.startsWith('/')?serviceConfig.api+m.avatar_url:m.avatar_url}));})).then(results=>{gallery=[...new Map([...gallery,...results.flatMap(r=>r.status==='fulfilled'?r.value:[])].map(p=>[p.url,p])).values()];renderGallery();});
}
