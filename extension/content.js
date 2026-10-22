(() => {
  'use strict';
  const C = globalThis.ToolkitAccelo;
  if (!C || globalThis.__toolkitAcceloStarted) return;
  globalThis.__toolkitAcceloStarted = true;
  const loader = C.createLoader({fetcher: (...args) => fetch(...args)});
  const members = C.createLoader({fetcher: (...args) => fetch(...args), query:C.MILESTONE_QUERY, operationName:'ToolkitMilestoneChildren', parse:C.normalizeChildren});
  const rollups = C.createRollups({members, tasks:loader});
  const writer = C.createWriter({fetcher: (...args) => fetch(...args)});
  let prefs = C.settings(), revision = 0, routeKey = '', scheduled = false, drawerWasOpen = false, dialog = null, stopped = false;
  const cells = new Map();
  const milestoneCells = new Map();
  function clearData() {loader.clear();members.clear();rollups.clear();}
  function element(tag, className, text) {
    const e = document.createElement(tag); if (className) e.className = className;
    if (text !== undefined) e.textContent = text; return e;
  }
  function closeDialog() {const box = dialog; dialog = null; if (box) {box.close(); box.remove();}}
  function cleanup() {
    revision++; clearData(); cells.clear(); milestoneCells.clear(); closeDialog();
    document.querySelectorAll('[data-tka-owned]').forEach(e => e.remove());
  }
  function refresh(manual = false) {
    if (stopped) return;
    revision++; clearData();
    for (const cell of [...cells.keys(),...milestoneCells.keys()]) {delete cell.dataset.tkaLoaded; if (manual === true) cell.replaceChildren(element('span', 'tka-loading', 'Refreshing...'));}
    schedule();
  }
  function header(tag) {
    const cell = element(tag, 'tka-cell tka-head'); cell.dataset.tkaOwned = 'header';
    if (tag === 'th') cell.scope = 'col';
    const wrap = element('span', 'tka-head-inner');
    wrap.append(element('span', 'tka-head-label', 'Checklist'));
    const button = element('button', 'tka-refresh', '↻'); button.type = 'button';
    button.title = 'Refresh visible checklists'; button.setAttribute('aria-label', 'Refresh visible checklists');
    button.addEventListener('click', e => {e.stopPropagation(); refresh(true);});
    wrap.append(button); cell.append(wrap); return cell;
  }
  function matchHeader(cell, reference) {
    // V4 puts typography on a heading inside the cell; classic styles the cell itself.
    const typography = getComputedStyle(reference.querySelector('h6') || reference);
    for (const property of ['font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing', 'text-transform', 'color']) {
      const value = typography.getPropertyValue(property);
      if (value && cell.style.getPropertyValue(property) !== value) cell.style.setProperty(property, value, 'important');
    }
    const spacing = getComputedStyle(reference);
    for (const property of ['padding-top', 'padding-bottom']) {
      const value = spacing.getPropertyValue(property);
      if (value && cell.style.getPropertyValue(property) !== value) cell.style.setProperty(property, value, 'important');
    }
  }
  function matchRow(cell, reference) {
    const native = reference.querySelector('[data-element-name="CrayonTypography__typography"], [data-element-name="project-overview-task-title"], a') || reference;
    const style = getComputedStyle(native);
    for (const property of ['font-family','font-size','font-weight','font-style','line-height','letter-spacing','color']) {
      const value=style.getPropertyValue(property);
      if(value && cell.style.getPropertyValue(property)!==value)cell.style.setProperty(property,value,'important');
    }
  }
  function newCell(tag, taskId) {
    const cell = element(tag, 'tka-cell'); cell.dataset.tkaOwned = 'cell';
    if (taskId) {cell.dataset.tkaTask = taskId; cell.setAttribute('aria-label', `Checklist for task ${taskId}`);}
    return cell;
  }
  function draw(cell, data) {
    cell.dataset.tkaHasData = 'true';
    cell.replaceChildren();
    if (!data.total) {cell.title = 'No checklist items'; return;}
    cell.title = '';
    if (prefs.completion === 'hide' && data.complete === data.total) return;
    const aggregate = !!data.milestoneId;
    const button = element(aggregate?'span':'button', aggregate?'tka-indicator tka-rollup':'tka-indicator');
    button.title = aggregate ? `${data.complete} of ${data.total} checklist items complete across ${data.taskCount} tasks, including nested milestones. Includes collapsed and filtered tasks.` : `${data.complete} of ${data.total} complete. View checklist`;
    button.setAttribute('aria-label', aggregate ? button.title : `${data.complete} of ${data.total} checklist items complete. View task ${data.taskId} checklist`);
    if(!aggregate){button.type='button';button.setAttribute('aria-haspopup','dialog');}
    const completedTick = prefs.completion === 'tick' && data.complete === data.total;
    if (completedTick) {
      button.classList.add('tka-completed-indicator');
      const mark = element('span', 'tka-complete-tick');mark.setAttribute('aria-hidden','true');button.append(mark);
    } else if (prefs.style !== 'text') {
      const mark = element('span', prefs.style === 'circle' ? 'tka-circle' : 'tka-bar');
      mark.style.setProperty('--tka-progress', `${data.percent}%`); mark.setAttribute('aria-hidden', 'true');
      if (prefs.style === 'bar') mark.append(element('span', 'tka-bar-fill'));
      button.append(mark);
    }
    if (!completedTick) button.append(element('span', '', C.label(data, prefs.label)));
    if(!aggregate)button.addEventListener('click', e => {e.stopPropagation(); showDialog(data, button);});
    cell.append(button);
  }
  function showDialog(data, opener) {
    closeDialog();
    const box = element('dialog', 'tka-dialog'); box.dataset.tkaOwned = 'dialog';
    box.setAttribute('aria-label', `Checklist for task ${data.taskId}`);
    const head = element('header'); head.append(element('h2', '', `Task #${data.taskId} checklist`));
    const close = element('button', '', 'Close'); close.type = 'button'; close.autofocus = true;
    close.addEventListener('click', () => box.close()); head.append(close);
    const body = element('div', 'tka-dialog-body');
    const meta = element('p', 'tka-dialog-meta', `${data.complete} of ${data.total} complete (${data.percent}%)`); body.append(meta);
    data.groups.forEach((group, index) => {
      if (!group.items.length) return;
      if (data.groups.length > 1) body.append(element('h3', '', `Checklist ${index + 1}`));
      const ul = element('ul');
      for (const item of group.items) {
        const li = element('li'); const mark = element('input', 'tka-item-mark'); mark.type = 'checkbox'; mark.checked = item.completed;
        mark.disabled = !data.canUpdate || writer.isPending(data.taskId); mark.setAttribute('aria-label', item.title);
        const title = element('span', item.completed ? 'tka-completed' : '', item.title);
        li.setAttribute('aria-label', `${item.completed ? 'Completed' : 'Incomplete'}: ${item.title}`); li.append(mark, title); ul.append(li);
        if (item.completed && item.completedBy) li.append(element('span', 'tka-completed-by', item.completedBy));
        mark.addEventListener('change', async () => {
          const desired = mark.checked; mark.checked = item.completed;
          box.querySelectorAll('input, footer button').forEach(control => control.disabled = true);
          meta.textContent = 'Saving...';
          try {
            const next = await writer.set(data.taskId, item.id, desired);
            clearData(); revision++;
            for (const [cell, id] of cells) if (id === data.taskId && cell.isConnected) {draw(cell, next); cell.dataset.tkaLoaded = String(revision);}
            if (dialog === box) showDialog(next, opener);
            schedule();
          } catch (error) {
            if (dialog === box) {meta.textContent = error.message; meta.setAttribute('role', 'alert'); reload.disabled = false;}
          }
        });
      }
      body.append(ul);
    });
    if (!data.total) body.append(element('p', '', 'No checklist items.'));
    const foot = element('footer'); foot.append(element('span', '', data.canUpdate ? 'Changes save to Accelo' : 'Read-only · Toolkit for Accelo'));
    const reload = element('button', '', 'Refresh'); reload.type = 'button';
    reload.addEventListener('click', async () => {
      reload.disabled = true; meta.textContent = 'Refreshing...'; loader.forget(data.taskId);
      try {const next = await writer.read(data.taskId); clearData();revision++;schedule(); if (dialog === box) {showDialog(next, opener); for (const [cell, id] of cells) if (id === data.taskId && cell.isConnected) {draw(cell, next);cell.dataset.tkaLoaded=String(revision);}}}
      catch (error) {if (box.isConnected) {meta.textContent = error.message; meta.setAttribute('role', 'alert'); reload.disabled = false;}}
    }); foot.append(reload);
    box.append(head, body, foot);
    box.addEventListener('close', () => {box.remove(); if (dialog === box) dialog = null; if (opener.isConnected) opener.focus();});
    box.addEventListener('click', e => {if (e.target === box) {const r = box.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) box.close();}});
    document.body.append(box); dialog = box; box.showModal();
  }
  function loadCell(cell, id) {
    if (cell.dataset.tkaLoaded === String(revision)) return;
    cell.dataset.tkaLoaded = String(revision); const token = revision;
    cell.title = '';
    if (!cell.dataset.tkaHasData) cell.replaceChildren(element('span', 'tka-loading', 'Loading...'));
    loader.get(id).then(data => {
      if (cell.isConnected && revision === token && cell.dataset.tkaTask === id) draw(cell, data);
    }).catch(error => {
      if (!cell.isConnected || revision !== token) return;
      if (cell.dataset.tkaHasData && !cell.querySelector('.tka-loading')) {cell.title = `Last loaded progress. ${error.message}`; return;}
      const retry = element('button', 'tka-error', 'Retry'); retry.type = 'button'; retry.title = error.message;
      retry.setAttribute('aria-label', `${error.message} Retry checklist for task ${id}`);
      retry.addEventListener('click', e => {e.stopPropagation(); loader.forget(id); delete cell.dataset.tkaLoaded; loadCell(cell, id);});
      cell.replaceChildren(retry);
    });
  }
  function loadMilestone(cell, id) {
    if(cell.dataset.tkaLoaded===String(revision))return;
    const token=revision;cell.dataset.tkaLoaded=String(token);
    if(!cell.dataset.tkaHasData)cell.replaceChildren(element('span','tka-loading','Loading...'));
    rollups.get(id).then(data=>{
      if(cell.isConnected && revision===token && cell.dataset.tkaMilestone===id)draw(cell,data);
    }).catch(error=>{
      if(!cell.isConnected || revision!==token)return;
      if(cell.dataset.tkaHasData && !cell.querySelector('.tka-loading')){cell.title=`Last loaded milestone total. ${error.message}`;return;}
      const retry=element('button','tka-error','Retry');retry.type='button';retry.title=error.message;
      retry.setAttribute('aria-label',`Milestone total unavailable. ${error.message} Retry milestone ${id}`);
      retry.addEventListener('click',e=>{e.stopPropagation();refresh(true);});cell.replaceChildren(retry);
    });
  }
  function insert(parent, after, tag, id, isHead = false, milestoneId = null) {
    let cell = Array.from(parent.children).find(e => e.hasAttribute('data-tka-owned'));
    if (!cell) {cell = isHead ? header(tag) : newCell(tag, id); after.after(cell);}
    if (isHead) matchHeader(cell, after);
    else matchRow(cell, after);
    if (!isHead && ((cell.dataset.tkaTask || '') !== (id || '') || (cell.dataset.tkaMilestone || '') !== (milestoneId || ''))) {
      cells.delete(cell); milestoneCells.delete(cell);delete cell.dataset.tkaMilestone;delete cell.dataset.tkaLoaded; delete cell.dataset.tkaHasData; cell.replaceChildren();
      if (id) {cell.dataset.tkaTask = id; cell.setAttribute('aria-label', `Checklist for task ${id}`);}
      else {delete cell.dataset.tkaTask; cell.removeAttribute('aria-label');}
    }
    if (id) {cells.set(cell, id); loadCell(cell, id);}
    if(milestoneId){cell.dataset.tkaMilestone=milestoneId;cell.setAttribute('aria-label',`Checklist total for milestone ${milestoneId}`);milestoneCells.set(cell,milestoneId);loadMilestone(cell,milestoneId);}
    return cell;
  }
  function modern() {
    const area = document.querySelector('#project_workAreaContainer'); if (!area) return;
    const head = area.querySelector('table thead tr');
    if (!head || !head.firstElementChild?.textContent.includes('Title')) return;
    insert(head, head.firstElementChild, 'th', null, true);
    for (const row of area.querySelectorAll('[data-testid^="CrayonProjectsRow__row-"]')) {
      const key = row.getAttribute('data-testid');
      if (key.endsWith('project-summary')) continue;
      const container = row.querySelector('[class^="BaseRow_leftContent__"], [class*=" BaseRow_leftContent__"]');
      const title = container?.querySelector('[class^="BaseRow_iconTitle__"], [class*=" BaseRow_iconTitle__"]');
      if (!container || !title || title.parentElement !== container) continue;
      const id = key.match(/__row-Task_(\d+)$/)?.[1];
      const milestoneId=prefs.milestoneRollup?key.match(/__row-Milestone_(\d+)$/)?.[1]:null;
      insert(container, title, 'div', id, false, milestoneId);
    }
  }
  function legacy() {
    for (const table of document.querySelectorAll('table.JobOverviewTreeRow--header, table.JobOverviewTreeRow')) {
      const row = table.tBodies[0]?.rows[0]; if (!row || !row.cells.length) continue;
      const isHead = table.classList.contains('JobOverviewTreeRow--header');
      const id = table.querySelector('.view_task_button[data-task_id]')?.getAttribute('data-task_id');
      const link=!id&&!isHead&&prefs.milestoneRollup?row.cells[0].querySelector('a[href*="action=view_milestone"]'):null;
      const milestoneId=link?new URL(link.href,location.href).searchParams.get('id'):null;
      insert(row, row.cells[0], 'td', id, isHead, milestoneId);
    }
  }
  const observer = new MutationObserver(records => {
    const relevant = records.some(r => {
      if (r.target.nodeType === 1 && r.target.closest('[data-tka-owned]')) return false;
      const nodes = [...r.addedNodes, ...r.removedNodes];
      return !nodes.length || nodes.some(n => n.nodeType === 1 && !n.hasAttribute('data-tka-owned'));
    });
    if (relevant) schedule();
  });
  function observe() {if (!stopped) observer.observe(document.body, {childList: true, subtree: true});}
  function reconcile() {
    scheduled = false; observer.disconnect();
    if (stopped) return;
    try {
      const view = C.route(location.href);
      const key = `${location.pathname}${location.search.split('&').filter(v => !v.startsWith('tab=')).join('&')}`;
      if (key !== routeKey) {cleanup(); routeKey = key;}
      if (!prefs.enabled || !view || !prefs[view]) {if (cells.size || document.querySelector('[data-tka-owned]')) cleanup(); return;}
      const drawer = !!document.querySelector('[data-element-name="view_task_drawer"]');
      if (drawerWasOpen && !drawer) {revision++; clearData();}
      drawerWasOpen = drawer;
      for (const cell of cells.keys()) if (!cell.isConnected) cells.delete(cell);
      for (const cell of milestoneCells.keys()) if (!cell.isConnected) milestoneCells.delete(cell);
      if (view === 'modern') modern(); else legacy();
    } finally {observe();}
  }
  function schedule() {if (!stopped && !scheduled) {scheduled = true; setTimeout(reconcile, 100);}}
  function applySettings(next) {prefs = C.settings(next); cleanup(); schedule();}
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    chrome.storage.local.get('toolkitSettings').then(result => applySettings(result.toolkitSettings)).catch(() => applySettings(C.DEFAULTS));
    chrome.storage.onChanged.addListener((changes, area) => {if (area === 'local' && changes.toolkitSettings) applySettings(changes.toolkitSettings.newValue);});
  } else {schedule();}
  window.addEventListener('popstate', schedule);
  window.addEventListener('hashchange', schedule);
  window.addEventListener('focus', refresh);
  document.addEventListener('visibilitychange', () => {if (!document.hidden) refresh();});
  // Exposed only inside this content script's isolated world, for diagnostics and test cleanup.
  globalThis.__toolkitAccelo = {refresh, applySettings, stop() {stopped = true; observer.disconnect(); prefs.enabled = false; cleanup();}, stats: () => ({cells: cells.size, ...loader.stats()})};
  observe();
})();
