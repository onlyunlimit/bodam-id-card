import { HTTPError, digest } from './security.js';
export function sourceLanguage(text) {
  if (/[가-힣]/u.test(text)) return 'ko';
  if (/[ぁ-ゖァ-ヺ]/u.test(text)) return 'ja';
  if (/\p{Script=Han}/u.test(text)) return 'zh-CN';
  return 'en';
}
export function translationChunks(text) {
  const chunks=[];let part='',bytes=0;
  for(const char of text) {
    const size=new TextEncoder().encode(char).length;
    if(bytes+size>450){chunks.push(part);part='';bytes=0;}
    part+=char;bytes+=size;
  }
  if(part)chunks.push(part);
  return chunks;
}
export async function translationAPI(request,env,{identity,rate}) {
  const url=new URL(request.url);
  if(url.pathname!=='/translate'||request.method!=='GET')return null;
  const kind=url.searchParams.get('kind'),id=url.searchParams.get('id'),target=url.searchParams.get('target');
  if(!['post','comment'].includes(kind)||!['ko','en','ja','zh'].includes(target)||!/^[a-f0-9-]{36}$/.test(id||''))throw new HTTPError(400,'번역 대상을 확인해 주세요.');
  const {hash}=await identity(request,env);await rate(env,'translation-read:'+hash,60,60);
  const row=kind==='post'
    ?await env.DB.prepare('SELECT body FROM posts WHERE id=? AND hidden=0 AND deleted_at IS NULL').bind(id).first()
    :await env.DB.prepare(`SELECT c.body FROM comments c JOIN posts p ON p.id=c.post_id WHERE c.id=? AND c.hidden=0 AND c.deleted_at IS NULL AND p.hidden=0 AND p.deleted_at IS NULL AND (c.parent_id IS NULL OR EXISTS(SELECT 1 FROM comments root WHERE root.id=c.parent_id AND root.hidden=0 AND root.deleted_at IS NULL))`).bind(id).first();
  if(!row)throw new HTTPError(404,'번역할 글이 없습니다.');
  const source=sourceLanguage(row.body),to=target==='zh'?'zh-CN':target;
  if(source===to||!row.body.trim())return Response.json({text:row.body,source,target});
  // Read visibility before every cache lookup. Only explicitly requested public text is sent.
  const cache=globalThis.caches?.default;
  const key=new Request(url.origin+'/translation-cache/'+await digest(source+'|'+to+'|'+row.body));
  const cached=await cache?.match(key);if(cached)return cached;
  await rate(env,'translation:'+hash,20,3600);
  const translated=[];
  const timeout=AbortSignal.timeout(25000);
  for(const chunk of translationChunks(row.body)) {
    const endpoint=new URL('https://api.mymemory.translated.net/get');
    endpoint.searchParams.set('q',chunk);endpoint.searchParams.set('langpair',source+'|'+to);
    let response;
    try {response=await fetch(endpoint,{signal:timeout});}catch{throw new HTTPError(503,'번역 서비스에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.');}
    const data=await response.json().catch(()=>null);
    if(!response.ok||Number(data?.responseStatus)!==200||typeof data?.responseData?.translatedText!=='string')throw new HTTPError(503,'번역 서비스의 사용량 한도 또는 연결 문제입니다. 원문은 그대로 볼 수 있습니다.');
    translated.push(data.responseData.translatedText);
  }
  const result=Response.json({text:translated.join(''),source,target,provider:'MyMemory'},{headers:{'Cache-Control':'public, max-age=86400'}});
  await cache?.put(key,result.clone());return result;
}
