'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { PHONE_MAX_WIDTH_PX, nextTheme, shellForWidth } = require('../helpers/site-shell');

const repoRoot = path.join(__dirname, '..', '..');

test('shellForWidth treats the 768px breakpoint as the phone shell', () => {
  assert.equal(shellForWidth(0), 'phone');
  assert.equal(shellForWidth(390), 'phone');
  assert.equal(shellForWidth(PHONE_MAX_WIDTH_PX), 'phone');
  assert.equal(shellForWidth(PHONE_MAX_WIDTH_PX + 0.01), 'desktop');
  assert.equal(shellForWidth(769), 'desktop');
  assert.equal(shellForWidth(1280), 'desktop');
});

test('shellForWidth rejects widths that are not usable viewports', () => {
  assert.throws(() => shellForWidth(-1), RangeError);
  assert.throws(() => shellForWidth(Number.NaN), TypeError);
  assert.throws(() => shellForWidth(Number.POSITIVE_INFINITY), TypeError);
  assert.throws(() => shellForWidth('768'), TypeError);
  assert.throws(() => shellForWidth(undefined), TypeError);
});

test('nextTheme cycles light, dark, and system, then wraps', () => {
  assert.equal(nextTheme('light'), 'dark');
  assert.equal(nextTheme('dark'), 'system');
  assert.equal(nextTheme('system'), 'light');
});

test('nextTheme maps unknown values to light, matching theme.js toggle', () => {
  assert.equal(nextTheme('nope'), 'light');
  assert.equal(nextTheme(''), 'light');
  assert.equal(nextTheme(null), 'light');
  assert.equal(nextTheme(undefined), 'light');
});

test('rendered sources do not link at the missing portfolio site', () => {
  const html = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
  const siteData = fs.readFileSync(path.join(repoRoot, 'content', 'site-data.js'), 'utf8');
  assert.equal(html.includes('miquelt9.github.io/portfolio'), false);
  assert.equal(siteData.includes('miquelt9.github.io/portfolio'), false);
  assert.equal((html.match(/id="theme-toggle-mobile"/g) || []).length, 1);
  assert.equal(html.includes('https://github.com/miquelt9/otaniemitrackerbot'), true);
  assert.equal(html.includes('https://devpost.com/software/spaceshooter-5hi4of'), true);
  assert.equal(html.includes('./docs/Miquel_Torner_CV.pdf'), true);
  assert.equal(html.includes('/apps/spaceshooter/index.html'), true);
});
