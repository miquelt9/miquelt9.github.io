var rickCount = 0;
var startMenuAutoCloseRegistered = false;
var cookieGame = { running: false, started: false, score: 0, streak: 0, endsAt: 0, timer: null, spawnTimer: null, frame: null, cookies: [] };

async function nevergonna() {
  rickCount += 1;
  if (rickCount >= 3) {
    window.ProcessRegistry.populateProcess("rick_astley");
    var audio = new Audio('sounds/nevergonna.mp3');
    audio.play();
    await window.AppUtils.delay(1000);
    var rick = document.getElementById("rick");
    if (!rick) {
      rick = document.createElement("img");
      rick.id = "rick";
      rick.className = "rick";
      rick.src = "images/nevergonna.gif";
      rick.alt = "";
      var desktop = document.querySelector(".desktop_device");
      (desktop || document.body).appendChild(rick);
    }
    rick.style.display = "block";
    await window.AppUtils.delay(15500);
    rick.style.display = "none";
    window.ProcessRegistry.killProcessNamed("rick_astley");
  }
}

function getRandomColor() {
  const h = window.AppUtils.getRandomInt(0, 360);
  const s = window.AppUtils.getRandomInt(50, 95);
  const l = window.AppUtils.getRandomInt(60, 90);

  return `hsl(${h},${s}%,${l}%)`; // Construct the HSL color string
}

function changeBackgroundColor() {
  document.getElementById("the_background").style.backgroundColor = getRandomColor();
}

function processNameForWindow(windowId) {
  if (windowId === "terminalbox") {
    return "bash";
  }
  return windowId;
}

function isTerminalVisible() {
  var element = document.getElementById("terminalbox");
  if (!element) {
    return false;
  }
  return window.getComputedStyle(element).display !== "none";
}

function syncTerminalInput() {
  if (typeof define_bash_as_opened !== "function" || typeof define_bash_as_closed !== "function") {
    return;
  }
  if (isTerminalVisible()) {
    define_bash_as_opened();
  } else {
    define_bash_as_closed();
  }
}

function showWindow(windowId) {
  var psWindow = processNameForWindow(windowId);
  window.ProcessRegistry.killProcessNamed(psWindow);
  window.ProcessRegistry.populateProcess(psWindow);
  window.WindowManager.bringToFront(windowId);
  document.getElementById(windowId).style.display = "block";
  document.getElementById(windowId + "Taskbar").style.display = "block";
  if (windowId === "cvbox") {
    var iframe = document.getElementById("iframepdf");
    if (iframe && !iframe.getAttribute("src")) {
      iframe.src = "./docs/Miquel_Torner_CV.pdf";
    }
  }
  if (windowId === "terminalbox") {
    syncTerminalInput();
  }
}

function hideWindow(windowId) {
  window.ProcessRegistry.killProcessNamed(processNameForWindow(windowId));
  document.getElementById(windowId).style.display = "none";
  document.getElementById(windowId + "Taskbar").style.display = "none";
  if (windowId === "terminalbox") {
    syncTerminalInput();
  }
}

function isPhoneViewport() {
  return window.matchMedia && window.matchMedia("(max-width: 768px)").matches;
}

function openPhoneApp(appId) {
  if (!isPhoneViewport()) return;
  var map = { about: "aboutbox-mobile", projects: "projectsbox-mobile", contact: "contactmebox-mobile" };
  var app = document.getElementById(map[appId]);
  if (!app) return;
  document.querySelectorAll(".phone-window").forEach(function (element) {
    element.style.display = "none";
  });
  app.style.display = "block";
  document.getElementById("phone-os").classList.add("phone-app-open");
}

function closePhoneApp() {
  var shell = document.getElementById("phone-os");
  if (!shell) return;
  shell.classList.remove("phone-app-open");
  shell.querySelectorAll(".phone-window").forEach(function (element) {
    element.style.display = "none";
  });
}

// Just used for games box
function closeWindow(windowId) {
  window.ProcessRegistry.killProcessNamed(windowId);
  var iframe = document.getElementById(windowId + "game");
  if (iframe) {
    iframe.remove();
  }
  document.getElementById(windowId + "box").style.display = "none";
  document.getElementById(windowId + "box" + "Taskbar").style.display = "none";
}

