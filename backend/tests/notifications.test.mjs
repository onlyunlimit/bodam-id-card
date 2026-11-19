import test from 'node:test';
import assert from 'node:assert/strict';
import {pushTo} from '../notifications.js';
test('Push encrypts messages with VAPID and removes expired subscriptions',async()=>{
 const signing=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
 const jwk=await crypto.subtle.exportKey('jwk',signing.privateKey);
 const receiver=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);
 const subscription={endpoint:'https://web.push.apple.com/test',keys:{p256dh:Buffer.from(await crypto.subtle.exportKey('raw',receiver.publicKey)).toString('base64url'),auth:Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64url')}};
 let removed=false;
 const env={VAPID_PUBLIC_KEY:Buffer.from(await crypto.subtle.exportKey('raw',signing.publicKey)).toString('base64url'),VAPID_PRIVATE_KEY:jwk.d,DB:{prepare:()=>({bind:()=>({run:async()=>{removed=true}})})}};
 const original=globalThis.fetch;
 try{
  globalThis.fetch=async(url,options)=>{assert.equal(url,subscription.endpoint);const h=new Headers(options.headers);assert.equal(h.get('Content-Encoding'),'aes128gcm');assert.match(h.get('Authorization'),/^vapid /);assert.ok(options.body.byteLength>32);assert.ok(!Buffer.from(options.body).includes(Buffer.from('private message')));assert.equal(options.redirect,'error');return new Response(null,{status:201});};
  assert.equal(await pushTo(env,{id:'x',endpoint:subscription.endpoint,subscription:JSON.stringify(subscription)},{body:'private message',url:'/admin'}),true);
  globalThis.fetch=async()=>new Response(null,{status:410});
  assert.equal(await pushTo(env,{id:'x',endpoint:subscription.endpoint,subscription:JSON.stringify(subscription)},{body:'private message'}),false);assert.equal(removed,true);
 }finally{globalThis.fetch=original;}
});
