(function initTheme(globalScope) {
  const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system'
  };

  const STORAGE_KEY = 'pc-theme';
  const DEFAULT_THEME = THEMES.LIGHT;
  const SUPPORTED_THEMES = Object.values(THEMES);
  const CYCLE = [THEMES.LIGHT, THEMES.DARK, THEMES.SYSTEM];

  function readStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  const storedTheme = readStoredTheme();
  const phoneUsesSystemTheme = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
  let currentTheme = phoneUsesSystemTheme
    ? THEMES.SYSTEM
    : (SUPPORTED_THEMES.includes(storedTheme) ? storedTheme : DEFAULT_THEME);

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-pc-theme', theme);
  }

  function getTheme() {
    return currentTheme;
  }

  function setTheme(theme) {
    if (!SUPPORTED_THEMES.includes(theme)) {
      return;
    }
    currentTheme = theme;
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}
    globalScope.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  }

  function toggleTheme() {
    const index = CYCLE.indexOf(currentTheme);
    const next = CYCLE[(index + 1) % CYCLE.length];
    setTheme(next);
  }

  applyTheme(currentTheme);

  globalScope.pcTheme = {
    THEMES,
    getTheme,
    setTheme,
    toggleTheme
  };
})(window);
