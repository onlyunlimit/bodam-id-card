export const sizes = {portrait:[900,1200],square:[1000,1000],strip:[600,1800]};
export const fonts = {sans:'Arial, "Apple SD Gothic Neo", sans-serif',serif:'Georgia, "AppleMyungjo", serif',mono:'monospace',jua:'"Jua", sans-serif',pen:'"Nanum Pen Script", cursive',brush:'"Nanum Brush Script", cursive',display:'"Do Hyeon", sans-serif'};
export const fontNames={sans:'깔끔한 고딕',serif:'클래식 세리프',mono:'타자기',jua:'동글동글 주아',pen:'나눔 손글씨 펜',brush:'나눔 손글씨 붓',display:'힘 있는 도현'};
export const fontStyle=(key,size)=>`${['jua','pen','brush','display'].includes(key)?400:700} ${size}px ${fonts[key]||fonts.sans}`;
export function cloneScene(s) {return {...s,items:s.items.map(x=>({...x,key:x.key?{...x.key}:null,crop:x.crop?{...x.crop}:null,effects:x.effects?{...x.effects}:null,erases:x.erases?.map(s=>({...s,points:s.points.map(p=>({...p}))}))})),strokes:s.strokes.map(x=>({...x,points:x.points.map(p=>({...p}))}))};}
export function localPoint(item,p) {const a=-item.r*Math.PI/180,dx=p.x-item.x,dy=p.y-item.y;return {x:(dx*Math.cos(a)-dy*Math.sin(a))/item.scale+item.w/2,y:(dx*Math.sin(a)+dy*Math.cos(a))/item.scale+item.h/2};}
export function contains(item,p) {const q=localPoint(item,p);return q.x>=0&&q.y>=0&&q.x<=item.w&&q.y<=item.h;}
export const snapHorizontal=degrees=>Math.abs(degrees)<=3?0:degrees;
export function transformFromPointers(item,start,current,snapToHorizontal=false) {
 const midpoint=points=>({x:(points[0].x+points[1].x)/2,y:(points[0].y+points[1].y)/2});
 const distance=points=>Math.hypot(points[1].x-points[0].x,points[1].y-points[0].y);
 const angle=points=>Math.atan2(points[1].y-points[0].y,points[1].x-points[0].x);
 const from=midpoint(start),to=midpoint(current);let turn=angle(current)-angle(start);
 const raw=((item.r+turn*180/Math.PI)%360+540)%360-180,r=snapToHorizontal?snapHorizontal(raw):raw;
 if(r!==raw)turn+=(r-raw)*Math.PI/180;
 const scale=Math.max(.1,item.scale*distance(current)/Math.max(1,distance(start)));
 const factor=scale/item.scale,dx=item.x-from.x,dy=item.y-from.y;
 return {scale,r,
  x:to.x+(dx*Math.cos(turn)-dy*Math.sin(turn))*factor,
  y:to.y+(dx*Math.sin(turn)+dy*Math.cos(turn))*factor};
}
export function itemBounds(i){
 const a=i.r*Math.PI/180,w=(Math.abs(Math.cos(a))*i.w+Math.abs(Math.sin(a))*i.h)*i.scale,h=(Math.abs(Math.sin(a))*i.w+Math.abs(Math.cos(a))*i.h)*i.scale;
 return {left:i.x-w/2,right:i.x+w/2,top:i.y-h/2,bottom:i.y+h/2,cx:i.x,cy:i.y};
}
export function snapItem(i,others,width,height,threshold){
 const b=itemBounds(i),boxes=others.filter(o=>o.id!==i.id).map(itemBounds);
 const xTargets=[0,width/2,width,...boxes.flatMap(b=>[b.left,b.cx,b.right])];
 const yTargets=[0,height/2,height,...boxes.flatMap(b=>[b.top,b.cy,b.bottom])];
 const nearest=(anchors,targets)=>{
  let best=null;for(const target of targets)for(const anchor of anchors){const delta=target-anchor;if(Math.abs(delta)<=threshold&&(!best||Math.abs(delta)<Math.abs(best.delta)))best={delta,target};}return best;
 };
 const x=nearest([b.left,b.cx,b.right],xTargets),y=nearest([b.top,b.cy,b.bottom],yTargets);
 return {x:i.x+(x?.delta||0),y:i.y+(y?.delta||0),guides:{x:x?.target,y:y?.target}};
}
export function colorPixels(data,e={}){
 const bright=(e.brightness??100)/100,contrast=(e.contrast??100)/100,saturation=(e.saturation??100)/100;
 for(let i=0;i<data.length;i+=4){
  let r=data[i],g=data[i+1],b=data[i+2];const gray=.2126*r+.7152*g+.0722*b;
  if(e.preset==='mono')r=g=b=gray;
  if(e.preset==='sepia'){const a=r,c=g,d=b;r=.393*a+.769*c+.189*d;g=.349*a+.686*c+.168*d;b=.272*a+.534*c+.131*d;}
  if(e.preset==='warm'){r*=1.1;b*=.88;}
  if(e.preset==='cool'){r*=.9;b*=1.12;}
  if(e.preset==='film'){r=r*.85+28;g=g*.85+20;b=b*.8+26;}
  const l=.2126*r+.7152*g+.0722*b;
  data[i]=((l+(r-l)*saturation-128)*contrast+128)*bright;
  data[i+1]=((l+(g-l)*saturation-128)*contrast+128)*bright;
  data[i+2]=((l+(b-l)*saturation-128)*contrast+128)*bright;
 }
 return data;
}
export function keyPixels(data,hex,tolerance) {
 const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
 for(let i=0;i<data.length;i+=4){const distance=Math.hypot(data[i]-rgb[0],data[i+1]-rgb[1],data[i+2]-rgb[2]);const factor=Math.max(0,Math.min(1,(distance-tolerance)/20));data[i+3]=Math.round(data[i+3]*factor);}
 return data;
}
export function drawStamp(ctx,x,y,size,kind,color) {ctx.save();ctx.fillStyle=color;ctx.translate(x,y);ctx.beginPath();if(kind==='heart'){ctx.moveTo(0,size*.42);ctx.bezierCurveTo(-size,-size*.1,-size*.3,-size*.7,0,-size*.15);ctx.bezierCurveTo(size*.3,-size*.7,size,-size*.1,0,size*.42);}else{for(let i=0;i<8;i++){const a=i*Math.PI/4;const r=i%2?size*.18:size*.6;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}}ctx.fill();ctx.restore();}
export function drawStroke(ctx,s) {
 ctx.save();ctx.globalCompositeOperation=s.tool==='eraser'?'destination-out':'source-over';ctx.globalAlpha=s.tool==='marker'?.35:1;ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=s.size;ctx.strokeStyle=s.color;ctx.fillStyle=s.color;
 if(s.tool==='neon'){ctx.shadowColor=s.color;ctx.shadowBlur=s.size;ctx.strokeStyle='#fff8fc';ctx.lineWidth=s.size*.45;}
 if(['sparkle','heart','dots'].includes(s.tool)){let last;for(const p of s.points){if(last&&Math.hypot(p.x-last.x,p.y-last.y)<s.size*1.2)continue;if(s.tool==='dots'){ctx.beginPath();ctx.arc(p.x,p.y,s.size/3,0,Math.PI*2);ctx.fill();}else drawStamp(ctx,p.x,p.y,s.size,s.tool,s.color);last=p;}}
 else{ctx.beginPath();ctx.moveTo(s.points[0].x,s.points[0].y);if(s.points.length===1)ctx.lineTo(s.points[0].x+.1,s.points[0].y);else s.points.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));ctx.stroke();}ctx.restore();
}
export function drawFrame(c,s){
 c.save();const {width:w,height:h,frame}=s;
 if(frame==='scallop'){c.fillStyle='#e990b3';for(let x=0;x<w;x+=30){c.fillRect(x,0,15,18);c.fillRect(x,h-18,15,18);}for(let y=0;y<h;y+=30){c.fillRect(0,y,18,15);c.fillRect(w-18,y,18,15);}}
 if(frame==='film'){c.fillStyle='#251b24';c.fillRect(0,0,40,h);c.fillRect(w-40,0,40,h);c.fillStyle='#eee6d8';for(let y=20;y<h;y+=55){c.fillRect(11,y,18,30);c.fillRect(w-29,y,18,30);}}
 if(frame==='silver'||frame==='gold'){const g=c.createLinearGradient(0,0,w,h);const colors=frame==='gold'?['#fff0b5','#987238','#fff3ce','#ba9959']:['#eceef4','#727987','#f4f5ff','#85838b'];[0,.4,.65,1].forEach((n,i)=>g.addColorStop(n,colors[i]));c.strokeStyle=g;c.lineWidth=30;c.strokeRect(15,15,w-30,h-30);}
 if(frame==='polaroid'){c.strokeStyle='#fffdf5';c.lineWidth=36;c.strokeRect(18,18,w-36,h-36);c.fillStyle='#fffdf5';c.fillRect(0,h-100,w,100);}
 if(frame==='postage'){c.strokeStyle='#b584a0';c.lineWidth=10;c.setLineDash([12,8]);c.strokeRect(14,14,w-28,h-28);c.setLineDash([]);c.lineWidth=2;c.strokeRect(32,32,w-64,h-64);}
 if(frame==='lace'){c.strokeStyle='#f3c8dd';c.lineWidth=20;c.strokeRect(10,10,w-20,h-20);c.strokeStyle='#fff9fc';c.lineWidth=4;const dot=(x,y)=>{c.beginPath();c.arc(x,y,12,0,Math.PI*2);c.stroke();};for(let x=18;x<w;x+=25){dot(x,12);dot(x,h-12);}for(let y=38;y<h-20;y+=25){dot(12,y);dot(w-12,y);}}
 if(frame==='hearts'||frame==='stars'){const color=frame==='hearts'?'#e77fa9':'#c5a152',kind=frame==='hearts'?'heart':'sparkle';c.strokeStyle=frame==='hearts'?'#f7d6e5':'#e9dcbd';c.lineWidth=3;c.strokeRect(18,18,w-36,h-36);for(let x=30;x<w;x+=65){drawStamp(c,x,20,24,kind,color);drawStamp(c,x,h-20,24,kind,color);}for(let y=70;y<h-40;y+=65){drawStamp(c,20,y,24,kind,color);drawStamp(c,w-20,y,24,kind,color);}}
 c.restore();
}
export function frameDepth(s){return s.frameLayer==='front'?s.items.length+1:s.frameLayer==='back'||s.frameLayer==null?0:Math.max(0,Math.min(s.items.length+1,Number(s.frameLayer)));}
export function renderScene(canvas,s,{imageFor,selected=null,inkCanvas,guides}={}) {
 canvas.width=s.width;canvas.height=s.height;const c=canvas.getContext('2d');c.fillStyle=s.paper;c.fillRect(0,0,s.width,s.height);
 const depth=frameDepth(s);
 for(let n=0;n<=s.items.length;n++){
  if(n===depth)drawFrame(c,s);
  const i=s.items[n];if(!i)continue;
  c.save();c.translate(i.x,i.y);c.rotate(i.r*Math.PI/180);c.scale(i.scale*(i.flipX?-1:1),i.scale*(i.flipY?-1:1));c.globalAlpha=i.opacity??1;
  if(i.type==='image'){
   const source=imageFor(i),crop=i.crop||{x:0,y:0,w:1,h:1};
   c.drawImage(source,crop.x*source.width,crop.y*source.height,crop.w*source.width,crop.h*source.height,-i.w/2,-i.h/2,i.w,i.h);
  }else{
   c.font=fontStyle(i.font,i.fontSize);c.textBaseline='top';c.textAlign='center';c.lineJoin='round';c.lineWidth=i.outlineWidth??4;c.strokeStyle=i.outlineColor||'#fffaf6';c.fillStyle=i.color;
   i.text.split('\n').forEach((line,n)=>{const y=-i.h/2+n*i.fontSize*1.25;if(c.lineWidth>0&&(i.outlineWidth??4)>0)c.strokeText(line,0,y);c.fillText(line,0,y);});
  }
  c.restore();
 }
 if(inkCanvas){inkCanvas.width=s.width;inkCanvas.height=s.height;const ink=inkCanvas.getContext('2d');s.strokes.forEach(stroke=>drawStroke(ink,stroke));c.drawImage(inkCanvas,0,0);}
 if(depth===s.items.length+1)drawFrame(c,s);
 if(s.watermarkOn&&s.watermark.trim()){
  let size=s.watermarkSize||22;const font=s.watermarkFont||'sans';c.font=fontStyle(font,size);
  while(c.measureText(s.watermark).width>s.width-90&&size>10)c.font=fontStyle(font,--size);
  c.fillStyle=s.watermarkColor;c.textAlign='center';c.textBaseline='bottom';c.lineJoin='round';
  if(s.watermarkOutline>0){c.strokeStyle=s.watermarkOutlineColor||'#ffffff';c.lineWidth=s.watermarkOutline;c.strokeText(s.watermark,s.width/2,s.height-35,s.width-90);}
  c.fillText(s.watermark,s.width/2,s.height-35,s.width-90);
 }
 const active=s.items.find(i=>i.id===selected);
 if(active){c.save();c.translate(active.x,active.y);c.rotate(active.r*Math.PI/180);c.strokeStyle='#b63179';c.lineWidth=2;c.setLineDash([8,5]);c.strokeRect(-active.w*active.scale/2,-active.h*active.scale/2,active.w*active.scale,active.h*active.scale);c.restore();}
 if(guides){c.save();c.strokeStyle='#008f9f';c.lineWidth=2;c.setLineDash([8,6]);for(const axis of ['x','y'])if(guides[axis]!=null){c.beginPath();if(axis==='x'){c.moveTo(guides.x,0);c.lineTo(guides.x,s.height);}else{c.moveTo(0,guides.y);c.lineTo(s.width,guides.y);}c.stroke();}c.restore();}
}
