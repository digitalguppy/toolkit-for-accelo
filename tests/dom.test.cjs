const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');
const dir=path.join(__dirname,'../extension');
const read=name=>fs.readFileSync(path.join(dir,name),'utf8');
const core=read('core.js'),content=read('content.js');
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const task=(id=2018)=>`<table class="JobOverviewTreeRow JobOverviewTreeRow--task"><tbody><tr><td><div class="view_task_button" data-task_id="${id}"><a data-element-name="project-overview-task-title">Task ${id}</a></div></td><td>Status</td><td>Budget</td></tr></tbody></table>`;
const classic=`<table class="JobOverviewTreeRow--header"><tbody><tr><td>Milestones &amp; Tasks</td><td>Status</td><td>Budget</td></tr></tbody></table><table class="JobOverviewTreeRow"><tbody><tr><td>Milestone</td><td>Active</td><td>Budget</td></tr></tbody></table>${task()}`;
const modern=`<div id="project_workAreaContainer"><table><thead><tr><th>Title</th><th>Status</th><th>Assignee(s)</th><th>Scheduled Dates</th></tr></thead></table>${['Milestone_260','Task_2018','Task_2019'].map(key=>`<div data-testid="CrayonProjectsRow__row-${key}"><div class="BaseRow_leftContent__example"><div class="BaseRow_iconTitle__example">${key}</div><div>Status</div><div>Assignee</div><div>Dates</div></div></div>`).join('')}</div>`;
function response(id,complete=false){return {data:{tasks:{edges:[{node:{id:String(id),checklist:id===2019?[]:[{id:'553',checklistItems:[{id:'1',title:'<img src=x onerror=alert(1)>',isCompleted:complete},{id:'2',title:'Verify Hosting',isCompleted:true}]}]}}]}}};}
async function setup(markup,url,prefs={}) {
  const dom=new JSDOM(markup,{url,runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window;const listeners=[];let requests=[], currentPrefs=prefs, changed=false;
  w.chrome={storage:{local:{get:async()=>({toolkitSettings:currentPrefs})},onChanged:{addListener:f=>listeners.push(f)}}};
  w.fetch=async(url,options)=>{const req=JSON.parse(options.body);requests.push(req);return {ok:true,json:async()=>response(req.variables.id,changed)};};
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
  w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
  w.eval(core);w.eval(content);await delay(160);
  return {dom,w,requests,changeData(){changed=true;},async update(next){currentPrefs=next;listeners.forEach(f=>f({toolkitSettings:{newValue:next}},'local'));await delay(160);},close(){w.__toolkitAccelo.stop();w.close();}};
}
test('classic adapter inserts aligned cells, supports expansion and avoids duplicate cells or requests',async()=>{
  const ctx=await setup(classic,'https://digitalguppy.accelo.com/?action=force_view_job&id=45');
  try {
    const d=ctx.w.document;
    assert.equal(d.querySelectorAll('.tka-head').length,1);assert.equal(d.querySelectorAll('.tka-cell').length,3);
    assert.equal(d.querySelector('.tka-indicator').textContent,'1 / 2');assert.equal(ctx.requests.length,1);
    d.body.insertAdjacentHTML('beforeend',task(2019));await delay(160);
    assert.equal(d.querySelectorAll('.tka-cell').length,4);assert.equal(ctx.requests.length,2);
    assert.equal(d.querySelector('[data-tka-task="2019"]').textContent,'');
    d.body.append(d.createElement('div'));await delay(160);assert.equal(ctx.requests.length,2);assert.equal(d.querySelectorAll('.tka-head').length,1);
    d.querySelector('[data-task_id="2019"]').closest('table').remove();await delay(160);assert.equal(ctx.w.__toolkitAccelo.stats().cells,1);
  } finally {ctx.close();}
});
test('modern adapter has placeholders for milestones and a separate matching header',async()=>{
  const ctx=await setup(modern,'https://digitalguppy.accelo.com/app/projects/45?tab=Overview');
  try {
    const d=ctx.w.document;assert.equal(d.querySelectorAll('.tka-cell').length,4);
    assert.equal(d.querySelector('thead tr').children[1].textContent,'Checklist↻');
    for(const row of d.querySelectorAll('.BaseRow_leftContent__example'))assert(row.children[1].classList.contains('tka-cell'));
    assert.equal(ctx.requests.length,2);
    const row=d.querySelector('[data-testid="CrayonProjectsRow__row-Task_2018"]');row.remove();await delay(160);
    d.querySelector('#project_workAreaContainer').append(row);await delay(160);assert.equal(d.querySelectorAll('.tka-head').length,1);
    assert.equal(ctx.requests.length,2);
  } finally {ctx.close();}
});
test('all six display combinations work, and disabling removes every toolkit element',async()=>{
  const ctx=await setup(classic,'https://digitalguppy.accelo.com/?action=view_milestone&id=260');
  try {
    for(const style of ['circle','bar','text'])for(const label of ['count','percentage']){
      await ctx.update({style,label});const d=ctx.w.document;
      assert.equal(d.querySelector('.tka-indicator').textContent,label==='count'?'1 / 2':'50%');
      assert.equal(!!d.querySelector('.tka-circle'),style==='circle');assert.equal(!!d.querySelector('.tka-bar'),style==='bar');
    }
    await ctx.update({enabled:false});assert.equal(ctx.w.document.querySelectorAll('[data-tka-owned]').length,0);
    await ctx.update({enabled:true,milestone:false});assert.equal(ctx.w.document.querySelectorAll('[data-tka-owned]').length,0);
  } finally {ctx.close();}
});
test('optional completion tick replaces all progress styles and stays clickable in every overview',async()=>{
  for(const [markup,url] of [[modern,'https://digitalguppy.accelo.com/app/projects/45'],[classic,'https://digitalguppy.accelo.com/?action=force_view_job&id=45'],[classic,'https://digitalguppy.accelo.com/?action=view_milestone&id=260']]){
    const ctx=await setup(markup,url);try{
      ctx.changeData();const d=ctx.w.document;
      for(const style of ['bar','circle','text'])for(const label of ['count','percentage']){
        await ctx.update({style,label,completedTick:true});
        const button=d.querySelector('[data-tka-task="2018"] .tka-indicator');
        assert.equal(button.querySelectorAll('.tka-complete-tick').length,1);assert.equal(button.textContent,'');assert.equal(button.querySelector('.tka-bar,.tka-circle'),null);assert(button.classList.contains('tka-completed-indicator'));
        assert.match(button.getAttribute('aria-label'),/2 of 2 checklist items complete/);
      }
      d.querySelector('.tka-indicator').click();assert(d.querySelector('dialog').open);d.querySelector('dialog header button').click();
      await ctx.update({completedTick:false});assert.equal(d.querySelector('.tka-complete-tick'),null);assert.equal(d.querySelector('.tka-indicator').textContent,'2 / 2');
    }finally{ctx.close();}
  }
});
test('empty checklists and rounded-up percentages never show a completed tick',async()=>{
  const ctx=await setup(modern,'https://digitalguppy.accelo.com/app/projects/45',{completedTick:true});try{
    const d=ctx.w.document;assert.equal(d.querySelector('.tka-complete-tick'),null);assert.equal(d.querySelector('[data-tka-task="2019"]').textContent,'');
    ctx.w.fetch=async(url,options)=>{
      const id=JSON.parse(options.body).variables.id,result=response(id);if(id===2018)result.data.tasks.edges[0].node.checklist[0].checklistItems=Array.from({length:201},(_,i)=>({id:String(i),title:'Item '+i,isCompleted:i<200}));
      return{ok:true,json:async()=>result};
    };
    await ctx.update({completedTick:true,style:'text',label:'percentage'});
    assert.equal(d.querySelector('[data-tka-task="2018"] .tka-indicator').textContent,'100%');assert.equal(d.querySelector('.tka-complete-tick'),null);
  }finally{ctx.close();}
});
test('completed indicators can hide without removing rows and return after a reopened item refreshes',async()=>{
  for(const [markup,url] of [[modern,'https://digitalguppy.accelo.com/app/projects/45'],[classic,'https://digitalguppy.accelo.com/?action=force_view_job&id=45'],[classic,'https://digitalguppy.accelo.com/?action=view_milestone&id=260']]){
    const ctx=await setup(markup,url,{completion:'hide'});try{
      const d=ctx.w.document,cell=d.querySelector('[data-tka-task="2018"]');assert(cell.querySelector('.tka-indicator'));
      ctx.changeData();ctx.w.__toolkitAccelo.refresh();await delay(180);assert(cell.isConnected);assert.equal(cell.children.length,0);
      ctx.w.fetch=async()=>({ok:true,json:async()=>response(2018,false)});ctx.w.__toolkitAccelo.refresh();await delay(180);
      assert.equal(cell.querySelector('.tka-indicator').textContent,'1 / 2');
      await ctx.update({completion:'normal',label:'percentage'});assert.equal(d.querySelector('.tka-completed-indicator'),null);
    }finally{ctx.close();}
  }
});
test('dialog treats item titles as text, opens read-only and refreshes actual progress',async()=>{
  const ctx=await setup(classic,'https://digitalguppy.accelo.com/?action=view_milestone&id=260');
  try {
    const d=ctx.w.document;d.querySelector('.tka-indicator').click();
    assert(d.querySelector('dialog').open);assert.equal(d.querySelectorAll('dialog img').length,0);
    assert(d.querySelector('dialog').textContent.includes('<img src=x onerror=alert(1)>'));
    assert.equal(d.querySelectorAll('dialog input:disabled').length,2);
    ctx.changeData();d.querySelector('dialog footer button').click();await delay(25);
    assert(d.querySelector('dialog').textContent.includes('2 of 2 complete'));
    assert.equal(d.querySelector('.tka-indicator').textContent,'2 / 2');
    d.querySelector('dialog header button').click();assert.equal(d.querySelector('dialog'),null);
  } finally {ctx.close();}
});
test('navigation out of overview removes the column; returning recreates it once',async()=>{
  const ctx=await setup(modern,'https://digitalguppy.accelo.com/app/projects/45?tab=Overview');
  try {
    ctx.w.history.pushState({},'','?tab=Stream');ctx.w.dispatchEvent(new ctx.w.PopStateEvent('popstate'));await delay(160);
    assert.equal(ctx.w.document.querySelectorAll('[data-tka-owned]').length,0);
    ctx.w.history.pushState({},'','?tab=Overview');ctx.w.dispatchEvent(new ctx.w.PopStateEvent('popstate'));await delay(160);
    assert.equal(ctx.w.document.querySelectorAll('.tka-head').length,1);
  } finally {ctx.close();}
});
test('request errors offer retry and never render an empty success',async()=>{
  const ctx=await setup(classic,'https://digitalguppy.accelo.com/?action=force_view_job&id=45');
  try {
    ctx.w.fetch=async()=>({ok:false,status:403});ctx.w.__toolkitAccelo.refresh(true);await delay(160);
    const retry=ctx.w.document.querySelector('.tka-error');assert(retry);assert.equal(retry.textContent,'Retry');assert.match(retry.title,/Sign in/);
    ctx.w.fetch=async()=>({ok:true,json:async()=>response(2018,true)});retry.click();await delay(25);
    assert.equal(ctx.w.document.querySelector('.tka-indicator').textContent,'2 / 2');
  } finally {ctx.close();}
});
test('settings save independent style and label, update preview and restore disabled controls',async()=>{
  const dom=new JSDOM(read('settings.html'),{url:'chrome-extension://test/settings.html?popup=1',runScripts:'outside-only'});
  const w=dom.window;const writes=[];
  w.chrome={storage:{local:{get:async()=>({toolkitSettings:{style:'bar',label:'count'}}),set:async data=>writes.push(data)}},runtime:{openOptionsPage(){}}};
  w.eval(core);w.eval(read('settings.js'));await delay(10);
  const d=w.document;
  const choose=(name,value)=>{const input=d.querySelector(`[name="${name}"][value="${value}"]`);input.checked=true;input.dispatchEvent(new w.Event('change'));};
  choose('style','text');choose('label','percentage');await delay(10);
  assert.equal(d.querySelector('#preview-value').textContent,'50%');assert(d.querySelector('#preview-mark').hidden);
  assert.equal(writes.at(-1).toolkitSettings.style,'text');assert.equal(writes.at(-1).toolkitSettings.label,'percentage');
  const tick=d.querySelector('[name="completion"][value="tick"]');assert.equal(tick.checked,false);choose('completion','tick');await delay(10);
  assert.equal(writes.at(-1).toolkitSettings.completedTick,true);assert(d.querySelector('#preview-complete-mark').classList.contains('complete-tick'));assert(d.querySelector('#preview-complete-value').hidden);
  assert.equal(d.querySelector('#preview-value').textContent,'50%');
  const rollup=d.querySelector('#milestoneRollup');assert.equal(rollup.checked,false);rollup.checked=true;rollup.dispatchEvent(new w.Event('change'));await delay(10);assert.equal(writes.at(-1).toolkitSettings.milestoneRollup,true);
  d.querySelector('#preview-indicator').click();assert.equal(d.querySelector('#preview-items').hidden,false);
  const enable=d.querySelector('#enabled');enable.checked=false;enable.dispatchEvent(new w.Event('change'));await delay(10);
  assert(d.querySelector('#controls').disabled);assert(d.querySelector('#preview-indicator').hidden);
  assert.equal(writes.at(-1).toolkitSettings.enabled,false);
  assert(d.querySelector('#preview-complete-indicator').hidden);assert.equal(writes.at(-1).toolkitSettings.completedTick,true);
  const top=d.querySelector('#descriptionTop');top.checked=true;top.dispatchEvent(new w.Event('change'));await delay(10);
  assert.equal(writes.at(-1).toolkitSettings.descriptionTop,true);assert.equal(writes.at(-1).toolkitSettings.enabled,false);
  const render=d.querySelector('#markdownDisplay');render.checked=false;render.dispatchEvent(new w.Event('change'));await delay(10);
  assert.equal(writes.at(-1).toolkitSettings.markdownDisplay,false);assert.equal(writes.at(-1).toolkitSettings.markdownEditor,true);assert.equal(writes.at(-1).toolkitSettings.descriptionExpanded,true);w.close();
});
test('background refresh retains existing progress until replacement data arrives, including on failure',async()=>{
  const ctx=await setup(classic,'https://digitalguppy.accelo.com/?action=force_view_job&id=45');
  try {
    const d=ctx.w.document;let release;
    ctx.w.fetch=async()=>{await new Promise(r=>release=r);return {ok:true,json:async()=>response(2018,true)};};
    ctx.w.__toolkitAccelo.refresh();await delay(160);
    assert.equal(d.querySelector('.tka-indicator').textContent,'1 / 2');assert.equal(d.querySelector('.tka-loading'),null);
    release();await delay(25);assert.equal(d.querySelector('.tka-indicator').textContent,'2 / 2');
    ctx.w.fetch=async()=>({ok:false,status:403});ctx.w.__toolkitAccelo.refresh();await delay(160);
    assert.equal(d.querySelector('.tka-indicator').textContent,'2 / 2');assert.equal(d.querySelector('.tka-error'),null);
  }finally{ctx.close();}
});
test('interactive checklist verifies completion, displays returned person and restores progress after undo',async()=>{
  const ctx=await setup(classic,'https://digitalguppy.accelo.com/?action=force_view_job&id=45',{completedTick:true});
  try {
    let completed=false, writes=0;
    ctx.w.fetch=async(url,options)=>{
      const req=JSON.parse(options.body);
      if(req.operationName!=='GetTaskChecklist'){writes++;completed=req.operationName==='CompleteChecklistItem';return {ok:true,json:async()=>({data:{}})};}
      const result=response(2018,completed), task=result.data.tasks.edges[0].node;task.permissions={canUpdate:true};
      task.checklist[0].checklistItems[0].completedBy={name:{fullName:'Test Person'}};
      return {ok:true,json:async()=>result};
    };
    ctx.w.__toolkitAccelo.refresh();await delay(160);const d=ctx.w.document;d.querySelector('.tka-indicator').click();
    d.querySelector('dialog input').click();await delay(30);
    assert.equal(writes,1);assert(d.querySelector('.tka-complete-tick'));
    assert.equal(d.querySelector('.tka-completed-by').textContent,'Test Person');assert(d.querySelector('dialog input').checked);
    d.querySelector('dialog input').click();await delay(30);assert.equal(writes,2);assert.equal(d.querySelector('.tka-complete-tick'),null);assert.equal(d.querySelector('.tka-indicator').textContent,'1 / 2');
  }finally{ctx.close();}
});
test('milestone rows total hidden tasks only when enabled in modern and classic views',async()=>{
  for(const v4 of [true,false]){
    const markup=v4?modern:classic.replace('<td>Milestone</td>','<td><a href="/?action=view_milestone&id=260">Milestone</a></td>');
    const ctx=await setup(markup,v4?'https://digitalguppy.accelo.com/app/projects/45':'https://digitalguppy.accelo.com/?action=force_view_job&id=45');
    try{
      assert.equal(ctx.requests.filter(r=>r.operationName==='ToolkitMilestoneChildren').length,0);
      let memberCalls=0,complete=false;
      ctx.w.fetch=async(url,options)=>{const req=JSON.parse(options.body);
        if(req.operationName==='ToolkitMilestoneChildren'){memberCalls++;return {ok:true,json:async()=>({data:{milestones:{edges:[{node:{id:'260',children:[{id:'2018',__typename:'Task'},{id:'2099',__typename:'Task'}]}}]}}})};}
        return {ok:true,json:async()=>response(req.variables.id,complete)};
      };
      await ctx.update({milestoneRollup:true});const d=ctx.w.document;
      const aggregate=d.querySelector('[data-tka-milestone="260"]');assert(aggregate);assert.equal(aggregate.textContent,'2 / 4');
      assert.equal(d.querySelectorAll('.tka-rollup').length,1);assert.match(aggregate.querySelector('.tka-rollup').title,/2 tasks/);
      complete=true;ctx.w.__toolkitAccelo.refresh();await delay(160);assert.equal(aggregate.textContent,'4 / 4');
      await ctx.update({milestoneRollup:true,label:'percentage'});assert.equal(d.querySelector('.tka-rollup').textContent,'100%');
      await ctx.update({milestoneRollup:true,completedTick:true});assert(d.querySelector('.tka-rollup .tka-complete-tick'));assert.equal(d.querySelector('.tka-rollup').tagName,'SPAN');
      await ctx.update({milestoneRollup:true,completion:'hide'});assert.equal(d.querySelector('[data-tka-milestone="260"]').textContent,'');assert.equal(d.querySelector('.tka-rollup'),null);
      const before=memberCalls;await ctx.update({milestoneRollup:false});assert.equal(d.querySelector('.tka-rollup'),null);assert.equal(memberCalls,before);
    }finally{ctx.close();}
  }
});
test('row progress uses native typography in modern and classic views',async()=>{
  for(const v4 of [true,false]){
    const markup=v4?modern.replace('Task_2018</div>','<p data-element-name="CrayonTypography__typography" style="font:400 14px/21px Roboto;color:rgb(30,40,50)">Task_2018</p></div>'):classic.replace('data-element-name="project-overview-task-title"','style="font:400 13px/18px Roboto;color:rgb(50,60,70)" data-element-name="project-overview-task-title"');
    const ctx=await setup(markup,v4?'https://digitalguppy.accelo.com/app/projects/45':'https://digitalguppy.accelo.com/?action=view_milestone&id=260');
    try{const cell=ctx.w.document.querySelector('[data-tka-task="2018"]');assert.equal(cell.style.fontFamily,'Roboto');assert.equal(cell.style.fontSize,v4?'14px':'13px');assert.equal(cell.style.fontWeight,'400');}finally{ctx.close();}
  }
});
