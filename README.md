# Toolkit for Accelo

![Toolkit icon](extension/icons/icon-128.png)

An independent Chrome and Microsoft Edge extension made by Digital Guppy. Not affiliated with Accelo.

**v0.13.0 is a public preview for Accelo tenants at `https://<tenant>.accelo.com`.** It is not a browser-store listing. You may download and use the extension with your own Accelo account.

## Features

- Light, Dark and System appearance, with chart readability fixes.
- Checklist progress on supported project and milestone views: circle, bar or text, counts or percentages, and optional milestone totals. Completed checklists can show a blue tick, remain visible or hide.
- Interactive checklist items with the completing person's name.
- Markdown descriptions with Visual and Plain text editing, plus optional expanded descriptions at the top of tasks.
- Independent Inbox and Requests delete shortcuts with confirmation in the same button.
- Always-visible, aligned Start Timer buttons on supported weekly timesheet rows.
- Optional current and previous retainer-period usage, unapproved-time links and active/overdue task counts.

Features are controlled independently in the settings sidebar. See [validation status](VALIDATION.md) for tested coverage and limitations.

## Install in Edge or Chrome

1. Download the Toolkit ZIP from [GitHub Releases](https://github.com/digitalguppy/toolkit-for-accelo/releases) and extract it to a permanent folder.
2. Open edge://extensions or chrome://extensions and enable Developer mode.
3. Choose Load unpacked and select the extracted folder containing manifest.json.
4. Pin Toolkit in the browser toolbar, open its settings, and refresh Accelo.

The ZIP has manifest.json at its root. If installing from the repository instead, select the extension folder. Existing local testers should keep their installed folder in place and reload it; changing folders can change the extension ID.

## Compatibility

Live browser review has been performed on Digital Guppy's tenant. Automated fixtures cover a second tenant and cross-tenant rejection; a live second-tenant test is still pending. Accelo layouts, permissions and regional asset hosts may differ. Custom domains are not currently supported. Each feature can be disabled independently.

## Develop and package

Use Node.js 22 or later and PowerShell on Windows for packaging.

    npm ci
    npm run build
    npm run check
    npm test
    npm run package

The package command creates an installable ZIP and SHA-256 file in dist. Tests run sequentially because the DOM suite includes short asynchronous UI timers. npm run build:icons rebuilds the PNG icons from the shared SVG source. Vendor scripts and styles are bundled locally; build patches deliberately fail if upstream dependency source no longer matches.

## Privacy and permissions

Toolkit has no telemetry or Toolkit-hosted data service. Preferences are stored locally. Toolkit runs on HTTPS Accelo tenant subdomains and uses the account already signed in on that tenant. Requests and record links stay on the current tenant; no Digital Guppy account or API key is needed. Preferences apply across Accelo tenants in this browser. Dark mode reads public stylesheets from Accelo's approved asset hosts. All executable code is bundled in the extension.

Outlook integration is excluded from this release. There are no Microsoft sign-in controls, identity permissions or Graph permissions. Unfinished source is preserved under experimental/outlook, outside the installable extension.

## Repository contents

extension contains the installable extension and bundled third-party licence notices. src and scripts contain build inputs; tests contains synthetic regression fixtures. dist contains the current install package. Account screenshots, local research, detailed internal QA logs, dependencies and prior release folders are excluded.
