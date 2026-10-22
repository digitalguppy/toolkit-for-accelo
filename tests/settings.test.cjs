const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');
const C = require('../extension/core.js');
const extension = path.join(__dirname, '../extension');
const tick = () => new Promise(resolve => setImmediate(resolve));

test('sidebar reveals one section and Inbox and Requests save independently',async t=>{
  const ctx=await setup({inboxDelete:false,requestsDelete:true});t.after(()=>ctx.dom.window.close());
  const d=ctx.w.document;
  assert.equal(d.querySelectorAll('.settings-panel:not([hidden])').length,1);
  assert.equal(d.querySelector('.settings-panel:not([hidden])').id,'panel-general');
  d.querySelector('[data-section="inbox"]').click();
  assert.equal(d.querySelector('.settings-panel:not([hidden])').id,'panel-inbox');
  assert.equal(d.getElementById('inboxDelete').checked,false);
  assert.equal(d.getElementById('requestsDelete').checked,true);
  d.getElementById('requestsDelete').checked=false;
  d.getElementById('requestsDelete').dispatchEvent(new ctx.w.Event('change',{bubbles:true}));await tick();
  assert.equal(ctx.saves.at(-1).requestsDelete,false);assert.equal(ctx.saves.at(-1).inboxDelete,false);
  await ctx.choose('#inboxDelete');assert.equal(ctx.saves.at(-1).inboxDelete,true);assert.equal(ctx.saves.at(-1).requestsDelete,false);
  d.querySelector('[data-section="timesheets"]').click();
  assert.equal(d.querySelectorAll('.settings-panel:not([hidden])').length,1);
  assert.match(d.querySelector('#panel-timesheets').textContent,/Weekly timesheet/);
  assert.equal(d.querySelector('#weeklyTimers').checked,true);
});

test('legacy combined inbox preference migrates and explicit Requests preference takes priority',()=>{
  assert.equal(C.settings({inboxDelete:false}).requestsDelete,false);
  assert.equal(C.settings({inboxDelete:false,requestsDelete:true}).requestsDelete,true);
});

test('retainer usage columns default on and save independently in their own section',async t=>{
  assert.equal(C.settings().retainerCurrent,true);
  assert.equal(C.settings().retainerPrevious,true);
  assert.equal(C.settings().retainerTasks,true);
  assert.equal(C.settings().retainerUnapproved,true);
  assert.equal(C.settings({retainerCurrent:'false',retainerPrevious:null}).retainerCurrent,true);
  const ctx=await setup({retainerCurrent:false,retainerPrevious:true,theme:'dark'});t.after(()=>ctx.dom.window.close());
  const d=ctx.w.document;
  d.querySelector('[data-section="retainers"]').click();
  assert.equal(d.querySelectorAll('.settings-panel:not([hidden])').length,1);
  assert.equal(d.querySelector('.settings-panel:not([hidden])').id,'panel-retainers');
  assert.equal(d.getElementById('retainerCurrent').checked,false);
  assert.equal(d.getElementById('retainerPrevious').checked,true);
  d.getElementById('retainerPrevious').checked=false;
  d.getElementById('retainerPrevious').dispatchEvent(new ctx.w.Event('change',{bubbles:true}));await tick();
  assert.equal(ctx.saves.at(-1).retainerCurrent,false);
  assert.equal(ctx.saves.at(-1).retainerPrevious,false);
  d.getElementById('retainerTasks').checked=false;
  d.getElementById('retainerTasks').dispatchEvent(new ctx.w.Event('change',{bubbles:true}));await tick();
  assert.equal(ctx.saves.at(-1).retainerTasks,false);
  d.getElementById('retainerUnapproved').checked=false;
  d.getElementById('retainerUnapproved').dispatchEvent(new ctx.w.Event('change',{bubbles:true}));await tick();
  assert.equal(ctx.saves.at(-1).retainerUnapproved,false);
  assert.equal(ctx.saves.at(-1).retainerTasks,false);
  assert.equal(ctx.saves.at(-1).retainerPrevious,false);
  await ctx.choose('#retainerCurrent');
  assert.equal(ctx.saves.at(-1).retainerCurrent,true);
  assert.equal(ctx.saves.at(-1).retainerPrevious,false);
  assert.equal(ctx.saves.at(-1).theme,'dark');
  assert.match(d.getElementById('panel-retainers').textContent,/unapproved time/);
  assert.match(d.getElementById('panel-retainers').textContent,/sorting or exports/);
});

async function setup(raw = {}, dark = false) {
  const dom = new JSDOM(fs.readFileSync(path.join(extension, 'settings.html'), 'utf8'), {runScripts:'outside-only', url:'https://toolkit.test/settings.html'});
  const w = dom.window, changes = new Set(), saves = [];
  const media = {matches:dark, addEventListener(type, fn) {assert.equal(type, 'change'); changes.add(fn);}};
  w.matchMedia = query => {assert.equal(query, '(prefers-color-scheme: dark)'); return media;};
  w.chrome = {storage:{local:{get:async key => {assert.equal(key, 'toolkitSettings'); return {toolkitSettings:raw};}, set:async value => {saves.push(JSON.parse(JSON.stringify(value.toolkitSettings)));}}}};
  w.eval(fs.readFileSync(path.join(extension, 'core.js'), 'utf8'));
  w.eval(fs.readFileSync(path.join(extension, 'settings.js'), 'utf8'));
  await tick();
  return {dom, w, saves, media, setSystem(value) {media.matches = value; for (const fn of changes) fn({matches:value});}, async choose(selector) {const input=w.document.querySelector(selector); assert(input); input.checked=true; input.dispatchEvent(new w.Event('change', {bubbles:true})); await tick();}};
}

