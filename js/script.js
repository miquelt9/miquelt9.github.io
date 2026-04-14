var rickCount = 0;

document.addEventListener("DOMContentLoaded", function onReady() {
  if (window.WindowManager) {
    window.WindowManager.initialize();
  }
  renderSiteContent();
  setInterval(getCurrentTime, 1000);
});

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

function startMenu() {
  var element = document.getElementById('startbutton');
  if (element.style.display == "none"){
    element.style.display = "block";
  } else {
    element.style.display = "none";
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
  if (!window.SITE_DATA) {
    return;
  }

  var aboutDesktop = document.getElementById("about-desktop-content");
  var aboutMobile = document.getElementById("about-mobile-content");
  var projectsDesktop = document.getElementById("projects-desktop-content");
  var projectsMobile = document.getElementById("projects-mobile-content");
  var contactDesktop = document.getElementById("contact-desktop-content");
  var contactMobile = document.getElementById("contact-mobile-content");

  if (aboutDesktop) {
    aboutDesktop.innerHTML = window.SITE_DATA.templates.aboutDesktop;
  }
  if (aboutMobile) {
    aboutMobile.innerHTML = window.SITE_DATA.templates.aboutMobile;
  }
  if (projectsDesktop) {
    projectsDesktop.innerHTML = window.SITE_DATA.templates.projectsDesktop;
  }
  if (projectsMobile) {
    projectsMobile.innerHTML = window.SITE_DATA.templates.projectsMobile;
  }
  if (contactDesktop) {
    contactDesktop.innerHTML = window.SITE_DATA.templates.contactDesktop;
  }
  if (contactMobile) {
    contactMobile.innerHTML = window.SITE_DATA.templates.contactMobile;
  }
}