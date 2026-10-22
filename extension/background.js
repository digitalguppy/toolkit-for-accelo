'use strict';
chrome.action.onClicked.addListener(() => chrome.runtime.openOptionsPage());

// These are Accelo's observed modern/classic static asset hosts. Never proxy
// business URLs, images, arbitrary sites, credentials or redirects.
const themeAssetHosts = new Set(['d203gnlohy77cz.cloudfront.net', 'd23xudf289lfof.cloudfront.net']);
const themeCSSCache = new Map();
function isAcceloPage(raw) {
  try {const page = new URL(raw); return /^https:\/\/[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.accelo\.com$/.test(page.origin) && !page.username && !page.password;}
  catch {return false;}
}
function allowedThemeCSS(raw) {
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' && themeAssetHosts.has(url.hostname) && !url.port && !url.username && !url.password &&
      !url.search && !url.hash && /^\/[a-zA-Z0-9./_-]+\.css$/.test(url.pathname);
  } catch {return false;}
}
async function readThemeCSS(url) {
  if (!allowedThemeCSS(url)) throw new Error('Unsupported stylesheet');
  if (themeCSSCache.has(url)) return themeCSSCache.get(url);
  const pending = (async () => {
    const response = await fetch(url, {credentials: 'omit', redirect: 'error', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(15000)});
    if (!response.ok || !/^text\/css\b/i.test(response.headers.get('content-type') || '')) throw new Error('Invalid stylesheet response');
    const reader = response.body.getReader(), chunks = []; let length = 0;
    try {
      while (true) {
        const {done, value} = await reader.read(); if (done) break;
        length += value.byteLength;
        if (length > 4 * 1024 * 1024) throw new Error('Stylesheet too large');
        chunks.push(value);
      }
    } finally {await reader.cancel().catch(() => {});}
    const bytes = new Uint8Array(length);let offset = 0;
    for (const chunk of chunks) {bytes.set(chunk, offset); offset += chunk.byteLength;}
    return new TextDecoder().decode(bytes);
  })();
  if (themeCSSCache.size >= 80) themeCSSCache.delete(themeCSSCache.keys().next().value);
  themeCSSCache.set(url, pending);
  try {return await pending;} catch (error) {themeCSSCache.delete(url); throw error;}
}
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (message?.type !== 'tka-theme-css') return;
  if (sender.id !== chrome.runtime.id || !sender.tab || !isAcceloPage(sender.url) || !allowedThemeCSS(message.url)) {
    respond({ok: false, error: 'Stylesheet URL or sender is not allowed'}); return;
  }
  readThemeCSS(message.url).then(css => respond({ok: true, css}), error => respond({ok: false, error: error.message}));
  return true;
});
