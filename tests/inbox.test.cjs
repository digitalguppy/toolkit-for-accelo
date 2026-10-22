const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const read=name=>fs.readFileSync(path.join(__dirname,'../extension',name),'utf8');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function waitForUnavailable(x) {
  const deadline=Date.now()+2500;
  while(x.shortcut()?.textContent!=='Unavailable' && Date.now()<deadline) await wait(25);
  assert.equal(x.shortcut()?.textContent,'Unavailable');
}
async function fixture(t,{requests=false,allowed=true,locked=false,enabled=true}={}) {
  const action=requests?'customer_request':'home_inbox';
  const dom=new JSDOM(`<div id="view_pane_title_block"><h2 class="view_pane_title">Test activity</h2><div class="activity_toolbar"><a ng-click="close_request()">Close</a></div></div><div class="activity_view_full" context="${requests?'request_inbox':'inbox'}" mainactivity="selected_activity"><div class="activity_toolbar"><a ng-click="action(activity);">Action</a><a href="/?action=view_activity&id=12">View</a></div><div class="activity_action_buttons"><div data-element-name="dropdownButton">...</div></div></div>`,{url:`https://example-team.accelo.com/?action=${action}`,runScripts:'outside-only'});
  t.after(()=>dom.window.close());
  const w=dom.window,d=w.document;let writes=0,menu=null,listener;
  w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
  w.chrome={storage:{local:{get:async()=>({toolkitSettings:{inboxDelete:enabled}})},onChanged:{addListener:fn=>listener=fn}}};
  const toggle=d.querySelector('[data-element-name="dropdownButton"]');
  toggle.addEventListener('click',()=>{
    if(menu){menu.remove();menu=null;return;}
    menu=d.createElement('div');
    if(allowed&&!locked){const span=d.createElement('span');span.setAttribute('ng-if','!activity.is_locked && activity.deletable');const a=d.createElement('a');a.className='dropbubble__item';a.setAttribute('ng-href','native');const id=new URL(d.querySelector('a[href*="view_activity"]').href).searchParams.get('id');a.href=`/?action=delete_activity&id=${id}&referring_link=${encodeURIComponent('action='+action)}`;a.addEventListener('click',event=>{event.preventDefault();writes++;});span.append(a);menu.append(span);}
    d.body.append(menu);
  });
  w.eval(read('core.js'));w.eval(read('inbox.js'));await wait(10);
  return {w,d,writes:()=>writes,shortcut:()=>d.querySelector('.tka-inbox-shortcut'),confirm:()=>d.querySelector('.tka-inbox-shortcut'),disable(){listener({toolkitSettings:{newValue:{inboxDelete:false}}},'local');}};
}

test('Inbox uses the same button for Delete and Confirm, with no dialog and one dispatch',async t=>{
  const x=await fixture(t);const button=x.shortcut();assert.equal(button.previousElementSibling.textContent,'Action');
  button.click();assert.equal(x.shortcut(),button);assert.equal(button.textContent,'Confirm?');assert.equal(x.d.querySelector('dialog'),null);assert.equal(x.writes(),0);
  button.click();button.click();await wait(90);assert.equal(x.writes(),1);assert.equal(button.disabled,true);
});
test('Requests shortcut precedes Close and deletes the activity without invoking Close',async t=>{
  const x=await fixture(t,{requests:true});let closes=0;x.d.querySelector('[ng-click="close_request()"]' ).addEventListener('click',()=>closes++);
  assert.equal(x.shortcut().nextElementSibling.textContent,'Close');x.shortcut().click();x.shortcut().click();await wait(90);assert.equal(x.writes(),1);assert.equal(closes,0);
});
test('clicking elsewhere or Escape resets the same button without deleting',async t=>{
  const x=await fixture(t);x.shortcut().click();x.d.body.click();assert.equal(x.shortcut().textContent,'Delete');assert.equal(x.writes(),0);
  x.shortcut().click();x.d.dispatchEvent(new x.w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(x.shortcut().textContent,'Delete');assert.equal(x.writes(),0);
});
test('changing activity invalidates pending confirmation before observer runs',async t=>{
  const x=await fixture(t);x.shortcut().click();x.d.querySelector('a[href*="view_activity"]').href='/?action=view_activity&id=13';x.shortcut().click();await wait(90);assert.equal(x.writes(),0);assert.equal(x.shortcut().textContent,'Delete');
});
test('missing permission and locked activities cannot be deleted',async t=>{
  for(const opts of [{allowed:false},{locked:true}]){const x=await fixture(t,opts);x.shortcut().click();x.shortcut().click();await waitForUnavailable(x);assert.match(x.shortcut().title,/not offering Delete/);assert.equal(x.writes(),0);}
});
test('disabling removes shortcut and confirmation; no duplicates after changes',async t=>{
  const x=await fixture(t);x.d.body.append(x.d.createElement('div'));await wait(100);assert.equal(x.d.querySelectorAll('.tka-inbox-shortcut').length,1);x.shortcut().click();x.disable();assert.equal(x.shortcut(),null);assert.equal(x.writes(),0);
});
test('permission control removed between opening and confirming prevents deletion',async t=>{
  const x=await fixture(t);x.shortcut().click();x.d.querySelector('[data-element-name="dropdownButton"]').replaceWith(x.d.createElement('div'));x.shortcut().click();await wait(90);assert.equal(x.writes(),0);assert.equal(x.shortcut(),null);
});
test('Escape while native access is being checked cancels the pending delete',async t=>{
  const x=await fixture(t);x.shortcut().click();x.shortcut().click();x.d.dispatchEvent(new x.w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await wait(90);assert.equal(x.writes(),0);assert.equal(x.shortcut().textContent,'Delete');
});
test('ambiguously duplicated native delete links fail closed',async t=>{
  const x=await fixture(t);x.d.querySelector('[data-element-name="dropdownButton"]').click();const a=x.d.querySelector('span[ng-if]');a.after(a.cloneNode(true));x.shortcut().click();x.shortcut().click();await waitForUnavailable(x);assert.equal(x.writes(),0);
});
