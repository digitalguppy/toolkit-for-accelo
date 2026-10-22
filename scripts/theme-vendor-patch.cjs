// Keep Dark Reader's API shim private and use a packaged MAIN-world CSSOM bridge.
// This avoids changing chrome.runtime and avoids inline script/CSP exceptions.
module.exports = function patch(source) {
  source = source.replace(/\r\n/g, '\n');
  const shim = 'if (!window.chrome) {\n    window.chrome = {};\n}\nif (!chrome.runtime) {\n    chrome.runtime = {};\n}';
  const start = source.indexOf('function injectProxy(');
  const end = source.indexOf('\nconst definedCustomElements =', start);
  const inline = /    \{\n        const proxyScript = createOrUpdateScript\("darkreader--proxy"\);[\s\S]*?        proxyScript\.remove\(\);\n    \}/;
  if (!source.includes(shim) || start < 0 || end < 0 || !inline.test(source)) throw new Error('Dark Reader source no longer matches the reviewed patch.');
  const proxy = source.slice(start, end);
  return {
    source: source.replace(shim, 'const chrome = {runtime: {}};').replace(inline, '    document.dispatchEvent(new CustomEvent("__tka_theme_proxy_start"));'),
    proxy: `(() => {\n'use strict';\n${proxy}\nlet active = false;\ndocument.addEventListener('__darkreader__cleanUp', () => { active = false; });\ndocument.addEventListener('__tka_theme_proxy_start', () => { if (!active) { active = true; injectProxy(true, true); } });\ndocument.dispatchEvent(new CustomEvent('__tka_theme_proxy_ready'));\n})();\n`
  };
};
