var rickCount = 0;
var startMenuAutoCloseRegistered = false;

async function nevergonna() {
  rickCount += 1;
  if (rickCount >= 3) {
    window.ProcessRegistry.populateProcess("rick_astley");
    var audio = new Audio('/sounds/nevergonna.mp3');
    audio.play();
    await window.AppUtils.delay(1000);
    document.getElementById("rick").style.display = "block";
    await window.AppUtils.delay(15500);
    document.getElementById("rick").style.display = "none";
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

function showWindow(windowId) {
  var psWindow = windowId;
  if (windowId === "terminalbox") {
    psWindow = "bash";
    define_bash_as_opened();
  }
  window.ProcessRegistry.killProcessNamed(psWindow);
  window.ProcessRegistry.populateProcess(psWindow);
  window.WindowManager.bringToFront(windowId);
  document.getElementById(windowId).style.display = "block";
  document.getElementById(windowId + "Taskbar").style.display = "block";
}

function hideWindow(windowId) {
  window.ProcessRegistry.killProcessNamed(windowId);
  if (windowId === "terminalbox") { define_bash_as_closed(); }
  document.getElementById(windowId).style.display = "none";
  document.getElementById(windowId + "Taskbar").style.display = "none";
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

  [acceptButton, rejectButton].forEach(function (btn) {
    if (!btn) {
      return;
    }
    btn.addEventListener("click", dismissCookiesBanner);
  });
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

  renderSiteContent();
}

window.addEventListener('localeChanged', updateI18nUI);

document.addEventListener("DOMContentLoaded", function onReady() {
  if (window.WindowManager) {
    window.WindowManager.initialize();
  }
  setupCookiesBanner();
  registerStartMenuAutoClose();
  updateI18nUI();
  setInterval(getCurrentTime, 1000);
});
