const {test}=require('node:test');
const assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const C=require('../extension/core.js');
const T=require('../extension/timesheet-core.js');
const R=require('../extension/retainers-core.js');
test('routes accept tenant subdomains but reject lookalikes, non-HTTPS, ports and credentials',()=>{
  for(const tenant of ['digitalguppy','example-team','a','tenant123'])assert.equal(C.route(`https://${tenant}.accelo.com/app/projects/45`),'modern');
  for(const origin of ['https://accelo.com','https://nested.team.accelo.com','https://evilaccelo.com','https://team.accelo.com.evil.test','http://team.accelo.com','https://team.accelo.com:8443','https://user@team.accelo.com','https://-team.accelo.com'])assert.equal(C.route(origin+'/app/projects/45'),null,origin);
});
test('retainer and timer identities resolve only against their owning tenant',t=>{
  for(const tenant of ['digitalguppy','example-team']){
    const dom=new JSDOM('<table><tbody><tr><td><h1 class="ts_work_obj_parent"><a>Task</a></h1><a class="retainer">Retainer</a></td></tr></tbody></table>',{url:`https://${tenant}.accelo.com/`});t.after(()=>dom.window.close());
    const d=dom.window.document,cell=d.querySelector('td'),task=d.querySelector('h1 a'),retainer=d.querySelector('.retainer');
    for(const prefix of ['',`https://${tenant}.accelo.com`]){
      task.setAttribute('href',prefix+'/?action=view_task&id=42');retainer.setAttribute('href',prefix+'/?action=view_contract&id=9');
      assert.equal(T.identify(cell).engagement.id,'42');assert.equal(R.rowId(cell),'9');
    }
    for(const prefix of ['https://foreign.accelo.com','https://evil.test',`https://user@${tenant}.accelo.com`]){
      task.setAttribute('href',prefix+'/?action=view_task&id=42');retainer.setAttribute('href',prefix+'/?action=view_contract&id=9');
      assert.equal(T.identify(cell),null);assert.equal(R.rowId(cell),null);
      d.querySelector('h1').setAttribute('data-task_id','42');assert.equal(T.identify(cell),null);d.querySelector('h1').removeAttribute('data-task_id');
    }
  }
});
