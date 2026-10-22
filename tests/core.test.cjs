const {test} = require('node:test');
const assert = require('node:assert/strict');
const C = require('../extension/core.js');
const body = (id, items = [], groups) => ({data: {tasks: {edges: [{node: {id: String(id), checklist: groups || [{id: '1', checklistItems: items}]}}]}}});
const item = (id, completed = false, title = 'Check access') => ({id: String(id), title, isCompleted: completed});
test('settings validate values and support independent style and label', () => {
  assert.equal(C.settings({style:'text',label:'percentage'}).style,'text');
  assert.equal(C.settings({style:'text',label:'percentage'}).label,'percentage');
  assert.deepEqual(C.settings({style:'script',label:'bad',enabled:'false'}),C.DEFAULTS);
  assert.equal(C.settings({enabled:false}).enabled,false);
  assert.equal(C.settings().completedTick,false);
  assert.equal(C.settings({completedTick:true}).completedTick,true);
  assert.equal(C.settings({completedTick:'true'}).completedTick,false);
});
test('appearance defaults to light and accepts only the three supported modes', () => {
  assert.equal(C.settings().theme, 'light');
  assert.equal(C.settings({enabled:false, style:'text'}).theme, 'light');
  for (const theme of ['light', 'dark', 'system']) assert.equal(C.settings({theme, enabled:false}).theme, theme);
  for (const theme of ['Dark', 'auto', '', null, true, {}]) assert.equal(C.settings({theme}).theme, 'light');
});
test('completion choices migrate the old tick switch and explicit choices take precedence',()=>{
  assert.equal(C.settings().completion,'normal');assert.equal(C.settings({completedTick:true}).completion,'tick');
  for(const completion of ['normal','tick','hide'])assert.equal(C.settings({completion,completedTick:true}).completion,completion);
  assert.equal(C.settings({completion:'hide',completedTick:true}).completedTick,false);
  assert.equal(C.settings({completion:'invalid'}).completion,'normal');
});
test('route recognition supports Accelo tenant subdomains and covers all supported pages', () => {
  assert.equal(C.route('https://digitalguppy.accelo.com/app/projects/45?tab=Overview'),'modern');
  assert.equal(C.route('https://digitalguppy.accelo.com/?action=force_view_job&id=45#?selected_tab=overview#END'),'classic');
  assert.equal(C.route('https://digitalguppy.accelo.com/?action=view_milestone&id=260'),'milestone');
  assert.equal(C.route('https://other.accelo.com/app/projects/45'),'modern');
  assert.equal(C.route('https://digitalguppy.accelo.com/app/tickets/45'),null);
});
test('multiple checklists flatten correctly and repeated item IDs do not inflate progress', () => {
  const data=C.normalize(body(2,[],[{id:1,checklistItems:[item(1,true),item(2)]},{id:2,checklistItems:[item(1,true),item(3)]}]),2);
  assert.equal(data.total,3);assert.equal(data.complete,1);assert.equal(data.percent,33);
  assert.equal(C.label(data,'count'),'1 / 3');assert.equal(C.label(data,'percentage'),'33%');
});
test('empty, missing, malformed and GraphQL error responses remain distinct', () => {
  assert.equal(C.normalize(body(2,[],[]),2).total,0);
  assert.throws(()=>C.normalize(body(3),2),/unavailable/);
  assert.throws(()=>C.normalize({errors:[{message:'Denied'}],...body(2)},2),/access/);
  assert.throws(()=>C.normalize(body(2,[{id:1,title:'x',isCompleted:'false'}]),2),/format/);
  assert.throws(()=>C.normalize({data:{tasks:{edges:[]}}},2),/unavailable/);
  const title='<img src=x onerror=alert(1)>';
  assert.equal(C.normalize(body(2,[item(1,false,title)]),2).items[0].title,title);
});
test('request queue bounds concurrency, deduplicates and uses only the fixed query', async () => {
  let active=0,peak=0,calls=0;const releases=[];
  const loader=C.createLoader({concurrency:2,fetcher:async(url,options)=>{
    calls++;active++;peak=Math.max(peak,active);
    assert.equal(url,'/graphql');assert.equal(options.credentials,'same-origin');
    const req=JSON.parse(options.body);assert.equal(req.query,C.QUERY);assert(!req.query.includes('mutation'));
    await new Promise(resolve=>releases.push(resolve));active--;
    return {ok:true,json:async()=>body(req.variables.id,[item(1)])};
  }});
  const a=loader.get(1),same=loader.get(1),b=loader.get(2),c=loader.get(3);
  assert.equal(a,same);assert.equal(calls,2);
  releases.shift()();await a;await new Promise(r=>setImmediate(r));
  assert.equal(calls,3);releases.splice(0).forEach(f=>f());await Promise.all([b,c]);
  assert.equal(peak,2);await loader.get(1);assert.equal(calls,3);
});
test('cache expiry and explicit refresh fetch current data',async()=>{
  let clock=0,calls=0;const loader=C.createLoader({now:()=>clock,ttl:100,fetcher:async()=>({ok:true,json:async()=>body(1,[item(1,++calls>1)])})});
  assert.equal((await loader.get(1)).complete,0);clock=50;await loader.get(1);assert.equal(calls,1);
  clock=101;assert.equal((await loader.get(1)).complete,1);assert.equal(calls,2);
  loader.forget(1);await loader.get(1);assert.equal(calls,3);
});
test('refresh prevents an older response overwriting the cache',async()=>{
  let release;let calls=0;
  const loader=C.createLoader({fetcher:async()=>{const n=++calls;if(n===1)await new Promise(r=>release=r);return {ok:true,json:async()=>body(1,[item(1,n>1)])};}});
  const old=loader.get(1);const rejected=assert.rejects(old,/cancelled/);loader.clear();const fresh=await loader.get(1);
  release();await rejected;assert.equal(fresh.complete,1);assert.equal((await loader.get(1)).complete,1);
});
test('HTTP errors and invalid identifiers never become empty results',async()=>{
  let calls=0;const loader=C.createLoader({fetcher:async()=>{calls++;return {ok:false,status:403};}});
  await assert.rejects(loader.get('abc'),/Invalid/);assert.equal(calls,0);
  await assert.rejects(loader.get(1),/Sign in/);await assert.rejects(loader.get(1),/Sign in/);assert.equal(calls,1);
});
