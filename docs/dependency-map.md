# Runtime Dependency Map

## Script Load Order
1. `content/site-data.js`
2. `scripts/core/utils.js`
3. `scripts/core/processRegistry.js`
4. `scripts/core/windowManager.js`
5. `scripts/features/terminal/contentData.js`
6. `js/script.js`
7. `js/goose_script.js`
8. `js/sl.js`
9. `js/terminal_script.js`
10. `js/draw.js`
11. `js/mouse_script.js`

## Key Couplings
- `js/script.js` depends on `window.AppUtils`, `window.ProcessRegistry`, `window.WindowManager`, and `window.SITE_DATA`.
- `js/terminal_script.js` depends on `window.ProcessRegistry`, `window.AppUtils`, `window.TerminalContentData`, `openWindow`, `hideWindow`, `showGoose`, and `ghostMouseMove`.
- Inline handlers in `index.html` call globals from `js/script.js`.
- `js/sl.js` provides train helpers used by `js/terminal_script.js`.

## Parallel Agent Boundaries
- Shared primitives live in `scripts/core/`; these are the main cross-cutting coordination points.
- Shared content lives in `content/site-data.js`; both page rendering and terminal content derive from it.
- Feature work can usually stay isolated in `scripts/features/terminal/`, `styles/`, `apps/`, or page rendering in `js/script.js`.

## Asset/App Paths
- Shared assets remain under `/images`, `/sounds`, and `/docs`.
- App entrypoints are normalized to `/apps/spaceshooter/index.html` and `/apps/snake/index.html`.
