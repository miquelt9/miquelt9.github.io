This is my personal website.

Visual chrome comes from [@miquelt9/pc-ui](https://github.com/miquelt9/pc-ui). Refresh the vendored stylesheet with `scripts/sync-pc-ui.sh`.

## Tests

Smoke tests use Playwright against a local static server (repo root, same files GitHub Pages publishes).

```bash
npm ci
npx playwright install chromium
npm test
```

`npm run test:unit` covers viewport and theme-cycle helpers. `npm run test:smoke` loads `/` on desktop and phone viewports. GitHub Actions runs both on pull requests and on pushes to `main` (`.github/workflows/smoke.yml`). The Pages deploy workflow is separate.

As always WIP:
[] Add chat
