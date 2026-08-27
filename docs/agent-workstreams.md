# Parallel Workstreams

This repo is now organized so multiple agents can work mostly independently by area.

## Recommended ownership split

- `content/` and desktop/mobile text rendering
  - Files: `content/site-data.js`, `index.html`, `scripts/features/desktop/taskbar.js`
  - Scope: personal content, rendered sections, desktop/mobile copy

- `scripts/core/`
  - Files: `scripts/core/utils.js`, `scripts/core/processRegistry.js`, `scripts/core/windowManager.js`, `scripts/core/i18n.js`, `scripts/core/theme.js`
  - Scope: shared primitives only
  - Rule: changes here should be coordinated because many features depend on them

- `scripts/features/desktop/`
  - Files: `scripts/features/desktop/windows.js`, `scripts/features/desktop/start-menu.js`, `scripts/features/desktop/taskbar.js`, `scripts/features/desktop/background.js`
  - Scope: window chrome, start menu, clock/lang/theme labels, desktop background color

- `scripts/features/phone/`
  - Files: `scripts/features/phone/phone.js`
  - Scope: phone viewport apps

- `scripts/features/cookies/`
  - Files: `scripts/features/cookies/banner.js`, `scripts/features/cookies/game.js`, `styles/cookies.css`
  - Scope: cookie notice and cookie-catch minigame

- `scripts/features/easter-eggs/`
  - Files: `scripts/features/easter-eggs/rickroll.js`
  - Scope: start-menu rickroll

- `js/script.js`
  - Scope: boot only (`WindowManager.initialize`, cookies banner, start menu auto-close, i18n, terminal input, clock)

- `scripts/features/terminal/` and terminal runtime
  - Files: `scripts/features/terminal/contentData.js`, `scripts/features/terminal/snakeGame.js`, `js/terminal_script.js`, `js/sl.js`
  - Scope: terminal commands, terminal data adapters, terminal-only UX

- `styles/`
  - Files: `styles/base.css`, `styles/windows.css`, `styles/terminal.css`, `styles/cookies.css`, `styles/mobile.css`, `styles/games.css`, `styles/pc-ui-aliases.css`
  - Scope: concern-based styling and pc-ui class aliases
  - Vendored design system: `css/pc-ui.css` (do not edit by hand; run `scripts/sync-pc-ui.sh`)

- `apps/`
  - Files: `apps/spaceshooter/index.html`, `apps/snake/index.html`
  - Scope: embedded app entrypoints and app shell wiring

- deploy/docs
  - Files: `.github/workflows/static.yml`, `docs/*.md`
  - Scope: deployment and architecture documentation

## Coordination rules

- Prefer feature-local changes before touching `scripts/core/`.
- Treat `content/site-data.js` as the single source of truth for shared site content.
- Keep inline handler compatibility in `index.html` unless all callers are migrated together.
- When changing app paths, update both `scripts/features/desktop/windows.js` and deploy packaging.
