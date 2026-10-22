(() => {
  'use strict';
  const engine = globalThis.ToolkitThemeEngine;
  const storage = typeof chrome !== 'undefined' && chrome.storage;
  if (!engine || !storage?.local) return;
  const system = matchMedia('(prefers-color-scheme: dark)');
  const contrast = matchMedia('(forced-colors: active)');
  let mode = 'light', active = false, printing = false, revision = 0;
  let toolkitStyles;
  const options = {mode: 1, brightness: 100, contrast: 100, sepia: 0, grayscale: 0,
    darkSchemeBackgroundColor: '#18212b', darkSchemeTextColor: '#e3e9f0',
    scrollbarColor: 'auto', selectionColor: 'auto', styleSystemControls: true};
  // Keep photos and attachments intact. Chart fixes target presentation, not data series.
  const fixes = {ignoreImageAnalysis: ['*'], ignoreInlineStyle: [], invert: [], ignoreCSSUrl: ['fonts.googleapis.com'],
    css: `
      .tka-complete-tick { background: #3286cc !important; }
      .tka-complete-tick::after { border-color: #ffffff !important; }
      .tka-circle::after { background: #18212b !important; }
      .tka-circle { background: conic-gradient(#64b5f6 var(--tka-progress), #435567 0) !important; }
      .tka-bar-fill { background: #64b5f6 !important; }
      .tka-editor-inline { --tka-action-color: #a6caff; }
      input:not(:disabled)::placeholder,
      textarea:not(:disabled)::placeholder { color: #a8b8cc !important; opacity: 1 !important; }
      .fusioncharts-container svg [class$="-background"] > rect[fill]:not([fill="none"]),
      .fusioncharts-container svg [class$="-canvas"] > rect[fill]:not([fill="none"]) { fill: #18212b !important; }
      .fusioncharts-container svg text { fill: #dce6f1 !important; }
      .fusioncharts-container svg [class$="-axis-bands"] > rect { fill: #263647 !important; }
      .fusioncharts-container svg [class$="-axis-lines"] path { stroke: #63758a !important; }
      .customListTable tr > :last-child { background-image: none !important; background-color: #1d2935 !important; }
      .navExpandoEmptyListsContainer { background: #1d2935 !important; }
      .navExpandoEmptyListsContainer .color-tuna,
      .navExpandoEmptyListsContainer .color-ruffled-grey { color: #c5d3e2 !important; }
      [data-element-name="timers"] > svg > path[fill="#404040"] { fill: #e3e9f0 !important; fill-opacity: 1 !important; }
      .statusbar__controls__prev { background: linear-gradient(to right, #18212b 75%, transparent) !important; }
      .statusbar__controls__next { background: linear-gradient(to left, #18212b 75%, transparent) !important; }
      .toastui-editor-defaultUI-toolbar button { filter: invert(.85) hue-rotate(180deg); }
      .toastui-editor-defaultUI-toolbar button:hover { background-color: transparent !important; }
    `};
  engine.setFetchMethod(async url => {
    // Font-only imports contain no UI colours. Keep the page's native font load,
    // but do not proxy or recolour these nested imports through the theme engine.
    const parsed = new URL(url);
    if (parsed.protocol === 'https:' && parsed.hostname === 'fonts.googleapis.com' && ['/css', '/css2'].includes(parsed.pathname)) {
      return new Response('', {headers: {'Content-Type': 'text/css'}});
    }
    const result = await chrome.runtime.sendMessage({type: 'tka-theme-css', url});
    if (!result?.ok) throw new Error(`Toolkit could not read stylesheet ${new URL(url).origin}${new URL(url).pathname}: ${result?.error || 'No response from extension'}`);
    return new Response(result.css, {headers: {'Content-Type': 'text/css'}});
  });
  function render() {
    if (!document.documentElement) return;
    const dark = !printing && !contrast.matches && (mode === 'dark' || mode === 'system' && system.matches);
    if (dark === active) return;
    // Respect an independently installed Dark Reader instead of stacking themes.
    if (dark && document.documentElement.hasAttribute('data-darkreader-mode')) return;
    if (dark) {
      document.documentElement.dataset.tkaTheme = 'dark';
      toolkitStyles = document.createElement('style');
      toolkitStyles.dataset.tkaThemeSource = '';
      toolkitStyles.textContent = globalThis.ToolkitThemeStyles || '';
      (document.head || document.documentElement).append(toolkitStyles);
      try {engine.enable(options, fixes); active = true;}
      catch (error) {engine.disable(); toolkitStyles.remove(); delete document.documentElement.dataset.tkaTheme; console.warn('Toolkit appearance could not start.', error);}
    } else {
      engine.disable(); active = false;
      toolkitStyles?.remove(); toolkitStyles = null;
      delete document.documentElement.dataset.tkaTheme;
    }
  }
  function update(value) {mode = ['light', 'dark', 'system'].includes(value) ? value : 'light'; render();}
  storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.toolkitSettings) {revision++; update(changes.toolkitSettings.newValue?.theme);}
  });
  const initial = revision;
  storage.local.get('toolkitSettings').then(result => {if (initial === revision) update(result.toolkitSettings?.theme);}).catch(() => {});
  system.addEventListener('change', render);
  contrast.addEventListener('change', render);
  document.addEventListener('DOMContentLoaded', render, {once: true});
  document.addEventListener('__tka_theme_proxy_ready', () => {if (active) document.dispatchEvent(new CustomEvent('__tka_theme_proxy_start'));});
  addEventListener('beforeprint', () => {printing = true; render();});
  addEventListener('afterprint', () => {printing = false; render();});
})();
