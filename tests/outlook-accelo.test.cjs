const {test}=require('node:test');
const assert=require('node:assert/strict');
global.chrome={runtime:{id:'toolkit-test'}};
const {createVerifier,sessionFromHTML,eligible,validSender}=require('../experimental/outlook/outlook-accelo.js');
const sender={id:'toolkit-test',tab:{id:7},frameId:0,documentId:'document1',url:'https://digitalguppy.accelo.com/?action=home_inbox'};
const html='<script>var api_key="abcdefghijklmnopqrstuvwx123456789";current_user_id="2";</script>';
const email='mitch@example.com';
const base={id:'70749',medium:'email',message_id:'<test@example.net>',actioned:0,from_email:'sender@example.net',recipients:{staff:{'2':{email,reply_type:'to'}}}};
function fixture(){
  let time=1800000000000,state=structuredClone(base),page=html,count=0;const stored={};const reads=[];
  const service=createVerifier({now:()=>time,random:()=>`nonce-${++count}-abcdefghijklmnopqrstuvwx`,sleep:async()=>{},storage:{get:async key=>({[key]:structuredClone(stored[key])}),set:async data=>Object.assign(stored,structuredClone(data))},fetcher:async(url,options)=>{
    reads.push({url,options});assert.equal(options.method,undefined);assert.equal(options.redirect,'error');
    return {ok:true,text:async()=>page,json:async()=>structuredClone(state)};
  }});
  const args={activityId:'70749',sender,accountEmail:email,connectionId:'connection1'};
  return {service,args,reads,setState:s=>state={...state,...s},setPage:p=>page=p,advance:ms=>time+=ms};
}
test('Accelo parser reads literal metadata without evaluating scripts and rejects ambiguity',()=>{
  assert.deepEqual(sessionFromHTML(html),{apiKey:'abcdefghijklmnopqrstuvwx123456789',userId:'2'});
  assert.throws(()=>sessionFromHTML('api_key="abcdefghijklmnopqrstuvwx123456789";current_user_id="2";'));
  assert.throws(()=>sessionFromHTML(html+'<script>current_user_id="3";</script>'));
  assert.throws(()=>sessionFromHTML('<script>api_key=steal();current_user_id="2";</script>'));
});
test('only the top-level known Inbox document is eligible',()=>{
  assert(validSender(sender));
  for(const patch of [{frameId:1},{id:'other'},{documentId:undefined},{url:'https://digitalguppy.accelo.com/?action=customer_request'},{url:'https://evil.example/?action=home_inbox'}]) assert(!validSender({...sender,...patch}));
});
test('Accelo eligibility requires an incoming email for the connected current staff mailbox',()=>{
  assert(eligible(base,'70749',{userId:'2'},email));
  for(const row of [{...base,medium:'note'},{...base,from_email:email},{...base,actioned:undefined},{...base,message_id:'not-an-id'},{...base,id:'other'}]) assert.equal(eligible(row,'70749',{userId:'2'},email),null);
  assert.equal(eligible(base,'70749',{userId:'3'},email),null);
  assert.equal(eligible(base,'70749',{userId:'2'},'other@example.com'),null);
});
test('fresh server transition is required and the nonce is single use',async()=>{
  const f=fixture(),prepared=await f.service.prepare(f.args);assert(prepared.expires>1800000000000);
  f.setState({actioned:1});const result=await f.service.verify({...f.args,nonce:prepared.nonce});
  assert.equal(result.messageId,base.message_id);assert.equal(result.dateActioned,1800000000);
  await assert.rejects(()=>f.service.verify({...f.args,nonce:prepared.nonce}),/not ready/);
  assert(f.reads.every(r=>r.options.method===undefined));
});
test('failed or unchanged Accelo action never verifies and consumes nonce',async()=>{
  const f=fixture(),prepared=await f.service.prepare(f.args);
  await assert.rejects(()=>f.service.verify({...f.args,nonce:prepared.nonce}),/did not confirm/);
  f.setState({actioned:1});await assert.rejects(()=>f.service.verify({...f.args,nonce:prepared.nonce}),/not ready/);
});
test('already actioned emails cannot establish a new baseline',async()=>{
  const f=fixture();f.setState({actioned:1});assert.equal(await f.service.prepare(f.args),null);
});
test('nonce cannot cross a tab, document, connection or expiry',async()=>{
  for(const change of [{sender:{...sender,tab:{id:8}}},{sender:{...sender,documentId:'new'}},{connectionId:'connection2'},{expired:true}]){
    const f=fixture(),prepared=await f.service.prepare(f.args);f.setState({actioned:1});if(change.expired)f.advance(120001);
    await assert.rejects(()=>f.service.verify({...f.args,...change,nonce:prepared.nonce}),/not ready/);
  }
});
test('changed message identity or signed-in Accelo user prevents sync',async()=>{
  for(const kind of ['message','user']){
    const f=fixture(),prepared=await f.service.prepare(f.args);f.setState({actioned:1});
    if(kind==='message')f.setState({message_id:'<different@example.net>'});else f.setPage(html.replace('user_id="2"','user_id="3"'));
    await assert.rejects(()=>f.service.verify({...f.args,nonce:prepared.nonce}),/changed/);
  }
});
