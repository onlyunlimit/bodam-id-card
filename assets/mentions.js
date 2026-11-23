// Shared by the public composer and the authenticated administrator composer.
export function mentionMarkup(value, members, linked = true) {
  const escape = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const names = [...members].filter(m => m.name).sort((a,b) => b.name.length-a.name.length);
  const text = String(value ?? '');
  let out = '', at = 0;
  const re = /(^|[^\p{L}\p{N}_@])@/gu;
  for (const hit of text.matchAll(re)) {
    const start = hit.index + hit[1].length;
    if (start < at) continue;
    const m = names.find(m => text.startsWith(m.name,start+1) && !/[\p{L}\p{N}_]/u.test(text[start+1+m.name.length] || ''));
    if (!m) continue;
    out += escape(text.slice(at,start));
    const label = escape('@'+m.name);
    out += linked ? '<a class="member-mention" href="community.html?board='+encodeURIComponent(m.board||'staff')+'&member='+encodeURIComponent(m.id)+'">'+label+'</a>' : '<span class="member-mention">'+label+'</span>';
    at = start + 1 + m.name.length;
  }
  return out + escape(text.slice(at));
}
export function attachMentions(field, getMembers) {
  if (!field || field.dataset.mentions) return;
  field.dataset.mentions='true';
  const locale=(document.documentElement.lang||'ko').slice(0,2);
  const words={ko:['멤버 언급','@이름으로 멤버 언급','일치하는 멤버가 없습니다.'],en:['Mention a member','Mention a member with @name','No matching members.'],ja:['メンバーをメンション','@名前でメンション','該当するメンバーはいません。'],zh:['提及成员','输入 @姓名 提及成员','没有匹配的成员。']}[locale]||['Mention a member','Mention a member with @name','No matching members.'];
  const list=document.createElement('div');list.className='mention-suggestions';list.hidden=true;
  list.id='mentions-'+crypto.randomUUID();list.setAttribute('role','listbox');list.setAttribute('aria-label',words[0]);list.dataset.noTranslate='';
  const hint=document.createElement('small');hint.textContent=words[1];hint.id=list.id+'-hint';hint.className='mention-hint';
  field.after(hint,list);field.setAttribute('aria-controls',list.id);field.setAttribute('aria-autocomplete','list');field.setAttribute('aria-expanded','false');
  field.setAttribute('aria-describedby',((field.getAttribute('aria-describedby')||'')+' '+hint.id).trim());
  let matches=[],active=0,token=null,composing=false;
  const close=()=>{list.hidden=true;field.setAttribute('aria-expanded','false');field.removeAttribute('aria-activedescendant');};
  function mark(){[...list.children].forEach((b,i)=>{b.setAttribute('aria-selected',String(i===active));});if(matches.length){field.setAttribute('aria-activedescendant',list.children[active].id);const option=list.children[active];const top=option.offsetTop-list.firstElementChild.offsetTop;if(top<list.scrollTop)list.scrollTop=top;else if(top+option.offsetHeight>list.scrollTop+list.clientHeight)list.scrollTop=top+option.offsetHeight-list.clientHeight;}}
  function choose(i){if(!token||!matches[i])return;const insert='@'+matches[i].name+' ';const value=field.value.slice(0,token.start)+insert+field.value.slice(token.end);if(field.maxLength>0&&value.length>field.maxLength)return;field.value=value;field.focus({preventScroll:true});field.setSelectionRange(token.start+insert.length,token.start+insert.length);close();field.dispatchEvent(new Event('input',{bubbles:true}));}
  function refresh(){if(composing||field.selectionStart!==field.selectionEnd){close();return;}const end=field.selectionStart;const hit=field.value.slice(0,end).match(/(?:^|[\s([{])@([^\s@]{0,24})$/u);if(!hit){close();return;}token={start:end-hit[1].length-1,end};const query=hit[1].toLocaleLowerCase();matches=getMembers().filter(m=>[m.name,m.code,m.id].some(v=>String(v||'').toLocaleLowerCase().includes(query))).slice(0,12);active=0;list.replaceChildren();list.hidden=false;field.setAttribute('aria-expanded','true');if(!matches.length){const empty=document.createElement('small');empty.textContent=words[2];list.append(empty);field.removeAttribute('aria-activedescendant');return;}matches.forEach((m,i)=>{const b=document.createElement('button');b.type='button';b.tabIndex=-1;b.id=list.id+'-'+i;b.setAttribute('role','option');b.textContent='@'+m.name+' · '+(m.team||m.board||'SGIA').toUpperCase();b.onpointerdown=e=>{if(e.pointerType!=='touch')e.preventDefault();};b.onclick=e=>{e.preventDefault();e.stopPropagation();choose(i);};list.append(b);});mark();}
  field.addEventListener('input',refresh);field.addEventListener('click',refresh);
  field.addEventListener('compositionstart',()=>{composing=true;close();});field.addEventListener('compositionend',()=>{composing=false;refresh();});
  field.addEventListener('keydown',e=>{if(composing||e.isComposing||e.keyCode===229||list.hidden)return;if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();}else if(matches.length&&['ArrowDown','ArrowUp','Enter','Tab'].includes(e.key)){e.preventDefault();if(e.key==='Enter'||e.key==='Tab')choose(active);else{active=(active+(e.key==='ArrowDown'?1:-1)+matches.length)%matches.length;mark();}}});
  field.addEventListener('blur',()=>{setTimeout(()=>{if(!list.contains(document.activeElement)&&document.activeElement!==field)close();},150);});
  // Suggestions may live inside the field's label. Do not let a label's synthetic click reset the caret.
  list.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();});
}
export const mentionCSS = `.mention-suggestions{display:grid;gap:3px;max-height:220px;overflow:auto;padding:6px;border:1px solid currentColor;border-radius:10px;background:var(--surface,#182638);color:var(--text,#edf2f8);width:100%;box-sizing:border-box}.mention-suggestions[hidden]{display:none}.mention-suggestions button{display:block;text-align:left;white-space:normal;font:inherit;font-size:13px;padding:9px 12px;background:transparent;color:inherit;border:0;border-radius:6px}.mention-suggestions [aria-selected=true]{background:var(--text,#edf2f8);color:var(--surface,#182638)}.mention-hint{display:block;font-size:12px;opacity:.85}.member-mention{font-weight:700;color:inherit;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:3px}`;
