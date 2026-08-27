(function initTaskbar(globalScope) {
  function getCurrentTime() {
    var now = new Date();
    var time = now.getHours() + ":" + now.getMinutes().toString().padStart(2, 0);
    document.getElementById('clock').innerHTML = time;
    var phoneClock = document.getElementById('phone-clock');
    if (phoneClock) phoneClock.textContent = time;
  }

  function renderSiteContent() {
    if (!window.SITE_DATA || !window.i18n) {
      return;
    }

    const locale = window.i18n.getLocale();
    const content = window.SITE_DATA.content[locale];

    if (!content) return;

    var aboutDesktop = document.getElementById("about-desktop-content");
    var aboutMobile = document.getElementById("about-mobile-content");
    var projectsDesktop = document.getElementById("projects-desktop-content");
    var projectsMobile = document.getElementById("projects-mobile-content");
    var contactDesktop = document.getElementById("contact-desktop-content");
    var contactMobile = document.getElementById("contact-mobile-content");

    if (aboutDesktop) {
      aboutDesktop.innerHTML = content.aboutDesktop;
    }
    if (aboutMobile) {
      aboutMobile.innerHTML = content.aboutMobile;
    }
    if (projectsDesktop) {
      projectsDesktop.innerHTML = content.projectsDesktop;
    }
    if (projectsMobile) {
      projectsMobile.innerHTML = content.projectsMobile;
    }
    if (contactDesktop) {
      contactDesktop.innerHTML = content.contactDesktop;
    }
    if (contactMobile) {
      contactMobile.innerHTML = content.contactMobile;
    }
  }

  function themeLabelKey(theme, compact) {
    var prefix = compact ? 'taskbar.' : 'startMenu.';
    if (theme === 'dark') {
      return prefix + 'themeDark';
    }
    if (theme === 'system') {
      return prefix + 'themeSystem';
    }
    return prefix + 'themeLight';
  }

  function syncThemeUI() {
    if (!window.pcTheme || !window.i18n) {
      return;
    }

    var theme = window.pcTheme.getTheme();
    var compactLabel = window.i18n.t(themeLabelKey(theme, true));
    var fullLabel = window.i18n.t(themeLabelKey(theme, false));
    var tray = document.getElementById('theme-toggle');
    var startLabel = document.getElementById('startmenu-theme-label');
    var mobile = document.getElementById('theme-toggle-mobile');

    if (tray) {
      tray.textContent = compactLabel;
      tray.setAttribute('aria-label', fullLabel);
    }
    if (startLabel) {
      startLabel.textContent = fullLabel;
    }
    if (mobile) {
      mobile.textContent = fullLabel;
    }
  }

  function updateI18nUI() {
    if (!window.i18n) return;

    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = window.i18n.t(key);

      const img = el.querySelector('img');
      if (img) {
        el.innerHTML = '';
        el.appendChild(img);
        el.appendChild(document.createTextNode(' ' + translation));
      } else {
        el.textContent = translation;
      }
    });

    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
      langToggle.textContent = window.i18n.getLocale().toUpperCase();
    }
    const phoneLangToggle = document.getElementById('phone-lang-toggle');
    if (phoneLangToggle) {
      phoneLangToggle.textContent = window.i18n.getLocale().toUpperCase();
    }

    renderSiteContent();
    syncThemeUI();
  }

  globalScope.getCurrentTime = getCurrentTime;
  globalScope.renderSiteContent = renderSiteContent;
  globalScope.themeLabelKey = themeLabelKey;
  globalScope.syncThemeUI = syncThemeUI;
  globalScope.updateI18nUI = updateI18nUI;
})(window);
