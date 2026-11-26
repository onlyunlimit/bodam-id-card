import catalogue from './music-assets.json' with {type:'json'};

const paths=new Set(Object.values(catalogue).map(item=>item.path));
export const audioPath=video=>catalogue[video]?.path||'';

// Public playback assets only. Never proxy a visitor-supplied URL or filesystem path.
export async function musicAudio(request,env){
 const url=new URL(request.url);
 if(!url.pathname.startsWith('/audio/'))return null;
 if(!['GET','HEAD'].includes(request.method))return new Response(null,{status:405,headers:{Allow:'GET, HEAD'}});
 if(!paths.has(url.pathname))return new Response(null,{status:404});
 if(!env.MUSIC_ASSETS)return new Response(null,{status:503});
 url.search='';
 const response=await env.MUSIC_ASSETS.fetch(new Request(url,request));
 const headers=new Headers(response.headers);
 if(response.ok){headers.set('Content-Type','audio/mpeg');headers.set('Cache-Control','public, max-age=31536000, immutable');headers.set('Accept-Ranges','bytes');}
 // The static asset binding may return 200 even for Range. Supply bounded
 // single-byte ranges ourselves so native Safari/Chrome media can seek.
 const range=request.headers.get('Range'),condition=request.headers.get('If-Range');
 if(request.method==='GET'&&response.status===200&&range&&(!condition||condition===headers.get('ETag')||condition===headers.get('Last-Modified'))){
  const data=await response.arrayBuffer(),size=data.byteLength,match=/^bytes=(\d*)-(\d*)$/.exec(range);
  let start=0,end=size-1;
  if(match){if(match[1]){start=Number(match[1]);if(match[2])end=Math.min(Number(match[2]),end);}else if(match[2])start=Math.max(0,size-Number(match[2]));}
  if(!match||(!match[1]&&!match[2])||!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>=size||start>end){
   headers.set('Content-Range',`bytes */${size}`);headers.delete('Content-Length');return new Response(null,{status:416,headers});
  }
  headers.set('Content-Range',`bytes ${start}-${end}/${size}`);headers.set('Content-Length',String(end-start+1));headers.delete('Content-Encoding');
  return new Response(data.slice(start,end+1),{status:206,headers});
 }
 return new Response(response.body,{status:response.status,headers});
}
