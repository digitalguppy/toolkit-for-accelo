(function (root) {
  'use strict';
  const MODES = Object.freeze(['none', 'read', 'archive', 'read_archive']);
  const ORIGINS = Object.freeze(['https://graph.microsoft.com/*', 'https://login.microsoftonline.com/*', 'https://digitalguppy.accelo.com/*']);
  const SCOPES = 'https://graph.microsoft.com/User.Read https://graph.microsoft.com/Mail.ReadWrite offline_access';
  const email = value => typeof value === 'string' ? value.trim().toLowerCase() : '';
  function config(settings = {}) {
    const clientId = typeof settings.outlookClientId === 'string' ? settings.outlookClientId.trim() : '';
    const tenant = typeof settings.outlookTenant === 'string' ? settings.outlookTenant.trim().toLowerCase() : 'organizations';
    if (!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(clientId)) throw new Error('Enter the Microsoft application (client) ID in Outlook setup.');
    if (!/^(?:organizations|[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}|[a-z0-9](?:[a-z0-9.-]{0,251}[a-z0-9])?\.[a-z]{2,})$/i.test(tenant)) throw new Error('Enter a valid Microsoft tenant ID or domain.');
    return {clientId, tenant, mode: MODES.includes(settings.outlookSyncMode) ? settings.outlookSyncMode : 'none'};
  }
  function validMessageId(value) {
    return typeof value === 'string' && value.length <= 998 && /^<[^<>\s\x00-\x1f\x7f]+@[^<>\s\x00-\x1f\x7f]+>$/.test(value);
  }
  function verifiedAction(record, activityId, accountEmail, now) {
    const seconds = Number(record?.dateActioned);
    if (!record || String(record.activityId) !== String(activityId) || !/^[1-9]\d{0,11}$/.test(String(activityId)) ||
        record.medium !== 'email' || record.incoming !== true || !validMessageId(record.messageId) ||
        email(record.recipientEmail) !== email(accountEmail) || !email(accountEmail) || !Number.isFinite(seconds) ||
        seconds <= 0 || seconds * 1000 < now - 300000 || seconds * 1000 > now + 30000) {
      throw new Error('The recent Accelo action could not be verified for this mailbox. Outlook was not changed.');
    }
    return {...record, activityId: String(activityId), dateActioned: seconds};
  }
  function matchMessage(result, messageId, accountEmail) {
    if (!Array.isArray(result?.value) || result['@odata.nextLink'] || result.value.length !== 1) {
      throw new Error(result?.value?.length === 0 ? 'No exact Outlook match was found. Outlook was not changed.' : 'The Outlook match was ambiguous. Outlook was not changed.');
    }
    const message = result.value[0];
    const recipients = ['toRecipients', 'ccRecipients', 'bccRecipients'].flatMap(key => Array.isArray(message?.[key]) ? message[key] : []);
    if (!message || message.internetMessageId !== messageId || typeof message.id !== 'string' || !message.id ||
        message.id.length > 4096 || typeof message.parentFolderId !== 'string' || !message.parentFolderId || typeof message.isRead !== 'boolean' ||
        !CANDIDATE_EMAIL.test(email(message.from?.emailAddress?.address)) ||
        email(message.from?.emailAddress?.address) === email(accountEmail) ||
        !recipients.some(recipient => email(recipient?.emailAddress?.address) === email(accountEmail))) {
      throw new Error('The Outlook message identity or recipient did not match. Outlook was not changed.');
    }
    return message;
  }
  const CANDIDATE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function plan(mode, message, folders = {}) {
    if (!MODES.includes(mode) || mode === 'none') return [];
    const steps = [];
    if ((mode === 'read' || mode === 'read_archive') && !message.isRead) steps.push('read');
    if (mode === 'archive' || mode === 'read_archive') {
      if (!folders.inbox || !folders.archive) throw new Error('The Outlook Inbox and Archive folders could not be verified.');
      if (message.parentFolderId !== folders.inbox && message.parentFolderId !== folders.archive) {
        throw new Error('This message is already filed outside Inbox. Outlook was not changed.');
      }
      if (message.parentFolderId === folders.inbox) steps.push('archive');
    }
    return steps;
  }
  function hasScopes(scope) {
    const scopes = String(scope || '').toLowerCase().split(/\s+/).map(value => value.replace('https://graph.microsoft.com/', ''));
    return scopes.includes('mail.readwrite') && scopes.includes('user.read');
  }
  function oauthResponse(raw, redirectUrl, state) {
    let actual, expected;
    try {actual = new URL(raw); expected = new URL(redirectUrl);} catch {throw new Error('Microsoft sign-in returned an invalid address.');}
    if (actual.origin !== expected.origin || actual.pathname !== expected.pathname || actual.hash ||
        actual.searchParams.getAll('state').length !== 1 || actual.searchParams.get('state') !== state) {
      throw new Error('Microsoft sign-in could not be verified. Please connect again.');
    }
    if (actual.searchParams.has('error')) throw new Error('Microsoft sign-in was cancelled or permission was not granted.');
    if (actual.searchParams.getAll('code').length !== 1 || !actual.searchParams.get('code')) throw new Error('Microsoft did not return a sign-in code.');
    return actual.searchParams.get('code');
  }
  const api = {MODES, ORIGINS, SCOPES, email, config, validMessageId, verifiedAction, matchMessage, plan, hasScopes, oauthResponse};
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.ToolkitOutlookCore = api;
})(globalThis);
