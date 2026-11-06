import './blackjack-i18n.js';
import {characters} from './characters.js';
import {esc} from './runtime.js';
import {registerCopy} from './i18n.js';
[
 ['블랙잭','Blackjack','ブラックジャック','黑杰克'],
 ['대테러부대','Counter-terror unit','対テロ部隊','反恐部队'],
 ['작전 일정에 따라 운용','Mission-based operations','作戦日程に応じて運用','按任务安排运行'],
 ['자율 협력 대상','Independent associate','自律協力対象','自主协作者'],
 ['등록 요원','Registered personnel','登録隊員','登记队员'],
 ['미공개','Undisclosed','非公開','未公开'],
 ['커뮤니티 프로필 · 피드 ↗','Community profile · Feed ↗','コミュニティプロフィール・フィード ↗','社区资料 · 动态 ↗'],
].forEach(row=>registerCopy(...row));
const portrait=(id)=>characters.find(c=>c.id===id);
const photo=(c)=>`<div class="team-hero-photo" role="img" aria-label="${esc(c.name)}" style="background-image:url(&quot;${c.portrait}&quot;)"></div>`;
export function teamHero(t,location,status){
 const people=characters.filter(c=>c.team===t.id&&!c.affiliation),title=`<span class="team-division">SGIA / ${esc(t.department)}</span><h2>${t.en}</h2><p class="team-motto">${esc(t.description)}</p>`;
 const copy=`<p class="team-description">${esc(t.staff)}</p><div class="unit-meta"><span>${esc(location)}</span>${status}</div>`;
 if(t.id==='blackjack')return `<section class="unit-masthead team-hero blackjack-hero" data-team="blackjack"><div class="blackjack-copy">${title}${copy}<a class="team-anchor" href="#character-grid">등록 요원 ↓</a></div><div class="field-tv"><div class="tv-handle"></div><div class="tv-screen"><div class="tv-screen-label"><i></i> BLACKJACK / FIELD SIGNAL <span>CH. 21</span></div>${photo(portrait('siso'))}<div class="tv-caption"><small>BREACH & RETRIEVE</small><strong>SISO</strong></div><div class="tv-scan" aria-hidden="true"></div></div><div class="tv-controls" aria-hidden="true"><i class="tv-dial"></i><span class="tv-speaker"></span><i class="tv-dial"></i></div></div><div class="blackjack-checker" aria-hidden="true"></div></section>`;
 if(t.id==='origin')return `<section class="unit-masthead team-hero origin-hero" data-team="origin"><div class="origin-copy"><span class="origin-orbit-label">THE RETURNED / 04</span>${title}${copy}</div><div class="origin-aperture" aria-hidden="true"><i class="origin-ring"></i>${people.slice(0,3).map(c=>photo(c)).join('')}<span>ORIGIN / BEYOND THE GATE</span></div></section>`;
 if(t.id==='beacon')return `<section class="unit-masthead team-hero beacon-hero" data-team="beacon"><div class="beacon-file-copy"><span class="beacon-file-label">PERSONNEL & INVESTIGATION / 02</span>${title}${copy}<div class="beacon-file-sign"><span class="barcode"></span><span>TRACE · CONTACT · PROTECT</span></div></div><div class="beacon-evidence">${photo(people[0])}<span class="evidence-crosshair" aria-hidden="true"></span><span class="evidence-label">FIELD COMMAND / ${people[0].code}</span></div></section>`;
 return `<section class="unit-masthead team-hero shield-hero" data-team="shield"><div class="shield-hero-top"><span>TACTICAL RESPONSE DIVISION</span><span>SGIA / SHIELD</span></div><div class="shield-copy">${title}${copy}</div><div class="shield-lineup">${people.slice(0,3).map(c=>`<div>${photo(c)}<span>${esc(c.code)}</span></div>`).join('')}</div><div class="shield-hero-bottom">HOLD THE LINE <span>전술대응팀</span></div></section>`;
}
