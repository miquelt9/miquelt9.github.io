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
        cv: 'CV 📄',
        themeLight: 'Day',
        themeDark: 'Night',
        themeSystem: 'Auto'
      },
      desktop: {
        about: 'About me',
        projects: 'Projects',
        contact: 'Contact',
        terminal: 'Terminal',
        bingo: 'Bingo Musical'
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
        comingSoon: 'Something coming soon...',
        themeLight: 'Display: Day',
        themeDark: 'Display: Night',
        themeSystem: 'Display: System'
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
      },
      content: {
        aboutDesktop:
          '<div class="properties"><img src="images/meOnPC.png"><div class="txt">System: <br>&nbsp; Miquel Torner Viñals <br><br>Registered to: <br>&nbsp; Barcelona School of Informatics, Polytechnic University of Catalonia <br>&nbsp; Bachelor\'s degree in Informatics Engineering (major in computing)<br><br>Hi, I\'m Miquel! I love programming, cooking, hiking and traveling. <br>Thanks for checking out my website :)</div></div>',
        aboutMobile:
          '<div class="properties" style="padding: 10px; text-align: justify;">System: <br>&nbsp; Miquel Torner Viñals <br>&nbsp;<br>Registered to: <br>&nbsp; · FIB, Polytechnic University of Catalonia <br>&nbsp; · Bachelor\'s degree in Informatics Engineering (major in computing)<br><br>&nbsp;<br>Hi, I\'m Miquel! I love programming, cooking, hiking and traveling. <br>Thanks for checking out my website! <br>&nbsp;<br>(Use a desktop/laptop for the full interactive experience)</div>',
        contactDesktop:
          '<a class="clickable" href="mailto:miqueltorner9@gmail.com"> miqueltorner9@gmail.com </a> <br><a class="clickable" href="https://www.linkedin.com/in/miqueltv/"> LinkedIn </a> <br><a class="clickable" href="https://github.com/miquelt9"> GitHub </a> <br><a class="clickable" href="https://miquelt9.github.io/portfolio" target="_blank" rel="noopener noreferrer"> Portfolio </a> <br><a class="windowslink clickable" onclick="showWindow(\'cvbox\')" style="padding-left: 0%;">Check my CV!</a>',
        contactMobile:
          '<a href="mailto:miqueltorner9@gmail.com"> miqueltorner9@gmail.com </a> <br><a href="https://www.linkedin.com/in/miqueltv/"> LinkedIn </a> <br><a href="https://github.com/miquelt9"> GitHub </a> <br><a class="clickable" href="https://miquelt9.github.io/portfolio" target="_blank" rel="noopener noreferrer"> Portfolio </a> <br><a href="./docs/Miquel_Torner_CV.pdf" target="_blank" rel="noopener noreferrer">Check my CV!</a>',
        projectsFooter:
          'Check more at my <strong><a href="https://miquelt9.github.io/portfolio/posts/" class="clickable" target="_blank" rel="noopener noreferrer">portfolio</a></strong>!',
        playNow: 'Try it now!',
        projectSummary: {
          otaniemi: 'A Telegram bot that tracks the buy/sell group (Erasmus+ 2023)',
          plushistics: 'A 2D interactive simulator which uses planning algorithms to optimize routes (RoyalHackaway 2023)',
          falcon: 'A file explorer program with a file editor on it (Course Project 2022)',
          chipchips: 'An algorithm that minimizes the average length of chains that connect pins in a chip (DatathonFME 2022)',
          spaceshooter: 'A 2D single player game based in the arcade Asteroids using Unity (HackUPC 2021)'
        }
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
        cv: 'CV 📄',
        themeLight: 'Dia',
        themeDark: 'Nit',
        themeSystem: 'Auto'
      },
      desktop: {
        about: 'Sobre mi',
        projects: 'Projectes',
        contact: 'Contacte',
        terminal: 'Terminal',
        bingo: 'Bingo Musical'
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
        comingSoon: 'Properament...',
        themeLight: 'Pantalla: Dia',
        themeDark: 'Pantalla: Nit',
        themeSystem: 'Pantalla: Sistema'
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
      },
      content: {
        aboutDesktop:
          '<div class="properties"><img src="images/meOnPC.png"><div class="txt">Sistema: <br>&nbsp; Miquel Torner Viñals <br><br>Registrat a: <br>&nbsp; Facultat d\'Informàtica de Barcelona, Universitat Politècnica de Catalunya <br>&nbsp; Grau en Enginyeria Informàtica (especialitat en computació)<br><br>Hola, sóc en Miquel! M\'encanta la programació, cuinar, fer senderisme i viatjar. <br>Gràcies per visitar la meva web :)</div></div>',
        aboutMobile:
          '<div class="properties" style="padding: 10px; text-align: justify;">Sistema: <br>&nbsp; Miquel Torner Viñals <br>&nbsp;<br>Registrat a: <br>&nbsp; · FIB, Universitat Politècnica de Catalunya <br>&nbsp; · Grau en Enginyeria Informàtica (especialitat en computació)<br><br>&nbsp;<br>Hola, sóc en Miquel! M\'encanta la programació, cuinar, fer senderisme i viatjar. <br>Gràcies per visitar la meva web! <br>&nbsp;<br>(Fes servir un ordinador per a l\'experiència interactiva completa)</div>',
        contactDesktop:
          '<a class="clickable" href="mailto:miqueltorner9@gmail.com"> miqueltorner9@gmail.com </a> <br><a class="clickable" href="https://www.linkedin.com/in/miqueltv/"> LinkedIn </a> <br><a class="clickable" href="https://github.com/miquelt9"> GitHub </a> <br><a class="clickable" href="https://miquelt9.github.io/portfolio" target="_blank" rel="noopener noreferrer"> Portfoli </a> <br><a class="windowslink clickable" onclick="showWindow(\'cvbox\')" style="padding-left: 0%;">Mira el meu CV!</a>',
        contactMobile:
          '<a href="mailto:miqueltorner9@gmail.com"> miqueltorner9@gmail.com </a> <br><a href="https://www.linkedin.com/in/miqueltv/"> LinkedIn </a> <br><a href="https://github.com/miquelt9"> GitHub </a> <br><a class="clickable" href="https://miquelt9.github.io/portfolio" target="_blank" rel="noopener noreferrer"> Portfoli </a> <br><a href="./docs/Miquel_Torner_CV.pdf" target="_blank" rel="noopener noreferrer">Mira el meu CV!</a>',
        projectsFooter:
          'Mira més al meu <strong><a href="https://miquelt9.github.io/portfolio/posts/" class="clickable" target="_blank" rel="noopener noreferrer">portfoli</a></strong>!',
        playNow: 'Prova-ho ara!',
        projectSummary: {
          otaniemi: 'Un bot de Telegram que rastreja el grup de compra/venda (Erasmus+ 2023)',
          plushistics: 'Un simulador interactiu 2D que utilitza algorismes de planificació per optimitzar rutes (RoyalHackaway 2023)',
          falcon: 'Un programa explorador de fitxers amb un editor de fitxers (Projecte de curs 2022)',
          chipchips: 'Un algorisme que minimitza la longitud mitjana de les cadenes que connecten pins en un xip (DatathonFME 2022)',
          spaceshooter: 'Un joc 2D per a un sol jugador basat en l\'arcade Asteroids utilitzant Unity (HackUPC 2021)'
        }
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
