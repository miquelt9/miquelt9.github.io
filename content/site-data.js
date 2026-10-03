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
        locales: ["English", "Catalan"],
      },
    },
    projects: [
      {
        id: "otaniemi",
        title: "Otaniemi tracker bot",
        href: "https://miquelt9.github.io/portfolio/posts/personal/otaniemi-tracker-bot/",
        links: [
          { label: "Github", href: "https://github.com/miquelt9/otaniemitrackerbot" },
          { label: "Telegram", href: "https://t.me/otaniemitrackerbot" },
        ],
      },
      {
        id: "plushistics",
        title: "Plushistics",
        href: "https://miquelt9.github.io/portfolio/posts/competitions/royalhackawayv6/",
        links: [
          { label: "Devpost", href: "https://devpost.com/software/plushistics" },
        ],
      },
      {
        id: "falcon",
        title: "Falcon Explorer",
        href: "https://miquelt9.github.io/portfolio/posts/college/falconexplorer/",
        links: [
          { label: "Github", href: "https://github.com/miquelt9/PROP-FIB" },
        ],
      },
      {
        id: "chipchips",
        title: "Chip-Chips",
        href: "https://miquelt9.github.io/portfolio/posts/competitions/funcions-numerables/",
        links: [
          { label: "Devpost", href: "https://devpost.com/software/chip-chips" },
        ],
      },
      {
        id: "spaceshooter",
        title: "SpaceShooter",
        href: "https://miquelt9.github.io/portfolio/posts/competitions/hackupc2021/",
        links: [
          { label: "Devpost", href: "https://devpost.com/software/spaceshooter-5hi4of" },
        ],
        play: {
          desktopOnclick: "openWindow('spaceshooter')",
          mobileHref: "/apps/spaceshooter/index.html",
        },
      },
      {
        id: "bingo",
        title: "Bingo Musical",
        href: "https://miquelt9.github.io/bingo-musical/",
        links: [],
      },
    ],
  };
})(window);

