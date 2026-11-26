import test from 'node:test';
import assert from 'node:assert/strict';
import {musicAudio,audioPath} from '../music-audio.js';
import {playlistAPI} from '../playlists.js';

test('Only catalogued public audio assets are served, preserving ranges and HEAD',async()=>{
 const path=audioPath('KBtk5FUeJbk');let calls=0;
 const env={MUSIC_ASSETS:{fetch:async req=>{calls++;assert.equal(new URL(req.url).search,'');assert.equal(new URL(req.url).pathname,path);assert.equal(req.headers.get('range'),'bytes=0-99');return new Response(req.method==='HEAD'?null:new Uint8Array(100),{status:206,headers:{'Content-Range':'bytes 0-99/1000','Content-Length':'100'}});}}};
 for(const method of ['GET','HEAD']){
  const res=await musicAudio(new Request('https://api.example'+path+'?cache=1',{method,headers:{Range:'bytes=0-99'}}),env);
  assert.equal(res.status,206);assert.equal(res.headers.get('Content-Type'),'audio/mpeg');assert.equal(res.headers.get('Content-Range'),'bytes 0-99/1000');assert.match(res.headers.get('Cache-Control'),/immutable/);
 }
 assert.equal((await musicAudio(new Request('https://api.example/audio/unknown.mp3'),env)).status,404);
 assert.equal((await musicAudio(new Request('https://api.example'+path,{method:'POST'}),env)).status,405);
 assert.equal((await musicAudio(new Request('https://api.example'+path),{})).status,503);
 assert.equal(await musicAudio(new Request('https://api.example/admin'),env),null);assert.equal(calls,2);
});
test('Audio enrichment leaves stored queues untouched and unprepared songs on YouTube',async()=>{
 const tracks=[{title:'Ready',video_id:'KBtk5FUeJbk'},{title:'Other',video_id:'abcdefghijk'}];const row={id:'mix',tracks:JSON.stringify(tracks)};
 const env={DB:{prepare:()=>({all:async()=>({results:[row]})})},MUSIC_ASSETS:{}};
 const response=await playlistAPI(new Request('https://api.example/playlists'),env,{});const actual=(await response.json()).playlists[0].tracks;
 assert.equal(actual[0].audio_url,'https://api.example'+audioPath('KBtk5FUeJbk'));assert.equal(actual[1].audio_url,undefined);assert.equal(row.tracks,JSON.stringify(tracks));
 delete env.MUSIC_ASSETS;
 assert.equal((await (await playlistAPI(new Request('https://api.example/playlists'),env,{})).json()).playlists[0].tracks[0].audio_url,undefined);
});

test('Static binding full responses become seekable byte ranges with valid bounds',async()=>{
 const url='https://api.example'+audioPath('KBtk5FUeJbk');
 const env={MUSIC_ASSETS:{fetch:async()=>new Response('abcdefghij',{headers:{ETag:'"asset"','Content-Length':'10'}})}};
 for(const [range,text,contentRange] of [['bytes=2-5','cdef','bytes 2-5/10'],['bytes=7-','hij','bytes 7-9/10'],['bytes=-3','hij','bytes 7-9/10'],['bytes=8-99','ij','bytes 8-9/10']]){
  const r=await musicAudio(new Request(url,{headers:{Range:range}}),env);assert.equal(r.status,206);assert.equal(r.headers.get('Content-Range'),contentRange);assert.equal(await r.text(),text);
 }
 for(const range of ['bytes=20-','bytes=5-2','bytes=-0','bytes=-','bytes=0-1,3-4']){
  const r=await musicAudio(new Request(url,{headers:{Range:range}}),env);assert.equal(r.status,416);assert.equal(r.headers.get('Content-Range'),'bytes */10');
 }
 const full=await musicAudio(new Request(url,{headers:{Range:'bytes=2-5','If-Range':'"old"'}}),env);assert.equal(full.status,200);assert.equal(await full.text(),'abcdefghij');
});
