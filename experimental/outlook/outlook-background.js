(function (root) {
  'use strict';
  const C = root.ToolkitOutlookCore || (typeof require === 'function' && require('./outlook-core.js'));
  const SESSION = 'toolkitOutlookSession', LEDGER = 'toolkitOutlookLedger', LAST = 'toolkitOutlookLastSync';
  const SELECT = 'id,internetMessageId,from,toRecipients,ccRecipients,bccRecipients,parentFolderId,isRead';
  function createService({chrome: browser, fetch: fetcher = root.fetch.bind(root), crypto = root.crypto, now = Date.now,
    verifyAccelo = args => root.ToolkitOutlookAccelo.verify(args),
    prepareAccelo = args => root.ToolkitOutlookAccelo.prepare(args),
    clearAccelo = () => root.ToolkitOutlookAccelo?.clear?.()} = {}) {
    let epoch = 0, connecting = false, queue = Promise.resolve(), refreshing;
    // Never expose bearer or refresh tokens to Accelo content scripts.
    const ready = browser.storage.session.setAccessLevel({accessLevel: 'TRUSTED_CONTEXTS'});
    const b64url = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    const random = () => b64url(crypto.getRandomValues(new Uint8Array(32)));
    const digest = async value => b64url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))));
    const settings = async () => (await browser.storage.local.get('toolkitSettings')).toolkitSettings || {};
    const readSession = async () => {await ready; return (await browser.storage.session.get(SESSION))[SESSION] || null;};
    const redirectUrl = () => browser.identity.getRedirectURL('outlook');
    async function permissions() {
      if (!await browser.permissions.contains({origins: [...C.ORIGINS]})) throw new Error('Connect Microsoft from Toolkit settings to allow Outlook sync.');
    }
    async function request(url, options = {}, label = 'Microsoft') {
      let response;
      try {response = await fetcher(url, {credentials: 'omit', redirect: 'error', cache: 'no-store', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(15000), ...options});}
      catch {throw new Error(`${label} could not be reached. No automatic retry will be made.`);}
      if (!response.ok) {
        const reason = response.status === 401 ? 'sign-in has expired; reconnect in Toolkit settings' : response.status === 403 ? 'permission was denied' : response.status === 429 ? 'is limiting requests; try a later action' : `returned an error (${response.status})`;
        throw new Error(`${label} ${reason}.`);
      }
      try {return response.status === 204 ? {} : await response.json();} catch {throw new Error(`${label} returned an unreadable response. No automatic retry will be made.`);}
    }
    async function tokenRequest(configuration, fields) {
      return request(`https://login.microsoftonline.com/${encodeURIComponent(configuration.tenant)}/oauth2/v2.0/token`, {
        method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({client_id: configuration.clientId, scope: C.SCOPES, ...fields}).toString()
      }, 'Microsoft sign-in');
    }
    function tokenData(result, previous = {}) {
      if (typeof result.access_token !== 'string' || !result.access_token || !C.hasScopes(result.scope || previous.scope) ||
          !Number.isFinite(Number(result.expires_in)) || Number(result.expires_in) <= 0 ||
          String(result.token_type).toLowerCase() !== 'bearer') throw new Error('Microsoft did not grant the required Outlook permissions.');
      return {accessToken: result.access_token, refreshToken: result.refresh_token || previous.refreshToken || '',
        scope: result.scope || previous.scope, expiresAt: now() + Number(result.expires_in) * 1000};
    }
    async function status() {
      const session = await readSession();
      const lastSync = (await browser.storage.session.get(LAST))[LAST] || null;
      const configured = await settings();
      const compatible = session && configured.outlookClientId === session.clientId && (configured.outlookTenant || 'organizations').toLowerCase() === session.tenant;
      return {ok: true, connected: !!compatible, email: compatible ? session.email : '', redirectUrl: redirectUrl(), lastSync};
    }
    async function connect() {
      if (connecting) throw new Error('Microsoft sign-in is already open.');
      connecting = true;
      const generation = ++epoch;
      try {
        await ready; await permissions(); await clearAccelo();
        const configuration = C.config(await settings());
        const verifier = random(), state = random();
        const auth = new URL(`https://login.microsoftonline.com/${encodeURIComponent(configuration.tenant)}/oauth2/v2.0/authorize`);
        auth.search = new URLSearchParams({client_id: configuration.clientId, response_type: 'code', response_mode: 'query',
          redirect_uri: redirectUrl(), scope: C.SCOPES, state, code_challenge: await digest(verifier), code_challenge_method: 'S256', prompt: 'select_account'}).toString();
        let result;
        try {result = await browser.identity.launchWebAuthFlow({url: auth.href, interactive: true});}
        catch {throw new Error('Microsoft sign-in was cancelled or could not be opened.');}
        const code = C.oauthResponse(result, redirectUrl(), state);
        const tokens = tokenData(await tokenRequest(configuration, {grant_type: 'authorization_code', code, redirect_uri: redirectUrl(), code_verifier: verifier}));
        const profile = await request('https://graph.microsoft.com/v1.0/me?$select=id,mail,userPrincipalName', {headers: {Authorization: `Bearer ${tokens.accessToken}`}}, 'Outlook');
        const address = C.email(profile.mail || profile.userPrincipalName);
        if (!profile.id || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) throw new Error('Microsoft did not return a usable mailbox address.');
        if (generation !== epoch) throw new Error('Microsoft connection was cancelled.');
        const current = C.config(await settings());
        if (current.clientId !== configuration.clientId || current.tenant !== configuration.tenant) throw new Error('Microsoft setup changed during sign-in. Connect again.');
        await browser.storage.session.set({[SESSION]: {...tokens, clientId: configuration.clientId, tenant: configuration.tenant, email: address, accountId: profile.id, generation: random()}});
        return status();
      } finally {connecting = false;}
    }
    async function disconnect() {
      ++epoch;
      await ready;
      await browser.storage.session.remove([SESSION, LAST]);
      await clearAccelo();
      return status();
    }
    async function access(session, generation) {
      if (session.expiresAt > now() + 90000) return session;
      if (!session.refreshToken) throw new Error('Microsoft sign-in has expired. Reconnect in Toolkit settings.');
      if (!refreshing) refreshing = (async () => {
        const tokens = tokenData(await tokenRequest(session, {grant_type: 'refresh_token', refresh_token: session.refreshToken}), session);
        if (epoch !== generation || (await readSession())?.generation !== session.generation) throw new Error('Outlook connection changed.');
        const refreshed = {...session, ...tokens};
        await browser.storage.session.set({[SESSION]: refreshed});
        return refreshed;
      })().finally(() => {refreshing = null;});
      return refreshing;
    }
    async function graph(path, session, options = {}) {
      return request(`https://graph.microsoft.com/v1.0${path}`, {...options,
        headers: {Authorization: `Bearer ${session.accessToken}`, Prefer: 'IdType="ImmutableId"', ...(options.body ? {'Content-Type': 'application/json'} : {}), ...options.headers}}, 'Outlook');
    }
    async function stillEnabled(session, mode, generation) {
      if (generation !== epoch) throw new Error('Outlook sync was cancelled before the next change.');
      const [current, active] = await Promise.all([settings(), readSession()]);
      if (current.outlookSyncMode !== mode || active?.generation !== session.generation ||
          current.outlookClientId !== session.clientId || (current.outlookTenant || 'organizations').toLowerCase() !== session.tenant) {
        throw new Error('Outlook sync settings changed before the next change.');
      }
    }
    async function recordResult(state, summary) {
      const lastSync = {state, summary, at: now()};
      await browser.storage.session.set({[LAST]: lastSync});
      return {ok: state !== 'error', state, summary, ...(state === 'error' ? {error: summary} : {})};
    }
    async function prepare(activityId, sender) {
      await ready;
      const preferences = await settings();
      if (!C.MODES.includes(preferences.outlookSyncMode) || preferences.outlookSyncMode === 'none') return {ok: true, state: 'off', summary: 'Outlook sync is off.'};
      const session = await readSession();
      if (!session) return {ok: true, state: 'disconnected', summary: 'Connect Microsoft in Toolkit settings to sync new actions.'};
      await permissions();
      await stillEnabled(session, preferences.outlookSyncMode, epoch);
      const baseline = await prepareAccelo({activityId, sender, accountEmail: session.email, connectionId: session.generation, now: now()});
      if (!baseline) return {ok: true, state: 'skipped', summary: 'This is not an un-actioned incoming email for the connected mailbox.'};
      if (!baseline || typeof baseline.nonce !== 'string' || !/^[a-zA-Z0-9_-]{20,128}$/.test(baseline.nonce)) throw new Error('The Accelo action could not be prepared for Outlook sync.');
      return {ok: true, nonce: baseline.nonce, expires: baseline.expires};
    }
    async function performSync(activityId, sender, nonce) {
      await ready;
      const preferences = await settings();
      if (!C.MODES.includes(preferences.outlookSyncMode) || preferences.outlookSyncMode === 'none') return {ok: true, state: 'off', summary: 'Outlook sync is off. No Outlook changes were made.'};
      const generation = epoch;
      let session = await readSession();
      if (!session) return recordResult('skipped', 'Connect Microsoft in Toolkit settings to sync new actions.');
      await permissions();
      await stillEnabled(session, preferences.outlookSyncMode, generation);
      const verified = C.verifiedAction(await verifyAccelo({activityId, sender, accountEmail: session.email, connectionId: session.generation, nonce, now: now()}), activityId, session.email, now());
      const key = await digest(JSON.stringify([session.accountId, verified.activityId, verified.dateActioned, verified.messageId]));
      const rawLedger = (await browser.storage.session.get(LEDGER))[LEDGER] || {};
      const ledger = Object.fromEntries(Object.entries(rawLedger).filter(([, item]) => item.at > now() - 86400000));
      if (ledger[key]) return {ok: true, state: 'duplicate', summary: 'This Accelo action has already been handled.'};
      if (Object.keys(ledger).length >= 2000) throw new Error('Outlook sync has reached its session limit. No message was changed.');
      session = await access(session, generation);
      const filter = `internetMessageId eq '${verified.messageId.replace(/'/g, "''")}'`;
      const query = new URLSearchParams({'$filter': filter, '$select': SELECT, '$top': '2'});
      const message = C.matchMessage(await graph(`/me/messages?${query}`, session), verified.messageId, session.email);
      const folders = {};
      if (preferences.outlookSyncMode.includes('archive')) {
        for (const name of ['inbox', 'archive']) {
          const folder = await graph(`/me/mailFolders/${name}?$select=id`, session);
          if (typeof folder.id !== 'string' || !folder.id) throw new Error('The Outlook folder could not be verified.');
          folders[name] = folder.id;
        }
      }
      const steps = C.plan(preferences.outlookSyncMode, message, folders);
      await stillEnabled(session, preferences.outlookSyncMode, generation);
      // Persist before the first write. A worker restart or uncertain network
      // result must never issue a second move for this Accelo action.
      ledger[key] = {at: now(), state: 'started'};
      await browser.storage.session.set({[LEDGER]: ledger});
      let readCompleted = false;
      try {
        for (const step of steps) {
          await stillEnabled(session, preferences.outlookSyncMode, generation);
          const before = C.matchMessage({value: [await graph(`/me/messages/${encodeURIComponent(message.id)}?$select=${SELECT}`, session)]}, verified.messageId, session.email);
          // Respect a user filing the email while Accelo/Graph checks ran.
          if (step === 'archive' && before.parentFolderId !== folders.inbox && before.parentFolderId !== folders.archive) throw new Error('This message was filed outside Inbox during the check.');
          if (step === 'read' && before.isRead || step === 'archive' && before.parentFolderId === folders.archive) continue;
          await stillEnabled(session, preferences.outlookSyncMode, generation);
          if (step === 'read') {
            await graph(`/me/messages/${encodeURIComponent(message.id)}`, session, {method: 'PATCH', body: JSON.stringify({isRead: true})});
          } else {
            await graph(`/me/messages/${encodeURIComponent(message.id)}/move`, session, {method: 'POST', body: JSON.stringify({destinationId: 'archive'})});
          }
          const fresh = await graph(`/me/messages/${encodeURIComponent(message.id)}?$select=${SELECT}`, session);
          C.matchMessage({value: [fresh]}, verified.messageId, session.email);
          if (step === 'read' && fresh.isRead !== true || step === 'archive' && fresh.parentFolderId !== folders.archive) throw new Error('The Outlook change could not be confirmed. No automatic retry will be made.');
          if (step === 'read') readCompleted = true;
        }
        ledger[key].state = 'done';
        await browser.storage.session.set({[LEDGER]: ledger});
        return recordResult('done', steps.length ? 'The confirmed Accelo action was applied and checked in Outlook.' : 'Outlook already had the requested state.');
      } catch (error) {
        ledger[key].state = 'uncertain';
        await browser.storage.session.set({[LEDGER]: ledger});
        return recordResult('error', `${readCompleted ? 'Marked as read. The remaining change needs checking. ' : 'The Outlook change needs checking. '}${error.message} This action will not be retried automatically.`);
      }
    }
    function sync(activityId, sender, nonce) {
      const task = queue.then(() => performSync(activityId, sender, nonce)).catch(error => recordResult('error', error.message));
      queue = task.catch(() => {});
      return task;
    }
    function allowedSettings(sender) {
      if (sender?.id !== browser.runtime.id) return false;
      try {const url = new URL(sender.url), expected = new URL(browser.runtime.getURL('settings.html')); return url.protocol === expected.protocol && url.host === expected.host && url.pathname === expected.pathname;} catch {return false;}
    }
    function allowedAccelo(sender) {
      if (sender?.id !== browser.runtime.id || !sender.tab || sender.frameId !== 0) return false;
      try {return new URL(sender.url).origin === 'https://digitalguppy.accelo.com';} catch {return false;}
    }
    async function handle(message, sender) {
      const type = message?.type;
      if (type === 'toolkit-outlook:sync' || type === 'toolkit-outlook:prepare') {
        if (!allowedAccelo(sender) || !/^[1-9]\d{0,11}$/.test(String(message.activityId || ''))) throw new Error('Outlook sync request was not allowed.');
        if (type === 'toolkit-outlook:prepare') return prepare(String(message.activityId), sender);
        if (typeof message.nonce !== 'string' || !/^[a-zA-Z0-9_-]{20,128}$/.test(message.nonce)) throw new Error('Outlook sync requires a prepared Accelo action.');
        return sync(String(message.activityId), sender, message.nonce);
      }
      if (!allowedSettings(sender)) throw new Error('Open Toolkit settings to manage the Outlook connection.');
      if (type === 'toolkit-outlook:status') return status();
      if (type === 'toolkit-outlook:connect') return connect();
      if (type === 'toolkit-outlook:disconnect') return disconnect();
      throw new Error('Unsupported Outlook request.');
    }
    return {handle, status, connect, disconnect, prepare, sync};
  }
  const api = {createService};
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.ToolkitOutlookBackground = api;
  if (root.chrome?.runtime?.onMessage && root.chrome?.storage?.session) {
    const service = createService({chrome: root.chrome});
    root.chrome.runtime.onMessage.addListener((message, sender, respond) => {
      if (!/^toolkit-outlook:/.test(message?.type || '')) return;
      service.handle(message, sender).then(respond, error => respond({ok: false, error: error.message}));
      return true;
    });
  }
})(globalThis);
