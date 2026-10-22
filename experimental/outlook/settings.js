(() => {
  'use strict';
  const C = globalThis.ToolkitAccelo;
  const storage = typeof chrome !== 'undefined' && chrome.storage?.local;
  let prefs = C.settings(), saveChain = Promise.resolve(), edit = 0;
  const status = document.getElementById('status');
  const enabled = document.getElementById('enabled');
  const indicator = document.getElementById('preview-indicator');
  const items = document.getElementById('preview-items');
  const outlookConnection = document.getElementById('outlook-connection-status');
  const outlookLastResult = document.getElementById('outlook-last-result');
  const outlookClient = document.getElementById('outlookClientId');
  const outlookTenant = document.getElementById('outlookTenant');
  const outlookConnect = document.getElementById('outlook-connect');
  const outlookDisconnect = document.getElementById('outlook-disconnect');
  const outlookRefresh = document.getElementById('outlook-refresh-status');
  let outlookBusy = false, outlookStatusRevision = 0;
  const systemTheme = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;
  function renderTheme() {
    document.documentElement.dataset.tkaSettingsTheme = prefs.theme === 'system' ? (systemTheme?.matches ? 'dark' : 'light') : prefs.theme;
  }
  function render() {
    renderTheme();
    enabled.checked = prefs.enabled;
    for (const key of ['inboxDelete', 'requestsDelete', 'weeklyTimers', 'retainerCurrent', 'retainerPrevious', 'retainerTasks', 'retainerUnapproved', 'markdownDisplay', 'markdownEditor', 'descriptionTop', 'descriptionExpanded']) document.getElementById(key).checked = prefs[key];
    document.getElementById('controls').disabled = !prefs.enabled;
    for (const key of ['theme', 'style', 'label', 'completion', 'outlookSyncMode']) for (const input of document.querySelectorAll(`[name="${key}"]`)) input.checked = input.value === prefs[key];
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
    prefs = C.settings({...prefs, outlookSyncMode: document.querySelector('[name="outlookSyncMode"]:checked').value, theme: document.querySelector('[name="theme"]:checked').value, completion: document.querySelector('[name="completion"]:checked').value, enabled: enabled.checked, style: document.querySelector('[name="style"]:checked').value, label: document.querySelector('[name="label"]:checked').value, modern: document.getElementById('modern').checked, classic: document.getElementById('classic').checked, milestone: document.getElementById('milestone').checked});
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
  function setOutlookBusy(busy) {
    outlookBusy = busy;
    for (const button of [outlookConnect, outlookDisconnect, outlookRefresh]) button.disabled = busy;
    outlookClient.disabled = busy; outlookTenant.disabled = busy;
  }
  function outlookError(message) {
    outlookConnection.textContent = message;
    outlookConnection.dataset.error = 'true';
  }
  function renderOutlookStatus(result) {
    if (!result?.ok) throw new Error(result?.error || 'Could not check the Microsoft connection.');
    outlookConnection.dataset.error = 'false';
    outlookConnection.textContent = result.connected ? `Connected as ${result.email}.` : 'Microsoft is not connected. Outlook sync is inactive.';
    outlookConnect.textContent = result.connected ? 'Reconnect Microsoft' : 'Connect Microsoft';
    outlookDisconnect.hidden = !result.connected;
    document.getElementById('outlook-redirect').value = result.redirectUrl || 'Available when installed';
    const last = result.lastSync;
    outlookLastResult.textContent = last?.summary ? `Last result: ${last.summary}` : '';
    outlookLastResult.dataset.error = String(['error', 'failed', 'uncertain'].includes(last?.state));
  }
  async function outlookRequest(action) {
    if (!storage || typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) throw new Error('Install Toolkit to connect Microsoft.');
    const result = await chrome.runtime.sendMessage({type: 'toolkit-outlook:' + action});
    if (!result?.ok) throw new Error(result?.error || 'Toolkit could not complete this request. Reload the extension and reopen settings.');
    return result;
  }
  async function refreshOutlookStatus() {
    if (outlookBusy) return;
    const revision = ++outlookStatusRevision;
    try {
      const result = await outlookRequest('status');
      if (revision === outlookStatusRevision && !outlookBusy) renderOutlookStatus(result);
    } catch (error) {if (revision === outlookStatusRevision && !outlookBusy) outlookError(error.message);}
  }
  function validateOutlookConfig(requireClient = false) {
    const rawClient = outlookClient.value.trim(), rawTenant = outlookTenant.value.trim().toLowerCase() || 'organizations';
    const normalized = C.settings({outlookClientId: rawClient, outlookTenant: rawTenant});
    outlookClient.setCustomValidity((rawClient || requireClient) && !normalized.outlookClientId ? 'Enter the Application (client) ID from your Microsoft app registration.' : '');
    outlookTenant.setCustomValidity(normalized.outlookTenant !== rawTenant ? 'Enter a tenant ID, a domain, or organizations.' : '');
    return outlookClient.checkValidity() && outlookTenant.checkValidity() ? normalized : null;
  }
  async function saveOutlookConfig(requireClient = false) {
    const normalized = validateOutlookConfig(requireClient);
    if (!normalized) return false;
    prefs = {...prefs, outlookClientId: normalized.outlookClientId, outlookTenant: normalized.outlookTenant};
    return await savePreferences();
  }
  for (const field of [outlookClient, outlookTenant]) {
    field.addEventListener('input', () => field.setCustomValidity(''));
    field.addEventListener('change', () => {void saveOutlookConfig();});
  }
  outlookConnect.addEventListener('click', async () => {
    if (outlookBusy) return;
    if (!validateOutlookConfig(true)) {
      document.getElementById('outlook-setup').open = true;
      if (!outlookClient.reportValidity()) outlookClient.focus();
      else {outlookTenant.reportValidity(); outlookTenant.focus();}
      outlookError('Complete the Microsoft app setup before connecting.'); return;
    }
    // Request optional access directly in the user gesture, before awaiting a save.
    let permission;
    try {
      if (typeof chrome === 'undefined' || !chrome.permissions?.request) throw new Error('Install Toolkit to connect Microsoft.');
      permission = chrome.permissions.request({origins: ['https://graph.microsoft.com/*', 'https://login.microsoftonline.com/*', 'https://digitalguppy.accelo.com/*']});
    } catch (error) {outlookError(error.message); return;}
    ++outlookStatusRevision; setOutlookBusy(true);
    outlookConnection.dataset.error = 'false'; outlookConnection.textContent = 'Connecting to Microsoft...';
    try {
      if (!await permission) throw new Error('Connection cancelled. Microsoft access was not granted.');
      if (!await saveOutlookConfig(true)) throw new Error('Could not save the Microsoft app setup. Please try again.');
      renderOutlookStatus(await outlookRequest('connect'));
    } catch (error) {outlookError(error.message);}
    finally {setOutlookBusy(false);}
  });
  outlookDisconnect.addEventListener('click', async () => {
    if (outlookBusy) return;
    ++outlookStatusRevision; setOutlookBusy(true);
    try {renderOutlookStatus(await outlookRequest('disconnect'));}
    catch (error) {outlookError(error.message);}
    finally {setOutlookBusy(false);}
  });
  outlookRefresh.addEventListener('click', refreshOutlookStatus);
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
    if (button.dataset.section === 'inbox') void refreshOutlookStatus();
  });
  window.addEventListener('hashchange', showSection);
  showSection();
  render();
  void refreshOutlookStatus();
  if (storage) {
    storage.get('toolkitSettings').then(result => {if (!edit) {prefs = C.settings(result.toolkitSettings); outlookClient.value = prefs.outlookClientId; outlookTenant.value = prefs.outlookTenant; render(); status.textContent = 'Preferences saved on this browser.';}}).catch(() => {status.textContent = 'Could not load preferences. Defaults shown.';});
  } else status.textContent = 'Preview only. Install the extension to save preferences.';
})();