// Just used for games box
function openWindow(windowId) {
  window.ProcessRegistry.killProcessNamed(windowId);
  window.ProcessRegistry.populateProcess(windowId);
  window.WindowManager.bringToFront(windowId + "box");
  document.getElementById(windowId + "box").style.display = "block";
  document.getElementById(windowId + "box" + "Taskbar").style.display = "block";

  if (windowId === "spaceshooter") {
    document.getElementById(windowId).innerHTML = "";
    var ifrm = document.createElement("iframe");
    document.getElementById(windowId).appendChild(ifrm);

    ifrm.id = windowId + "game";
    ifrm.mozallowfullscreen = "true";
    ifrm.allow = "autoplay; fullscreen";
    ifrm.style = "border:0px #000000 none;";
    ifrm.msallowfullscreen = "true";
    ifrm.allowfullscreen = "true";
    ifrm.webkitallowfullscreen = "true";
    ifrm.allowtransparency = "true";
    ifrm.frameborder = "0";
    ifrm.marginheight="px";
    ifrm.marginwidth="320px";
    ifrm.height="780px";
    ifrm.width="1280px"
    ifrm.src = "/apps/spaceshooter/index.html";
  }

  if (windowId === "snake") {
    document.getElementById(windowId).innerHTML = "";
    var snakeFrame = document.createElement("iframe");
    document.getElementById(windowId).appendChild(snakeFrame);
    snakeFrame.id = windowId + "game";
    snakeFrame.allow = "autoplay; fullscreen";
    snakeFrame.style = "border:0px #000000 none;";
    snakeFrame.allowfullscreen = "true";
    snakeFrame.frameborder = "0";
    snakeFrame.height = "640px";
    snakeFrame.width = "840px";
    snakeFrame.src = "/apps/snake/index.html";
  }
}

function minimise(windowId) {
  document.getElementById(windowId).style.display = "none";
  if (windowId === "terminalbox") {
    syncTerminalInput();
  }
}

// idk, but not really working + not worth since all the content 
// is already displayed when showing any window 
function maximise(windowId) {
  document.getElementById(windowId).style.width = "97vw";
  document.getElementById(windowId).style.height = "97vh";
}

function toggle(windowId) {
  var current = document.getElementById(windowId).style.display;
  if (current == "none") {
    window.WindowManager.bringToFront(windowId);
    document.getElementById(windowId).style.display = "block"; 
  }
  else {
    document.getElementById(windowId).style.display = "none";  
  }
  if (windowId === "terminalbox") {
    syncTerminalInput();
  }
}

function getStartMenuElement() {
  return document.getElementById("startbutton");
}

function isStartMenuOpen() {
  var element = getStartMenuElement();
  if (!element) {
    return false;
  }
  return window.getComputedStyle(element).display !== "none";
}

function closeStartMenu() {
  var element = getStartMenuElement();
  if (!element) {
    return;
  }
  element.style.display = "none";
}

function openStartMenu() {
  var element = getStartMenuElement();
  if (!element) {
    return;
  }
  element.style.display = "block";
}

function registerStartMenuAutoClose() {
  if (startMenuAutoCloseRegistered) {
    return;
  }

  document.addEventListener("click", function onDocumentClick(event) {
    if (!isStartMenuOpen()) {
      return;
    }

    var target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    if (target.closest("#startbutton") || target.closest("#startmenu-btn")) {
      return;
    }

    closeStartMenu();
  });

  startMenuAutoCloseRegistered = true;
}

function dismissCookiesBanner() {
  var banner = document.getElementById("cookies-banner");
  if (banner) {
    banner.style.display = "none";
  }
}

function setupCookiesBanner() {
  var banner = document.getElementById("cookies-banner");
  if (!banner) {
    return;
  }

  var acceptButton = document.getElementById("cookies-banner-accept");
  var rejectButton = document.getElementById("cookies-banner-reject");

  if (rejectButton) rejectButton.addEventListener("click", dismissCookiesBanner);
  if (acceptButton) acceptButton.addEventListener("click", function () {
    dismissCookiesBanner();
    startCookieGame();
  });
  var replayButton = document.getElementById("cookie-game-replay");
  if (replayButton) replayButton.addEventListener("click", startCookieGame);
}

function cookieGameElements() {
  return {
    root: document.getElementById("cookie-game"),
    score: document.getElementById("cookie-game-score"),
    time: document.getElementById("cookie-game-time"),
    streak: document.getElementById("cookie-game-streak"),
    status: document.getElementById("cookie-game-status"),
    result: document.getElementById("cookie-game-result"),
    finalScore: document.getElementById("cookie-game-final-score"),
    replay: document.getElementById("cookie-game-replay")
  };
}

