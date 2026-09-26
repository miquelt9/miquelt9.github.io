'use strict';

/**
 * Pure helpers shared by smoke tests and unit tests.
 * Keep these aligned with scripts/core/theme.js (CYCLE) and the
 * `(max-width: 768px)` phone breakpoint in styles/mobile.css and theme.js.
 */
const PHONE_MAX_WIDTH_PX = 768;
const THEME_CYCLE = ['light', 'dark', 'system'];

function shellForWidth(width) {
  if (typeof width !== 'number' || !Number.isFinite(width)) {
    throw new TypeError('viewport width must be a finite number');
  }
  if (width < 0) {
    throw new RangeError('viewport width must be >= 0');
  }
  return width <= PHONE_MAX_WIDTH_PX ? 'phone' : 'desktop';
}

/**
 * Next theme in the desktop cycle. Unknown values resolve to "light",
 * matching toggleTheme() when CYCLE.indexOf(current) is -1.
 */
function nextTheme(current) {
  const index = THEME_CYCLE.indexOf(current);
  return THEME_CYCLE[(index + 1) % THEME_CYCLE.length];
}

module.exports = {
  PHONE_MAX_WIDTH_PX,
  THEME_CYCLE,
  shellForWidth,
  nextTheme,
};
