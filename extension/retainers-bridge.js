(() => {
  'use strict';
  const route=new URL(location.href);
  if(!/^https:\/\/[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.accelo\.com$/.test(route.origin)||route.searchParams.get('action')!=='list'||route.searchParams.get('list_type')!=='retainer'||globalThis.ToolkitRetainerBridge)return;
  globalThis.ToolkitRetainerBridge=true;
  let busy=false;
  function numeric(v){return v!==null&&v!==''&&Number.isFinite(Number(v))?Number(v):null;}
  function summary(p,financial){if(!p)return null;return {id:String(p.id||''),allowance_type:String(p.allowance_type||''),budget_type:String(p.budget_type||''),
    used:{billable:numeric(p.used?.billable),charged:financial?numeric(p.used?.charged):null},allowance:{billable:numeric(p.allowance?.billable),charged:financial?numeric(p.allowance?.charged):null},unapproved:{billable:numeric(p.unapproved?.billable)}};}
  document.addEventListener('tka-retainer-read',async event=>{
    let request;try{request=JSON.parse(event.detail);}catch{return;}
    if(busy||typeof request.token!=='string'||request.token.length>100||!Array.isArray(request.ids)||!request.ids.length||request.ids.length>100||request.ids.some(id=>typeof id!=='string'||! /^[1-9]\d*$/.test(id)))return;
    busy=true;
    const reply={token:request.token,ok:false};
    try {
      const wanted=new Set(request.ids), records={}, financial=(globalThis.Affinity?.user('financial_level')||globalThis.financial_level)==='all';
      const headers={'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8','X-CSRF-REQUESTED':'1'};
      const csrf=globalThis.$AL?.config('CSRF');if(csrf?.value)headers['X-CSRF']=csrf.value;
      const deadline=Date.now()+60000;
      for(let page=0;page<50;page++) {
        if(Date.now()>=deadline)throw Error('Usage read timed out');
        const response=await fetch('/api/0.5/session/contract',{method:'POST',credentials:'same-origin',redirect:'error',headers,signal:AbortSignal.timeout(Math.min(15000,Math.max(1,deadline-Date.now()))),body:new URLSearchParams({_action:'filtered_list',_method:'GET',data:JSON.stringify({filters:{},search:'',filter_page:page,filter_items_per_page:100,filter_order_by:'contract_company_asc',show_inactive:1})})});
        if(!response.ok)throw Error('Usage could not be loaded');
        const data=await response.json();if(!Array.isArray(data.contracts))throw Error('Unexpected usage response');
        for(const c of data.contracts)if(wanted.has(String(c.id))){records[String(c.id)]={current:summary(c.current_period,financial),previous:summary(c.previous_period,financial),tasks:c.current_period?{active:numeric(c.current_period.ontime_tasks_count)||0,overdue:numeric(c.current_period.overdue_tasks_count)||0}:null};wanted.delete(String(c.id));}
        if(!wanted.size||data.contracts.length===0||page+1>=Number(data.total_pages))break;
        if(page===49)throw Error('Usage list limit reached');
      }
      reply.ok=true;reply.records=records;reply.financial=financial;reply.currency=typeof globalThis.currency_symbol==='string'?globalThis.currency_symbol.slice(0,8):'$';
    }catch{reply.error='Could not load period usage. Refresh to retry.';}
    finally {busy=false;document.dispatchEvent(new CustomEvent('tka-retainer-result',{detail:JSON.stringify(reply)}));}
  });
})();
