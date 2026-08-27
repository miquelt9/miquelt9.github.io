# Runtime Dependency Map

## Stylesheet Load Order
1. `css/pc-ui.css` (vendored from [miquelt9/pc-ui](https://github.com/miquelt9/pc-ui); refresh with `scripts/sync-pc-ui.sh`)
2. `styles/pc-ui-aliases.css` (maps `.mainbox` / `.topbar` / `.taskbar` onto pc-ui tokens)
3. `css/style.css` (layout, goose, cookie banner, desktop icons)
4. `styles/base.css`, `styles/windows.css`, `styles/terminal.css`, `styles/cookies.css`, `styles/mobile.css`, `styles/games.css`

## Script Load Order
1. `content/site-data.js`
2. `scripts/core/i18n.js`
3. `scripts/core/theme.js`
4. `scripts/core/utils.js`
5. `scripts/core/processRegistry.js`
6. `scripts/core/windowManager.js`
7. `scripts/features/terminal/contentData.js`
8. `scripts/features/terminal/snakeGame.js`
9. `scripts/features/desktop/background.js`
10. `scripts/features/desktop/windows.js`
11. `scripts/features/desktop/start-menu.js`
12. `scripts/features/desktop/taskbar.js`
13. `scripts/features/phone/phone.js`
14. `scripts/features/cookies/game.js`
15. `scripts/features/cookies/banner.js`
16. `scripts/features/easter-eggs/rickroll.js`
17. `js/script.js` (boot: WindowManager, cookies banner, start menu, i18n, terminal input, clock)
18. `js/goose_script.js`
19. `js/sl.js`
20. `js/terminal_script.js`
21. `js/mouse_script.js`

## Key Couplings
- Feature scripts expose `window.*` globals used by inline handlers in `index.html` (`openWindow`, `showWindow`, `hideWindow`, `closeWindow`, `minimise`, `maximise`, `toggle`, `startMenu`, `nevergonna`, `changeBackgroundColor`, `openPhoneApp`, `closePhoneApp`).
- `js/script.js` only boots: `WindowManager.initialize`, `setupCookiesBanner`, `registerStartMenuAutoClose`, `updateI18nUI`, `syncTerminalInput`, clock interval, and locale/theme listeners.
- Desktop windows depend on `window.AppUtils`, `window.ProcessRegistry`, and `window.WindowManager`.
- Taskbar i18n rendering depends on `window.SITE_DATA`, `window.i18n`, and `window.pcTheme`.
- Cookie banner depends on `startCookieGame` from `scripts/features/cookies/game.js`.
- `js/terminal_script.js` depends on `window.ProcessRegistry`, `window.AppUtils`, `window.TerminalContentData`, `openWindow`, `hideWindow`, `showGoose`, and `ghostMouseMove`.
- `js/sl.js` provides train helpers used by `js/terminal_script.js`.

## Parallel Agent Boundaries
- Shared primitives live in `scripts/core/`; these are the main cross-cutting coordination points.
- Shared content lives in `content/site-data.js`; both page rendering and terminal content derive from it.
- Feature work can stay isolated in `scripts/features/desktop/`, `scripts/features/phone/`, `scripts/features/cookies/`, `scripts/features/easter-eggs/`, `scripts/features/terminal/`, `styles/`, or `apps/`.

## Asset/App Paths
- Shared assets remain under `/images`, `/sounds`, and `/docs`.
- App entrypoints are normalized to `/apps/spaceshooter/index.html` and `/apps/snake/index.html`.
