const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'../extension');
test('bundled editor lifecycle patch is present and rejects unexpected dependency source',()=>{
  const patch=require('../scripts/editor-lifecycle-patch.cjs');
  assert.throws(()=>patch('unrecognised editor source'),/no longer matches/);
  const source=fs.readFileSync(path.join(__dirname,'../node_modules/@toast-ui/editor/dist/esm/index.js'),'utf8');
  const patched=patch(source);assert(patched.includes('if (_this.toolkitDestroyed) { return; }'));assert(patched.includes('this.toolkitDestroyed = true;'));
  assert(fs.readFileSync(path.join(root,'vendor/markdown.js'),'utf8').includes('toolkitDestroyed'));
});

test('the shipped background starts without identity access or Outlook dependencies',async()=>{
  const vm=require('node:vm'),listeners=[],actions=[],stored={};
  const session={setAccessLevel:async()=>{},get:async key=>({[key]:stored[key]}),set:async values=>Object.assign(stored,values),remove:async()=>{}};
  const context=vm.createContext({URL,URLSearchParams,TextEncoder,TextDecoder,Uint8Array,AbortSignal,crypto:require('node:crypto').webcrypto,btoa,fetch,setTimeout,clearTimeout,chrome:{
    runtime:{id:'test',getURL:path=>'chrome-extension://test/'+path,onMessage:{addListener:fn=>listeners.push(fn)},openOptionsPage(){stored.opened=true;}},
    storage:{session,local:{get:async()=>({})}},action:{onClicked:{addListener:fn=>actions.push(fn)}}
  }});
  context.importScripts=()=>assert.fail('No experimental code should be imported');
  vm.runInContext(fs.readFileSync(path.join(root,'background.js'),'utf8'),context);
  assert.equal(listeners.length,1);assert.equal(actions.length,1);
  actions[0]();assert.equal(stored.opened,true);
  assert.equal(listeners[0]({type:'toolkit-outlook:status'},{id:'test'},()=>assert.fail('Outlook must be inactive')),undefined);
});
test('package is Manifest V3, tenant-scoped and contains all declared local assets',()=>{
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
  assert.equal(manifest.name,'Toolkit for Accelo');assert.equal(manifest.manifest_version,3);
  assert.deepEqual(manifest.permissions,['storage']);
  assert.equal(manifest.optional_host_permissions,undefined);
  assert(!JSON.stringify(manifest).match(/outlook|microsoft|identity/i));
  assert(!fs.readdirSync(root).some(file=>/outlook/i.test(file)));
  assert.deepEqual(manifest.content_scripts[0].matches,['https://*.accelo.com/*']);
  assert.deepEqual(manifest.host_permissions,['https://d203gnlohy77cz.cloudfront.net/*','https://d23xudf289lfof.cloudfront.net/*']);assert.equal(manifest.action.default_popup,undefined);assert.equal(manifest.options_ui.open_in_tab,true);
  for(const script of manifest.content_scripts) assert.deepEqual(script.matches,['https://*.accelo.com/*']);
  assert.equal(manifest.content_scripts[0].world,'MAIN');assert.equal(manifest.content_scripts[0].run_at,'document_start');
  const files=[...manifest.content_scripts.flatMap(s=>[...(s.js||[]),...(s.css||[])]),manifest.background.service_worker,manifest.options_ui.page];
  for (const size of [16,32,48,128]) {
    const file=manifest.icons[String(size)];assert(file,`Missing ${size}px manifest icon`);
    const png=fs.readFileSync(path.join(root,file));
    assert.equal(png.subarray(1,4).toString(),'PNG');
    assert.equal(png.readUInt32BE(16),size);assert.equal(png.readUInt32BE(20),size);
  }
  for (const size of [16,32]) assert.equal(manifest.action.default_icon[String(size)],manifest.icons[String(size)]);
  for(const file of files) assert(fs.existsSync(path.join(root,file)),file);
  for(const name of ['core.js','content.js','settings.js','descriptions.js','theme.js','background.js','inbox.js','timesheet-core.js','timesheet-bridge.js','timesheets.js']) {
    const text=fs.readFileSync(path.join(root,name),'utf8');
    assert(!/\beval\s*\(|new Function|\.innerHTML\s*=/.test(text),`Unsafe code path in ${name}`);
  }
});
