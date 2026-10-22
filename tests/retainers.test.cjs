const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const R=require('../extension/retainers-core.js');
const read=f=>fs.readFileSync(path.join(__dirname,'../extension',f),'utf8');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const period={id:'621',allowance_type:'fixed_hours',budget_type:'pre-paid',used:{billable:'360',charged:'10'},allowance:{billable:'72000',charged:'2000'},unapproved:{billable:'360'}};
test('classic usage preserves used, separate unapproved time and over-budget split',()=>{
  const p=R.period(period);assert.equal(p.label,'6m / 20h 00m');assert.equal(p.fill,.5);assert.equal(p.unapproved,360);
  const over=R.period({...period,used:{billable:25020},allowance:{billable:18000}});assert.equal(over.label,'6h 57m / 5h 00m');assert(over.over>28&&over.over<29);assert.equal(over.fill+over.over,100);
  assert.equal(R.period(null),null);
});
test('unlimited, fixed-value, restricted financials and missing data remain distinct',()=>{
  assert.equal(R.period({...period,allowance_type:'unlimited_hours'}).label,'6m / Unlimited');
  assert.equal(R.period({...period,allowance_type:'unlimited_hours',budget_type:'post-paid'}).label,'6m');
  assert.equal(R.period({...period,allowance_type:'fixed_value'}).label,'$10 / $2,000');
  assert.equal(R.period({...period,allowance_type:'fixed_value'},false).label,'6m');
  assert.equal(R.period({...period,used:null}).error,true);
  assert.equal(R.period({...period,used:{billable:null}}).label,'0m / 20h 00m');
  assert.equal(R.period({...period,allowance_type:'unlimited_hours'},false).label,'6m / Unlimited');
  assert.equal(R.period({...period,allowance:{billable:0}}).ratio,null);
});
function dom(){return new JSDOM('<table class="customListTable"><thead><tr><th>Title</th><th>Actions</th></tr></thead><tbody><tr><td><a href="/?action=view_contract&id=36">Retainer</a></td><td><button>Native action</button></td></tr></tbody></table>',{url:'https://digitalguppy.accelo.com/?action=list&list_type=retainer',runScripts:'outside-only'});}
test('columns stay aligned, update reused rows, preserve stale data during reads and toggle independently',async t=>{
  const d=dom(),w=d.window;t.after(()=>w.close());let change,request,reads=0;
  w.chrome={storage:{local:{get:async()=>({})},onChanged:{addListener:f=>change=f}}};
  w.document.addEventListener('tka-retainer-read',e=>{request=JSON.parse(e.detail);reads++;});
  w.eval(read('core.js'));w.eval(read('retainers-core.js'));w.eval(read('retainers.js'));await wait(150);
  assert.equal(w.document.querySelectorAll('[data-tka-period]').length,6);assert.equal(reads,1);
  function answer(records){w.document.dispatchEvent(new w.CustomEvent('tka-retainer-result',{detail:JSON.stringify({token:request.token,ok:true,financial:true,records})}));}
  answer({'36':{current:period,previous:null,tasks:{active:2,overdue:1}}});await wait(130);
  assert.match(w.document.querySelector('td[data-tka-period=current]').textContent,/6m \/ 20h 00m/);
  assert.equal(w.document.querySelector('td[data-tka-period=previous]').textContent,'');
  assert.equal(w.document.querySelector('.tka-retainer-note').getAttribute('href'),'/?action=view_contract_period&id=621');
  assert.equal(w.document.querySelector('.tka-retainer-task-active').textContent,'2');
  assert.equal(w.document.querySelector('.tka-retainer-task-overdue').textContent,'1');
  for(const a of w.document.querySelectorAll('.tka-retainer-task-count'))assert.equal(a.getAttribute('href'),'/?action=view_contract_period&id=621#?selected_tab=task#END');
  assert.equal(w.document.querySelectorAll('th button').length,0);
  change({toolkitSettings:{newValue:{retainerUnapproved:false}}},'local');await wait(130);
  assert.equal(w.document.querySelectorAll('.tka-retainer-note').length,0);
  assert.match(w.document.querySelector('td[data-tka-period=current]').textContent,/6m \/ 20h 00m/);
  assert.equal(reads,1);
  change({toolkitSettings:{newValue:{retainerUnapproved:true}}},'local');await wait(130);
  assert.equal(w.document.querySelector('.tka-retainer-note').getAttribute('href'),'/?action=view_contract_period&id=621');
  const now=w.Date.now;w.Date.now=()=>now()+61000;Object.defineProperty(w.document,'hidden',{value:false,configurable:true});w.document.dispatchEvent(new w.Event('visibilitychange'));await wait(130);assert.equal(reads,2);assert.match(w.document.querySelector('td[data-tka-period=current]').textContent,/6m/);
  answer({'36':{current:period,previous:null}});await wait(130);
  change({toolkitSettings:{newValue:{retainerCurrent:false,retainerPrevious:true}}},'local');await wait(130);
  assert.equal(w.document.querySelectorAll('[data-tka-period=current]').length,0);assert.equal(w.document.querySelectorAll('[data-tka-period=previous]').length,2);
  w.document.querySelector('a').href='/?action=view_contract&id=41';await wait(130);assert.deepEqual(request.ids,['41']);answer({'41':{current:null,previous:{...period,id:'620'},tasks:null}} );await wait(130);
  assert.match(w.document.querySelector('td[data-tka-period=previous]').textContent,/6m/);assert.equal(w.document.querySelector('.tka-retainer-note').getAttribute('href'),'/?action=view_contract_period&id=620');
  change({toolkitSettings:{newValue:{retainerCurrent:false,retainerPrevious:true,retainerUnapproved:false}}},'local');await wait(130);
  assert.equal(w.document.querySelectorAll('.tka-retainer-note').length,0);
  assert.match(w.document.querySelector('td[data-tka-period=previous]').textContent,/6m/);
  change({toolkitSettings:{newValue:{retainerCurrent:false,retainerPrevious:false,retainerTasks:false}}},'local');await wait(130);assert.equal(w.document.querySelectorAll('[data-tka-period]').length,0);assert.equal(w.document.querySelector('tbody tr').cells.length,2);
});
test('read bridge uses fixed read-only action, paginates and only returns requested summaries',async t=>{
  const d=dom(),w=d.window;t.after(()=>w.close());w.AbortSignal=AbortSignal;w.financial_level='all';w.$AL={config:()=>({value:'test-csrf'})};let calls=0,result;
  w.fetch=async(url,options)=>{calls++;assert.equal(url,'/api/0.5/session/contract');assert.equal(options.headers['X-CSRF'],'test-csrf');const form=new URLSearchParams(options.body);assert.equal(form.get('_method'),'GET');assert.equal(form.get('_action'),'filtered_list');const data=JSON.parse(form.get('data'));assert.equal(data.filter_page,calls-1);return {ok:true,json:async()=>({total_pages:2,contracts:calls===1?[{id:'99',current_period:period}]:[{id:'36',current_period:period}]})};};
  w.document.addEventListener('tka-retainer-result',e=>result=JSON.parse(e.detail));w.eval(read('retainers-bridge.js'));
  w.document.dispatchEvent(new w.CustomEvent('tka-retainer-read',{detail:JSON.stringify({token:'a',ids:['36']})}));await wait(20);
  assert.equal(calls,2);assert.equal(result.ok,true);assert.deepEqual(Object.keys(result.records),['36']);assert(!JSON.stringify(result).includes('test-csrf'));
  w.document.dispatchEvent(new w.CustomEvent('tka-retainer-read',{detail:JSON.stringify({token:'b',ids:['bad']})}));await wait(20);assert.equal(calls,2);
});
