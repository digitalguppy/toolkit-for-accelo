(function (root) {
  'use strict';
  const ORIGIN = 'https://digitalguppy.accelo.com';
  const STORE = 'toolkitOutlookPrepared';
  function validSender(sender) {
    try {
      const url = new URL(sender.url);
      return sender.id === root.chrome?.runtime.id && Number.isInteger(sender.tab?.id) && sender.frameId === 0 &&
        typeof sender.documentId === 'string' && url.origin === ORIGIN && url.pathname === '/' && url.searchParams.get('action') === 'home_inbox';
    } catch {return false;}
  }
  function sessionFromHTML(html) {
    // Only literal assignments inside scripts. Never evaluate page source or
    // accept tokens/identity forwarded from the page's JavaScript world.
    const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi)].map(m => m[1]);
    const keys = scripts.flatMap(s => [...s.matchAll(/\bapi_key\s*=\s*["']([A-Za-z0-9_-]{20,200})["']\s*;/g)].map(m => m[1]));
    const ids = scripts.flatMap(s => [...s.matchAll(/\bcurrent_user_id\s*=\s*["']?([1-9]\d*)["']?\s*;/g)].map(m => m[1]));
    if (new Set(keys).size !== 1 || new Set(ids).size !== 1) throw new Error('Could not verify your Accelo sign-in. Refresh Accelo before trying again.');
    return {apiKey: keys[0], userId: ids[0]};
  }
  function eligible(activity, id, identity, email) {
    const accountEmail = String(email || '').trim().toLowerCase();
    const recipient = activity?.recipients?.staff?.[identity.userId];
    if (String(activity?.id) !== String(id) || activity.medium !== 'email' || !accountEmail ||
      !['to', 'cc', 'bcc'].includes(recipient?.reply_type) || String(recipient?.email || '').trim().toLowerCase() !== accountEmail ||
      String(activity.from_email || '').trim().toLowerCase() === accountEmail ||
      !/^<[^<>\s\x00-\x1f]{1,990}>$/.test(activity.message_id || '')) return null;
    if (![0, 1, '0', '1', false, true].includes(activity.actioned)) return null;
    return {activityId: String(id), messageId: activity.message_id, recipientEmail: accountEmail, medium: 'email', incoming: true, actioned: Boolean(Number(activity.actioned)), userId: identity.userId};
  }
  function createVerifier({fetcher = root.fetch.bind(root), storage = root.chrome.storage.session, now = Date.now,
    random = () => root.crypto.randomUUID(), sleep = ms => new Promise(resolve => setTimeout(resolve, ms))} = {}) {
    let writes = Promise.resolve();
    const slot = (sender, activityId) => `${sender.tab.id}:${sender.documentId}:${activityId}`;
    async function change(fn) {
      const job = writes.catch(() => {}).then(async () => {
        const records = (await storage.get(STORE))[STORE] || {};
        for (const key of Object.keys(records)) if (records[key].expires < now()) delete records[key];
        const result = fn(records);
        // Bound retention across tabs. No message bodies, subjects or API keys.
        while (Object.keys(records).length > 30) delete records[Object.keys(records)[0]];
        await storage.set({[STORE]: records}); return result;
      });
      writes = job; return job;
    }
    async function identity() {
      const response = await fetcher(ORIGIN + '/?action=home_inbox', {credentials: 'include', redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(15000)});
      if (!response.ok) throw new Error('Could not verify your Accelo sign-in.');
      const html = await response.text();
      if (html.length > 4 * 1024 * 1024) throw new Error('Unexpected Accelo page response.');
      return sessionFromHTML(html);
    }
    async function activity(id, auth) {
      const response = await fetcher(`${ORIGIN}/api/0.5/key/activity/${id}`, {credentials: 'include', redirect: 'error', cache: 'no-store',
        headers: {'Accept': 'application/json', 'X-API-Key': auth.apiKey, 'X-CSRF-REQUESTED': '1'}, signal: AbortSignal.timeout(15000)});
      if (!response.ok) throw new Error('Could not verify the activity in Accelo.');
      try {return await response.json();} catch {throw new Error('Accelo did not return an activity. Refresh Accelo and try again.');}
    }
    function validate(id, sender) {
      if (!validSender(sender) || !/^[1-9]\d{0,12}$/.test(String(id))) throw new Error('This Outlook sync request is not from the Accelo Inbox.');
    }
    async function prepare({activityId, sender, accountEmail, connectionId}) {
      validate(activityId, sender);
      const auth = await identity(), record = eligible(await activity(activityId, auth), activityId, auth, accountEmail);
      if (!record || record.actioned) return null;
      const nonce = random(), expires = now() + 120000;
      await change(records => {records[slot(sender, activityId)] = {...record, nonce, expires, connectionId};});
      return {nonce, expires};
    }
    async function verify({activityId, sender, accountEmail, nonce, connectionId}) {
      validate(activityId, sender);
      if (typeof nonce !== 'string' || nonce.length > 100) throw new Error('Outlook sync was not ready for this action.');
      // Consume before any network request. No replay after errors or uncertain writes.
      const before = await change(records => {
        const key = slot(sender, activityId), row = records[key];
        if (!row || row.nonce !== nonce || row.activityId !== String(activityId) || row.recipientEmail !== accountEmail.toLowerCase() || row.connectionId !== connectionId) return null;
        delete records[key]; return row;
      });
      if (!before) throw new Error('Outlook sync was not ready. No Outlook changes were made.');
      const auth = await identity();
      if (auth.userId !== before.userId) throw new Error('Your Accelo user changed. No Outlook changes were made.');
      for (const delay of [0, 400, 800, 1600, 2400]) {
        if (delay) await sleep(delay);
        const after = eligible(await activity(activityId, auth), activityId, auth, accountEmail);
        if (!after || after.messageId !== before.messageId) throw new Error('The Accelo email changed or is no longer available.');
        if (after.actioned) return {...after, dateActioned: Math.floor(now() / 1000)};
      }
      throw new Error('Accelo did not confirm Action. Outlook was left unchanged.');
    }
    async function clear() {await change(records => {for (const key of Object.keys(records)) delete records[key];});}
    return {prepare, verify, clear};
  }
  const api = {validSender, sessionFromHTML, eligible, createVerifier};
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root.chrome?.storage?.session) Object.assign(api, createVerifier());
  root.ToolkitOutlookAccelo = api;
})(globalThis);
