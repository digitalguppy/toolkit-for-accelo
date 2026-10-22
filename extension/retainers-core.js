(function(root) {
  'use strict';
  function number(value) {if (value === null || value === undefined || value === '') return null; const n=Number(value); return Number.isFinite(n)?n:null;}
  function time(seconds) {const mins=Math.floor(Math.abs(seconds)/60);return (seconds<0?'-':'')+(mins>=60?`${Math.floor(mins/60)}h ${String(mins%60).padStart(2,'0')}m`:`${mins}m`);}
  function period(p, financial=true, currency='$') {
    if (!p) return null;
    const type=String(p.allowance_type||'').toLowerCase();
    const money=type==='fixed_value'&&financial;
    if(!p.used||!p.allowance)return {error:true};
    const metric=money?'charged':'billable', used=number(p.used[metric]??0);
    if (used===null) return {error:true};
    const total=number(p.allowance[metric]??0);
    const unlimited=type==='unlimited_hours';
    const graph=unlimited?p.budget_type==='pre-paid':financial||type==='fixed_hours';
    const format=n=>money?currency+new Intl.NumberFormat('en',{maximumFractionDigits:2}).format(n):time(n);
    const label=format(used)+(graph?(unlimited?' / Unlimited':total===null?'':` / ${format(total)}`):'');
    const ratio=graph&&!unlimited&&total>0?used/total:null;
    return {id:String(p.id||''),label,usedLabel:format(used),budgetLabel:label.slice(format(used).length),onBudget:unlimited||!graph||used<=total,used,total,ratio,unlimited,unapproved:Math.max(0,number(p.unapproved?.billable)||0),
      fill:ratio===null?0:Math.max(0,Math.min(100,ratio>1?100/ratio:ratio*100)),over:ratio>1?100-100/ratio:0};
  }
  function rowId(row) {
    const origin = row?.ownerDocument?.location?.origin;
    if (!/^https:\/\/[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.accelo\.com$/.test(origin || '')) return null;
    for(const a of row.querySelectorAll('a[href]')) {try {const u=new URL(a.getAttribute('href'),origin);
      if(u.origin===origin&&!u.username&&!u.password&&u.pathname==='/'&&u.searchParams.get('action')==='view_contract'&&/^[1-9]\d*$/.test(u.searchParams.get('id')||''))return u.searchParams.get('id');
    }catch{}}
    return null;
  }
  const api={period,time,rowId};root.ToolkitRetainers=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(globalThis);
