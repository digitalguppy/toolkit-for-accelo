# Connect Outlook to Toolkit for Accelo

Archived development notes. Outlook is excluded from v0.12.3, so the controls described below are not available in the packaged extension. These instructions are retained for future development only.

Version 0.12.0 is built and locally tested. Its read-only matching test passed, but Microsoft sign-in and actual email updates still need a connected test. Keep **Do not update Outlook** selected until setup is complete.

## One-time Microsoft setup

1. Reload Toolkit in `edge://extensions` or `chrome://extensions`, then open Toolkit > Inbox & Requests > Outlook sync > Microsoft app setup. Copy the exact **Redirect URI** shown there. Keep the installed folder in place so the extension ID stays stable.
2. In Microsoft Entra admin centre > App registrations, register **Toolkit for Accelo** for your organisation only. Creating this registration and granting consent are administrator/user actions, not something Toolkit performs silently.
3. Under Authentication, add a **Single-page application (SPA)** platform with the exact copied redirect URI. It looks like `https://<your-extension-id>.chromiumapp.org/outlook`. Do not enable implicit grants or create a client secret. Toolkit uses the authorization-code flow with PKCE.
4. Add Microsoft Graph **delegated** permissions `User.Read` and `Mail.ReadWrite`. Toolkit also requests `offline_access` to refresh the connection during this browser session. `Mail.ReadWrite` allows read-state changes and moving mail; the feature does not send or delete mail. Your organisation may require admin consent.
5. Copy the Application (client) ID and Directory (tenant) ID into Toolkit's Microsoft app setup fields. These are identifiers, not passwords. Click **Connect Microsoft** and review the browser permission request and Microsoft consent screen. Sign in as the same mailbox used for your Accelo Inbox.
6. Confirm Toolkit shows the expected mailbox. Choose one of the four options. Refresh your Accelo Inbox after updating the extension. A status beneath the selected email's toolbar shows when it is ready.

The SPA registration follows Microsoft's browser PKCE guidance. The exact Entra redirect/token exchange has not yet been exercised with a real Toolkit app registration. If sign-in fails, leave sync off and capture the displayed error; do not add a client secret or broaden permissions to work around it.

## First controlled test

Use a clearly labelled disposable email addressed to your connected mailbox that is still unactioned in Accelo. Confirm its current Outlook read/folder state. Select **Mark as read**, wait for Toolkit's readiness label, and click the selected email's native **Action**. Confirm the email is actioned in Accelo, read in Outlook, and Toolkit reports a checked result. Repeat archive modes only with further explicitly approved test emails. Toolkit itself does not change an email merely to test the connection.

Selecting **Do not update Outlook** stops further changes. Disconnect clears the local Microsoft connection. Closing the browser or reloading Toolkit clears session tokens and requires reconnecting; your four-option preference remains saved. A pending operation may already have completed one step before you switch it off. Its result explains any remaining uncertainty.

## Coverage and matching

- Manual Action on the selected incoming email in Accelo's Inbox only. This first version excludes Action All, bulk actions, automatic Reply actions, Request Close/Delete, shared mailboxes and actions on other devices.
- Exact Internet Message-ID plus recipient checks. Missing, ambiguous, outgoing or mismatched messages are skipped. Matching never falls back to subject text.
- Archive moves Inbox mail into the normal Archive folder. It does not use the Online Archive mailbox or move mail out of custom folders.
- Nothing catches up retrospectively. Failed or uncertain changes are not retried automatically. Check the last result in Toolkit settings and the actual email state before any manual correction.
- No mail-body copying, background mail polling, send permission, server subscription, subscription cost or Toolkit-hosted service is involved.

## References

- [Microsoft authorization-code flow and PKCE](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow)
- [Chrome identity API](https://developer.chrome.com/docs/extensions/reference/api/identity)
- [Chrome service worker lifecycle](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle)
- [Update message read state](https://learn.microsoft.com/en-us/graph/api/message-update)
- [Move a message](https://learn.microsoft.com/en-us/graph/api/message-move)
- [Immutable Outlook IDs](https://learn.microsoft.com/en-us/graph/outlook-immutable-id)
