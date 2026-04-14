(function initTerminalContent(globalScope) {
  function createLinkElement(fileData) {
    var link = document.createElement("a");
    link.innerText = fileData.text;
    link.href = fileData.href;
    link.target = "_blank";
    link.tabIndex = -1;
    return link;
  }

  function createAboutElement(aboutData) {
    var about = document.createElement("div");

    var intro = document.createElement("p");
    intro.innerText = aboutData.intro;
    about.appendChild(intro);

    var image = document.createElement("img");
    image.src = "images/photoOfMe.png";
    image.style.width = "100px";
    about.appendChild(image);

    var bulletsLabel = document.createElement("p");
    bulletsLabel.innerText = "Things to know about me:";
    about.appendChild(bulletsLabel);

    var bulletsList = document.createElement("ul");
    for (var i = 0; i < aboutData.bullets.length; i++) {
      var bullet = document.createElement("li");
      bullet.innerText = aboutData.bullets[i];
      bulletsList.appendChild(bullet);
    }
    about.appendChild(bulletsList);

    var localesLabel = document.createElement("p");
    localesLabel.innerText = "Supported locales:";
    about.appendChild(localesLabel);

    var localesList = document.createElement("ul");
    for (var j = 0; j < aboutData.locales.length; j++) {
      var locale = document.createElement("li");
      locale.innerText = aboutData.locales[j];
      localesList.appendChild(locale);
    }
    about.appendChild(localesList);

    return about;
  }

  function buildTerminalContent() {
    var files = {};
    var hiddenFiles = {};
    var siteTerminalData = globalScope.SITE_DATA.terminal;
    var fileNames = Object.keys(siteTerminalData.files);

    for (var i = 0; i < fileNames.length; i++) {
      var fileName = fileNames[i];
      files[fileName] = createLinkElement(siteTerminalData.files[fileName]);
    }
    files.about = createAboutElement(siteTerminalData.about);

    for (var j = 0; j < siteTerminalData.hiddenFiles.length; j++) {
      hiddenFiles[siteTerminalData.hiddenFiles[j]] = document.createElement("a");
    }

    return {
      files: files,
      hiddenFiles: hiddenFiles,
      links: siteTerminalData.links,
    };
  }

  globalScope.TerminalContentData = {
    buildTerminalContent: buildTerminalContent,
  };
})(window);
