import { language } from './i18n.js';
const labels={ko:['번역보기','원문 보기','번역 중…','다시 번역하기'],en:['See translation','Show original','Translating…','Retry translation'],ja:['翻訳を見る','原文を見る','翻訳中…','再試行'],zh:['查看翻译','显示原文','翻译中…','重新翻译']};
async function directTranslation(text,source,target) {
  const chunks=[];let part='',bytes=0;
  for(const char of text){const size=new TextEncoder().encode(char).length;if(bytes+size>450){chunks.push(part);part='';bytes=0;}part+=char;bytes+=size;}
  if(part)chunks.push(part);
  const results=[],signal=AbortSignal.timeout(25000);
  for(const chunk of chunks){
    const url=new URL('https://api.mymemory.translated.net/get');
    url.searchParams.set('q',chunk);url.searchParams.set('langpair',(source==='zh'?'zh-CN':source)+'|'+(target==='zh'?'zh-CN':target));
    const response=await fetch(url,{signal,credentials:'omit',referrerPolicy:'no-referrer'}),data=await response.json();
    if(!response.ok||Number(data.responseStatus)!==200||typeof data.responseData?.translatedText!=='string')throw Error('Translation is temporarily unavailable.');
    results.push(data.responseData.translatedText);
  }
  return {text:results.join('')};
}
export function attachTranslation(node,kind,id,api) {
  if(!node?.textContent.trim()||node.dataset.translationReady)return;
  node.dataset.translationReady='true';
  const target=language(),words=labels[target]||labels.en;
  const text=node.textContent;
  const source=/[가-힣]/u.test(text)?'ko':/[ぁ-ゖァ-ヺ]/u.test(text)?'ja':/\p{Script=Han}/u.test(text)?'zh':'en';
  if(source===target)return;
  const controls=document.createElement('div');controls.className='translation-controls';controls.dataset.noTranslate='';
  const button=document.createElement('button');button.type='button';button.textContent=words[0];button.className='translation-toggle';
  button.title='MyMemory';button.setAttribute('aria-expanded','false');
  const output=document.createElement('p');output.className='translated-copy';output.dataset.userContent='';output.lang=target;output.hidden=true;
  const status=document.createElement('small');status.setAttribute('role','status');
  controls.append(button,status,output);node.after(controls);
  let loaded=false;
  button.onclick=async()=>{
    if(loaded){output.hidden=!output.hidden;button.textContent=output.hidden?words[0]:words[1];button.setAttribute('aria-expanded',String(!output.hidden));return;}
    button.disabled=true;button.textContent=words[2];status.textContent='';
    try{
      let data;
      try{data=await api('/translate?kind='+kind+'&id='+encodeURIComponent(id)+'&target='+target);}
      catch(error){
        if(!node.isConnected||error.status!==503)throw error;
        // The public provider supports CORS; use it only after an explicit request and server outage.
        data=await directTranslation(text,source,target);
      }
      if(!node.isConnected)return;
      // The provider can return encoded punctuation. Decode only as text, never as markup.
      const decoder=document.createElement('textarea');decoder.innerHTML=data.text.replace(/</g,'&lt;').replace(/>/g,'&gt;');
      output.textContent=decoder.value;output.hidden=false;loaded=true;
      button.textContent=words[1];button.setAttribute('aria-expanded','true');
      status.textContent='MyMemory · '+({ko:'자동 번역',en:'Machine translation',ja:'自動翻訳',zh:'机器翻译'}[target]||'Machine translation');
    }catch(error){button.textContent=words[3];status.textContent=error.message;}finally{button.disabled=false;}
  };
}
