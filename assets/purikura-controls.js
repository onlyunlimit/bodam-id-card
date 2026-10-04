import {fonts,fontNames,fontStyle} from './purikura-engine.js';
const $=id=>document.getElementById(id),mobile=matchMedia('(max-width:1100px)');
let opened=null,opener=null;
export function closePanels(){
 if(opened){opened.classList.remove('is-open');opened.removeAttribute('role');opened.removeAttribute('aria-modal');}
 opened=null;document.body.classList.remove('panel-open');$('panel-backdrop').hidden=true;
 document.querySelectorAll('[data-open-panel]').forEach(b=>b.setAttribute('aria-expanded','false'));
}
export function openPanel(id){
 if(!mobile.matches){$(id).scrollIntoView({block:'nearest'});return;}const panel=$(id);if(opened===panel){closePanels();return;}
 closePanels();opened=panel;panel.classList.add('is-open');panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');document.body.classList.add('panel-open');$('panel-backdrop').hidden=false;
 opener=document.querySelector(`[data-open-panel="${id}"]`);opener?.setAttribute('aria-expanded','true');panel.querySelector('[data-close-panel]')?.focus();
}
export function syncFontPickers(){
 document.querySelectorAll('[data-font-picker]').forEach(grid=>{const select=$(grid.dataset.fontPicker);grid.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.font===select.value)));});
}
export function initControls(){
 document.querySelectorAll('[data-open-panel]').forEach(b=>b.onclick=()=>openPanel(b.dataset.openPanel));
 document.querySelectorAll('[data-close-panel]').forEach(b=>b.onclick=()=>{closePanels();opener?.focus();});
 $('panel-backdrop').onclick=()=>closePanels();mobile.addEventListener('change',closePanels);
 document.addEventListener('keydown',e=>{
  if(!opened||$('crop-dialog').open)return;
  if(e.key==='Escape'){closePanels();opener?.focus();}
  if(e.key==='Tab'){
   const controls=[...opened.querySelectorAll('button,input,select,textarea,summary,a[href]')].filter(e=>!e.disabled&&e.getClientRects().length);
   const first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
  }
 });
 document.querySelectorAll('[data-font-picker]').forEach(grid=>{
  const select=$(grid.dataset.fontPicker);select.replaceChildren(...Object.entries(fontNames).map(([id,name])=>new Option(name,id)));
  for(const [key,name] of Object.entries(fontNames)){
   const button=document.createElement('button');button.type='button';button.dataset.font=key;
   const label=document.createElement('small');label.textContent=name;const sample=document.createElement('span');sample.textContent='오늘의 우리';sample.style.fontFamily=fonts[key];sample.style.fontWeight=['sans','serif','mono'].includes(key)?700:400;
   button.append(label,sample);button.onclick=()=>{select.value=key;select.dispatchEvent(new Event('change',{bubbles:true}));syncFontPickers();};grid.append(button);
  }
  select.addEventListener('change',syncFontPickers);
 });
 document.querySelectorAll('input[type=range]').forEach(input=>{
  const label=input.closest('label'),name=label?.firstChild?.textContent.trim()||input.id;
  const row=document.createElement('div');row.className='range-stepper';input.before(row);
  for(const direction of [-1,1]){
   const button=document.createElement('button');button.type='button';button.textContent=direction<0?'−':'+';button.setAttribute('aria-label',name+(direction<0?' 줄이기':' 늘리기'));
   button.onclick=e=>{e.preventDefault();const old=input.value;direction<0?input.stepDown():input.stepUp();if(input.value!==old){input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));}};
   row.append(button);if(direction===-1)row.append(input);
  }
 });
 syncFontPickers();
}
export const fontsReady=Promise.allSettled(['jua','pen','brush','display'].map(key=>document.fonts.load(fontStyle(key,24))));
