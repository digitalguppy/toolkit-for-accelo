(() => {
  'use strict';
  const C = globalThis.ToolkitAccelo;
  const storage = typeof chrome !== 'undefined' && chrome.storage?.local;
  let prefs = C.settings(), saveChain = Promise.resolve(), edit = 0;
  const status = document.getElementById('status');
  const enabled = document.getElementById('enabled');
  const indicator = document.getElementById('preview-indicator');
  const items = document.getElementById('preview-items');
  const systemTheme = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;
  function renderTheme() {
    document.documentElement.dataset.tkaSettingsTheme = prefs.theme === 'system' ? (systemTheme?.matches ? 'dark' : 'light') : prefs.theme;
  }
  function render() {
    renderTheme();
    enabled.checked = prefs.enabled;
    for (const key of ['inboxDelete', 'requestsDelete', 'weeklyTimers', 'retainerCurrent', 'retainerPrevious', 'retainerTasks', 'retainerUnapproved', 'markdownDisplay', 'markdownEditor', 'descriptionTop', 'descriptionExpanded']) document.getElementById(key).checked = prefs[key];
    document.getElementById('controls').disabled = !prefs.enabled;
    for (const key of ['theme', 'style', 'label', 'completion']) for (const input of document.querySelectorAll(`[name="${key}"]`)) input.checked = input.value === prefs[key];
    for (const key of ['modern', 'classic', 'milestone', 'milestoneRollup']) document.getElementById(key).checked = prefs[key];
    const mark = document.getElementById('preview-mark'); mark.className = prefs.style; mark.hidden = prefs.style === 'text';
    document.getElementById('preview-value').textContent = C.label({complete: 3, total: 6, percent: 50}, prefs.label);
    const completeMark=document.getElementById('preview-complete-mark'),completeValue=document.getElementById('preview-complete-value');
    completeMark.className=prefs.completedTick?'complete-tick':prefs.style;completeMark.hidden=!prefs.completedTick && prefs.style==='text';
    completeValue.textContent=C.label({complete:6,total:6,percent:100},prefs.label);completeValue.hidden=prefs.completedTick;
    document.getElementById('preview-complete-indicator').hidden=!prefs.enabled || prefs.completion === 'hide';
    document.getElementById('preview-complete-indicator').classList.toggle('centred-tick', prefs.completion === 'tick');
    indicator.hidden = !prefs.enabled;
    if (!prefs.enabled) items.hidden = true;
    indicator.setAttribute('aria-expanded', String(!items.hidden));
    indicator.setAttribute('aria-label', `3 of 6 checklist items complete. ${items.hidden ? 'Show' : 'Hide'} example items`);
    document.getElementById('preview-hint').textContent = prefs.enabled ? 'Click the indicator to view the items.' : 'Checklist progress is switched off.';
  }
  function update() {
    prefs = C.settings({...prefs, theme: document.querySelector('[name="theme"]:checked').value, completion: document.querySelector('[name="completion"]:checked').value, enabled: enabled.checked, style: document.querySelector('[name="style"]:checked').value, label: document.querySelector('[name="label"]:checked').value, modern: document.getElementById('modern').checked, classic: document.getElementById('classic').checked, milestone: document.getElementById('milestone').checked});
    for (const key of ['inboxDelete', 'requestsDelete', 'weeklyTimers', 'retainerCurrent', 'retainerPrevious', 'retainerTasks', 'retainerUnapproved', 'markdownDisplay', 'markdownEditor', 'descriptionTop', 'descriptionExpanded']) prefs[key] = document.getElementById(key).checked;
    prefs.milestoneRollup=document.getElementById('milestoneRollup').checked;
    render(); return savePreferences();
  }
  function savePreferences() {
    const token = ++edit;
    if (!storage) {status.textContent = 'Preview only. Install the extension to save preferences.'; return;}
    const snapshot = {...prefs}; status.textContent = 'Saving...';
    saveChain = saveChain.catch(() => {}).then(() => storage.set({toolkitSettings: snapshot})).then(() => {if (token === edit) status.textContent = 'Saved. Open Accelo views update automatically.'; return true;}).catch(() => {if (token === edit) status.textContent = 'Could not save. Please reopen settings and try again.'; return false;});
    return saveChain;
  }
  document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => input.addEventListener('change', update));
  systemTheme?.addEventListener('change', renderTheme);
  indicator.addEventListener('click', () => {items.hidden = !items.hidden; render();});
  function showSection() {
    const requested = location.hash.slice(1);
    const id = document.getElementById('panel-' + requested) ? requested : 'general';
    for (const panel of document.querySelectorAll('.settings-panel')) panel.hidden = panel.id !== 'panel-' + id;
    for (const button of document.querySelectorAll('[data-section]')) {
      if (button.dataset.section === id) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    }
  }
  for (const button of document.querySelectorAll('[data-section]')) button.addEventListener('click', () => {
    location.hash = button.dataset.section; showSection();
  });
  window.addEventListener('hashchange', showSection);
  showSection();
  render();
  if (storage) {
    storage.get('toolkitSettings').then(result => {if (!edit) {prefs = C.settings(result.toolkitSettings); render(); status.textContent = 'Preferences saved on this browser.';}}).catch(() => {status.textContent = 'Could not load preferences. Defaults shown.';});
  } else status.textContent = 'Preview only. Install the extension to save preferences.';
})();
