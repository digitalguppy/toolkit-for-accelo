(() => {
  'use strict';
  const route=new URL(location.href);
  if(!/^https:\/\/[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.accelo\.com$/.test(route.origin)||route.searchParams.get('action')!=='list'||route.searchParams.get('list_type')!=='retainer'||globalThis.ToolkitRetainerColumns)return;
  globalThis.ToolkitRetainerColumns=true;
  const C=globalThis.ToolkitAccelo,R=globalThis.ToolkitRetainers,storage=typeof chrome!=='undefined'&&chrome.storage;
  let prefs=C.settings(),revision=0,scheduled=false,pending=null,lastRead=0,error='',financial=false,currency='$';
  const records=new Map(),attempted=new Set();
  const columns=[['retainerCurrent','current','Current Period Usage'],['retainerPrevious','previous','Previous Period Usage'],['retainerTasks','tasks','Tasks']];
  function anchorFor(row,kind){const prior=columns.slice(0,columns.findIndex(c=>c[1]===kind)).reverse();return prior.map(c=>row.querySelector(`[data-tka-period="${c[1]}"]`)).find(Boolean)||row.cells[0];}
  function render(cell,record,kind,id) {
    const value=record?(kind==='tasks'?record.tasks:R.period(record[kind],financial,currency)):undefined;
    const signature=JSON.stringify([id,record?.current?.id,prefs.retainerUnapproved,value===undefined?'unloaded':'loaded',attempted.has(id),value,error]);if(cell.dataset.render===signature)return;cell.dataset.render=signature;cell.replaceChildren();
    const box=document.createElement('div');box.className='tka-retainer-usage';cell.append(box);
    if(value===undefined||value?.error){box.classList.add('tka-retainer-empty');box.textContent=error|| (attempted.has(id)?'Unavailable':'Loading...');return;}
    if(value===null)return;
    if(kind==='tasks'){
      box.classList.add('tka-retainer-tasks');
      const periodId=String(record.current?.id||'');
      for(const [key,title] of [['active','Active'],['overdue','Overdue']]){const count=Number(value[key]);if(count>0){const valid=/^[1-9]\d*$/.test(periodId);const span=document.createElement(valid?'a':'span');span.className='tka-retainer-task-count tka-retainer-task-'+key;span.title=`${count} ${title.toLowerCase()} tasks - open this period's Tasks tab`;span.textContent=String(count);span.setAttribute('aria-label',`${count} ${title.toLowerCase()} tasks - open period tasks`);if(valid)span.href='/?action=view_contract_period&id='+periodId+'#?selected_tab=task#END';box.append(span);}}
      return;
    }
    const bar=document.createElement('div');bar.className='tka-retainer-bar';bar.title=value.ratio===null?value.label:`${(value.ratio*100).toFixed(1)}% used`;
    for(const [cls,width] of [['tka-retainer-fill',value.fill],['tka-retainer-over',value.over]]){const fill=document.createElement('span');fill.className=cls;fill.style.width=width+'%';bar.append(fill);}
    const label=document.createElement('span');label.className='tka-retainer-label';const used=document.createElement('strong');used.className=value.onBudget?'tka-retainer-on-budget':'tka-retainer-over-budget';used.textContent=value.usedLabel;const budget=document.createElement('span');budget.className='tka-retainer-budget';budget.textContent=value.budgetLabel;label.append(used,budget);bar.append(label);box.append(bar);
    if(prefs.retainerUnapproved&&value.unapproved){const valid=/^[1-9]\d*$/.test(value.id);const note=document.createElement(valid?'a':'span');note.className='tka-retainer-note';note.textContent=R.time(value.unapproved)+' unapproved';if(valid){note.href='/?action=view_contract_period&id='+value.id;note.title='Open '+kind+' retainer period';}box.append(note);}
  }
  function read(ids,force=false){
    if(pending||!ids.length)return;
    if(!force&&ids.every(id=>attempted.has(id)))return;
    const token=crypto.randomUUID();pending={token,ids};error='';
    pending.timeout=setTimeout(()=>{if(pending?.token!==token)return;pending=null;error='Could not load usage. Refresh to retry.';ids.forEach(id=>attempted.add(id));schedule();},90000);
    document.dispatchEvent(new CustomEvent('tka-retainer-read',{detail:JSON.stringify({token,ids})}));
  }
  function refresh(){attempted.clear();lastRead=0;schedule();}
  function scan(){
    const ids=new Set();
    for(const table of document.querySelectorAll('table.customListTable')){
      const header=table.tHead?.rows[0];if(!header)continue;
      for(const [setting,kind,title] of columns){
        let head=header.querySelector(`[data-tka-period="${kind}"]`);
        if(!prefs[setting]){table.querySelectorAll(`[data-tka-period="${kind}"]`).forEach(e=>e.remove());continue;}
        if(!head){head=document.createElement('th');head.className='customListHeader tka-retainer-cell';head.dataset.tkaPeriod=kind;head.scope='col';const text=document.createElement('div');text.className='bold restrict';text.dataset.elementName='header-title';text.textContent=title;head.append(text);if(kind==='tasks'){const sub=document.createElement('small');sub.className='tka-retainer-task-heading';sub.textContent='Active | Overdue';head.append(sub);}}
        const anchor=anchorFor(header,kind);if(anchor.nextElementSibling!==head)anchor.after(head);
        for(const row of Array.from(table.tBodies).flatMap(b=>Array.from(b.rows))){
          const id=R.rowId(row);let cell=row.querySelector(`[data-tka-period="${kind}"]`);
          if(!id){cell?.remove();continue;}ids.add(id);
          if(!cell){cell=document.createElement('td');cell.className='tka-retainer-cell';cell.dataset.tkaPeriod=kind;}
          const anchor=anchorFor(row,kind);if(anchor.nextElementSibling!==cell)anchor.after(cell);
          render(cell,records.get(id),kind,id);
        }
      }
    }
    if(ids.size)read([...ids].slice(0,100));
  }
  function schedule(){if(scheduled)return;scheduled=true;setTimeout(()=>{scheduled=false;scan();},100);}
  document.addEventListener('tka-retainer-result',event=>{let r;try{r=JSON.parse(event.detail);}catch{return;}if(!pending||r.token!==pending.token)return;
    clearTimeout(pending.timeout);const ids=pending.ids;pending=null;ids.forEach(id=>attempted.add(id));lastRead=Date.now();
    if(r.ok&&r.records&&typeof r.records==='object'){financial=r.financial===true;currency=typeof r.currency==='string'?r.currency:'$';for(const id of ids){if(Object.hasOwn(r.records,id))records.set(id,r.records[id]);else records.delete(id);}}else error=r.error||'Could not load usage. Refresh to retry.';
    schedule();
  });
  new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['href']});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-lastRead>60000)refresh();});
  storage?.onChanged?.addListener((changes,area)=>{if(area==='local'&&changes.toolkitSettings){revision++;prefs=C.settings(changes.toolkitSettings.newValue);schedule();}});
  if(storage?.local){const initial=revision;storage.local.get('toolkitSettings').then(r=>{if(initial===revision)prefs=C.settings(r.toolkitSettings);schedule();}).catch(schedule);}else schedule();
})();
