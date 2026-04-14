# Parallel Workstreams

This repo is now organized so multiple agents can work mostly independently by area.

## Recommended ownership split

- `content/` and desktop/mobile text rendering
  - Files: `content/site-data.js`, `index.html`, `js/script.js`
  - Scope: personal content, rendered sections, desktop/mobile copy

- `scripts/core/`
  - Files: `scripts/core/utils.js`, `scripts/core/processRegistry.js`, `scripts/core/windowManager.js`
  - Scope: shared primitives only
  - Rule: changes here should be coordinated because many features depend on them

- `scripts/features/terminal/` and terminal runtime
  - Files: `scripts/features/terminal/contentData.js`, `js/terminal_script.js`, `js/sl.js`
  - Scope: terminal commands, terminal data adapters, terminal-only UX

- `styles/`
  - Files: `styles/base.css`, `styles/windows.css`, `styles/terminal.css`, `styles/mobile.css`, `styles/games.css`
  - Scope: concern-based styling

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
- When changing app paths, update both `js/script.js` and deploy packaging.
