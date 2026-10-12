# Tests

`npm test` runs `npm run test:unit` and then `npm run test:smoke`.

Unit tests (`node --test tests/unit/*.test.js`) lock the 768px phone/desktop breakpoint, the light → dark → system theme cycle, and a few source invariants (portfolio links, the shared projects list, the 404 stop code).

Playwright smoke (`npm run test:smoke`) serves the repo root and loads `/` on desktop (1280px and 769px) and phone (390px and 768px) viewports. It checks the matching shell, About, the theme toggle, keyboard Start, portfolio links, and the Bingo Musical icon opening in a new tab. It does not drive the terminal, goose, or embedded games.

GitHub Actions workflow `.github/workflows/smoke.yml` runs the unit tests and that smoke on pull requests and on pushes to `main`, on Node 22.

A separate workflow, `.github/workflows/mobile-start-menu.yml`, runs `tests/smoke/mobile-start-menu.spec.js`. It is not part of `npm test`.
