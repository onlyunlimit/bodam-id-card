export const sizes = {portrait:[900,1200],square:[1000,1000],strip:[600,1800]};
export const fonts = {sans:'Arial, "Apple SD Gothic Neo", sans-serif',serif:'Georgia, serif',mono:'monospace'};
export function cloneScene(s) {return {...s,items:s.items.map(x=>({...x,key:x.key?{...x.key}:null})),strokes:s.strokes.map(x=>({...x,points:x.points.map(p=>({...p}))}))};}
export function localPoint(item,p) {const a=-item.r*Math.PI/180,dx=p.x-item.x,dy=p.y-item.y;return {x:(dx*Math.cos(a)-dy*Math.sin(a))/item.scale+item.w/2,y:(dx*Math.sin(a)+dy*Math.cos(a))/item.scale+item.h/2};}
export function contains(item,p) {const q=localPoint(item,p);return q.x>=0&&q.y>=0&&q.x<=item.w&&q.y<=item.h;}
export function transformFromPointers(item,start,current) {
 const midpoint=points=>({x:(points[0].x+points[1].x)/2,y:(points[0].y+points[1].y)/2});
 const distance=points=>Math.hypot(points[1].x-points[0].x,points[1].y-points[0].y);
 const angle=points=>Math.atan2(points[1].y-points[0].y,points[1].x-points[0].x);
 const from=midpoint(start),to=midpoint(current),turn=angle(current)-angle(start);
 const scale=Math.max(.1,Math.min(2.5,item.scale*distance(current)/Math.max(1,distance(start))));
 const factor=scale/item.scale,dx=item.x-from.x,dy=item.y-from.y;
 return {scale,r:((item.r+turn*180/Math.PI)%360+540)%360-180,
  x:to.x+(dx*Math.cos(turn)-dy*Math.sin(turn))*factor,
  y:to.y+(dx*Math.sin(turn)+dy*Math.cos(turn))*factor};
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
export function renderScene(canvas,s,{imageFor,selected=null,inkCanvas}={}) {
 canvas.width=s.width;canvas.height=s.height;const c=canvas.getContext('2d');c.fillStyle=s.paper;c.fillRect(0,0,s.width,s.height);
 if(s.frame==='scallop'){c.fillStyle='#e990b3';for(let x=0;x<s.width;x+=30){c.fillRect(x,0,15,18);c.fillRect(x,s.height-18,15,18);}for(let y=0;y<s.height;y+=30){c.fillRect(0,y,18,15);c.fillRect(s.width-18,y,18,15);}}
 if(s.frame==='film'){c.fillStyle='#251b24';c.fillRect(0,0,40,s.height);c.fillRect(s.width-40,0,40,s.height);c.fillStyle='#eee6d8';for(let y=20;y<s.height;y+=55){c.fillRect(11,y,18,30);c.fillRect(s.width-29,y,18,30);}}
 if(s.frame==='silver'){const g=c.createLinearGradient(0,0,s.width,s.height);g.addColorStop(0,'#eceef4');g.addColorStop(.4,'#727987');g.addColorStop(.65,'#f4f5ff');g.addColorStop(1,'#85838b');c.strokeStyle=g;c.lineWidth=30;c.strokeRect(15,15,s.width-30,s.height-30);}
 for(const item of s.items){c.save();c.translate(item.x,item.y);c.rotate(item.r*Math.PI/180);c.scale(item.scale,item.scale);if(item.type==='image')c.drawImage(imageFor(item),-item.w/2,-item.h/2,item.w,item.h);else{c.font=`bold ${item.fontSize}px ${fonts[item.font]}`;c.textBaseline='top';c.textAlign='center';c.lineJoin='round';c.lineWidth=4;c.strokeStyle='#fffaf6';c.fillStyle=item.color;item.text.split('\n').forEach((line,i)=>{const y=-item.h/2+i*item.fontSize*1.25;c.strokeText(line,0,y);c.fillText(line,0,y);});}if(selected===item.id){c.strokeStyle='#b63179';c.lineWidth=2/item.scale;c.setLineDash([8/item.scale,5/item.scale]);c.strokeRect(-item.w/2,-item.h/2,item.w,item.h);}c.restore();}
 if(inkCanvas){inkCanvas.width=s.width;inkCanvas.height=s.height;const ink=inkCanvas.getContext('2d');s.strokes.forEach(stroke=>drawStroke(ink,stroke));c.drawImage(inkCanvas,0,0);}
 if(s.watermarkOn&&s.watermark.trim()){let size=22;c.font=`${size}px ${fonts.sans}`;while(c.measureText(s.watermark).width>s.width-90&&size>10)c.font=`${--size}px ${fonts.sans}`;c.fillStyle=s.watermarkColor;c.textAlign='center';c.textBaseline='bottom';c.fillText(s.watermark,s.width/2,s.height-35,s.width-90);}
}
