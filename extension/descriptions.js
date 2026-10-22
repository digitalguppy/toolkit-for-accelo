(() => {
  'use strict';
  const C=globalThis.ToolkitAccelo, M=globalThis.ToolkitMarkdown;
  if (!C || !M || globalThis.__toolkitDescriptions) return;
  const records=new Map(), owned='data-tka-description-owned';
  let prefs=C.settings(), stopped=false, scheduled=false, active=null;
  const $=(root,name)=>root.querySelector(`[data-element-name="${name}"]`);
  function el(tag,cls,text) {const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
  function button(text,fn) {const b=el('button','tka-editor-button',text);b.type='button';b.addEventListener('click',fn);return b;}
  function source(r) {return r.legacy?r.root.querySelector('.activity_body_edit'):$(r.root,r.kind==='task'?'description_textArea':'summary_textArea');}
  function raw(r) {return source(r)?.textContent || '';}
  function textarea(r) {return r.legacy?r.root.querySelector('.inline_edit_state:not(.ng-hide) textarea'):r.root.querySelector(`[data-element-name="${r.kind==='task'?'description_editTextArea':'editableSummary_textArea'}"] textarea:not([aria-hidden="true"])`);}
  function trigger(r) {return r.legacy?r.root.querySelector('.taskDetailsDescriptionTextarea'):r.kind==='task'?$(r.root,'panel_description'):$(r.root,'summary_editButton') || $(r.root,'summary_showEditModuleLink');}
  function canEdit(r) {return r.legacy?!!trigger(r)?.classList.contains('edit_enabled'):r.kind==='task'?!!$(r.root,'panel_description')?.className.includes('--canUpdate'):!!trigger(r);}
  function taskScope(panel) {return !!panel.closest('[data-element-name="view_task_drawer"]') || /^\/app\/tasks\/\d+\/?$/.test(location.pathname);}
  function removeView(r) {r.preview?.remove();r.preview=null;r.hidden?.removeAttribute('data-tka-desc-hidden');r.hidden=null;r.renderKey=null;}
  function release(r) {
    if(active?.record===r)active.close();
    if(r.onClick)r.root.removeEventListener('click',r.onClick,true);
    if(r.onKey)r.root.removeEventListener('keydown',r.onKey,true);
    r.clickTarget?.removeAttribute('tabindex');r.clickTarget?.removeAttribute('data-tka-desc-clickable');
    removeView(r);r.tools?.remove();
    for(const node of r.layout || []) for(const attr of ['data-tka-desc-full','data-tka-desc-top','data-tka-desc-heading','data-tka-desc-paper'])node.removeAttribute(attr);
  }
  function layout(r) {
    if(r.kind!=='task'||r.legacy)return;
    const group=r.root.parentElement, overview=group?.parentElement;
    const heading=group?.firstElementChild;
    if(overview?.getAttribute('data-element-name')!=='overview_tab_content' || !heading?.querySelector('h6'))return;
    r.layout=[group,heading,r.root];
    group.toggleAttribute('data-tka-desc-top',prefs.descriptionTop);
    group.toggleAttribute('data-tka-desc-full',prefs.descriptionExpanded);
    heading.toggleAttribute('data-tka-desc-heading',prefs.descriptionTop);
    r.root.toggleAttribute('data-tka-desc-paper',prefs.descriptionTop);
  }
  function update(r) {
    layout(r);
    if(!r.onClick){
      r.onClick=e=>{
        if(r.nativeClick || !prefs.markdownEditor || !canEdit(r) || textarea(r) || e.target.closest('a, .tka-editor-inline, .tka-editor-modes'))return;
        const target=e.target;
        if(target.closest('.tka-markdown') || source(r)?.contains(target) || trigger(r)?.contains(target) || target===trigger(r)){
          e.preventDefault();e.stopImmediatePropagation();openEditor(r);
        }
      };
      r.root.addEventListener('click',r.onClick,true);
      r.onKey=e=>{if(e.target===r.clickTarget && (e.key==='Enter'||e.key===' ')){e.preventDefault();e.stopPropagation();openEditor(r);}};
      r.root.addEventListener('keydown',r.onKey,true);
    }
    if(active?.record===r)return;
    const node=source(r), text=node?.textContent || '', editing=!!textarea(r);
    const collapsed=!(r.kind==='task'&&prefs.descriptionExpanded)&&!!node?.className.split(' ').some(c=>/_lineClamp__/.test(c));
    const key=JSON.stringify([text,collapsed]);
    if(editing || !prefs.markdownDisplay || !node || text.length>200000 || !M.isMarkdown(text))removeView(r);
    else if(r.renderKey!==key || r.hidden!==node || !r.preview?.isConnected) {
      removeView(r);r.renderKey=key;r.hidden=node;node.setAttribute('data-tka-desc-hidden','');
      r.preview=el('div',`tka-markdown${collapsed?' tka-collapsed':''}`);r.preview.setAttribute(owned,'');
      r.preview.append(M.render(text));node.after(r.preview);
      r.preview.addEventListener('click',e=>{if(e.target.closest('a'))e.stopPropagation();});
    }
    r.clickTarget?.removeAttribute('tabindex');r.clickTarget?.removeAttribute('data-tka-desc-clickable');
    r.clickTarget=null;
    if(prefs.markdownEditor && !editing && canEdit(r)) {
      r.clickTarget=r.preview || node || trigger(r);
      r.clickTarget?.setAttribute('tabindex','0');r.clickTarget?.setAttribute('data-tka-desc-clickable','');
    }
  }
  function scan() {
    scheduled=false;if(stopped)return;
    observer.disconnect();
    try {
      const roots=[];
      for(const panel of document.querySelectorAll('.taskDetailsDescriptionTextarea')) {
        const root=panel.parentElement;
        if(root?.getAttribute('data')==='TaskDescriptionController.task.description')roots.push([root,'task',true]);
      }
      for(const panel of document.querySelectorAll('[data-element-name="panel_description"]')) {
        if(!taskScope(panel))continue;
        const root=panel.closest('[class*="DescriptionPanel_container__"]');if(root)roots.push([root,'task']);
      }
      if(/^\/app\/tickets\/\d+\/?$/.test(location.pathname)) {
        for(const panel of document.querySelectorAll('[data-element-name="panel_summary"]')) {
          const root=panel.closest('[class*="SummaryPanel_container__"]');if(root)roots.push([root,'ticket']);
        }
      }
      const keep=new Set(roots.map(x=>x[0]));
      for(const [root,r] of records)if(!root.isConnected || !keep.has(root)){release(r);records.delete(root);}
      for(const [root,kind,legacy=false] of roots){if(!records.has(root))records.set(root,{root,kind,legacy});update(records.get(root));}
    }finally{observe();}
  }
  function schedule(){if(!stopped&&!scheduled){scheduled=true;setTimeout(scan,80);}}
  const observer=new MutationObserver(changes=>{
    if(changes.some(c=>{
      const target=c.target.nodeType===1?c.target:c.target.parentElement;
      if(target?.closest(`[${owned}], [data-tka-owned]`))return false;
      if(c.type!=='childList')return true;
      return [...c.addedNodes,...c.removedNodes].some(n=>n.nodeType!==1 || (!n.hasAttribute(owned)&&!n.hasAttribute('data-tka-owned')));
    }))schedule();
  });
  function observe(){if(!stopped)observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});}
  function waitForField(r) {
    return new Promise((resolve,reject)=>{
      const existing=textarea(r);if(existing)return resolve(existing);
      const obs=new MutationObserver(()=>{const field=textarea(r);if(field){clearTimeout(timer);obs.disconnect();resolve(field);}});
      const timer=setTimeout(()=>{obs.disconnect();reject(new Error('Accelo did not open its text field. Your draft is still here.'));},2500);
      obs.observe(r.root,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
    });
  }
  function recordId(r) {
    const drawer=r.root.closest('[data-element-name="view_task_drawer"]');
    if(drawer)return ($(drawer,'objectTitle')?.textContent || drawer.querySelector('h6')?.textContent || '').match(/^#(\d+)\b/)?.[1];
    const path=location.pathname.match(/^\/app\/(tasks|tickets)\/(\d+)\/?$/);
    if(path && path[1]===(r.kind==='task'?'tasks':'tickets'))return path[2];
    if(r.legacy){
      const url=new URL(location.href);if(url.searchParams.get('action')==='view_task')return url.searchParams.get('id');
      for(let scope=r.root.parentElement;scope && scope!==document.body;scope=scope.parentElement){
        const links=[...scope.querySelectorAll('a[href*="action=view_task&"]')];
        if(links.length===1)return new URL(links[0].href,location.href).searchParams.get('id');
      }
    }
    return null;
  }
  async function savedDescription(r,id) {
    const collection=r.kind==='task'?'tasks':'tickets', key=r.kind==='task'?'TaskId':'TicketId';
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
    try{
      const response=await fetch('/graphql',{method:'POST',credentials:'same-origin',redirect:'error',headers:{'content-type':'application/json'},signal:controller.signal,
        body:JSON.stringify({operationName:'ToolkitDescription',variables:{id:Number(id)},query:`query ToolkitDescription($id: Int!) { ${collection}(filters: {ints: {key: ${key}, type: equals, value: [$id]}}, first: 1) { edges { node { id description } } } }`})});
      if(!response.ok)throw new Error('Could not check the saved description.');
      const body=await response.json(),node=body.data?.[collection]?.edges?.find(e=>String(e?.node?.id)===String(id))?.node;
      if(body.errors?.length || !node || (node.description!==null && typeof node.description!=='string'))throw new Error('Could not check the saved description.');
      return node.description ?? '';
    }finally{clearTimeout(timer);}
  }
  function nativeButtonStyle(target, primary=false) {
    const candidates=[...document.querySelectorAll('button.MuiButton-root')].filter(b=>!b.closest(`[${owned}]`)&&b.textContent.trim());
    const native=(primary?candidates.find(b=>b.classList.contains('MuiButton-contained')):null)||candidates.find(b=>b.classList.contains('MuiButton-text')&&b.classList.contains('MuiButton-sizeSmall'));
    if(!native)return;
    const style=getComputedStyle(native);
    for(const property of ['font-family','font-size','font-weight','line-height','letter-spacing','border-radius'])target.style.setProperty(property,style.getPropertyValue(property));
    target.style.setProperty('--tka-action-color',style.color);
    if(primary && native.classList.contains('MuiButton-contained')){target.style.backgroundColor=style.backgroundColor;target.style.color=style.color;}
  }
  function openEditor(r) {
    if(active){active.box.focus();return;}
    if(textarea(r) || !canEdit(r))return;
    const original=raw(r),route=location.pathname,id=recordId(r),box=el('div','tka-editor-inline');
    box.setAttribute(owned,'');box.setAttribute('role','group');box.setAttribute('aria-label','Edit '+r.kind+' description');box.tabIndex=-1;
    const modes=el('div','tka-editor-modes');modes.setAttribute(owned,'');modes.setAttribute('role','group');modes.setAttribute('aria-label','Editor mode');
    const text=el('textarea','tka-editor-source');text.value=original;text.setAttribute('aria-label','Description source');
    const visual=el('div','tka-visual-editor'),status=el('p','tka-editor-status');status.setAttribute('role','status');
    let mode=M.isMarkdown(original)?'visual':'plain',editor=null,baseline='',busy=false,closing=false,heading=null,sent=false,submittedValue='';
    function syncVisual(){if(editor){const current=editor.getMarkdown();if(current!==baseline)text.value=current;editor.destroy();editor=null;}}
    function current(){return editor&&editor.getMarkdown()!==baseline?editor.getMarkdown():text.value;}
    function setMode(next){
      if(next===mode&&editor)return;
      syncVisual();mode=next;visual.hidden=mode!=='visual';text.hidden=mode==='visual';
      for(const b of modes.children)b.setAttribute('aria-pressed',String(b.dataset.mode===mode));
      status.textContent='';
      if(mode==='visual'){
        if(!M.visualSafe(text.value)){mode='plain';setMode('plain');status.textContent='Use Plain text to preserve the HTML or image syntax in this description.';return;}
        try{
          editor=new M.Editor({el:visual,initialValue:text.value,initialEditType:'wysiwyg',height:'360px',hideModeSwitch:true,usageStatistics:false,autofocus:false,referenceDefinition:true,
            customHTMLSanitizer:html=>M.sanitize(html),linkAttributes:{target:'_blank',rel:'noopener noreferrer'},
            toolbarItems:[['heading','bold','italic','strike'],['hr','quote'],['ul','ol','task','indent','outdent'],['table','link'],['code','codeblock']],hooks:{addImageBlobHook:()=>false}});
          baseline=editor.getMarkdown();
        }catch{editor?.destroy();editor=null;visual.replaceChildren();mode='plain';setMode('plain');status.textContent='The visual editor could not start. Your text is available in Plain text.';}
      }
    }
    for(const [value,label] of [['visual','Visual'],['plain','Plain text']]){const b=button(label,()=>setMode(value));b.dataset.mode=value;modes.append(b);}
    function close(){if(closing)return;closing=true;editor?.destroy();editor=null;active=null;modes.remove();heading?.removeAttribute('data-tka-editor-heading');box.remove();r.root.removeAttribute('data-tka-desc-editing');schedule();}
    function cancel(){if(busy)return;if(current()!==original&&!confirm(sent?'Close this draft? A save was already submitted; this will not undo it.':'Discard this unsaved description draft?'))return;close();}
    function freeze(value){text.readOnly=value;visual.toggleAttribute('inert',value);modes.querySelectorAll('button').forEach(b=>b.disabled=value);}
    async function verifySave(){
      for(let attempt=0;attempt<4;attempt++){
        if(attempt)await new Promise(resolve=>setTimeout(resolve,500));
        if(await savedDescription(r,id)===submittedValue){close();return;}
      }
      throw new Error('The save is not confirmed yet. Your draft is retained. Use Check save to check again without resending.');
    }
    const actions=el('div','tka-editor-actions'),cancelButton=button('Cancel',cancel);
    const apply=button('Save',async()=>{
      if(busy)return;
      if(sent){busy=true;apply.disabled=true;status.textContent='Checking save...';try{await verifySave();}catch(error){status.textContent=error.message;}finally{busy=false;apply.disabled=false;}return;}
      const value=current();
      if(value===original){close();return;}
      if(!r.root.isConnected || location.pathname!==route || raw(r)!==original || textarea(r)){
        status.textContent='The Accelo description changed or you moved to another record. Copy your draft and reopen the current description.';return;
      }
      if(/<\/?[A-Za-z][^>]*>/.test(value)){
        status.textContent='Accelo removes HTML tags from descriptions. Replace raw tags with escaped text before saving. Your draft has not been sent.';return;
      }
      const native=trigger(r);if(!native || !canEdit(r)){status.textContent='The native edit control is unavailable. Your draft has not been sent.';return;}
      if(!id || !/^\d+$/.test(id)){status.textContent='Could not identify this record safely. Your draft has not been sent.';return;}
      const classicSave=r.legacy?r.root.querySelector('.save_inline_edit'):null;
      if(r.legacy&&!classicSave){status.textContent='The native Save control is unavailable. Your draft has not been sent.';return;}
      busy=true;apply.disabled=true;cancelButton.disabled=true;freeze(true);status.textContent='Saving...';
      let field=null,changedField=false;
      try{
        if(await savedDescription(r,id)!==original)throw new Error('The saved description changed. Copy your draft and reopen this description before saving.');
        if(closing || !r.root.isConnected || location.pathname!==route || raw(r)!==original || recordId(r)!==id)throw new Error('The current record changed. Your draft has not been sent.');
        // Keep the draft outside the subtree React replaces for its native text field.
        r.root.append(box);r.nativeClick=true;try{native.click();}finally{r.nativeClick=false;}
        field=await waitForField(r);
        if(field.value.replace(/\r\n/g,'\n')!==original.replace(/\r\n/g,'\n'))throw new Error('The native field contains different text. Your draft was not applied.');
        Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(field,value);
        changedField=true;
        field.dispatchEvent(new Event('input',{bubbles:true}));field.dispatchEvent(new Event('change',{bubbles:true}));
        await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
        if(closing || !r.root.isConnected || location.pathname!==route || recordId(r)!==id || !field.isConnected || field.value!==value)throw new Error('Accelo did not accept the text or the current record changed. Your draft is retained.');
        submittedValue=r.kind==='task'&&!r.legacy?value.trim():value;sent=true;
        // Trigger exactly the native save action, then verify persistence with a fresh read.
        if(r.legacy)classicSave.click();else r.root.dispatchEvent(new MouseEvent('mousedown',{bubbles:true}));
        await verifySave();
      }catch(error){
        // An unsubmitted handoff must not leave a changed native field to save on a later click.
        if(!sent && changedField && field?.isConnected){
          Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(field,original);
          field.dispatchEvent(new Event('input',{bubbles:true}));field.dispatchEvent(new Event('change',{bubbles:true}));
          field.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
        }
        status.textContent=error.message;busy=false;apply.disabled=false;cancelButton.disabled=false;apply.textContent=sent?'Check save':'Save';freeze(sent);
      }
    });apply.classList.add('tka-primary');actions.append(cancelButton,apply);
    box.append(text,visual,status,actions);
    const mount=r.legacy?trigger(r):$(r.root,r.kind==='task'?'panel_description':'panel_summary');if(!mount)return;
    mount.append(box);r.root.setAttribute('data-tka-desc-editing','');active={box,close,record:r};
    if(!r.legacy){heading=r.kind==='task'?r.root.previousElementSibling:r.root.querySelector('h6')?.parentElement;if(!heading?.querySelector('h6') || heading===mount || heading===r.root)heading=null;}
    if(heading){heading.setAttribute('data-tka-editor-heading','');heading.append(modes);}else box.prepend(modes);
    nativeButtonStyle(cancelButton);nativeButtonStyle(apply,true);
    for(const name of ['mousedown','touchstart','click'])modes.addEventListener(name,e=>e.stopPropagation());
    modes.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();cancel();}e.stopPropagation();});
    box.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();cancel();}});
    for(const name of ['keydown','mousedown','touchstart','click'])box.addEventListener(name,e=>e.stopPropagation());
    setMode(mode);box.focus();
  }
  function applySettings(next){prefs=C.settings(next);schedule();}
  if(typeof chrome!=='undefined'&&chrome.storage?.local){
    chrome.storage.local.get('toolkitSettings').then(r=>applySettings(r.toolkitSettings)).catch(()=>schedule());
    chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes.toolkitSettings)applySettings(changes.toolkitSettings.newValue);});
  } else schedule();
  window.addEventListener('popstate',schedule);window.addEventListener('hashchange',schedule);
  globalThis.__toolkitDescriptions={applySettings,scan,stop(){stopped=true;observer.disconnect();active?.close();for(const r of records.values())release(r);records.clear();},records};
  observe();
})();
