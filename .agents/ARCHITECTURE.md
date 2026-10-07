# Architecture

miquelt9.github.io is a static site. GitHub Pages publishes the repo files. There is no app server and no page build.

## Site

| Piece | Where | Role |
| --- | --- | --- |
| Page | `index.html` | Desktop shell and phone shell in one document. |
| Chrome | `css/pc-ui.css` | Vendored [@miquelt9/pc-ui](https://github.com/miquelt9/pc-ui) stylesheet. Refresh with `scripts/sync-pc-ui.sh`. |
| Site CSS | `styles/`, `css/style.css` | Aliases, layout, windows, terminal, cookies, phone, games. |
| Behavior | `scripts/` | Core primitives and features (desktop, phone, terminal, cookies, easter eggs). `js/script.js` boots the page. |
| Content | `content/site-data.js` | Shared projects, links, and terminal files. |
| Apps | `apps/` | Snake and Space Shooter entry pages. |

Stylesheet and script order, and which globals the inline handlers use: [docs/dependency-map.md](../docs/dependency-map.md). Area ownership: [docs/agent-workstreams.md](../docs/agent-workstreams.md).

The phone shell is the same page at `max-width: 768px` (`#phone-os`). Wider viewports show `.desktop_device`.

## Tests and deploy

Playwright smoke lives in `tests/smoke/` and serves the repo root with Python's static server (`playwright.config.js`). Unit tests are `node --test` in `tests/unit/`. Workflow: `.github/workflows/smoke.yml`.

Pages deploy is `.github/workflows/static.yml`. It copies `index.html`, `404.html`, the CV, and `css/`, `js/`, `images/`, `sounds/`, `static/`, `apps/`, `content/`, `scripts/`, and `styles/` into `_site` and deploys that. It runs on pushes to `main`, not on pull requests.
