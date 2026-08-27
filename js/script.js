document.addEventListener("DOMContentLoaded", function onReady() {
  if (window.WindowManager) {
    window.WindowManager.initialize();
  }
  setupCookiesBanner();
  registerStartMenuAutoClose();
  updateI18nUI();
  syncTerminalInput();
  setInterval(getCurrentTime, 1000);
});

window.addEventListener('localeChanged', updateI18nUI);
window.addEventListener('themeChanged', syncThemeUI);
