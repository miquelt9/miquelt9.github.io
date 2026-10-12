# Working in miquelt9.github.io

Personal Windows 9x portfolio. Static GitHub Pages site. This file is how to change the repo. Install and tests stay in [README.md](../README.md).

## Scope

- Change the site shell, windows, and behavior in `index.html`, `scripts/`, `styles/`, and `js/`.
- Shared copy and links live in `content/` (`content/site-data.js`).
- Embedded apps live under `apps/`.
- Leave Win9x chrome to the vendored stylesheet `css/pc-ui.css`. Refresh it with `scripts/sync-pc-ui.sh`. Do not edit that file by hand, invent a second palette, or restyle the shell unless the task asks.
- Do not touch `404.html`. The stop-code page is an intentional easter egg.
- The site stays vanilla. There is no framework and no page build.

## Docs

| File | What it is |
| --- | --- |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Site shape and deploy |
| [DESIGN.md](./DESIGN.md) | Look intent |
| [testing.md](./testing.md) | What `npm test` and the Playwright smoke lock |
| [../README.md](../README.md) | What the site is, and how to run tests |
| [../docs/dependency-map.md](../docs/dependency-map.md) | Stylesheet and script load order |
| [../docs/agent-workstreams.md](../docs/agent-workstreams.md) | File ownership when several changes land together |

Link those files. Do not paste the feature list or the load-order tables into a new note.

## Changes

- Prefer feature-local edits in `scripts/features/` before touching `scripts/core/`.
- `content/site-data.js` is the source for shared site content (projects, terminal files, links).
- Inline handlers in `index.html` stay unless every caller moves together. The names are listed in the dependency map.
- New chrome colors and bevels belong in [@miquelt9/pc-ui](https://github.com/miquelt9/pc-ui), then sync. Site CSS may map existing classes onto those tokens (`styles/pc-ui-aliases.css`) and lay out the desktop and phone shells.

## Verify

`npm test` runs unit tests, then Playwright smoke against a local static server. CI (`.github/workflows/smoke.yml`) runs both on pull requests and on pushes to `main`. Details: [testing.md](./testing.md).
