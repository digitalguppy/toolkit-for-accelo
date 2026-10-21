# Toolkit for Accelo

![Toolkit icon](extension/icons/icon-128.png)

An independent Chrome and Microsoft Edge extension made by Digital Guppy. Not affiliated with Accelo.

**v0.12.3 is a private preview for digitalguppy.accelo.com.** It is not a general multi-tenant release or a browser-store listing.

## Features

- Light, Dark and System appearance, with chart readability fixes.
- Checklist progress on supported project and milestone views: circle, bar or text, counts or percentages, and optional milestone totals. Completed checklists can show a blue tick, remain visible or hide.
- Interactive checklist items with the completing person's name.
- Markdown descriptions with Visual and Plain text editing, plus optional expanded descriptions at the top of tasks.
- Independent Inbox and Requests delete shortcuts with confirmation in the same button.
- Always-visible, aligned Start Timer buttons on supported weekly timesheet rows.
- Optional current and previous retainer-period usage, unapproved-time links and active/overdue task counts.
- Optional Outlook read/archive sync for the selected Inbox email's Action button. Off by default; Microsoft setup and live testing are still required.

Features are controlled independently in the settings sidebar. See [validation status](VALIDATION.md) and [Outlook setup](OUTLOOK-SETUP.md) for tested coverage and limitations.

## Install in Edge or Chrome

1. Download the versioned ZIP from [dist](dist) and extract it to a permanent folder.
2. Open edge://extensions or chrome://extensions and enable Developer mode.
3. Choose Load unpacked and select the extracted folder containing manifest.json.
4. Pin Toolkit in the browser toolbar, open its settings, and refresh Accelo.

The ZIP has manifest.json at its root. If installing from the repository instead, select the extension folder. Existing local testers should keep their installed folder in place and reload it; changing folders can change the extension ID and Outlook redirect URI.

## Develop and package

Use Node.js 22 or later and PowerShell on Windows for packaging.

    npm ci
    npm run build
    npm run check
    npm test
    npm run package

The package command creates an installable ZIP and SHA-256 file in dist. Tests run sequentially because the DOM suite includes short asynchronous UI timers. npm run build:icons rebuilds the PNG icons from the shared SVG source. Vendor scripts and styles are bundled locally; build patches deliberately fail if upstream dependency source no longer matches.

## Privacy and permissions

Toolkit has no telemetry or Toolkit-hosted data service. Preferences are stored locally. The current manifest is restricted to Digital Guppy's Accelo tenant. Dark mode reads public stylesheets from Accelo's approved asset hosts. All executable code is bundled in the extension.

Outlook sync requests optional Microsoft access only when connecting. It uses delegated Microsoft Graph access and browser-session tokens, with no client secret. It matches exact message identifiers and checks recipient identity; ambiguous matches are skipped. It does not send mail or sync Request deletion/closure, bulk actions, other devices or historical activity. See OUTLOOK-SETUP.md before enabling it.

## Repository contents

extension contains the installable extension and bundled third-party licence notices. src and scripts contain build inputs; tests contains synthetic regression fixtures. dist contains the current install package. Account screenshots, local research, detailed internal QA logs, dependencies and prior release folders are excluded.
