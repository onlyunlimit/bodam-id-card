import { HTTPError } from './security.js';
const fail = () => { throw new HTTPError(400, '메타데이터를 제거할 수 없는 이미지입니다. JPG·PNG·WebP 링크를 사용해 주세요.'); };
const concat = (parts) => { const out=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let offset=0;for(const p of parts){out.set(p,offset);offset+=p.length;}return out; };
const ascii=(a)=>String.fromCharCode(...a);
// Allow only rendering chunks, not EXIF/XMP/comments/profiles or trailing payloads.
export function stripMetadata(input) {
 const a=new Uint8Array(input),v=new DataView(a.buffer,a.byteOffset,a.byteLength);let parts=[];
 if(a[0]===255&&a[1]===216){
  parts=[a.slice(0,2)];let p=2,ended=false;
  while(p<a.length){
   const start=p;if(a[p++]!==255)fail();while(a[p]===255)p++;
   const marker=a[p++];if(marker===217){parts.push(a.slice(start,p));ended=true;break;}
   if(marker===0||marker===216||marker===undefined)fail();
   if(p+2>a.length)fail();const len=v.getUint16(p);if(len<2||p+len>a.length)fail();const end=p+len;
   if(!(marker>=224&&marker<=239)&&marker!==254)parts.push(a.slice(start,end));p=end;
   if(marker===218){const scan=p;while(p<a.length){if(a[p]!==255){p++;continue;}let q=p+1;while(a[q]===255)q++;if(a[q]===0||(a[q]>=208&&a[q]<=215)){p=q+1;continue;}break;}parts.push(a.slice(scan,p));}
  }
  if(!ended)fail();return {mime:'image/jpeg',bytes:concat(parts)};
 }
 if(ascii(a.slice(1,4))==='PNG'&&a[0]===137){
  if(a.slice(0,8).join(',')!=='137,80,78,71,13,10,26,10')fail();parts=[a.slice(0,8)];let p=8,ended=false;
  while(p+12<=a.length){const n=v.getUint32(p),end=p+12+n;if(end>a.length)fail();const type=ascii(a.slice(p+4,p+8));if(['IHDR','PLTE','IDAT','IEND','tRNS','acTL','fcTL','fdAT'].includes(type))parts.push(a.slice(p,end));p=end;if(type==='IEND'){ended=true;break;}}
  if(!ended)fail();return {mime:'image/png',bytes:concat(parts)};
 }
 if(ascii(a.slice(0,4))==='RIFF'&&ascii(a.slice(8,12))==='WEBP'){
  let p=12;const end=v.getUint32(4,true)+8;if(end>a.length)fail();parts=[a.slice(0,12)];let pixels=false;
  while(p+8<=end){const type=ascii(a.slice(p,p+4)),n=v.getUint32(p+4,true),next=p+8+n+(n%2);if(next>end)fail();if(['VP8 ','VP8L','VP8X','ALPH','ANIM','ANMF'].includes(type)){const chunk=a.slice(p,next);if(type==='VP8X'){if(n<10)fail();chunk[8]&=~(0x20|0x08|0x04);}parts.push(chunk);if(['VP8 ','VP8L','ANMF'].includes(type))pixels=true;}p=next;}
  if(p!==end||!pixels)fail();const bytes=concat(parts);new DataView(bytes.buffer).setUint32(4,bytes.length-8,true);return {mime:'image/webp',bytes};
 }
 fail();
}
export function imageURL(value){
 let u;try{u=new URL(value);}catch{throw new HTTPError(400,'올바른 HTTPS 이미지 주소를 입력해 주세요.');}
 // No credentials, literal addresses or local/intranet targets. Redirects are revalidated.
 if(u.protocol!=='https:'||u.username||u.password||u.port||!u.hostname.includes('.')||/^[\d.]+$/.test(u.hostname)||/[\[\]:]/.test(u.hostname)||/\.(local|localhost|internal|test|invalid)$/.test(u.hostname))throw new HTTPError(400,'공개 HTTPS 이미지 주소를 입력해 주세요.');
 if(u.hostname==='cdn.caveduck.io'&&u.pathname.startsWith('/cdn-cgi/image/'))u.pathname=u.pathname.replace(/\/cdn-cgi\/image\/[^/]+\//,'/cdn-cgi/image/dpr=1,f=webp,w=1600,metadata=none/');
 return u.href;
}
export async function privateImageResponse(row){
 let input=row.data;
 if(row.url){
  let url=imageURL(row.url),response;
  for(let hop=0;hop<4;hop++){
   response=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(12000),headers:{Accept:'image/webp,image/png,image/jpeg'}});
   if([301,302,303,307,308].includes(response.status)){await response.body?.cancel();const target=response.headers.get('Location');if(!target)fail();url=imageURL(new URL(target,url).href);continue;}break;
  }
  if(!response?.ok)throw new HTTPError(502,'이미지 링크에 연결하지 못했습니다.');
  if(Number(response.headers.get('Content-Length'))>20*1024*1024){await response.body?.cancel();throw new HTTPError(400,'이미지는 20MB 이하 링크를 사용해 주세요.');}
  const reader=response.body.getReader(),chunks=[];let size=0;
  for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>20*1024*1024){await reader.cancel();throw new HTTPError(400,'이미지는 20MB 이하 링크를 사용해 주세요.');}chunks.push(value);}input=concat(chunks);
 }
 const {mime,bytes}=stripMetadata(input);
 return new Response(bytes,{headers:{'Content-Type':mime,'Content-Disposition':'inline','X-Content-Type-Options':'nosniff','Cache-Control':'no-store','Content-Security-Policy':"default-src 'none'"}});
}
