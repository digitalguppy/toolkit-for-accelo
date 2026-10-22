const {test}=require('node:test');
const assert=require('node:assert/strict');
const C=require('../extension/core.js');
function fixture({allow=true, fail=false, mismatch=false}={}) {
  let complete=false; const calls=[];
  const writer=C.createWriter({fetcher:async(url,options)=>{
    const req=JSON.parse(options.body);calls.push(req);assert.equal(url,'/graphql');assert.equal(options.credentials,'same-origin');
    if(req.operationName!=='GetTaskChecklist') {
      assert.deepEqual(req.variables,{input:{checklistItemId:'7'}});
      if(!mismatch)complete=req.operationName==='CompleteChecklistItem';
      if(fail)throw new Error('Connection lost');
      return {ok:true,json:async()=>({data:{}})};
    }
    return {ok:true,json:async()=>({data:{tasks:{edges:[{node:{id:'2018',permissions:{canUpdate:allow},checklist:[{id:'3',checklistItems:[{id:'7',title:'Check',isCompleted:complete,completedBy:complete?{name:{fullName:'Test Person'}}:null}]}]}}]}}})};
  }});
  return {writer,calls};
}
test('completion and undo each send one native mutation and read back counts and attribution',async()=>{
  const {writer,calls}=fixture();
  const done=await writer.set('2018','7',true);assert.equal(done.complete,1);assert.equal(done.items[0].completedBy,'Test Person');
  assert.deepEqual(calls.map(c=>c.operationName),['GetTaskChecklist','CompleteChecklistItem','GetTaskChecklist']);
  const undone=await writer.set('2018','7',false);assert.equal(undone.complete,0);assert.equal(undone.items[0].completedBy,'');
  assert.equal(calls[4].operationName,'UncompleteChecklistItem');
});
test('permission denial and missing items do not write',async()=>{
  for(const [allow,id] of [[false,'7'],[true,'8']]) {
    const {writer,calls}=fixture({allow});await assert.rejects(writer.set('2018',id,true),/permission/);assert.equal(calls.length,1);
  }
});
test('uncertain write is never retried and succeeds only on verified readback',async()=>{
  const {writer,calls}=fixture({fail:true});assert.equal((await writer.set('2018','7',true)).complete,1);assert.equal(calls.length,3);
  const bad=fixture({fail:true,mismatch:true});await assert.rejects(bad.writer.set('2018','7',true),/not confirmed/);assert.equal(bad.calls.length,3);
});
test('duplicate saves are blocked and an already-current value does not write',async()=>{
  const {writer,calls}=fixture();const first=writer.set('2018','7',true);await assert.rejects(writer.set('2018','7',true),/already saving/);await first;
  await writer.set('2018','7',true);assert.equal(calls.length,4);
});
