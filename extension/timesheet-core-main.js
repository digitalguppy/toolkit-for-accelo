(function(root) {
  'use strict';
  const origin = 'https://digitalguppy.accelo.com';
  const actions = Object.freeze({view_task:'task',view_issue:'issue',view_company:'company',view_contract_period:'contract_period',view_job:'job',view_milestone:'milestone',view_contract:'contract'});
  function identify(cell) {
    const heading = cell?.querySelector('.ts_work_obj_parent');
    const link = heading?.querySelector('a');
    if (!link) return null;
    let id = heading.getAttribute('data-task_id'), table = 'task';
    if (!id) {
      try {
        const url = new URL(link.getAttribute('href'), origin);
        if (url.origin !== origin || url.pathname !== '/') return null;
        id = url.searchParams.get('id'); table = actions[url.searchParams.get('action')];
      } catch {return null;}
    }
    if (!table || !/^[1-9]\d*$/.test(id || '')) return null;
    const subject = link.textContent.trim();
    if (!subject) return null;
    return {engagement:{id,table},subject};
  }
  const api = Object.freeze({identify});
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.ToolkitTimesheet = api;
})(globalThis);