test('existing preferences load with Light selected even when the device is dark', async t => {
  const ctx = await setup({enabled:false, style:'text', descriptionTop:true}, true); t.after(() => ctx.dom.window.close());
  const d=ctx.w.document;
  assert.equal(d.querySelector('[name="theme"]:checked').value, 'light');
  assert.equal(d.documentElement.dataset.tkaSettingsTheme, 'light');
  assert.equal(d.getElementById('descriptionTop').checked, true);
  assert.equal(d.getElementById('controls').disabled, true);
  assert.equal(d.querySelectorAll('[name="theme"]').length, 3);
  for (const input of d.querySelectorAll('[name="theme"]')) assert.equal(input.matches(':disabled'), false);
  assert.equal(ctx.saves.length, 0);
});

test('appearance changes persist without enabling checklists or resetting other preferences', async t => {
  const original=C.settings({enabled:false, style:'circle', label:'percentage', completedTick:true, modern:false, classic:false, milestone:false, milestoneRollup:true, markdownDisplay:false, markdownEditor:false, descriptionTop:true, descriptionExpanded:false});
  const ctx = await setup(original); t.after(() => ctx.dom.window.close());
  await ctx.choose('[name="theme"][value="dark"]');
  assert.deepEqual(ctx.saves.at(-1), {...original, theme:'dark'});
  assert.equal(ctx.w.document.documentElement.dataset.tkaSettingsTheme, 'dark');
  assert.equal(ctx.w.document.getElementById('controls').disabled, true);
  await ctx.choose('#enabled');
  assert.equal(ctx.saves.at(-1).theme, 'dark');
  assert.equal(ctx.saves.at(-1).enabled, true);
  assert.equal(ctx.saves.at(-1).descriptionTop, true);
  assert.equal(ctx.saves.at(-1).completedTick, true);
});

test('System follows device changes live while explicit Light and Dark stay fixed', async t => {
  const ctx = await setup({theme:'system'}, false); t.after(() => ctx.dom.window.close());
  const root=ctx.w.document.documentElement;
  assert.equal(root.dataset.tkaSettingsTheme, 'light');
  ctx.setSystem(true);
  assert.equal(root.dataset.tkaSettingsTheme, 'dark');
  assert.equal(ctx.saves.length, 0);
  await ctx.choose('[name="theme"][value="light"]');
  ctx.setSystem(true);
  assert.equal(root.dataset.tkaSettingsTheme, 'light');
  await ctx.choose('[name="theme"][value="dark"]');
  ctx.setSystem(false);
  assert.equal(root.dataset.tkaSettingsTheme, 'dark');
  await ctx.choose('[name="theme"][value="system"]');
  assert.equal(ctx.saves.at(-1).theme, 'system');
  assert.equal(root.dataset.tkaSettingsTheme, 'light');
  ctx.setSystem(true);
  assert.equal(root.dataset.tkaSettingsTheme, 'dark');
  assert.equal(ctx.saves.length, 3);
});

test('saved appearance returns on reopening settings and survives description changes', async t => {
  const ctx = await setup({theme:'dark', descriptionTop:true}); t.after(() => ctx.dom.window.close());
  assert.equal(ctx.w.document.querySelector('[name="theme"]:checked').value, 'dark');
  assert.equal(ctx.w.document.documentElement.dataset.tkaSettingsTheme, 'dark');
  ctx.w.document.getElementById('markdownDisplay').checked=false;
  ctx.w.document.getElementById('markdownDisplay').dispatchEvent(new ctx.w.Event('change', {bubbles:true}));
  await tick();
  assert.equal(ctx.saves.at(-1).theme, 'dark');
  assert.equal(ctx.saves.at(-1).markdownDisplay, false);
  assert.equal(ctx.saves.at(-1).descriptionTop, true);
});
test('completion choices preview, save and preserve an existing tick preference',async t=>{
  const ctx=await setup({completedTick:true,theme:'dark'});t.after(()=>ctx.dom.window.close());
  const d=ctx.w.document;
  assert.equal(d.querySelector('[name="completion"]:checked').value,'tick');
  assert(d.getElementById('preview-complete-indicator').classList.contains('centred-tick'));
  await ctx.choose('[name="completion"][value="hide"]');
  assert(d.getElementById('preview-complete-indicator').hidden);assert.equal(ctx.saves.at(-1).completion,'hide');assert.equal(ctx.saves.at(-1).completedTick,false);
  await ctx.choose('[name="completion"][value="normal"]');
  assert(!d.getElementById('preview-complete-indicator').hidden);assert(!d.getElementById('preview-complete-value').hidden);
  assert.equal(ctx.saves.at(-1).completion,'normal');assert.equal(ctx.saves.at(-1).theme,'dark');
});
