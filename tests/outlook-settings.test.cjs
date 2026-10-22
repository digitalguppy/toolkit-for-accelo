const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');
const C = require('../extension/core.js');
const root = path.join(__dirname, '../experimental/outlook');
const tick = () => new Promise(resolve => setImmediate(resolve));
const clientId = '12345678-1234-1234-1234-123456789abc';

async function setup(raw = {}, options = {}) {
  const dom = new JSDOM(fs.readFileSync(path.join(root, 'settings.html'), 'utf8'), {runScripts:'outside-only', url:'https://toolkit.test/settings.html#inbox'});
  const w = dom.window, saves = [], messages = [], permissions = [], order = [];
  let saved = {...raw}, connected = !!options.connected;
  w.matchMedia = () => ({matches:false, addEventListener() {}});
  w.chrome = {
    storage:{local:{get:async () => ({toolkitSettings:saved}), set:async value => {order.push('save'); if (options.failSave) throw new Error('No storage'); saved = {...value.toolkitSettings}; saves.push(saved);}}},
    permissions:{request:async value => {order.push('permission'); permissions.push(value); return options.allowPermission !== false;}},
    runtime:{sendMessage:async message => {
      order.push(message.type); messages.push(message);
      if (message.type === 'toolkit-outlook:connect') connected = true;
      if (message.type === 'toolkit-outlook:disconnect') connected = false;
      return {ok:true,connected,email:connected ? 'tester@example.com' : '',redirectUrl:'https://toolkit.chromiumapp.org/outlook',lastSync:options.lastSync || null};
    }}
  };
  w.eval(fs.readFileSync(path.join(__dirname,'../extension/core.js'),'utf8'));
  w.eval(fs.readFileSync(path.join(root,'settings.js'),'utf8'));
  await tick();
  return {dom,w,saves,messages,permissions,order,d:w.document,async change(selector,value) {const input = w.document.querySelector(selector); if (input.type === 'radio' || input.type === 'checkbox') input.checked = value; else input.value = value; input.dispatchEvent(new w.Event('change',{bubbles:true})); await tick();},async click(id) {w.document.getElementById(id).click(); await tick();}};
}

test('Outlook preferences default off and reject invalid modes, app IDs and authority paths', () => {
  assert.equal(C.settings().outlookSyncMode,'none');
  assert.equal(C.settings().outlookClientId,'');
  assert.equal(C.settings().outlookTenant,'organizations');
  for (const mode of ['none','read','archive','read_archive']) assert.equal(C.settings({outlookSyncMode:mode}).outlookSyncMode,mode);
  for (const mode of ['delete',true,'READ',{},null]) assert.equal(C.settings({outlookSyncMode:mode}).outlookSyncMode,'none');
  assert.equal(C.settings({outlookClientId:' '+clientId.toUpperCase()+' '}).outlookClientId,clientId);
  for (const bad of ['secret','https://bad.test','000',null]) assert.equal(C.settings({outlookClientId:bad}).outlookClientId,'');
  for (const good of ['organizations',clientId,'digitalguppy.com','tenant.onmicrosoft.com']) assert.equal(C.settings({outlookTenant:good}).outlookTenant,good);
  for (const bad of ['common','consumers','x/y','https://example.com','x?redirect=bad','-x.com','x..com','x.com:443']) assert.equal(C.settings({outlookTenant:bad}).outlookTenant,'organizations');
});

