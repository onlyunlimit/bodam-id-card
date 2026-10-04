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
test('Pinch scale stays within slider limits, including coincident fingers',()=>{
 const i={x:0,y:0,scale:1,r:170},start=[{x:-10,y:0},{x:10,y:0}];
 assert.equal(transformFromPointers(i,start,[{x:-100,y:0},{x:100,y:0}]).scale,2.5);
 assert.equal(transformFromPointers(i,start,[{x:0,y:0},{x:0,y:0}]).scale,.1);
 for(const value of Object.values(transformFromPointers(i,[{x:0,y:0},{x:0,y:0}],start)))assert.ok(Number.isFinite(value));
});
