const {test}=require('node:test');
const assert=require('node:assert/strict');
const C=require('../extension/core.js');
test('milestone totals are opt-in, item-weighted, nested and deduplicated',async()=>{
  assert.equal(C.settings().milestoneRollup,false);assert.equal(C.settings({milestoneRollup:true}).milestoneRollup,true);
  assert.equal(C.settings({milestoneRollup:'true'}).milestoneRollup,false);
  const tree={260:[{id:'1',type:'Task'},{id:'261',type:'Milestone'}],261:[{id:'1',type:'Task'},{id:'2',type:'Task'},{id:'3',type:'Task'}]};
  const reads=[];const rollups=C.createRollups({members:{get:async id=>tree[id]},tasks:{get:async id=>{reads.push(id);return {total:id==='1'?1:id==='2'?9:0,complete:id==='1'?1:0};}}});
  assert.deepEqual(await rollups.get('260'),{milestoneId:'260',taskCount:3,total:10,complete:1,percent:10});
  assert.deepEqual(reads.sort(),['1','2','3']);await rollups.get('260');assert.equal(reads.length,3);
});
test('missing, inaccessible or malformed milestone data never becomes a zero total',async()=>{
  assert.throws(()=>C.normalizeChildren({errors:[{message:'Denied'}]},260));
  assert.throws(()=>C.normalizeChildren({data:{milestones:{edges:[]}}},260));
  assert.throws(()=>C.normalizeChildren({data:{milestones:{edges:[{node:{id:'260',children:[{id:1,__typename:'Unknown'}]}}]}}},260));
  const rollups=C.createRollups({members:{get:async()=>[{id:'1',type:'Task'},{id:'2',type:'Task'}]},tasks:{get:async id=>{if(id==='2')throw Error('Access denied');return {total:3,complete:1};}}});
  await assert.rejects(rollups.get('260'),/Access denied/);
});
test('cycles fail and refreshed totals cannot be overwritten by an older in-flight response',async()=>{
  const cycle=C.createRollups({members:{get:async()=>[{id:'260',type:'Milestone'}]},tasks:{get:async()=>({total:0,complete:0})}});
  await assert.rejects(cycle.get('260'),/hierarchy/);
  let release,calls=0;const rollups=C.createRollups({members:{get:async()=>{if(++calls===1)await new Promise(r=>release=r);return[];}},tasks:{get:async()=>{throw Error('Unexpected read');}}});
  const old=rollups.get('260'),rejected=assert.rejects(old,/cancelled/);rollups.clear();const next=await rollups.get('260');release();await rejected;
  assert.equal(next.total,0);assert.equal((await rollups.get('260')).total,0);
});
