(function initI18n(globalScope) {
  const LOCALES = {
    EN: 'en',
    CA: 'ca'
  };

  const STORAGE_KEY = 'site_locale';
  const DEFAULT_LOCALE = LOCALES.EN;
  const SUPPORTED_LOCALES = Object.values(LOCALES);

  function readStoredLocale() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  const storedLocale = readStoredLocale();
  let currentLocale = SUPPORTED_LOCALES.includes(storedLocale) ? storedLocale : DEFAULT_LOCALE;

  const DICTIONARY = {
    [LOCALES.EN]: {
      taskbar: {
        start: 'Start',
        properties: 'Properties',
        projects: 'Projects',
        contact: 'Contact',
        terminal: 'Terminal',
        spaceshooter: 'SpaceShooter',
        snake: 'Snake 🐍',
        cv: 'CV 📄'
      },
      desktop: {
        about: 'About me',
        projects: 'Projects',
        contact: 'Contact',
        terminal: 'Terminal'
      },
      windows: {
        about: 'System Properties',
        projects: 'Projects',
        contact: 'Contact',
        terminal: 'Terminal',
        spaceshooter: 'SpaceShooter',
        snake: 'Snake',
        cv: 'Curriculum Vitae'
      },
      startMenu: {
        niceDay: 'Have a nice day!',
        comingSoon: 'Something coming soon...'
      },
      goose: {
        notepad: 'Goose "Not-epad"',
        closeNote: 'Close goose note',
        important: 'Absolutely Important',
        closeImage: 'Close goose image',
        taunts: [
          "i cause problems on purpose",
          "busy busy busy",
          "a very important goose memo",
          "productivity? never heard of it"
        ]
      },
      error404: {
        title: 'Miquel\'s PC - Error',
        problem: 'This device run into a problem.',
        programmer: 'Looks like the programmer who made this website didn\'t know what was doing.',
        loseInfo: 'You will lose any unsaved information in all open applications.',
        collecting: 'We are collecting some error info, and then we\'ll restart for you.',
        moreInfo: 'For more info about this issue and possible fixes, visit',
        support: 'If you call a support person give them this info:',
        failed: 'What failed: Everything.sys',
        stopCode: 'Stop code: PROGRAMMER_NOT_FOUND'
      },
      redirects: {
        spaceshooter: 'Redirecting to SpaceShooter...'
      }
    },
    [LOCALES.CA]: {
      taskbar: {
        start: 'Inici',
        properties: 'Propietats',
        projects: 'Projectes',
        contact: 'Contacte',
        terminal: 'Terminal',
        spaceshooter: 'SpaceShooter',
        snake: 'Snake 🐍',
        cv: 'CV 📄'
      },
      desktop: {
        about: 'Sobre mi',
        projects: 'Projectes',
        contact: 'Contacte',
        terminal: 'Terminal'
      },
      windows: {
        about: 'Propietats del Sistema',
        projects: 'Projectes',
        contact: 'Contacte',
        terminal: 'Terminal',
        spaceshooter: 'SpaceShooter',
        snake: 'Snake',
        cv: 'Currículum Vitae'
      },
      startMenu: {
        niceDay: 'Que tinguis un bon dia!',
        comingSoon: 'Properament...'
      },
      goose: {
        notepad: 'Oca "Not-epad"',
        closeNote: 'Tanca la nota de l\'oca',
        important: 'Absolutament Important',
        closeImage: 'Tanca la imatge de l\'oca',
        taunts: [
          "causo problemes a propòsit",
          "feina feina feina",
          "una nota molt important de l'oca",
          "productivitat? mai n'he sentit a parlar"
        ]
      },
      error404: {
        title: 'PC d\'en Miquel - Error',
        problem: 'Aquest dispositiu ha tingut un problema.',
        programmer: 'Sembla que el programador que ha fet aquest web no sabia què feia.',
        loseInfo: 'Perdràs qualsevol informació no desada en totes les aplicacions obertes.',
        collecting: 'Estem recollint informació de l\'error i després reiniciarem per tu.',
        moreInfo: 'Per a més informació sobre aquest problema i possibles solucions, visita',
        support: 'Si truques a una persona de suport, dona-li aquesta informació:',
        failed: 'Què ha fallat: Everything.sys',
        stopCode: 'Codi d\'aturada: PROGRAMMER_NOT_FOUND'
      },
      redirects: {
        spaceshooter: 'Redirigint a SpaceShooter...'
      }
    }
  };

  function getLocale() {
    return currentLocale;
  }

  function setLocale(locale) {
    if (SUPPORTED_LOCALES.includes(locale)) {
      currentLocale = locale;
      try {
        localStorage.setItem(STORAGE_KEY, locale);
      } catch (e) {}
      document.documentElement.lang = locale;
      // Dispatch event for UI updates
      window.dispatchEvent(new CustomEvent('localeChanged', { detail: { locale } }));
    }
  }

  function t(path) {
    const keys = path.split('.');
    let result = DICTIONARY[currentLocale];
    for (const key of keys) {
      if (result && result.hasOwnProperty(key)) {
        result = result[key];
      } else {
        return path; // Fallback to path if not found
      }
    }
    return result;
  }

  function toggleLocale() {
    const nextLocale = currentLocale === LOCALES.EN ? LOCALES.CA : LOCALES.EN;
    setLocale(nextLocale);
  }

  // Initialize document lang
  document.documentElement.lang = currentLocale;

  globalScope.i18n = {
    LOCALES,
    getLocale,
    setLocale,
    toggleLocale,
    t
  };
})(window);
