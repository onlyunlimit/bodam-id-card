import {closePanels} from './purikura-controls.js';
const $=id=>document.getElementById(id);
export function initCrop({item,imageFor,checkpoint,inspect,status}){
 const dialog=$('crop-dialog'),canvas=$('crop-canvas');let target=null,rect=null,source=null,drag=null;
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 const sync=()=>{for(const [id,key] of [['left','x'],['top','y'],['width','w'],['height','h']])$('crop-'+id).value=Math.round(rect[key]*100);};
 const paint=()=>{
  canvas.width=source.width;canvas.height=source.height;canvas.style.setProperty('--crop-ratio',source.width/source.height);
  const c=canvas.getContext('2d'),x=rect.x*canvas.width,y=rect.y*canvas.height,w=rect.w*canvas.width,h=rect.h*canvas.height;
  c.drawImage(source,0,0);c.fillStyle='#160914aa';c.fillRect(0,0,canvas.width,y);c.fillRect(0,y+h,canvas.width,canvas.height-y-h);c.fillRect(0,y,x,h);c.fillRect(x+w,y,canvas.width-x-w,h);
  c.strokeStyle='#fff';c.lineWidth=Math.max(2,source.width/300);c.setLineDash([c.lineWidth*3,c.lineWidth*2]);c.strokeRect(x,y,w,h);
 };
 const open=()=>{const i=item();if(i?.type!=='image')return;target=i;rect={...(i.crop||{x:0,y:0,w:1,h:1})};source=imageFor(i);closePanels();dialog.showModal();sync();paint();};
 $('crop-open').onclick=$('quick-crop').onclick=open;
 $('crop-cancel').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{if(!dialog.open){drag=null;target=null;}});
 $('crop-reset').onclick=()=>{rect={x:0,y:0,w:1,h:1};sync();paint();};
 for(const [id,key] of [['left','x'],['top','y'],['width','w'],['height','h']])$('crop-'+id).onchange=e=>{
  rect[key]=Number(e.target.value)/100;rect.x=clamp(rect.x,0,.98);rect.y=clamp(rect.y,0,.98);rect.w=clamp(rect.w,.02,1-rect.x);rect.h=clamp(rect.h,.02,1-rect.y);sync();paint();
 };
 const point=e=>{const r=canvas.getBoundingClientRect();return {x:clamp((e.clientX-r.left)/r.width,0,1),y:clamp((e.clientY-r.top)/r.height,0,1)};};
 canvas.onpointerdown=e=>{if(e.button!==0||drag)return;e.preventDefault();drag={id:e.pointerId,start:point(e)};canvas.setPointerCapture(e.pointerId);};
 canvas.onpointermove=e=>{if(!drag||drag.id!==e.pointerId)return;const p=point(e),start=drag.start;rect={x:Math.min(start.x,p.x,.98),y:Math.min(start.y,p.y,.98),w:Math.max(.02,Math.abs(start.x-p.x)),h:Math.max(.02,Math.abs(start.y-p.y))};rect.w=Math.min(rect.w,1-rect.x);rect.h=Math.min(rect.h,1-rect.y);sync();paint();};
 const finish=e=>{if(drag?.id!==e.pointerId)return;drag=null;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);};
 canvas.onpointerup=canvas.onpointercancel=canvas.onlostpointercapture=finish;
 $('crop-apply').onclick=()=>{if(!target||item()!==target)return dialog.close();checkpoint();const previous=target.crop||{w:1,h:1};target.w*=rect.w/previous.w;target.h*=rect.h/previous.h;target.crop={...rect};dialog.close();inspect();status('잘랐어요. 사진 편집의 자르기 복원으로 원본을 다시 볼 수 있어요.');};
 $('crop-restore').onclick=()=>{const i=item();if(i?.type!=='image'||!i.crop)return;checkpoint();i.w/=i.crop.w;i.h/=i.crop.h;delete i.crop;inspect();};
}
