(() => {
  'use strict';
  const C = globalThis.ToolkitAccelo;
  const action = new URL(location.href).searchParams.get('action');
  if (!/^https:\/\/[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.accelo\.com$/.test(location.origin) || !['home_inbox', 'customer_request'].includes(action) || globalThis.ToolkitInbox) return;
  globalThis.ToolkitInbox = true;
  const requests = action === 'customer_request';
  let prefs = C.settings(), revision = 0, current = null, pending = null, timer;
  const submitted = new Set();
  const rootSelector = `.activity_view_full[context="${requests ? 'request_inbox' : 'inbox'}"][mainactivity="selected_activity"]`;
  const menuSelector = '.activity_action_buttons [data-element-name="dropdownButton"]';
  function identify(root) {
    const view = root.querySelector(':scope > .activity_toolbar a[href*="action=view_activity"]');
    if (!view) return null;
    const url = new URL(view.href, location.href), id = url.searchParams.get('id');
    return url.origin === location.origin && url.searchParams.get('action') === 'view_activity' && /^[1-9]\d*$/.test(id || '') ? id : null;
  }
  function snapshot() {
    if (!prefs[requests ? 'requestsDelete' : 'inboxDelete']) return null;
    const roots = [...document.querySelectorAll(rootSelector)];
    if (roots.length !== 1) return null;
    const root = roots[0], id = identify(root), menu = root.querySelector(menuSelector);
    const anchor = requests ? document.querySelector('#view_pane_title_block .activity_toolbar a[ng-click="close_request()"]') : root.querySelector(':scope > .activity_toolbar a[ng-click="action(activity);"]');
    if (!id || !menu || !anchor) return null;
    const title = document.querySelector('#view_pane_title_block .view_pane_title')?.textContent.trim() || `Activity #${id}`;
    return {root, id, menu, anchor, title, href: location.href};
  }
  function same(a, b) {return !!a && !!b && a.root === b.root && a.id === b.id && a.anchor === b.anchor && a.title === b.title && a.href === b.href;}
  function deleteLink(state) {
    // Only the permission-gated native menu item, never a URL from email content.
    const links = [...document.querySelectorAll('span[ng-if="!activity.is_locked && activity.deletable"] > a.dropbubble__item[ng-href]')].filter(link => {
      if (link.closest('.activity_content, .activity_body, .activity_text, iframe, .tka-inbox-dialog')) return false;
      try {
        const url = new URL(link.href, location.href);
        const ref = new URLSearchParams(url.searchParams.get('referring_link') || '');
        return url.origin === location.origin && url.pathname === '/' && url.searchParams.get('action') === 'delete_activity' && url.searchParams.get('id') === state.id && ref.get('action') === action && !url.searchParams.has('confirm');
      } catch {return false;}
    });
    return links.length === 1 ? links[0] : null;
  }
  function closeMenu(state, token) {
    if (state.menu.isConnected && (token?.menuOpened || deleteLink(state))) state.menu.click();
    if (token) token.menuOpened = false;
  }
  function label(text, title) {
    if (!current) return;
    current.button.querySelector('span').textContent = text;
    current.button.title = title;
    current.button.setAttribute('aria-label', text === 'Confirm?' ? 'Confirm delete activity' : text);
  }
  function dismiss() {
    if (!pending) return;
    const old = pending; pending = null;
    clearTimeout(old.expiry);
    closeMenu(old.state, old);
    if (current && !submitted.has(old.state.id)) {
      current.button.disabled = false;
      current.button.classList.remove('tka-inbox-armed');
      label('Delete', 'Delete activity (confirmation required)');
    }
  }
  async function openMenu(state, token) {
    if (pending !== token || !same(state, snapshot())) return null;
    const existing = deleteLink(state); if (existing) return existing;
    state.menu.click();
    token.menuOpened = true;
    // Angular may append its native menu after the click handler returns.
    for (let attempt = 0; attempt < 15; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 40));
      if (pending !== token || !same(state, snapshot())) return null;
      const link = deleteLink(state); if (link) return link;
    }
    return null;
  }
  async function begin(event) {
    event.preventDefault(); event.stopPropagation();
    const state = snapshot();
    if (!state || submitted.has(state.id)) return;
    if (pending && !same(pending.state, state)) {dismiss(); scan(); return;}
    if (!pending) {
      pending = {state, busy: false, menuOpened: false};
      pending.expiry = setTimeout(dismiss, 10000);
      current.button.classList.add('tka-inbox-armed');
      label('Confirm?', 'Click again to delete activity #' + state.id + ': ' + state.title + '. Escape or click elsewhere to cancel.');
      return;
    }
    const token = pending;
    if (token.busy) return;
    token.busy = true; clearTimeout(token.expiry);
    current.button.disabled = true;
    label('Deleting...', 'Checking Accelo delete access');
    const link = await openMenu(state, token);
    if (pending !== token) return;
    if (!link || !same(state, snapshot())) {
      dismiss();
      label('Unavailable', 'Accelo is not offering Delete for this activity. It may be locked or you may not have permission.');
      return;
    }
    // Dispatch the permission-gated native link once. Never retry an uncertain deletion.
    submitted.add(state.id);
    label('Deleting...', 'Delete requested. If Accelo does not reload, refresh to check the result before trying again.');
    link.click();
  }
  function scan() {
    const state = snapshot();
    if (pending && !same(pending.state, state)) dismiss();
    if (current && (!same(current.state, state) || !current.button.isConnected)) {current.button.remove(); current = null;}
    if (!state || current) return;
    const button = document.createElement('button'); button.type = 'button';
    button.className = `tka-inbox-shortcut tka-inbox-delete strokeButtonReskin strokeButtonReskin--small ${requests ? 'left' : 'right'}`;
    button.title = 'Delete activity (confirmation required)';
    button.disabled = submitted.has(state.id);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('viewBox','0 0 24 24'); svg.setAttribute('aria-hidden','true');
    const path = document.createElementNS(svg.namespaceURI, 'path'); path.setAttribute('d','M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7'); svg.append(path);
    const label = document.createElement('span'); label.textContent = 'Delete'; button.append(svg, label);
    button.addEventListener('click', begin);
    if (requests) state.anchor.before(button); else state.anchor.after(button);
    current = {state, button};
  }
  const observer = new MutationObserver(() => {clearTimeout(timer); timer = setTimeout(scan, 60);});
  observer.observe(document.body, {childList:true, subtree:true, attributes:true, attributeFilter:['href', 'context', 'class']});
  document.addEventListener('click', event => {
    if (pending && !pending.busy && !current?.button.contains(event.target)) dismiss();
  }, true);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && pending && !submitted.has(pending.state.id)) {event.preventDefault(); dismiss();}
  });
  window.addEventListener('pagehide', dismiss);
  window.addEventListener('hashchange', scan);
  const storage = typeof chrome !== 'undefined' && chrome.storage;
  storage?.onChanged?.addListener((changes, area) => {
    if (area === 'local' && changes.toolkitSettings) {revision++; prefs = C.settings(changes.toolkitSettings.newValue); scan();}
  });
  if (storage?.local) {
    const initial = revision;
    storage.local.get('toolkitSettings').then(result => {if (revision === initial) {prefs = C.settings(result.toolkitSettings); scan();}}).catch(() => {});
  } else scan();
})();
