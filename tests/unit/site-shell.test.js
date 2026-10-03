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

test('portfolio links stay and open in a new tab', () => {
  const html = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
  const siteData = fs.readFileSync(path.join(repoRoot, 'content', 'site-data.js'), 'utf8');
  const dictionary = fs.readFileSync(path.join(repoRoot, 'scripts', 'core', 'i18n.js'), 'utf8');
  const taskbar = fs.readFileSync(path.join(repoRoot, 'scripts', 'features', 'desktop', 'taskbar.js'), 'utf8');
  const portfolioAnchors = html.match(/<a\b[^>]*href="https:\/\/miquelt9\.github\.io\/portfolio[^"]*"[^>]*>/g) || [];
  assert.ok(portfolioAnchors.length >= 2);
  for (const anchor of portfolioAnchors) {
    assert.match(anchor, /target="_blank"/);
    assert.match(anchor, /rel="noopener noreferrer"/);
  }
  assert.match(taskbar, /target="_blank"/);
  assert.match(taskbar, /rel="noopener noreferrer"/);
  assert.match(siteData, /href: "https:\/\/miquelt9\.github\.io\/portfolio\/"/);
  assert.match(siteData, /href: "https:\/\/miquelt9\.github\.io\/portfolio\/posts"/);
  assert.match(siteData, /posts: "https:\/\/miquelt9\.github\.io\/portfolio\/posts"/);
  assert.equal((html.match(/id="theme-toggle-mobile"/g) || []).length, 1);
  assert.equal(siteData.includes('https://github.com/miquelt9/otaniemitrackerbot'), true);
  assert.equal(siteData.includes('https://devpost.com/software/spaceshooter-5hi4of'), true);
  assert.equal(html.includes('./docs/Miquel_Torner_CV.pdf'), true);
  assert.equal(siteData.includes('/apps/spaceshooter/index.html'), true);
  assert.equal((siteData.match(/https:\/\/miquelt9\.github\.io\/bingo-musical\//g) || []).length, 1);
  assert.equal(siteData.includes('projectsDesktop'), false);
  assert.equal(siteData.includes('projectsMobile'), false);
  assert.equal((html.match(/id="projects-desktop-content"/g) || []).length, 1);
  assert.equal((html.match(/id="projects-mobile-content"/g) || []).length, 1);
  const notFound = fs.readFileSync(path.join(repoRoot, '404.html'), 'utf8');
  assert.match(notFound, /PROGRAMMER_NOT_FOUND/);
  assert.match(notFound, /https:\/\/miquelt9\.github\.io\/stopcode/);
  assert.match(notFound, /<a\b[^>]*href="\/"[^>]*>home<\/a>/);
  assert.match(notFound, /<button\b[^>]*>back home<\/button>/);
  assert.match(dictionary, /Hola, sóc en Miquel!/);
  assert.match(dictionary, /Mira més al meu/);
  assert.match(dictionary, /Mira el meu CV!/);
  assert.equal(dictionary.includes('englishOnly'), false);
});
