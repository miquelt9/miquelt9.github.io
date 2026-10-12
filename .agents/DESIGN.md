# Design

Windows 9x chrome comes from the vendored `css/pc-ui.css`: squared corners, beveled edges, flat system colors, Source Code Pro. This site does not own that look. Do not add rounded glass, gradients, or a second palette.

## Tokens

Paint the page with pc-ui's `--pc-*` properties. The page background is `--pc-desktop-bg` (`styles/base.css`, `styles/mobile.css`, `styles/pc-ui-aliases.css`, `css/style.css`). Do not hard-code a desktop color next to that token.

The stored theme is `light`, `dark`, or `system` (`pc-theme` in `localStorage`). On desktop, a missing or unknown value is `light`. At 768px and below the phone shell uses `system` even when a theme is stored. `scripts/core/theme.js` and the inline script in `index.html` set `data-pc-theme` on `<html>`.

## Shell

Keep the existing desktop (icons, windows, taskbar, start menu) and the phone home screen. Both use the same bevel and button language. A visual redesign (palette, corner radius, density, or a different chrome metaphor) is out of scope unless Product asks.

`404.html` is a custom stop-code page (`PROGRAMMER_NOT_FOUND`). Leave it as-is. It is an easter egg, not a layout bug.
