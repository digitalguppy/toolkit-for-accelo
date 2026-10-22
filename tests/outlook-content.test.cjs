const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const {JSDOM}=require('jsdom');
const code=fs.readFileSync(require('node:path').join(__dirname,'../experimental/outlook/outlook-content.js'),'utf8');
const html='<div class="activity_view_full" context="inbox" mainactivity="selected_activity"><div class="activity_toolbar"><a ng-click="action(activity);">Action</a><a href="/?action=view_activity&id=70749">View</a></div></div>';
async function fixture(t,mode='read',markup=html){
 const dom=new JSDOM(markup,{url:'https://digitalguppy.accelo.com/?action=home_inbox',runScripts:'outside-only'});t.after(()=>dom.window.close());const w=dom.window;let changed;
 w.Element.prototype.getClientRects=function(){return[{width:40,height:20}];};const messages=[];
 w.chrome={runtime:{sendMessage:async m=>{messages.push(m);return{ok:true,nonce:'abcdefghijklmnopqrstuvw',expires:Date.now()+120000};}},storage:{local:{get:async()=>({toolkitSettings:{outlookSyncMode:mode}})},onChanged:{addListener:f=>changed=f}}};
 w.eval(code);await new Promise(r=>setTimeout(r,30));return {w,messages,disable:()=>changed({toolkitSettings:{newValue:{outlookSyncMode:'none'}}},'local')};
}
test('disabled sync does not contact background or modify the native action',async t=>{
 const f=await fixture(t,'none');assert.equal(f.messages.length,0);assert.equal(f.w.document.querySelector('.tka-outlook-hint'),null);
});
test('reading a selected email only prepares; synthetic clicks cannot update Outlook',async t=>{
 const f=await fixture(t);assert.equal(f.messages.length,1);assert.equal(f.messages[0].type,'toolkit-outlook:prepare');
 f.w.document.querySelector('[ng-click]').click();await new Promise(r=>setTimeout(r,20));assert.equal(f.messages.length,1);
 assert.match(f.w.document.querySelector('.tka-outlook-hint').textContent,/mark as read/);
 f.disable();assert.equal(f.w.document.querySelector('.tka-outlook-hint'),null);
});
test('ambiguous activity roots fail closed',async t=>{
 const f=await fixture(t,'read',html+html);
 // No attempt to select the first duplicate root or use an email-body Action link.
 f.w.document.querySelector('[ng-click]').click();assert.equal(f.messages.length,0);
});