test('settings expose all four choices, never connect on load and preserve unrelated preferences',async t=>{
  const ctx=await setup({theme:'dark',requestsDelete:false,enabled:false,retainerUnapproved:false});t.after(()=>ctx.dom.window.close());
  assert.equal(ctx.d.querySelector('.settings-panel:not([hidden])').id,'panel-inbox');
  assert.equal(ctx.d.querySelectorAll('[name="outlookSyncMode"]').length,4);
  assert.equal(ctx.d.querySelector('[name="outlookSyncMode"]:checked').value,'none');
  assert.equal(ctx.saves.length,0);assert.equal(ctx.permissions.length,0);
  assert.deepEqual(JSON.parse(JSON.stringify(ctx.messages)),[{type:'toolkit-outlook:status'}]);
  for(const mode of ['read','archive','read_archive','none']) {
    await ctx.change(`[name="outlookSyncMode"][value="${mode}"]`,true);
    assert.equal(ctx.saves.at(-1).outlookSyncMode,mode);
    assert.equal(ctx.saves.at(-1).theme,'dark');assert.equal(ctx.saves.at(-1).requestsDelete,false);
    assert.equal(ctx.saves.at(-1).enabled,false);assert.equal(ctx.saves.at(-1).retainerUnapproved,false);
  }
  assert.equal(ctx.permissions.length,0);
  assert.equal(ctx.messages.filter(m=>m.type==='toolkit-outlook:connect').length,0);
});

test('connect requests only optional Microsoft and Accelo origins before awaiting settings and keeps sync off',async t=>{
  const ctx=await setup();t.after(()=>ctx.dom.window.close());
  ctx.d.getElementById('outlookClientId').value=clientId;
  await ctx.click('outlook-connect');
  assert.equal(ctx.permissions.length,1);
  assert.deepEqual(JSON.parse(JSON.stringify(ctx.permissions[0])),{origins:['https://graph.microsoft.com/*','https://login.microsoftonline.com/*','https://digitalguppy.accelo.com/*']});
  assert(ctx.order.indexOf('permission')<ctx.order.indexOf('save'));
  assert(ctx.order.indexOf('save')<ctx.order.indexOf('toolkit-outlook:connect'));
  assert.equal(ctx.saves.at(-1).outlookClientId,clientId);
  assert.equal(ctx.saves.at(-1).outlookSyncMode,'none');
  assert.match(ctx.d.getElementById('outlook-connection-status').textContent,/Connected as tester@example.com/);
  assert.equal(ctx.d.getElementById('outlook-disconnect').hidden,false);
  assert.equal(ctx.d.getElementById('outlook-redirect').value,'https://toolkit.chromiumapp.org/outlook');
  await ctx.click('outlook-disconnect');
  assert.match(ctx.d.getElementById('outlook-connection-status').textContent,/not connected/);
  assert.equal(ctx.d.getElementById('outlook-disconnect').hidden,true);
});

test('invalid setup, declined optional access and failed storage never invoke Microsoft sign-in',async t=>{
  for(const options of [{},{allowPermission:false},{failSave:true}]) {
    const ctx=await setup({},options);t.after(()=>ctx.dom.window.close());
    if(Object.keys(options).length)ctx.d.getElementById('outlookClientId').value=clientId;
    await ctx.click('outlook-connect');
    assert.equal(ctx.messages.filter(m=>m.type==='toolkit-outlook:connect').length,0);
    assert.equal(ctx.d.getElementById('outlook-connection-status').dataset.error,'true');
    assert.equal(ctx.d.getElementById('outlook-connect').disabled,false);
  }
});

test('connection results render as text, failed results remain visible and config changes preserve mode',async t=>{
  const ctx=await setup({outlookSyncMode:'read_archive',outlookClientId:clientId},{connected:true,lastSync:{state:'uncertain',summary:'<img src=x> Save could not be verified.',at:123}});t.after(()=>ctx.dom.window.close());
  assert.equal(ctx.d.getElementById('outlookClientId').value,clientId);
  assert.equal(ctx.d.getElementById('outlook-last-result').querySelector('img'),null);
  assert.match(ctx.d.getElementById('outlook-last-result').textContent,/Save could not be verified/);
  assert.equal(ctx.d.getElementById('outlook-last-result').dataset.error,'true');
  await ctx.change('#outlookTenant','digitalguppy.com');
  assert.equal(ctx.saves.at(-1).outlookTenant,'digitalguppy.com');
  assert.equal(ctx.saves.at(-1).outlookSyncMode,'read_archive');
  await ctx.change('[name="theme"][value="dark"]',true);
  assert.equal(ctx.saves.at(-1).outlookClientId,clientId);
  assert.equal(ctx.saves.at(-1).outlookTenant,'digitalguppy.com');
});
