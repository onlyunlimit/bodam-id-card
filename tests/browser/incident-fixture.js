import { generateIncident } from '../../assets/model.js';
export function incidentState() {
 return {records:Array.from({length:15},(_,i)=>({...generateIncident(i,()=>.5,Date.now()-1000000+i*1000),id:`abcdef01-1234-4123-8123-${String(i).padStart(12,'0')}`})),fail:false};
}
export async function mockIncidents(target, state=incidentState()) {
 await target.addInitScript(() => { window.turnstile={render(el,options){window.reportCaptcha=options;setTimeout(()=>options.callback('verified'),0);return 1;},remove(){},reset(){window.reportCaptcha?.callback('verified');}}; });
 await target.route('**/incidents**', async route=>{
  const request=route.request(),url=new URL(request.url());
  if(request.method()==='GET')return route.fulfill({json:{incidents:state.records,next:null}});
  if(state.fail)return route.fulfill({status:503,json:{error:'공유 서버 연결 실패'}});
  const data=request.postDataJSON();
  if(request.method()==='POST'){
   let incident=state.records.find(r=>r.id===data.record.id);
   if(!incident){incident={...data.record,created:Date.now(),resolvedAt:null};state.records.push(incident);}
   return route.fulfill({json:{incident}});
  }
  if(data.password!=='123456')return route.fulfill({status:403,json:{error:'작성 비밀번호가 일치하지 않습니다.'}});
  const incident=state.records.find(r=>r.id===url.pathname.split('/').pop());incident.resolvedAt=data.resolved?Date.now():null;
  return route.fulfill({json:{incident}});
 });
 return state;
}
export async function reportConsent(page){
 await page.locator('#incident-form [name=password]').fill('123456');
 await page.locator('#incident-form [name=consent]').check();
}
export async function confirmStatus(page){
 await page.locator('#incident-status-form [name=password]').fill('123456');
 await page.locator('#incident-status-form [type=submit]').click();
}
