const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const dir=path.join(__dirname,'../extension');
const read=n=>fs.readFileSync(path.join(dir,n),'utf8');
const scripts=['core.js','vendor/markdown.js','descriptions.js'].map(read);
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const task=`<div data-element-name="view_task_drawer"><h5 data-element-name="objectTitle">#2018 Test task</h5><div data-element-name="overview_tab_content" style="display:flex;flex-direction:column"><section id="dates">Dates</section><section>Budget</section><div id="description-group"><div><h6>Description</h6></div><div class="DescriptionPanel_container__fixture"><div class="DescriptionPanel_content__fixture"><div data-element-name="panel_description" class="DescriptionPanel_descriptionPanel--readView--canUpdate__fixture"><div><p data-element-name="description_textArea" class="DescriptionPanel_lineClamp__fixture"></p></div></div><div data-element-name="description_showMore"><button>Show more</button></div></div></div><div id="checklist">Checklist</div></div></div></div>`;
const ticket=`<div class="SummaryPanel_container__fixture"><div data-element-name="panel_summary"><div class="summary-heading"><h6>Summary</h6></div><p data-element-name="summary_textArea"></p><button data-element-name="summary_editButton">Edit</button></div></div>`;
async function setup(kind='task',value='Plain text\n\nLeave the spacing.',prefs={}){
  const dom=new JSDOM(kind==='task'?task:ticket,{url:`https://example-team.accelo.com/app/${kind==='task'?'projects/45':'tickets/1995'}?tab=Overview`,runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window,d=w.document;
  w.savedDescription=value;w.reads=0;w.fetch=async(url,options)=>{w.reads++;const request=JSON.parse(options.body);assert.equal(request.operationName,'ToolkitDescription');assert.equal(request.variables.id,kind==='task'?2018:1995);return{ok:true,json:async()=>({data:{[kind==='task'?'tasks':'tickets']:{edges:[{node:{id:kind==='task'?2018:1995,description:w.savedDescription}}]}}})};};w.matchMedia=()=>({matches:false,addListener(){},removeListener(){}});
  w.resizeObservers=[];w.ResizeObserver=class{constructor(callback){this.callback=callback;w.resizeObservers.push(this);}observe(){} disconnect(){this.disconnected=true;}};
  w.Range.prototype.getBoundingClientRect=()=>({left:0,top:0,right:0,bottom:0,width:0,height:0});w.Range.prototype.getClientRects=()=>[];
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};w.confirm=()=>true;
  w.chrome={storage:{local:{get:async()=>({toolkitSettings:prefs})},onChanged:{addListener(){}}}};
  const source=d.querySelector(`[data-element-name="${kind==='task'?'description_textArea':'summary_textArea'}"]`);source.textContent=value;
  const style=d.createElement('style');style.textContent=read('descriptions.css');d.head.append(style);
  scripts.forEach(s=>w.eval(s));await delay(120);
  return{w,d,source,close(){w.__toolkitDescriptions.stop();w.close();}};
}
function open(ctx){ctx.d.querySelector('[data-tka-desc-clickable]').click();}
function click(ctx,text){const b=[...ctx.d.querySelectorAll('button')].find(b=>b.textContent===text);assert(b,`Missing button ${text}`);b.click();}
test('queued toolbar resize is harmless after mode switch, Cancel or task drawer removal',async()=>{
  for(const action of ['mode','cancel','navigation']){
    const ctx=await setup('task','**Original**');try{
    const errors=[];ctx.w.addEventListener('error',e=>{errors.push(e.error);e.preventDefault();});
    const metrics=ctx.d.createElement('style');metrics.textContent='.tka-visual-editor * {margin-left:0;margin-right:0}';ctx.d.head.append(metrics);
    Object.defineProperty(ctx.w.HTMLElement.prototype,'offsetWidth',{configurable:true,get(){return 32;}});
    Object.defineProperty(ctx.w.HTMLElement.prototype,'clientWidth',{configurable:true,get(){return 200;}});
    open(ctx);const resize=ctx.w.resizeObservers.at(-1);assert(resize);
    // Realistic narrow toolbar widths exercise the dropdown's removal path.
    resize.callback();resize.callback();
    if(action==='mode')click(ctx,'Plain text');
    else if(action==='cancel')click(ctx,'Cancel');
    else {ctx.d.querySelector('[data-element-name=view_task_drawer]').remove();ctx.w.__toolkitDescriptions.scan();}
    await delay(350);
    assert.deepEqual(errors,[]);
    assert.equal(ctx.d.querySelector('.toastui-editor-defaultUI'),null);assert(resize.disconnected);
    if(action==='mode'){
      assert.equal(ctx.d.querySelector('.tka-editor-source').value,'**Original**');
      click(ctx,'Visual');assert(ctx.d.querySelector('.toastui-editor-ww-container strong'));
      const newResize=ctx.w.resizeObservers.at(-1);newResize.callback();newResize.callback();await delay(350);
      assert.deepEqual(errors,[]);click(ctx,'Cancel');
    }else assert.equal(ctx.d.querySelector('.tka-editor-inline'),null);
    assert.equal(ctx.w.reads,0);
    }finally{ctx.close();}
  }
});
test('exactly two editor modes share the heading, with native action typography and reversible cleanup',async()=>{
  for(const kind of ['task','ticket']){
    const ctx=await setup(kind);try{
      const native=ctx.d.createElement('button');native.className='MuiButton-root MuiButton-text MuiButton-sizeSmall';native.textContent='Native Edit';native.style.cssText='font-family:Roboto;font-size:13px;font-weight:500;line-height:22.75px;border-radius:4px;color:rgb(4,24,99)';ctx.d.body.append(native);
      open(ctx);const group=ctx.d.querySelector('.tka-editor-modes');
      assert.deepEqual([...group.children].map(b=>b.textContent),['Visual','Plain text']);
      assert(group.parentElement.hasAttribute('data-tka-editor-heading'));assert(group.parentElement.querySelector('h6'));
      assert(!group.closest('.tka-editor-inline'));assert.equal(ctx.d.querySelector('.tka-editor-preview'),null);
      const cancel=ctx.d.querySelector('.tka-editor-actions button');assert.equal(cancel.style.fontSize,'13px');assert.equal(cancel.style.borderRadius,'4px');
      assert.equal(ctx.d.querySelector('.tka-primary').textContent,'Save');
      group.dispatchEvent(new ctx.w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
      assert.equal(ctx.d.querySelector('.tka-editor-modes'),null);assert.equal(ctx.d.querySelector('[data-tka-editor-heading]'),null);assert.equal(ctx.w.reads,0);
    }finally{ctx.close();}
  }
});
test('server changes block Save before opening native editing even when the visible source is stale',async()=>{
  const ctx=await setup();try{
    let opens=0;ctx.d.querySelector('[data-element-name=panel_description]').addEventListener('click',()=>opens++);
    open(ctx);ctx.d.querySelector('.tka-editor-source').value='My draft';ctx.w.savedDescription='Edited elsewhere';click(ctx,'Save');await delay(20);
    assert.equal(opens,0);assert.match(ctx.d.querySelector('.tka-editor-status').textContent,/saved description changed/);
    assert.equal(ctx.d.querySelector('.tka-editor-source').value,'My draft');assert.equal(ctx.d.querySelector('.tka-editor-source').readOnly,false);
  }finally{ctx.close();}
});
test('uncertain saves keep the draft and Check save never submits a second write',async()=>{
  const ctx=await setup();try{
    let saves=0;ctx.d.querySelector('[data-element-name=panel_description]').addEventListener('click',()=>{
      const wrap=ctx.d.createElement('div');wrap.setAttribute('data-element-name','description_editTextArea');const field=ctx.d.createElement('textarea');field.value=ctx.source.textContent;wrap.append(field);ctx.source.replaceWith(wrap);
      ctx.d.addEventListener('mousedown',()=>{saves++;wrap.replaceWith(ctx.source);});
    });
    open(ctx);ctx.d.querySelector('.tka-editor-source').value='My draft';click(ctx,'Save');click(ctx,'Save');await delay(1750);
    assert.equal(saves,1);assert.match(ctx.d.querySelector('.tka-editor-status').textContent,/not confirmed/);assert.equal(ctx.d.querySelector('.tka-editor-source').value,'My draft');assert(ctx.d.querySelector('.tka-editor-source').readOnly);
    ctx.w.savedDescription='My draft';click(ctx,'Check save');await delay(20);assert.equal(saves,1);assert.equal(ctx.d.querySelector('.tka-editor-inline'),null);
  }finally{ctx.close();}
});
test('changing the task in a reused drawer during the freshness read prevents a write',async()=>{
  const ctx=await setup();try{
    let resolve,opens=0;const fetch=ctx.w.fetch;ctx.w.fetch=(...args)=>new Promise(r=>{resolve=()=>r(fetch(...args));});
    ctx.d.querySelector('[data-element-name=panel_description]').addEventListener('click',()=>opens++);
    open(ctx);ctx.d.querySelector('.tka-editor-source').value='My draft';click(ctx,'Save');ctx.d.querySelector('[data-element-name=objectTitle]').textContent='#2019 Another task';resolve();await delay(20);
    assert.equal(opens,0);assert.match(ctx.d.querySelector('.tka-editor-status').textContent,/current record changed/);
  }finally{ctx.close();}
});
test('modern Save verifies the same trimmed text that the native task handler stores',async()=>{
  const ctx=await setup();try{
    ctx.d.querySelector('[data-element-name=panel_description]').addEventListener('click',()=>{
      const wrap=ctx.d.createElement('div');wrap.setAttribute('data-element-name','description_editTextArea');const field=ctx.d.createElement('textarea');field.value=ctx.source.textContent;wrap.append(field);ctx.source.replaceWith(wrap);
      ctx.d.addEventListener('mousedown',()=>{ctx.w.savedDescription=field.value.trim();ctx.source.textContent=ctx.w.savedDescription;wrap.replaceWith(ctx.source);});
    });
    open(ctx);ctx.d.querySelector('.tka-editor-source').value='  New text\n';click(ctx,'Save');await delay(160);
    assert.equal(ctx.w.savedDescription,'New text');assert.equal(ctx.d.querySelector('.tka-editor-inline'),null);
  }finally{ctx.close();}
});
test('empty descriptions returned as null can receive their first saved text',async()=>{
  const ctx=await setup('task','');try{
    ctx.w.savedDescription=null;
    ctx.d.querySelector('[data-element-name=panel_description]').addEventListener('click',()=>{
      const wrap=ctx.d.createElement('div');wrap.setAttribute('data-element-name','description_editTextArea');const field=ctx.d.createElement('textarea');wrap.append(field);ctx.source.replaceWith(wrap);
      ctx.d.addEventListener('mousedown',()=>{ctx.w.savedDescription=field.value;ctx.source.textContent=field.value;wrap.replaceWith(ctx.source);});
    });
    open(ctx);ctx.d.querySelector('.tka-editor-source').value='First description';click(ctx,'Save');await delay(160);
    assert.equal(ctx.w.savedDescription,'First description');assert.equal(ctx.d.querySelector('.tka-editor-inline'),null);
  }finally{ctx.close();}
});
test('clicking formatted task and ticket descriptions opens the visual editor without native editing',async()=>{
  for(const kind of ['task','ticket']){
    const ctx=await setup(kind,'**Click to edit**');try{
      let nativeClicks=0;ctx.source.parentElement.addEventListener('click',()=>nativeClicks++);
      ctx.d.querySelector('.tka-markdown strong').click();
      const inline=ctx.d.querySelector('.tka-editor-inline');assert(inline);assert(inline.closest('[data-element-name=panel_description], [data-element-name=panel_summary]'));assert.equal(ctx.d.querySelector('dialog'),null);assert.equal(ctx.d.querySelector('.tka-description-tools'),null);assert(ctx.d.querySelector('.toastui-editor-ww-container'));assert.equal(ctx.w.getComputedStyle(ctx.source).display,'none');
      assert.equal(nativeClicks,0);click(ctx,'Cancel');
      ctx.w.__toolkitDescriptions.applySettings({markdownEditor:false});await delay(120);
      ctx.d.querySelector('.tka-markdown strong').click();assert.equal(ctx.d.querySelector('.tka-editor-inline'),null);
    }finally{ctx.close();}
  }
});
test('Markdown renders headings, lists, tables and disabled checkboxes; hostile HTML and links stay inert',async()=>{
  const ctx=await setup();try{
    const M=ctx.w.ToolkitMarkdown,host=ctx.d.createElement('div');
    host.append(M.render('# Heading\n\n**Bold** and `code`\n\n- [x] Done\n- [ ] Next\n\n| A | B |\n|---|---|\n|1|2|\n\n<script>alert(1)</script>\n\n[x](javascript:alert(1))\n\n![remote](https://example.com/track.png)'));
    assert.equal(host.querySelector('h1').textContent,'Heading');assert.equal(host.querySelector('strong').textContent,'Bold');assert(host.querySelector('table'));
    assert.equal(host.querySelectorAll('input:disabled').length,2);assert.equal(host.querySelectorAll('script,img,iframe,svg,style').length,0);
    for(const a of host.querySelectorAll('a'))assert(!/javascript:/i.test(a.getAttribute('href')||''));
    assert.equal(M.isMarkdown('Phase: Setup\nA normal sentence. https://example.com'),false);
    assert.equal(M.isMarkdown('**Formatted**'),true);assert.equal(M.visualSafe('<iframe src=x></iframe>'),false);
  }finally{ctx.close();}
});
test('inline editor replaces the read view, restores it on Cancel and keeps mode clicks inside the editor',async()=>{
  const ctx=await setup('task','**Only one copy**');try{
    let native=0;const panel=ctx.d.querySelector('[data-element-name="panel_description"]');panel.addEventListener('click',()=>native++);
    open(ctx);assert.equal(ctx.w.getComputedStyle(ctx.source.parentElement).display,'none');
    click(ctx,'Plain text');click(ctx,'Plain text');assert.equal(native,0);assert.equal(ctx.d.querySelectorAll('.tka-editor-inline').length,1);
    click(ctx,'Cancel');await delay(120);
    assert.equal(ctx.d.querySelector('.tka-editor-inline'),null);assert.equal(ctx.w.getComputedStyle(ctx.source).display,'none');
    assert.notEqual(ctx.w.getComputedStyle(ctx.source.parentElement).display,'none');assert(ctx.d.querySelector('.tka-markdown strong'));
    ctx.w.__toolkitDescriptions.scan();assert.equal(ctx.d.querySelectorAll('.tka-markdown').length,1);
  }finally{ctx.close();}
});
test('keyboard opens inline editing and read-only descriptions do not intercept clicks',async()=>{
  const ctx=await setup('task','Plain description');try{
    ctx.source.dispatchEvent(new ctx.w.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));assert(ctx.d.querySelector('.tka-editor-inline'));
    ctx.d.querySelector('.tka-editor-inline').dispatchEvent(new ctx.w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await delay(120);
    assert.equal(ctx.d.querySelector('.tka-editor-inline'),null);
    ctx.d.querySelector('[data-element-name="panel_description"]').className='readonly';ctx.w.__toolkitDescriptions.scan();ctx.source.click();assert.equal(ctx.d.querySelector('.tka-editor-inline'),null);
  }finally{ctx.close();}
});
test('task display, placement and full text switches are independent and reversible',async()=>{
  const ctx=await setup('task','# Hello\n\n**World**',{descriptionTop:true});try{
    assert(ctx.d.querySelector('.tka-markdown h1'));assert(ctx.source.hasAttribute('data-tka-desc-hidden'));assert.equal(ctx.w.getComputedStyle(ctx.source).display,'none');
    const group=ctx.d.querySelector('#description-group');assert(group.hasAttribute('data-tka-desc-top'));assert(group.hasAttribute('data-tka-desc-full'));
    assert.equal(ctx.d.querySelector('#checklist').parentElement,group);assert(!ctx.d.querySelector('#checklist').hasAttribute('data-tka-desc-paper'));
    ctx.w.__toolkitDescriptions.applySettings({enabled:false,markdownDisplay:false,markdownEditor:false,descriptionTop:false,descriptionExpanded:false});await delay(120);
    assert.equal(ctx.d.querySelector('.tka-markdown'),null);assert(!ctx.source.hasAttribute('data-tka-desc-hidden'));assert(!group.hasAttribute('data-tka-desc-top'));assert(!group.hasAttribute('data-tka-desc-full'));assert.equal(ctx.source.textContent,'# Hello\n\n**World**');
  }finally{ctx.close();}
});
test('ticket summary is scoped to tickets; plain text remains native',async()=>{
  const ctx=await setup('ticket');try{
    assert(ctx.d.querySelector('[data-tka-desc-clickable]'));assert.equal(ctx.d.querySelector('.tka-markdown'),null);
    ctx.w.history.pushState({},'','/app/contacts/1995');ctx.w.__toolkitDescriptions.scan();assert.equal(ctx.d.querySelector('[data-tka-desc-clickable]'),null);
  }finally{ctx.close();}
});
test('opening, switching modes and applying an unchanged draft does not activate the native editor',async()=>{
  const original='A plain description.\n\nKeep  two spaces.\n';const ctx=await setup('task',original);try{
    let nativeClicks=0;ctx.d.querySelector('[data-element-name="panel_description"]').addEventListener('click',()=>nativeClicks++);
    open(ctx);click(ctx,'Plain text');click(ctx,'Plain text');assert.equal(ctx.d.querySelector('.tka-editor-source').value,original);
    click(ctx,'Save');assert.equal(nativeClicks,0);assert.equal(ctx.d.querySelector('.tka-editor-inline'),null);assert.equal(ctx.source.textContent,original);
  }finally{ctx.close();}
});
test('real visual editor formats content and preserves unchanged Markdown source on a round trip',async()=>{
  const original='# Title\n\n**Bold**\n\n- One\n- Two\n';const ctx=await setup('task',original);try{
    open(ctx);click(ctx,'Visual');
    assert(ctx.d.querySelector('.toastui-editor-ww-container .ProseMirror'),'Visual editor must start, not fall back');
    assert(ctx.d.querySelector('.toastui-editor-ww-container strong'));
    click(ctx,'Plain text');assert.equal(ctx.d.querySelector('.tka-editor-source').value,original);
    click(ctx,'Visual');const edit=ctx.d.querySelector('.toastui-editor-ww-container .ProseMirror');assert(edit);
    // Exercise the actual editor command through the instance using a test-only factory wrapper below.
    click(ctx,'Cancel');assert.equal(ctx.source.textContent,original);
  }finally{ctx.close();}
});
test('actual WYSIWYG input serialises changes back to Markdown',async()=>{
  const ctx=await setup('task','Hello');try{
    const Real=ctx.w.ToolkitMarkdown.Editor;let instance;
    ctx.w.ToolkitMarkdown.Editor=class extends Real{constructor(o){super(o);instance=this;}};
    open(ctx);click(ctx,'Visual');assert(instance);
    instance.moveCursorToEnd(false);instance.insertText(' world');click(ctx,'Plain text');
    assert.match(ctx.d.querySelector('.tka-editor-source').value,/Hello world/);
    assert.equal(ctx.source.textContent,'Hello');
  }finally{ctx.close();}
});
test('Visual editing retains lists, task checks, tables, code and links',async()=>{
  const original='# Title\n\n- [x] Done\n- [ ] Next\n\n| A | B |\n| --- | --- |\n| 1 | 2 |\n\n```js\nconst a = 1;\n```\n\n[Link](https://example.com)';
  const ctx=await setup('task',original);try{
    const Real=ctx.w.ToolkitMarkdown.Editor;let instance;ctx.w.ToolkitMarkdown.Editor=class extends Real{constructor(o){super(o);instance=this;}};
    open(ctx);click(ctx,'Visual');assert(instance);instance.moveCursorToEnd(false);instance.insertText(' Added');click(ctx,'Plain text');
    const value=ctx.d.querySelector('.tka-editor-source').value;
    assert.match(value,/\[x\] Done/);assert.match(value,/\[ \] Next/);assert.match(value,/\| A \| B \|/);assert.match(value,/const a = 1/);assert.match(value,/https:\/\/example.com/);
  }finally{ctx.close();}
});
test('native input handoff updates real React controlled state and survives a rerender',async()=>{
  const ctx=await setup('ticket','Original');let mounted;
  try{
    const script=require('esbuild').buildSync({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import {flushSync} from 'react-dom';
      window.mountField=(host)=>{function Field(){const [value,setValue]=React.useState('Original');const [revision,setRevision]=React.useState(0);window.rerenderField=()=>flushSync(()=>setRevision(n=>n+1));return React.createElement('textarea',{'data-revision':revision,value,onChange:e=>{window.acceptedValue=e.target.value;setValue(e.target.value);}});}const root=createRoot(host);flushSync(()=>root.render(React.createElement(Field)));return root;};`,resolveDir:path.join(__dirname,'..')},bundle:true,format:'iife',write:false,define:{'process.env.NODE_ENV':'"production"'}}).outputFiles[0].text;
    ctx.w.eval(script);
    ctx.d.addEventListener('mousedown',()=>{ctx.w.savedDescription=ctx.w.acceptedValue;});
    ctx.d.querySelector('[data-element-name="summary_editButton"]').addEventListener('click',()=>{
      const wrap=ctx.d.createElement('div');wrap.setAttribute('data-testid','CrayonTextarea__formControl');wrap.setAttribute('data-element-name','editableSummary_textArea');ctx.source.replaceWith(wrap);mounted=ctx.w.mountField(wrap);
    });
    open(ctx);ctx.d.querySelector('.tka-editor-source').value='**Changed**';click(ctx,'Save');await delay(160);
    assert.equal(ctx.w.acceptedValue,'**Changed**');ctx.w.rerenderField();assert.equal(ctx.d.querySelector('textarea').value,'**Changed**');
  }finally{mounted?.unmount();ctx.close();}
});
test('Save uses native input and save once, then verifies persistence',async()=>{
  for(const kind of ['task','ticket']){
    const ctx=await setup(kind);try{
      let inputEvents=0,saves=0;const native=ctx.d.querySelector(`[data-element-name="${kind==='task'?'panel_description':'summary_editButton'}"]`);
      native.addEventListener('click',()=>{
        const wrap=ctx.d.createElement('div');wrap.setAttribute('data-testid','CrayonTextarea__formControl');wrap.setAttribute('data-element-name',kind==='task'?'description_editTextArea':'editableSummary_textArea');
        const field=ctx.d.createElement('textarea');field.value=ctx.source.textContent;field.addEventListener('input',()=>inputEvents++);wrap.append(field);ctx.source.replaceWith(wrap);
        ctx.d.addEventListener('mousedown',()=>{saves++;ctx.w.savedDescription=field.value;ctx.source.textContent=field.value;wrap.replaceWith(ctx.source);});
      });
      open(ctx);ctx.d.querySelector('.tka-editor-source').value='## New description\n\n- A\n- B';click(ctx,'Save');await delay(160);
      assert.equal(inputEvents,1);assert.equal(saves,1);assert.equal(ctx.w.reads,2);assert.equal(ctx.d.querySelector('.tka-editor-inline'),null);assert.equal(ctx.d.querySelector('.tka-native-hint'),null);
      assert.equal(ctx.w.savedDescription,'## New description\n\n- A\n- B');
    }finally{ctx.close();}
  }
});
test('stale or unsafe drafts are retained and never transferred',async()=>{
  const ctx=await setup();try{
    let calls=0;ctx.d.querySelector('[data-element-name="panel_description"]').addEventListener('click',()=>calls++);
    open(ctx);ctx.d.querySelector('.tka-editor-source').value='Edited';ctx.source.textContent='Changed elsewhere';click(ctx,'Save');
    assert.equal(calls,0);assert.match(ctx.d.querySelector('.tka-editor-status').textContent,/changed/);click(ctx,'Cancel');
    open(ctx);ctx.d.querySelector('.tka-editor-source').value='<script>alert(1)</script>';click(ctx,'Save');assert.equal(calls,0);assert.match(ctx.d.querySelector('.tka-editor-status').textContent,/removes HTML/);
  }finally{ctx.close();}
});
test('read-only tasks do not get an edit button; SPA replacement cleans old previews',async()=>{
  const ctx=await setup('task','**Old**');try{
    ctx.d.querySelector('[data-element-name="panel_description"]').className='DescriptionPanel_readonly';ctx.w.__toolkitDescriptions.scan();assert.equal(ctx.d.querySelector('[data-tka-desc-clickable]'),null);
    ctx.source.textContent='**New**';await delay(120);assert.equal(ctx.d.querySelector('.tka-markdown strong').textContent,'New');
    ctx.d.querySelector('[data-element-name="view_task_drawer"]').remove();await delay(120);assert.equal(ctx.w.__toolkitDescriptions.records.size,0);
  }finally{ctx.close();}
});
test('legacy task adapter invokes the existing native Save once and verifies persistence',async()=>{
  const ctx=await setup();try{
    ctx.d.querySelector('[data-element-name="view_task_drawer"]').remove();
    ctx.w.history.replaceState({},'','/?action=view_task&id=2018');ctx.w.savedDescription='**Legacy**';
    const container=ctx.d.createElement('div');container.setAttribute('data','TaskDescriptionController.task.description');
    const read=ctx.d.createElement('div');read.className='taskDetailsDescriptionTextarea edit_enabled';
    const value=ctx.d.createElement('div');value.className='activity_body_edit';value.textContent='**Legacy**';read.append(value);
    const state=ctx.d.createElement('div');state.className='inline_edit_state ng-hide';const field=ctx.d.createElement('textarea');field.value='**Legacy**';state.append(field);container.append(read,state);ctx.d.body.append(container);
    let saves=0;const save=ctx.d.createElement('button');save.className='save_inline_edit';state.append(save);save.addEventListener('click',()=>{saves++;ctx.w.savedDescription=field.value;value.textContent=field.value;state.classList.add('ng-hide');read.classList.remove('ng-hide');});
    read.addEventListener('click',()=>{read.classList.add('ng-hide');state.classList.remove('ng-hide');});
    ctx.w.__toolkitDescriptions.scan();assert(container.querySelector('.tka-markdown strong'));
    open(ctx);click(ctx,'Plain text');ctx.d.querySelector('.tka-editor-source').value='**Updated**';click(ctx,'Save');await delay(160);
    assert.equal(field.value,'**Updated**');assert.equal(saves,1);assert.equal(ctx.w.savedDescription,'**Updated**');assert.equal(container.querySelector('.tka-editor-inline'),null);
    state.classList.add('ng-hide');await delay(120);assert.equal(container.querySelector('.tka-native-hint'),null);
  }finally{ctx.close();}
});
test('checklist cleanup does not remove description tools or previews',async()=>{
  const ctx=await setup('task','# Description');try{
    ctx.w.fetch=async()=>{throw new Error('No task rows in fixture');};ctx.w.eval(read('content.js'));await delay(150);
    ctx.w.__toolkitAccelo.applySettings({enabled:false});await delay(150);
    assert(ctx.d.querySelector('.tka-markdown h1'));assert(ctx.d.querySelector('[data-tka-desc-clickable]'));
    ctx.w.__toolkitAccelo.stop();
  }finally{ctx.close();}
});
