(() => {
  'use strict';
  if (!/^https:\/\/[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.accelo\.com$/.test(location.origin) || new URL(location.href).searchParams.get('action') !== 'timesheet_entry' || globalThis.ToolkitWeeklyTimers) return;
  globalThis.ToolkitWeeklyTimers = true;
  const C = globalThis.ToolkitAccelo, T = globalThis.ToolkitTimesheet;
  let prefs = C.settings(), revision = 0, scheduled = false;
  function scan() {
    for (const cell of document.querySelectorAll('td.ts_against_cell')) {
      const timer = prefs.weeklyTimers ? T.identify(cell) : null;
      const mask = cell.querySelector('.ts_against_mask');
      let button = cell.querySelector('button.tka-timesheet-timer');
      if (!timer || !mask) {
        button?.remove(); cell.classList.remove('tka-timesheet-cell', 'tka-timesheet-no-relocate'); continue;
      }
      const relocate = cell.querySelector('[tooltip="Relocate All Activities"]');
      cell.classList.add('tka-timesheet-cell');
      cell.classList.toggle('tka-timesheet-no-relocate', !relocate);
      if (!button) {
        button = document.createElement('button'); button.type = 'button';
        button.className = 'expand_button expand_b_lrg right tka-timesheet-timer';
        button.title = 'Start Timer';
        const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
        svg.setAttribute('class','ico ico--20px'); svg.setAttribute('aria-hidden','true');
        const use = document.createElementNS(svg.namespaceURI,'use');
        use.setAttribute('href','#ico-timer-20x20'); svg.append(use); button.append(svg);
        if (relocate) relocate.before(button); else mask.after(button);
      }
      const name = `Start timer for ${timer.subject}`;
      if (button.getAttribute('aria-label') !== name) button.setAttribute('aria-label', name);
    }
  }
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => {scheduled = false; scan();}, 80);
  });
  observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['href','data-task_id']});
  const storage = typeof chrome !== 'undefined' && chrome.storage;
  storage?.onChanged?.addListener((changes, area) => {
    if (area === 'local' && changes.toolkitSettings) {revision++; prefs = C.settings(changes.toolkitSettings.newValue); scan();}
  });
  if (storage?.local) {
    const initial = revision;
    storage.local.get('toolkitSettings').then(result => {if (initial === revision) {prefs = C.settings(result.toolkitSettings); scan();}}).catch(() => {});
  } else scan();
})();
