(() => {
  'use strict';
  if (location.origin !== 'https://digitalguppy.accelo.com' || new URL(location.href).searchParams.get('action') !== 'home_inbox' || globalThis.ToolkitOutlookContent) return;
  globalThis.ToolkitOutlookContent = true;
  let prefs = {outlookSyncMode: 'none'}, current = null, revision = 0, timer, pendingActions = 0;
  const rootSelector = '.activity_view_full[context="inbox"][mainactivity="selected_activity"]';
  function identify() {
    const roots = [...document.querySelectorAll(rootSelector)];
    if (roots.length !== 1) return null;
    const root = roots[0], toolbar = root.querySelector(':scope > .activity_toolbar');
    const anchor = toolbar?.querySelector('a[ng-click="action(activity);"]');
    const view = toolbar?.querySelector('a[href*="action=view_activity"]');
    if (!anchor || !view || !anchor.getClientRects().length) return null;
    try {
      const url = new URL(view.href);
      const id = url.searchParams.get('id');
      if (url.origin !== location.origin || url.pathname !== '/' || url.searchParams.get('action') !== 'view_activity' || !/^[1-9]\d*$/.test(id)) return null;
      return {id, root, anchor};
    } catch {return null;}
  }
  function notice(text, error = false) {
    let node = document.getElementById('tka-outlook-notice');
    if (!node) {node = document.createElement('div'); node.id = 'tka-outlook-notice'; node.className = 'tka-outlook-notice'; node.setAttribute('role', 'status'); node.setAttribute('aria-live', 'polite'); document.body.append(node);}
    node.textContent = text; node.dataset.error = String(error);
    clearTimeout(node.tkaExpiry); node.tkaExpiry = setTimeout(() => node.remove(), error ? 12000 : 6000);
  }
  function remove() {current?.hint.remove(); current = null;}
  async function prepare(state) {
    state.busy = true;
    state.hint.textContent = 'Checking Outlook sync...';
    try {
      const result = await chrome.runtime.sendMessage({type: 'toolkit-outlook:prepare', activityId: state.id});
      if (!result?.ok || !result.nonce) {
        if (current !== state) return;
        state.hint.textContent = result?.error || result?.summary || 'Outlook sync is not available for this email.';
        state.hint.title = 'Check Toolkit settings for your Microsoft connection. Accelo Action still works normally.';
        return;
      }
      state.nonce = result.nonce; state.expires = result.expires;
      if (current !== state) return;
      const labels = {read: 'mark as read', archive: 'archive', read_archive: 'mark as read and archive'};
      state.hint.textContent = `Outlook: ${labels[prefs.outlookSyncMode]}`;
      state.hint.title = 'Applies after Accelo confirms this Action. Does not apply to Action All, bulk actions, Reply or Delete.';
    } catch {if (current === state) state.hint.textContent = 'Reconnect Toolkit to sync Outlook.';}
    finally {state.busy = false;}
  }
  function scan() {
    if (prefs.outlookSyncMode === 'none') {remove(); return;}
    const next = identify();
    if (!next) {remove(); return;}
    if (current && current.id === next.id && current.root === next.root && current.anchor === next.anchor) return;
    remove();
    const hint = document.createElement('span'); hint.className = 'tka-outlook-hint'; hint.setAttribute('role', 'status');
    next.anchor.parentElement.append(hint);
    current = {...next, hint}; current.ready = prepare(current);
  }
  document.addEventListener('click', event => {
    // Only an actual user click on the selected activity's native Action link.
    // Never intercept/replace Accelo's handler, and never accept page events.
    if (!event.isTrusted || prefs.outlookSyncMode === 'none') return;
    const selected = identify(), state = current;
    if (!state || !selected || selected.id !== state.id || selected.anchor !== state.anchor || !state.anchor.contains(event.target)) return;
    if (state.clicked) return;
    state.clicked = true; pendingActions++;
    notice('Checking Accelo Action before updating Outlook...');
    void (async () => {
      try {
        await state.ready;
        if (!state.nonce || state.expires <= Date.now()) throw new Error('Outlook sync was not ready. Accelo Action is unaffected; Outlook was left unchanged.');
        const result = await chrome.runtime.sendMessage({type: 'toolkit-outlook:sync', activityId: state.id, nonce: state.nonce});
        if (!result?.ok) throw new Error(result?.error || 'Could not confirm Outlook sync. Check Toolkit settings.');
        notice(result.summary || 'Outlook sync finished.');
      } catch (error) {notice(error.message, true);}
      finally {pendingActions--; if (current === state) {remove(); scan();}}
    })();
  }, true);
  const observer = new MutationObserver(() => {clearTimeout(timer); timer = setTimeout(scan, 100);});
  observer.observe(document.body, {childList: true, subtree: true, attributes: true, attributeFilter: ['href', 'class']});
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.toolkitSettings) {revision++; prefs = changes.toolkitSettings.newValue || {outlookSyncMode: 'none'}; if (!prefs.outlookSyncMode) prefs.outlookSyncMode = 'none'; remove(); scan();}
  });
  const initial = revision;
  chrome.storage.local.get('toolkitSettings').then(result => {if (initial === revision) {prefs = {...prefs, ...result.toolkitSettings}; scan();}}).catch(() => {});
  setInterval(() => {
    if (current && !current.busy && !current.clicked && (!current.expires || current.expires < Date.now() + 30000) && !pendingActions) current.ready = prepare(current);
  }, 60000);
})();
