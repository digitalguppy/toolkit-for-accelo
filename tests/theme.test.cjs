const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {JSDOM}=require('jsdom');
const root=path.join(__dirname,'..');
const source=fs.readFileSync(path.join(root,'extension/theme.js'),'utf8');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
async function setup(theme, systemDark=false, deferred=false) {
  const dom=new JSDOM('<html><body><div id="original">Description and checklist</div></body></html>',{url:'https://example-team.accelo.com/app/projects/45',runScripts:'outside-only'});
  const w=dom.window, calls=[], media=new Map();let changed, resolve;
  w.matchMedia=q=>{if(!media.has(q))media.set(q,{matches:q.includes('prefers')&&systemDark,listeners:[],addEventListener(_,f){this.listeners.push(f);}});return media.get(q);};
  w.ToolkitThemeEngine={enable:(o,f)=>{calls.push('enable');w.document.documentElement.dataset.darkreaderMode='dynamic';},disable:()=>{calls.push('disable');delete w.document.documentElement.dataset.darkreaderMode;},setFetchMethod:f=>{}};
  w.chrome={storage:{local:{get:()=>deferred?new Promise(r=>resolve=r):Promise.resolve({toolkitSettings:{theme}})},onChanged:{addListener:f=>changed=f}},runtime:{}};
  w.eval(source);await tick();
  return {w,dom,calls,change(value,area='local'){changed({toolkitSettings:{newValue:{theme:value}}},area);},resolve(value){resolve({toolkitSettings:{theme:value}});},media(q,value){const m=media.get(q);m.matches=value;m.listeners.forEach(f=>f());}};
}
test('appearance defaults to unchanged Light and does not depend on checklist state',async t=>{
  const c=await setup(undefined,true);t.after(()=>c.dom.window.close());
  assert.deepEqual(c.calls,[]);c.change('dark');assert.deepEqual(c.calls,['enable']);c.change('dark');assert.equal(c.calls.length,1);
  c.change('light');assert.deepEqual(c.calls,['enable','disable']);assert(!c.w.document.documentElement.hasAttribute('data-tka-theme'));
  assert.equal(c.w.document.getElementById('original').textContent,'Description and checklist');
  assert.equal(c.w.document.querySelectorAll('[data-tka-theme-source]').length,0);
});
test('System tracks live device changes; explicit mode ignores them',async t=>{
  const c=await setup('system');t.after(()=>c.dom.window.close());
  c.media('(prefers-color-scheme: dark)',true);assert.equal(c.calls.at(-1),'enable');
  c.media('(prefers-color-scheme: dark)',false);assert.equal(c.calls.at(-1),'disable');
  c.change('dark');c.media('(prefers-color-scheme: dark)',false);assert.equal(c.calls.at(-1),'enable');
  c.change('light','sync');assert.equal(c.calls.at(-1),'enable');
});
test('print and forced colors temporarily restore native presentation',async t=>{
  const c=await setup('dark');t.after(()=>c.dom.window.close());
  c.w.dispatchEvent(new c.w.Event('beforeprint'));assert.equal(c.calls.at(-1),'disable');
  c.w.dispatchEvent(new c.w.Event('afterprint'));assert.equal(c.calls.at(-1),'enable');
  c.media('(forced-colors: active)',true);assert.equal(c.calls.at(-1),'disable');
  c.media('(forced-colors: active)',false);assert.equal(c.calls.at(-1),'enable');
});
test('late preference reads cannot undo a newer selection and invalid values restore Light',async t=>{
  const c=await setup('light',false,true);t.after(()=>c.dom.window.close());
  c.change('dark');c.resolve('light');await tick();assert.deepEqual(c.calls,['enable']);
  c.change('unknown');assert.equal(c.calls.at(-1),'disable');
});
test('an existing external dark theme is not removed or stacked',async t=>{
  const c=await setup('light');t.after(()=>c.dom.window.close());
  c.w.document.documentElement.dataset.darkreaderMode='dynamic';c.change('dark');c.change('light');assert.deepEqual(c.calls,[]);
});
test('theme bundle leaves chrome runtime untouched and has no inline script injection',()=>{
  const patch=require('../scripts/theme-vendor-patch.cjs');
  assert.throws(()=>patch('changed upstream source'),/no longer matches/);
  const output=patch(fs.readFileSync(path.join(root,'node_modules/darkreader/darkreader.mjs'),'utf8'));
  assert(output.source.includes('const chrome = {runtime: {}};'));
  assert(!output.source.includes('window.chrome ='));
  assert(!output.source.includes('proxyScript.append('));
  assert(output.proxy.includes('__tka_theme_proxy_start'));
  assert(fs.readFileSync(path.join(root,'extension/vendor/theme.js'),'utf8').includes('ToolkitThemeEngine'));
});
function background(fetcher) {
  let listener;const context={importScripts(){},URL,TextDecoder,Uint8Array,AbortSignal,fetch:fetcher,chrome:{runtime:{id:'toolkit',onMessage:{addListener:f=>listener=f},openOptionsPage(){}},action:{onClicked:{addListener(){}}}}};
  vm.runInNewContext(fs.readFileSync(path.join(root,'extension/background.js'),'utf8'),context);
  const sender={id:'toolkit',tab:{id:1},url:'https://example-team.accelo.com/app/projects/45'};
  return (url,override={})=>new Promise(resolve=>listener({type:'tka-theme-css',url},{...sender,...override},resolve));
}
test('stylesheet bridge only reads approved CSS without cookies and reuses successful reads',async()=>{
  let calls=0;const read=background(async(url,options)=>{calls++;assert.equal(options.credentials,'omit');assert.equal(options.redirect,'error');assert.equal(options.referrerPolicy,'no-referrer');return new Response('body {color: navy}',{headers:{'content-type':'text/css'}});});
  const url='https://d203gnlohy77cz.cloudfront.net/abc/_next/static/css/test.css';
  assert.equal((await read(url)).css,'body {color: navy}');assert.equal((await read(url)).ok,true);assert.equal(calls,1);
  for(const bad of ['https://evil.example/test.css','https://example-team.accelo.com/app/tasks/2018','https://d203gnlohy77cz.cloudfront.net/secret.json',url+'?token=123','http://d203gnlohy77cz.cloudfront.net/test.css']) assert.equal((await read(bad)).ok,false);
  assert.equal((await read(url,{url:'https://evil.example/'})).ok,false);
  assert.equal((await read(url,{url:'https://second-team.accelo.com/app/projects/1'})).ok,true);
  for(const senderURL of ['https://accelo.com/','https://team.accelo.com.evil.test/','http://team.accelo.com/','https://user@team.accelo.com/','https://team.accelo.com:8443/'])assert.equal((await read(url,{url:senderURL})).ok,false);
  assert.equal((await read(url,{id:'another-extension'})).ok,false);assert.equal(calls,1);
});
test('invalid, failed and oversized CSS responses are rejected and failures can be retried',async()=>{
  let calls=0;const read=background(async()=>{calls++;return new Response(calls===3?'x'.repeat(4*1024*1024+1):'oops',{status:calls===1?503:200,headers:{'content-type':calls===2?'text/html':'text/css'}});});
  for(let i=0;i<3;i++)assert.equal((await read('https://d23xudf289lfof.cloudfront.net/6.12.457/css/main.css')).ok,false);
  assert.equal(calls,3);
});

test('font-only imports are skipped without sending a background request',async()=>{
  let fetchStyle,calls=0;
  const dom=new JSDOM('',{url:'https://example-team.accelo.com/app/projects/45',runScripts:'outside-only'});
  try {
    const w=dom.window;w.Response=Response;
    w.matchMedia=()=>({matches:false,addEventListener(){}});
    w.ToolkitThemeEngine={setFetchMethod:f=>fetchStyle=f};
    w.chrome={storage:{local:{get:async()=>({})},onChanged:{addListener(){}}},runtime:{sendMessage:async()=>{calls++;return{ok:true,css:'body{}'};}}};
    w.eval(source);await tick();
    assert.equal(await (await fetchStyle('https://fonts.googleapis.com/css2?family=Roboto')).text(),'');
    assert.equal(calls,0);
    assert.equal(await (await fetchStyle('https://d203gnlohy77cz.cloudfront.net/build/styles.css')).text(),'body{}');
    assert.equal(calls,1);
  } finally {dom.window.close();}
});
