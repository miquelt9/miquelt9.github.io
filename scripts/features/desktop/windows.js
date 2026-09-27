(function initDesktopWindows(globalScope) {
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

  function closeWindow(windowId) {
    window.ProcessRegistry.killProcessNamed(windowId);
    var iframe = document.getElementById(windowId + "game");
    if (iframe) {
      iframe.remove();
    }
    document.getElementById(windowId + "box").style.display = "none";
    document.getElementById(windowId + "box" + "Taskbar").style.display = "none";
  }

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

  function bringToFront(windowId) {
    window.WindowManager.bringToFront(windowId);
  }

  globalScope.processNameForWindow = processNameForWindow;
  globalScope.isTerminalVisible = isTerminalVisible;
  globalScope.syncTerminalInput = syncTerminalInput;
  globalScope.showWindow = showWindow;
  globalScope.hideWindow = hideWindow;
  globalScope.closeWindow = closeWindow;
  globalScope.openWindow = openWindow;
  globalScope.minimise = minimise;
  globalScope.maximise = maximise;
  globalScope.toggle = toggle;
  globalScope.bringToFront = bringToFront;
})(window);
