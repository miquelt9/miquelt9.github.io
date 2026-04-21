(function initSiteData(globalScope) {
  globalScope.SITE_DATA = {
    terminal: {
      files: {
        email: { type: "link", text: "miqueltorner9@gmail.com\n", href: "mailto:miqueltorner9@gmail.com" },
        cv: { type: "link", text: "Miquel_Torner_CV.pdf\n", href: "./docs/Miquel_Torner_CV.pdf" },
        portfolio: { type: "link", text: "miquelt9.github.io/portfolio/\n", href: "https://miquelt9.github.io/portfolio/" },
        posts: { type: "link", text: "miquelt9.github.io/portfolio/posts\n", href: "https://miquelt9.github.io/portfolio/posts" },
        github: { type: "link", text: "github.com/miquelt9\n", href: "https://github.com/miquelt9" },
        linkedin: { type: "link", text: "linkedin.com/in/miqueltv/\n", href: "https://www.linkedin.com/in/miqueltv/" },
        devpost: { type: "link", text: "devpost.com/miqueltorner9\n", href: "https://www.devpost.com/miqueltorner9" },
      },
      hiddenFiles: [".", "..", "snake.sh", "goose.sh", "virus.sh"],
      links: {
        github: "https://github.com/miquelt9",
        linkedin: "https://www.linkedin.com/in/miqueltv/",
        devpost: "https://devpost.com/miqueltorner9",
        cv: "./docs/Miquel_Torner_CV.pdf",
        portfolio: "https://miquelt9.github.io/portfolio/",
        posts: "https://miquelt9.github.io/portfolio/posts",
      },
      about: {
        intro: "Hi I'm Miquel!",
        bullets: [
          "Informatics Engineering graduate from Barcelona School of Informatics (FIB), UPC",
          "Apart from programming, I love cooking and hiking!",
        ],
        locales: ["English", "Catalan", "Spanish"],
      },
    },
    templates: {
      aboutDesktop:
        '<div class="properties"><img src="images/meOnPC.png"><div class="txt">System: <br>&nbsp; Miquel Torner Viñals <br><br>Registered to: <br>&nbsp; Barcelona School of Informatics, Polythecnic University of Catalonia <br>&nbsp; Bachelor\'s degree in Informatics Engineering (major in computing)<br><br>Hi, I\'m Miquel! I love programming, cooking, hiking and traveling. <br>Thanks for checking out my website :)</div></div>',
      aboutMobile:
        '<div class="properties" style="padding: 10px; text-align: justify;">System: <br>&nbsp; Miquel Torner Viñals <br>&nbsp;<br>Registered to: <br>&nbsp; · FIB, Polythecnic University of Catalonia <br>&nbsp; · Bachelor\'s degree in Informatics Engineering (major in computing)<br><br>&nbsp;<br>Hi, I\'m Miquel! I love programming, cooking, hiking and traveling. <br>Thanks for checking out my website! <br>&nbsp;<br>(Use a desktop/laptop for the full interactive experience)</div>',
      projectsDesktop:
        '• <strong><a href="https://miquelt9.github.io/portfolio/posts/personal/otaniemi-tracker-bot/" class="clickable" style="color: black;">Otaniemi tracker bot</a></strong> &nbsp; <a class="clickable" href="https://github.com/miquelt9/otaniemitrackerbot"><u class="clickable">Github</u></a> &nbsp; <a class="clickable" href="https://t.me/otaniemitrackerbot"><u class="clickable">Telegram</u></a> <br>&nbsp; A Telegram bot that tracks the buy/sell group (Erasmus+ 2023)<br><br>• <strong><a href="https://miquelt9.github.io/portfolio/posts/competitions/royalhackawayv6/" class="clickable" style="color: black;">Plushistics</a></strong> &nbsp; <a class="clickable" href="https://devpost.com/software/plushistics"><u class="clickable">Devpost</u></a><br>&nbsp; A 2D interactive simulator which uses planning algorithms to optimize routes (RoyalHackaway 2023)<br><br>• <strong><a href="https://miquelt9.github.io/portfolio/posts/college/falconexplorer/" class="clickable" style="color: black;">Falcon Explorer</a></strong> &nbsp; <a class="clickable" href="https://github.com/miquelt9/PROP-FIB"><u class="clickable">Github</u></a><br>&nbsp; A file explorer program with a file editor on it (Course Project 2022)<br><br>• <strong><a href="https://miquelt9.github.io/portfolio/posts/competitions/funcions-numerables/" class="clickable" style="color: black;">Chip-Chips</a></strong> &nbsp; <a class="clickable" href="https://devpost.com/software/chip-chips"><u class="clickable">Devpost</u></a><br>&nbsp; An algorithm that minimizes the average length of chains that connect pins in a chip (DatathonFME 2022)<br><br>• <strong><a href="https://miquelt9.github.io/portfolio/posts/competitions/hackupc2021/" class="clickable" style="color: black;">SpaceShooter</a></strong> &nbsp; <a class="clickable" href="https://devpost.com/software/spaceshooter-5hi4of"><u class="clickable">Devpost</u></a> <div class="gamelink clickable" onclick="openWindow(\'spaceshooter\')">Try it now!</div><br>&nbsp; A 2D single player game based in the arcada Asteroids using Unity (HackUPC 2021)<br><br>Check more at my <strong><a href="https://miquelt9.github.io/portfolio/posts/" class="clickable">portfolio</a></strong>!',
      projectsMobile:
        '• <strong><a href="https://miquelt9.github.io/portfolio/posts/personal/otaniemi-tracker-bot/" class="clickable" style="color: black;">Otaniemi tracker bot</a></strong> &nbsp; <a class="clickable" href="https://github.com/miquelt9/otaniemitrackerbot"><u class="clickable">Github</u></a> &nbsp; <a class="clickable" href="https://t.me/otaniemitrackerbot"><u class="clickable">Telegram</u></a> <br>&nbsp; A Telegram bot that tracks the buy/sell group (Erasmus+ 2023)<br><br>• <strong><a href="https://miquelt9.github.io/portfolio/posts/competitions/royalhackawayv6/" class="clickable" style="color: black;">Plushistics</a></strong> &nbsp; <a class="clickable" href="https://devpost.com/software/plushistics"><u class="clickable">Devpost</u></a><br>&nbsp; A 2D interactive simulator which uses planning algorithms to optimize routes (RoyalHackaway 2023)<br><br>• <strong><a href="https://miquelt9.github.io/portfolio/posts/college/falconexplorer/" class="clickable" style="color: black;">Falcon Explorer</a></strong> &nbsp; <a class="clickable" href="https://github.com/miquelt9/PROP-FIB"><u class="clickable">Github</u></a><br>&nbsp; A file explorer program with a file editor on it (Course Project 2022)<br><br>• <strong><a href="https://miquelt9.github.io/portfolio/posts/competitions/funcions-numerables/" class="clickable" style="color: black;">Chip-Chips</a></strong> &nbsp; <a class="clickable" href="https://devpost.com/software/chip-chips"><u class="clickable">Devpost</u></a><br>&nbsp; An algorithm that minimizes the average length of chains that connect pins in a chip (DatathonFME 2022)<br><br>• <strong><a href="https://miquelt9.github.io/portfolio/posts/competitions/hackupc2021/" class="clickable" style="color: black;">SpaceShooter</a></strong> &nbsp; <a class="clickable" href="https://devpost.com/software/spaceshooter-5hi4of"><u class="clickable">Devpost</u></a> <div class="gamelink clickable" onclick="openWindow(\'spaceshooter\')">Try it now!</div><br>&nbsp; A 2D single player game based in the arcada Asteroids using Unity (HackUPC 2021)<br><br>Check more at my <strong><a href="https://miquelt9.github.io/portfolio/posts/" class="clickable">portfolio</a></strong>!',
      contactDesktop:
        '<a class="clickable" href="mailto:miqueltorner9@gmail.com"> miqueltorner9@gmail.com </a> <br><a class="clickable" href="https://www.linkedin.com/in/miqueltv/"> LinkedIn </a> <br><a class="clickable" href="https://github.com/miquelt9"> GitHub </a> <br><a class="clickable" href="https://miquelt9.github.io/portfolio"> Portfolio </a> <br><a class="windowslink clickable" onclick="showWindow(\'cvbox\')" style="padding-left: 0%;">Check my CV!</a>',
      contactMobile:
        '<a href="mailto:miqueltorner9@gmail.com"> miqueltorner9@gmail.com </a> <br><a href="https://www.linkedin.com/in/miqueltv/"> LinkedIn </a> <br><a href="https://github.com/miquelt9"> GitHub </a> <br><a class="clickable" href="https://miquelt9.github.io/portfolio"> Portfolio </a> <br><a href="./docs/Miquel_Torner_CV.pdf" target="_blank">Check my CV!</a>',
    },
  };
})(window);
