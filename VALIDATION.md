# Validation and release status

This is a private preview release for Digital Guppy's Accelo tenant. It has not been submitted to the Chrome or Edge extension stores.

## Checked

- v0.12.3 builds and passes all 134 automated tests. Release checks confirm Outlook files and Microsoft permissions are absent, and settings still save with preferences from older versions.

- Manifest V3 assets, locally bundled dependencies and permission boundaries are covered by the automated package tests.
- Light, Dark and System preferences, forced colours and print restoration are covered by theme tests.
- Settings were visually checked in Light and Dark, including a 390px narrow layout with no horizontal overflow.
- Representative Edge dark-mode review covered activity and project dashboards, weekly timesheets, task and ticket details, Inbox, Requests, project overview, project/retainer lists, expanded navigation and the empty timer panel.
- Chart background, axis label, plot-band and search-placeholder fixes were verified with temporary live CSS previews.

## Still pending

- The latest installed extension needs an Edge reload and fresh visual verification. Previous chart previews do not prove the reloaded package is active.
- The controlled chart fixture's Light/Dark switching check was interrupted by an open browser extension popup.
- Outlook is excluded from this release. Its archived development source is not installed or executed. Microsoft sign-in and mail writes remain unverified.
- Chrome and store-install behaviour have not been exercised. The page review is representative, not exhaustive coverage of every report, form or email template.

No production records were modified during the appearance review. Local research, account screenshots and detailed internal QA logs are excluded from the repository and distributable.
