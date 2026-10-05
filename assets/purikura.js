import {sizes,fontStyle,cloneScene,localPoint,contains,transformFromPointers,snapHorizontal,itemBounds,snapItem,colorPixels,frameDepth,keyPixels,renderScene} from './purikura-engine.js';
import {initControls,syncFontPickers,closePanels,openPanel,fontsReady} from './purikura-controls.js';
import {initCrop} from './purikura-crop.js';
const $=id=>document.getElementById(id), canvas=$('photo-canvas'),inkCanvas=document.createElement('canvas');
let scene={width:900,height:1200,paper:'#fff6f8',frame:'scallop',items:[],strokes:[],watermarkOn:false,watermark:'',watermarkColor:'#864761',watermarkFont:'sans',watermarkSize:22,watermarkOutline:0,watermarkOutlineColor:'#ffffff',frameLayer:'back'}, selected=null,tool='select',picking=false,gesture=null,dirty=false,guides=null;
const history=[],future=[],images=new Map(),processed=new Map(),pointers=new Map();let serial=0,loading=0;
const status=message=>$('status').textContent=message;
const item=()=>scene.items.find(x=>x.id===selected);
function checkpoint(){history.push(cloneScene(scene));if(history.length>30)history.shift();future.length=0;dirty=true;}
function imageFor(i){
 const original=images.get(i.asset),e=i.effects||{};
 const tinted=e.preset&&e.preset!=='original'||['brightness','contrast','saturation'].some(k=>e[k]!=null&&e[k]!==100);
 if(!i.key?.enabled&&!tinted&&!i.erases?.length)return original;
 const cache=JSON.stringify([i.asset,i.key,e,i.erases]);if(processed.has(cache))return processed.get(cache);
 const out=document.createElement('canvas');out.width=original.width;out.height=original.height;
 const c=out.getContext('2d',{willReadFrequently:true});c.drawImage(original,0,0);
 if(i.key?.enabled||tinted){const pixels=c.getImageData(0,0,out.width,out.height);
 if(i.key?.enabled)keyPixels(pixels.data,i.key.color,i.key.tolerance);
 if(tinted)colorPixels(pixels.data,e);c.putImageData(pixels,0,0);}
 c.globalCompositeOperation='destination-out';c.lineCap=c.lineJoin='round';
 for(const stroke of i.erases||[]){c.lineWidth=stroke.size*out.width;c.beginPath();const first=stroke.points[0];c.moveTo(first.x*out.width,first.y*out.height);for(const q of stroke.points)c.lineTo(q.x*out.width,q.y*out.height);c.stroke();if(stroke.points.length===1){c.beginPath();c.arc(first.x*out.width,first.y*out.height,c.lineWidth/2,0,Math.PI*2);c.fill();}}
 processed.set(cache,out);if(processed.size>8)processed.delete(processed.keys().next().value);return out;
}
function placeActions(){
 const i=item(),bar=$('selection-actions');bar.hidden=!i;if(!i)return;
 $('quick-crop').hidden=i.type!=='image';
 const rect=canvas.getBoundingClientRect(),wrap=canvas.parentElement.getBoundingClientRect(),b=itemBounds(i);
 bar.style.left=Math.max(6,Math.min(wrap.width-bar.offsetWidth-6,rect.left-wrap.left+i.x*rect.width/scene.width-bar.offsetWidth/2))+'px';
 bar.style.top=Math.max(6,Math.min(wrap.height-bar.offsetHeight-6,rect.top-wrap.top+b.top*rect.height/scene.height-bar.offsetHeight-7))+'px';
}
function draw(){renderScene(canvas,scene,{imageFor,selected,inkCanvas,guides});canvas.style.setProperty('--photo-ratio',scene.width/scene.height);$('size-label').textContent=`${scene.width} × ${scene.height} PX`;$('empty-note').hidden=!!(scene.items.length||scene.strokes.length);$('undo').disabled=!history.length;$('redo').disabled=!future.length;placeActions();$('frame-layer-label').textContent=frameDepth(scene)===0?'프레임 · 맨뒤':frameDepth(scene)===scene.items.length+1?'프레임 · 맨앞':'프레임 · '+frameDepth(scene)+'개 요소 앞';}
function inspect(){const i=item();$('layer-select').replaceChildren(...(scene.items.length?[...scene.items].reverse().map(x=>new Option(x.label,x.id)): [new Option('항목 없음','')]));$('layer-select').value=selected||'';$('item-controls').hidden=!i;$('chroma-controls').hidden=i?.type!=='image';$('image-controls').hidden=i?.type!=='image';$('edit-text-box').hidden=i?.type!=='text';if(i){$('item-opacity').value=(i.opacity??1)*100;$('opacity-output').value=Math.round((i.opacity??1)*100)+'%';$('flip-x').setAttribute('aria-pressed',String(!!i.flipX));$('flip-y').setAttribute('aria-pressed',String(!!i.flipY));$('crop-restore').disabled=!i.crop;$('erase-restore').disabled=!i.erases?.length;if(i.type==='image'){$('image-filter').value=i.effects?.preset||'original';for(const k of ['brightness','contrast','saturation']){$('image-'+k).value=i.effects?.[k]??100;$(k+'-output').value=(i.effects?.[k]??100)+'%';}}syncTransformFields(i);$('item-x').value=Math.round(i.x);$('item-y').value=Math.round(i.y);if(i.type==='text'){$('edit-text').value=i.text;$('edit-font').value=i.font;$('edit-color').value=i.color;$('edit-outline-color').value=i.outlineColor||'#fffaf6';$('text-outline').value=i.outlineWidth??4;$('text-outline-output').value=i.outlineWidth??4;}else{$('chroma-enabled').checked=!!i.key?.enabled;$('chroma-color').value=i.key?.color||'#00ff00';$('chroma-tolerance').value=i.key?.tolerance??45;$('chroma-output').value=i.key?.tolerance??45;}}syncFontPickers();draw();}
function sync(){if(!scene.items.some(x=>x.id===selected))selected=null;$('paper-color').value=scene.paper;$('frame').value=scene.frame;$('paper-size').value=Object.keys(sizes).find(k=>sizes[k][0]===scene.width&&sizes[k][1]===scene.height);$('watermark-on').checked=scene.watermarkOn;$('watermark-text').value=scene.watermark;$('watermark-color').value=scene.watermarkColor;$('watermark-font').value=scene.watermarkFont||'sans';$('watermark-outline-color').value=scene.watermarkOutlineColor||'#ffffff';for(const [id,key] of [['watermark-size','watermarkSize'],['watermark-outline','watermarkOutline']]){$(id).value=scene[key];$(id+'-output').value=scene[key];}inspect();}
function setTool(t){tool=t;picking=false;$('eyedropper').setAttribute('aria-pressed','false');document.querySelectorAll('[data-tool]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tool===t)));canvas.style.cursor=t==='select'?'grab':'crosshair';}
function append(i){if(scene.items.length>=35)throw Error('사진·글자·스티커는 35개까지 넣을 수 있어요.');checkpoint();scene.items.push(i);selected=i.id;setTool('select');closePanels();inspect();}
async function importImage(source,kind,label){if(loading)return status('이미지를 불러오는 중이에요. 잠시 기다려 주세요.');loading++;status('사진을 준비하고 있어요…');try{if(scene.items.length>=35)throw Error('항목은 35개까지 추가할 수 있어요.');let blob;if(source instanceof Blob)blob=source;else{const url=new URL(source);if(!['https:'].includes(url.protocol)||url.username||url.password)throw Error('HTTPS 이미지 주소를 입력해 주세요.');const response=await fetch(url,{mode:'cors',credentials:'omit',signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('이미지 주소에 접근할 수 없어요.');blob=await response.blob();}if(blob.size>20*1024*1024)throw Error('이미지는 장당 20MB까지 사용할 수 있어요.');if(!/^image\/(png|jpeg|webp)$/.test(blob.type))throw Error('JPG·PNG·WebP 이미지 파일을 선택해 주세요.');const url=URL.createObjectURL(blob);let picture;try{picture=new Image();picture.src=url;await picture.decode();}finally{URL.revokeObjectURL(url);}if(!picture.naturalWidth||picture.naturalWidth*picture.naturalHeight>50_000_000)throw Error('너무 큰 이미지예요. 크기를 줄여 다시 넣어 주세요.');const asset=document.createElement('canvas'),factor=Math.min(1,2000/Math.max(picture.naturalWidth,picture.naturalHeight));asset.width=Math.round(picture.naturalWidth*factor);asset.height=Math.round(picture.naturalHeight*factor);asset.getContext('2d').drawImage(picture,0,0,asset.width,asset.height);const id='image-'+(++serial);images.set(id,asset);const f=Math.min(scene.width*(kind==='sticker'?.28:.75)/asset.width,scene.height*.65/asset.height);append({id,asset:id,type:'image',label:(kind==='sticker'?'스티커 · ':'사진 · ')+label,w:asset.width*f,h:asset.height*f,x:scene.width/2,y:scene.height/2,r:kind==='sticker'?-8:0,scale:1,key:{enabled:false,color:'#00ff00',tolerance:45}});status('추가했어요! 선택 도구로 끌어서 배치해 주세요.');}catch(e){status(e.name==='TypeError'?'이미지를 불러오지 못했어요. 외부 사용 제한이 있는 주소라면 파일로 업로드해 주세요.':e.name==='TimeoutError'?'이미지 연결이 늦어지고 있어요. 잠시 후 다시 시도해 주세요.':e.message);}finally{loading--;}}
for(const kind of ['photo','sticker']){$(kind+'-file').onchange=async e=>{const files=[...e.target.files];for(const file of files)await importImage(file,kind,file.name);e.target.value='';};$(kind+'-link').onclick=()=>{const value=$(kind+'-url').value.trim();if(!value)return status('이미지 주소를 입력해 주세요.');importImage(value,kind,'링크 이미지');};}
if(document.body.hasAttribute('data-sgia-gallery'))import('./purikura-site-gallery.js').then(m=>m.initSiteGallery(importImage)).catch(()=>status('사이트 사진 목록을 불러오지 못했어요. 파일·링크로 추가할 수 있어요.'));
document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>{setTool(b.dataset.tool);closePanels();});
for(const color of ['#ed5996','#a169d2','#64b8df','#f7c956','#83b783','#24232d','#ffffff']){const b=document.createElement('button');b.style.background=color;b.setAttribute('aria-label','펜 색상 '+color);b.onclick=()=>$('ink-color').value=color;$('swatches').append(b);}
$('ink-size').oninput=()=>$('ink-output').value=$('ink-size').value;
function makeText(text,font,color){const fs=58,c=canvas.getContext('2d');c.font=fontStyle(font,fs);const w=Math.max(50,...text.split('\n').map(t=>c.measureText(t).width))+12,h=text.split('\n').length*fs*1.25;return {id:'text-'+(++serial),type:'text',label:'글자 · '+text.slice(0,20),text,font,color,fontSize:fs,w,h,scale:Math.min(1,scene.width*.8/w),x:scene.width/2,y:scene.height*.65,r:0};}
$('text-add').onclick=async()=>{await fontsReady;const text=$('text-input').value.trim();if(!text)return status('추가할 메시지를 입력해 주세요.');try{append(makeText(text,$('text-font').value,$('text-color').value));status('글자를 추가했어요.');}catch(e){status(e.message);}};
document.querySelectorAll('[data-stamp]').forEach(b=>b.onclick=async()=>{await fontsReady;try{append(makeText(b.dataset.stamp,'serif',$('text-color').value));}catch(e){status(e.message);}});
$('text-update').onclick=()=>{const i=item(),text=$('edit-text').value.trim();if(!i||i.type!=='text'||!text)return;checkpoint();const replacement=makeText(text,i.font,i.color);Object.assign(i,{text,w:replacement.w,h:replacement.h,label:replacement.label});inspect();};
function pos(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*scene.width/r.width,y:(e.clientY-r.top)*scene.height/r.height};}
canvas.onpointerdown=e=>{if(e.button!==0||(gesture&&(gesture.stroke||gesture.erasure||e.pointerType!=='touch'||gesture.pointerType!=='touch'||pointers.size>=2)))return;e.preventDefault();canvas.focus({preventScroll:true});const p=pos(e);if(picking){const i=item();if(!i||i.type!=='image'||!contains(i,p))return status('선택한 이미지 안의 배경색을 찍어 주세요.');const q=localPoint(i,p),crop=i.crop||{x:0,y:0,w:1,h:1},src=images.get(i.asset),c=src.getContext('2d',{willReadFrequently:true}),pixel=c.getImageData(Math.min(src.width-1,Math.floor((crop.x+(i.flipX?1-q.x/i.w:q.x/i.w)*crop.w)*src.width)),Math.min(src.height-1,Math.floor((crop.y+(i.flipY?1-q.y/i.h:q.y/i.h)*crop.h)*src.height)),1,1).data;if(!pixel[3])return status('이미 투명한 곳이에요. 배경색이 있는 곳을 찍어 주세요.');checkpoint();i.key={...i.key,enabled:true,color:'#'+[...pixel.slice(0,3)].map(v=>v.toString(16).padStart(2,'0')).join('')};picking=false;$('eyedropper').setAttribute('aria-pressed','false');inspect();status('선택한 색을 지웠어요. 허용 범위로 가장자리를 조절해 주세요.');return;}
 if(tool==='select'){
  canvas.setPointerCapture(e.pointerId);
  if(!pointers.size){
   const hit=[...scene.items].reverse().find(i=>contains(i,p));
   selected=hit?.id||(e.pointerType==='touch'?selected:null);
   gesture={checkpointed:false,pointerType:e.pointerType};
  }
  pointers.set(e.pointerId,p);beginSelectionGesture();inspect();
 }else if(tool==='image-eraser'){
  const i=item();if(i?.type!=='image'||!contains(i,p))return status('선택한 사진·스티커 안을 문질러 주세요.');
  if(i.erases?.length>=200)return status('지우개 획은 이미지마다 200개까지 사용할 수 있어요.');
  checkpoint();canvas.setPointerCapture(e.pointerId);
  const erasure={size:Number($('erase-size').value)/i.scale*(i.crop?.w??1)/i.w,points:[sourcePoint(i,p)]};
  (i.erases??=[]).push(erasure);gesture={pointer:e.pointerId,erasure,target:i};draw();
 }else{
  if(scene.strokes.length>=200)return status('펜 선은 200개까지 그릴 수 있어요.');
  canvas.setPointerCapture(e.pointerId);checkpoint();
  const stroke={tool,color:$('ink-color').value,size:Number($('ink-size').value),points:[p]};
  scene.strokes.push(stroke);gesture={pointer:e.pointerId,stroke};draw();
 }
};
function beginSelectionGesture(){
 const i=item(),points=[...pointers.values()];
 gesture={checkpointed:gesture?.checkpointed||false,pointerType:gesture?.pointerType,
  start:points,initial:i?{x:i.x,y:i.y,r:i.r,scale:i.scale}:null};
}
function syncTransformFields(i){
 const percent=i.scale*100,slider=$('item-scale');
 if(percent>=Number(slider.max))slider.max=Math.ceil(percent*2);
 slider.value=percent;$('scale-output').value=Number(percent.toFixed(2))+'%';$('scale-number').value=Number(percent.toFixed(2));
 $('item-rotation').value=i.r;$('rotation-output').value=Number(i.r.toFixed(2))+'°';$('rotation-number').value=Number(i.r.toFixed(2));
}
function previewTransform(i){syncTransformFields(i);$('item-x').value=Math.round(i.x);$('item-y').value=Math.round(i.y);draw();}
function sourcePoint(i,p){const q=localPoint(i,p),c=i.crop||{x:0,y:0,w:1,h:1};return {x:c.x+(i.flipX?1-q.x/i.w:q.x/i.w)*c.w,y:c.y+(i.flipY?1-q.y/i.h:q.y/i.h)*c.h};}
$('erase-size').oninput=()=>$('erase-output').value=$('erase-size').value;
$('erase-restore').onclick=()=>{const i=item();if(!i?.erases?.length)return;checkpoint();i.erases=[];inspect();status('지운 부분을 복원했어요.');};
canvas.onpointermove=e=>{
 if(!gesture)return;
 const p=pos(e);
 if(gesture.erasure){if(gesture.pointer!==e.pointerId)return;if(gesture.erasure.points.length<5000)gesture.erasure.points.push(sourcePoint(gesture.target,p));draw();return;}
 if(gesture.stroke){
  if(gesture.pointer!==e.pointerId)return;
  if(gesture.stroke.points.length<5000)gesture.stroke.points.push(p);draw();return;
 }
 if(!pointers.has(e.pointerId))return;
 pointers.set(e.pointerId,p);
 const i=item();if(!i||!gesture.initial)return;
 const points=[...pointers.values()],start=gesture.start;
 if(!gesture.checkpointed&&!points.some((q,n)=>Math.hypot(q.x-start[n].x,q.y-start[n].y)>2))return;
 if(!gesture.checkpointed){checkpoint();gesture.checkpointed=true;}
 const next=points.length===2?transformFromPointers(gesture.initial,start,points,$('angle-snap').checked):{
  x:gesture.initial.x+p.x-start[0].x,y:gesture.initial.y+p.y-start[0].y};
 guides=points.length===2&&$('angle-snap').checked&&next.r===0?{y:next.y}:null;if(points.length===1&&$('snap-on').checked&&!e.shiftKey){const snap=snapItem({...i,...next},scene.items,scene.width,scene.height,6*scene.width/canvas.getBoundingClientRect().width);next.x=snap.x;next.y=snap.y;guides=snap.guides;}
 Object.assign(i,next,{x:Math.max(0,Math.min(scene.width,next.x)),y:Math.max(0,Math.min(scene.height,next.y))});
 previewTransform(i);
};
function endGesture(e){
 if(!gesture)return;
 if(gesture.stroke||gesture.erasure){if(e.pointerId!==gesture.pointer)return;gesture=null;}
 else{
  if(!pointers.delete(e.pointerId))return;
  if(pointers.size)beginSelectionGesture();else gesture=null;
 }
 if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
 guides=null;inspect();
}
canvas.onpointerup=endGesture;canvas.onpointercancel=endGesture;canvas.onlostpointercapture=endGesture;
canvas.onkeydown=e=>{if(!item())return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();checkpoint();const step=e.shiftKey?20:5;item().x=Math.max(0,Math.min(scene.width,item().x+(e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0)));item().y=Math.max(0,Math.min(scene.height,item().y+(e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0)));inspect();}if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();$('remove').click();}};
$('layer-select').onchange=e=>{selected=e.target.value;picking=false;setTool('select');inspect();};
// Preview every slider input; keep one undo snapshot for the whole adjustment.
for(const [id,prop,convert,output,unit] of [
 ['item-scale','scale',v=>v/100,'scale-output','%'],
 ['item-rotation','r',v=>v,'rotation-output','°']
]){
 const slider=$(id);let editing=null,dragging=false;
 const finish=()=>{editing=null;dragging=false;};
 const preview=()=>{
  const target=item(),raw=Number(slider.value),value=prop==='r'&&dragging&&$('angle-snap').checked?snapHorizontal(raw):raw;
  slider.value=value;
  if(!target||!Number.isFinite(value)||target[prop]===convert(value))return;
  if(editing!==target){checkpoint();editing=target;}
  target[prop]=convert(value);$(output).value=value+unit;$(prop==='r'?'rotation-number':'scale-number').value=value;draw();
 };
 slider.oninput=preview;
 slider.onchange=()=>{preview();finish();if(item())syncTransformFields(item());};
 slider.onblur=finish;
 slider.onpointerdown=()=>{finish();dragging=true;};
 slider.onpointerup=()=>{dragging=false;};
 slider.onpointercancel=finish;
}
for(const [id,prop] of [['scale-number','scale'],['rotation-number','r']]){
 const field=$(id);field.onchange=()=>{const i=item(),raw=Number(field.value);if(!i)return;if(!field.value.trim()||!Number.isFinite(raw)||(prop==='scale'&&(raw<10||!Number.isFinite(raw*Math.max(i.w,i.h))))){syncTransformFields(i);return;}
 const value=prop==='scale'?raw/100:((raw%360)+540)%360-180;if(value!==i[prop]){checkpoint();i[prop]=value;}inspect();};
 field.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();field.dispatchEvent(new Event('change'));}};
}
for(const [id,factor] of [['scale-double',2],['scale-half',.5]])$(id).onclick=()=>{const i=item();if(!i)return;const next=Math.max(.1,i.scale*factor);if(!Number.isFinite(next*Math.max(i.w,i.h)))return;checkpoint();i.scale=next;inspect();};
for(const [id,prop,convert] of [['item-x','x',v=>Math.max(0,Math.min(scene.width,v))],['item-y','y',v=>Math.max(0,Math.min(scene.height,v))]])$(id).onchange=e=>{if(!item()||!Number.isFinite(Number(e.target.value)))return;checkpoint();item()[prop]=convert(Number(e.target.value));inspect();};
for(const [id,step]of [['layer-up',1],['layer-down',-1]])$(id).onclick=()=>{const n=scene.items.findIndex(i=>i.id===selected),to=n+step;if(n<0||to<0||to>=scene.items.length)return;checkpoint();[scene.items[n],scene.items[to]]=[scene.items[to],scene.items[n]];inspect();};
$('remove').onclick=()=>{if(!item())return;checkpoint();scene.items=scene.items.filter(i=>i.id!==selected);selected=scene.items.at(-1)?.id||null;inspect();};
$('duplicate').onclick=()=>{const i=item();if(!i)return;try{append({...cloneScene({items:[i],strokes:[]}).items[0],id:'copy-'+(++serial),x:Math.min(scene.width,i.x+25),y:Math.min(scene.height,i.y+25),key:i.key?{...i.key}:null,crop:i.crop?{...i.crop}:null,effects:i.effects?{...i.effects}:null});}catch(e){status(e.message);}};
for(const id of ['chroma-enabled','chroma-color','chroma-tolerance'])$(id).onchange=()=>{if(item()?.type!=='image')return;checkpoint();item().key={enabled:$('chroma-enabled').checked,color:$('chroma-color').value,tolerance:Number($('chroma-tolerance').value)};inspect();};
$('eyedropper').onclick=()=>{if(item()?.type!=='image')return;picking=!picking;closePanels();$('eyedropper').setAttribute('aria-pressed',String(picking));status(picking?'캔버스에서 지울 배경색을 찍어 주세요.':'색 선택을 취소했어요.');};
for(const [id,prop]of [['paper-color','paper'],['frame','frame'],['watermark-text','watermark'],['watermark-color','watermarkColor']])$(id).onchange=e=>{checkpoint();scene[prop]=e.target.value;draw();};
$('watermark-on').onchange=e=>{checkpoint();scene.watermarkOn=e.target.checked;draw();};
$('paper-size').onchange=e=>{checkpoint();const [w,h]=sizes[e.target.value],dx=(w-scene.width)/2,dy=(h-scene.height)/2;scene.items.forEach(i=>{i.x+=dx;i.y+=dy;});scene.strokes.forEach(s=>s.points.forEach(p=>{p.x+=dx;p.y+=dy;}));scene.width=w;scene.height=h;inspect();};
$('undo').onclick=()=>{if(!history.length)return;future.push(cloneScene(scene));scene=history.pop();dirty=true;sync();};$('redo').onclick=()=>{if(!future.length)return;history.push(cloneScene(scene));scene=future.pop();dirty=true;sync();};
$('clear').onclick=()=>{if(!scene.items.length&&!scene.strokes.length)return;if(!confirm('사진과 꾸미기를 지우고 새로 시작할까요? 되돌리기로 복구할 수 있어요.'))return;checkpoint();scene.items=[];scene.strokes=[];selected=null;inspect();status('새 사진지가 준비됐어요.');};
$('save-png').onclick=async()=>{try{await fontsReady;const output=document.createElement('canvas');renderScene(output,scene,{imageFor,inkCanvas:document.createElement('canvas')});const blob=await new Promise(resolve=>output.toBlob(resolve,'image/png'));if(!blob)throw Error('PNG를 만들지 못했어요.');const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='photo-club-'+Date.now()+'.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);dirty=false;status('PNG 파일을 저장했어요. 다운로드 목록을 확인해 주세요.');}catch(e){status('저장하지 못했어요. 외부 이미지는 파일로 올려 다시 시도해 주세요.');}};
window.addEventListener('beforeunload',e=>{if(dirty&&(scene.items.length||scene.strokes.length)){e.preventDefault();e.returnValue='';}});
// Shared live sliders preserve a single undo entry until an adjustment ends.
function bindSlider(id,getTarget,read,write,output,unit=''){
 const input=$(id);let editing=null;
 const preview=()=>{const target=getTarget(),value=Number(input.value);if(!target||read(target)===value)return;if(editing!==target){checkpoint();editing=target;}write(target,value);$(output).value=value+unit;draw();};
 input.oninput=preview;input.onchange=()=>{preview();editing=null;};input.onblur=input.onpointerdown=input.onpointercancel=()=>{editing=null;};
}
bindSlider('item-opacity',item,i=>(i.opacity??1)*100,(i,v)=>i.opacity=v/100,'opacity-output','%');
bindSlider('text-outline',()=>item()?.type==='text'?item():null,i=>i.outlineWidth??4,(i,v)=>i.outlineWidth=v,'text-outline-output');
for(const key of ['brightness','contrast','saturation'])bindSlider('image-'+key,()=>item()?.type==='image'?item():null,i=>i.effects?.[key]??100,(i,v)=>i.effects={...i.effects,[key]:v},key+'-output','%');
for(const [id,key] of [['watermark-size','watermarkSize'],['watermark-outline','watermarkOutline']])bindSlider(id,()=>scene,s=>s[key],(s,v)=>s[key]=v,id+'-output');
for(const [id,key] of [['flip-x','flipX'],['flip-y','flipY']])$(id).onclick=()=>{const i=item();if(!i)return;checkpoint();i[key]=!i[key];inspect();};
$('image-filter').onchange=e=>{const i=item();if(i?.type!=='image')return;checkpoint();i.effects={...i.effects,preset:e.target.value};draw();};
$('edit-font').onchange=async e=>{const i=item(),font=e.target.value;if(i?.type!=='text')return;await fontsReady;if(item()!==i)return;checkpoint();i.font=font;const text=makeText(i.text,font,i.color);i.w=text.w;i.h=text.h;inspect();};
for(const [id,key] of [['edit-color','color'],['edit-outline-color','outlineColor']])$(id).onchange=e=>{const i=item();if(i?.type!=='text')return;checkpoint();i[key]=e.target.value;draw();};
for(const [id,key] of [['watermark-font','watermarkFont'],['watermark-outline-color','watermarkOutlineColor']])$(id).onchange=async e=>{const value=e.target.value;await fontsReady;checkpoint();scene[key]=value;draw();syncFontPickers();};
for(const [id,direction] of [['frame-down',-1],['frame-up',1],['frame-back','back'],['frame-front','front']])$(id).onclick=()=>{checkpoint();scene.frameLayer=typeof direction==='string'?direction:Math.max(0,Math.min(scene.items.length+1,frameDepth(scene)+direction));draw();};
$('straighten').onclick=()=>{const i=item();if(!i||i.r===0)return;checkpoint();i.r=0;inspect();status('수평으로 맞췄어요.');};
$('quick-remove').onclick=()=>$('remove').click();$('quick-edit').onclick=()=>openPanel('inspector-panel');
new ResizeObserver(placeActions).observe(canvas.parentElement);
initControls();
initCrop({item,imageFor,checkpoint,inspect,status});
fontsReady.then(()=>draw());
sync();