function clearCookieGameCookies() {
  cookieGame.cookies.forEach(function (cookie) { cookie.remove(); });
  cookieGame.cookies = [];
}

function finishCookieGame() {
  if (!cookieGame.running) return;
  cookieGame.running = false;
  clearInterval(cookieGame.timer);
  clearInterval(cookieGame.spawnTimer);
  cancelAnimationFrame(cookieGame.frame);
  clearCookieGameCookies();
  var el = cookieGameElements();
  el.finalScore.textContent = cookieGame.score;
  el.result.hidden = false;
  el.status.textContent = "Time is up. Final score: " + cookieGame.score + ".";
}

function updateCookieGameHud() {
  var el = cookieGameElements();
  var remaining = cookieGame.started ? Math.max(0, Math.ceil((cookieGame.endsAt - Date.now()) / 1000)) : 60;
  el.score.textContent = cookieGame.score;
  el.time.textContent = Math.floor(remaining / 60) + ":" + String(remaining % 60).padStart(2, "0");
  el.streak.textContent = cookieGame.streak > 1 ? cookieGame.streak + " streak" : "";
  if (cookieGame.started && remaining === 0) finishCookieGame();
}

function spawnCookie() {
  if (!cookieGame.running) return;
  var el = cookieGameElements(), cookie = document.createElement("button");
  cookie.type = "button";
  cookie.className = "cookie-game__cookie clickable";
  cookie.setAttribute("aria-label", "Catch cookie");
  cookie.innerHTML = '<img src="images/cookie.png" alt="">';
  cookie.style.left = (4 + Math.random() * 92) + "vw";
  cookie.style.setProperty("--cookie-duration", (4 + Math.random() * 2.5) + "s");
  cookie.style.setProperty("--cookie-size", (38 + Math.random() * 16) + "px");
  cookie.addEventListener("click", function () {
    if (!cookieGame.running) return;
    cookieGame.score += 1;
    cookieGame.streak += 1;
    var feedback = document.createElement("span");
    feedback.className = "cookie-game__feedback";
    feedback.textContent = "+1";
    cookie.appendChild(feedback);
    el.status.textContent = "Cookie caught. Score " + cookieGame.score + ".";
    setTimeout(function () { feedback.remove(); cookie.remove(); }, 500);
    cookieGame.cookies = cookieGame.cookies.filter(function (item) { return item !== cookie; });
    updateCookieGameHud();
  });
  cookie.addEventListener("animationend", function () {
    cookieGame.streak = 0;
    cookie.remove();
    cookieGame.cookies = cookieGame.cookies.filter(function (item) { return item !== cookie; });
  });
  el.root.appendChild(cookie);
  cookieGame.cookies.push(cookie);
}

function startCookieGame() {
  var el = cookieGameElements();
  if (!el.root) return;
  clearInterval(cookieGame.timer);
  clearInterval(cookieGame.spawnTimer);
  cancelAnimationFrame(cookieGame.frame);
  clearCookieGameCookies();
  cookieGame = { running: true, started: false, score: 0, streak: 0, endsAt: 0, timer: null, spawnTimer: null, frame: null, cookies: [] };
  el.root.hidden = false;
  el.root.setAttribute("aria-hidden", "false");
  el.result.hidden = true;
  el.status.textContent = "Catch the cookie to start the one minute timer.";
  spawnCookie();
  var firstCookie = cookieGame.cookies[0];
  firstCookie.addEventListener("click", function beginTimer() {
    if (cookieGame.started) return;
    cookieGame.started = true;
    cookieGame.endsAt = Date.now() + 60000;
    cookieGame.timer = setInterval(updateCookieGameHud, 250);
    cookieGame.spawnTimer = setInterval(spawnCookie, 850);
    updateCookieGameHud();
  }, { once: true });
  updateCookieGameHud();
}

function startMenu() {
  if (isStartMenuOpen()) {
    closeStartMenu();
  } else {
    openStartMenu();
  }
}

function getCurrentTime() {
  var now = new Date();
  var time = now.getHours() + ":" + now.getMinutes().toString().padStart(2, 0);
  document.getElementById('clock').innerHTML = time;
  var phoneClock = document.getElementById('phone-clock');
  if (phoneClock) phoneClock.textContent = time;
}

function bringToFront(windowId) {
  window.WindowManager.bringToFront(windowId);
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
    
    // Preserve images if any (like in the Start button)
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

window.addEventListener('localeChanged', updateI18nUI);
window.addEventListener('themeChanged', syncThemeUI);

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
