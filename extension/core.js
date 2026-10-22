(function (root) {
  'use strict';
  const DEFAULTS = Object.freeze({version: 3, theme: 'light', inboxDelete: true, requestsDelete: true, outlookSyncMode: 'none', outlookClientId: '', outlookTenant: 'organizations', weeklyTimers: true, retainerCurrent: true, retainerPrevious: true, retainerTasks: true, retainerUnapproved: true, enabled: true, style: 'bar', label: 'count', completion: 'normal', completedTick: false, modern: true, classic: true, milestone: true, milestoneRollup: false, markdownDisplay: true, markdownEditor: true, descriptionTop: false, descriptionExpanded: true});
  const QUERY = 'query GetTaskChecklist($id: Int!) { tasks(filters: [{ints: {key: TaskId, value: [$id], type: equals}}], first: 1) { edges { node { id permissions { canUpdate } checklist { id checklistItems { id title isCompleted completedBy { name { fullName } } } } } } } }';
  const MILESTONE_QUERY = 'query ToolkitMilestoneChildren($id: Int!) { milestones(filters: {ints: {key: MilestoneId, type: equals, value: [$id]}}, first: 1) { edges { node { id children { __typename ... on Task { id } ... on Milestone { id } } } } } }';
  function settings(raw = {}) {
    const out = {...DEFAULTS};
    if (!raw || typeof raw !== 'object') return out;
    for (const key of ['inboxDelete', 'requestsDelete', 'weeklyTimers', 'retainerCurrent', 'retainerPrevious', 'retainerTasks', 'retainerUnapproved', 'enabled', 'completedTick', 'modern', 'classic', 'milestone', 'milestoneRollup', 'markdownDisplay', 'markdownEditor', 'descriptionTop', 'descriptionExpanded']) if (typeof raw[key] === 'boolean') out[key] = raw[key];
    if (typeof raw.requestsDelete !== 'boolean' && typeof raw.inboxDelete === 'boolean') out.requestsDelete = raw.inboxDelete;
    if (['circle', 'bar', 'text'].includes(raw.style)) out.style = raw.style;
    if (['count', 'percentage'].includes(raw.label)) out.label = raw.label;
    if (['light', 'dark', 'system'].includes(raw.theme)) out.theme = raw.theme;
    if (['none', 'read', 'archive', 'read_archive'].includes(raw.outlookSyncMode)) out.outlookSyncMode = raw.outlookSyncMode;
    if (typeof raw.outlookClientId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw.outlookClientId.trim())) out.outlookClientId = raw.outlookClientId.trim().toLowerCase();
    if (typeof raw.outlookTenant === 'string') {
      const tenant = raw.outlookTenant.trim().toLowerCase();
      if (tenant === 'organizations' || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(tenant) || /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(tenant)) out.outlookTenant = tenant;
    }
    // Keep the old checkbox preference when upgrading, then use one choice.
    out.completion = ['normal', 'tick', 'hide'].includes(raw.completion) ? raw.completion : raw.completedTick === true ? 'tick' : 'normal';
    out.completedTick = out.completion === 'tick';
    return out;
  }
  function route(href) {
    const url = new URL(href);
    if (url.origin !== 'https://digitalguppy.accelo.com') return null;
    if (/^\/app\/projects\/\d+\/?$/.test(url.pathname)) return (url.searchParams.get('tab') || 'Overview').toLowerCase() === 'overview' ? 'modern' : null;
    if (url.pathname !== '/') return null;
    const selectedTab = url.hash.match(/selected_tab=([^&#%]+)/i)?.[1];
    if (selectedTab && selectedTab.toLowerCase() !== 'overview') return null;
    if (['force_view_job', 'view_job'].includes(url.searchParams.get('action'))) return 'classic';
    if (url.searchParams.get('action') === 'view_milestone') return 'milestone';
    return null;
  }
  function normalize(body, taskId) {
    if (!body || body.errors?.length) throw new Error('Accelo could not return this checklist. Check your access and retry.');
    const edges = body.data?.tasks?.edges;
    if (!Array.isArray(edges)) throw new Error('Unexpected checklist response.');
    const task = edges.find(e => String(e?.node?.id) === String(taskId))?.node;
    if (!task) throw new Error('Task unavailable or access denied.');
    if (!Array.isArray(task.checklist)) throw new Error('Checklist data is unavailable.');
    const seen = new Set();
    const groups = task.checklist.map(group => {
      if (!group || !Array.isArray(group.checklistItems)) throw new Error('Unexpected checklist format.');
      const items = group.checklistItems.map(item => {
        if (!item || !['string', 'number'].includes(typeof item.id) || typeof item.title !== 'string' || typeof item.isCompleted !== 'boolean') throw new Error('Unexpected checklist item format.');
        return {id: String(item.id), title: item.title, completed: item.isCompleted, completedBy: item.isCompleted && typeof item.completedBy?.name?.fullName === 'string' ? item.completedBy.name.fullName : ''};
      }).filter(item => {if (seen.has(item.id)) return false; seen.add(item.id); return true;});
      return {id: String(group.id), items};
    });
    const items = groups.flatMap(g => g.items);
    const complete = items.filter(i => i.completed).length;
    return {taskId: String(taskId), canUpdate: task.permissions?.canUpdate === true, groups, items, total: items.length, complete, percent: items.length ? Math.round(complete / items.length * 100) : 0};
  }
  function label(data, mode) {return mode === 'percentage' ? `${data.percent}%` : `${data.complete} / ${data.total}`;}
  function createLoader({fetcher, concurrency = 3, ttl = 60000, now = Date.now, timeout = 15000, query = QUERY, operationName = 'GetTaskChecklist', parse = normalize}) {
    let active = 0, epoch = 0;
    const cache = new Map(), pending = new Map(), queue = [], controllers = new Set();
    function clear() {
      epoch++;
      cache.clear(); pending.clear();
      for (const job of queue.splice(0)) job.reject(new Error('Request cancelled.'));
      for (const controller of controllers) controller.abort();
    }
    async function run(job) {
      const controller = new AbortController();
      controllers.add(controller);
      const timer = setTimeout(() => controller.abort(), timeout);
      try {
        const response = await fetcher('/graphql', {method: 'POST', credentials: 'same-origin', redirect: 'error', headers: {'content-type': 'application/json'}, body: JSON.stringify({operationName, variables: {id: job.id}, query}), signal: controller.signal});
        if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? 'Sign in to Accelo and check your task access.' : `Accelo returned HTTP ${response.status}. Try again shortly.`);
        let body;
        try {body = await response.json();} catch {throw new Error('Accelo returned an unreadable response. Check that you are signed in.');}
        const data = parse(body, job.id);
        if (job.epoch !== epoch) throw new Error('Request cancelled.');
        cache.set(job.id, {data, expires: now() + ttl});
        job.resolve(data);
      } catch (error) {
        const reason = error.name === 'AbortError' ? new Error('Checklist request timed out or was cancelled. Retry to load it.') : error;
        if (job.epoch === epoch) cache.set(job.id, {error: reason, expires: now() + 15000});
        job.reject(reason);
      } finally {
        clearTimeout(timer); controllers.delete(controller);
        if (pending.get(job.id) === job.promise) pending.delete(job.id);
        active--; pump();
      }
    }
    function pump() {while (active < concurrency && queue.length) {active++; void run(queue.shift());}}
    function get(taskId) {
      const id = Number(taskId);
      if (!Number.isSafeInteger(id) || id <= 0 || id > 2147483647) return Promise.reject(new Error('Invalid task identifier.'));
      const hit = cache.get(id);
      if (hit && hit.expires > now()) return hit.error ? Promise.reject(hit.error) : Promise.resolve(hit.data);
      if (pending.has(id)) return pending.get(id);
      let resolve, reject;
      const promise = new Promise((res, rej) => {resolve = res; reject = rej;});
      pending.set(id, promise);
      queue.push({id, promise, resolve, reject, epoch}); pump();
      return promise;
    }
    return {get, clear, forget: id => cache.delete(Number(id)), stats: () => ({active, queued: queue.length, cached: cache.size})};
  }
  function createWriter({fetcher, timeout = 15000}) {
    const pending = new Set();
    async function request(payload) {
      const controller = new AbortController(), timer = setTimeout(() => controller.abort(), timeout);
      try {
        const response = await fetcher('/graphql', {method:'POST', credentials:'same-origin', redirect:'error', headers:{'content-type':'application/json'}, body:JSON.stringify(payload), signal:controller.signal});
        if (!response.ok) throw new Error('Accelo could not confirm the request.');
        const body = await response.json();
        if (body.errors?.length) throw new Error('Accelo could not confirm the request.');
        return body;
      } finally {clearTimeout(timer);}
    }
    async function read(id) {return normalize(await request({operationName:'GetTaskChecklist',variables:{id:Number(id)},query:QUERY}),id);}
    async function set(taskId, itemId, completed) {
      const key = String(taskId);
      if (pending.has(key)) throw new Error('A checklist change is already saving.');
      if (!Number.isSafeInteger(Number(taskId)) || Number(taskId)<=0 || typeof completed!=='boolean') throw new Error('Invalid checklist change.');
      pending.add(key);
      try {
        const before = await read(taskId), item = before.items.find(i=>i.id===String(itemId));
        if (!before.canUpdate || !item) throw new Error('This item is unavailable or you do not have permission to edit it.');
        if (item.completed===completed) return before;
        const field = completed?'completeChecklistItem':'uncompleteChecklistItem';
        const operationName = completed?'CompleteChecklistItem':'UncompleteChecklistItem';
        // Send once. Even after an uncertain response, read back instead of retrying the write.
        try {await request({operationName,variables:{input:{checklistItemId:String(itemId)}},query:`mutation ${operationName}($input: ${field}Args!) { ${field}(input: $input) { id checklistItems { id isCompleted } } }`});} catch {}
        let after;
        try {after = await read(taskId);} catch {throw new Error('Save could not be verified. Refresh to check the current state before trying again.');}
        if (after.items.find(i=>i.id===String(itemId))?.completed!==completed) throw new Error('The requested change was not confirmed. Refresh to check the current state.');
        return after;
      } finally {pending.delete(key);}
    }
    return {set,read,isPending:id=>pending.has(String(id))};
  }
  function normalizeChildren(body, id) {
    if (body?.errors?.length) throw new Error('Could not load every task in this milestone.');
    const node = body?.data?.milestones?.edges?.find(e=>String(e?.node?.id)===String(id))?.node;
    if (!node || !Array.isArray(node.children)) throw new Error('Milestone tasks are unavailable or access was denied.');
    return node.children.map(child=>{
      if (!child || !['Task','Milestone'].includes(child.__typename) || !/^\d+$/.test(String(child.id))) throw new Error('Unexpected milestone contents.');
      return {id:String(child.id),type:child.__typename};
    });
  }
  function createRollups({members, tasks}) {
    let epoch=0;const pending=new Map();
    async function collect(id, token) {
      const taskIds=new Set(), visited=new Set();
      async function visit(mid, ancestors=new Set()) {
        if(token!==epoch)throw new Error('Request cancelled.');
        if(ancestors.has(mid))throw new Error('Milestone hierarchy could not be verified.');
        if(visited.has(mid))return;visited.add(mid);
        if(visited.size>1000)throw new Error('Milestone is too large to total safely.');
        const next=new Set([...ancestors,mid]), children=await members.get(mid);
        for(const child of children) {
          if(child.type==='Task')taskIds.add(child.id);
          else await visit(child.id,next);
        }
        if(taskIds.size>10000)throw new Error('Milestone is too large to total safely.');
      }
      await visit(String(id));
      if(token!==epoch)throw new Error('Request cancelled.');
      const data=await Promise.all([...taskIds].map(tid=>tasks.get(tid)));
      if(token!==epoch)throw new Error('Request cancelled.');
      const total=data.reduce((n,d)=>n+d.total,0),complete=data.reduce((n,d)=>n+d.complete,0);
      return {milestoneId:String(id),taskCount:taskIds.size,total,complete,percent:total?Math.round(complete/total*100):0};
    }
    return {
      get(id){const key=String(id);if(!pending.has(key)){const p=collect(key,epoch).catch(error=>{if(pending.get(key)===p)pending.delete(key);throw error;});pending.set(key,p);}return pending.get(key);},
      clear(){epoch++;pending.clear();}
    };
  }
  const api = {DEFAULTS, QUERY, MILESTONE_QUERY, settings, route, normalize, normalizeChildren, label, createLoader, createWriter, createRollups};
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ToolkitAccelo = api;
})(globalThis);
