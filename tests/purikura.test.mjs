import test from 'node:test';import assert from 'node:assert/strict';
import {keyPixels,localPoint,contains,cloneScene,transformFromPointers} from '../assets/purikura-engine.js';
test('Chroma key removes chosen color, preserves different colors and existing transparency',()=>{const p=new Uint8ClampedArray([0,255,0,255,255,0,0,255,0,0,255,0]);keyPixels(p,'#00ff00',45);assert.deepEqual([...p],[0,255,0,0,255,0,0,255,0,0,255,0]);});
test('Rotated and scaled photo hit testing maps back to source pixels',()=>{const i={x:200,y:200,w:100,h:200,scale:2,r:90};assert.deepEqual(localPoint(i,{x:200,y:200}),{x:50,y:100});assert.equal(contains(i,{x:350,y:200}),true);assert.equal(contains(i,{x:200,y:350}),false);});
test('History snapshots isolate strokes and chroma settings',()=>{const s={items:[{key:{color:'#000000'}}],strokes:[{points:[{x:1,y:2}]}]};const copy=cloneScene(s);copy.items[0].key.color='#ffffff';copy.strokes[0].points[0].x=99;assert.equal(s.items[0].key.color,'#000000');assert.equal(s.strokes[0].points[0].x,1);});

test('Two-finger transform scales and rotates around the fingers, preserving the anchor',()=>{
 const i={x:60,y:50,scale:1,r:0};
 const next=transformFromPointers(i,[{x:40,y:50},{x:60,y:50}],[{x:100,y:80},{x:100,y:120}]);
 assert.equal(next.scale,2);assert.equal(next.r,90);assert.equal(next.x,100);assert.equal(next.y,120);
});
test('Pinch has no enlargement cap and handles coincident fingers',()=>{
 const i={x:0,y:0,scale:1,r:170},start=[{x:-10,y:0},{x:10,y:0}];
 assert.equal(transformFromPointers(i,start,[{x:-100,y:0},{x:100,y:0}]).scale,10);
 assert.equal(transformFromPointers(i,start,[{x:0,y:0},{x:0,y:0}]).scale,.1);
 for(const value of Object.values(transformFromPointers(i,[{x:0,y:0},{x:0,y:0}],start)))assert.ok(Number.isFinite(value));
});

test('Alignment snaps rotated bounds to paper and other elements',async()=>{
 const {snapItem}=await import('../assets/purikura-engine.js');
 const i={id:'a',x:447,y:100,w:100,h:100,scale:1,r:0};
 assert.equal(snapItem(i,[],900,1200,6).x,450);
 assert.equal(snapItem({...i,x:53},[],900,1200,6).x,50);
 const other={...i,id:'b',x:200};
 assert.equal(snapItem({...i,x:302},[other],900,1200,6).x,300);
 assert.equal(snapItem({...i,x:350},[],900,1200,6).x,350);
});
test('Color treatment keeps alpha and history isolates crop and effect settings',async()=>{
 const {colorPixels}=await import('../assets/purikura-engine.js');
 const pixels=new Uint8ClampedArray([240,20,50,90]);colorPixels(pixels,{preset:'mono'});
 assert.equal(pixels[0],pixels[1]);assert.equal(pixels[1],pixels[2]);assert.equal(pixels[3],90);
 const s={items:[{crop:{x:0,w:1},effects:{brightness:100}}],strokes:[]},copy=cloneScene(s);
 copy.items[0].crop.w=.5;copy.items[0].effects.brightness=70;
 assert.equal(s.items[0].crop.w,1);assert.equal(s.items[0].effects.brightness,100);
});

test('Horizontal snapping uses a small tolerance and keeps the pinch anchor coherent',async()=>{
 const {snapHorizontal}=await import('../assets/purikura-engine.js');
 assert.equal(snapHorizontal(3),0);assert.equal(snapHorizontal(-2),0);assert.equal(snapHorizontal(4),4);
 const start=[{x:-10,y:0},{x:10,y:0}],angle=2*Math.PI/180,current=start.map(p=>({x:p.x*Math.cos(angle),y:p.x*Math.sin(angle)}));
 const i={x:0,y:10,r:0,scale:1},snapped=transformFromPointers(i,start,current,true),free=transformFromPointers(i,start,current);
 assert.equal(snapped.r,0);assert.ok(Math.abs(snapped.x)<1e-10);assert.ok(Math.abs(snapped.y-10)<1e-10);assert.ok(Math.abs(free.r-2)<1e-10);
});

test('Eraser history isolates per-image masks and stroke points',()=>{const s={items:[{erases:[{size:.1,points:[{x:.2,y:.3}]}]}],strokes:[]},copy=cloneScene(s);copy.items[0].erases[0].points[0].x=.9;assert.equal(s.items[0].erases[0].points[0].x,.2);});
