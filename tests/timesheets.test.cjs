const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const T=require('../extension/timesheet-core.js');
const read=name=>fs.readFileSync(path.join(__dirname,'../extension',name),'utf8');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function row(heading,relocate=true){return `<tr><td class="ts_against_cell"><div class="flex relative restrict"><div class="ts_against_mask"><h1 class="ts_work_obj_parent" ${heading}><a href="/?action=view_company&id=999">Parent breadcrumb</a></div>${relocate?'<div tooltip="Relocate All Activities"></div>':''}</div></td></tr>`;}
const task=row('data-task_id="2018"><a>Nested task</a></h1>');
const ticket=row('><a href="/?action=view_issue&id=1988">Ticket</a></h1>',false);
async function setup(t,options={}){
  const dom=new JSDOM(`<table><tbody>${task}${ticket}</tbody></table>`,{url:'https://digitalguppy.accelo.com/?action=timesheet_entry',runScripts:'outside-only'});t.after(()=>dom.window.close());
  const w=dom.window,d=w.document;let changed;const calls=[];
  w.chrome={storage:{local:{get:async()=>({toolkitSettings:{weeklyTimers:options.enabled!==false}})},onChanged:{addListener:fn=>changed=fn}}};
  w.eval(read('core.js'));w.eval(read('timesheet-core.js'));w.eval(read('timesheets.js'));await wait(5);
  let click;const original=d.addEventListener.bind(d);d.addEventListener=(type,fn,...rest)=>{if(type==='click')click=fn;original(type,fn,...rest);};
  w.$AL={has_feature:()=>options.legacy!==true,trigger:(...args)=>calls.push(args)};
  w.angular={element:()=>({injector:()=>({get:()=>({start_or_resume:timer=>calls.push(['legacy',timer])})})})};
  w.eval(read('timesheet-bridge.js'));
  return{w,d,calls,press(button,trusted=true){click({target:button,isTrusted:trusted,preventDefault(){},stopPropagation(){}});},set(enabled){changed({toolkitSettings:{newValue:{weeklyTimers:enabled}}},'local');}};
}
test('row identity uses the task or primary heading link, never breadcrumbs',()=>{
  const d=new JSDOM(`<table>${task}${ticket}</table>`).window.document;
  assert.deepEqual(T.identify(d.querySelectorAll('td')[0]),{engagement:{id:'2018',table:'task'},subject:'Nested task'});
  assert.deepEqual(T.identify(d.querySelectorAll('td')[1]),{engagement:{id:'1988',table:'issue'},subject:'Ticket'});
});
test('unsupported headings, external links and malformed IDs do not create timers',()=>{
  for(const href of ['https://other.test/?action=view_task&id=1','/?action=view_task&id=0','/?action=view_task&id=12x','/?action=view_staff&id=2']){
    const dom=new JSDOM(`<table>${row(`><a href="${href}">Invalid</a></h1>`)}</table>`);
    assert.equal(T.identify(dom.window.document.querySelector('td')),null);dom.window.close();
  }
});
test('buttons appear once with or without relocation and settings remove them reversibly',async t=>{
  const x=await setup(t);assert.equal(x.d.querySelectorAll('.tka-timesheet-timer').length,2);
  assert.equal(x.d.querySelectorAll('td')[1].classList.contains('tka-timesheet-no-relocate'),true);
  x.d.body.append(x.d.createElement('div'));await wait(100);assert.equal(x.d.querySelectorAll('.tka-timesheet-timer').length,2);
  x.set(false);assert.equal(x.d.querySelectorAll('.tka-timesheet-timer').length,0);assert.equal(x.d.querySelectorAll('.tka-timesheet-cell').length,0);
  x.set(true);assert.equal(x.d.querySelectorAll('.tka-timesheet-timer').length,2);
});
test('trusted beta click uses exact string ID and native start-or-resume event once',async t=>{
  const x=await setup(t);const b=x.d.querySelector('.tka-timesheet-timer');x.press(b,false);assert.equal(x.calls.length,0);
  x.press(b);x.press(b);assert.equal(x.calls.length,1);assert.deepEqual(JSON.parse(JSON.stringify(x.calls[0])),['accelo.startOrResumeTimer',{engagement:{id:'2018',table:'task'},subject:'Nested task'}]);
  assert.equal(b.disabled,true);
});
test('legacy mode uses native service and derives updated row identity at click time',async t=>{
  const x=await setup(t,{legacy:true});const b=x.d.querySelector('.tka-timesheet-timer');x.d.querySelector('h1').setAttribute('data-task_id','2042');x.press(b);
  assert.equal(x.calls[0][0],'legacy');assert.equal(x.calls[0][1].engagement.id,'2042');
});
test('disabled preferences, detached controls and failed services do not silently start',async t=>{
  const x=await setup(t,{enabled:false});assert.equal(x.d.querySelector('.tka-timesheet-timer'),null);x.set(true);const b=x.d.querySelector('.tka-timesheet-timer');b.remove();x.press(b);assert.equal(x.calls.length,0);
  x.set(true);x.w.$AL.trigger=()=>{throw Error('offline');};const next=x.d.querySelector('.tka-timesheet-timer');x.press(next);assert.match(next.title,/Could not start/);assert.equal(next.disabled,false);
});
test('newly rendered rows gain buttons without starting a timer',async t=>{
  const x=await setup(t);const cell=x.d.querySelector('tr').cloneNode(true);cell.querySelector('button').remove();cell.querySelector('h1').setAttribute('data-task_id','2020');x.d.querySelector('tbody').append(cell);await wait(100);assert.equal(cell.querySelectorAll('button').length,1);assert.equal(x.calls.length,0);
});

test('helper publishes browser API even when a module shim is present',()=>{
  const dom=new JSDOM('',{runScripts:'outside-only'});
  try {dom.window.module={exports:{}};dom.window.eval(read('timesheet-core.js'));assert.equal(typeof dom.window.ToolkitTimesheet.identify,'function');}
  finally {dom.window.close();}
});

test('timer dependencies have distinct world paths and deterministic isolated ordering',()=>{
  const manifest=JSON.parse(read('manifest.json'));
  const main=manifest.content_scripts.filter(s=>s.world==='MAIN').flatMap(s=>s.js||[]);
  const isolated=manifest.content_scripts.filter(s=>s.world!=='MAIN').flatMap(s=>s.js||[]);
  assert.equal(main.some(file=>isolated.includes(file)),false);
  const entry=manifest.content_scripts.find(s=>s.js.includes('timesheets.js'));
  assert(entry.js.indexOf('core.js')<entry.js.indexOf('timesheets.js'));
  assert(entry.js.indexOf('timesheet-core.js')<entry.js.indexOf('timesheets.js'));
  assert.equal(read('timesheet-core-main.js'),read('timesheet-core.js'));
});
