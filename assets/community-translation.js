import { language } from './i18n.js';
const labels={ko:['번역보기','원문 보기','번역 중…','다시 번역하기'],en:['See translation','Show original','Translating…','Retry translation'],ja:['翻訳を見る','原文を見る','翻訳中…','再試行'],zh:['查看翻译','显示原文','翻译中…','重新翻译']};
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
      const data=await api('/translate?kind='+kind+'&id='+encodeURIComponent(id)+'&target='+target);
      if(!node.isConnected)return;
      // The provider can return encoded punctuation. Decode only as text, never as markup.
      const decoder=document.createElement('textarea');decoder.innerHTML=data.text.replace(/</g,'&lt;').replace(/>/g,'&gt;');
      output.textContent=decoder.value;output.hidden=false;loaded=true;
      button.textContent=words[1];button.setAttribute('aria-expanded','true');
      status.textContent='MyMemory · '+({ko:'자동 번역',en:'Machine translation',ja:'自動翻訳',zh:'机器翻译'}[target]||'Machine translation');
    }catch(error){button.textContent=words[3];status.textContent=error.message;}finally{button.disabled=false;}
  };
}
